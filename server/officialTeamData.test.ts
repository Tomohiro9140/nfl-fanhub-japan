import { describe, expect, it } from "vitest";
import { getOfficialTeamDataSources, parseOfficialRosterPage, parseOfficialSchedulePage, TEAM_DOMAINS } from "./officialTeamData";

const scheduleFixture = `<div class="nfl-o-matchup-cards" data-gametime="08/22/2026 13:00:00 -04:00"><p class="nfl-o-matchup-cards__date-info"><strong>WEEK 2</strong></p><p class="nfl-o-matchup-cards__team-game-location"><span>AT</span></p><p>Buffalo Bills</p><p>Cleveland Browns</p><span class="nfl-o-matchup-cards__venue--location">Huntington Bank Field</span></div>`;
const rosterFixture = `<span class="nfl-o-roster__title-status">Active</span><tr><td><span class="nfl-o-roster__player-name"><a>Josh Allen</a></span></td><td>17</td><td>QB</td></tr><span class="nfl-o-roster__title-status">Reserve/Injured</span><tr><td><span class="nfl-o-roster__player-name"><a>Demo Player</a></span></td><td>8</td><td>WR</td></tr>`;
const expectedOfficialDomains = {
  ARI: "azcardinals.com", ATL: "atlantafalcons.com", BAL: "baltimoreravens.com", BUF: "buffalobills.com", CAR: "panthers.com", CHI: "chicagobears.com", CIN: "bengals.com", CLE: "clevelandbrowns.com", DAL: "dallascowboys.com", DEN: "denverbroncos.com", DET: "detroitlions.com", GB: "packers.com", HOU: "houstontexans.com", IND: "colts.com", JAX: "jaguars.com", KC: "chiefs.com", LAC: "chargers.com", LAR: "therams.com", LV: "raiders.com", MIA: "miamidolphins.com", MIN: "vikings.com", NE: "patriots.com", NO: "neworleanssaints.com", NYG: "giants.com", NYJ: "newyorkjets.com", PHI: "philadelphiaeagles.com", PIT: "steelers.com", SF: "49ers.com", SEA: "seahawks.com", TB: "buccaneers.com", TEN: "titansonline.com", WAS: "commanders.com",
};

describe("official team data parsers", () => {
  it("maps every NFL team to an official Schedule and Roster domain", () => {
    expect(Object.keys(TEAM_DOMAINS)).toHaveLength(32);
    expect(TEAM_DOMAINS).toEqual(expectedOfficialDomains);
    for (const [teamCode, domain] of Object.entries(expectedOfficialDomains)) {
      expect(getOfficialTeamDataSources(teamCode)).toEqual({ scheduleUrl: `https://www.${domain}/schedule/`, rosterUrl: `https://www.${domain}/team/players-roster/` });
    }
  });
  it("parses an official schedule card into a real away fixture", () => {
    const result = parseOfficialSchedulePage(scheduleFixture, "BUF", "https://www.buffalobills.com/schedule/");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ teamCode: "BUF", opponentCode: "CLE", homeAway: "away", seasonPhase: "preseason", weekLabel: "WEEK 2" });
  });
  it("skips official schedule placeholder dates", () => {
    const placeholder = scheduleFixture.replace("08/22/2026", "01/01/0001");
    expect(parseOfficialSchedulePage(placeholder, "BUF", "https://www.buffalobills.com/schedule/")).toEqual([]);
  });
  it("preserves official roster buckets and player positions", () => {
    const result = parseOfficialRosterPage(rosterFixture, "BUF", "https://www.buffalobills.com/team/players-roster/");
    expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ playerName: "Josh Allen", position: "QB", rosterStatus: "Active" }), expect.objectContaining({ playerName: "Demo Player", rosterStatus: "Reserve/Injured" })]));
  });
});
