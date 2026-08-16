import { describe, expect, it } from "vitest";
import { officialStandingsUrl, parseNFLScoresPage, parseNFLStandingsPage } from "./officialLeagueData";

const standingsFixture = `<table><tr><td>Buffalo Bills</td><td>2</td><td>1</td><td>0</td><td>0.667</td><td>71</td><td>55</td></tr><tr><td>New York Jets</td><td>1</td><td>2</td><td>0</td><td>0.333</td><td>42</td><td>60</td></tr></table>`;
const scoresFixture = `<section>PRESEASON WEEK 1 <a data-analytics="{&quot;gameState&quot;:&quot;FINAL&quot;,&quot;linkName&quot;:&quot;Panthers 14, Bills 29, FINAL, Saturday, August 15th&quot;}" href="/games/panthers-at-bills-2026-pre-1"></a></section>`;

describe("official league dashboard parsers", () => {
  it("uses the official NFL standings URL", () => {
    expect(officialStandingsUrl(2026)).toBe("https://www.nfl.com/standings/league/2026/reg");
  });

  it("parses official win-loss records and scoring totals", () => {
    const rows = parseNFLStandingsPage(standingsFixture, 2026, officialStandingsUrl(2026));
    expect(rows).toEqual(expect.arrayContaining([
      expect.objectContaining({ teamCode: "BUF", wins: 2, losses: 1, ties: 0, pct: "0.667", pointsFor: 71, pointsAgainst: 55 }),
      expect.objectContaining({ teamCode: "NYJ", wins: 1, losses: 2, ties: 0, pct: "0.333" }),
    ]));
  });

  it("parses a completed official NFL score card", () => {
    const rows = parseNFLScoresPage(scoresFixture, 2026);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ seasonPhase: "preseason", weekLabel: "PRESEASON WEEK 1", awayTeamCode: "CAR", homeTeamCode: "BUF", awayScore: 14, homeScore: 29, gameState: "FINAL" });
  });
});
