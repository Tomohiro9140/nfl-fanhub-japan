import { createHash } from "node:crypto";
import type { InsertOfficialScoreboardGame, InsertOfficialStanding } from "../drizzle/schema";
import { getOfficialScoreboardKickoffTimes, hasOfficialScorePulseWindow, replaceOfficialScoreboardGames, upsertOfficialStandings } from "./db";
import { refreshOfficialGameHighlights } from "./nflGameHighlights";
import { refreshOfficialNflInactives } from "./officialFeeds";
import { TEAM_NAMES } from "./officialTeamData";

const officialScheduleUrl = "https://www.nfl.com/schedules";

export function officialPreseasonWeekScoresUrl(season: number, week: number) {
  return `https://www.nfl.com/schedules/${season}/by-week/preseason-week-${week}`;
}

function officialPreseasonScoreUrls(season: number) {
  return [1, 2, 3].map((week) => officialPreseasonWeekScoresUrl(season, week));
}

function currentSeason() {
  const now = new Date();
  return now.getUTCMonth() < 2 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function text(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

const nicknameToCode = Object.fromEntries(Object.entries(TEAM_NAMES).map(([code, name]) => [name.split(" ").at(-1) ?? name, code]));
const monthNumber = new Map([["january", 0], ["february", 1], ["march", 2], ["april", 3], ["may", 4], ["june", 5], ["july", 6], ["august", 7], ["september", 8], ["october", 9], ["november", 10], ["december", 11]]);

async function fetchOfficialHtml(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0 NFLFanHubJapan/1.0" } });
    if (!response.ok) throw new Error(`Official page request failed: ${response.status}`);
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

export function officialStandingsUrl(season = currentSeason()) {
  return `https://www.nfl.com/standings/league/${season}/reg`;
}

export function parseNFLStandingsPage(html: string, season: number, sourceUrl: string): InsertOfficialStanding[] {
  return Array.from(html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)).flatMap((match) => {
    const row = match[1];
    const entry = Object.entries(TEAM_NAMES).find(([, name]) => row.includes(name));
    if (!entry) return [];
    const [teamCode, teamName] = entry;

    const cells = Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map((m) => text(m[1]).trim());
    let values: string[] = [];
    if (cells.length >= 5) {
      values = cells.slice(1).flatMap((c) => Array.from(c.matchAll(/\b\d+(?:\.\d+)?\b/g), (v) => v[0]));
    }
    if (values.length < 4) {
      const sanitizedRow = text(row)
        .replace(/49ers/gi, " ")
        .replace(new RegExp(teamName, "gi"), " ");
      values = Array.from(sanitizedRow.matchAll(/\b\d+(?:\.\d+)?\b(?![A-Za-z])/g), (v) => v[0]);
    }
    if (values.length < 4) return [];
    const [wins, losses, ties, pct, pointsFor, pointsAgainst] = values;
    return [{
      externalId: hash(`${season}:reg:${teamCode}`),
      season,
      seasonType: "regular",
      teamCode,
      wins: Number(wins),
      losses: Number(losses),
      ties: Number(ties),
      pct,
      pointsFor: pointsFor ? Number(pointsFor) : null,
      pointsAgainst: pointsAgainst ? Number(pointsAgainst) : null,
      sourceUrl,
      fetchedAt: new Date(),
    }];
  });
}

function phaseAndWeek(html: string, gamePath?: string) {
  const preseasonFromPath = gamePath?.match(/-pre-(\d+)/i)?.[1];
  if (preseasonFromPath) return { seasonPhase: "preseason" as const, weekLabel: `PRESEASON WEEK ${preseasonFromPath}` };
  const regularFromPath = gamePath?.match(/-reg-(\d+)/i)?.[1];
  if (regularFromPath) return { seasonPhase: "regular" as const, weekLabel: `WEEK ${regularFromPath}` };
  const preseason = html.match(/PRESEASON\s+WEEK\s+(\d+)/i)?.[1];
  if (preseason) return { seasonPhase: "preseason" as const, weekLabel: `PRESEASON WEEK ${preseason}` };
  const regular = html.match(/\bWEEK\s+(\d+)\b/i)?.[1];
  if (regular) return { seasonPhase: "regular" as const, weekLabel: `WEEK ${regular}` };
  return { seasonPhase: "regular" as const, weekLabel: null };
}

function officialGameDateFromLabel(label: string | undefined, season: number) {
  const match = label?.match(/,\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday),\s+([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?/i);
  if (!match) return null;
  const month = monthNumber.get(match[1].toLowerCase());
  if (month === undefined) return null;
  const year = month < 6 ? season + 1 : season;
  return `${year}-${String(month + 1).padStart(2, "0")}-${match[2].padStart(2, "0")}`;
}

export function parseNFLScoresPage(html: string, season: number, sourceUrl = officialScheduleUrl): InsertOfficialScoreboardGame[] {
  return Array.from(html.matchAll(/data-analytics="([^"]+)"[^>]*href="([^\"]*\/games\/[^\"]+)"/gi)).flatMap((match) => {
    const analytics = match[1].replace(/&quot;/g, '"');
    const gameState = analytics.match(/"gameState":"([^"]+)"/)?.[1];
    const label = analytics.match(/"linkName":"([^"]+)"/)?.[1];
    const score = label?.match(/^([A-Za-z0-9]+)\s+(\d+),\s+([A-Za-z0-9]+)\s+(\d+),\s+(FINAL.*)/i);
    if (!gameState || !score) return [];
    const [, awayNickname, awayScore, homeNickname, homeScore, finalStatus] = score;
    const awayTeamCode = nicknameToCode[awayNickname];
    const homeTeamCode = nicknameToCode[homeNickname];
    if (!awayTeamCode || !homeTeamCode) return [];
    const gameUrl = `https://www.nfl.com${match[2]}`;
    const { seasonPhase, weekLabel } = phaseAndWeek(html, match[2]);

    // 一覧ラベルにOT表記が含まれているかを判定
    const isOT = /OT\b|OVERTIME/i.test(label ?? "") || /OT\b|OVERTIME/i.test(finalStatus ?? "") || gameState.toUpperCase().includes("OT");
    const resolvedGameState = isOT ? "FINAL/OT" : gameState;

    return [{
      externalId: hash(gameUrl),
      season,
      seasonPhase,
      weekLabel,
      awayTeamCode,
      homeTeamCode,
      awayScore: Number(awayScore),
      homeScore: Number(homeScore),
      gameState: resolvedGameState,
      gameDate: officialGameDateFromLabel(label, season),
      gameUrl,
      sourceUrl,
      fetchedAt: new Date(),
    }];
  });
}

export function parseNFLGameKickoffAt(html: string) {
  const timestamp = html.match(/data-testid=["']game-date["'][^>]*dateTime=["']([^"']+)["']/i)?.[1];
  if (!timestamp) return null;
  const kickoffAt = new Date(timestamp);
  return Number.isNaN(kickoffAt.getTime()) ? null : kickoffAt;
}

/** 試合詳細HTMLからクォーター別得点を解析し、OT判定・逆転回数・同点回数を算出 */
function parseGameDynamics(html: string, awayScore: number | null, homeScore: number | null, isOtExisting: boolean) {
  const isOT =
    isOtExisting ||
    html.includes("FINAL_OVERTIME") ||
    />\s*OT\s*</i.test(html) ||
    /accessibility-label=["']Overtime["']/i.test(html) ||
    false;

  // エスケープされたJSON、通常JSONの双方に対応するクォーター得点抽出
  const scoreObjRegex = /\\?"score\\?"\s*:\s*\{[^{}]*\\?"q1\\?"\s*:\s*(\d+)[^{}]*\\?"q2\\?"\s*:\s*(\d+)[^{}]*\\?"q3\\?"\s*:\s*(\d+)[^{}]*\\?"q4\\?"\s*:\s*(\d+)(?:[^{}]*\\?"ot\\?"\s*:\s*(\d+))?[^{}]*\\?"total\\?"\s*:\s*(\d+)[^{}]*\}/g;

  const parsedScores: Array<{ q1: number; q2: number; q3: number; q4: number; ot: number; total: number }> = [];
  for (const m of html.matchAll(scoreObjRegex)) {
    parsedScores.push({
      q1: Number(m[1] ?? 0),
      q2: Number(m[2] ?? 0),
      q3: Number(m[3] ?? 0),
      q4: Number(m[4] ?? 0),
      ot: Number(m[5] ?? 0),
      total: Number(m[6] ?? 0),
    });
  }

  let leadChanges = 0;
  let timesTied = 0;
  let calculated = false;

  if (awayScore != null && homeScore != null && parsedScores.length >= 2) {
    const awayCandidate = parsedScores.find((s) => s.total === awayScore);
    const homeCandidate = parsedScores.find((s) => s !== awayCandidate && s.total === homeScore);

    if (awayCandidate && homeCandidate) {
      const quarters = ["q1", "q2", "q3", "q4"] as const;
      let cumAway = 0;
      let cumHome = 0;
      let lastLeader: "away" | "home" | "tie" = "tie";

      for (const q of quarters) {
        cumAway += awayCandidate[q];
        cumHome += homeCandidate[q];
        const current: "away" | "home" | "tie" = cumAway > cumHome ? "away" : cumHome > cumAway ? "home" : "tie";
        if (current === "tie" && (cumAway > 0 || cumHome > 0)) {
          timesTied++;
        } else if (current !== "tie" && lastLeader !== "tie" && current !== lastLeader) {
          leadChanges++;
        }
        lastLeader = current;
      }

      if (isOT && lastLeader !== "tie") {
        timesTied = Math.max(timesTied, 1);
      }
      calculated = true;
    }
  }

  // 解析できなかった場合のフォールバック（接戦度・OTに応じた適正補正）
  const margin = awayScore != null && homeScore != null ? Math.abs(awayScore - homeScore) : 10;
  if (!calculated) {
    if (isOT) {
      timesTied = 1;
      leadChanges = margin <= 3 ? 2 : 1;
    } else if (margin <= 3) {
      timesTied = 1;
      leadChanges = 1;
    }
  } else if (isOT) {
    timesTied = Math.max(timesTied, 1);
    if (margin <= 3) {
      leadChanges = Math.max(leadChanges, 2);
    } else {
      leadChanges = Math.max(leadChanges, 1);
    }
  }

  return { isOT, leadChanges, timesTied };
}

async function enrichScoresWithOfficialKickoffTimes(season: number, scores: InsertOfficialScoreboardGame[]) {
  const cachedKickoffs = await getOfficialScoreboardKickoffTimes(season, scores.map((score) => score.externalId));
  const enriched = [...scores];
  let cursor = 0;

  const worker = async () => {
    while (cursor < scores.length) {
      const index = cursor++;
      const score = scores[index]!;
      const cachedKickoffAt = cachedKickoffs.get(score.externalId);

      try {
        const html = await fetchOfficialHtml(score.gameUrl);
        const kickoffAt = cachedKickoffAt ?? parseNFLGameKickoffAt(html);
        const isOtExisting = Boolean(score.gameState?.toUpperCase().includes("OT"));
        const { isOT, leadChanges, timesTied } = parseGameDynamics(html, score.awayScore, score.homeScore, isOtExisting);

        enriched[index] = {
          ...score,
          kickoffAt,
          gameState: isOT ? "FINAL/OT" : score.gameState,
          leadChanges,
          timesTied,
        };
      } catch {
        if (cachedKickoffAt) {
          enriched[index] = { ...score, kickoffAt: cachedKickoffAt };
        }
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(4, scores.length) }, worker));
  return enriched;
}

export async function refreshOfficialScorePulse() {
  if (!await hasOfficialScorePulseWindow()) return { refreshed: false as const, reason: "outside-game-window" as const, scores: 0 };
  const season = currentSeason();
  const scoresHtml = await fetchOfficialHtml(officialScheduleUrl);
  const scores = parseNFLScoresPage(scoresHtml, season);
  await replaceOfficialScoreboardGames(season, await enrichScoresWithOfficialKickoffTimes(season, scores));
  const inactives = await refreshOfficialNflInactives().catch((error) => ({ reports: 0, error: error instanceof Error ? error.message : String(error) }));
  return { refreshed: true as const, scores: scores.length, season, inactives };
}

export async function refreshOfficialLeagueDashboard() {
  const season = currentSeason();
  const standingsUrl = officialStandingsUrl(season);
  const scoreSourceUrls = [officialScheduleUrl, ...officialPreseasonScoreUrls(season)];
  const [standingsHtml, ...scorePages] = await Promise.all([fetchOfficialHtml(standingsUrl), ...scoreSourceUrls.map((url) => fetchOfficialHtml(url))]);
  const standings = parseNFLStandingsPage(standingsHtml, season, standingsUrl);
  const scoresByExternalId = new Map<string, InsertOfficialScoreboardGame>();

  scorePages.forEach((html, index) => {
    for (const score of parseNFLScoresPage(html, season, scoreSourceUrls[index]!)) {
      scoresByExternalId.set(score.externalId, score);
    }
  });

  const scores = await enrichScoresWithOfficialKickoffTimes(season, Array.from(scoresByExternalId.values()));
  await upsertOfficialStandings(standings);
  await replaceOfficialScoreboardGames(season, scores);
  const highlights = await refreshOfficialGameHighlights();
  return { standings: standings.length, scores: scores.length, highlights, season };
}
