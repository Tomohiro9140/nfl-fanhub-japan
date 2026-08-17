import { createHash } from "node:crypto";
import type { InsertOfficialFeedItem } from "../drizzle/schema";
import { upsertOfficialFeedItems } from "./db";

const MAX_ITEMS_PER_SOURCE_TEAM = 2;
const EXTERNAL_NEWS_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1_000;

export const externalNewsSources = [
  { kind: "pft" as const, name: "PFT · NBC SPORTS", url: "https://www.nbcsports.com/profootballtalk.rss" },
  { kind: "cbs" as const, name: "CBS SPORTS", url: "https://www.cbssports.com/rss/headlines/nfl/" },
] as const;

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

function clean(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
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
    const haystack = `${title} ${summary ?? ""}`.toLowerCase();
    for (const teamCode of requestedTeamCodes) {
      if (!(teamMatchers[teamCode] ?? []).some((matcher) => haystack.includes(matcher))) continue;
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
  const sourceResults = await Promise.allSettled(externalNewsSources.map(async (source) => ({ source, xml: await fetchRss(source.url) })));
  const now = new Date();
  const items = sourceResults.flatMap((result) => result.status === "fulfilled" ? parseExternalTeamNewsRss(result.value.xml, result.value.source, teamCodes, now) : []);
  await upsertOfficialFeedItems(items);
  return {
    stored: items.length,
    sources: sourceResults.map((result, index) => ({ source: externalNewsSources[index].kind, ok: result.status === "fulfilled", count: result.status === "fulfilled" ? items.filter((item) => item.sourceKind === externalNewsSources[index].kind).length : 0 })),
  };
}
