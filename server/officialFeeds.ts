import { createHash } from "node:crypto";
import type { InsertOfficialFeedItem } from "../drizzle/schema";
import { getOfficialFeedItems, upsertOfficialFeedItems } from "./db";

const NFL_OFFICIAL_INJURY_URL = "https://www.nfl.com/injuries/";
const refreshWindowMs = 15 * 60 * 1000;

const teamDomains: Record<string, string> = {
  ARI: "azcardinals.com", ATL: "atlantafalcons.com", BAL: "baltimoreravens.com", BUF: "buffalobills.com",
  CAR: "panthers.com", CHI: "chicagobears.com", CIN: "bengals.com", CLE: "clevelandbrowns.com",
  DAL: "dallascowboys.com", DEN: "denverbroncos.com", DET: "detroitlions.com", GB: "packers.com",
  HOU: "houstontexans.com", IND: "colts.com", JAX: "jaguars.com", KC: "chiefs.com", LAC: "chargers.com",
  LAR: "therams.com", LV: "raiders.com", MIA: "miamidolphins.com", MIN: "vikings.com", NE: "patriots.com",
  NO: "neworleanssaints.com", NYG: "giants.com", NYJ: "newyorkjets.com", PHI: "philadelphiaeagles.com",
  PIT: "steelers.com", SF: "49ers.com", SEA: "seahawks.com", TB: "buccaneers.com", TEN: "titansonline.com", WAS: "commanders.com",
};

const teamAliases: Record<string, string[]> = {
  ARI: ["cardinals", "arizona"], ATL: ["falcons", "atlanta"], BAL: ["ravens", "baltimore"], BUF: ["bills", "buffalo"],
  CAR: ["panthers", "carolina"], CHI: ["bears", "chicago"], CIN: ["bengals", "cincinnati"], CLE: ["browns", "cleveland"],
  DAL: ["cowboys", "dallas"], DEN: ["broncos", "denver"], DET: ["lions", "detroit"], GB: ["packers", "green bay"],
  HOU: ["texans", "houston"], IND: ["colts", "indianapolis"], JAX: ["jaguars", "jacksonville"], KC: ["chiefs", "kansas city"],
  LAC: ["chargers"], LAR: ["rams"], LV: ["raiders", "las vegas"], MIA: ["dolphins", "miami"],
  MIN: ["vikings", "minnesota"], NE: ["patriots", "new england"], NO: ["saints", "new orleans"], NYG: ["giants"],
  NYJ: ["jets"], PHI: ["eagles", "philadelphia"], PIT: ["steelers", "pittsburgh"], SF: ["49ers", "niners", "san francisco"],
  SEA: ["seahawks", "seattle"], TB: ["buccaneers", "tampa bay"], TEN: ["titans", "tennessee"], WAS: ["commanders", "washington"],
};

export const supportedOfficialTeamCodes = Object.keys(teamDomains);

export const scheduledTeamGroups = [
  ["ARI", "ATL", "BAL", "BUF", "CAR", "CHI", "CIN", "CLE"],
  ["DAL", "DEN", "DET", "GB", "HOU", "IND", "JAX", "KC"],
  ["LAC", "LAR", "LV", "MIA", "MIN", "NE", "NO", "NYG"],
  ["NYJ", "PHI", "PIT", "SF", "SEA", "TB", "TEN", "WAS"],
] as const;

export type OfficialSource = { name: string; url: string; kind: "team_official" | "nfl_official" };
export type AgentOfficialFeedItem = {
  title: string;
  summary?: string | null;
  sourceUrl: string;
  sourceName: string;
  sourceKind: "team_official" | "nfl_official";
  category: "news" | "injury";
  publishedAt: string;
};

function stripMarkup(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function field(item: string, name: string) {
  const match = item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? stripMarkup(match[1]) : "";
}

function isInjuryRelated(title: string, summary: string) {
  const text = `${title} ${summary}`;
  return /\b(?:injury|injured|questionable|doubtful|inactive|ir|pup|medical)\b|practice report|(?<!stood\s)\bout\b/i.test(text);
}

export function getOfficialSources(teamCode: string): OfficialSource[] {
  const domain = teamDomains[teamCode];
  if (!domain) throw new Error(`Unsupported NFL team code: ${teamCode}`);
  return [
    { name: `${teamCode} Official News`, url: `https://www.${domain}/rss/news`, kind: "team_official" },
    { name: "NFL Official Injury Report", url: NFL_OFFICIAL_INJURY_URL, kind: "nfl_official" },
  ];
}

export function parseOfficialTeamRss(xml: string, teamCode: string, source: OfficialSource): InsertOfficialFeedItem[] {
  const now = new Date();
  const results: InsertOfficialFeedItem[] = [];
  const itemBlocks = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) ?? [];
  for (const itemBlock of itemBlocks) {
    const item = itemBlock.replace(/^<item(?:\s[^>]*)?>/i, "").replace(/<\/item>$/i, "");
    const title = field(item, "title");
    const url = field(item, "link");
    if (!title || !url) continue;
    const rawSummary = field(item, "description") || field(item, "content:encoded");
    const summary = rawSummary.slice(0, 560) || null;
    const published = new Date(field(item, "pubDate"));
    const externalId = createHash("sha256").update(`${teamCode}:${url}`).digest("hex");
    results.push({
      externalId,
      teamCode,
      sourceKind: source.kind,
      sourceName: source.name,
      sourceUrl: url,
      title,
      summary,
      category: isInjuryRelated(title, rawSummary) ? "injury" : "news",
      publishedAt: Number.isNaN(published.getTime()) ? now : published,
      fetchedAt: now,
    });
  }
  return results.slice(0, 24);
}

