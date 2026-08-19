type CsvRow = Record<string, string>;

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export type AtlasTeam = {
  abbreviation: string;
  name: string;
  color: string;
  logo?: string;
};

export type AtlasPlayerResult = {
  id: string;
  name: string;
  position: string;
  number: string;
  headshot: string;
  rosterStatus: "current" | "past";
  lastSeason: number | null;
  team: AtlasTeam;
};

const cache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();
const NFLVERSE_RELEASES = "https://github.com/nflverse/nflverse-data/releases/download";
const currentSeason = Math.max(2025, new Date().getUTCFullYear());
const USER_AGENT = "NFL-Fan-Hub-Japan-Atlas/1.0";

const CACHE_TTL = {
  roster: 20 * 60 * 1000,
  players: 12 * 60 * 60 * 1000,
  teams: 6 * 60 * 60 * 1000,
} as const;

const teamAliases: Record<string, string> = {
  ARZ: "ARI",
  AZ: "ARI",
  BLT: "BAL",
  JAC: "JAX",
  LA: "LAR",
  OAK: "LV",
  SD: "LAC",
  STL: "LAR",
  WFT: "WAS",
  WSH: "WAS",
};

const fallbackTeamNames: Record<string, string> = {
  ARI: "Arizona Cardinals", ATL: "Atlanta Falcons", BAL: "Baltimore Ravens", BUF: "Buffalo Bills",
  CAR: "Carolina Panthers", CHI: "Chicago Bears", CIN: "Cincinnati Bengals", CLE: "Cleveland Browns",
  DAL: "Dallas Cowboys", DEN: "Denver Broncos", DET: "Detroit Lions", GB: "Green Bay Packers",
  HOU: "Houston Texans", IND: "Indianapolis Colts", JAX: "Jacksonville Jaguars", KC: "Kansas City Chiefs",
  LAC: "Los Angeles Chargers", LAR: "Los Angeles Rams", LV: "Las Vegas Raiders", MIA: "Miami Dolphins",
  MIN: "Minnesota Vikings", NE: "New England Patriots", NO: "New Orleans Saints", NYG: "New York Giants",
  NYJ: "New York Jets", PHI: "Philadelphia Eagles", PIT: "Pittsburgh Steelers", SEA: "Seattle Seahawks",
  SF: "San Francisco 49ers", TB: "Tampa Bay Buccaneers", TEN: "Tennessee Titans", WAS: "Washington Commanders",
};

async function cached<T>(key: string, ttl: number, load: () => Promise<T>): Promise<T> {
  const existing = cache.get(key) as CacheEntry<T> | undefined;
  if (existing && existing.expiresAt > Date.now()) return existing.value;

  const pending = inFlight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const request = load().then((value) => {
    cache.set(key, { value, expiresAt: Date.now() + ttl });
    return value;
  }).finally(() => inFlight.delete(key));
  inFlight.set(key, request);
  return request;
}

/** Parses quoted CSV fields without a runtime CSV dependency. */
export function parseAtlasCsv(input: string): CsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  const finishField = () => {
    row.push(field);
    field = "";
  };
  const finishRow = () => {
    finishField();
    if (row.some((value) => value.length > 0)) rows.push(row);
    row = [];
  };

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const next = input[index + 1];
    if (character === '"') {
      if (quoted && next === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      finishField();
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      finishRow();
    } else {
      field += character;
    }
  }
  if (field.length || row.length) finishRow();

  const [header, ...records] = rows;
  if (!header) return [];
  const headers = header.map((value) => value.replace(/^\uFEFF/, "").trim());
  return records.map((record) => Object.fromEntries(headers.map((key, index) => [key, (record[index] ?? "").trim()])));
}

