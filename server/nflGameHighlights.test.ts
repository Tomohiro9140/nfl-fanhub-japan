import { describe, expect, it } from "vitest";
import { isVerifiedNflHighlightPage, nflHighlightUrlCandidatesForGame, nflHighlightUrlForGame } from "./nflGameHighlights";

const indAtNe = { externalId: "ind-ne-pre-1", seasonPhase: "preseason" as const, weekLabel: "PRESEASON WEEK 1", awayTeamCode: "IND", homeTeamCode: "NE", gameState: "FINAL" };

describe("NFL official game highlights", () => {
  it("derives the NFL-published IND at NE preseason highlight URL", () => {
    expect(nflHighlightUrlForGame(indAtNe)).toBe("https://www.nfl.com/videos/colts-vs-patriots-highlights-preseason-week-1");
  });

  it("requires both official team names and the correct week before accepting a generated page", () => {
    expect(isVerifiedNflHighlightPage("Indianapolis Colts vs. New England Patriots highlights | Preseason Week 1", indAtNe)).toBe(true);
    expect(isVerifiedNflHighlightPage("Indianapolis Colts vs. New England Patriots highlights | Preseason Week 2", indAtNe)).toBe(false);
  });

  it("tries the official preseason URL variant when NFL omits the highlights segment", () => {
    const ariAtLv = { externalId: "ari-lv-pre-1", seasonPhase: "preseason" as const, weekLabel: "PRESEASON WEEK 1", awayTeamCode: "ARI", homeTeamCode: "LV", gameState: "FINAL" };
    expect(nflHighlightUrlCandidatesForGame(ariAtLv)).toContain("https://www.nfl.com/videos/cardinals-vs-raiders-preseason-week-1");
    expect(isVerifiedNflHighlightPage("Arizona Cardinals vs. Las Vegas Raiders highlights | Preseason Week 1 of the 2026 season", ariAtLv)).toBe(true);
  });
});
