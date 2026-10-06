import { asyncBufferFromUrl, parquetReadObjects } from "hyparquet";
import { and, eq, gt, inArray, max } from "drizzle-orm";
import { officialGames, seasonImports, seasonRefreshSchedules, teamWeekMatchups, teamWeekStats } from "../drizzle/schema";
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
export type FieldlineWeek = { week: number; opponent: string; isHome: boolean | null; isBye: boolean; hasStats: boolean };
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

  offensePassEpa: number; offensePassEpaPlays: number;
  offenseRushEpa: number; offenseRushEpaPlays: number;
  offenseSuccessPlays: number; offenseTotalPlays: number;
  giveaways: number;
  defensePassEpaAllowed: number; defensePassEpaPlays: number;
  defenseRushEpaAllowed: number; defenseRushEpaPlays: number;
  defenseSuccessPlays: number; defenseTotalPlays: number;
  netPuntYards: number;
  startYardlineSum: number; startDriveCount: number;
};

export type FieldlineSummary = {
  team: string;
  teamName: string;
  games: number;
  record: { wins: number; losses: number; ties: number };
  metrics: Record<string, number | null>;
  ranks: Record<string, number | null>;
};

// ★ allSummaries を追加して全32チームのランキング情報も提供可能に拡張
export type FieldlineComparisonResult =
  | { available: false; reason: string }
  | { available: true; summary: FieldlineSummary; allSummaries: FieldlineSummary[] };

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

export function fieldlineNetPassingYardsForPlay(row: PbpRow) {
  const sackLoss = asNumber(row.sack) === 1 ? Math.max(0, -asNumber(row.yards_gained)) : 0;
  return asNumber(row.passing_yards) - sackLoss;
}

export function fieldlineTotalYardsForPlay(row: PbpRow) {
  return fieldlineNetPassingYardsForPlay(row) + asNumber(row.rushing_yards) + asNumber(row.lateral_rushing_yards);
}

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

    offensePassEpa: 0, offensePassEpaPlays: 0,
    offenseRushEpa: 0, offenseRushEpaPlays: 0,
    offenseSuccessPlays: 0, offenseTotalPlays: 0,
    giveaways: 0,
    defensePassEpaAllowed: 0, defensePassEpaPlays: 0,
    defenseRushEpaAllowed: 0, defenseRushEpaPlays: 0,
    defenseSuccessPlays: 0, defenseTotalPlays: 0,
    netPuntYards: 0,
    startYardlineSum: 0, startDriveCount: 0,
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
  "offensePassEpa", "offensePassEpaPlays", "offenseRushEpa", "offenseRushEpaPlays",
  "offenseSuccessPlays", "offenseTotalPlays", "giveaways",
  "defensePassEpaAllowed", "defensePassEpaPlays", "defenseRushEpaAllowed", "defenseRushEpaPlays",
  "defenseSuccessPlays", "defenseTotalPlays", "netPuntYards",
  "startYardlineSum", "startDriveCount",
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
    pointsPerGame: stat.games ? stat.pointsFor / games : null,
    yardsPerGame: stat.games ? stat.yardsFor / games : null,
    passYardsPerGame: stat.games ? stat.passYardsFor / games : null,
    rushYardsPerGame: stat.games ? stat.rushYardsFor / games : null,
    passEpaPerPlay: stat.offensePassEpaPlays ? stat.offensePassEpa / stat.offensePassEpaPlays : null,
    rushEpaPerPlay: stat.offenseRushEpaPlays ? stat.offenseRushEpa / stat.offenseRushEpaPlays : null,
    successRate: stat.offenseTotalPlays ? stat.offenseSuccessPlays / stat.offenseTotalPlays : null,
    passerRating: passerRating(stat),
    thirdDownPct: stat.thirdDownAttempts ? stat.thirdDownConversions / stat.thirdDownAttempts : null,
    redZoneTdPct: stat.redZoneAttempts ? stat.redZoneTouchdowns / stat.redZoneAttempts : null,
    sacksAllowed: stat.games ? stat.sacksAllowed : null,
    giveaways: stat.games ? stat.giveaways : null,

    pointsAllowedPerGame: stat.games ? stat.pointsAgainst / games : null,
    yardsAllowedPerGame: stat.games ? stat.yardsAgainst / games : null,
    passYardsAllowedPerGame: stat.games ? stat.passYardsAgainst / games : null,
    rushYardsAllowedPerGame: stat.games ? stat.rushYardsAgainst / games : null,
    opponentPassEpaPerPlay: stat.defensePassEpaPlays ? stat.defensePassEpaAllowed / stat.defensePassEpaPlays : null,
    opponentRushEpaPerPlay: stat.defenseRushEpaPlays ? stat.defenseRushEpaAllowed / stat.defenseRushEpaPlays : null,
    opponentSuccessRate: stat.defenseTotalPlays ? stat.defenseSuccessPlays / stat.defenseTotalPlays : null,
    opponentThirdDownPct: stat.opponentThirdDownAttempts ? stat.opponentThirdDownConversions / stat.opponentThirdDownAttempts : null,
    opponentRedZoneTdPct: stat.opponentRedZoneAttempts ? stat.opponentRedZoneTouchdowns / stat.opponentRedZoneAttempts : null,
    sacksDefense: stat.games ? stat.sacksDefense : null,
    interceptionsDefense: stat.games ? stat.interceptionsDefense : null,
    turnovers: stat.games ? stat.turnovers : null,

    fieldGoalPct: stat.fieldGoalAttempts ? stat.fieldGoalsMade / stat.fieldGoalAttempts : null,
    extraPointPct: stat.extraPointAttempts ? stat.extraPointsMade / stat.extraPointAttempts : null,
    puntInside20Pct: stat.puntAttempts ? stat.puntsInside20 / stat.puntAttempts : null,
    netPuntAvg: stat.puntAttempts ? stat.netPuntYards / stat.puntAttempts : null,
    startFieldPos: stat.startDriveCount ? stat.startYardlineSum / stat.startDriveCount : null,

    penalties: stat.games ? stat.penalties : null,
    penaltyYardsPerGame: stat.games ? stat.penaltyYards / games : null,
  };
}

