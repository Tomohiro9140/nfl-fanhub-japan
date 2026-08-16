import { createHash } from "node:crypto";
import type { InsertExternalAvailabilityInsight } from "../drizzle/schema";
import { getOfficialRosterEntriesForPftMatching, replaceExternalAvailabilityInsightsForSources } from "./db";
import { TEAM_NAMES } from "./officialTeamData";

const PFT_RUMOR_MILL_URL = "https://www.nbcsports.com/nfl/profootballtalk/rumor-mill";
const PFT_SOURCE_NAME = "ProFootballTalk (NBC Sports)";
const MAX_ARTICLES_PER_REFRESH = 1;
const PFT_CRAWL_DELAY_MS = 10_000;

type RosterMatch = { teamCode: string; playerName: string };

function clean(value: string) {
  return value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&(?:#x27|#39);/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

function parsePublishedAt(html: string) {
  const raw = html.match(/"datePublished"\s*:\s*"([^"]+)"/)?.[1] ?? html.match(/Published\s+([A-Z][a-z]+\s+\d{1,2},\s+\d{4}\s+\d{1,2}:\d{2}\s+[AP]M)/)?.[1];
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseTitle(html: string) {
  const raw = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  return raw ? clean(raw).replace(/\s*\|\s*NBC Sports.*$/i, "") : null;
}

export function availabilityStatus(value: string) {
  const text = value.toLowerCase();
  if (/out for the season|out for year|season-ending|miss the rest of the season/.test(text)) return "OUT · SEASON";
  if (/few weeks|multiple weeks|extended time|miss the rest of (the )?preseason|out through preseason/.test(text)) return "OUT · MULTI-WEEK";
  if (/questionable|game-time decision/.test(text)) return "QUESTIONABLE";
  if (/limited|not ready to return|physically unavailable/.test(text)) return "LIMITED";
  return null;
}

export function pftInsightStatus(value: string) {
  const availability = availabilityStatus(value);
  if (availability) return availability;
  if (/\b(?:transactions?|roster moves?|sign(?:ed|s)?|released?|waived|waivers?|claimed|claim|trade(?:d)?|contract(?: extension)?|extensions?|activated?|designated (?:for|to return)|placed on (?:injured reserve|ir|pup))\b/i.test(value)
    && !/\b(?:autographs?|signature event|signed poster|signed memorabilia)\b/i.test(value)) return "TRANSACTION";
  return null;
}

export function parsePftAvailabilityArticle(html: string, sourceUrl: string, roster: RosterMatch[]): InsertExternalAvailabilityInsight[] {
  const title = parseTitle(html);
  const publishedAt = parsePublishedAt(html);
  const articleHtml = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1]
    ?? html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]
    ?? html;
  const content = clean(articleHtml);
  if (!title || !publishedAt) return [];
  const lower = content.toLowerCase();
  const sentences = content.split(/(?<=[.!?])\s+/);
  const now = new Date();
  return roster.flatMap((entry) => {
    const teamName = TEAM_NAMES[entry.teamCode]?.toLowerCase() ?? "";
    const teamAlias = teamName.split(" ").at(-1) ?? "";
    if (!teamName || (!lower.includes(teamName) && !lower.includes(teamAlias))) return [];
    const playerSentence = sentences.find((sentence) => sentence.toLowerCase().includes(entry.playerName.toLowerCase()));
    const statusLabel = playerSentence ? pftInsightStatus(playerSentence) : null;
    if (!statusLabel) return [];
    return [{
      externalId: createHash("sha256").update(`${entry.teamCode}:${entry.playerName}:${sourceUrl}`).digest("hex"),
      teamCode: entry.teamCode,
      playerName: entry.playerName,
      statusLabel,
      headline: title,
      sourceName: PFT_SOURCE_NAME,
      sourceUrl,
      publishedAt,
      fetchedAt: now,
    }];
  });
}

export function extractPftAvailabilityUrls(html: string) {
  const urls = Array.from(html.matchAll(/https:\/\/www\.nbcsports\.com\/nfl\/profootballtalk\/rumor-mill\/news\/([a-z0-9-]+)/gi), (match) => match[0]);
  return Array.from(new Set(urls)).filter((url) => /injur|out|unavailable|limited|miss|return|ir-|transaction|roster|sign|release|waiv|claim|trade|contract|extension|activat/.test(url)).slice(0, MAX_ARTICLES_PER_REFRESH);
}

async function fetchText(url: string) {
  const response = await fetch(url, { headers: { Accept: "text/html", "User-Agent": "NFLFanHubJapan/1.0" } });
  if (!response.ok) throw new Error(`PFT request failed: ${response.status}`);
  return response.text();
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Fetches the latest public PFT availability or transaction story, observing the site's stated crawl delay. */
export async function refreshPftAvailabilityInsights(seedUrls: string[] = []) {
  const roster = await getOfficialRosterEntriesForPftMatching();
  if (!roster.length) return { scanned: 0, stored: 0, skipped: "roster-empty" as const };
  const urls = seedUrls.length
    ? Array.from(new Set(seedUrls))
    : extractPftAvailabilityUrls(await fetchText(PFT_RUMOR_MILL_URL)).slice(0, MAX_ARTICLES_PER_REFRESH);
  const insights: InsertExternalAvailabilityInsight[] = [];
  for (let index = 0; index < urls.length; index += 1) {
    const url = urls[index];
    if (index > 0) await pause(PFT_CRAWL_DELAY_MS);
    try {
      insights.push(...parsePftAvailabilityArticle(await fetchText(url), url, roster));
    } catch (error) {
      console.warn("[pft-availability] article skipped", { url, error: error instanceof Error ? error.message : String(error) });
    }
  }
  await replaceExternalAvailabilityInsightsForSources(urls, insights);
  return { scanned: urls.length, stored: insights.length };
}
