import { createHash } from "node:crypto";
import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import type { InsertOfficialFeedItem } from "../drizzle/schema";
import { officialGames } from "../drizzle/schema";
import { clearOfficialFeedInjuries, getDb, getOfficialFeedItems, replaceOfficialInjuriesAllTeams, upsertOfficialFeedItems } from "./db";
import { refreshOfficialTeamData, TEAM_NAMES } from "./officialTeamData";

const NFL_OFFICIAL_INJURY_DEFAULT_URL = "https://www.nfl.com/injuries/";
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

const TEAM_NICKNAMES: Record<string, string[]> = {
  ARI: ["Arizona Cardinals", "Cardinals"],
  ATL: ["Atlanta Falcons", "Falcons"],
  BAL: ["Baltimore Ravens", "Ravens"],
  BUF: ["Buffalo Bills", "Bills"],
  CAR: ["Carolina Panthers", "Panthers"],
  CHI: ["Chicago Bears", "Bears"],
  CIN: ["Cincinnati Bengals", "Bengals"],
  CLE: ["Cleveland Browns", "Browns"],
  DAL: ["Dallas Cowboys", "Cowboys"],
  DEN: ["Denver Broncos", "Broncos"],
  DET: ["Detroit Lions", "Lions"],
  GB:  ["Green Bay Packers", "Packers"],
  HOU: ["Houston Texans", "Texans"],
  IND: ["Indianapolis Colts", "Colts"],
  JAX: ["Jacksonville Jaguars", "Jaguars"],
  KC:  ["Kansas City Chiefs", "Chiefs"],
  LAC: ["Los Angeles Chargers", "Chargers"],
  LAR: ["Los Angeles Rams", "Rams"],
  LV:  ["Las Vegas Raiders", "Raiders"],
  MIA: ["Miami Dolphins", "Dolphins"],
  MIN: ["Minnesota Vikings", "Vikings"],
  NE:  ["New England Patriots", "Patriots"],
  NO:  ["New Orleans Saints", "Saints"],
  NYG: ["New York Giants", "Giants"],
  NYJ: ["New York Jets", "Jets"],
  PHI: ["Philadelphia Eagles", "Eagles"],
  PIT: ["Pittsburgh Steelers", "Steelers"],
  SF:  ["San Francisco 49ers", "49ers", "Niners"],
  SEA: ["Seattle Seahawks", "Seahawks"],
  TB:  ["Tampa Bay Buccaneers", "Buccaneers", "Bucs"],
  TEN: ["Tennessee Titans", "Titans"],
  WAS: ["Washington Commanders", "Commanders"],
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
    { name: "NFL Official Injury Report", url: NFL_OFFICIAL_INJURY_DEFAULT_URL, kind: "nfl_official" },
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

/** 1月〜2月の年またぎ試合でもNFLのシーズン年を正確に返すヘルパー */
function resolveNflSeasonYear(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month <= 2 ? year - 1 : year;
}

/**
 * 現在進行中、またはこれから行われる直近の試合から今週のシーズン年と週番号を自動特定し、
 * https://www.nfl.com/injuries/league/2026/reg2 のような実体URLを動的に生成する
 */
export async function getOfficialCurrentLeagueInjuryUrl(): Promise<string> {
  try {
    const db = await getDb();
    if (db) {
      const now = new Date();
      // 過去試合を引きずらないよう、直近6時間前〜未来の試合（昇順）を対象とする
      const activeWindowStart = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      const upcomingGames = await db
        .select({
          kickoffAt: officialGames.kickoffAt,
          weekLabel: officialGames.weekLabel,
          seasonPhase: officialGames.seasonPhase,
        })
        .from(officialGames)
        .where(gte(officialGames.kickoffAt, activeWindowStart))
        .orderBy(asc(officialGames.kickoffAt))
        .limit(1);

      let targetGame = upcomingGames[0];

      // 未来の試合がない場合（シーズン終了後など）のみ、直近終了した最後の試合をフォールバック
      if (!targetGame) {
        const pastGames = await db
          .select({
            kickoffAt: officialGames.kickoffAt,
            weekLabel: officialGames.weekLabel,
            seasonPhase: officialGames.seasonPhase,
          })
          .from(officialGames)
          .where(lt(officialGames.kickoffAt, now))
          .orderBy(desc(officialGames.kickoffAt))
          .limit(1);
        targetGame = pastGames[0];
      }

      if (targetGame?.weekLabel) {
        const weekMatch = targetGame.weekLabel.match(/\d+/);
        const weekNum = weekMatch ? parseInt(weekMatch[0], 10) : null;
        const kickoff = targetGame.kickoffAt ?? now;
        const seasonYear = resolveNflSeasonYear(kickoff);

        let phase = "reg";
        const rawPhase = (targetGame.seasonPhase ?? "").toLowerCase();
        if (rawPhase.includes("pre")) phase = "pre";
        else if (rawPhase.includes("post") || rawPhase.includes("playoff")) phase = "post";

        if (weekNum) {
          return `https://www.nfl.com/injuries/league/${seasonYear}/${phase}${weekNum}`;
        }
      }
    }
  } catch (error) {
    console.warn("[OfficialFeed] Failed to resolve current injury URL:", error);
  }
  return NFL_OFFICIAL_INJURY_DEFAULT_URL;
}

/**
 * リーグ1枚のHTMLから各チームのセクションを愛称見出しでチャンク分割し、
 * 各チームのテーブルだけを完全に分離して抽出（他チーム混入を物理的に排除）
 */
export function parseLeagueInjuriesByTeam(html: string, sourceUrl: string): InsertOfficialFeedItem[] {
  const now = new Date();
  const cleaned = html.replace(/<(?:header|nav|footer)[\s\S]*?<\/(?:header|nav|footer)>/gi, "");

  const nameToCode = new Map<string, string>();
  for (const [code, names] of Object.entries(TEAM_NICKNAMES)) {
    for (const name of names) {
      nameToCode.set(name.toLowerCase(), code);
    }
  }

  const allNamePatterns = Array.from(nameToCode.keys())
    .sort((a, b) => b.length - a.length)
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  const headerRegex = new RegExp(
    `(?:<div[^>]*class="[^"]*(?:sub-title|team-name|section-header)[^"]*"[^>]*>|<h[2-4][^>]*>|<caption[^>]*>)[^<]*(?:<span[^>]*>)?[^<]*\\b(${allNamePatterns})\\b[^<]*(?:</span>)?[^<]*</(?:div|h[2-4]|caption)>`,
    "gi"
  );

  const matches = Array.from(cleaned.matchAll(headerRegex));
  const results: InsertOfficialFeedItem[] = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const teamNameFound = match[1]?.trim().toLowerCase();
    const teamCode = nameToCode.get(teamNameFound);
    if (!teamCode) continue;

    const startPos = match.index! + match[0].length;
    const endPos = i + 1 < matches.length ? matches[i + 1].index! : cleaned.length;
    const chunk = cleaned.slice(startPos, endPos);

    const tableMatch = chunk.match(/<table[\s\S]*?<\/table>/i);
    if (!tableMatch) continue;

    const tableHtml = tableMatch[0];
    const rows = tableHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];

    const outList: string[] = [];
    const doubtfulList: string[] = [];
    const questionableList: string[] = [];
    const dnpList: string[] = [];

    for (const row of rows) {
      const nameMatch = row.match(/<a[^>]+href=["'][^"']*\/players\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/i)
        || row.match(/<td[^>]*scope="row"[^>]*>([\s\S]*?)<\/td>/i)
        || row.match(/<a[^>]*class="[^"]*nfl-o-cta--link[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
      if (!nameMatch) continue;

      const cleanName = stripMarkup(nameMatch[1]);
      if (!cleanName || cleanName.toLowerCase() === "player") continue;

      const tdMatches = Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi));
      const cells = tdMatches.map((m) => stripMarkup(m[1]).trim());

      const isOut = cells.some((c) => /^(?:Out|IR|Reserve\/Injured)$/i.test(c));
      const isDoubtful = cells.some((c) => /^Doubtful$/i.test(c));
      const isQuestionable = cells.some((c) => /^Questionable$/i.test(c));
      const isDnp = cells.some((c) => /^(?:DNP|Did Not Participate In Practice)$/i.test(c) || /\bDNP\b/i.test(c));

      if (isOut) {
        outList.push(`${cleanName} (Out)`);
      } else if (isDoubtful) {
        doubtfulList.push(`${cleanName} (Doubtful)`);
      } else if (isQuestionable) {
        questionableList.push(`${cleanName} (Questionable)`);
      } else if (isDnp) {
        dnpList.push(`${cleanName} (DNP)`);
      }
    }

    const allReported = [...outList, ...doubtfulList, ...questionableList, ...dnpList].slice(0, 6);
    if (allReported.length > 0) {
      const summary = allReported.join(", ");
      results.push({
        externalId: createHash("sha256").update(`nfl-injuries:${teamCode}:${now.toISOString().slice(0, 10)}`).digest("hex"),
        teamCode,
        sourceKind: "nfl_official",
        sourceName: "NFL Official Injury Report",
        sourceUrl,
        title: `NFL Official Injury Report · ${teamCode}`,
        summary: summary.slice(0, 560),
        category: "injury",
        publishedAt: now,
        fetchedAt: now,
      });
    }
  }

  return results;
}