const metricRules: [string, "asc" | "desc"][] = [
  ["pointsPerGame", "desc"], ["yardsPerGame", "desc"], ["passYardsPerGame", "desc"], ["rushYardsPerGame", "desc"],
  ["passEpaPerPlay", "desc"], ["rushEpaPerPlay", "desc"], ["successRate", "desc"], ["passerRating", "desc"],
  ["thirdDownPct", "desc"], ["redZoneTdPct", "desc"], ["sacksAllowed", "asc"], ["giveaways", "asc"],

  ["pointsAllowedPerGame", "asc"], ["yardsAllowedPerGame", "asc"], ["passYardsAllowedPerGame", "asc"], ["rushYardsAllowedPerGame", "asc"],
  ["opponentPassEpaPerPlay", "asc"], ["opponentRushEpaPerPlay", "asc"], ["opponentSuccessRate", "asc"],
  ["opponentThirdDownPct", "asc"], ["opponentRedZoneTdPct", "asc"], ["sacksDefense", "desc"], ["interceptionsDefense", "desc"], ["turnovers", "desc"],

  ["fieldGoalPct", "desc"], ["extraPointPct", "desc"], ["puntInside20Pct", "desc"], ["netPuntAvg", "desc"], ["startFieldPos", "desc"],

  ["penalties", "asc"], ["penaltyYardsPerGame", "asc"],
];

