const MOBILE_JAPANESE_SUMMARY_LIMIT = 340;

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
