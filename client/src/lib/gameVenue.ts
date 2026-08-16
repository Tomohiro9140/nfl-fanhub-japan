/** Returns a confirmed venue only; placeholders must never be displayed as a venue. */
export function confirmedVenue(venue?: string | null) {
  const normalized = venue?.trim();
  return normalized && !/^(tba|tbd|to be announced|to be determined|unknown)$/i.test(normalized) ? normalized : null;
}