function makeRanks(summaries: FieldlineSummary[]) {
  for (const [metric, direction] of metricRules) {
    const valid = summaries
      .filter((item) => item.metrics[metric] !== null)
      .sort((a, b) => {
        const left = a.metrics[metric] as number;
        const right = b.metrics[metric] as number;
        return direction === "desc" ? right - left : left - right;
      });

    let currentRank = 1;
    for (let i = 0; i < valid.length; i++) {
      if (i > 0) {
        const prevVal = valid[i - 1].metrics[metric] as number;
        const currVal = valid[i].metrics[metric] as number;
        if (Math.abs(currVal - prevVal) >= 0.00001) {
          currentRank = i + 1;
        }
      }
      valid[i].ranks[metric] = currentRank;
    }
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

    const scheduledGames = await db.select({
      weekLabel: officialGames.weekLabel,
      opponentCode: officialGames.opponentCode,
      homeAway: officialGames.homeAway,
    }).from(officialGames).where(and(
      eq(officialGames.teamCode, normalizedTeamCode),
      eq(officialGames.seasonPhase, "regular")
    ));

    const scheduleByWeek = new Map<number, { opponent: string; isHome: boolean }>();
    for (const game of scheduledGames) {
      const match = game.weekLabel?.match(/WEEK\s*(\d+)/i);
      if (match) {
        const weekNum = Number.parseInt(match[1], 10);
        if (weekNum >= 1 && weekNum <= 18) {
          scheduleByWeek.set(weekNum, {
            opponent: game.opponentCode ?? "",
            isHome: game.homeAway === "home",
          });
        }
      }
    }

    const statsRows = await db.select({
      week: teamWeekStats.week,
      games: teamWeekStats.games,
    }).from(teamWeekStats).where(and(
      eq(teamWeekStats.season, season),
      eq(teamWeekStats.team, normalizedTeamCode)
    ));
    const statsByWeek = new Map<number, number>();
    for (const row of statsRows) {
      statsByWeek.set(row.week, row.games);
    }

    const matchupsByWeek = new Map<number, { opponent: string; isHome: boolean | null }>();
    if (scheduleByWeek.size === 0) {
      const matchupsRows = await db.select({
        week: teamWeekMatchups.week,
        opponent: teamWeekMatchups.opponent,
        isHome: teamWeekMatchups.isHome,
      }).from(teamWeekMatchups).where(and(
        eq(teamWeekMatchups.season, season),
        eq(teamWeekMatchups.team, normalizedTeamCode)
      ));
      for (const row of matchupsRows) {
        matchupsByWeek.set(row.week, {
          opponent: row.opponent ?? "",
          isHome: row.isHome ?? null,
        });
      }
    }

    const result: FieldlineWeek[] = [];
    for (let w = 1; w <= 18; w++) {
      const schedule = scheduleByWeek.get(w);
      const fallbackMatchup = matchupsByWeek.get(w);
      const opponent = schedule?.opponent ?? fallbackMatchup?.opponent ?? "";
      const isHome = schedule ? schedule.isHome : (fallbackMatchup?.isHome ?? null);

      let isBye = false;
      if (scheduleByWeek.size > 0) {
        isBye = !schedule;
      } else {
        const games = statsByWeek.get(w) ?? 0;
        isBye = games === 0 && !opponent;
      }

      const gamesCount = statsByWeek.get(w) ?? 0;
      const hasStats = gamesCount > 0;

      if (venue !== "all" && !isBye && isHome !== null && isHome !== (venue === "home")) {
        continue;
      }

      result.push({
        week: w,
        opponent,
        isHome,
        isBye,
        hasStats,
      });
    }

    return result.sort((a, b) => a.week - b.week);
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
      return !summary || !summary.games
        ? { available: false as const, reason: "選択したWeekには試合データがありません。別のWeekを選択してください。" }
        : { available: true as const, summary, allSummaries: summaries };
    });
  });
}

