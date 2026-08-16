/** NFL-published game highlights channel. It does not expose a score or a thumbnail inside this app. */
export const nflGameHighlightsUrl = "https://www.nfl.com/videos/channel/game-highlights-vc";

export function officialHighlightsHref(individualHighlightUrl?: string | null) {
  return individualHighlightUrl && /^https:\/\/www\.nfl\.com\/videos\//.test(individualHighlightUrl) ? individualHighlightUrl : nflGameHighlightsUrl;
}
