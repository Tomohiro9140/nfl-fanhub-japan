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
  const japanDayParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const japanDayValue = (type: "year" | "month" | "day") => Number(japanDayParts.find((part) => part.type === type)?.value);
  const japanDayStart = Date.UTC(japanDayValue("year"), japanDayValue("month") - 1, japanDayValue("day")) - 9 * 60 * 60 * 1_000;
  const seen = new Set<string>();
  return games.filter((game) => {
    const kickoff = new Date(game.kickoffAt).getTime();
    const isFavoriteSchedule = game.teamCode === favoriteTeamCode || game.opponentCode === favoriteTeamCode;
    const isTodayOrUpcomingLeagueGame = kickoff >= japanDayStart && kickoff < windowEnd;
    if (!isFavoriteSchedule && !isTodayOrUpcomingLeagueGame) return false;
    const key = `${new Date(game.kickoffAt).toISOString()}:${[game.teamCode, game.opponentCode].sort().join("-")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
