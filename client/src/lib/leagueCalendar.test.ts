import { describe, expect, it } from "vitest";
import { nflTeams } from "./nflTeams";
import { abbreviatedMatchup, getFavoriteLatestResults, getFavoriteSchedule, getNextSevenDayGames, seasonWeekLabel, type LeagueCalendarGame } from "./leagueCalendar";

const games: LeagueCalendarGame[] = [
  { id: 1, teamCode: "CLE", opponentCode: "BUF", homeAway: "home", seasonPhase: "preseason", weekLabel: "Week 2", kickoffAt: new Date("2026-08-22T17:00:00.000Z"), broadcast: null, sourceUrl: "https://nfl.com/schedules", daznUrl: null, gameState: null, awayScore: null, homeScore: null },
  { id: 2, teamCode: "BUF", opponentCode: "PIT", homeAway: "away", seasonPhase: "regular", weekLabel: "Week 1", kickoffAt: new Date("2026-09-13T17:00:00.000Z"), broadcast: "CBS", sourceUrl: "https://nfl.com/schedules", daznUrl: null, gameState: null, awayScore: null, homeScore: null },
  { id: 3, teamCode: "DAL", opponentCode: "NYG", homeAway: "away", seasonPhase: "preseason", weekLabel: "Week 2", kickoffAt: new Date("2026-08-20T17:00:00.000Z"), broadcast: null, sourceUrl: "https://nfl.com/schedules", daznUrl: null, gameState: null, awayScore: null, homeScore: null },
  { id: 4, teamCode: "MIA", opponentCode: "NYJ", homeAway: "home", seasonPhase: "preseason", weekLabel: "Week 3", kickoffAt: new Date("2026-08-24T17:00:00.000Z"), broadcast: null, sourceUrl: "https://nfl.com/schedules", daznUrl: null, gameState: null, awayScore: null, homeScore: null },
];

describe("league calendar presentation", () => {
  it("returns every selected-team game in the team's own home/away perspective", () => {
    const bills = getFavoriteSchedule(games, "BUF");
    expect(bills).toHaveLength(2);
    expect(abbreviatedMatchup(bills[0]!)).toBe("BUF @ CLE");
    expect(abbreviatedMatchup(bills[1]!)).toBe("BUF @ PIT");
  });

  it("never falls back to other clubs when the selected team has no latest result", () => {
    const results = [
      { id: 1, awayTeamCode: "LV", homeTeamCode: "HOU" },
      { id: 2, awayTeamCode: "BUF", homeTeamCode: "PIT" },
    ];

    expect(getFavoriteLatestResults(results, "MIA")).toEqual([]);
    expect(getFavoriteLatestResults(results, "LV").map((game) => game.id)).toEqual([1]);
  });

  it("filters latest results to the selected club for all 32 teams", () => {
    const results = nflTeams.map((team, index) => ({
      id: index + 1,
      awayTeamCode: team.code,
      homeTeamCode: "NFL",
    }));

    for (const team of nflTeams) {
      expect(getFavoriteLatestResults(results, team.code).map((game) => game.awayTeamCode)).toEqual([team.code]);
    }
  });

  it("keeps the last completed game through a bye week without falling back to another club", () => {
    const results = [
      { id: 1, weekLabel: "REGULAR WEEK 6", awayTeamCode: "BUF", homeTeamCode: "NYJ" },
      { id: 2, weekLabel: "REGULAR WEEK 7", awayTeamCode: "MIA", homeTeamCode: "NYJ" },
    ];

    expect(getFavoriteLatestResults(results, "BUF")).toEqual([results[0]]);
  });

  it("uses the official away club first with @ for either stored team perspective", () => {
    expect(abbreviatedMatchup(games[0]!)).toBe("BUF @ CLE");
    expect(abbreviatedMatchup({ ...games[0]!, teamCode: "BUF", opponentCode: "CLE", homeAway: "away" })).toBe("BUF @ CLE");
  });

  it("returns all league games that kick off in the next seven days", () => {
    const nextSevenDays = getNextSevenDayGames(games, new Date("2026-08-16T00:00:00.000Z"));
    expect(nextSevenDays.map((game) => game.id)).toEqual([3, 1]);
  });

  it("keeps games from earlier on the current Japan calendar day", () => {
    const todayGame = { ...games[3]!, id: 5, kickoffAt: new Date("2026-08-21T00:00:00.000Z") }; // 09:00 JST
    const nextJapanDay = { ...games[3]!, id: 6, kickoffAt: new Date("2026-08-28T06:00:00.000Z") };
    const nextSevenDays = getNextSevenDayGames([todayGame, nextJapanDay], new Date("2026-08-21T06:00:00.000Z")); // 15:00 JST

    expect(nextSevenDays.map((game) => game.id)).toEqual([5]);
  });

  it("always exposes the phase and numeric week together", () => {
    expect(seasonWeekLabel(games[0]!)).toBe("PRE · WEEK 2");
    expect(seasonWeekLabel(games[1]!)).toBe("REG · WEEK 1");
  });
});
