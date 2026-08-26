import { createHash } from "node:crypto";
import { PDFParse } from "pdf-parse";
import { getOfficialGameStatsCache, getOfficialScoreboardGameByUrl, saveOfficialGameStats } from "./db";
import { TEAM_NAMES } from "./officialTeamData";

const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1_000;

type GameCenterCell = { text?: string | number };
type GameCenterTable = {
  title?: string;
  table?: { columns?: Array<{ title?: string }>; rows?: GameCenterCell[][] };
};

export type GameStatsPlayer = {
  name: string;
  values: Record<string, string>;
};

export type GameStatsTeam = {
  code: string;
  name: string;
  score: number;
};

export type GameStatsPayload = {
  gameUrl: string;
  sourceUrl: string;
  away: GameStatsTeam;
  home: GameStatsTeam;
  teamStats: Array<{ key: "timeOfPossession" | "totalYards" | "thirdDown" | "fourthDown" | "passingYards" | "sacksYardsLost" | "rushingYards" | "turnovers" | "penaltiesYards"; label: string; away: string; home: string; better: "higher" | "lower" | "ratio" }>;
  players: {
    passing: { away: GameStatsPlayer[]; home: GameStatsPlayer[] };
    rushing: { away: GameStatsPlayer[]; home: GameStatsPlayer[] };
    receiving: { away: GameStatsPlayer[]; home: GameStatsPlayer[] };
    defense: { away: GameStatsPlayer[]; home: GameStatsPlayer[] };
  };
  fetchedAt: Date;
};

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeOfficialHtml(value: string) {
  return value.replaceAll("\\/", "/").replaceAll("\\\"", '"');
}

function objectAt(source: string, start: number) {
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index]!;
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  return null;
}

/** Extracts the structured table facts rendered by the official Game Center; it does not rely on layout text. */
export function parseOfficialGameCenterTables(html: string): GameCenterTable[] {
  const source = normalizeOfficialHtml(html);
  const tables: GameCenterTable[] = [];
  let cursor = 0;
  while (true) {
    const start = source.indexOf('{"table":', cursor);
    if (start < 0) break;
    const candidate = objectAt(source, start);
    if (!candidate) break;
    try {
      const parsed = JSON.parse(candidate) as GameCenterTable;
      if (parsed.title && parsed.table?.columns?.length && parsed.table.rows) tables.push(parsed);
    } catch {
      // Ignore unrelated serialized UI data; only complete stats tables are accepted.
    }
    cursor = start + 8;
  }
  return tables;
}

function codeLabel(code: string) {
  const fullName = TEAM_NAMES[code as keyof typeof TEAM_NAMES] ?? code;
  return fullName.split(" ").at(-1)?.toUpperCase() ?? code;
}

function tableForTeam(tables: GameCenterTable[], teamCode: string, category: string) {
  const labels = [teamCode.toUpperCase(), codeLabel(teamCode)];
  return tables.find((table) => labels.some((label) => table.title?.toUpperCase() === `${label} ${category}`));
}

function toPlayers(table?: GameCenterTable): GameStatsPlayer[] {
  const columns = table?.table?.columns?.map((column) => column.title?.toUpperCase() ?? "") ?? [];
  return (table?.table?.rows ?? []).flatMap((row) => {
    const name = String(row[0]?.text ?? "").trim();
    if (!name || name.toUpperCase() === "TEAM") return [];
    const values = Object.fromEntries(columns.slice(1).map((column, index) => [column, String(row[index + 1]?.text ?? "—")]));
    return [{ name, values }];
  });
}

function findLine(lines: string[], label: string) {
  return lines.find((line) => line.toUpperCase().endsWith(label.toUpperCase()));
}

function pairBeforeLabel(lines: string[], label: string) {
  const line = findLine(lines, label);
  if (!line) return ["—", "—"] as const;
  const prefix = line.slice(0, line.length - label.length).trim();
  const values = prefix.split(/\s+/).filter(Boolean);
  return [values[0] ?? "—", values[1] ?? "—"] as const;
}

function parseInterceptions(value: string) {
  return Number(value.split("-")[2] ?? 0) || 0;
}

function parseLostFumbles(value: string) {
  return Number(value.split("-")[1] ?? 0) || 0;
}