export async function importFieldlineSeasonFromNflverse(season: number, importedBy?: string) {
  const db = await getDb();
  if (!db) throw new Error("データベースに接続できません。");
  const sourceUrl = fieldlinePbpSource(season);
  await db.insert(seasonImports).values({ season, status: "importing", sourceUrl, importedBy: importedBy ?? null, gamesImported: 0, rowsImported: 0, errorMessage: null }).onDuplicateKeyUpdate({ set: { status: "importing", sourceUrl, importedBy: importedBy ?? null, errorMessage: null } });
  try {
    const columns = [
      "season_type", "week", "game_id", "home_team", "away_team", "posteam", "defteam", "penalty_team",
      "fixed_drive", "fixed_drive_result", "drive_inside20", "total_home_score", "total_away_score", "epa",
      "yards_gained", "passing_yards", "rushing_yards", "lateral_rushing_yards", "pass_attempt", "complete_pass",
      "pass_touchdown", "interception", "sack", "fumble_lost", "third_down_converted", "third_down_failed",
      "two_point_attempt", "field_goal_attempt", "field_goal_result", "extra_point_attempt", "extra_point_result",
      "punt_attempt", "punt_inside_twenty", "penalty", "penalty_yards",
      "play_type", "success", "kick_distance", "return_yards", "touchback", "yardline_100"
    ];
    const file = await asyncBufferFromUrl({ url: sourceUrl });
    const rawRows = await parquetReadObjects({ file, columns }) as PbpRow[];
    const pbp = rawRows.filter(row => asString(row.season_type) === "REG" && asNumber(row.week) >= 1 && asNumber(row.week) <= 18);
    if (!pbp.length) throw new Error(`${season}年のレギュラーシーズンデータが見つかりません。`);
    
    const stats = new Map<string, Aggregate>();
    for (const team of FIELDLINE_TEAM_CODES) for (let week = 1; week <= 18; week += 1) stats.set(`${team}-${week}`, emptyAggregate(season, team, week));
    const get = (team: string, week: number) => stats.get(`${team}-${week}`)!;
    
    const gameScores = new Map<string, { week: number; home: string; away: string; homeScore: number; awayScore: number }>();
    const redZoneDrives = new Map<string, { team: string; opponent: string; week: number; entered: boolean; result: string }>();
    const driveStarts = new Set<string>();

    for (const row of pbp) {
      const week = asNumber(row.week); const offense = normalizedTeam(row.posteam); const defense = normalizedTeam(row.defteam); const gameId = asString(row.game_id);
      const home = normalizedTeam(row.home_team); const away = normalizedTeam(row.away_team);
      const playType = asString(row.play_type);
      const isTwoPoint = asNumber(row.two_point_attempt) === 1;

      if (teamKnown(home) && teamKnown(away) && gameId) {
        const game = gameScores.get(gameId) ?? { week, home, away, homeScore: 0, awayScore: 0 };
        game.homeScore = Math.max(game.homeScore, asNumber(row.total_home_score)); game.awayScore = Math.max(game.awayScore, asNumber(row.total_away_score)); gameScores.set(gameId, game);
      }

      if (teamKnown(offense)) {
        const stat = get(offense, week);
        const netPassYards = fieldlineNetPassingYardsForPlay(row);
        const rushYards = asNumber(row.rushing_yards) + asNumber(row.lateral_rushing_yards);
        const totalYards = fieldlineTotalYardsForPlay(row);

        if (!isTwoPoint) {
          stat.passYardsFor += netPassYards; stat.rushYardsFor += rushYards; stat.yardsFor += totalYards;
          const epa = asFiniteNumber(row.epa);
          if (epa !== null) {
            stat.offenseEpa += epa; stat.offenseEpaPlays += 1;
            if (playType === "pass" || asNumber(row.pass_attempt) === 1 || asNumber(row.sack) === 1) {
              stat.offensePassEpa += epa; stat.offensePassEpaPlays += 1;
            } else if (playType === "run") {
              stat.offenseRushEpa += epa; stat.offenseRushEpaPlays += 1;
            }
          }

          if (playType === "pass" || playType === "run") {
            stat.offenseTotalPlays += 1;
            if (asNumber(row.success) === 1) stat.offenseSuccessPlays += 1;
          }

          stat.giveaways += asNumber(row.interception) + asNumber(row.fumble_lost);
          stat.passAttempts += asNumber(row.pass_attempt) - asNumber(row.sack);
          stat.passCompletions += asNumber(row.complete_pass);
          stat.passTouchdowns += asNumber(row.pass_touchdown);
          stat.interceptionsThrown += asNumber(row.interception);
          stat.sacksAllowed += asNumber(row.sack);
          stat.thirdDownAttempts += asNumber(row.third_down_converted) + asNumber(row.third_down_failed);
          stat.thirdDownConversions += asNumber(row.third_down_converted);
          stat.fieldGoalAttempts += asNumber(row.field_goal_attempt);
          stat.fieldGoalsMade += asString(row.field_goal_result) === "made" ? 1 : 0;
          stat.extraPointAttempts += asNumber(row.extra_point_attempt);
          stat.extraPointsMade += asString(row.extra_point_result) === "good" ? 1 : 0;
          stat.puntAttempts += asNumber(row.punt_attempt);
          stat.puntsInside20 += asNumber(row.punt_inside_twenty);

          if (asNumber(row.punt_attempt) === 1) {
            const kickDist = asNumber(row.kick_distance);
            const retYards = asNumber(row.return_yards);
            const isTouchback = asNumber(row.touchback) === 1;
            const netYds = isTouchback ? Math.max(0, kickDist - 20) : Math.max(0, kickDist - retYards);
            stat.netPuntYards += netYds;
          }
        }

        const driveKey = `${gameId}-${offense}-${keyString(row.fixed_drive)}`;
        if (keyString(row.fixed_drive) && !driveStarts.has(driveKey) && row.yardline_100 !== null && row.yardline_100 !== undefined) {
          driveStarts.add(driveKey);
          const startOwnYard = 100 - asNumber(row.yardline_100);
          stat.startYardlineSum += startOwnYard;
          stat.startDriveCount += 1;
        }

        const drive = redZoneDrives.get(driveKey) ?? { team: offense, opponent: teamKnown(defense) ? defense : "", week, entered: false, result: "" };
        drive.entered ||= asNumber(row.drive_inside20) === 1;
        const result = asString(row.fixed_drive_result);
        if (result) drive.result = result;
        redZoneDrives.set(driveKey, drive);
      }

      if (teamKnown(defense)) {
        const stat = get(defense, week);
        const netPassYards = fieldlineNetPassingYardsForPlay(row);
        const rushYards = asNumber(row.rushing_yards) + asNumber(row.lateral_rushing_yards);
        const totalYards = fieldlineTotalYardsForPlay(row);

        if (!isTwoPoint) {
          stat.yardsAgainst += totalYards; stat.passYardsAgainst += netPassYards; stat.rushYardsAgainst += rushYards;
          const epa = asFiniteNumber(row.epa);
          if (epa !== null) {
            stat.defenseEpaAllowed += epa; stat.defenseEpaPlays += 1;
            if (playType === "pass" || asNumber(row.pass_attempt) === 1 || asNumber(row.sack) === 1) {
              stat.defensePassEpaAllowed += epa; stat.defensePassEpaPlays += 1;
            } else if (playType === "run") {
              stat.defenseRushEpaAllowed += epa; stat.defenseRushEpaPlays += 1;
            }
          }

          if (playType === "pass" || playType === "run") {
            stat.defenseTotalPlays += 1;
            if (asNumber(row.success) === 1) stat.defenseSuccessPlays += 1;
          }

          stat.sacksDefense += asNumber(row.sack);
          stat.interceptionsDefense += asNumber(row.interception);
          stat.turnovers += asNumber(row.interception) + asNumber(row.fumble_lost);
          stat.opponentThirdDownAttempts += asNumber(row.third_down_converted) + asNumber(row.third_down_failed);
          stat.opponentThirdDownConversions += asNumber(row.third_down_converted);
        }
      }

      const penaltyTeam = normalizedTeam(row.penalty_team);
      if (teamKnown(penaltyTeam)) {
        const stat = get(penaltyTeam, week);
        stat.penalties += asNumber(row.penalty);
        stat.penaltyYards += asNumber(row.penalty_yards);
      }
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
