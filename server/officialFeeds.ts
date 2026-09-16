import { createHash } from "node:crypto";
import type { InsertOfficialFeedItem } from "../drizzle/schema";
import { getOfficialFeedItems, upsertOfficialFeedItems } from "./db";
import { refreshOfficialTeamData, TEAM_NAMES } from "./officialTeamData";

const NFL_OFFICIAL_INJURY_URL = "https://www.nfl.com/injuries/";
const NFL_OFFICIAL_INACTIVES_URL = "https://www.nfl.com/injuries/";
const refreshWindowMs = 15 * 60 * 1000;
const nflInjuryMaxAgeMs = 45 * 24 * 60 * 60 * 1000;

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
  category: "news" | "injury" | "transaction";
  publishedAt: string;
};

export function needsOfficialNewsTopUp(items: Array<{ category: string }>) {
  return items.filter((item) => item.category === "news").length < 5;
}

export function shouldSynchronouslyTopUpOfficialNews(items: Array<{ category: string }>) {
  return items.length === 0;
}

const TEAM_NEWS_TOP_UP_COOLDOWN_MS = 15 * 60 * 1_000;
const lastQueuedTeamNewsTopUpAt = new Map<string, number>();

function queueOfficialTeamNewsTopUp(teamCode: string) {
  const now = Date.now();
  const lastQueuedAt = lastQueuedTeamNewsTopUpAt.get(teamCode) ?? 0;
  if (now - lastQueuedAt < TEAM_NEWS_TOP_UP_COOLDOWN_MS) return;
  lastQueuedTeamNewsTopUpAt.set(teamCode, now);
  void refreshOfficialTeamFeed(teamCode).catch((error) => {
    console.warn("[Official feed] background cache top-up unavailable", { teamCode, error: error instanceof Error ? error.message : error });
  });
}

function stripMarkup(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&eacute;/gi, "é")
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

function isViewingGuide(title: string, sourceUrl?: string) {
  const text = `${title} ${sourceUrl ?? ""}`;
  return /\b(?:how to watch|how to stream|ways to watch|ways to stream|watch live|stream live|watch on|tune in|broadcast guide|streaming guide|radio broadcast|tv schedule)\b/i.test(text);
}

function isTeamWideCampReport(title: string) {
  return /\b(?:camp|training camp)\s+(?:report|observations?|notes)\b/i.test(title);
}

function isEditorialHighlight(title: string) {
  return /\b(?:play(?:\(s\)|s)?|highlight(?:s)?) of the day\b|\btop plays?\b/i.test(title);
}

