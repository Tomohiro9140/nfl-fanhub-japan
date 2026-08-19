type CsvRow = Record<string, string>;

import { storageGetSignedUrl } from "./storage";

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
const HISTORIC_ROSTER_KEY = "atlas-historic-roster-index_ccf81874.json";
const ACTIVE_CONTRACTS_KEY = "nfl-active-contracts_42bb7ee5.json";
const POSITION_ORDER = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "K", "P", "LS"] as const;

const CACHE_TTL = {
  roster: 20 * 60 * 1000,
  players: 12 * 60 * 60 * 1000,
  teams: 6 * 60 * 60 * 1000,
  history: 7 * 24 * 60 * 60 * 1000,
  stats: 6 * 60 * 60 * 1000,
  contracts: 12 * 60 * 60 * 1000,
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

type HistoricRosterIndex = {
  coverage: { startSeason: number; endSeason: number };
  players: Record<string, Record<string, string[]>>;
};

async function historicRosterIndex(): Promise<HistoricRosterIndex | null> {
  return cached("atlas:historic-roster-index", CACHE_TTL.history, async () => {
    try {
      const url = await storageGetSignedUrl(HISTORIC_ROSTER_KEY);
      const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (!response.ok) throw new Error(`Historic roster index returned ${response.status}`);
      const value = await response.json() as HistoricRosterIndex;
      if (!value.coverage || !value.players) throw new Error("Historic roster index is incomplete");
      return value;
    } catch {
      return null;
    }
  });
}

const hallFallback: ReadonlyArray<readonly [string, number]> = [
  ["Drew Brees", 2026], ["Larry Fitzgerald", 2026], ["Adam Vinatieri", 2026], ["Antonio Gates", 2025], ["Julius Peppers", 2024], ["Peyton Manning", 2021], ["Calvin Johnson", 2021], ["Troy Polamalu", 2020], ["Ed Reed", 2019], ["Ray Lewis", 2018], ["Randy Moss", 2018], ["LaDainian Tomlinson", 2017], ["Kurt Warner", 2017], ["Brett Favre", 2016], ["Jerome Bettis", 2015], ["Michael Strahan", 2014], ["Larry Allen", 2013], ["Deion Sanders", 2011], ["Jerry Rice", 2010], ["Emmitt Smith", 2010], ["Bruce Smith", 2009], ["Troy Aikman", 2006], ["Reggie White", 2006], ["Steve Young", 2005], ["Dan Marino", 2005], ["Barry Sanders", 2004], ["John Elway", 2004], ["Marcus Allen", 2003], ["Jim Kelly", 2002], ["Joe Montana", 2000], ["Lawrence Taylor", 1999], ["Dan Fouts", 1993],
];

function cleanHallName(value: string): string {
  const sortName = value.match(/\{\{sortname\|([^|}]+)\|([^|}]+)(?:\|[^}]*)?\}\}/i);
  if (sortName) return `${sortName[1]} ${sortName[2]}`.replace(/\s+/g, " ").trim();
  const linkedName = value.match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
  if (linkedName) return (linkedName[2] || linkedName[1]).replace(/\s*\([^)]*\)/g, "").trim();
  return value.replace(/\{\{[^}]+\}\}|\[\[[^\]]+\]\]|<[^>]+>|\*+|\^.*|\[\d+\]/g, "").replace(/\s+/g, " ").trim();
}

function hallFallbackMap() {
  return new Map(hallFallback.map(([name, year]) => [normalizeAtlasText(name), year]));
}

async function hallOfFameYears(): Promise<Map<string, number>> {
  return cached("atlas:hall-of-fame", CACHE_TTL.history, async () => {
    const fallback = hallFallbackMap();
    try {
      const response = await fetch("https://en.wikipedia.org/w/api.php?action=parse&page=List_of_Pro_Football_Hall_of_Fame_inductees&prop=wikitext&format=json&origin=*", { headers: { "User-Agent": USER_AGENT } });
      if (!response.ok) return fallback;
      const payload = await response.json() as { parse?: { wikitext?: { "*"?: string } } };
      const values = payload.parse?.wikitext?.["*"] ?? "";
      values.split(/\n\|-/).forEach((row) => {
        const columns = row.split("||");
        const year = columns[1]?.match(/\b(19|20)\d{2}\b/)?.[0];
        const role = columns[2]?.replace(/\[\[[^\]]+\]\]/g, "").toLowerCase() ?? "";
        const name = cleanHallName(columns[0] ?? "");
        if (year && name && !/(coach|owner|general manager|commissioner|administrator|personnel|executive|contributor|official|founder|president)/.test(role)) fallback.set(normalizeAtlasText(name), Number(year));
      });
      return fallback;
    } catch {
      return fallback;
    }
  });
}

