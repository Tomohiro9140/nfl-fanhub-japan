import { getOfficialGamesForDaznMatching, upsertOfficialGameDaznLinks } from "./db";
import { TEAM_NAMES } from "./officialTeamData";

export const daznNflCompetitionUrl = "https://www.dazn.com/ja-JP/competition/Competition:wy3kluvb4efae1of0d8146c1";

type DaznSportsEvent = { name?: unknown; url?: unknown; startDate?: unknown; "@type"?: unknown; [key: string]: unknown };
export type DaznGameLinkCandidate = { title: string; url: string; kickoffAt: Date; sourceUrl: string };
type MatchableGame = { externalId: string; teamCode: string; opponentCode: string; kickoffAt: Date };

function flattenJsonLd(value: unknown): DaznSportsEvent[] {
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd);
  if (!value || typeof value !== "object") return [];
  const node = value as DaznSportsEvent;
  const nested = Array.isArray(node["@graph"]) ? flattenJsonLd(node["@graph"]) : [];
  return [node, ...nested];
}

function isSportsEvent(type: unknown) {
  return (Array.isArray(type) ? type : [type]).some((value) => typeof value === "string" && /SportsEvent/i.test(value));
}

/** Parses only DAZN-published JSON-LD SportsEvent records, avoiding guessed content URLs. */
export function parseDaznGameLinkCandidates(html: string, sourceUrl: string): DaznGameLinkCandidate[] {
  const candidates: DaznGameLinkCandidate[] = [];
  for (const match of Array.from(html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi))) {
    try {
      const nodes = flattenJsonLd(JSON.parse(match[1] ?? "null"));
      for (const node of nodes) {
        if (!isSportsEvent(node["@type"]) || typeof node.name !== "string" || typeof node.url !== "string" || !/^https:\/\/(?:www\.)?dazn\.com\//i.test(node.url) || typeof node.startDate !== "string") continue;
        const kickoffAt = new Date(node.startDate);
        if (Number.isNaN(kickoffAt.getTime())) continue;
        candidates.push({ title: node.name, url: node.url, kickoffAt, sourceUrl });
      }
    } catch {
      // A malformed publisher block must not stop the existing official-data refresh.
    }
  }
  return Array.from(new Map(candidates.map((candidate) => [candidate.url, candidate])).values());
}

function teamsMentioned(title: string) {
  return Object.entries(TEAM_NAMES).filter(([, teamName]) => title.toLowerCase().includes(teamName.toLowerCase())).map(([code]) => code);
}

/** A link is accepted only when both teams and a kickoff time uniquely identify an official game. */
export function matchDaznLinksToOfficialGames(candidates: DaznGameLinkCandidate[], games: MatchableGame[]) {
  const matches: Array<{ externalId: string; daznUrl: string; sourceUrl: string }> = [];
  for (const candidate of candidates) {
    const teams = teamsMentioned(candidate.title);
    if (teams.length !== 2) continue;
    const pairedRows = games.filter((game) => [game.teamCode, game.opponentCode].every((code) => teams.includes(code)) && Math.abs(new Date(game.kickoffAt).getTime() - candidate.kickoffAt.getTime()) <= 36 * 60 * 60 * 1_000);
    const uniqueGameTimes = new Set(pairedRows.map((game) => new Date(game.kickoffAt).getTime()));
    if (uniqueGameTimes.size !== 1 || pairedRows.length === 0) continue;
    for (const game of pairedRows) matches.push({ externalId: game.externalId, daznUrl: candidate.url, sourceUrl: candidate.sourceUrl });
  }
  return Array.from(new Map(matches.map((match) => [match.externalId, match])).values());
}

async function fetchDaznCompetitionPage() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(daznNflCompetitionUrl, { signal: controller.signal, headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0 NFLFanHubJapan/1.0" } });
    if (!response.ok) throw new Error(`DAZN competition request failed: ${response.status}`);
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

/** Safe no-op until DAZN publishes structured, shareable individual NFL game URLs. */
export async function refreshDaznGameLinks() {
  try {
    const html = await fetchDaznCompetitionPage();
    const candidates = parseDaznGameLinkCandidates(html, daznNflCompetitionUrl);
    const matches = matchDaznLinksToOfficialGames(candidates, await getOfficialGamesForDaznMatching());
    await upsertOfficialGameDaznLinks(matches);
    return { ok: true, candidates: candidates.length, linked: matches.length, sourceUrl: daznNflCompetitionUrl };
  } catch (error) {
    return { ok: false, candidates: 0, linked: 0, sourceUrl: daznNflCompetitionUrl, error: error instanceof Error ? error.message : String(error) };
  }
}
