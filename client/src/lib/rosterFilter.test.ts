import { describe, expect, it } from "vitest";
import { filterRosterByStatus } from "./rosterFilter";

const roster = [
  { playerName: "Active One", rosterStatus: "Active" },
  { playerName: "Active Two", rosterStatus: "Active" },
  { playerName: "Reserve One", rosterStatus: "Reserve/Injured" },
  { playerName: "Reserve Two", rosterStatus: "Reserve/Physically Unable to Perform" },
  { playerName: "Reserve Three", rosterStatus: "Reserve/Non-Football Injury" },
];

describe("filterRosterByStatus", () => {
  it("keeps the compact active preview for ALL while returning every player in a selected reserve category", () => {
    expect(filterRosterByStatus(roster, "ALL").map((entry) => entry.playerName)).toEqual(["Active One", "Active Two", "Reserve One"]);
    expect(filterRosterByStatus(roster, "Reserve/Physically Unable to Perform").map((entry) => entry.playerName)).toEqual(["Reserve Two"]);
    expect(filterRosterByStatus(roster, "Reserve/Non-Football Injury").map((entry) => entry.playerName)).toEqual(["Reserve Three"]);
  });
});
