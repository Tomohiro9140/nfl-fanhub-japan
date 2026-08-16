import { describe, expect, it } from "vitest";
import { nflGameHighlightsUrl, officialHighlightsHref } from "./nflHighlights";

describe("NFL official highlights navigation", () => {
  it("uses the NFL-published game highlights channel", () => {
    expect(nflGameHighlightsUrl).toBe("https://www.nfl.com/videos/channel/game-highlights-vc");
    expect(officialHighlightsHref()).toBe(nflGameHighlightsUrl);
    expect(officialHighlightsHref("https://www.nfl.com/videos/colts-vs-patriots-highlights-preseason-week-1")).toBe("https://www.nfl.com/videos/colts-vs-patriots-highlights-preseason-week-1");
    expect(officialHighlightsHref("https://untrusted.example/video")).toBe(nflGameHighlightsUrl);
  });
});