export function normalizeAtlasText(value: string | undefined): string {
  return (value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function atlasPositionGroup(position: string): string {
  if (position === "QB") return "QB";
  if (["RB", "FB"].includes(position)) return "RB";
  if (position === "WR" || position === "TE") return position;
  if (["OT", "OG", "G", "C", "OL", "T"].includes(position)) return "OL";
  if (["DE", "DT", "NT", "DL", "EDGE"].includes(position)) return "DL";
  if (["ILB", "MLB", "OLB", "LB"].includes(position)) return "LB";
  if (["CB", "DB", "FS", "SS", "S", "SAF"].includes(position)) return "DB";
  return position;
}

function number(value?: string): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function playerName(row: CsvRow): string {
  return row.display_name || row.full_name || [row.first_name, row.last_name].filter(Boolean).join(" ") || "Unknown player";
}

async function fetchCsv(url: string): Promise<CsvRow[]> {
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`ATLAS data source returned ${response.status}`);
  return parseAtlasCsv(await response.text());
}

async function masterPlayers(): Promise<CsvRow[]> {
  return cached("atlas:players", CACHE_TTL.players, () => fetchCsv(`${NFLVERSE_RELEASES}/players/players.csv`));
}

async function rosterForSeason(season: number): Promise<CsvRow[]> {
  return cached(`atlas:roster:${season}`, CACHE_TTL.roster, () => fetchCsv(`${NFLVERSE_RELEASES}/rosters/roster_${season}.csv`));
}

async function currentRoster(): Promise<CsvRow[]> {
  return cached("atlas:current-roster", CACHE_TTL.roster, async () => {
    try {
      return await rosterForSeason(currentSeason);
    } catch {
      return rosterForSeason(currentSeason - 1);
    }
  });
}

async function teamDirectory(): Promise<Map<string, AtlasTeam>> {
  return cached("atlas:teams", CACHE_TTL.teams, async () => {
    try {
      const response = await fetch("https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams", { headers: { "User-Agent": USER_AGENT } });
      if (!response.ok) throw new Error(`ESPN teams returned ${response.status}`);
      const payload = (await response.json()) as { sports?: Array<{ leagues?: Array<{ teams?: Array<{ team?: Record<string, unknown> }> }> }> };
      const entries = payload.sports?.[0]?.leagues?.[0]?.teams ?? [];
      const directory = new Map<string, AtlasTeam>();
      entries.forEach(({ team }) => {
        const abbreviation = String(team?.abbreviation ?? "");
        if (!abbreviation) return;
        const logos = Array.isArray(team?.logos) ? team.logos as Array<{ href?: string; rel?: string[] }> : [];
        directory.set(abbreviation, {
          abbreviation,
          name: String(team?.displayName ?? fallbackTeamNames[abbreviation] ?? abbreviation),
          color: `#${String(team?.color ?? "142033")}`,
          logo: logos.find((logo) => logo.rel?.includes("default"))?.href,
        });
      });
      return directory;
    } catch {
      return new Map(Object.entries(fallbackTeamNames).map(([abbreviation, name]) => [abbreviation, { abbreviation, name, color: "#142033" }]));
    }
  });
}

function teamFor(code: string | undefined, directory: Map<string, AtlasTeam>): AtlasTeam {
  const normalizedCode = teamAliases[code ?? ""] ?? code ?? "FA";
  return directory.get(normalizedCode) ?? {
    abbreviation: normalizedCode,
    name: normalizedCode === "FA" ? "Free Agent" : (fallbackTeamNames[normalizedCode] ?? normalizedCode),
    color: "#142033",
  };
}

function latestRosterByPlayer(rows: CsvRow[]): Map<string, CsvRow> {
  const latest = new Map<string, CsvRow>();
  rows.forEach((row) => {
    if (!row.gsis_id) return;
    const previous = latest.get(row.gsis_id);
    if (!previous || number(row.week) >= number(previous.week)) latest.set(row.gsis_id, row);
  });
  return latest;
}

function searchResult(master: CsvRow, roster: CsvRow | undefined, directory: Map<string, AtlasTeam>): AtlasPlayerResult {
  const isCurrent = Boolean(roster);
  return {
    id: master.gsis_id || roster?.gsis_id || "",
    name: playerName(master),
    position: roster?.position || master.position || "—",
    number: roster?.jersey_number || master.jersey_number || "—",
    headshot: roster?.headshot_url || master.headshot || "",
    rosterStatus: isCurrent ? "current" : "past",
    lastSeason: isCurrent ? currentSeason : (number(master.last_season) || null),
    team: teamFor(roster?.team || master.latest_team, directory),
  };
}

async function searchUniverse() {
  return cached("atlas:search-universe", CACHE_TTL.roster, async () => {
    const [masters, rosterRows, directory] = await Promise.all([masterPlayers(), currentRoster(), teamDirectory()]);
    const current = latestRosterByPlayer(rosterRows);
    const masterById = new Map(masters.filter((row) => row.gsis_id).map((row) => [row.gsis_id, row]));
    const active = Array.from(current.values())
      .map((roster) => searchResult(masterById.get(roster.gsis_id) ?? roster, roster, directory))
      .filter((player) => player.id && player.name !== "Unknown player")
      .sort((left, right) => left.name.localeCompare(right.name));
    return { active, current, masterById, directory };
  });
}

export async function atlasFilters(team?: string) {
  const { active, directory } = await searchUniverse();
  const teams = Array.from(new Set(active.map((player) => player.team.abbreviation))).map((code) => teamFor(code, directory)).sort((left, right) => left.name.localeCompare(right.name));
  const positions = Array.from(new Set(active.filter((player) => !team || player.team.abbreviation === team).map((player) => atlasPositionGroup(player.position)))).sort();
  return { teams, positions, season: currentSeason };
}

export async function atlasSearch(query: string) {
  const term = normalizeAtlasText(query);
  if (term.length < 2) return { players: [] as AtlasPlayerResult[], updatedAt: new Date().toISOString() };
  const { active, current, masterById, directory } = await searchUniverse();
  const currentMatches = active.filter((player) => normalizeAtlasText(player.name).includes(term));
  const historicMatches = Array.from(masterById.values())
    .filter((player) => !current.has(player.gsis_id) && Boolean(player.last_season))
    .filter((player) => normalizeAtlasText(playerName(player)).includes(term))
    .map((player) => searchResult(player, undefined, directory));
  const players = [...currentMatches, ...historicMatches].sort((left, right) => {
    const statusOrder = left.rosterStatus === right.rosterStatus ? 0 : left.rosterStatus === "current" ? -1 : 1;
    const startingOrder = Number(!normalizeAtlasText(left.name).startsWith(term)) - Number(!normalizeAtlasText(right.name).startsWith(term));
    return statusOrder || startingOrder || left.name.localeCompare(right.name);
  }).slice(0, 16);
  return { players, updatedAt: new Date().toISOString() };
}

export async function atlasBrowse(input: { team: string; position?: string; jersey?: string }) {
  const { active } = await searchUniverse();
  const jersey = input.jersey?.trim();
  const players = active.filter((player) => player.team.abbreviation === input.team)
    .filter((player) => !input.position || atlasPositionGroup(player.position) === input.position)
    .filter((player) => !jersey || String(player.number) === jersey)
    .slice(0, 80);
  return { players, updatedAt: new Date().toISOString() };
}

function ageFrom(birthDate?: string): number | null {
  if (!birthDate) return null;
  const birthday = new Date(birthDate);
  if (Number.isNaN(birthday.getTime())) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - birthday.getUTCFullYear();
  if (Date.UTC(now.getUTCFullYear(), birthday.getUTCMonth(), birthday.getUTCDate()) > Date.now()) age -= 1;
  return age;
}

function formattedBirthDate(value?: string): string | null {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[1]}年${Number(match[2])}月${Number(match[3])}日` : null;
}

function formattedHeight(value?: string): string {
  const inches = number(value);
  return inches ? `${Math.floor(inches / 12)}′ ${inches % 12}″` : "—";
}

function draftLabel(player: CsvRow): string {
  const year = player.draft_year || player.entry_year;
  if (!year) return "UDFA / ドラフト外";
  if (!player.draft_round || !player.draft_pick) return `${year}年 ドラフト外（UDFA）`;
  const team = player.draft_team || player.draft_club;
  return `${year}年 · Round ${player.draft_round} · Pick ${player.draft_pick}${team ? ` · ${team}` : ""}`;
}

export async function atlasProfile(playerId: string) {
  const { current, masterById, directory } = await searchUniverse();
  const roster = current.get(playerId);
  const master = masterById.get(playerId) ?? roster;
  if (!master) throw new Error("Player not found in ATLAS data");
  const isCurrent = Boolean(roster);
  const birthDate = roster?.birth_date || master.birth_date;
  const weight = roster?.weight || master.weight;
  return {
    profile: {
      id: playerId,
      name: playerName(master),
      position: roster?.position || master.position || "—",
      number: roster?.jersey_number || master.jersey_number || "—",
      age: ageFrom(birthDate),
      birthDate: formattedBirthDate(birthDate),
      displayHeight: formattedHeight(roster?.height || master.height),
      displayWeight: weight ? `${weight} lbs` : "—",
      college: roster?.college || master.college_name || "—",
      draft: draftLabel({ ...master, ...roster }),
      headshot: roster?.headshot_url || master.headshot || "",
      team: teamFor(roster?.team || master.latest_team, directory),
      rosterStatus: isCurrent ? "current" as const : "past" as const,
      lastSeason: isCurrent ? currentSeason : (number(master.last_season) || null),
    },
    source: { provider: "NFLverse", season: currentSeason, updatedAt: new Date().toISOString() },
  };
}

type AtlasPlayerContext = {
  roster?: CsvRow;
  master: CsvRow;
  directory: Map<string, AtlasTeam>;
};

async function atlasPlayerContext(playerId: string): Promise<AtlasPlayerContext> {
  const { current, masterById, directory } = await searchUniverse();
  const roster = current.get(playerId);
  const master = masterById.get(playerId) ?? roster;
  if (!master) throw new Error("Player not found in ATLAS data");
  return { roster, master, directory };
}

function rookieSeason(master: CsvRow, fallback = currentSeason): number {
  return Math.max(1999, number(master.rookie_season || master.entry_year || master.draft_year) || fallback);
}

async function mapInBatches<T, Result>(items: T[], size: number, mapper: (item: T) => Promise<Result>): Promise<Result[]> {
  const values: Result[] = [];
  for (let offset = 0; offset < items.length; offset += size) {
    values.push(...await Promise.all(items.slice(offset, offset + size).map(mapper)));
  }
  return values;
}

/** Builds team spans from annual NFLverse roster rows without blocking the base profile. */
export async function atlasCareer(playerId: string) {
  const { roster, master, directory } = await atlasPlayerContext(playerId);
  const start = rookieSeason(master);
  const end = roster ? currentSeason : Math.max(start, number(master.last_season) || currentSeason - 1);
  const seasons = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  const rows = await mapInBatches(seasons, 4, async (season) => {
    try {
      const rosterRows = await rosterForSeason(season);
      const matches = rosterRows.filter((row) => row.gsis_id === playerId);
      const latest = matches.sort((left, right) => number(right.week) - number(left.week))[0];
      return latest?.team ? { season, team: teamAliases[latest.team] ?? latest.team } : null;
    } catch {
      return null;
    }
  });
  const timeline = rows.filter((row): row is { season: number; team: string } => Boolean(row));
  const spans: Array<{ startSeason: number; endSeason: number; team: AtlasTeam }> = [];
  timeline.forEach((entry) => {
    const previous = spans.at(-1);
    if (previous && previous.team.abbreviation === entry.team && previous.endSeason === entry.season - 1) {
      previous.endSeason = entry.season;
      return;
    }
    spans.push({ startSeason: entry.season, endSeason: entry.season, team: teamFor(entry.team, directory) });
  });
  return {
    spans,
    source: { provider: "NFLverse roster data", updatedAt: new Date().toISOString(), coverage: { startSeason: start, endSeason: end } },
  };
}

function awardText(item: unknown): string | null {
  if (typeof item === "string") return item.trim() || null;
  if (!item || typeof item !== "object") return null;
  const record = item as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name : typeof record.description === "string" ? record.description : "";
  const season = typeof record.season === "number" ? String(record.season) : typeof record.year === "number" ? String(record.year) : "";
  return name ? `${season ? `${season} · ` : ""}${name}` : null;
}

async function espnAwards(espnId?: string): Promise<string[]> {
  if (!espnId) return [];
  try {
    const headers = { "User-Agent": USER_AGENT };
    const [profileResponse, collectionResponse] = await Promise.all([
      fetch(`https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/${espnId}`, { headers }),
      fetch(`https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/athletes/${espnId}/awards?lang=en&region=us`, { headers }),
    ]);
    const profile = profileResponse.ok ? await profileResponse.json() as { athlete?: Record<string, unknown>; awards?: unknown[] } : {};
    const athlete = profile.athlete ?? profile;
    const inlineAwards = Array.isArray(athlete.awards) ? athlete.awards : Array.isArray(profile.awards) ? profile.awards : [];
    const collection = collectionResponse.ok ? await collectionResponse.json() as { items?: Array<{ $ref?: string }> } : {};
    const references = (collection.items ?? []).map((item) => item.$ref).filter((reference): reference is string => Boolean(reference)).slice(0, 24);
    const detailedAwards = await Promise.all(references.map(async (reference) => {
      try {
        const response = await fetch(reference.replace("http://", "https://"), { headers });
        if (!response.ok) return null;
        const award = await response.json() as { name?: string; description?: string };
        const season = reference.match(/\/seasons\/(\d{4})\//)?.[1];
        return award.name || award.description ? `${season ? `${season} · ` : ""}${award.name ?? award.description}` : null;
      } catch {
        return null;
      }
    }));
    return Array.from(new Set([...inlineAwards.map(awardText), ...detailedAwards].filter((item): item is string => Boolean(item)))).slice(0, 20);
  } catch {
    return [];
  }
}

const hallFallback: Record<string, number> = {
  "peytonmanning": 2021, "calvinjohnson": 2021, "troypolamalu": 2020, "edreed": 2019,
  "raylewis": 2018, "randymoss": 2018, "ladainiantomlinson": 2017, "kurtwarner": 2017,
  "brettfavre": 2016, "jeromebettis": 2015, "michaelstrahan": 2014, "jerryrice": 2010,
  "emmittsmith": 2010, "brucesmith": 2009, "troy aikman": 2006, "steveyoung": 2005,
  "danmarino": 2005, "barrysanders": 2004, "johnelway": 2004, "jimkelly": 2002,
  "joemontana": 2000, "lawrencetaylor": 1999,
};

export async function atlasAwards(playerId: string) {
  const { roster, master } = await atlasPlayerContext(playerId);
  const awards = await espnAwards(master.espn_id || roster?.espn_id);
  const inductionYear = hallFallback[normalizeAtlasText(playerName(master))];
  if (inductionYear) awards.unshift(`${inductionYear} · Pro Football Hall of Fame`);
  return { awards: Array.from(new Set(awards)), source: { provider: "ESPN / Pro Football Hall of Fame", updatedAt: new Date().toISOString() } };
}

export type AtlasStatColumn = { key: string; label: string };

const statColumnsByPosition: Record<string, AtlasStatColumn[]> = {
  QB: [{ key: "games", label: "GP" }, { key: "completionPct", label: "CMP%" }, { key: "passingYards", label: "PASS YDS" }, { key: "passingTds", label: "TD" }, { key: "interceptions", label: "INT" }],
  RB: [{ key: "games", label: "GP" }, { key: "carries", label: "ATT" }, { key: "rushingYards", label: "RUSH YDS" }, { key: "rushingTds", label: "RUSH TD" }, { key: "receivingYards", label: "REC YDS" }],
  WR: [{ key: "games", label: "GP" }, { key: "receptions", label: "REC" }, { key: "receivingYards", label: "YDS" }, { key: "receivingTds", label: "REC TD" }, { key: "targets", label: "TGT" }],
  TE: [{ key: "games", label: "GP" }, { key: "receptions", label: "REC" }, { key: "receivingYards", label: "YDS" }, { key: "receivingTds", label: "REC TD" }, { key: "targets", label: "TGT" }],
  DEF: [{ key: "games", label: "GP" }, { key: "tackles", label: "TACKLES" }, { key: "sacks", label: "SACK" }, { key: "interceptions", label: "INT" }, { key: "passesDefended", label: "PD" }],
};

function statPosition(position: string): keyof typeof statColumnsByPosition {
  const group = atlasPositionGroup(position);
  if (group === "QB" || group === "RB" || group === "WR" || group === "TE") return group;
  return "DEF";
}

function sumRows(rows: CsvRow[], keys: string[]) {
  return rows.reduce((total, row) => total + keys.reduce((rowTotal, key) => rowTotal + number(row[key]), 0), 0);
}

export function summarizeAtlasStats(rows: CsvRow[], playerId: string, position: string) {
  const group = statPosition(position);
  const columns = statColumnsByPosition[group];
  const bySeason = new Map<number, CsvRow[]>();
  rows.filter((row) => row.player_id === playerId && (!row.season_type || row.season_type === "REG"))
    .forEach((row) => {
      const season = number(row.season);
      if (season) bySeason.set(season, [...(bySeason.get(season) ?? []), row]);
    });
  const valuesFor = (seasonRows: CsvRow[]) => {
    const games = new Set(seasonRows.map((row) => row.game_id || `${row.season}-${row.week}-${row.team}`)).size;
    const attempts = sumRows(seasonRows, ["attempts"]);
    return {
      games,
      completionPct: attempts ? Number((sumRows(seasonRows, ["completions"]) / attempts * 100).toFixed(1)) : 0,
      passingYards: sumRows(seasonRows, ["passing_yards"]), passingTds: sumRows(seasonRows, ["passing_tds"]), interceptions: sumRows(seasonRows, ["passing_interceptions", "def_interceptions"]),
      carries: sumRows(seasonRows, ["carries"]), rushingYards: sumRows(seasonRows, ["rushing_yards"]), rushingTds: sumRows(seasonRows, ["rushing_tds"]),
      receptions: sumRows(seasonRows, ["receptions"]), receivingYards: sumRows(seasonRows, ["receiving_yards"]), receivingTds: sumRows(seasonRows, ["receiving_tds"]), targets: sumRows(seasonRows, ["targets"]),
      tackles: sumRows(seasonRows, ["def_tackles_solo", "def_tackle_assists"]), sacks: sumRows(seasonRows, ["def_sacks"]), passesDefended: sumRows(seasonRows, ["def_pass_defended"]),
    };
  };
  const seasons = Array.from(bySeason.entries()).map(([season, seasonRows]) => ({
    season,
    team: Array.from(new Set(seasonRows.map((row) => row.team || row.recent_team).filter(Boolean))).join(" / ") || "—",
    values: valuesFor(seasonRows),
  })).sort((left, right) => right.season - left.season);
  return { position: group, columns, seasons, total: valuesFor(Array.from(bySeason.values()).flat()) };
}

async function fetchPlayerCsvRows(url: string, playerId: string): Promise<CsvRow[]> {
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok || !response.body) throw new Error(`ATLAS stat source returned ${response.status}`);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let headers: string[] | null = null;
  const rows: CsvRow[] = [];
  const parseLine = (line: string) => {
    const cells: string[] = [];
    let value = "";
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];
      if (character === '"') {
        if (quoted && line[index + 1] === '"') { value += '"'; index += 1; } else quoted = !quoted;
      } else if (character === "," && !quoted) { cells.push(value); value = ""; } else value += character;
    }
    cells.push(value);
    return cells;
  };
  const consumeLine = (line: string) => {
    if (!line) return;
    const cells = parseLine(line);
    if (!headers) { headers = cells.map((header) => header.replace(/^\uFEFF/, "").trim()); return; }
    const idIndex = headers.indexOf("player_id");
    if (idIndex < 0 || cells[idIndex] !== playerId) return;
    rows.push(Object.fromEntries(headers.map((header, index) => [header, (cells[index] ?? "").trim()])));
  };
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    lines.forEach(consumeLine);
    if (done) break;
  }
  consumeLine(buffer);
  return rows;
}

export async function atlasStats(playerId: string) {
  const { roster, master } = await atlasPlayerContext(playerId);
  const start = rookieSeason(master);
  const end = roster ? currentSeason : Math.max(start, number(master.last_season) || currentSeason - 1);
  const rows = await mapInBatches(Array.from({ length: end - start + 1 }, (_, index) => start + index), 6, async (season) => {
    try {
      return await fetchPlayerCsvRows(`${NFLVERSE_RELEASES}/stats_player/stats_player_week_${season}.csv`, playerId);
    } catch {
      return [];
    }
  });
  return { ...summarizeAtlasStats(rows.flat(), playerId, roster?.position || master.position || "WR"), source: { provider: "NFLverse player statistics", updatedAt: new Date().toISOString(), throughSeason: end } };
}

function contractMoney(value: number) {
  return value ? `$${value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : `${value.toFixed(1)}M`}` : "—";
}

export async function atlasContracts(playerId: string) {
  const { roster, master } = await atlasPlayerContext(playerId);
  const contractUrl = `${NFLVERSE_RELEASES}/contracts/historical_contracts.csv`;
  try {
    const rows = await cached("atlas:contracts", 12 * 60 * 60 * 1000, () => fetchCsv(contractUrl));
    const normalizedName = normalizeAtlasText(playerName(master));
    const records = rows.filter((row) => row.gsis_id === playerId || normalizeAtlasText(row.player) === normalizedName)
      .map((row) => ({ team: row.team || roster?.team || "—", yearSigned: number(row.year_signed), years: number(row.years), total: number(row.value), apy: number(row.apy), guaranteed: number(row.guaranteed), active: row.is_active === "TRUE" || row.is_active === "true" }))
      .sort((left, right) => right.yearSigned - left.yearSigned);
    return { available: true, records, source: { provider: "nflverse / OverTheCap", updatedAt: new Date().toISOString() } };
  } catch {
    return { available: false, records: [], source: { provider: "nflverse / OverTheCap", message: "公開契約アーカイブを現在取得できません。" } };
  }
}

export { contractMoney };
