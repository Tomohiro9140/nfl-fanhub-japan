type CalendarCandidate = {
  teamCode: string;
  opponentCode: string;
  kickoffAt: Date;
};

/**
 * Keeps the selected team's season plus the rolling league window. Schedule
 * rows are stored once per team, so the matchup/time key removes their mirror.
 */
export function selectRelevantCalendarGames<T extends CalendarCandidate>(games: T[], favoriteTeamCode: string, now: Date) {
  const windowEnd = now.getTime() + 7 * 24 * 60 * 60 * 1_000;
  const seen = new Set<string>();
  return games.filter((game) => {
    const kickoff = new Date(game.kickoffAt).getTime();
    const isFavoriteSchedule = game.teamCode === favoriteTeamCode || game.opponentCode === favoriteTeamCode;
    const isUpcomingLeagueGame = kickoff >= now.getTime() && kickoff < windowEnd;
    if (!isFavoriteSchedule && !isUpcomingLeagueGame) return false;
    const key = `${new Date(game.kickoffAt).toISOString()}:${[game.teamCode, game.opponentCode].sort().join("-")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
