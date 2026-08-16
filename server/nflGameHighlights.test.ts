import { describe, expect, it } from "vitest";
import { isVerifiedNflHighlightPage, nflHighlightUrlForGame } from "./nflGameHighlights";

const indAtNe = { externalId: "ind-ne-pre-1", seasonPhase: "preseason" as const, weekLabel: "PRESEASON WEEK 1", awayTeamCode: "IND", homeTeamCode: "NE", gameState: "FINAL" };

describe("NFL official game highlights", () => {
  it("derives the NFL-published IND at NE preseason highlight URL", () => {
    expect(nflHighlightUrlForGame(indAtNe)).toBe("https://www.nfl.com/videos/colts-vs-patriots-highlights-preseason-week-1");
  });

  it("requires both official team names and the correct week before accepting a generated page", () => {
    expect(isVerifiedNflHighlightPage("Indianapolis Colts vs. New England Patriots highlights | Preseason Week 1", indAtNe)).toBe(true);
    expect(isVerifiedNflHighlightPage("Indianapolis Colts vs. New England Patriots highlights | Preseason Week 2", indAtNe)).toBe(false);
  });
});
