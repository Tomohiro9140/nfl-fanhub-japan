export type ScrollTarget = { scrollTop: number };

export function gameStatsAtlasHref(playerName: string) {
  return `/atlas/?q=${encodeURIComponent(playerName)}`;
}

export function restoreGameStatsScrollPosition(target: ScrollTarget | null, scrollTop: number | undefined) {
  if (!target || !Number.isFinite(scrollTop)) return;
  target.scrollTop = Number(scrollTop);
}