let lastLeagueInjuriesRefreshedAt = 0;
const LEAGUE_INJURIES_CACHE_TTL_MS = 30 * 60 * 1000;

export async function refreshAllOfficialInjuries(): Promise<number> {
  const url = await getOfficialCurrentLeagueInjuryUrl();
  const html = await fetchOfficialHtml(url);
  const items = parseLeagueInjuriesByTeam(html, url);
  await replaceOfficialInjuriesAllTeams(items);
  lastLeagueInjuriesRefreshedAt = Date.now();
  return items.length;
}

export function ensureOfficialInjuriesFresh() {
  const now = Date.now();
  if (now - lastLeagueInjuriesRefreshedAt > LEAGUE_INJURIES_CACHE_TTL_MS) {
    lastLeagueInjuriesRefreshedAt = now;
    void refreshAllOfficialInjuries().catch((error) => {
      console.warn("[Official Injuries] Background sync failed:", error);
    });
  }
}

export async function refreshOfficialNflInactives(options: { fetchHtml?: (url: string) => Promise<string>; saveItems?: (items: InsertOfficialFeedItem[]) => Promise<void>; now?: () => Date } = {}) {
  const count = await refreshAllOfficialInjuries();
  return { reports: count };
}

export function parseOfficialNflInactivesPage(
  html: string,
  teamCode: string,
  now = new Date(),
  sourceUrl = NFL_OFFICIAL_INJURY_DEFAULT_URL
): InsertOfficialFeedItem[] {
  const allItems = parseLeagueInjuriesByTeam(html, sourceUrl);
  return allItems.filter((item) => item.teamCode === teamCode);
}

export function parseOfficialNflInjuryPage(html: string, teamCode: string, source: OfficialSource): InsertOfficialFeedItem[] {
  return [];
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

export async function refreshOfficialTeamNews(teamCode: string) {
  const [teamSource] = getOfficialSources(teamCode);
  const xml = await fetchRss(teamSource.url);
  const items = parseOfficialTeamRss(xml, teamCode, teamSource);
  if (items.length === 0) throw new Error(`No RSS items found for ${teamCode}`);
  await upsertOfficialFeedItems(items);
  return items.length;
}

export async function refreshOfficialTeamFeed(teamCode: string) {
  const [teamSource] = getOfficialSources(teamCode);

  const xml = await fetchRss(teamSource.url);
  const teamItems = parseOfficialTeamRss(xml, teamCode, teamSource);
  if (teamItems.length > 0) {
    await upsertOfficialFeedItems(teamItems);
  }

  await refreshAllOfficialInjuries();
  return teamItems.length;
}

export async function getFreshOfficialTeamFeed(teamCode: string) {
  ensureOfficialInjuriesFresh();

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
