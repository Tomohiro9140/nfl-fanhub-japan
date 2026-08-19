import { describe, expect, it } from "vitest";
import { atlasPositionGroup, normalizeAtlasText, parseAtlasCsv, summarizeAtlasStats } from "./atlasData";

describe("ATLAS data helpers", () => {
  it("parses quoted NFLverse CSV records", () => {
    expect(parseAtlasCsv('gsis_id,display_name,college\n00-1,"A, Player","Example U"\n')).toEqual([
      { gsis_id: "00-1", display_name: "A, Player", college: "Example U" },
    ]);
  });

  it("normalizes accented names and groups roster positions", () => {
    expect(normalizeAtlasText("José Núñez")).toBe("josenunez");
    expect(atlasPositionGroup("OT")).toBe("OL");
    expect(atlasPositionGroup("CB")).toBe("DB");
    expect(atlasPositionGroup("QB")).toBe("QB");
  });

  it("summarizes weekly player rows into a season line", () => {
    const summary = summarizeAtlasStats([
      { player_id: "00-test", season: "2025", week: "1", game_id: "one", team: "KC", attempts: "20", completions: "15", passing_yards: "240", passing_tds: "2" },
      { player_id: "00-test", season: "2025", week: "2", game_id: "two", team: "KC", attempts: "25", completions: "18", passing_yards: "280", passing_tds: "3" },
    ], "00-test", "QB");
    expect(summary.seasons).toHaveLength(1);
    expect(summary.seasons[0].values.passingYards).toBe(520);
    expect(summary.seasons[0].values.completionPct).toBe(73.3);
  });
});