function isNonInjuryAbsence(title: string) {
  return /\b(?:holdout|hold-out|contract dispute|contract negotiation|veteran rest|coach(?:'s|es)? decision)\b/i.test(title);
}

function isInjuryRelated(title: string, sourceUrl?: string) {
  const text = `${title} ${sourceUrl ?? ""}`;
  if (isViewingGuide(title, sourceUrl) || isTeamWideCampReport(title) || isEditorialHighlight(title) || isNonInjuryAbsence(title)) return false;
  const explicitOut = /\b(?:sit|sits|sitting|ruled|remain|remains|miss|misses|missing|will be|is|was)\s+out\b|\bout\s+(?:for|with|due to|of practice|until|through)\b|\blisted as out\b|\bwill not play\b/i.test(title);
  return /\b(?:injury|injured|injuries|questionable|doubtful|inactive|inactives|medical)\b|\b(?:ir|pup)\b|practice report/i.test(text)
    || explicitOut;
}

function isTransactionRelated(title: string, sourceUrl?: string) {
  const text = `${title} ${sourceUrl ?? ""}`;
  if (isViewingGuide(title, sourceUrl) || /\b(?:autographs?|signature event|signed poster|signed memorabilia)\b/i.test(text)) return false;
  return /\b(?:transactions?|roster moves?|sign(?:ed|s)?|released?|waived|waivers?|claimed|claim|trade(?:d)?|contract(?: extension)?|extensions?|activated?|designated (?:for|to return)|placed on (?:injured reserve|ir|pup))\b/i.test(text);
}

export function classifyOfficialFeedItem(title: string, _summary: string, sourceUrl?: string): "news" | "injury" | "transaction" {
  if (isTeamWideCampReport(title) || isEditorialHighlight(title) || isNonInjuryAbsence(title)) return "news";
  if (isInjuryRelated(title, sourceUrl)) return "injury";
  return isTransactionRelated(title, sourceUrl) ? "transaction" : "news";
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
    if (Number.isNaN(published.getTime())) continue;
    const externalId = createHash("sha256").update(`${teamCode}:${url}`).digest("hex");
    results.push({
      externalId,
      teamCode,
      sourceKind: source.kind,
      sourceName: source.name,
      sourceUrl: url,
      title,
      summary,
      category: classifyOfficialFeedItem(title, rawSummary, url),
      publishedAt: published,
      fetchedAt: now,
    });
  }
  return results.sort((left, right) => right.publishedAt.getTime() - left.publishedAt.getTime()).slice(0, 24);
}

export function parseOfficialNflInjuryPage(html: string, teamCode: string, source: OfficialSource): InsertOfficialFeedItem[] {
  const aliases = teamAliases[teamCode] ?? [];
  const now = new Date();
  const results: InsertOfficialFeedItem[] = [];
  const matches = Array.from(html.matchAll(/<a[^>]+href=["']([^"']*(?:injury|injured|injuries)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi));

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

/**
 * NFL公式の Injury Report ページから、確定ステータス（Out / Doubtful / Questionable）
 * および週間練習ステータス（DNP / Did Not Participate）の注目選手を抽出
 */
export function parseOfficialNflInactivesPage(html: string, teamCode: string, now = new Date()): InsertOfficialFeedItem[] {
  const candidateNames = [
    TEAM_NAMES[teamCode],
    ...(teamAliases[teamCode] ?? []),
  ].filter((name): name is string => Boolean(name));
  if (candidateNames.length === 0) return [];

  const pattern = candidateNames.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const headerRegex = new RegExp(`<div[^>]*class="[^"]*d3-o-section-sub-title[^"]*"[^>]*>\\s*<span[^>]*>\\s*(?:${pattern})\\s*<\\/span>`, "i");
  const match = headerRegex.exec(html);
  if (!match) return [];

  const tableEnd = html.indexOf("</table>", match.index);
  const tableHtml = html.slice(match.index, tableEnd !== -1 ? tableEnd : match.index + 12000);

  const rows = tableHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  const outPlayers: string[] = [];
  const doubtfulPlayers: string[] = [];
  const questionablePlayers: string[] = [];
  const dnpPlayers: string[] = [];

  for (const row of rows) {
    const nameMatch = row.match(/<a[^>]*class="[^"]*nfl-o-cta--link[^"]*"[^>]*>([\s\S]*?)<\/a>/i)
      || row.match(/<td[^>]*scope="row"[^>]*>([\s\S]*?)<\/td>/i);
    if (!nameMatch) continue;

    const cleanName = stripMarkup(nameMatch[1]);
    if (!cleanName || cleanName.toLowerCase() === "player") continue;

    // 1. 週末の確定ステータス（Out, Doubtful, Questionable）
    if (/<td[^>]*>\s*Out\s*<\/td>/i.test(row)) {
      if (!outPlayers.some(p => p.startsWith(cleanName))) outPlayers.push(`${cleanName} (Out)`);
    } else if (/<td[^>]*>\s*Doubtful\s*<\/td>/i.test(row)) {
      if (!doubtfulPlayers.some(p => p.startsWith(cleanName))) doubtfulPlayers.push(`${cleanName} (Doubtful)`);
    } else if (/<td[^>]*>\s*Questionable\s*<\/td>/i.test(row)) {
      if (!questionablePlayers.some(p => p.startsWith(cleanName))) questionablePlayers.push(`${cleanName} (Questionable)`);
    } 
    // 2. 週前半（水・木）の週間練習レポート（DNP: Did Not Participate）
    else if (/<td[^>]*>\s*(?:DNP|Did Not Participate)\s*<\/td>/i.test(row) || /\b(?:DNP|Did Not Participate)\b/i.test(row)) {
      if (!dnpPlayers.some(p => p.startsWith(cleanName))) dnpPlayers.push(`${cleanName} (DNP)`);
    }
  }

  // 優先度順に並べて最大5名まで抽出
  const reportedPlayers = [...outPlayers, ...doubtfulPlayers, ...questionablePlayers, ...dnpPlayers].slice(0, 5);
  if (reportedPlayers.length === 0) return [];

  const summary = reportedPlayers.join(", ");
  return [{
    externalId: createHash("sha256").update(`nfl-injuries:${teamCode}:${now.toISOString().slice(0, 10)}`).digest("hex"),
    teamCode,
    sourceKind: "nfl_official",
    sourceName: "NFL Official Injury Report",
    sourceUrl: NFL_OFFICIAL_INJURY_URL,
    title: `NFL Official Injury Report · ${teamCode}`,
    summary: summary.slice(0, 560),
    category: "injury",
    publishedAt: now,
    fetchedAt: now,
  }];
}

export function parseNflArticlePublishedAt(html: string) {
  const raw = html.match(/"datePublished"\s*:\s*"([^"]+)"/)?.[1]
    ?? html.match(/datePublished\\"\s*:\s*\\"([^\\]+)\\"/)?.[1];
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isFreshNflInjuryArticle(publishedAt: Date, now = new Date()) {
  const age = now.getTime() - publishedAt.getTime();
  return age >= -24 * 60 * 60 * 1000 && age <= nflInjuryMaxAgeMs;
}

async function fetchNflArticlePublishedAt(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" } });
    if (!response.ok) return null;
    return parseNflArticlePublishedAt(await response.text());
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function retainFreshNflInjuryItems(items: InsertOfficialFeedItem[]): Promise<Array<InsertOfficialFeedItem & { publishedAt: Date; fetchedAt: Date }>> {
  const now = new Date();
  const retained: Array<InsertOfficialFeedItem & { publishedAt: Date; fetchedAt: Date }> = [];
  for (const item of items) {
    const publishedAt = await fetchNflArticlePublishedAt(item.sourceUrl);
    if (publishedAt && isFreshNflInjuryArticle(publishedAt, now)) retained.push({ ...item, publishedAt, fetchedAt: now });
  }
  return retained;
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

async function fetchOfficialHtml(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!response.ok) throw new Error(`Official page request failed: ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

export async function refreshOfficialNflInactives(options: { fetchHtml?: (url: string) => Promise<string>; saveItems?: (items: InsertOfficialFeedItem[]) => Promise<void>; now?: () => Date } = {}) {
  const html = await (options.fetchHtml ?? fetchOfficialHtml)(NFL_OFFICIAL_INACTIVES_URL);
  const now = options.now?.() ?? new Date();
  const items = supportedOfficialTeamCodes.flatMap((teamCode) => parseOfficialNflInactivesPage(html, teamCode, now));
  await (options.saveItems ?? upsertOfficialFeedItems)(items);
  return { reports: items.length };
}

export async function refreshOfficialTeamNews(teamCode: string) {
  const [teamSource] = getOfficialSources(teamCode);
  const xml = await fetchRss(teamSource.url);
  const items = parseOfficialTeamRss(xml, teamCode, teamSource);
  if (items.length === 0) throw new Error(`No RSS items found for ${teamCode}`);
  await upsertOfficialFeedItems(items);
  return items.length;
}

export async function refreshOfficialTeamFeed(teamCode: string) {
  const [teamSource, nflInjurySource] = getOfficialSources(teamCode);
  const [teamResult, injuryResult] = await Promise.allSettled([
    fetchRss(teamSource.url),
    fetchOfficialHtml(nflInjurySource.url),
  ]);
  const teamItems = teamResult.status === "fulfilled" ? parseOfficialTeamRss(teamResult.value, teamCode, teamSource) : [];
  
  let injuryItems: InsertOfficialFeedItem[] = [];
  if (injuryResult.status === "fulfilled") {
    const html = injuryResult.value;
    const injuryCandidates = parseOfficialNflInjuryPage(html, teamCode, nflInjurySource);
    const inactives = parseOfficialNflInactivesPage(html, teamCode);
    const freshInjuries = await retainFreshNflInjuryItems(injuryCandidates);
    injuryItems = [...freshInjuries, ...inactives];
  }

  const items = [...teamItems, ...injuryItems];
  if (items.length === 0) throw new Error(`No feed items found for ${teamCode}`);
  await upsertOfficialFeedItems(items);
  return items.length;
}

export async function getFreshOfficialTeamFeed(teamCode: string) {
  let items = await getOfficialFeedItems(teamCode);
  if (shouldSynchronouslyTopUpOfficialNews(items)) {
    try {
      await refreshOfficialTeamFeed(teamCode);
      items = await getOfficialFeedItems(teamCode);
    } catch (error) {
      console.warn("[Official feed] cache top-up unavailable", { teamCode, error: error instanceof Error ? error.message : error });
    }
  } else if (needsOfficialNewsTopUp(items)) {
    queueOfficialTeamNewsTopUp(teamCode);
  }
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

type OfficialFeedGroupDependencies = {
  refreshFeed?: (teamCode: string) => Promise<number>;
  refreshTeamData?: (teamCode: string) => Promise<{ games: number; roster: number }>;
};

export async function refreshOfficialTeamFeedGroup(groupIndex: number, dependencies: OfficialFeedGroupDependencies = {}) {
  const codes = scheduledTeamGroups[groupIndex];
  if (!codes) throw new Error(`Unsupported official feed group: ${groupIndex}`);
  const refreshFeed = dependencies.refreshFeed ?? refreshOfficialTeamFeed;
  const refreshTeamData = dependencies.refreshTeamData ?? refreshOfficialTeamData;
  const results = await Promise.allSettled(codes.map(async (teamCode) => {
    const [feed, teamData] = await Promise.allSettled([refreshFeed(teamCode), refreshTeamData(teamCode)]);
    if (feed.status === "rejected" && teamData.status === "rejected") throw feed.reason;
    return {
      teamCode,
      count: feed.status === "fulfilled" ? feed.value : 0,
      games: teamData.status === "fulfilled" ? teamData.value.games : 0,
      roster: teamData.status === "fulfilled" ? teamData.value.roster : 0,
      feedError: feed.status === "rejected" ? (feed.reason instanceof Error ? feed.reason.message : String(feed.reason)) : undefined,
      teamDataError: teamData.status === "rejected" ? (teamData.reason instanceof Error ? teamData.reason.message : String(teamData.reason)) : undefined,
    };
  }));
  return results.map((result, index) => result.status === "fulfilled"
    ? { ...result.value, ok: true }
    : { teamCode: codes[index], count: 0, games: 0, roster: 0, ok: false, error: result.reason instanceof Error ? result.reason.message : "Unknown error" });
}
