import { createHash } from "node:crypto";
import type { InsertOfficialFeedItem } from "../drizzle/schema";
import { upsertOfficialFeedItems } from "./db";

const MAX_ITEMS_PER_SOURCE_TEAM = 3; // 15件表示のクォータに対応できるよう 2 から 3 に拡張
const MAX_LOCAL_ITEMS_PER_TEAM = 5;  // SB Nation (Local) の最大保持件数
const EXTERNAL_NEWS_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1_000;

export const externalNewsSources = [
  { kind: "pft" as const, name: "PFT · NBC SPORTS", url: "https://www.nbcsports.com/profootballtalk.rss" },
  { kind: "cbs" as const, name: "CBS SPORTS", url: "https://www.cbssports.com/rss/headlines/nfl/" },
] as const;

// 全32チームの SB Nation フィードマッピング
const LOCAL_NEWS_SOURCES: Record<string, { name: string; url: string }> = {
  BUF: { name: "Buffalo Rumblings", url: "https://www.buffalorumblings.com/rss/index.xml" },
  MIA: { name: "The Phinsider", url: "https://www.thephinsider.com/rss/index.xml" },
  NE: { name: "Pats Pulpit", url: "https://www.patspulpit.com/rss/index.xml" },
  NYJ: { name: "Gang Green Nation", url: "https://www.ganggreennation.com/rss/index.xml" },
  BAL: { name: "Baltimore Beatdown", url: "https://www.baltimorebeatdown.com/rss/index.xml" },
  CIN: { name: "Cincy Jungle", url: "https://www.cincyjungle.com/rss/index.xml" },
  CLE: { name: "Dawgs By Nature", url: "https://www.dawgsbynature.com/rss/index.xml" },
  PIT: { name: "Behind the Steel Curtain", url: "https://www.behindthesteelcurtain.com/rss/index.xml" },
  HOU: { name: "Battle Red Blog", url: "https://www.battleredblog.com/rss/index.xml" },
  IND: { name: "Stampede Blue", url: "https://www.stampedeblue.com/rss/index.xml" },
  JAX: { name: "Big Cat Country", url: "https://www.bigcatcountry.com/rss/index.xml" },
  TEN: { name: "Music City Miracles", url: "https://www.musiccitymiracles.com/rss/index.xml" },
  DEN: { name: "Mile High Report", url: "https://www.milehighreport.com/rss/index.xml" },
  KC: { name: "Arrowhead Pride", url: "https://www.arrowheadpride.com/rss/index.xml" },
  LV: { name: "Silver and Black Pride", url: "https://www.silverandblackpride.com/rss/index.xml" },
  LAC: { name: "Bolts From The Blue", url: "https://www.boltsfromtheblue.com/rss/index.xml" },
  DAL: { name: "Blogging The Boys", url: "https://www.bloggingtheboys.com/rss/index.xml" },
  NYG: { name: "Big Blue View", url: "https://www.bigblueview.com/rss/index.xml" },
  PHI: { name: "Bleeding Green Nation", url: "https://www.bleedinggreennation.com/rss/index.xml" },
  WAS: { name: "Hogs Haven", url: "https://www.hogshaven.com/rss/index.xml" },
  CHI: { name: "Windy City Gridiron", url: "https://www.windycitygridiron.com/rss/index.xml" },
  DET: { name: "Pride Of Detroit", url: "https://www.prideofdetroit.com/rss/index.xml" },
  GB: { name: "Acme Packing Company", url: "https://www.acmepackingcompany.com/rss/index.xml" },
  MIN: { name: "Daily Norseman", url: "https://www.dailynorseman.com/rss/index.xml" },
  ATL: { name: "The Falcoholic", url: "https://www.thefalcoholic.com/rss/index.xml" },
  CAR: { name: "Cat Scratch Reader", url: "https://www.catscratchreader.com/rss/index.xml" },
  NO: { name: "Canal Street Chronicles", url: "https://www.canalstreetchronicles.com/rss/index.xml" },
  TB: { name: "Bucs Nation", url: "https://www.bucsnation.com/rss/index.xml" },
  ARI: { name: "Revenge of the Birds", url: "https://www.revengeofthebirds.com/rss/index.xml" },
  LAR: { name: "Turf Show Times", url: "https://www.turfshowtimes.com/rss/index.xml" },
  SF: { name: "Niners Nation", url: "https://www.ninersnation.com/rss/index.xml" },
  SEA: { name: "Field Gulls", url: "https://www.fieldgulls.com/rss/index.xml" },
};

