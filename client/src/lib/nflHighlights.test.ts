import { describe, expect, it } from "vitest";
import { nflGameHighlightsUrl, officialHighlightsHref } from "./nflHighlights";

describe("NFL official highlights navigation", () => {
  it("uses the NFL-published game highlights channel", () => {
    expect(nflGameHighlightsUrl).toBe("https://www.nfl.com/videos/channel/game-highlights-vc");
    expect(officialHighlightsHref()).toBe(nflGameHighlightsUrl);
  });
});