/** Extracts only team-matched injury roundup links from the official NFL injuries page. */
export function parseOfficialNflInjuryPage(html: string, teamCode: string, source: OfficialSource): InsertOfficialFeedItem[] {
  const aliases = teamAliases[teamCode] ?? [];
  const now = new Date();
  const results: InsertOfficialFeedItem[] = [];
  const matches = Array.from(html.matchAll(/<a[^>]+href=["']([^"']*(?:injury|injured)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi));

  for (const match of matches) {
    const title = stripMarkup(match[2]);
    if (!title || !aliases.some((alias) => title.toLowerCase().includes(alias))) continue;
    const sourceUrl = match[1].startsWith("http") ? match[1] : `https://www.nfl.com${match[1]}`;
    results.push({
      externalId: createHash("sha256").update(`${teamCode}:${sourceUrl}`).digest("hex"),
      teamCode,
      sourceKind: "nfl_official",
      sourceName: source.name,
      sourceUrl,
      title,
      summary: null,
      category: "injury",
      publishedAt: now,
      fetchedAt: now,
    });
  }
  return results.slice(0, 3);
}

async function fetchRss(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/rss+xml, application/xml, text/xml;q=0.9", "User-Agent": "NFLFanHubJapan/1.0" },
    });
    if (!response.ok) throw new Error(`Official RSS request failed: ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

export async function refreshOfficialTeamFeed(teamCode: string) {
  const [teamSource, nflInjurySource] = getOfficialSources(teamCode);
  const [teamResult, injuryResult] = await Promise.allSettled([
    fetchRss(teamSource.url),
    fetchRss(nflInjurySource.url),
  ]);
  const items = [
    ...(teamResult.status === "fulfilled" ? parseOfficialTeamRss(teamResult.value, teamCode, teamSource) : []),
    ...(injuryResult.status === "fulfilled" ? parseOfficialNflInjuryPage(injuryResult.value, teamCode, nflInjurySource) : []),
  ];
  if (items.length === 0) throw new Error(`No RSS items found for ${teamCode}`);
  await upsertOfficialFeedItems(items);
  return items.length;
}

export async function getFreshOfficialTeamFeed(teamCode: string) {
  const items = await getOfficialFeedItems(teamCode);
  return { items, sources: getOfficialSources(teamCode) };
}

export async function cacheAgentOfficialFeed(teamCode: string, incomingItems: AgentOfficialFeedItem[]) {
  getOfficialSources(teamCode);
  const teamDomain = teamDomains[teamCode];
  const now = new Date();
  const items: InsertOfficialFeedItem[] = incomingItems.slice(0, 24).flatMap((item) => {
    let url: URL;
    try {
      url = new URL(item.sourceUrl);
    } catch {
      return [];
    }
    const isTeamDomain = url.hostname === `www.${teamDomain}` || url.hostname === teamDomain;
    const isNflDomain = url.hostname === "www.nfl.com" || url.hostname === "nfl.com";
    if ((item.sourceKind === "team_official" && !isTeamDomain) || (item.sourceKind === "nfl_official" && !isNflDomain)) return [];

    const date = new Date(item.publishedAt);
    const sourceKind = item.sourceKind;
    return [{
      externalId: createHash("sha256").update(`${teamCode}:${item.sourceUrl}`).digest("hex"),
      teamCode,
      sourceKind,
      sourceName: sourceKind === "team_official" ? `${teamCode} Official News` : "NFL Official Injury Report",
      sourceUrl: item.sourceUrl,
      title: item.title.trim(),
      summary: item.summary?.trim().slice(0, 560) || null,
      category: sourceKind === "nfl_official" ? "injury" : item.category,
      publishedAt: Number.isNaN(date.getTime()) ? now : date,
      fetchedAt: now,
    }];
  }).filter((item) => item.title && item.sourceUrl);
  await upsertOfficialFeedItems(items);
  return items.length;
}

export async function refreshOfficialTeamFeedShard(shard: number, totalShards = 4) {
  const codes = supportedOfficialTeamCodes.filter((_, index) => index % totalShards === shard);
  const results = await Promise.allSettled(codes.map(async (teamCode) => ({ teamCode, count: await refreshOfficialTeamFeed(teamCode) })));
  return results.map((result, index) => result.status === "fulfilled"
    ? { ...result.value, ok: true }
    : { teamCode: codes[index], count: 0, ok: false, error: result.reason instanceof Error ? result.reason.message : "Unknown error" });
}

export async function refreshOfficialTeamFeedGroup(groupIndex: number) {
  const codes = scheduledTeamGroups[groupIndex];
  if (!codes) throw new Error(`Unsupported official feed group: ${groupIndex}`);
  const results = await Promise.allSettled(codes.map(async (teamCode) => ({ teamCode, count: await refreshOfficialTeamFeed(teamCode) })));
  return results.map((result, index) => result.status === "fulfilled"
    ? { ...result.value, ok: true }
    : { teamCode: codes[index], count: 0, ok: false, error: result.reason instanceof Error ? result.reason.message : "Unknown error" });
}
