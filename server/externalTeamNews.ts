import { fetchRss } from "./rss";
import { FavoriteTeamCode } from "@/@types/favoriteTeam";
import { InsertOfficialFeedItem } from "../drizzle/schema";
import { upsertOfficialFeedItems } from "./db";

// SB Nation 系の各チーム専門サイト（Localソース）のマッピングテーブル
const LOCAL_NEWS_SOURCES: Record<
  FavoriteTeamCode,
  { name: string; url: string }
> = {
  BUF: {
    name: "Buffalo Rumblings",
    url: "https://www.buffalorumblings.com/rss/index.xml",
  },
  MIA: { name: "The Phinsider", url: "https://www.thephinsider.com/rss/index.xml" },
  NE: { name: "Pats Pulpit", url: "https://www.patspulpit.com/rss/index.xml" },
  NYJ: {
    name: "Gang Green Nation",
    url: "https://www.ganggreennation.com/rss/index.xml",
  },
  BAL: {
    name: "Baltimore Beatdown",
    url: "https://www.baltimorebeatdown.com/rss/index.xml",
  },
  CIN: { name: "Cincy Jungle", url: "https://www.cincyjungle.com/rss/index.xml" },
  CLE: {
    name: "Dawgs By Nature",
    url: "https://www.dawgsbynature.com/rss/index.xml",
  },
  PIT: {
    name: "Behind the Steel Curtain",
    url: "https://www.behindthesteelcurtain.com/rss/index.xml",
  },
  HOU: {
    name: "Battle Red Blog",
    url: "https://www.battleredblog.com/rss/index.xml",
  },
  IND: { name: "Stampede Blue", url: "https://www.stampedeblue.com/rss/index.xml" },
  JAX: {
    name: "Big Cat Country",
    url: "https://www.bigcatcountry.com/rss/index.xml",
  },
  TEN: {
    name: "Music City Miracles",
    url: "https://www.musiccitymiracles.com/rss/index.xml",
  },
  DEN: {
    name: "Mile High Report",
    url: "https://www.milehighreport.com/rss/index.xml",
  },
  KC: {
    name: "Arrowhead Pride",
    url: "https://www.arrowheadpride.com/rss/index.xml",
  },
  LV: {
    name: "Silver and Black Pride",
    url: "https://www.silverandblackpride.com/rss/index.xml",
  },
  LAC: {
    name: "Bolts From The Blue",
    url: "https://www.boltsfromtheblue.com/rss/index.xml",
  },
  DAL: {
    name: "Blogging The Boys",
    url: "https://www.bloggingtheboys.com/rss/index.xml",
  },
  NYG: { name: "Big Blue View", url: "https://www.bigblueview.com/rss/index.xml" },
  PHI: {
    name: "Bleeding Green Nation",
    url: "https://www.bleedinggreennation.com/rss/index.xml",
  },
  WAS: { name: "Hogs Haven", url: "https://www.hogshaven.com/rss/index.xml" },
  CHI: {
    name: "Windy City Gridiron",
    url: "https://www.windycitygridiron.com/rss/index.xml",
  },
  DET: {
    name: "Pride Of Detroit",
    url: "https://www.prideofdetroit.com/rss/index.xml",
  },
  GB: {
    name: "Acme Packing Company",
    url: "https://www.acmepackingcompany.com/rss/index.xml",
  },
  MIN: { name: "Daily Norseman", url: "https://www.dailynorseman.com/rss/index.xml" },
  ATL: { name: "The Falcoholic", url: "https://www.thefalcoholic.com/rss/index.xml" },
  CAR: {
    name: "Cat Scratch Reader",
    url: "https://www.catscratchreader.com/rss/index.xml",
  },
  NO: {
    name: "Canal Street Chronicles",
    url: "https://www.canalstreetchronicles.com/rss/index.xml",
  },
  TB: { name: "Bucs Nation", url: "https://www.bucsnation.com/rss/index.xml" },
  ARI: {
    name: "Revenge of the Birds",
    url: "https://www.revengeofthebirds.com/rss/index.xml",
  },
  LAR: {
    name: "Turf Show Times",
    url: "https://www.turfshowtimes.com/rss/index.xml",
  },
  SF: { name: "Niners Nation", url: "https://www.ninersnation.com/rss/index.xml" },
  SEA: { name: "Field Gulls", url: "https://www.fieldgulls.com/rss/index.xml" },
};

const MAX_ITEMS_PER_SOURCE_TEAM = 3; // 各ソース・チームごとの保存上限
const EXTERNAL_NEWS_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1_000; // 7日間

// 大手メディア（速報系）の共通RSSソース
export const externalNewsSources = [
  {
    kind: "pft" as const,
    name: "PFT - NBC SPORTS",
    url: "https://www.nbcsports.com/profootballtalk.rss",
  },
  {
    kind: "cbs" as const,
    name: "CBS SPORTS",
    url: "https://www.cbssports.com/rss/headlines/nfl/",
  },
] as const;

/**
 * チームごとの外部ニュースフィード（Local + PFT/CBS）をリフレッシュしてDBに保存する
 */
export async function refreshExternalTeamNews(
  favoriteTeamCode: FavoriteTeamCode
) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - EXTERNAL_NEWS_MAX_AGE_MS);

  // 1. そのチームに対応する Local ソース（SB Nation）を取得
  const localSource = LOCAL_NEWS_SOURCES[favoriteTeamCode];
  
  // 2. Local ＋ 大手メディア の全ソースリストを作成
  const sourcesToFetch = [
    ...(localSource ? [{ ...localSource, kind: "local" as const }] : []),
    ...externalNewsSources,
  ];

  // 3. 全ソースから並行してRSSを取得・パース
  const sourceResults = await Promise.allSettled(
    sourcesToFetch.map(async (source) => ({
      source,
      xml: await fetchRss(source.url),
    }))
  );

  // 4. パースして保存用アイテムに整形
  const newsItems: InsertOfficialFeedItem[] = [];

  for (const result of sourceResults) {
    if (result.status === "rejected") {
      console.error(
        `Failed to fetch RSS for ${result.reason?.source?.name ?? "unknown"}`
      );
      continue;
    }

    const { source, xml } = result.value;
    const items = parseExternalTeamNewsRss(xml, source, favoriteTeamCode, now);
    
    // 期間内かつチームにマッチした記事のみを上限数まで追加
    const validItems = items
      .filter((item) => new Date(item.publishedAt) >= cutoff)
      .slice(0, MAX_ITEMS_PER_SOURCE_TEAM);

    newsItems.push(...validItems);
  }

  // 5. DBに保存（upsert）
  if (newsItems.length > 0) {
    await upsertOfficialFeedItems(newsItems);
  }

  return {
    stored: newsItems.length,
    sources: sourcesToFetch.map((s) => s.name),
  };
}
