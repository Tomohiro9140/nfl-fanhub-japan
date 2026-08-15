import { describe, expect, it } from "vitest";
import { parseOfficialRosterPage, parseOfficialSchedulePage } from "./officialTeamData";

const scheduleFixture = `<div class="nfl-o-matchup-cards" data-gametime="08/22/2026 13:00:00 -04:00"><p class="nfl-o-matchup-cards__date-info"><strong>WEEK 2</strong></p><p class="nfl-o-matchup-cards__team-game-location"><span>AT</span></p><p>Buffalo Bills</p><p>Cleveland Browns</p><span class="nfl-o-matchup-cards__venue--location">Huntington Bank Field</span></div>`;
const rosterFixture = `<span class="nfl-o-roster__title-status">Active</span><tr><td><span class="nfl-o-roster__player-name"><a>Josh Allen</a></span></td><td>17</td><td>QB</td></tr><span class="nfl-o-roster__title-status">Reserve/Injured</span><tr><td><span class="nfl-o-roster__player-name"><a>Demo Player</a></span></td><td>8</td><td>WR</td></tr>`;

describe("official team data parsers", () => {
  it("parses an official schedule card into a real away fixture", () => {
    const result = parseOfficialSchedulePage(scheduleFixture, "BUF", "https://www.buffalobills.com/schedule/");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ teamCode: "BUF", opponentCode: "CLE", homeAway: "away", seasonPhase: "preseason", weekLabel: "WEEK 2" });
  });
  it("preserves official roster buckets and player positions", () => {
    const result = parseOfficialRosterPage(rosterFixture, "BUF", "https://www.buffalobills.com/team/players-roster/");
    expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ playerName: "Josh Allen", position: "QB", rosterStatus: "Active" }), expect.objectContaining({ playerName: "Demo Player", rosterStatus: "Reserve/Injured" })]));
  });
});

