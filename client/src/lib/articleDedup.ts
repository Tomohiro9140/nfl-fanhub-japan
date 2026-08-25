export type DisplayArticle = { title: string; sourceUrl: string; publishedAt: Date };

export function canonicalArticleUrl(value: string) {
  try {
    const url = new URL(value.trim());
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    url.hash = "";
    for (const key of Array.from(url.searchParams.keys())) {
      if (/^(?:utm_|fbclid$|gclid$|mc_[a-z]+)/i.test(key)) url.searchParams.delete(key);
    }
    const path = url.pathname.replace(/\/+$/, "") || "/";
    return `${url.protocol}//${url.hostname}${path}${url.search}`;
  } catch {
    return value.trim().replace(/\/+$/, "").toLowerCase();
  }
}

export function normalizedArticleTitle(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’'"`´]/g, "")
    .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/gi, " ")
    .trim();
}

/** A display-layer guard for legacy or concurrently refreshed feed rows. */
export function dedupeDisplayArticles<T extends DisplayArticle>(items: T[]) {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const output: T[] = [];
  for (const item of items) {
    const urlKey = canonicalArticleUrl(item.sourceUrl);
    const titleKey = normalizedArticleTitle(item.title);
    if ((urlKey && seenUrls.has(urlKey)) || (titleKey && seenTitles.has(titleKey))) continue;
    if (urlKey) seenUrls.add(urlKey);
    if (titleKey) seenTitles.add(titleKey);
    output.push(item);
  }
  return output;
}
