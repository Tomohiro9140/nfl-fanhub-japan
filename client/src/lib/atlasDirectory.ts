export type AtlasPlayer = {
  id: number;
  teamCode: string;
  playerName: string;
  jerseyNumber: string | null;
  position: string;
  rosterStatus: string;
  sourceUrl: string;
  fetchedAt: Date;
};

export function filterAtlasPlayers(players: AtlasPlayer[], teamCode: string, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return players
    .filter((player) => teamCode === "ALL" || player.teamCode === teamCode)
    .filter((player) => !normalizedQuery || `${player.playerName} ${player.position} ${player.jerseyNumber ?? ""}`.toLocaleLowerCase().includes(normalizedQuery))
    .sort((left, right) => left.teamCode.localeCompare(right.teamCode) || left.position.localeCompare(right.position) || left.playerName.localeCompare(right.playerName));
}
