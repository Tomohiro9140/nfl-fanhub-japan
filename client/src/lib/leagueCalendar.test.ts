import { describe, expect, it } from "vitest";
import { abbreviatedMatchup, getFavoriteSchedule, getNextSevenDayGames, type LeagueCalendarGame } from "./leagueCalendar";

const games: LeagueCalendarGame[] = [
  { id: 1, teamCode: "CLE", opponentCode: "BUF", homeAway: "home", seasonPhase: "preseason", weekLabel: "Week 2", kickoffAt: new Date("2026-08-22T17:00:00.000Z"), broadcast: null, sourceUrl: "https://nfl.com/schedules", daznUrl: null },
  { id: 2, teamCode: "BUF", opponentCode: "PIT", homeAway: "away", seasonPhase: "regular", weekLabel: "Week 1", kickoffAt: new Date("2026-09-13T17:00:00.000Z"), broadcast: "CBS", sourceUrl: "https://nfl.com/schedules", daznUrl: null },
  { id: 3, teamCode: "DAL", opponentCode: "NYG", homeAway: "away", seasonPhase: "preseason", weekLabel: "Week 2", kickoffAt: new Date("2026-08-20T17:00:00.000Z"), broadcast: null, sourceUrl: "https://nfl.com/schedules", daznUrl: null },
  { id: 4, teamCode: "MIA", opponentCode: "NYJ", homeAway: "home", seasonPhase: "preseason", weekLabel: "Week 3", kickoffAt: new Date("2026-08-24T17:00:00.000Z"), broadcast: null, sourceUrl: "https://nfl.com/schedules", daznUrl: null },
];

describe("league calendar presentation", () => {
  it("returns every selected-team game in the team's own home/away perspective", () => {
    const bills = getFavoriteSchedule(games, "BUF");
    expect(bills).toHaveLength(2);
    expect(abbreviatedMatchup(bills[0]!)).toBe("BUF @ CLE");
    expect(abbreviatedMatchup(bills[1]!)).toBe("BUF @ PIT");
  });

  it("returns all league games that kick off in the next seven days", () => {
    const nextSevenDays = getNextSevenDayGames(games, new Date("2026-08-16T00:00:00.000Z"));
    expect(nextSevenDays.map((game) => game.id)).toEqual([3, 1]);
  });
});
