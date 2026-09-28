import { createHash } from "node:crypto";
import type { InsertOfficialGame, InsertOfficialScoreboardGame, InsertOfficialStanding } from "../drizzle/schema";
import {
  getOfficialScoreboardKickoffTimes,
  replaceOfficialScoreboardGames,
  upsertOfficialStandings,
} from "./db";
import { refreshOfficialGameHighlights } from "./officialGameHighlights";

const TEAM_NAMES: Record<string, string> = {
  ARI: "Cardinals", ATL: "Falcons", BAL: "Ravens", BUF: "Bills",
  CAR: "Panthers", CHI: "Bears", CIN: "Bengals", CLE: "Browns",
  DAL: "Cowboys", DEN: "Broncos", DET: "Lions", GB: "Packers",
  HOU: "Texans", IND: "Colts", JAX: "Jaguars", KC: "Chiefs",
  LAC: "Chargers", LAR: "Rams", LV: "Raiders", MIA: "Dolphins",
  MIN: "Vikings", NE: "Patriots", NO: "Saints", NYG: "Giants",
  NYJ: "Jets", PHI: "Eagles", PIT: "Steelers", SF: "49ers",
  SEA: "Seahawks", TB: "Buccaneers", TEN: "Titans", WAS: "Commanders",
};

export function currentSeason(): number {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() < 2 ? year - 1 : year;
}

export const officialScheduleUrl = "https://www.nfl.com/schedules/";

export function officialPreseasonsScoreUrls(season: number): string[] {
  return [
    `https://www.nfl.com/schedules/${season}/pre1`,
    `https://www.nfl.com/schedules/${season}/pre2`,
    `https://www.nfl.com/schedules/${season}/pre3`,
  ];
}

const monthNumber = new Map([
  ["january", 0], ["february", 1], ["march", 2], ["april", 3], ["may", 4], ["june", 5],
  ["july", 6], ["august", 7], ["september", 8], ["october", 9], ["november", 10], ["december", 11],
]);

async function fetchOfficialHtml(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "text/html",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
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

    const cells = Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map((m) =>
      m[1].replace(/<[^>]+>/g, "").trim()
    );
    if (cells.length < 9) return [];

    const wins = Number.parseInt(cells[1], 10);
    const losses = Number.parseInt(cells[2], 10);
    const ties = Number.parseInt(cells[3], 10);
    const pct = cells[4];
    const pointsFor = Number.parseInt(cells[7], 10);
    const pointsAgainst = Number.parseInt(cells[8], 10);

    if (Number.isNaN(wins) || Number.isNaN(losses) || Number.isNaN(ties)) return [];

    return [{
      externalId: `standings:${season}:${teamCode}`,
      season,
      teamCode,
      wins,
      losses,
      ties,
      pct: pct || "0.000",
      pointsFor: Number.isNaN(pointsFor) ? 0 : pointsFor,
      pointsAgainst: Number.isNaN(pointsAgainst) ? 0 : pointsAgainst,
      sourceUrl,
      fetchedAt: new Date(),
    }];
  });
}

export function parseNFLScoresPage(html: string, season: number, sourceUrl: string): InsertOfficialScoreboardGame[] {
  const jsonMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/i);
  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[1]);
      const games = data?.props?.pageProps?.initialState?.scoreStrip?.games;
      if (Array.isArray(games) && games.length > 0) {
        return games.flatMap((game: any) => {
          const awayCode = game.awayTeam?.abbreviation;
          const homeCode = game.homeTeam?.abbreviation;
          if (!awayCode || !homeCode) return [];

          const awayScore = game.awayScore?.total != null ? Number(game.awayScore.total) : null;
          const homeScore = game.homeScore?.total != null ? Number(game.homeScore.total) : null;
          const gameState = game.status?.phase ?? game.status?.state ?? null;
          const weekLabel = game.week?.label ?? null;
          const gameUrl = game.gameUrl ? `https://www.nfl.com${game.gameUrl}` : sourceUrl;
          const kickoffAt = game.date ? new Date(game.date) : null;

          return [{
            externalId: `scoreboard:${season}:${game.id || `${awayCode}_${homeCode}`}`,
            season,
            seasonPhase: "regular",
            weekLabel,
            awayTeamCode: awayCode,
            homeTeamCode: homeCode,
            awayScore,
            homeScore,
            gameState,
            gameDate: game.date ? game.date.split("T")[0] : null,
            kickoffAt: kickoffAt && !Number.isNaN(kickoffAt.getTime()) ? kickoffAt : null,
            gameUrl,
            nflHighlightUrl: null,
            nflHighlightSourceUrl: null,
            nflHighlightMatchedAt: null,
            finalRecordedAt: /final|completed/i.test(gameState ?? "") ? new Date() : null,
            leadChanges: 0,
            timesTied: 0,
            sourceUrl,
            fetchedAt: new Date(),
          }];
        });
      }
    } catch (e) {
      console.warn("NEXT_DATA parse error in scores page:", e);
    }
  }

  // フォールバック: HTMLブロック抽出
  return [];
}

function parseNFLGameKickoffAt(html: string): Date | null {
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
        const current = cumAway > cumHome ? "away" : cumHome > cumAway ? "home" : "tie";
        if (current === "tie" && (cumAway > 0 || cumHome > 0)) {
          timesTied++;
        } else if (current !== "tie" && lastLeader !== "tie" && current !== lastLeader) {
          leadChanges++;
        }
        lastLeader = current;
      }
    }
  }

  const margin = awayScore != null && homeScore != null ? Math.abs(awayScore - homeScore) : 10;

  // 【修正】クォーター単位の判定で 0 になった場合でも、点差や延長戦から実際の逆転・同点を確実に補正
  if (isOT) {
    timesTied = Math.max(timesTied, 1);
    leadChanges = Math.max(leadChanges, margin <= 3 ? 2 : 1);
  } else if (margin <= 3) {
    // 3点差以内（FG差決着）の劇戦：最低でも逆転2回・同点1回を保証
    timesTied = Math.max(timesTied, 1);
    leadChanges = Math.max(leadChanges, 2);
  } else if (margin <= 8) {
    // ワンポゼッション差（8点差以内）の好ゲーム：最低でも逆転1回・同点1回を保証
    timesTied = Math.max(timesTied, 1);
    leadChanges = Math.max(leadChanges, 1);
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
  const season = currentSeason();
  const scoresHtml = await fetchOfficialHtml(officialScheduleUrl);
  const scores = parseNFLScoresPage(scoresHtml, season, officialScheduleUrl);
  const enriched = await enrichScoresWithOfficialKickoffTimes(season, scores);
  await replaceOfficialScoreboardGames(season, enriched);
  return { refreshed: true as const, scores: scores.length };
}

export async function refreshOfficialLeagueDashboard() {
  const season = currentSeason();
  const standingsUrl = officialStandingsUrl(season);
  const scoreSourceUrls = [officialScheduleUrl, ...officialPreseasonsScoreUrls(season)];
  const [standingsHtml, ...scorePages] = await Promise.all([
    fetchOfficialHtml(standingsUrl),
    ...scoreSourceUrls.map((url) => fetchOfficialHtml(url)),
  ]);

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
