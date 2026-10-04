import { NFL_MEDIA_LINKS, type NFLMediaLinkItem, type NFLTeamCode } from "../client/src/lib/nflMediaLinks";

export interface ParsedBlogArticle {
  id: string;
  sourceId: number;
  sourceName: string;
  sourceUrl: string;
  targetTeam?: NFLTeamCode;
  title: string;
  link: string;
  publishedAt: string;
  summary: string;
  isPaid: boolean;
}

interface CacheEntry {
  articles: ParsedBlogArticle[];
  cachedAt: number;
}

const blogCache: { all?: CacheEntry; byTeam: Record<string, CacheEntry> } = {
  byTeam: {},
};

const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2時間
const paidStatusCache = new Map<string, boolean>();

/**
 * Note記事などの有料・メンバーシップ判定ロジック
 * タイムアウトを5秒に延ばし、直列で確実にHTMLを取得して判定
 */
async function detectIsPaidArticle(title: string, content: string, url: string): Promise<boolean> {
  const paidTitleRegex = /【有料】|\[有料\]|（有料）|\(有料\)|\bPAID\b|メンバーシップ|メンバー限定|会員限定|定期購読|プレミアム/i;
  if (paidTitleRegex.test(title)) return true;

  const paidContentRegex = /この続きをみるには|購入して続きを読む|記事のご購入|有料エリア|有料記事|マガジンを購入|メンバーシップ/i;
  if (paidContentRegex.test(content)) return true;

  if (url.includes("note.com/")) {
    if (paidStatusCache.has(url)) return paidStatusCache.get(url)!;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5秒タイムアウトで確実に受信
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      clearTimeout(timeout);

      if (res.ok) {
        const html = await res.text();
        const isPaid =
          html.includes('"isAccessibleForFree":false') ||
          html.includes('"isAccessibleForFree": false') ||
          html.includes(".note-paywall");
        paidStatusCache.set(url, isPaid);
        return isPaid;
      }
    } catch {
      // 一時的な通信エラー時はキャッシュせず、次回再試行できるようにする
    }
  }

  return false;
}

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

async function parseRssXml(xml: string, source: NFLMediaLinkItem, isTeamPage: boolean): Promise<ParsedBlogArticle[]> {
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
    if (linkMatch) link = (linkMatch[1] ?? linkMatch[2] ?? "").trim();
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
      if (!Number.isNaN(d.getTime())) publishedAt = d.toISOString();
    }

    if (source.globalFilterRule) {
      const { titleKeywords, categoryOrTagKeywords, targetUrlPattern, excludeKeywords } = source.globalFilterRule;
      if (excludeKeywords && excludeKeywords.some((kw) => title.toLowerCase().includes(kw.toLowerCase()) || combinedCategories.toLowerCase().includes(kw.toLowerCase()))) continue;
      if (titleKeywords && !titleKeywords.some((kw) => title.toLowerCase().includes(kw.toLowerCase()))) continue;
      if (categoryOrTagKeywords && !categoryOrTagKeywords.some((kw) => combinedCategories.toLowerCase().includes(kw.toLowerCase()) || title.toLowerCase().includes(kw.toLowerCase()) || link.toLowerCase().includes(kw.toLowerCase()))) continue;
      if (targetUrlPattern && !targetUrlPattern.test(link)) continue;
    }

    if (isTeamPage && source.teamFilterRule) {
      const { titleKeywords, categoryOrTagKeywords, targetUrlPattern } = source.teamFilterRule;
      if (titleKeywords && !titleKeywords.some((kw) => title.toLowerCase().includes(kw.toLowerCase()))) continue;
      if (categoryOrTagKeywords && !categoryOrTagKeywords.some((kw) => combinedCategories.toLowerCase().includes(kw.toLowerCase()) || title.toLowerCase().includes(kw.toLowerCase()) || link.toLowerCase().includes(kw.toLowerCase()))) continue;
      if (targetUrlPattern && !targetUrlPattern.test(link)) continue;
    }

    rawItems.push({ title, link, rawDesc, combinedCategories, publishedAt });
  }

  // note.comへのアクセス集中を防ぐため、1件ずつ確実に直列処理
  for (const item of rawItems.slice(0, 5)) {
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

async function fetchArticlesFromSource(source: NFLMediaLinkItem, isTeamPage = false): Promise<ParsedBlogArticle[]> {
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
    return await parseRssXml(xml, source, isTeamPage);
  } catch {
    return [];
  }
}

/**
 * キャッシュ更新処理（相手サーバーへの負荷を抑え、確実に全件判定）
 */
async function refreshAllCache() {
  const targetSources = NFL_MEDIA_LINKS.filter((s) => Boolean(s.rssUrl));
  const allArticles: ParsedBlogArticle[] = [];

  // 各媒体を順次または適度な並行度で取得
  const results = await Promise.allSettled(targetSources.map((source) => fetchArticlesFromSource(source, false)));
  for (const r of results) {
    if (r.status === "fulfilled") allArticles.push(...r.value);
  }
  allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  blogCache.all = {
    articles: allArticles,
    cachedAt: Date.now(),
  };
}

refreshAllCache().catch(console.error);

setInterval(() => {
  refreshAllCache().catch(console.error);
}, CACHE_TTL_MS);

export async function getAllBlogArticles(limit = 80): Promise<ParsedBlogArticle[]> {
  if (blogCache.all && blogCache.all.articles.length > 0) {
    return blogCache.all.articles.slice(0, limit);
  }
  await refreshAllCache();
  return (blogCache.all?.articles ?? []).slice(0, limit);
}

export async function getTeamBlogArticles(teamCode: NFLTeamCode, limit = 5): Promise<ParsedBlogArticle[]> {
  const now = Date.now();
  const cached = blogCache.byTeam[teamCode];
  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return cached.articles.slice(0, limit);
  }

  const teamSources = NFL_MEDIA_LINKS.filter(
    (s) => s.showInTeamLatest && s.targetTeam === teamCode && Boolean(s.rssUrl)
  );
  const results = await Promise.allSettled(teamSources.map((source) => fetchArticlesFromSource(source, true)));
  const articles: ParsedBlogArticle[] = [];

  for (const r of results) {
    if (r.status === "fulfilled") articles.push(...r.value);
  }
  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  blogCache.byTeam[teamCode] = { articles, cachedAt: now };
  return articles.slice(0, limit);
}
