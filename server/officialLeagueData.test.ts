import { describe, expect, it } from "vitest";
import { officialPostseasonScoreUrls, officialPreseasonWeekScoresUrl, officialStandingsUrl, parseNFLGameKickoffAt, parseNFLScoresPage, parseNFLStandingsPage } from "./officialLeagueData";

const standingsFixture = `<table><tr><td>Buffalo Bills</td><td>2</td><td>1</td><td>0</td><td>0.667</td><td>71</td><td>55</td></tr><tr><td>New York Jets</td><td>1</td><td>2</td><td>0</td><td>0.333</td><td>42</td><td>60</td></tr></table>`;
const scoresFixture = `<section>PRESEASON WEEK 1 <a data-analytics="{&quot;gameState&quot;:&quot;FINAL&quot;,&quot;linkName&quot;:&quot;Panthers 14, Bills 29, FINAL, Saturday, August 15th&quot;}" href="/games/panthers-at-bills-2026-pre-1"></a></section>`;

describe("official league dashboard parsers", () => {
  it("uses the official NFL standings URL", () => {
    expect(officialStandingsUrl(2026)).toBe("https://www.nfl.com/standings/league/2026/reg");
  });

  it("uses official NFL week-specific score pages for preseason backfill", () => {
    expect(officialPreseasonWeekScoresUrl(2026, 1)).toBe("https://www.nfl.com/schedules/2026/by-week/preseason-week-1");
    expect(officialPreseasonWeekScoresUrl(2026, 3)).toBe("https://www.nfl.com/schedules/2026/by-week/preseason-week-3");
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
    expect(rows[0]).toMatchObject({ seasonPhase: "preseason", weekLabel: "PRESEASON WEEK 1", awayTeamCode: "CAR", homeTeamCode: "BUF", awayScore: 14, homeScore: 29, gameState: "FINAL", gameDate: "2026-08-15" });
  });

  it("reads the exact official Game Center kickoff timestamp", () => {
    const kickoffAt = parseNFLGameKickoffAt('<time data-testid="game-date" dateTime="2026-08-15T17:00:00Z"></time>');
    expect(kickoffAt?.toISOString()).toBe("2026-08-15T17:00:00.000Z");
  });

  it("uses the individual official game URL to retain each preseason week", () => {
    const mixedWeekFixture = `<section>PRESEASON WEEK 1 <a data-analytics="{&quot;gameState&quot;:&quot;FINAL&quot;,&quot;linkName&quot;:&quot;Raiders 22, Texans 20, FINAL, Thursday, August 20th&quot;}" href="/games/raiders-at-texans-2026-pre-2"></a></section>`;
    const rows = parseNFLScoresPage(mixedWeekFixture, 2026);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ seasonPhase: "preseason", weekLabel: "PRESEASON WEEK 2", awayTeamCode: "LV", homeTeamCode: "HOU", awayScore: 22, homeScore: 20 });
  });

  // 2025シーズンのNFL公式プレーオフページ（2026年1〜2月）と同じ形式。ナビに "PRESEASON WEEK 1" が含まれる
  it("labels playoff games by round from the official -post-N game URL", () => {
    const card = (name: string, path: string) => `<a data-analytics="{&quot;gameState&quot;:&quot;FINAL&quot;,&quot;linkModule&quot;:&quot;Game Card&quot;,&quot;linkName&quot;:&quot;${name}&quot;}" href="${path}"></a>`;
    const fixture = `<nav>PRESEASON WEEK 1 WEEK 18</nav><section>
      ${card("Rams 34, Panthers 31, FINAL, Saturday, January 10th", "/games/rams-at-panthers-2025-post-1")}
      ${card("Bills 30, Broncos 33, FINAL, Saturday, January 17th", "/games/bills-at-broncos-2025-post-2")}
      ${card("Rams 27, Seahawks 31, FINAL, Sunday, January 25th", "/games/rams-at-seahawks-2025-post-3")}
      ${card("Seahawks 29, Patriots 13, FINAL, Sunday, February 8th", "/games/seahawks-at-patriots-2025-post-4")}
    </section>`;
    const rows = parseNFLScoresPage(fixture, 2025);

    expect(rows.map((row) => [row.seasonPhase, row.weekLabel, `${row.awayTeamCode}@${row.homeTeamCode}`, row.gameDate])).toEqual([
      ["postseason", "WILD CARD", "LAR@CAR", "2026-01-10"],
      ["postseason", "DIVISIONAL", "BUF@DEN", "2026-01-17"],
      ["postseason", "CONF CHAMP", "LAR@SEA", "2026-01-25"],
      ["postseason", "SUPER BOWL", "SEA@NE", "2026-02-08"],
    ]);
  });

  it("uses the official round pages for the postseason backfill", () => {
    expect(officialPostseasonScoreUrls(2026)).toEqual([
      "https://www.nfl.com/schedules/2026/by-week/wild-card-weekend",
      "https://www.nfl.com/schedules/2026/by-week/divisional-playoffs",
      "https://www.nfl.com/schedules/2026/by-week/conference-championships",
      "https://www.nfl.com/schedules/2026/by-week/super-bowl-sunday",
    ]);
  });
});
