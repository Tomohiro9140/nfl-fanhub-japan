import { asyncBufferFromUrl, parquetReadObjects } from "hyparquet";
import { and, eq, gt, inArray, max } from "drizzle-orm";
import { seasonImports, seasonRefreshSchedules, teamWeekMatchups, teamWeekStats } from "../drizzle/schema";
import { getDb } from "./db";
import { ShortLivedPromiseCache } from "./fieldlineCache";

export const FIELDLINE_TEAM_NAMES: Record<string, string> = {
  ARI: "Arizona Cardinals", ATL: "Atlanta Falcons", BAL: "Baltimore Ravens", BUF: "Buffalo Bills",
  CAR: "Carolina Panthers", CHI: "Chicago Bears", CIN: "Cincinnati Bengals", CLE: "Cleveland Browns",
  DAL: "Dallas Cowboys", DEN: "Denver Broncos", DET: "Detroit Lions", GB: "Green Bay Packers",
  HOU: "Houston Texans", IND: "Indianapolis Colts", JAX: "Jacksonville Jaguars", KC: "Kansas City Chiefs",
  LV: "Las Vegas Raiders", LAC: "Los Angeles Chargers", LAR: "Los Angeles Rams", MIA: "Miami Dolphins",
  MIN: "Minnesota Vikings", NE: "New England Patriots", NO: "New Orleans Saints", NYG: "New York Giants",
  NYJ: "New York Jets", PHI: "Philadelphia Eagles", PIT: "Pittsburgh Steelers", SF: "San Francisco 49ers",
  SEA: "Seattle Seahawks", TB: "Tampa Bay Buccaneers", TEN: "Tennessee Titans", WAS: "Washington Commanders",
};

export const FIELDLINE_TEAM_CODES = Object.keys(FIELDLINE_TEAM_NAMES);
export const fieldlinePbpSource = (season: number) => `https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_${season}.parquet`;

export type FieldlineVenue = "all" | "home" | "away";
export type FieldlineSelection = { season: number; team: string; weeks: number[]; venue?: FieldlineVenue };
export type FieldlineWeek = { week: number; opponent: string; isHome: boolean | null; isBye: boolean };
type PbpRow = Record<string, unknown>;
type Aggregate = {
  season: number; team: string; week: number; games: number; pointsFor: number; pointsAgainst: number;
  yardsFor: number; yardsAgainst: number; passYardsFor: number; rushYardsFor: number;
  passYardsAgainst: number; rushYardsAgainst: number; offenseEpa: number; offenseEpaPlays: number;
  defenseEpaAllowed: number; defenseEpaPlays: number; passAttempts: number; passCompletions: number;
  passTouchdowns: number; interceptionsThrown: number; sacksAllowed: number; sacksDefense: number;
  interceptionsDefense: number; turnovers: number; thirdDownAttempts: number; thirdDownConversions: number;
  opponentThirdDownAttempts: number; opponentThirdDownConversions: number; redZoneAttempts: number;
  redZoneTouchdowns: number; opponentRedZoneAttempts: number; opponentRedZoneTouchdowns: number;
  fieldGoalAttempts: number; fieldGoalsMade: number; extraPointAttempts: number; extraPointsMade: number;
  puntAttempts: number; puntsInside20: number; penalties: number; penaltyYards: number; blitzPct: number | null;
  missedTackles: number | null;
};

export type FieldlineSummary = {
  team: string;
  teamName: string;
  games: number;
  record: { wins: number; losses: number; ties: number };
  metrics: Record<string, number | null>;
  ranks: Record<string, number | null>;
};
export type FieldlineComparisonResult = { available: false; reason: string } | { available: true; summary: FieldlineSummary };

