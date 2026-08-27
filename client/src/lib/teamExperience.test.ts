import { describe, expect, it } from "vitest";
import { spoilerModeForTeamChange } from "./teamExperience";

describe("spoilerModeForTeamChange", () => {
  it("turns protection back on when the favorite team changes", () => {
    expect(spoilerModeForTeamChange("BUF", "KC", false)).toBe(true);
  });

  it("preserves the viewer setting when the same team is selected", () => {
    expect(spoilerModeForTeamChange("BUF", "BUF", false)).toBe(false);
    expect(spoilerModeForTeamChange("BUF", "BUF", true)).toBe(true);
  });
});