const teamMatchers: Record<string, string[]> = {
  ARI: ["arizona cardinals", "cardinals"], ATL: ["atlanta falcons", "falcons"], BAL: ["baltimore ravens", "ravens"], BUF: ["buffalo bills", "bills"],
  CAR: ["carolina panthers", "panthers"], CHI: ["chicago bears", "bears"], CIN: ["cincinnati bengals", "bengals"], CLE: ["cleveland browns", "browns"],
  DAL: ["dallas cowboys", "cowboys"], DEN: ["denver broncos", "broncos"], DET: ["detroit lions", "lions"], GB: ["green bay packers", "packers"],
  HOU: ["houston texans", "texans"], IND: ["indianapolis colts", "colts"], JAX: ["jacksonville jaguars", "jaguars"], KC: ["kansas city chiefs", "chiefs"],
  LAC: ["los angeles chargers", "chargers"], LAR: ["los angeles rams", "rams"], LV: ["las vegas raiders", "raiders"], MIA: ["miami dolphins", "dolphins"],
  MIN: ["minnesota vikings", "vikings"], NE: ["new england patriots", "patriots"], NO: ["new orleans saints", "saints"], NYG: ["new york giants", "giants"],
  NYJ: ["new york jets", "jets"], PHI: ["philadelphia eagles", "eagles"], PIT: ["pittsburgh steelers", "steelers"], SF: ["san francisco 49ers", "49ers", "niners"],
  SEA: ["seattle seahawks", "seahawks"], TB: ["tampa bay buccaneers", "buccaneers", "bucs"], TEN: ["tennessee titans", "titans"], WAS: ["washington commanders", "commanders"],
};

function decodeEntities(value: string) {
  let decoded = value;
  for (let pass = 0; pass < 3; pass += 1) {
    const next = decoded
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&apos;|&rsquo;/gi, "'")
      .replace(/&nbsp;/gi, " ")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&#(?:x([0-9a-f]+)|([0-9]+));/gi, (entity, hexadecimal: string | undefined, decimal: string | undefined) => {
        const codePoint = Number.parseInt(hexadecimal ?? decimal ?? "", hexadecimal ? 16 : 10);
        return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : entity;
      });
    if (next === decoded) break;
    decoded = next;
  }
  return decoded;
}

function clean(value: string) {
  return decodeEntities(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function field(item: string, name: string) {
  const match = item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? clean(match[1]) : "";
}

function isEditorialNews(title: string, summary: string, sourceUrl: string) {
  const text = `${title} ${summary} ${sourceUrl}`.toLowerCase();
  return !/\b(?:betting|odds|best bets|fantasy|dfs|picks|prop bets?|how to watch|watch live|gambling|bonus code)\b/.test(text);
}

/** Parses public PFT/CBS RSS summaries; only title, RSS summary and canonical URL are cached. */
export function parseExternalTeamNewsRss(
  xml: string,
  source: (typeof externalNewsSources)[number],
  requestedTeamCodes: readonly string[],
  now = new Date(),
) {
  const blocks = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) ?? [];
  const candidates: InsertOfficialFeedItem[] = [];
  for (const block of blocks) {
    const item = block.replace(/^<item(?:\s[^>]*)?>/i, "").replace(/<\/item>$/i, "");
    const title = field(item, "title");
    const sourceUrl = field(item, "link");
    const summary = (field(item, "description") || field(item, "content:encoded")).slice(0, 560) || null;
    const publishedAt = new Date(field(item, "pubDate"));
    if (!title || !sourceUrl || !isEditorialNews(title, summary ?? "", sourceUrl) || Number.isNaN(publishedAt.getTime())) continue;
    if (publishedAt.getTime() < now.getTime() - EXTERNAL_NEWS_MAX_AGE_MS || publishedAt.getTime() > now.getTime() + 24 * 60 * 60 * 1_000) continue;

    const titleLower = title.toLowerCase();
    const rawSummaryLower = (summary ?? "").toLowerCase();

    // 対戦相手としての言及フレーズを除去
    const sanitizedSummary = rawSummaryLower.replace(
      /\b(?:against|vs\.?|versus|loss to|lost to|fell to|defeated by|facing|faced|beat by|over)\s+(?:the\s+)?([a-z0-9\s]+?)(?=[,.;]|\s+(?:on|in|after|during|with|and|who|which)\b|$)/gi,
      " "
    );

    const matchesTeam = (text: string, code: string) => {
      const matchers = teamMatchers[code] ?? [];
      return matchers.some((m) => {
        const escaped = m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`\\b${escaped}\\b`, "i").test(text);
      });
    };

    const titleMatchedTeams = requestedTeamCodes.filter((code) => matchesTeam(titleLower, code));

    let matchedTeamCodes: string[] = [];
    if (titleMatchedTeams.length > 0) {
      matchedTeamCodes = titleMatchedTeams;
    } else {
      matchedTeamCodes = requestedTeamCodes.filter((code) => matchesTeam(sanitizedSummary, code));
    }

    for (const teamCode of matchedTeamCodes) {
      candidates.push({
        externalId: createHash("sha256").update(`${source.kind}:${teamCode}:${sourceUrl}`).digest("hex"),
        teamCode,
        sourceKind: source.kind,
        sourceName: source.name,
        sourceUrl,
        title,
        summary,
        category: "news",
        publishedAt,
        fetchedAt: now,
      });
    }
  }
  const seenByTeam = new Map<string, number>();
  return candidates
    .sort((left, right) => right.publishedAt.getTime() - left.publishedAt.getTime())
    .filter((item) => {
      const count = seenByTeam.get(item.teamCode) ?? 0;
      if (count >= MAX_ITEMS_PER_SOURCE_TEAM) return false;
      seenByTeam.set(item.teamCode, count + 1);
      return true;
    });
}

