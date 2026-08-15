import { describe, expect, it } from "vitest";
import { getOfficialSources, parseOfficialTeamRss, supportedOfficialTeamCodes } from "./officialFeeds";

const sampleRss = `<?xml version="1.0"?><rss><channel><item><title><![CDATA[Practice report: player listed as questionable]]></title><link>https://www.packers.com/news/practice-report</link><description><![CDATA[Official practice report with injury updates.]]></description><pubDate>Fri, 14 Aug 2026 21:12:14 GMT</pubDate></item><item><title>Team announces community event</title><link>https://www.packers.com/news/community-event</link><description>Official team news.</description><pubDate>Thu, 13 Aug 2026 21:12:14 GMT</pubDate></item></channel></rss>`;

describe("official team feed parsing", () => {
  it("maps a team RSS feed into official cache records and flags injury-related stories", () => {
    const [source] = getOfficialSources("GB");
    const items = parseOfficialTeamRss(sampleRss, "GB", source);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ teamCode: "GB", sourceKind: "team_official", category: "injury" });
    expect(items[1]).toMatchObject({ title: "Team announces community event", category: "news" });
  });

  it("keeps all 32 teams addressable and exposes both official source links", () => {
    expect(supportedOfficialTeamCodes).toHaveLength(32);
    expect(getOfficialSources("SEA")).toHaveLength(2);
  });

  it("uses team-specific official RSS domains for each team source", () => {
    expect(getOfficialSources("BUF")[0]?.url).toBe("https://www.buffalobills.com/rss/news");
    expect(getOfficialSources("SF")[0]?.url).toBe("https://www.49ers.com/rss/news");
  });
});
