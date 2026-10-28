import { describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({ getOfficialScoreboardGamesForHighlightMatching: vi.fn(), upsertOfficialScoreboardHighlights: vi.fn() }));

import { findHighlightVideo, isPreseasonGame, scoreHighlightVideo, type HighlightableGame } from "./nflGameHighlights";

const game = (overrides: Partial<HighlightableGame>): HighlightableGame => ({
  externalId: "x",
  season: 2026,
  seasonPhase: "regular",
  weekLabel: "WEEK 7",
  awayTeamCode: "KC",
  homeTeamCode: "SEA",
  gameState: "FINAL",
  kickoffAt: new Date("2026-10-18T20:25:00Z"),
  ...overrides,
});
const video = (title: string, publishedAt = "2026-10-19T01:00:00Z", videoId = "abc") => ({ videoId, title, publishedAt: new Date(publishedAt) });

describe("NFL official YouTube highlight matching", () => {
  it("accepts the official game highlights title for the right week", () => {
    expect(scoreHighlightVideo(video("Kansas City Chiefs vs. Seattle Seahawks Game Highlights | NFL 2026 Season Week 7"), game({}))).toBe(2);
  });

  it("rejects a different week or a video published long after the game", () => {
    expect(scoreHighlightVideo(video("Chiefs vs. Seahawks Game Highlights | Week 8"), game({}))).toBe(0);
    expect(scoreHighlightVideo(video("Chiefs vs. Seahawks Game Highlights", "2026-11-20T00:00:00Z"), game({}))).toBe(0);
  });

  it("does not confuse teams that share a city", () => {
    const lacAtKc = game({ weekLabel: "WEEK 6", awayTeamCode: "LAC", homeTeamCode: "KC", kickoffAt: new Date("2026-10-11T20:25:00Z") });
    expect(scoreHighlightVideo(video("Los Angeles Rams vs. Kansas City Chiefs Game Highlights | Week 6", "2026-10-12T01:00:00Z"), lacAtKc)).toBe(0);
    expect(scoreHighlightVideo(video("Los Angeles Chargers vs. Kansas City Chiefs Game Highlights | Week 6", "2026-10-12T01:00:00Z"), lacAtKc)).toBe(2);
  });

  it("tolerates a missing plural s in the official title", () => {
    const minAtNo = game({ weekLabel: "WEEK 5", awayTeamCode: "MIN", homeTeamCode: "NO", kickoffAt: new Date("2026-10-11T17:00:00Z") });
    expect(scoreHighlightVideo(video("Minnesota Vikings vs New Orleans Saint Game Highlights | NFL 2026 Season Week 5", "2026-10-11T20:44:59Z"), minAtNo)).toBe(2);
  });

  it("accepts titles without a week (international games) when the publish date fits", () => {
    expect(scoreHighlightVideo(video("Chiefs vs. Seahawks Highlights | London Game"), game({}))).toBe(1);
  });

  it("prefers the full game highlights over other highlight videos", () => {
    const picked = findHighlightVideo([
      video("Chiefs vs. Seahawks: Top highlights from the 4th quarter", "2026-10-18T23:00:00Z", "q4"),
      video("Chiefs vs. Seahawks Game Highlights | Week 7", "2026-10-19T00:30:00Z", "full"),
    ], game({}));
    expect(picked?.videoId).toBe("full");
  });

  it("treats preseason games as out of scope", () => {
    expect(isPreseasonGame({ seasonPhase: "preseason", weekLabel: "PRESEASON WEEK 1" })).toBe(true);
    expect(isPreseasonGame({ seasonPhase: "regular", weekLabel: "PRESEASON WEEK 2" })).toBe(true);
    expect(isPreseasonGame({ seasonPhase: "regular", weekLabel: "WEEK 6" })).toBe(false);
  });
});
