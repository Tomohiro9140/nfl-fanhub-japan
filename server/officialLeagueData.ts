import { createHash } from "node:crypto";
import type { InsertOfficialScoreboardGame, InsertOfficialStanding } from "../drizzle/schema";
import { replaceOfficialScoreboardGames, upsertOfficialStandings } from "./db";
import { refreshOfficialGameHighlights } from "./nflGameHighlights";
import { TEAM_NAMES } from "./officialTeamData";

const officialScheduleUrl = "https://www.nfl.com/schedules";

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
    const rowText = text(row).replace(teamName, " ");
    const values = Array.from(rowText.matchAll(/(?<![A-Za-z])\d+(?:\.\d+)?/g), (value) => value[0]);
    if (values.length < 4) return [];
    const [wins, losses, ties, pct, pointsFor, pointsAgainst] = values;
    return [{ externalId: hash(`${season}:reg:${teamCode}`), season, seasonType: "regular", teamCode, wins: Number(wins), losses: Number(losses), ties: Number(ties), pct, pointsFor: pointsFor ? Number(pointsFor) : null, pointsAgainst: pointsAgainst ? Number(pointsAgainst) : null, sourceUrl, fetchedAt: new Date() }];
  });
}

function phaseAndWeek(html: string) {
  const preseason = html.match(/PRESEASON\s+WEEK\s+(\d+)/i)?.[1];
  if (preseason) return { seasonPhase: "preseason" as const, weekLabel: `PRESEASON WEEK ${preseason}` };
  const regular = html.match(/\bWEEK\s+(\d+)\b/i)?.[1];
  if (regular) return { seasonPhase: "regular" as const, weekLabel: `WEEK ${regular}` };
  return { seasonPhase: "regular" as const, weekLabel: null };
}

/** Extracts only the official calendar date from a completed score label; it never invents a kickoff time. */
function officialGameDateFromLabel(label: string | undefined, season: number) {
  const match = label?.match(/,\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday),\s+([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?/i);
  if (!match) return null;
  const month = monthNumber.get(match[1].toLowerCase());
  if (month === undefined) return null;
  const year = month < 6 ? season + 1 : season;
  return `${year}-${String(month + 1).padStart(2, "0")}-${match[2].padStart(2, "0")}`;
}

export function parseNFLScoresPage(html: string, season: number, sourceUrl = officialScheduleUrl): InsertOfficialScoreboardGame[] {
  const { seasonPhase, weekLabel } = phaseAndWeek(html);
  return Array.from(html.matchAll(/data-analytics="([^"]+)"[^>]*href="([^\"]*\/games\/[^\"]+)"/gi)).flatMap((match) => {
    const analytics = match[1].replace(/&quot;/g, '"');
    const gameState = analytics.match(/"gameState":"([^"]+)"/)?.[1];
    const label = analytics.match(/"linkName":"([^"]+)"/)?.[1];
    const score = label?.match(/^([A-Za-z0-9]+)\s+(\d+),\s+([A-Za-z0-9]+)\s+(\d+),\s+(FINAL|[A-Z0-9 ]+)/i);
    if (!gameState || !score) return [];
    const [, awayNickname, awayScore, homeNickname, homeScore] = score;
    const awayTeamCode = nicknameToCode[awayNickname];
    const homeTeamCode = nicknameToCode[homeNickname];
    if (!awayTeamCode || !homeTeamCode) return [];
    const gameUrl = `https://www.nfl.com${match[2]}`;
    return [{ externalId: hash(gameUrl), season, seasonPhase, weekLabel, awayTeamCode, homeTeamCode, awayScore: Number(awayScore), homeScore: Number(homeScore), gameState, gameDate: officialGameDateFromLabel(label, season), gameUrl, sourceUrl, fetchedAt: new Date() }];
  });
}

export async function refreshOfficialLeagueDashboard() {
  const season = currentSeason();
  const standingsUrl = officialStandingsUrl(season);
  const [standingsHtml, scoresHtml] = await Promise.all([fetchOfficialHtml(standingsUrl), fetchOfficialHtml(officialScheduleUrl)]);
  const standings = parseNFLStandingsPage(standingsHtml, season, standingsUrl);
  const scores = parseNFLScoresPage(scoresHtml, season);
  await upsertOfficialStandings(standings);
  await replaceOfficialScoreboardGames(season, scores);
  const highlights = await refreshOfficialGameHighlights();
  return { standings: standings.length, scores: scores.length, highlights, season };
}
