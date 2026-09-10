/** NFL-published game highlights channel. It does not expose a score or a thumbnail inside this app. */
export const nflGameHighlightsUrl = "https://www.nfl.com/videos/channel/game-highlights-vc";

export function officialHighlightsHref(individualHighlightUrl?: string | null) {
  if (!individualHighlightUrl) return nflGameHighlightsUrl;

  const isValidUrl =
    /^https:\/\/www\.nfl\.com\/videos\//.test(individualHighlightUrl) ||
    /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/.test(individualHighlightUrl);

  return isValidUrl ? individualHighlightUrl : nflGameHighlightsUrl;
}

export function hasIndividualOfficialHighlight(individualHighlightUrl?: string | null) {
  return officialHighlightsHref(individualHighlightUrl) !== nflGameHighlightsUrl;
}
