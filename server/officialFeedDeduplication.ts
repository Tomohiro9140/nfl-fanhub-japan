export type DeduplicableOfficialFeedItem = {
  title: string;
  sourceUrl: string;
  sourceKind?: string;
  publishedAt: Date;
};

export function canonicalOfficialFeedUrl(value: string) {
  try {
    const url = new URL(value.trim());
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    url.hash = "";
    for (const key of Array.from(url.searchParams.keys())) {
      if (/^(?:utm_|fbclid$|gclid$|mc_[a-z]+)/i.test(key)) url.searchParams.delete(key);
    }
    const normalizedPath = url.pathname.replace(/\/+$/, "") || "/";
    return `${url.protocol}//${url.hostname}${normalizedPath}${url.search}`;
  } catch {
    return value.trim().replace(/\/+$/, "").toLowerCase();
  }
}

export function normalizeOfficialFeedTitle(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’'"`´]/g, "")
    .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/gi, " ")
    .trim();
}

function sourceRank(sourceKind?: string) {
  if (sourceKind === "team_official") return 0;
  if (sourceKind === "nfl_official") return 1;
  if (sourceKind === "pft") return 2;
  return 3;
}

export function officialFeedDeduplicationKey(item: Pick<DeduplicableOfficialFeedItem, "title" | "sourceUrl">) {
  const canonicalUrl = canonicalOfficialFeedUrl(item.sourceUrl);
  return canonicalUrl ? `url:${canonicalUrl}` : `title:${normalizeOfficialFeedTitle(item.title)}`;
}

/** Keeps the preferred official source once when a publisher or legacy cache repeats the same article. */
export function dedupeOfficialFeedItems<T extends DeduplicableOfficialFeedItem>(items: T[], limit?: number) {
  const ordered = [...items].sort((left, right) => {
    const sourceDifference = sourceRank(left.sourceKind) - sourceRank(right.sourceKind);
    if (sourceDifference) return sourceDifference;
    return right.publishedAt.getTime() - left.publishedAt.getTime();
  });
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const output: T[] = [];
  for (const item of ordered) {
    const urlKey = canonicalOfficialFeedUrl(item.sourceUrl);
    const titleKey = normalizeOfficialFeedTitle(item.title);
    if ((urlKey && seenUrls.has(urlKey)) || (titleKey && seenTitles.has(titleKey))) continue;
    if (urlKey) seenUrls.add(urlKey);
    if (titleKey) seenTitles.add(titleKey);
    output.push(item);
    if (limit && output.length >= limit) break;
  }
  return output;
}
