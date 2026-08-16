import { describe, expect, it } from "vitest";
import { nflTeams } from "./nflTeams";

const expectedBrands: Record<string, { primary: string; accent: string; onPrimary: string }> = {
  ARI: { primary: "#97233F", accent: "#000000", onPrimary: "#FFFFFF" }, ATL: { primary: "#A71930", accent: "#000000", onPrimary: "#FFFFFF" }, BAL: { primary: "#241773", accent: "#9E7C0C", onPrimary: "#FFFFFF" }, BUF: { primary: "#00338D", accent: "#C60C30", onPrimary: "#FFFFFF" }, CAR: { primary: "#0085CA", accent: "#101820", onPrimary: "#FFFFFF" }, CHI: { primary: "#0B162A", accent: "#C83803", onPrimary: "#FFFFFF" }, CIN: { primary: "#FB4F14", accent: "#101820", onPrimary: "#101820" }, CLE: { primary: "#311D00", accent: "#FF3C00", onPrimary: "#FFFFFF" },
  DAL: { primary: "#003594", accent: "#869397", onPrimary: "#FFFFFF" }, DEN: { primary: "#FB4F14", accent: "#002244", onPrimary: "#101820" }, DET: { primary: "#0076B6", accent: "#B0B7BC", onPrimary: "#FFFFFF" }, GB: { primary: "#203731", accent: "#FFB612", onPrimary: "#FFFFFF" }, HOU: { primary: "#03202F", accent: "#A71930", onPrimary: "#FFFFFF" }, IND: { primary: "#002C5F", accent: "#A2AAAD", onPrimary: "#FFFFFF" }, JAX: { primary: "#006778", accent: "#D7A22A", onPrimary: "#FFFFFF" }, KC: { primary: "#E31837", accent: "#FFB81C", onPrimary: "#FFFFFF" },
  LAC: { primary: "#0080C6", accent: "#FFC20E", onPrimary: "#FFFFFF" }, LAR: { primary: "#003594", accent: "#FFA300", onPrimary: "#FFFFFF" }, LV: { primary: "#000000", accent: "#A5ACAF", onPrimary: "#FFFFFF" }, MIA: { primary: "#008E97", accent: "#FC4C02", onPrimary: "#FFFFFF" }, MIN: { primary: "#4F2683", accent: "#FFC62F", onPrimary: "#FFFFFF" }, NE: { primary: "#002244", accent: "#C60C30", onPrimary: "#FFFFFF" }, NO: { primary: "#101820", accent: "#D3BC8D", onPrimary: "#FFFFFF" }, NYG: { primary: "#0B2265", accent: "#A71930", onPrimary: "#FFFFFF" },
  NYJ: { primary: "#125740", accent: "#FFFFFF", onPrimary: "#FFFFFF" }, PHI: { primary: "#004C54", accent: "#A5ACAF", onPrimary: "#FFFFFF" }, PIT: { primary: "#101820", accent: "#FFB612", onPrimary: "#FFFFFF" }, SEA: { primary: "#002244", accent: "#69BE28", onPrimary: "#FFFFFF" }, SF: { primary: "#AA0000", accent: "#B3995D", onPrimary: "#FFFFFF" }, TB: { primary: "#D50A0A", accent: "#FF7900", onPrimary: "#FFFFFF" }, TEN: { primary: "#0C2340", accent: "#4B92DB", onPrimary: "#FFFFFF" }, WAS: { primary: "#5A1414", accent: "#FFB612", onPrimary: "#FFFFFF" },
};

describe("NFL team selector brands", () => {
  it("assigns a complete team-specific brand to every one of the 32 selectable teams", () => {
    expect(nflTeams).toHaveLength(32);
    expect(Object.fromEntries(nflTeams.map((team) => [team.code, team.brand]))).toEqual(expectedBrands);
  });

  it("uses valid hex colors for the icon background, border, and abbreviation", () => {
    for (const team of nflTeams) {
      expect(team.brand.primary).toMatch(/^#[0-9A-F]{6}$/);
      expect(team.brand.accent).toMatch(/^#[0-9A-F]{6}$/);
      expect(team.brand.onPrimary).toMatch(/^#[0-9A-F]{6}$/);
    }
  });
});