const TEAM_ALIASES: Record<string, string> = { LA: "LAR", JAC: "JAX", WSH: "WAS" };
const asNumber = (value: unknown) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const asFiniteNumber = (value: unknown) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
const asString = (value: unknown) => typeof value === "string" ? value : "";
const keyString = (value: unknown) => value === null || value === undefined ? "" : String(value);
const normalizedTeam = (value: unknown) => TEAM_ALIASES[asString(value)] ?? asString(value);
const teamKnown = (team: string) => team in FIELDLINE_TEAM_NAMES;

function emptyAggregate(season: number, team: string, week: number): Aggregate {
  return {
    season, team, week, games: 0, pointsFor: 0, pointsAgainst: 0, yardsFor: 0, yardsAgainst: 0,
    passYardsFor: 0, rushYardsFor: 0, passYardsAgainst: 0, rushYardsAgainst: 0,
    offenseEpa: 0, offenseEpaPlays: 0, defenseEpaAllowed: 0, defenseEpaPlays: 0, passAttempts: 0,
    passCompletions: 0, passTouchdowns: 0, interceptionsThrown: 0, sacksAllowed: 0, sacksDefense: 0,
    interceptionsDefense: 0, turnovers: 0, thirdDownAttempts: 0, thirdDownConversions: 0,
    opponentThirdDownAttempts: 0, opponentThirdDownConversions: 0, redZoneAttempts: 0, redZoneTouchdowns: 0,
    opponentRedZoneAttempts: 0, opponentRedZoneTouchdowns: 0, fieldGoalAttempts: 0, fieldGoalsMade: 0,
    extraPointAttempts: 0, extraPointsMade: 0, puntAttempts: 0, puntsInside20: 0, penalties: 0,
    penaltyYards: 0, blitzPct: null, missedTackles: null,
  };
}

function passerRating(stat: Pick<Aggregate, "passAttempts" | "passCompletions" | "passYardsFor" | "passTouchdowns" | "interceptionsThrown">) {
  if (!stat.passAttempts) return null;
  const a = Math.max(0, Math.min(2.375, ((stat.passCompletions / stat.passAttempts) - 0.3) * 5));
  const b = Math.max(0, Math.min(2.375, ((stat.passYardsFor / stat.passAttempts) - 3) * 0.25));
  const c = Math.max(0, Math.min(2.375, (stat.passTouchdowns / stat.passAttempts) * 20));
  const d = Math.max(0, Math.min(2.375, 2.375 - (stat.interceptionsThrown / stat.passAttempts) * 25));
  return ((a + b + c + d) / 6) * 100;
}

const aggregateKeys = [
  "games", "pointsFor", "pointsAgainst", "yardsFor", "yardsAgainst", "passYardsFor", "rushYardsFor",
  "passYardsAgainst", "rushYardsAgainst", "offenseEpa", "offenseEpaPlays", "defenseEpaAllowed",
  "defenseEpaPlays", "passAttempts", "passCompletions", "passTouchdowns", "interceptionsThrown",
  "sacksAllowed", "sacksDefense", "interceptionsDefense", "turnovers", "thirdDownAttempts",
  "thirdDownConversions", "opponentThirdDownAttempts", "opponentThirdDownConversions", "redZoneAttempts",
  "redZoneTouchdowns", "opponentRedZoneAttempts", "opponentRedZoneTouchdowns", "fieldGoalAttempts",
  "fieldGoalsMade", "extraPointAttempts", "extraPointsMade", "puntAttempts", "puntsInside20", "penalties", "penaltyYards",
] as const;

function aggregateRows(season: number, rows: Aggregate[]) {
  const totals = new Map(FIELDLINE_TEAM_CODES.map(team => [team, emptyAggregate(season, team, 0)]));
  for (const row of rows) {
    const total = totals.get(row.team);
    if (!total) continue;
    for (const key of aggregateKeys) total[key] += row[key];
  }
  return totals;
}

