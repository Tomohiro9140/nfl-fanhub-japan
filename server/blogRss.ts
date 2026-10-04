import { NFL_MEDIA_LINKS, type NFLMediaLinkItem, type NFLTeamCode } from "../client/src/lib/nflMediaLinks";

export interface ParsedBlogArticle {
  id: string;
  sourceId: number;
  sourceName: string;
  sourceUrl: string;
  targetTeam?: NFLTeamCode;
  title: string;
  link: string;
  publishedAt: string; // ISO 8601
  summary: string;
  isPaid: boolean;     // Note等の有料・メンバーシップ限定バッジ用
}

// 15分間のインメモリキャッシュ
interface CacheEntry {
  articles: ParsedBlogArticle[];
  cachedAt: number;
}
const blogCache: { all?: CacheEntry; byTeam: Record<string, CacheEntry> } = {
  byTeam: {},
};
const CACHE_TTL_MS = 15 * 60 * 1000; // 15分

// 有料判定の個別キャッシュ（記事URL -> isPaid）
const paidStatusCache = new Map<string, boolean>();

/**
 * Note記事などの有料・メンバーシップ判定ロジック（Schema.org & タイトル判定）
 */
async function detectIsPaidArticle(title: string, content: string, url: string): Promise<boolean> {
  // 1. タイトルでの明示的な有料・メンバーシップ表記
  const paidTitleRegex = /【有料】|\[有料\]|（有料）|\(有料\)|\bPAID\b|メンバーシップ|メンバー限定|会員限定|定期購読|プレミアム/i;
  if (paidTitleRegex.test(title)) {
    return true;
  }

  // 2. 本文・概要に含まれる有料区切りパターン
  const paidContentRegex = /この続きをみるには|購入して続きを読む|記事のご購入|有料エリア|有料記事|マガジンを購入|メンバーシップ/i;
  if (paidContentRegex.test(content)) {
    return true;
  }

  // 3. note.com 記事の場合、キャッシュまたはHTMLの Schema.org ("isAccessibleForFree":false) で確定判定
  if (url.includes("note.com/")) {
    if (paidStatusCache.has(url)) {
      return paidStatusCache.get(url)!;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500); // 2.5秒タイムアウト
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      });
      clearTimeout(timeout);

      if (res.ok) {
        const html = await res.text();
        // note公式の有料指定: "isAccessibleForFree":false または .note-paywall
        const isPaid = html.includes('"isAccessibleForFree":false') || html.includes('"isAccessibleForFree": false') || html.includes('.note-paywall');
        paidStatusCache.set(url, isPaid);
        return isPaid;
      }
    } catch {
      // タイムアウト等の場合はfalseをフォールバック
    }
  }

  return false;
}

/**
 * HTMLタグの除去とサマリーの整形
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * XML (RSS/Atom) パーサー
 */
