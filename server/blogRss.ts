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
  isPaid: boolean;     // Note等の有料記事バッジ用
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

/**
 * Note記事などの有料判定ロジック
 */
function detectIsPaidArticle(title: string, content: string, url: string): boolean {
  // 1. タイトルでの明示的な有料表記
  if (/【有料】|\[有料\]|（有料）|\(有料\)|\bPAID\b/i.test(title)) {
    return true;
  }

  // 2. Note (note.com) の本文・概要に含まれる有料区切りパターン
  if (url.includes("note.com")) {
    const paidPatterns = [
      /この続きをみるには/i,
      /購入して続きを読む/i,
      /記事のご購入/i,
      /有料エリア/i,
      /有料記事/i,
      /マガジンを購入/i,
      /価格[:：]\s*\d+円/i,
    ];
    if (paidPatterns.some((pattern) => pattern.test(content))) {
      return true;
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
 * 軽量・ゼロ依存 XML (RSS/Atom) パーサー
 */
function parseRssXml(xml: string, source: NFLMediaLinkItem): ParsedBlogArticle[] {
  const articles: ParsedBlogArticle[] = [];

  // RSS 2.0 (<item>) または Atom (<entry>) を抽出
  const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1];

    // タイトル
    const titleMatch = itemContent.match(/<title[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/title>/i);
    const title = (titleMatch ? (titleMatch[1] ?? titleMatch[2]) : "").trim();
    if (!title) continue;

    // リンク (RSS 2.0 の <link> または Atom の <link href="..." />)
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

    // 本文・概要 (<description> または <content> または <summary>)
    const descMatch = itemContent.match(/<(?:description|summary|content)[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/(?:description|summary|content)>/i);
    const rawDesc = descMatch ? (descMatch[1] ?? descMatch[2] ?? "") : "";
    const summary = stripHtml(rawDesc).slice(0, 140);

    // カテゴリー / タグ (<category>タグ)
    const categoryMatches: string[] = [];
    const catRegex = /<category[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/category>/gi;
    let catM: RegExpExecArray | null;
    while ((catM = catRegex.exec(itemContent)) !== null) {
      const catVal = (catM[1] ?? catM[2] ?? "").trim();
      if (catVal) categoryMatches.push(catVal);
    }
    const combinedCategories = categoryMatches.join(" ");

    // 日時 (<pubDate> または <published> または <updated>)
    const dateMatch = itemContent.match(/<(?:pubDate|published|updated|dc:date)[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated|dc:date)>/i);
    let publishedAt = new Date().toISOString();
    if (dateMatch) {
      const d = new Date(dateMatch[1].trim());
      if (!Number.isNaN(d.getTime())) {
        publishedAt = d.toISOString();
      }
    }

    // --- 個別フィルタリングルールの適用 ---
    if (source.filterRule) {
      const { titleKeywords, categoryOrTagKeywords, targetUrlPattern } = source.filterRule;

      // 1. タイトルキーワードチェック (No.10 リトルナイナー, No.15 アメフトーーク 等)
      if (titleKeywords && titleKeywords.length > 0) {
        const matchesTitle = titleKeywords.some((kw) => title.toLowerCase().includes(kw.toLowerCase()));
        if (!matchesTitle) continue;
      }

      // 2. カテゴリ・タグキーワードチェック (No.14 JETS狂 等)
      if (categoryOrTagKeywords && categoryOrTagKeywords.length > 0) {
        const matchesCategory = categoryOrTagKeywords.some((kw) =>
          combinedCategories.toLowerCase().includes(kw.toLowerCase()) || link.toLowerCase().includes(kw.toLowerCase())
        );
        if (!matchesCategory) continue;
      }

      // 3. URLパターンチェック (No.11, 12, 13, 38, 41 等)
      if (targetUrlPattern && !targetUrlPattern.test(link)) {
        continue;
      }
    }

    // 有料記事判定
    const isPaid = detectIsPaidArticle(title, rawDesc, link);

    articles.push({
      id: `${source.id}-${Buffer.from(link).toString("base64").slice(-12)}`,
      sourceId: source.id,
      sourceName: source.name,
      sourceUrl: source.url,
      targetTeam: source.targetTeam,
      title,
      link,
      publishedAt,
      summary,
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
    const timeout = setTimeout(() => controller.abort(), 6000); // 6秒タイムアウト

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
    return parseRssXml(xml, source);
  } catch (err) {
    // タイムアウトや通信エラーはスキップして安全に空配列を返す
    return [];
  }
}

/**
 * 【Link ページ用】全ブログの最新記事一覧を取得（最新順）
 */
export async function getAllBlogArticles(limit = 40): Promise<ParsedBlogArticle[]> {
  const now = Date.now();
  if (blogCache.all && now - blogCache.all.cachedAt < CACHE_TTL_MS) {
    return blogCache.all.articles.slice(0, limit);
  }

  // RSS URLが存在するすべてのサイトから並行取得
  const targetSources = NFL_MEDIA_LINKS.filter((s) => Boolean(s.rssUrl));
  const results = await Promise.allSettled(targetSources.map(fetchArticlesFromSource));

  const allArticles: ParsedBlogArticle[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") {
      allArticles.push(...r.value);
    }
  }

  // 公開日時の降順（最新順）にソート
  allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  blogCache.all = {
    articles: allArticles,
    cachedAt: now,
  };

  return allArticles.slice(0, limit);
}

/**
 * 【チームページ Latest News 用】指定チームのブログ記事を取得 (No.1〜15)
 */
export async function getTeamBlogArticles(teamCode: NFLTeamCode, limit = 5): Promise<ParsedBlogArticle[]> {
  const now = Date.now();
  const cached = blogCache.byTeam[teamCode];
  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return cached.articles.slice(0, limit);
  }

  // No.1〜15 の中で対象チームが一致するサイトを抽出
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
