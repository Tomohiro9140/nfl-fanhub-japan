export type LeagueCalendarGame = {
  id: number;
  teamCode: string;
  opponentCode: string;
  homeAway: "home" | "away";
  seasonPhase: "preseason" | "regular" | "postseason";
  weekLabel: string | null;
  kickoffAt: Date;
  broadcast: string | null;
  sourceUrl: string;
  daznUrl: string | null;
  gameState: string | null;
  awayScore: number | null;
  homeScore: number | null;
};

/** Converts a canonical league game row into the selected team's perspective. */
export function getFavoriteSchedule(games: LeagueCalendarGame[], favoriteCode: string) {
  return games
    .filter((game) => game.teamCode === favoriteCode || game.opponentCode === favoriteCode)
    .map((game) => game.teamCode === favoriteCode ? game : {
      ...game,
      teamCode: favoriteCode,
      opponentCode: game.teamCode,
      homeAway: game.homeAway === "home" ? "away" as const : "home" as const,
    })
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime());
}

/** Returns every league game in the rolling seven-day window starting now. */
export function getNextSevenDayGames(games: LeagueCalendarGame[], now: Date) {
  const start = now.getTime();
  const end = start + 7 * 24 * 60 * 60 * 1000;
  return games
    .filter((game) => {
      const kickoff = new Date(game.kickoffAt).getTime();
      return kickoff >= start && kickoff < end;
    })
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime());
}

/** Calendar rows intentionally use abbreviations to retain a compact mobile layout. */
export function abbreviatedMatchup(game: LeagueCalendarGame) {
  return `${game.teamCode} ${game.homeAway === "away" ? "@" : "vs."} ${game.opponentCode}`;
}

export function seasonWeekLabel(game: LeagueCalendarGame) {
  const phase = game.seasonPhase === "preseason" ? "PRE" : game.seasonPhase === "postseason" ? "POST" : "REG";
  const week = game.weekLabel?.match(/(\d+)/)?.[1];
  return week ? `${phase} · WEEK ${week}` : phase;
}