async function parseRssXml(xml: string, source: NFLMediaLinkItem): Promise<ParsedBlogArticle[]> {
  const articles: ParsedBlogArticle[] = [];

  const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
  let match: RegExpExecArray | null;

  const rawItems: Array<{ title: string; link: string; rawDesc: string; combinedCategories: string; publishedAt: string }> = [];

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1];

    const titleMatch = itemContent.match(/<title[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/title>/i);
    const title = (titleMatch ? (titleMatch[1] ?? titleMatch[2]) : "").trim();
    if (!title) continue;

    let link = "";
    const linkMatch = itemContent.match(/<link[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/link>/i);
    if (linkMatch) {
      link = (linkMatch[1] ?? linkMatch[2] ?? "").trim();
    }
    if (!link) {
      const hrefMatch = itemContent.match(/<link[^>]+href=["']([^"']+)["']/i);
      if (hrefMatch) link = hrefMatch[1].trim();
    }
    if (!link) continue;

    const descMatch = itemContent.match(/<(?:description|summary|content)[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/(?:description|summary|content)>/i);
    const rawDesc = descMatch ? (descMatch[1] ?? descMatch[2] ?? "") : "";

    const categoryMatches: string[] = [];
    const catRegex = /<category[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/category>/gi;
    let catM: RegExpExecArray | null;
    while ((catM = catRegex.exec(itemContent)) !== null) {
      const catVal = (catM[1] ?? catM[2] ?? "").trim();
      if (catVal) categoryMatches.push(catVal);
    }
    const combinedCategories = categoryMatches.join(" ");

    const dateMatch = itemContent.match(/<(?:pubDate|published|updated|dc:date)[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated|dc:date)>/i);
    let publishedAt = new Date().toISOString();
    if (dateMatch) {
      const d = new Date(dateMatch[1].trim());
      if (!Number.isNaN(d.getTime())) {
        publishedAt = d.toISOString();
      }
    }

    // 個別フィルタールールチェック
    if (source.filterRule) {
      const { titleKeywords, categoryOrTagKeywords, targetUrlPattern } = source.filterRule;
      if (titleKeywords && titleKeywords.length > 0) {
        if (!titleKeywords.some((kw) => title.toLowerCase().includes(kw.toLowerCase()))) continue;
      }
      if (categoryOrTagKeywords && categoryOrTagKeywords.length > 0) {
        if (!categoryOrTagKeywords.some((kw) => combinedCategories.toLowerCase().includes(kw.toLowerCase()) || link.toLowerCase().includes(kw.toLowerCase()))) continue;
      }
      if (targetUrlPattern && !targetUrlPattern.test(link)) continue;
    }

    rawItems.push({ title, link, rawDesc, combinedCategories, publishedAt });
  }

  // 最新10件について有料判定を実行
  for (const item of rawItems.slice(0, 10)) {
    const isPaid = await detectIsPaidArticle(item.title, item.rawDesc, item.link);
    articles.push({
      id: `${source.id}-${Buffer.from(item.link).toString("base64").slice(-12)}`,
      sourceId: source.id,
      sourceName: source.name,
      sourceUrl: source.url,
      targetTeam: source.targetTeam,
      title: item.title,
      link: item.link,
      publishedAt: item.publishedAt,
      summary: stripHtml(item.rawDesc).slice(0, 140),
      isPaid,
    });
  }

  return articles;
}

/**
 * 1つのブログソースから記事一覧を取得
 */
async function fetchArticlesFromSource(source: NFLMediaLinkItem): Promise<ParsedBlogArticle[]> {
  if (!source.rssUrl) return [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(source.rssUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NFLFanHubBot/1.0; +https://nfl-fanhub.onrender.com)",
        Accept: "application/rss+xml, application/rdf+xml, application/atom+xml, application/xml, text/xml",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const xml = await res.text();
    return await parseRssXml(xml, source);
  } catch {
    return [];
  }
}

/**
 * 全ブログの最新記事一覧を取得（最新順）
 */
export async function getAllBlogArticles(limit = 50): Promise<ParsedBlogArticle[]> {
  const now = Date.now();
  if (blogCache.all && now - blogCache.all.cachedAt < CACHE_TTL_MS) {
    return blogCache.all.articles.slice(0, limit);
  }

  const targetSources = NFL_MEDIA_LINKS.filter((s) => Boolean(s.rssUrl));
  const results = await Promise.allSettled(targetSources.map(fetchArticlesFromSource));

  const allArticles: ParsedBlogArticle[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") {
      allArticles.push(...r.value);
    }
  }

  allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  blogCache.all = {
    articles: allArticles,
    cachedAt: now,
  };

  return allArticles.slice(0, limit);
}

/**
 * チームページ用記事一覧を取得 (No.1〜15)
 */
export async function getTeamBlogArticles(teamCode: NFLTeamCode, limit = 5): Promise<ParsedBlogArticle[]> {
  const now = Date.now();
  const cached = blogCache.byTeam[teamCode];
  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return cached.articles.slice(0, limit);
  }

  const teamSources = NFL_MEDIA_LINKS.filter(
    (s) => s.showInTeamLatest && s.targetTeam === teamCode && Boolean(s.rssUrl)
  );

  const results = await Promise.allSettled(teamSources.map(fetchArticlesFromSource));
  const articles: ParsedBlogArticle[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") {
      articles.push(...r.value);
    }
  }

  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  blogCache.byTeam[teamCode] = {
    articles,
    cachedAt: now,
  };

  return articles.slice(0, limit);
}