function aggregateRecords(rows: Aggregate[]) {
  const records = new Map<string, { wins: number; losses: number; ties: number }>();
  for (const row of rows) {
    if (!row.games) continue;
    const record = records.get(row.team) ?? { wins: 0, losses: 0, ties: 0 };
    if (row.pointsFor > row.pointsAgainst) record.wins += 1;
    else if (row.pointsFor < row.pointsAgainst) record.losses += 1;
    else record.ties += 1;
    records.set(row.team, record);
  }
  return records;
}

function toMetrics(stat: Aggregate) {
  const games = stat.games || 1;
  return {
    pointsPerGame: stat.games ? stat.pointsFor / games : null, yardsPerGame: stat.games ? stat.yardsFor / games : null,
    epaPerPlay: stat.offenseEpaPlays ? stat.offenseEpa / stat.offenseEpaPlays : null,
    passYardsPerGame: stat.games ? stat.passYardsFor / games : null, rushYardsPerGame: stat.games ? stat.rushYardsFor / games : null,
    passerRating: passerRating(stat), thirdDownPct: stat.thirdDownAttempts ? stat.thirdDownConversions / stat.thirdDownAttempts : null,
    redZoneTdPct: stat.redZoneAttempts ? stat.redZoneTouchdowns / stat.redZoneAttempts : null, sacksAllowed: stat.games ? stat.sacksAllowed : null,
    pointsAllowedPerGame: stat.games ? stat.pointsAgainst / games : null, yardsAllowedPerGame: stat.games ? stat.yardsAgainst / games : null,
    opponentEpaPerPlay: stat.defenseEpaPlays ? stat.defenseEpaAllowed / stat.defenseEpaPlays : null,
    passYardsAllowedPerGame: stat.games ? stat.passYardsAgainst / games : null, rushYardsAllowedPerGame: stat.games ? stat.rushYardsAgainst / games : null,
    opponentThirdDownPct: stat.opponentThirdDownAttempts ? stat.opponentThirdDownConversions / stat.opponentThirdDownAttempts : null,
    opponentRedZoneTdPct: stat.opponentRedZoneAttempts ? stat.opponentRedZoneTouchdowns / stat.opponentRedZoneAttempts : null,
    sacksDefense: stat.games ? stat.sacksDefense : null, interceptionsDefense: stat.games ? stat.interceptionsDefense : null,
    turnovers: stat.games ? stat.turnovers : null, fieldGoalPct: stat.fieldGoalAttempts ? stat.fieldGoalsMade / stat.fieldGoalAttempts : null,
    extraPointPct: stat.extraPointAttempts ? stat.extraPointsMade / stat.extraPointAttempts : null,
    puntInside20Pct: stat.puntAttempts ? stat.puntsInside20 / stat.puntAttempts : null, penalties: stat.games ? stat.penalties : null,
  };
}

const metricRules: [string, "asc" | "desc"][] = [
  ["pointsPerGame", "desc"], ["yardsPerGame", "desc"], ["epaPerPlay", "desc"], ["passYardsPerGame", "desc"], ["rushYardsPerGame", "desc"],
  ["passerRating", "desc"], ["thirdDownPct", "desc"], ["redZoneTdPct", "desc"], ["sacksAllowed", "asc"],
  ["pointsAllowedPerGame", "asc"], ["yardsAllowedPerGame", "asc"], ["opponentEpaPerPlay", "asc"], ["passYardsAllowedPerGame", "asc"], ["rushYardsAllowedPerGame", "asc"],
  ["opponentThirdDownPct", "asc"], ["opponentRedZoneTdPct", "asc"], ["sacksDefense", "desc"], ["interceptionsDefense", "desc"], ["turnovers", "desc"],
  ["fieldGoalPct", "desc"], ["extraPointPct", "desc"], ["puntInside20Pct", "desc"], ["penalties", "asc"],
];

