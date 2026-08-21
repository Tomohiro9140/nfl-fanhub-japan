import { describe, expect, it } from "vitest";
import { selectRelevantCalendarGames } from "./leagueDashboardPayload";

describe("selectRelevantCalendarGames", () => {
  it("keeps the favorite's full schedule and only the next seven days for other clubs", () => {
    const now = new Date("2026-08-17T00:00:00.000Z");
    const games = [
      { teamCode: "BUF", opponentCode: "MIA", kickoffAt: new Date("2026-10-01T00:00:00.000Z") },
      { teamCode: "MIA", opponentCode: "BUF", kickoffAt: new Date("2026-10-01T00:00:00.000Z") },
      { teamCode: "NYJ", opponentCode: "NE", kickoffAt: new Date("2026-08-20T00:00:00.000Z") },
      { teamCode: "NE", opponentCode: "NYJ", kickoffAt: new Date("2026-08-20T00:00:00.000Z") },
      { teamCode: "DAL", opponentCode: "PHI", kickoffAt: new Date("2026-09-20T00:00:00.000Z") },
    ];

    expect(selectRelevantCalendarGames(games, "BUF", now)).toEqual([
      games[0],
      games[2],
    ]);
  });

  it("keeps all clubs' games from earlier on the current Japan calendar day", () => {
    const now = new Date("2026-08-21T06:00:00.000Z"); // 15:00 JST
    const games = [
      { teamCode: "LV", opponentCode: "HOU", kickoffAt: new Date("2026-08-20T17:00:00.000Z") }, // 02:00 JST
      { teamCode: "DAL", opponentCode: "PHI", kickoffAt: new Date("2026-08-21T18:00:00.000Z") },
    ];

    expect(selectRelevantCalendarGames(games, "BUF", now)).toEqual(games);
  });
});
