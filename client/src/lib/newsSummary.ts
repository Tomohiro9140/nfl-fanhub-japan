const MOBILE_JAPANESE_SUMMARY_LIMIT = 340;

function comparableNewsText(value: string) {
  return value.toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/gi, " ").replace(/\s+/g, " ").trim();
}

/** Hides RSS descriptions that merely repeat the article headline. */
export function hasDistinctNewsSummary(title: string, summary: string | null | undefined) {
  if (!summary?.trim()) return false;
  const normalizedTitle = comparableNewsText(title);
  const normalizedSummary = comparableNewsText(summary);
  if (!normalizedTitle || !normalizedSummary || normalizedTitle === normalizedSummary) return false;

  const titleTerms = new Set(normalizedTitle.split(" ").filter((term) => term.length > 2));
  const summaryTerms = new Set(normalizedSummary.split(" ").filter((term) => term.length > 2));
  if (!titleTerms.size || !summaryTerms.size) return true;
  const overlap = Array.from(titleTerms).filter((term) => summaryTerms.has(term)).length / Math.min(titleTerms.size, summaryTerms.size);
  const lengthRatio = Math.max(normalizedTitle.length, normalizedSummary.length) / Math.min(normalizedTitle.length, normalizedSummary.length);
  return !(overlap >= 0.9 && lengthRatio <= 1.2);
}

/** Keeps cached summaries compact enough for a mobile dialog, preferring sentence boundaries. */
export function compactJapaneseSummary(value: string, limit = MOBILE_JAPANESE_SUMMARY_LIMIT) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) return normalized;

  const sentences = normalized.match(/[^。！？]+[。！？]?/g) ?? [];
  let compact = "";
  for (const sentence of sentences) {
    if ((compact + sentence).length > limit) break;
    compact += sentence;
  }
  const fallback = normalized.slice(0, limit).replace(/[、。！？]?[\s]*$/, "");
  return `${(compact || fallback).trim()}…`;
}
