import { describe, expect, it } from "vitest";
import { attachOfficialScore, findOfficialScoreForGame } from "./gameStatus";

const scores = [
  { awayTeamCode: "BUF", homeTeamCode: "CLE", weekLabel: "PRESEASON WEEK 2", gameState: "FINAL", awayScore: 24, homeScore: 17 },
  { awayTeamCode: "BUF", homeTeamCode: "PIT", weekLabel: "WEEK 1", gameState: "FINAL", awayScore: 20, homeScore: 14 },
];

describe("official schedule/score joining", () => {
  it("joins a score even when a team schedule stores the home team perspective", () => {
    const game = { teamCode: "CLE", opponentCode: "BUF", weekLabel: "Week 2" };
    expect(findOfficialScoreForGame(scores, game)).toEqual(scores[0]);
    expect(attachOfficialScore(game, scores)).toMatchObject({ gameState: "FINAL", awayScore: 24, homeScore: 17 });
  });

  it("does not leak a score from the same teams in a different week", () => {
    expect(attachOfficialScore({ teamCode: "BUF", opponentCode: "PIT", weekLabel: "Week 3" }, scores)).toMatchObject({ gameState: null, awayScore: null, homeScore: null });
  });

  it("keeps a playoff rematch separate from the regular-season meeting", () => {
    const withPlayoff = [...scores, { awayTeamCode: "PIT", homeTeamCode: "BUF", weekLabel: "WILD CARD", gameState: "FINAL", awayScore: 10, homeScore: 31 }];
    expect(findOfficialScoreForGame(withPlayoff, { teamCode: "BUF", opponentCode: "PIT", weekLabel: "Week 1" })).toEqual(scores[1]);
    expect(findOfficialScoreForGame(withPlayoff, { teamCode: "BUF", opponentCode: "PIT", weekLabel: "WILD CARD" })).toEqual(withPlayoff[2]);
    expect(findOfficialScoreForGame(withPlayoff, { teamCode: "BUF", opponentCode: "PIT", weekLabel: "DIVISIONAL" })).toBeUndefined();
  });
});