/** Parses only the official Final Team Statistics fact rows that power the requested comparison. */
export function parseOfficialGameBookTeamStats(gameBookText: string) {
  const start = gameBookText.indexOf("Final Team Statistics");
  const block = start >= 0 ? gameBookText.slice(start, start + 8_000) : gameBookText;
  const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const [awayTop, homeTop] = pairBeforeLabel(lines, "TIME OF POSSESSION");
  const [awayYards, homeYards] = pairBeforeLabel(lines, "TOTAL NET YARDS");
  const [awayThird, homeThird] = pairBeforeLabel(lines, "THIRD DOWN EFFICIENCY");
  const [awayFourth, homeFourth] = pairBeforeLabel(lines, "FOURTH DOWN EFFICIENCY");
  const [awayPass, homePass] = pairBeforeLabel(lines, "NET YARDS PASSING");
  const [awaySacks, homeSacks] = pairBeforeLabel(lines, "Times thrown - yards lost attempting to pass");
  const [awayRush, homeRush] = pairBeforeLabel(lines, "NET YARDS RUSHING");
  const [awayAttempts, homeAttempts] = pairBeforeLabel(lines, "PASS ATTEMPTS-COMPLETIONS-HAD INTERCEPTED");
  const [awayFumbles, homeFumbles] = pairBeforeLabel(lines, "FUMBLES Number and Lost");
  const [awayPenalties, homePenalties] = pairBeforeLabel(lines, "PENALTIES Number and Yards");
  return [
    { key: "timeOfPossession", label: "TIME OF POSSESSION", away: awayTop, home: homeTop, better: "higher" as const },
    { key: "totalYards", label: "TOTAL YARDS", away: awayYards, home: homeYards, better: "higher" as const },
    { key: "thirdDown", label: "THIRD DOWN", away: awayThird, home: homeThird, better: "ratio" as const },
    { key: "fourthDown", label: "FOURTH DOWN", away: awayFourth, home: homeFourth, better: "ratio" as const },
    { key: "passingYards", label: "PASSING YARDS", away: awayPass, home: homePass, better: "higher" as const },
    { key: "sacksYardsLost", label: "SACKS / YDS LOST", away: awaySacks, home: homeSacks, better: "lower" as const },
    { key: "rushingYards", label: "RUSHING YARDS", away: awayRush, home: homeRush, better: "higher" as const },
    { key: "turnovers", label: "TURNOVERS", away: String(parseInterceptions(awayAttempts) + parseLostFumbles(awayFumbles)), home: String(parseInterceptions(homeAttempts) + parseLostFumbles(homeFumbles)), better: "lower" as const },
    { key: "penaltiesYards", label: "PENALTIES / YDS", away: awayPenalties, home: homePenalties, better: "lower" as const },
  ] satisfies GameStatsPayload["teamStats"];
}

function gameBookUrlFromHtml(html: string) {
  const normalized = normalizeOfficialHtml(html);
  return normalized.match(/https:\/\/static\.www\.nfl\.com[^"'<>\s]+\/gamecenter\/[^"'<>\s]+\.pdf/i)?.[0] ?? null;
}

async function officialText(url: string) {
  const response = await fetch(url, { headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0 NFLFanHubJapan/1.0" } });
  if (!response.ok) throw new Error(`Official Game Center request failed: ${response.status}`);
  return response.text();
}

async function officialGameBookText(url: string) {
  const response = await fetch(url, { headers: { Accept: "application/pdf", "User-Agent": "Mozilla/5.0 NFLFanHubJapan/1.0" } });
  if (!response.ok) throw new Error(`Official Game Book request failed: ${response.status}`);
  const parser = new PDFParse({ data: Buffer.from(await response.arrayBuffer()) });
  try {
    return (await parser.getText()).text;
  } finally {
    await parser.destroy();
  }
}

function playerCategories(tables: GameCenterTable[], awayCode: string, homeCode: string) {
  const byCategory = (category: string) => ({
    away: toPlayers(tableForTeam(tables, awayCode, category)),
    home: toPlayers(tableForTeam(tables, homeCode, category)),
  });
  return { passing: byCategory("PASSING"), rushing: byCategory("RUSHING"), receiving: byCategory("RECEIVING"), defense: byCategory("DEFENSE") };
}

function isOfficialFinal(state: string) {
  const normalized = state.toUpperCase();
  return normalized === "FINAL" || normalized === "COMPLETED";
}

export async function getOfficialGameStats(gameUrl: string): Promise<GameStatsPayload> {
  const game = await getOfficialScoreboardGameByUrl(gameUrl);
  if (!game || !isOfficialFinal(game.gameState) || game.awayScore === null || game.homeScore === null) throw new Error("Official Game Stats are available after the final score is confirmed.");
  const gameExternalId = hash(game.gameUrl);
  const cached = await getOfficialGameStatsCache(gameExternalId);
  if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_MAX_AGE_MS) return JSON.parse(cached.payload) as GameStatsPayload;

  const html = await officialText(`${game.gameUrl}?tab=stats`);
  const sourceUrl = gameBookUrlFromHtml(html);
  if (!sourceUrl) throw new Error("Official Game Book is not available for this game yet.");
  const [gameBookText, tables] = await Promise.all([officialGameBookText(sourceUrl), Promise.resolve(parseOfficialGameCenterTables(html))]);
  const payload: GameStatsPayload = {
    gameUrl: game.gameUrl,
    sourceUrl,
    away: { code: game.awayTeamCode, name: TEAM_NAMES[game.awayTeamCode as keyof typeof TEAM_NAMES] ?? game.awayTeamCode, score: game.awayScore },
    home: { code: game.homeTeamCode, name: TEAM_NAMES[game.homeTeamCode as keyof typeof TEAM_NAMES] ?? game.homeTeamCode, score: game.homeScore },
    teamStats: parseOfficialGameBookTeamStats(gameBookText),
    players: playerCategories(tables, game.awayTeamCode, game.homeTeamCode),
    fetchedAt: new Date(),
  };
  await saveOfficialGameStats({ gameExternalId, gameUrl: game.gameUrl, sourceUrl, awayTeamCode: game.awayTeamCode, homeTeamCode: game.homeTeamCode, payload: JSON.stringify(payload), fetchedAt: payload.fetchedAt });
  return payload;
}
