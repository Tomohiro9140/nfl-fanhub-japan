import { describe, expect, it } from "vitest";
import { formatDownEfficiency, gameBookPlayerKey, gameStatsAtlasHref, restoreGameStatsScrollPosition } from "./gameStatsView";

describe("Game Stats view helpers", () => {
  it("builds an Atlas direct-profile link from a resolved player ID", () => {
    expect(gameStatsAtlasHref("00-0031234")).toBe("/atlas/?player=00-0031234");
    expect(gameBookPlayerKey("SEA", "D. LOCK")).toBe("SEA:D. LOCK");
  });

  it("formats down efficiency with a space before the percentage", () => {
    expect(formatDownEfficiency("6-17-35.3%")).toBe("6-17 35.3%");
    expect(formatDownEfficiency("—")).toBe("—");
  });

  it("restores the saved dialog scroll position after expanding a category", () => {
    const target = { scrollTop: 640 };
    restoreGameStatsScrollPosition(target, 184);
    expect(target.scrollTop).toBe(184);
  });
});
