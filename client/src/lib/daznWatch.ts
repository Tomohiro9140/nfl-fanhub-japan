/**
 * DAZN does not publish a stable mapping from NFL schedule data to a per-game
 * DAZN content ID. This official Game Pass URL is the reliable watch fallback.
 */
export const daznNflGamePassUrl = "https://www.dazn.com/ja-JP/l/nfl-game-pass";

export function isMobileDevice(userAgent: string) {
  return /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(userAgent);
}

/** Mobile uses the first-party web URL in the current context for Universal Link/App Link handling; desktop opens a browser tab. */
export function daznWatchTarget(userAgent: string) {
  return isMobileDevice(userAgent) ? "_self" : "_blank";
}
