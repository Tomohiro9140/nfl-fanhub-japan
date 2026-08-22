/** Returns a confirmed venue only; placeholders must never be displayed as a venue. */
export function confirmedVenue(venue?: string | null) {
  const normalized = venue?.trim();
  return normalized && !/^(tba|tbd|to be announced|to be determined|unknown)$/i.test(normalized) ? normalized : null;
}

/** Retains an official venue's identity while using compact suffixes on narrow screens. */
export function compactVenue(venue?: string | null) {
  const confirmed = confirmedVenue(venue);
  if (!confirmed) return null;
  return confirmed.replace(/\b(Stadium|Center|Centre|Coliseum)\b$/i, (suffix) => ({
    stadium: "Stdm.",
    center: "Ctr.",
    centre: "Ctr.",
    coliseum: "Col.",
  })[suffix.toLowerCase()] ?? suffix);
}
