import { describe, expect, it } from "vitest";
import { parseOfficialGameBookTeamStats, parseOfficialGameCenterTables } from "./officialGameStats";

describe("official Game Stats parsers", () => {
  it("reads only the requested Final Team Statistics facts from an official Game Book text block", () => {
    const stats = parseOfficialGameBookTeamStats(`
Final Team Statistics Home Visitor
25:54 34:06 TIME OF POSSESSION
251 277 TOTAL NET YARDS
3-9-33.3% 6-17-35.3% THIRD DOWN EFFICIENCY
0-1-0.0% 1-3-33.3% FOURTH DOWN EFFICIENCY
134 149 NET YARDS PASSING
2-21 3-19 Times thrown - yards lost attempting to pass
117 128 NET YARDS RUSHING
25-18-2 32-21-0 PASS ATTEMPTS-COMPLETIONS-HAD INTERCEPTED
14-129 11-100 PENALTIES Number and Yards
1-1 1-0 FUMBLES Number and Lost
`);
    expect(stats).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "timeOfPossession", away: "25:54", home: "34:06" }),
      expect.objectContaining({ key: "thirdDown", away: "3-9-33.3%", home: "6-17-35.3%" }),
      expect.objectContaining({ key: "sacksYardsLost", away: "2-21", home: "3-19" }),
      expect.objectContaining({ key: "turnovers", away: "3", home: "0" }),
    ]));
  });

  it("extracts structured official player rows from the Game Center serialized table", () => {
    const html = String.raw`<script>{\"table\":{\"columns\":[{\"title\":\"PLAYER\"},{\"title\":\"YDS\"}],\"rows\":[[{\"text\":\"D. LOCK\"},{\"text\":103}]]},\"title\":\"SEA PASSING\"}</script>`;
    expect(parseOfficialGameCenterTables(html)).toEqual([expect.objectContaining({ title: "SEA PASSING" })]);
  });
});
