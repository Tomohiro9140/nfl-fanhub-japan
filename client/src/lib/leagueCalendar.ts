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

/** Keeps every card on the current Japan calendar day while retaining the rolling seven-day future range. */
export function getNextSevenDayGames(games: LeagueCalendarGame[], now: Date) {
  const dayParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const valueFor = (type: "year" | "month" | "day") => Number(dayParts.find((part) => part.type === type)?.value);
  // Japan is UTC+9 year-round. Calendar-day boundaries ensure games remain listed until JST midnight.
  const start = Date.UTC(valueFor("year"), valueFor("month") - 1, valueFor("day")) - 9 * 60 * 60 * 1000;
  const end = now.getTime() + 7 * 24 * 60 * 60 * 1000;
  return games
    .filter((game) => {
      const kickoff = new Date(game.kickoffAt).getTime();
      return kickoff >= start && kickoff < end;
    })
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime());
}

/** Calendar rows intentionally use abbreviations to retain a compact mobile layout. */
export function abbreviatedMatchup(game: LeagueCalendarGame) {
  const awayTeam = game.homeAway === "away" ? game.teamCode : game.opponentCode;
  const homeTeam = game.homeAway === "home" ? game.teamCode : game.opponentCode;
  return `${awayTeam} @ ${homeTeam}`;
}

export function seasonWeekLabel(game: LeagueCalendarGame) {
  const phase = game.seasonPhase === "preseason" ? "PRE" : game.seasonPhase === "postseason" ? "POST" : "REG";
  const week = game.weekLabel?.match(/(\d+)/)?.[1];
  return `${phase} · WEEK ${week ?? "TBD"}`;
}
