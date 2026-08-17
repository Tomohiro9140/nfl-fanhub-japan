export type ScheduledGameForScore = { teamCode: string; opponentCode: string; weekLabel: string | null };
export type OfficialScoreForMatch = { awayTeamCode: string; homeTeamCode: string; weekLabel: string | null; gameState: string; awayScore: number | null; homeScore: number | null; nflHighlightUrl?: string | null };

function matchupKey(firstTeam: string, secondTeam: string) {
  return [firstTeam, secondTeam].sort().join("-");
}

function sameWeek(left: string | null, right: string | null) {
  const leftWeek = left?.match(/\d+/)?.[0];
  const rightWeek = right?.match(/\d+/)?.[0];
  return !leftWeek || !rightWeek || leftWeek === rightWeek;
}

/** Matches an official score to a schedule row by the two clubs and numeric week. */
export function findOfficialScoreForGame<T extends OfficialScoreForMatch>(scores: T[], game: ScheduledGameForScore) {
  return scores.find((score) => matchupKey(score.awayTeamCode, score.homeTeamCode) === matchupKey(game.teamCode, game.opponentCode) && sameWeek(score.weekLabel, game.weekLabel));
}

/** Adds nullable official score fields without inventing a result when no official score is available. */
export function attachOfficialScore<T extends ScheduledGameForScore, U extends OfficialScoreForMatch>(game: T, scores: U[]) {
  const score = findOfficialScoreForGame(scores, game);
  return { ...game, gameState: score?.gameState ?? null, awayScore: score?.awayScore ?? null, homeScore: score?.homeScore ?? null, nflHighlightUrl: score?.nflHighlightUrl ?? null };
}