function makeRanks(summaries: FieldlineSummary[]) {
  for (const [metric, direction] of metricRules) {
    summaries.filter(item => item.metrics[metric] !== null).sort((a, b) => {
      const left = a.metrics[metric] as number;
      const right = b.metrics[metric] as number;
      return direction === "desc" ? right - left : left - right;
    }).forEach((entry, index) => { entry.ranks[metric] = index + 1; });
  }
}

export async function getFieldlineSeasons() {
  const db = await getDb();
  return db ? db.select().from(seasonImports).orderBy(seasonImports.season) : [];
}

export async function getFieldlineRefreshSchedules() {
  const db = await getDb();
  return db ? db.select().from(seasonRefreshSchedules).orderBy(seasonRefreshSchedules.season) : [];
}

export async function getFieldlineFreshness(seasons: number[]) {
  const requested = Array.from(new Set(seasons)).sort((a, b) => b - a);
  const db = await getDb();
  if (!db) return requested.map(season => ({ season, state: "unavailable" as const, latestWeek: null, lastUpdatedAt: null }));
  const [imports, schedules, weeks] = await Promise.all([
    db.select({ season: seasonImports.season, status: seasonImports.status, lastReadyAt: seasonImports.lastReadyAt }).from(seasonImports).where(inArray(seasonImports.season, requested)),
    db.select({ season: seasonRefreshSchedules.season, lastStatus: seasonRefreshSchedules.lastStatus }).from(seasonRefreshSchedules).where(inArray(seasonRefreshSchedules.season, requested)),
    db.select({ season: teamWeekStats.season, latestWeek: max(teamWeekStats.week) }).from(teamWeekStats).where(and(inArray(teamWeekStats.season, requested), gt(teamWeekStats.games, 0))).groupBy(teamWeekStats.season),
  ]);
  const importsBySeason = new Map(imports.map(row => [row.season, row]));
  const schedulesBySeason = new Map(schedules.map(row => [row.season, row]));
  const weeksBySeason = new Map(weeks.map(row => [row.season, row.latestWeek === null ? null : Number(row.latestWeek)]));
  return requested.map(season => {
    const imported = importsBySeason.get(season); const schedule = schedulesBySeason.get(season);
    const state = imported?.status === "importing" || schedule?.lastStatus === "running" ? "updating" : schedule?.lastStatus === "waiting_for_source" ? "waiting_for_source" : imported?.status === "ready" ? "ready" : imported ? "failed" : "unavailable";
    return { season, state, latestWeek: weeksBySeason.get(season) ?? null, lastUpdatedAt: imported?.lastReadyAt ?? null };
  });
}

const weekCache = new ShortLivedPromiseCache<FieldlineWeek[]>(30_000, 256);
const comparisonCache = new ShortLivedPromiseCache<FieldlineComparisonResult[]>(30_000, 128);
export const clearFieldlineCaches = () => { weekCache.clear(); comparisonCache.clear(); };

export async function getFieldlineWeeks(season: number, team: string, venue: FieldlineVenue = "all") {
  const normalizedTeamCode = team.trim().toUpperCase();
  const key = `${season}:${normalizedTeamCode}:${venue}`;
  return weekCache.getOrCreate(key, async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select({ week: teamWeekStats.week, games: teamWeekStats.games, opponent: teamWeekMatchups.opponent, isHome: teamWeekMatchups.isHome }).from(teamWeekStats).leftJoin(teamWeekMatchups, and(
      eq(teamWeekMatchups.season, teamWeekStats.season), eq(teamWeekMatchups.team, teamWeekStats.team), eq(teamWeekMatchups.week, teamWeekStats.week),
    )).where(and(eq(teamWeekStats.season, season), eq(teamWeekStats.team, normalizedTeamCode)));
    return rows.filter(row => row.games === 0 || venue === "all" || row.isHome === (venue === "home")).map(row => ({ week: row.week, opponent: row.opponent ?? "", isHome: row.isHome ?? null, isBye: row.games === 0 })).sort((a, b) => a.week - b.week);
  });
}

