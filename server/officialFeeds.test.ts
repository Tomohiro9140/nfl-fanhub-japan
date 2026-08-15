import { describe, expect, it } from "vitest";
import { getOfficialSources, parseOfficialNflInjuryPage, parseOfficialTeamRss, scheduledTeamGroups, supportedOfficialTeamCodes } from "./officialFeeds";

const sampleRss = `<?xml version="1.0"?><rss><channel><item><title><![CDATA[Practice report: player listed as questionable]]></title><link>https://www.packers.com/news/practice-report</link><description><![CDATA[Official practice report with injury updates.]]></description><pubDate>Fri, 14 Aug 2026 21:12:14 GMT</pubDate></item><item><title>Team announces community event</title><link>https://www.packers.com/news/community-event</link><description>Official team news.</description><pubDate>Thu, 13 Aug 2026 21:12:14 GMT</pubDate></item></channel></rss>`;

describe("official team feed parsing", () => {
  it("maps a team RSS feed into official cache records and flags injury-related stories", () => {
    const [source] = getOfficialSources("GB");
    const items = parseOfficialTeamRss(sampleRss, "GB", source);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ teamCode: "GB", sourceKind: "team_official", category: "injury" });
    expect(items[1]).toMatchObject({ title: "Team announces community event", category: "news" });
  });

  it("does not classify a normal Standout story as an out-status injury report", () => {
    const rss = `<?xml version="1.0"?><rss><channel><item><title>3 Standout Players From Jets-Buccaneers Preseason Game</title><link>https://www.newyorkjets.com/news/standout</link><description>Official game recap.</description><pubDate>Fri, 14 Aug 2026 21:12:14 GMT</pubDate></item></channel></rss>`;
    const [source] = getOfficialSources("NYJ");
    const [item] = parseOfficialTeamRss(rss, "NYJ", source);
    expect(item).toMatchObject({ category: "news" });
  });

  it("does not classify a normal Stood Out story as an out-status injury report", () => {
    const rss = `<?xml version="1.0"?><rss><channel><item><title>5 Chargers Players That Stood Out in Preseason Win Over Texans</title><link>https://www.chargers.com/news/stood-out</link><description>Official game recap.</description><pubDate>Fri, 14 Aug 2026 21:12:14 GMT</pubDate></item></channel></rss>`;
    const [source] = getOfficialSources("LAC");
    const [item] = parseOfficialTeamRss(rss, "LAC", source);
    expect(item).toMatchObject({ category: "news" });
  });

  it("keeps all 32 teams addressable and exposes both official source links", () => {
    expect(supportedOfficialTeamCodes).toHaveLength(32);
    expect(getOfficialSources("SEA")).toHaveLength(2);
  });

  it("uses team-specific official RSS domains for each team source", () => {
    expect(getOfficialSources("BUF")[0]?.url).toBe("https://www.buffalobills.com/rss/news");
    expect(getOfficialSources("SF")[0]?.url).toBe("https://www.49ers.com/rss/news");
  });

  it("keeps only the target team's official NFL injury roundup links", () => {
    const page = `<a href="/news/injury-roundup-dolphins-wr-tyreek-hill">Injury roundup: Dolphins WR Tyreek Hill (wrist)</a><a href="/news/injury-roundup-giants-wr-malik-nabers">Injury roundup: Giants WR Malik Nabers (groin)</a>`;
    const [, injurySource] = getOfficialSources("MIA");
    const items = parseOfficialNflInjuryPage(page, "MIA", injurySource);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ teamCode: "MIA", sourceKind: "nfl_official", category: "injury" });
  });

  it("does not confuse teams that share a city", () => {
    const page = `<a href="/news/injury-roundup-chargers-qb">Injury roundup: Chargers QB update</a><a href="/news/injury-roundup-giants-wr">Injury roundup: Giants WR update</a>`;
    const [, ramsSource] = getOfficialSources("LAR");
    const [, jetsSource] = getOfficialSources("NYJ");
    expect(parseOfficialNflInjuryPage(page, "LAR", ramsSource)).toHaveLength(0);
    expect(parseOfficialNflInjuryPage(page, "NYJ", jetsSource)).toHaveLength(0);
  });

  it("uses the requested eight-team UTC schedule groups", () => {
    expect(scheduledTeamGroups[0]).toEqual(["ARI", "ATL", "BAL", "BUF", "CAR", "CHI", "CIN", "CLE"]);
    expect(scheduledTeamGroups[2]).toEqual(["LAC", "LAR", "LV", "MIA", "MIN", "NE", "NO", "NYG"]);
  });
});
