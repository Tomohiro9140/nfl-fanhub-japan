import { describe, expect, it } from "vitest";
import { getOfficialTeamDataSources, normalizeOfficialText, parseNFLLeagueSchedulePage, parseOfficialRosterPage, parseOfficialSchedulePage, selectPreferredSchedule, TEAM_DOMAINS } from "./officialTeamData";

const scheduleFixture = `<div class="nfl-o-matchup-cards" data-gametime="08/22/2026 13:00:00 -04:00"><p class="nfl-o-matchup-cards__date-info"><strong>WEEK 2</strong></p><p class="nfl-o-matchup-cards__team-game-location"><span>AT</span></p><p>Buffalo Bills</p><p>Cleveland Browns</p><span class="nfl-o-matchup-cards__venue--location">Huntington Bank Field</span></div>`;
const rosterFixture = `<span class="nfl-o-roster__title-status">Active</span><tr><td><span class="nfl-o-roster__player-name"><a>Josh Allen</a></span></td><td>17</td><td>QB</td></tr><span class="nfl-o-roster__title-status">Reserve/Injured</span><tr><td><span class="nfl-o-roster__player-name"><a>Demo Player</a></span></td><td>8</td><td>WR</td></tr>`;
const leagueScheduleFixture = `<div><h3 class="header-2-sans">Week 2</h3></div><ul><li><div class="shadow-extended"><p>PRE SEASON</p><a data-analytics="Bills at Browns, Saturday"></a><span class="sr-only">Bills at Browns, Saturday, August 22nd, 1:00 PM, NFLN</span><time dateTime="2026-08-22T17:00:00.000Z"></time><span>Buffalo Bills</span><span>Cleveland Browns</span><span>NFLN</span></div></li></ul>`;
const expectedOfficialDomains = {
  ARI: "azcardinals.com", ATL: "atlantafalcons.com", BAL: "baltimoreravens.com", BUF: "buffalobills.com", CAR: "panthers.com", CHI: "chicagobears.com", CIN: "bengals.com", CLE: "clevelandbrowns.com", DAL: "dallascowboys.com", DEN: "denverbroncos.com", DET: "detroitlions.com", GB: "packers.com", HOU: "houstontexans.com", IND: "colts.com", JAX: "jaguars.com", KC: "chiefs.com", LAC: "chargers.com", LAR: "therams.com", LV: "raiders.com", MIA: "miamidolphins.com", MIN: "vikings.com", NE: "patriots.com", NO: "neworleanssaints.com", NYG: "giants.com", NYJ: "newyorkjets.com", PHI: "philadelphiaeagles.com", PIT: "steelers.com", SF: "49ers.com", SEA: "seahawks.com", TB: "buccaneers.com", TEN: "titansonline.com", WAS: "commanders.com",
};

describe("official team data parsers", () => {
  it("maps every NFL team to an official Schedule and Roster domain", () => {
    expect(Object.keys(TEAM_DOMAINS)).toHaveLength(32);
    expect(TEAM_DOMAINS).toEqual(expectedOfficialDomains);
    for (const [teamCode, domain] of Object.entries(expectedOfficialDomains)) {
      const sources = getOfficialTeamDataSources(teamCode);
      expect(sources.scheduleUrl).toBe(`https://www.${domain}/schedule/`);
      expect(sources.rosterUrl).toBe(`https://www.${domain}/team/players-roster/`);
      expect(sources.leagueScheduleUrl).toMatch(new RegExp(`^https://www\\.nfl\\.com/schedules/\\d{4}/by-team/`));
    }
  });
  it("parses an official schedule card into a real away fixture", () => {
    const result = parseOfficialSchedulePage(scheduleFixture, "BUF", "https://www.buffalobills.com/schedule/");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ teamCode: "BUF", opponentCode: "CLE", homeAway: "away", seasonPhase: "preseason", weekLabel: "WEEK 2" });
  });
  it("parses a NFL league schedule fixture and preserves the league source", () => {
    const sourceUrl = "https://www.nfl.com/schedules/2026/by-team/buffalo-bills";
    const result = parseNFLLeagueSchedulePage(leagueScheduleFixture, "BUF", sourceUrl);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ teamCode: "BUF", opponentCode: "CLE", homeAway: "away", seasonPhase: "preseason", weekLabel: "PRESEASON WEEK 2", sourceUrl });
  });
  it("falls back to the team official Schedule only when the NFL league source returns no games", () => {
    const teamGames = parseOfficialSchedulePage(scheduleFixture, "BUF", "https://www.buffalobills.com/schedule/");
    const leagueGames = parseNFLLeagueSchedulePage(leagueScheduleFixture, "BUF", "https://www.nfl.com/schedules/2026/by-team/buffalo-bills");
    expect(selectPreferredSchedule([], teamGames)[0]?.sourceUrl).toBe("https://www.buffalobills.com/schedule/");
    expect(selectPreferredSchedule(leagueGames, teamGames)[0]?.sourceUrl).toContain("nfl.com/schedules/");
  });
  it("skips official schedule placeholder dates", () => {
    const placeholder = scheduleFixture.replace("08/22/2026", "01/01/0001");
    expect(parseOfficialSchedulePage(placeholder, "BUF", "https://www.buffalobills.com/schedule/")).toEqual([]);
  });
  it("preserves official roster buckets and player positions", () => {
    const result = parseOfficialRosterPage(rosterFixture, "BUF", "https://www.buffalobills.com/team/players-roster/");
    expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ playerName: "Josh Allen", position: "QB", rosterStatus: "Active" }), expect.objectContaining({ playerName: "Demo Player", rosterStatus: "Reserve/Injured" })]));
  });
  it("decodes numeric and named HTML entities in official player names before cache storage", () => {
    expect(normalizeOfficialText("Le&#x27;Veon Moss&#xA0;")).toBe("Le'Veon Moss");
    expect(normalizeOfficialText("D&amp;#x27;Andre Swift")).toBe("D'Andre Swift");
    const entityRoster = rosterFixture.replace("Josh Allen", "Le&#x27;Veon Moss");
    expect(parseOfficialRosterPage(entityRoster, "MIA", "https://www.miamidolphins.com/team/players-roster/")[0]?.playerName).toBe("Le'Veon Moss");
  });
});