function normalizeSelection(input: FieldlineSelection) {
  const weeks = Array.from(new Set(input.weeks)).filter(week => Number.isInteger(week) && week >= 1 && week <= 18).sort((a, b) => a - b);
  return { ...input, team: input.team.trim().toUpperCase(), weeks, venue: input.venue ?? "all" as FieldlineVenue };
}

export async function compareFieldlineSelections(inputs: FieldlineSelection[]) {
  const normalized = inputs.map(normalizeSelection);
  const key = normalized.map(input => `${input.season}:${input.team}:${input.venue}:${input.weeks.join(",")}`).join("|");
  return comparisonCache.getOrCreate(key, async () => {
    if (normalized.some(input => !input.weeks.length)) return normalized.map(() => ({ available: false as const, reason: "比較するWeekを1つ以上選択してください。" }));
    const db = await getDb();
    if (!db) throw new Error("データベースに接続できません。");
    const seasons = Array.from(new Set(normalized.map(item => item.season)));
    const requestedWeeks = Array.from(new Set(normalized.flatMap(item => item.weeks)));
    const [imports, matchups, rows] = await Promise.all([
      db.select().from(seasonImports).where(inArray(seasonImports.season, seasons)),
      db.select({ season: teamWeekMatchups.season, team: teamWeekMatchups.team, week: teamWeekMatchups.week, isHome: teamWeekMatchups.isHome }).from(teamWeekMatchups).where(and(inArray(teamWeekMatchups.season, seasons), inArray(teamWeekMatchups.week, requestedWeeks))),
      db.select().from(teamWeekStats).where(and(inArray(teamWeekStats.season, seasons), inArray(teamWeekStats.week, requestedWeeks))),
    ]);
    const importsBySeason = new Map(imports.map(item => [item.season, item]));
    return normalized.map(input => {
      const imported = importsBySeason.get(input.season);
      if (!imported || (imported.status !== "ready" && imported.status !== "importing")) return { available: false as const, reason: "この年の集計データはまだありません。管理者がデータ更新を実行してください。" };
      const selectedWeeks = new Set(input.weeks);
      const venues = new Map(matchups.filter(item => item.season === input.season).map(item => [`${item.team}-${item.week}`, item.isHome]));
      const selectedRows = rows.filter(row => row.season === input.season && selectedWeeks.has(row.week) && (row.games === 0 || input.venue === "all" || venues.get(`${row.team}-${row.week}`) === (input.venue === "home")));
      const selectedTeamRows = selectedRows.filter(row => row.team === input.team);
      if (!selectedTeamRows.some(row => row.games > 0)) return { available: false as const, reason: "選択したWeekはこのチームのBye Weekのみ、または開催地条件に一致する試合がありません。" };
      const totals = aggregateRows(input.season, selectedRows as Aggregate[]);
      const records = aggregateRecords(selectedRows as Aggregate[]);
      const summaries = FIELDLINE_TEAM_CODES.map(team => {
        const stat = totals.get(team)!;
        return { team, teamName: FIELDLINE_TEAM_NAMES[team]!, games: stat.games, record: records.get(team) ?? { wins: 0, losses: 0, ties: 0 }, metrics: toMetrics(stat), ranks: {} as Record<string, number | null> };
      });
      makeRanks(summaries);
      const summary = summaries.find(item => item.team === input.team);
      return !summary || !summary.games ? { available: false as const, reason: "選択したWeekには試合データがありません。別のWeekを選択してください。" } : { available: true as const, summary };
    });
  });
}

