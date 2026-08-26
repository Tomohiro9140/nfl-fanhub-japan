import { describe, expect, it } from "vitest";
import { gameStatsAtlasHref, restoreGameStatsScrollPosition } from "./gameStatsView";

describe("Game Stats view helpers", () => {
  it("builds an Atlas name-search link for a player", () => {
    expect(gameStatsAtlasHref("D. Lock")).toBe("/atlas/?q=D.%20Lock");
  });

  it("restores the saved dialog scroll position after expanding a category", () => {
    const target = { scrollTop: 640 };
    restoreGameStatsScrollPosition(target, 184);
    expect(target.scrollTop).toBe(184);
  });
});
