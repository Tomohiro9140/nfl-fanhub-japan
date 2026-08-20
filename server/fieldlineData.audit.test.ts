import { describe, expect, it } from "vitest";
import { FIELDLINE_TEAM_CODES, FIELDLINE_TEAM_NAMES, fieldlinePbpSource, fieldlineTotalYardsForPlay } from "./fieldlineData";

describe("FIELDLINE canonical data contract", () => {
  it("retains every NFL club and a stable nflverse source URL", () => {
    expect(FIELDLINE_TEAM_CODES).toHaveLength(32);
    expect(FIELDLINE_TEAM_CODES).toContain("NE");
    expect(FIELDLINE_TEAM_CODES).toContain("BUF");
    expect(FIELDLINE_TEAM_NAMES.NE).toBe("New England Patriots");
    expect(fieldlinePbpSource(2025)).toBe("https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_2025.parquet");
  });

  it("uses original FIELDLINE aliases for legacy nflverse team codes", () => {
    expect(FIELDLINE_TEAM_NAMES.WAS).toBe("Washington Commanders");
    expect(FIELDLINE_TEAM_NAMES.JAX).toBe("Jacksonville Jaguars");
  });

  it("keeps the original pass plus rush minus sack-yards definition of total yards", () => {
    expect(fieldlineTotalYardsForPlay({ passing_yards: 14, rushing_yards: 0, yards_gained: 14, sack: 0 })).toBe(14);
    expect(fieldlineTotalYardsForPlay({ passing_yards: 0, rushing_yards: -3, yards_gained: -3, sack: 0 })).toBe(-3);
    expect(fieldlineTotalYardsForPlay({ passing_yards: 0, rushing_yards: 0, yards_gained: -9, sack: 1 })).toBe(-9);
    expect(fieldlineTotalYardsForPlay({ passing_yards: 0, rushing_yards: 0, yards_gained: 17, sack: 0 })).toBe(0);
  });
});
