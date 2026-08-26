export type ScrollTarget = { scrollTop: number };

export function gameBookPlayerKey(teamCode: string, playerName: string) {
  return `${teamCode}:${playerName}`;
}

export function gameStatsAtlasHref(playerId: string) {
  return `/atlas/?player=${encodeURIComponent(playerId)}`;
}

export function formatDownEfficiency(value: string) {
  const match = value.match(/^(\d+-\d+)-(\d+(?:\.\d+)?%)$/);
  return match ? `${match[1]} ${match[2]}` : value;
}

export function restoreGameStatsScrollPosition(target: ScrollTarget | null, scrollTop: number | undefined) {
  if (!target || !Number.isFinite(scrollTop)) return;
  target.scrollTop = Number(scrollTop);
}
