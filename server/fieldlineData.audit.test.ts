import { describe, expect, it } from "vitest";
import { FIELDLINE_TEAM_CODES, FIELDLINE_TEAM_NAMES, fieldlinePbpSource } from "./fieldlineData";

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
});