async function hallOfFameYear(name: string) {
  return (await hallOfFameYears()).get(normalizeAtlasText(name)) ?? null;
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
  const availablePositions = new Set(active.filter((player) => !team || player.team.abbreviation === team).map((player) => atlasPositionGroup(player.position)));
  const positions = POSITION_ORDER.filter((position) => availablePositions.has(position));
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
  return cached(`atlas:profile:${playerId}`, CACHE_TTL.roster, () => atlasProfileUncached(playerId));
}

async function atlasProfileUncached(playerId: string) {
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
  return cached(`atlas:career:${playerId}`, CACHE_TTL.history, () => atlasCareerUncached(playerId));
}

async function atlasCareerUncached(playerId: string) {
  const { roster, master, directory } = await atlasPlayerContext(playerId);
  const start = rookieSeason(master);
  const end = roster ? currentSeason : Math.max(start, number(master.last_season) || currentSeason - 1);
  const historic = await historicRosterIndex();
  const historicEntries: Record<string, string[]> = historic?.players[playerId] ?? {};
  const historicSeasons = Object.entries(historicEntries).map(([season, teams]) => ({ season: number(season), teams }));
  const recentStart = Math.max(historic?.coverage.endSeason ? historic.coverage.endSeason + 1 : start, start);
  const seasons = Array.from({ length: Math.max(0, end - recentStart + 1) }, (_, index) => recentStart + index);
  const recentSeasons = await mapInBatches(seasons, 4, async (season) => {
    try {
      const rosterRows = await rosterForSeason(season);
      const teams = Array.from(new Set(rosterRows.filter((row) => row.gsis_id === playerId).map((row) => teamAliases[row.team] ?? row.team).filter(Boolean)));
      return { season, teams };
    } catch {
      return { season, teams: [] as string[] };
    }
  });
  const bySeason = new Map<number, string[]>();
  [...historicSeasons, ...recentSeasons].forEach((entry) => { if (entry.teams.length) bySeason.set(entry.season, Array.from(new Set(entry.teams))); });
  const timeline = Array.from(bySeason.entries()).map(([season, teams]) => ({ season, teams })).sort((left, right) => right.season - left.season);
  const spans: Array<{ startSeason: number; endSeason: number; teams: AtlasTeam[] }> = [];
  timeline.forEach((entry) => {
    const previous = spans.at(-1);
    const normalizedTeams = entry.teams.map((team) => teamFor(team, directory));
    if (previous && previous.teams.map((team) => team.abbreviation).join("|") === normalizedTeams.map((team) => team.abbreviation).join("|") && previous.startSeason === entry.season + 1) {
      previous.startSeason = entry.season;
      return;
    }
    spans.push({ startSeason: entry.season, endSeason: entry.season, teams: normalizedTeams });
  });
  return {
    spans,
    hallOfFameYear: await hallOfFameYear(playerName(master)),
    source: { provider: "NFLverse roster data", updatedAt: new Date().toISOString(), teamHistoryCoverage: { availableFrom: historic?.coverage.startSeason ?? start, unavailableBefore: historic && start < historic.coverage.startSeason ? { startSeason: start, endSeason: historic.coverage.startSeason - 1 } : null } },
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

export async function atlasAwards(playerId: string) {
  const { roster, master } = await atlasPlayerContext(playerId);
  const awards = await espnAwards(master.espn_id || roster?.espn_id);
  const inductionYear = await hallOfFameYear(playerName(master));
  if (inductionYear) awards.unshift(`${inductionYear} · Pro Football Hall of Fame`);
  return { awards: Array.from(new Set(awards)), source: { provider: "ESPN / Pro Football Hall of Fame", updatedAt: new Date().toISOString() } };
}

export type AtlasStatColumn = { key: string; label: string; sources?: string[]; calculate?: (rows: CsvRow[]) => number | string };

const sum = (rows: CsvRow[], sources: string[]) => rows.reduce((total, row) => total + sources.reduce((rowTotal, source) => rowTotal + number(row[source]), 0), 0);
const ratio = (rows: CsvRow[], numerator: string[], denominator: string[], percent = false) => { const divisor = sum(rows, denominator); return divisor ? Number((sum(rows, numerator) / divisor * (percent ? 100 : 1)).toFixed(percent ? 1 : 2)) : 0; };
const weightedAverage = (rows: CsvRow[], value: string, weight: string) => { const totalWeight = sum(rows, [weight]); return totalWeight ? Number((rows.reduce((total, row) => total + number(row[value]) * number(row[weight]), 0) / totalWeight).toFixed(2)) : 0; };
const gameCount = (rows: CsvRow[]) => new Set(rows.map((row) => row.game_id || `${row.season}-${row.week}-${row.team}`)).size;
const maxValue = (rows: CsvRow[], sources: string[]) => Math.max(0, ...rows.flatMap((row) => sources.map((source) => number(row[source]))));
const passerRating = (rows: CsvRow[]) => { const attempts = sum(rows, ["attempts"]); if (!attempts) return 0; const bounded = (value: number) => Math.max(0, Math.min(2.375, value)); const completions = sum(rows, ["completions"]); const yards = sum(rows, ["passing_yards"]); const touchdowns = sum(rows, ["passing_tds"]); const interceptions = sum(rows, ["passing_interceptions"]); return Number((((bounded((completions / attempts - 0.3) * 5) + bounded((yards / attempts - 3) * 0.25) + bounded(touchdowns / attempts * 20) + bounded(2.375 - interceptions / attempts * 25)) / 6) * 100).toFixed(1)); };
const fgRange = (bucket: string) => (rows: CsvRow[]) => { const made = sum(rows, [`fg_made_${bucket}`]); const attempts = made + sum(rows, [`fg_missed_${bucket}`, `fg_blocked_${bucket}`]); return attempts ? `${made}/${attempts}` : "—"; };
const gameColumn: AtlasStatColumn = { key: "games", label: "GP", calculate: gameCount };

const statColumnsByPosition: Record<string, AtlasStatColumn[]> = {
  QB: [gameColumn, { key: "completionPct", label: "CMP%", calculate: (rows) => ratio(rows, ["completions"], ["attempts"], true) }, { key: "passingYards", label: "PASS YDS", sources: ["passing_yards"] }, { key: "yardsPerAttempt", label: "YPA", calculate: (rows) => ratio(rows, ["passing_yards"], ["attempts"]) }, { key: "passingTds", label: "TD", sources: ["passing_tds"] }, { key: "interceptions", label: "INT", sources: ["passing_interceptions"] }, { key: "passerRating", label: "RATING", calculate: passerRating }, { key: "sacks", label: "SACKED", sources: ["sacks_suffered"] }, { key: "rushingYards", label: "RUSH YDS", sources: ["rushing_yards"] }, { key: "rushingTds", label: "RUSH TD", sources: ["rushing_tds"] }, { key: "cpoe", label: "CPOE", calculate: (rows) => weightedAverage(rows, "passing_cpoe", "attempts") }],
  RB: [gameColumn, { key: "carries", label: "ATT", sources: ["carries"] }, { key: "rushingYards", label: "RUSH YDS", sources: ["rushing_yards"] }, { key: "yardsPerCarry", label: "YPC", calculate: (rows) => ratio(rows, ["rushing_yards"], ["carries"]) }, { key: "rushingTds", label: "RUSH TD", sources: ["rushing_tds"] }, { key: "receivingYards", label: "REC YDS", sources: ["receiving_yards"] }, { key: "receivingTds", label: "REC TD", sources: ["receiving_tds"] }, { key: "fumbles", label: "FUM", sources: ["rushing_fumbles", "receiving_fumbles"] }, { key: "fumblesLost", label: "LOST", sources: ["rushing_fumbles_lost", "receiving_fumbles_lost"] }],
  WR: [gameColumn, { key: "receivingYards", label: "YDS", sources: ["receiving_yards"] }, { key: "yardsPerReception", label: "YPR", calculate: (rows) => ratio(rows, ["receiving_yards"], ["receptions"]) }, { key: "receivingTds", label: "REC TD", sources: ["receiving_tds"] }, { key: "catchPct", label: "CATCH%", calculate: (rows) => ratio(rows, ["receptions"], ["targets"], true) }, { key: "firstDowns", label: "1ST", sources: ["receiving_first_downs"] }, { key: "yac", label: "YAC", sources: ["receiving_yards_after_catch"] }],
  TE: [gameColumn, { key: "receivingYards", label: "YDS", sources: ["receiving_yards"] }, { key: "yardsPerReception", label: "YPR", calculate: (rows) => ratio(rows, ["receiving_yards"], ["receptions"]) }, { key: "receivingTds", label: "REC TD", sources: ["receiving_tds"] }, { key: "catchPct", label: "CATCH%", calculate: (rows) => ratio(rows, ["receptions"], ["targets"], true) }, { key: "firstDowns", label: "1ST", sources: ["receiving_first_downs"] }, { key: "yac", label: "YAC", sources: ["receiving_yards_after_catch"] }],
  OL: [gameColumn, { key: "penalties", label: "PEN", sources: ["penalties"] }, { key: "penaltyYards", label: "PEN YDS", sources: ["penalty_yards"] }],
  DL: [gameColumn, { key: "solo", label: "SOLO", sources: ["def_tackles_solo"] }, { key: "assists", label: "AST", sources: ["def_tackle_assists"] }, { key: "tfl", label: "TFL", sources: ["def_tackles_for_loss"] }, { key: "sacks", label: "SACK", sources: ["def_sacks"] }, { key: "hits", label: "QB HIT", sources: ["def_qb_hits"] }, { key: "forcedFumbles", label: "FF", sources: ["def_fumbles_forced"] }],
  LB: [gameColumn, { key: "solo", label: "SOLO", sources: ["def_tackles_solo"] }, { key: "assists", label: "AST", sources: ["def_tackle_assists"] }, { key: "totalTackles", label: "TOTAL", sources: ["def_tackles_solo", "def_tackle_assists"] }, { key: "tfl", label: "TFL", sources: ["def_tackles_for_loss"] }, { key: "sacks", label: "SACK", sources: ["def_sacks"] }, { key: "hits", label: "QB HIT", sources: ["def_qb_hits"] }, { key: "interceptions", label: "INT", sources: ["def_interceptions"] }, { key: "forcedFumbles", label: "FF", sources: ["def_fumbles_forced"] }],
  DB: [gameColumn, { key: "passesDefended", label: "PD", sources: ["def_pass_defended"] }, { key: "interceptions", label: "INT", sources: ["def_interceptions"] }, { key: "totalTackles", label: "TOTAL", sources: ["def_tackles_solo", "def_tackle_assists"] }, { key: "tfl", label: "TFL", sources: ["def_tackles_for_loss"] }, { key: "forcedFumbles", label: "FF", sources: ["def_fumbles_forced"] }],
  K: [gameColumn, { key: "fgMade", label: "FGM", sources: ["fg_made"] }, { key: "fgAttempted", label: "FGA", sources: ["fg_att"] }, { key: "fgPct", label: "FG%", calculate: (rows) => ratio(rows, ["fg_made"], ["fg_att"], true) }, { key: "fg1to19", label: "1-19", calculate: fgRange("0_19") }, { key: "fg20to29", label: "20-29", calculate: fgRange("20_29") }, { key: "fg30to39", label: "30-39", calculate: fgRange("30_39") }, { key: "fg40to49", label: "40-49", calculate: fgRange("40_49") }, { key: "fg50plus", label: "50+", calculate: (rows) => `${sum(rows, ["fg_made_50_59", "fg_made_60_"])}/${sum(rows, ["fg_made_50_59", "fg_made_60_", "fg_missed_50_59", "fg_missed_60_", "fg_blocked_50_59", "fg_blocked_60_"]) || "—"}` }, { key: "fgLong", label: "LONG", calculate: (rows) => maxValue(rows, ["fg_long"]) }, { key: "patMade", label: "XPM", sources: ["pat_made"] }, { key: "patAttempted", label: "XPA", sources: ["pat_att"] }, { key: "patPct", label: "XP%", calculate: (rows) => ratio(rows, ["pat_made"], ["pat_att"], true) }],
  P: [gameColumn, { key: "punts", label: "PUNTS", sources: ["punts"] }, { key: "puntYards", label: "YDS", sources: ["punt_yards"] }, { key: "grossAvg", label: "GROSS AVG", calculate: (rows) => ratio(rows, ["punt_yards"], ["punts"]) }, { key: "netAvg", label: "NET AVG", calculate: (rows) => ratio(rows, ["punt_net_yards"], ["punts"]) }, { key: "in20", label: "IN20", sources: ["punt_inside_20"] }, { key: "in20Pct", label: "IN20%", calculate: (rows) => ratio(rows, ["punt_inside_20"], ["punts"], true) }, { key: "touchbacks", label: "TB", sources: ["punt_touchbacks"] }, { key: "fairCatches", label: "FC", sources: ["punt_fair_catches"] }, { key: "puntLong", label: "LONG", calculate: (rows) => maxValue(rows, ["punt_long"]) }, { key: "puntsBlocked", label: "BLK", sources: ["punt_blocked"] }],
  LS: [gameColumn, { key: "solo", label: "SOLO", sources: ["def_tackles_solo"] }, { key: "assists", label: "AST", sources: ["def_tackle_assists"] }, { key: "totalTackles", label: "TOTAL", sources: ["def_tackles_solo", "def_tackle_assists"] }],
};

function statPosition(position: string): keyof typeof statColumnsByPosition {
  const group = atlasPositionGroup(position);
  return group in statColumnsByPosition ? group as keyof typeof statColumnsByPosition : "WR";
}

export function summarizeAtlasStats(rows: CsvRow[], playerId: string, position: string) {
  const group = statPosition(position);
  const columns = statColumnsByPosition[group];
  const bySeason = new Map<number, Map<string, CsvRow[]>>();
  rows.filter((row) => row.player_id === playerId && (!row.season_type || row.season_type === "REG"))
    .forEach((row) => {
      const season = number(row.season);
      const team = row.team || row.recent_team || "FA";
      if (!season) return;
      const teams = bySeason.get(season) ?? new Map<string, CsvRow[]>();
      teams.set(team, [...(teams.get(team) ?? []), row]);
      bySeason.set(season, teams);
    });
  const valuesFor = (seasonRows: CsvRow[]) => Object.fromEntries(columns.map((column) => [column.key, column.calculate ? column.calculate(seasonRows) : sum(seasonRows, column.sources ?? [])]));
  const seasons = Array.from(bySeason.entries()).sort(([left], [right]) => right - left).flatMap(([season, teams]) => {
    const teamRows = Array.from(teams.entries()).map(([team, seasonRows]) => ({ season, team, kind: "team" as const, values: valuesFor(seasonRows) }));
    return teamRows.length < 2 ? teamRows : [...teamRows, { season, team: "TOTAL", kind: "season-total" as const, values: valuesFor(Array.from(teams.values()).flat()) }];
  });
  return { position: group, columns, seasons, total: valuesFor(Array.from(bySeason.values()).flatMap((teams) => Array.from(teams.values()).flat())) };
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
  return cached(`atlas:stats:${playerId}`, CACHE_TTL.stats, () => atlasStatsUncached(playerId));
}

async function atlasStatsUncached(playerId: string) {
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
  const rookie = number(master.rookie_season || master.entry_year || master.draft_year) || start;
  return { ...summarizeAtlasStats(rows.flat(), playerId, roster?.position || master.position || "WR"), source: { provider: "NFLverse player statistics", updatedAt: new Date().toISOString(), throughSeason: end, seasonStatsCoverage: { availableFrom: 1999, unavailableBefore: rookie < 1999 ? { startSeason: rookie, endSeason: 1998 } : null } } };
}

function contractMoney(value: number) {
  return value ? `$${value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : `${value.toFixed(1)}M`}` : "—";
}

type ContractSeason = {
  year: string;
  team?: string;
  baseSalary?: number;
  proratedBonus?: number;
  optionBonus?: number;
  rosterBonus?: number;
  guaranteed?: number;
  capHit?: number;
  cashPaid?: number;
  workoutBonus?: number;
  perGameRosterBonus?: number;
  otherBonus?: number;
};

type ContractHistory = { team?: string; yearSigned?: number; years?: number; total?: number; apy?: number; guaranteed?: number; type?: string; status?: string; amountEarned?: number };
type ActiveContract = { team?: string; yearSigned?: number; years?: number; total?: number; apy?: number; guaranteed?: number; seasonHistory?: ContractSeason[]; contractHistory?: ContractHistory[] };
type ContractIndex = { source?: string; sourceUpdatedAt?: string; contracts?: Record<string, ActiveContract> };

function contractNumber(value: number | undefined) { return typeof value === "number" && Number.isFinite(value) ? value : 0; }
function hasContractCharge(season: ContractSeason) {
  return [season.cashPaid, season.capHit, season.proratedBonus, season.optionBonus, season.rosterBonus, season.workoutBonus, season.perGameRosterBonus, season.otherBonus].some((value) => contractNumber(value) > 0);
}
function contractOtherBreakdown(season: ContractSeason) {
  return [
    { key: "workoutBonus", label: "ワークアウト", amount: contractNumber(season.workoutBonus) },
    { key: "perGameRosterBonus", label: "試合別ロスター", amount: contractNumber(season.perGameRosterBonus) },
    { key: "otherBonus", label: "その他ボーナス", amount: contractNumber(season.otherBonus) },
  ].filter((entry) => entry.amount > 0);
}

function contractTeamName(team: string, directory: Map<string, AtlasTeam>) {
  const normalized = team.trim().toLowerCase();
  return Array.from(directory.values()).find((entry) => entry.name.toLowerCase() === normalized || entry.name.toLowerCase().endsWith(` ${normalized}`))?.name ?? team;
}

export async function atlasContracts(playerId: string) {
  const { roster } = await atlasPlayerContext(playerId);
  try {
    const index = await cached("atlas:active-contract-index", CACHE_TTL.contracts, async () => {
      const signedUrl = await storageGetSignedUrl(ACTIVE_CONTRACTS_KEY);
      const response = await fetch(signedUrl, { headers: { "User-Agent": USER_AGENT } });
      if (!response.ok) throw new Error(`Active contract archive returned ${response.status}`);
      return await response.json() as ContractIndex;
    });
    const record = index.contracts?.[playerId];
    if (!record) return { available: true, contract: null, source: { provider: index.source || "NFLverse / Over The Cap", updatedAt: index.sourceUpdatedAt || new Date().toISOString() } };
    const { directory } = await searchUniverse();
    const startYear = contractNumber(record.yearSigned) || null;
    const seasonHistory = [...(record.seasonHistory ?? [])].filter((season) => /^\d{4}$/.test(season.year) && (!startYear || Number(season.year) >= startYear)).sort((left, right) => Number(left.year) - Number(right.year));
    const lastCashYear = Math.max(0, ...seasonHistory.filter((season) => contractNumber(season.cashPaid) > 0).map((season) => Number(season.year)));
    const years = seasonHistory.filter((season) => Number(season.year) <= lastCashYear || hasContractCharge(season)).map((season) => {
      const otherBreakdown = contractOtherBreakdown(season);
      return {
        ...season,
        year: Number(season.year),
        team: contractTeamName(season.team || record.team || roster?.team || "—", directory),
        otherTotal: otherBreakdown.reduce((total, entry) => total + entry.amount, 0),
        otherBreakdown,
        isVoidYear: Boolean(lastCashYear && Number(season.year) > lastCashYear && contractNumber(season.cashPaid) === 0),
      };
    });
    const history = [...(record.contractHistory ?? [])].filter((entry) => entry.yearSigned).sort((left, right) => contractNumber(right.yearSigned) - contractNumber(left.yearSigned) || contractNumber(right.total) - contractNumber(left.total)).map((entry) => ({ ...entry, team: contractTeamName(entry.team || record.team || "—", directory) }));
    return {
      available: true,
      contract: {
        currentContract: { team: contractTeamName(record.team || roster?.team || "—", directory), yearSigned: startYear, endYear: startYear && record.years ? startYear + record.years - 1 : null, years: record.years || null, total: contractNumber(record.total), apy: contractNumber(record.apy), guaranteed: contractNumber(record.guaranteed) },
        years,
        history,
        noteAvailability: { incentives: false, deadMoney: false, message: "" },
      },
      source: { provider: index.source || "NFLverse / Over The Cap", updatedAt: index.sourceUpdatedAt || new Date().toISOString() },
    };
  } catch {
    return { available: false, contract: null, source: { provider: "NFLverse / Over The Cap", message: "公開契約アーカイブを現在取得できません。" } };
  }
}

export { contractMoney };