export async function importFieldlineSeasonFromNflverse(season: number, importedBy?: string) {
  const db = await getDb();
  if (!db) throw new Error("データベースに接続できません。");
  const sourceUrl = fieldlinePbpSource(season);
  await db.insert(seasonImports).values({ season, status: "importing", sourceUrl, importedBy: importedBy ?? null, gamesImported: 0, rowsImported: 0, errorMessage: null }).onDuplicateKeyUpdate({ set: { status: "importing", sourceUrl, importedBy: importedBy ?? null, errorMessage: null } });
  try {
    const columns = ["season_type", "week", "game_id", "home_team", "away_team", "posteam", "defteam", "penalty_team", "fixed_drive", "fixed_drive_result", "drive_inside20", "total_home_score", "total_away_score", "epa", "yards_gained", "passing_yards", "rushing_yards", "pass_attempt", "complete_pass", "pass_touchdown", "interception", "sack", "fumble_lost", "third_down_converted", "third_down_failed", "two_point_attempt", "field_goal_attempt", "field_goal_result", "extra_point_attempt", "extra_point_result", "punt_attempt", "punt_inside_twenty", "penalty", "penalty_yards"];
    const file = await asyncBufferFromUrl({ url: sourceUrl });
    const rawRows = await parquetReadObjects({ file, columns }) as PbpRow[];
    const pbp = rawRows.filter(row => asString(row.season_type) === "REG" && asNumber(row.week) >= 1 && asNumber(row.week) <= 18);
    if (!pbp.length) throw new Error(`${season}年のレギュラーシーズンデータが見つかりません。`);
    const stats = new Map<string, Aggregate>();
    for (const team of FIELDLINE_TEAM_CODES) for (let week = 1; week <= 18; week += 1) stats.set(`${team}-${week}`, emptyAggregate(season, team, week));
    const get = (team: string, week: number) => stats.get(`${team}-${week}`)!;
    const gameScores = new Map<string, { week: number; home: string; away: string; homeScore: number; awayScore: number }>();
    const redZoneDrives = new Map<string, { team: string; opponent: string; week: number; entered: boolean; result: string }>();
    for (const row of pbp) {
      const week = asNumber(row.week); const offense = normalizedTeam(row.posteam); const defense = normalizedTeam(row.defteam); const gameId = asString(row.game_id);
      const home = normalizedTeam(row.home_team); const away = normalizedTeam(row.away_team);
      if (teamKnown(home) && teamKnown(away) && gameId) {
        const game = gameScores.get(gameId) ?? { week, home, away, homeScore: 0, awayScore: 0 };
        game.homeScore = Math.max(game.homeScore, asNumber(row.total_home_score)); game.awayScore = Math.max(game.awayScore, asNumber(row.total_away_score)); gameScores.set(gameId, game);
      }
      if (teamKnown(offense)) {
        const stat = get(offense, week); const passYards = asNumber(row.passing_yards); const rushYards = asNumber(row.rushing_yards); const yardsGained = asNumber(row.yards_gained);
        if (asNumber(row.two_point_attempt) !== 1) {
          stat.passYardsFor += passYards; stat.rushYardsFor += rushYards; stat.yardsFor += yardsGained;
          const epa = asFiniteNumber(row.epa); if (epa !== null) { stat.offenseEpa += epa; stat.offenseEpaPlays += 1; }
          stat.passAttempts += asNumber(row.pass_attempt) - asNumber(row.sack); stat.passCompletions += asNumber(row.complete_pass); stat.passTouchdowns += asNumber(row.pass_touchdown); stat.interceptionsThrown += asNumber(row.interception); stat.sacksAllowed += asNumber(row.sack);
          stat.thirdDownAttempts += asNumber(row.third_down_converted) + asNumber(row.third_down_failed); stat.thirdDownConversions += asNumber(row.third_down_converted);
          stat.fieldGoalAttempts += asNumber(row.field_goal_attempt); stat.fieldGoalsMade += asString(row.field_goal_result) === "made" ? 1 : 0;
          stat.extraPointAttempts += asNumber(row.extra_point_attempt); stat.extraPointsMade += asString(row.extra_point_result) === "good" ? 1 : 0;
          stat.puntAttempts += asNumber(row.punt_attempt); stat.puntsInside20 += asNumber(row.punt_inside_twenty);
        }
        const driveId = `${gameId}-${offense}-${keyString(row.fixed_drive)}`;
        const drive = redZoneDrives.get(driveId) ?? { team: offense, opponent: teamKnown(defense) ? defense : "", week, entered: false, result: "" };
        drive.entered ||= asNumber(row.drive_inside20) === 1; const result = asString(row.fixed_drive_result); if (result) drive.result = result; redZoneDrives.set(driveId, drive);
      }
      if (teamKnown(defense)) {
        const stat = get(defense, week); const passYards = asNumber(row.passing_yards); const rushYards = asNumber(row.rushing_yards); const yardsGained = asNumber(row.yards_gained);
        if (asNumber(row.two_point_attempt) !== 1) {
          stat.yardsAgainst += yardsGained; stat.passYardsAgainst += passYards; stat.rushYardsAgainst += rushYards;
          const epa = asFiniteNumber(row.epa); if (epa !== null) { stat.defenseEpaAllowed += epa; stat.defenseEpaPlays += 1; }
          stat.sacksDefense += asNumber(row.sack); stat.interceptionsDefense += asNumber(row.interception); stat.turnovers += asNumber(row.interception) + asNumber(row.fumble_lost);
          stat.opponentThirdDownAttempts += asNumber(row.third_down_converted) + asNumber(row.third_down_failed); stat.opponentThirdDownConversions += asNumber(row.third_down_converted);
        }
      }
      const penaltyTeam = normalizedTeam(row.penalty_team); if (teamKnown(penaltyTeam)) { const stat = get(penaltyTeam, week); stat.penalties += asNumber(row.penalty); stat.penaltyYards += asNumber(row.penalty_yards); }
    }
    for (const drive of Array.from(redZoneDrives.values())) if (drive.entered) {
      const offense = get(drive.team, drive.week); offense.redZoneAttempts += 1; offense.redZoneTouchdowns += drive.result === "Touchdown" ? 1 : 0;
      if (teamKnown(drive.opponent)) { const defense = get(drive.opponent, drive.week); defense.opponentRedZoneAttempts += 1; defense.opponentRedZoneTouchdowns += drive.result === "Touchdown" ? 1 : 0; }
    }
    for (const game of Array.from(gameScores.values())) {
      const home = get(game.home, game.week); const away = get(game.away, game.week);
      home.games += 1; home.pointsFor += game.homeScore; home.pointsAgainst += game.awayScore; away.games += 1; away.pointsFor += game.awayScore; away.pointsAgainst += game.homeScore;
    }
    const records = Array.from(stats.values()).map(stat => ({ ...stat, passAttempts: Math.max(0, stat.passAttempts) }));
    const matchups = Array.from(gameScores.entries()).flatMap(([gameId, game]) => [
      { season, week: game.week, team: game.home, opponent: game.away, isHome: true, gameId },
      { season, week: game.week, team: game.away, opponent: game.home, isHome: false, gameId },
    ]);
    await db.delete(teamWeekStats).where(eq(teamWeekStats.season, season));
    await db.delete(teamWeekMatchups).where(eq(teamWeekMatchups.season, season));
    for (let index = 0; index < records.length; index += 100) await db.insert(teamWeekStats).values(records.slice(index, index + 100));
    for (let index = 0; index < matchups.length; index += 100) await db.insert(teamWeekMatchups).values(matchups.slice(index, index + 100));
    await db.update(seasonImports).set({ status: "ready", gamesImported: gameScores.size, rowsImported: pbp.length, errorMessage: null, lastReadyAt: new Date() }).where(eq(seasonImports.season, season));
    clearFieldlineCaches();
    return { season, gamesImported: gameScores.size, rowsImported: pbp.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "不明なエラー";
    await db.update(seasonImports).set({ status: "failed", errorMessage: message }).where(eq(seasonImports.season, season));
    throw new Error(message);
  }
}