/** SB Nation（各チーム専門フィード）用のパーサー。チーム専用ブログのため本文判定を行わず確実に登録する */
function parseLocalTeamNewsRss(
  xml: string,
  source: { name: string; url: string },
  teamCode: string,
  now = new Date(),
) {
  const blocks = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) ?? [];
  const candidates: InsertOfficialFeedItem[] = [];
  for (const block of blocks) {
    const item = block.replace(/^<item(?:\s[^>]*)?>/i, "").replace(/<\/item>$/i, "");
    const title = field(item, "title");
    const sourceUrl = field(item, "link");
    const summary = (field(item, "description") || field(item, "content:encoded")).slice(0, 560) || null;
    const publishedAt = new Date(field(item, "pubDate"));
    if (!title || !sourceUrl || !isEditorialNews(title, summary ?? "", sourceUrl) || Number.isNaN(publishedAt.getTime())) continue;
    if (publishedAt.getTime() < now.getTime() - EXTERNAL_NEWS_MAX_AGE_MS || publishedAt.getTime() > now.getTime() + 24 * 60 * 60 * 1_000) continue;

    candidates.push({
      externalId: createHash("sha256").update(`local:${teamCode}:${sourceUrl}`).digest("hex"),
      teamCode,
      sourceKind: "local" as any,
      sourceName: source.name,
      sourceUrl,
      title,
      summary,
      category: "news",
      publishedAt,
      fetchedAt: now,
    });
  }
  return candidates
    .sort((left, right) => right.publishedAt.getTime() - left.publishedAt.getTime())
    .slice(0, MAX_LOCAL_ITEMS_PER_TEAM);
}

async function fetchRss(url: string) {
  const response = await fetch(url, {
    headers: { Accept: "application/rss+xml, application/xml, text/xml;q=0.9", "User-Agent": "NFLFanHubJapan/1.0 (public-news-links)" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`External news RSS failed: ${response.status}`);
  return response.text();
}

/** Refreshes short, team-matched link cards from approved public feeds. Editorial sources never replace official data. */
export async function refreshExternalTeamNews(teamCodes: readonly string[]) {
  const now = new Date();

  // 1. PFT / CBS の取得
  const sourceResults = await Promise.allSettled(
    externalNewsSources.map(async (source) => ({ source, xml: await fetchRss(source.url) }))
  );
  const generalItems = sourceResults.flatMap((result) =>
    result.status === "fulfilled" ? parseExternalTeamNewsRss(result.value.xml, result.value.source, teamCodes, now) : []
  );

  // 2. 各チームの SB Nation (Local) フィードの取得
  const localTargets = teamCodes
    .map((code) => ({ code, source: LOCAL_NEWS_SOURCES[code] }))
    .filter((target): target is { code: string; source: { name: string; url: string } } => Boolean(target.source));

  const localResults = await Promise.allSettled(
    localTargets.map(async ({ code, source }) => ({
      code,
      source,
      xml: await fetchRss(source.url),
    }))
  );
  const localItems = localResults.flatMap((result) =>
    result.status === "fulfilled" ? parseLocalTeamNewsRss(result.value.xml, result.value.source, result.value.code, now) : []
  );

  const allItems = [...generalItems, ...localItems];
  await upsertOfficialFeedItems(allItems);

  return {
    stored: allItems.length,
    sources: [
      ...sourceResults.map((result, index) => ({
        source: externalNewsSources[index].kind,
        ok: result.status === "fulfilled",
        count: result.status === "fulfilled" ? generalItems.filter((item) => item.sourceKind === externalNewsSources[index].kind).length : 0,
      })),
      {
        source: "local",
        ok: localResults.some((r) => r.status === "fulfilled"),
        count: localItems.length,
      },
    ],
  };
}
