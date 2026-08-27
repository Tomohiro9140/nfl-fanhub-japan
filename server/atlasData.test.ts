import { describe, expect, it } from "vitest";
import { atlasPositionGroup, normalizeAtlasText, parseAtlasCsv, reconcileAtlasCurrentRoster, resolveAtlasGameBookPlayerId, summarizeAtlasStats } from "./atlasData";

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

  it("resolves an official Game Book abbreviation only when its team candidates have one full-name match", () => {
    expect(resolveAtlasGameBookPlayerId("D. LOCK", [{ id: "00-0035157", name: "Drew Lock", team: "SEA" }])).toBe("00-0035157");
    expect(resolveAtlasGameBookPlayerId("J. SMITH", [{ id: "one", name: "John Smith", team: "SEA" }, { id: "two", name: "James Smith", team: "SEA" }])).toBeNull();
    expect(resolveAtlasGameBookPlayerId("J. SMITH", [{ id: "one", name: "John Smith", team: "NYG" }])).toBe("one");
  });

  it("uses a fresh official roster for a trade and removes a stale player only after complete coverage", () => {
    const masters = new Map([
      ["00-boutte", { gsis_id: "00-boutte", display_name: "Kayshon Boutte", latest_team: "NE", position: "WR", jersey_number: "9" }],
      ["00-released", { gsis_id: "00-released", display_name: "Released Player", latest_team: "NE", position: "WR", jersey_number: "1" }],
    ]);
    const rosterRows = [
      { gsis_id: "00-boutte", display_name: "Kayshon Boutte", team: "NE", position: "WR", jersey_number: "9", week: "1" },
      { gsis_id: "00-released", display_name: "Released Player", team: "NE", position: "WR", jersey_number: "1", week: "1" },
    ];
    const now = new Date("2026-08-27T14:00:00Z");
    const officialRoster = [
      { teamCode: "HOU", playerName: "Kayshon Boutte", jerseyNumber: "88", position: "WR", fetchedAt: now },
      { teamCode: "NE", playerName: "Another Patriot", jerseyNumber: "2", position: "QB", fetchedAt: now },
    ];
    const reconciled = reconcileAtlasCurrentRoster({ rosterRows, masterById: masters, officialRoster, expectedTeamCodes: ["HOU", "NE"], now });
    expect(reconciled.current.get("00-boutte")).toMatchObject({ team: "HOU", jersey_number: "88" });
    expect(reconciled.current.has("00-released")).toBe(false);
    expect(reconciled.officiallyAbsentIds.has("00-released")).toBe(true);
  });

  it("does not infer a release when one required official team snapshot is missing", () => {
    const masters = new Map([["00-player", { gsis_id: "00-player", display_name: "Still Current", latest_team: "NE", position: "WR", jersey_number: "1" }]]);
    const rosterRows = [{ gsis_id: "00-player", display_name: "Still Current", team: "NE", position: "WR", jersey_number: "1", week: "1" }];
    const now = new Date("2026-08-27T14:00:00Z");
    const reconciled = reconcileAtlasCurrentRoster({
      rosterRows,
      masterById: masters,
      officialRoster: [{ teamCode: "HOU", playerName: "Another Texan", jerseyNumber: "3", position: "QB", fetchedAt: now }],
      expectedTeamCodes: ["HOU", "NE"],
      now,
    });
    expect(reconciled.current.has("00-player")).toBe(true);
    expect(reconciled.officiallyAbsentIds.size).toBe(0);
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

  it("uses the source game total when a pre-aggregated season row has no game id", () => {
    const summary = summarizeAtlasStats([
      { player_id: "00-test", season: "2025", team: "KC", games: "14", attempts: "581", completions: "365", passing_yards: "3587", passing_tds: "22" },
    ], "00-test", "QB");
    expect(summary.seasons[0].values.games).toBe(14);
  });

  it("retains the original ATLAS quarterback detail columns and season total row", () => {
    const summary = summarizeAtlasStats([
      { player_id: "00-test", season: "2025", week: "1", game_id: "one", team: "KC", attempts: "20", completions: "15", passing_yards: "240", passing_tds: "2", passing_interceptions: "1", rushing_yards: "14", rushing_tds: "1", passing_cpoe: "3" },
      { player_id: "00-test", season: "2025", week: "2", game_id: "two", team: "LAR", attempts: "25", completions: "18", passing_yards: "280", passing_tds: "3", sacks_suffered: "2", passing_cpoe: "4" },
    ], "00-test", "QB");
    expect(summary.columns.map((column) => column.label)).toEqual(expect.arrayContaining(["YPA", "RATING", "SACKED", "RUSH YDS", "CPOE"]));
    expect(summary.seasons).toHaveLength(3);
    expect(summary.seasons.at(-1)?.team).toBe("TOTAL");
    expect(summary.seasons.at(-1)?.values.passingYards).toBe(520);
  });
});
