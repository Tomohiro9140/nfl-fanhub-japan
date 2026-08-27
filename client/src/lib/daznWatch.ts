/**
 * DAZN does not publish a stable mapping from NFL schedule data to a per-game
 * DAZN content ID. This official Game Pass URL is the reliable watch fallback.
 */
export const daznNflGamePassUrl = "https://www.dazn.com/ja-JP/l/nfl-game-pass";
export const daznJapanHomeUrl = "https://www.dazn.com/ja-JP/home";

export function isMobileDevice(userAgent: string) {
  return /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(userAgent);
}

/** Mobile uses the first-party web URL in the current context for Universal Link/App Link handling; desktop opens a browser tab. */
export function daznWatchTarget(userAgent: string) {
  return isMobileDevice(userAgent) ? "_self" : "_blank";
}

/** Mobile keeps the official Game Pass Universal/App Link; desktop opens DAZN Japan's home page. */
export function daznWatchHref(userAgent: string) {
  return isMobileDevice(userAgent) ? daznNflGamePassUrl : daznJapanHomeUrl;
}

/** Prefer a verified individual DAZN URL; retain the official NFL game page when one is not available. */
export function resultWatchHref(daznUrl: string | null | undefined, officialGameUrl: string) {
  return daznUrl ?? officialGameUrl;
}
