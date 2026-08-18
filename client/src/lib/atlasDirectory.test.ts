import { describe, expect, it } from "vitest";
import { filterAtlasPlayers, type AtlasPlayer } from "./atlasDirectory";

const players: AtlasPlayer[] = [
  { id: 1, teamCode: "BUF", playerName: "Josh Allen", jerseyNumber: "17", position: "QB", rosterStatus: "Active", sourceUrl: "https://example.com/buf", fetchedAt: new Date("2026-08-18") },
  { id: 2, teamCode: "KC", playerName: "Patrick Mahomes", jerseyNumber: "15", position: "QB", rosterStatus: "Active", sourceUrl: "https://example.com/kc", fetchedAt: new Date("2026-08-18") },
];

describe("filterAtlasPlayers", () => {
  it("filters the current official directory by team and a player query", () => {
    expect(filterAtlasPlayers(players, "BUF", "")).toHaveLength(1);
    expect(filterAtlasPlayers(players, "ALL", "mahomes")[0]?.teamCode).toBe("KC");
    expect(filterAtlasPlayers(players, "ALL", "17")[0]?.playerName).toBe("Josh Allen");
  });
});
