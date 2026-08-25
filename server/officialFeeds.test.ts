import { describe, expect, it } from "vitest";
import { classifyOfficialFeedItem, getOfficialSources, isFreshNflInjuryArticle, needsOfficialNewsTopUp, parseNflArticlePublishedAt, parseOfficialNflInactivesPage, parseOfficialNflInjuryPage, parseOfficialTeamRss, refreshOfficialNflInactives, refreshOfficialTeamFeedGroup, scheduledTeamGroups, shouldSynchronouslyTopUpOfficialNews, supportedOfficialTeamCodes } from "./officialFeeds";
import { TEAM_NAMES } from "./officialTeamData";

const sampleRss = `<?xml version="1.0"?><rss><channel><item><title><![CDATA[Practice report: player listed as questionable]]></title><link>https://www.packers.com/news/practice-report</link><description><![CDATA[Official practice report with injury updates.]]></description><pubDate>Fri, 14 Aug 2026 21:12:14 GMT</pubDate></item><item><title>Team announces community event</title><link>https://www.packers.com/news/community-event</link><description>Official team news.</description><pubDate>Thu, 13 Aug 2026 21:12:14 GMT</pubDate></item></channel></rss>`;

describe("official team feed parsing", () => {
  it("maps a team RSS feed into official cache records and flags injury-related stories", () => {
    const [source] = getOfficialSources("GB");
    const items = parseOfficialTeamRss(sampleRss, "GB", source);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ teamCode: "GB", sourceKind: "team_official", category: "injury" });
    expect(items[1]).toMatchObject({ title: "Team announces community event", category: "news" });
  });

  it("sorts RSS records by published date before selecting the newest entries", () => {
    const outOfOrderRss = `<?xml version="1.0"?><rss><channel><item><title>Historic item first</title><link>https://www.commanders.com/news/historic</link><description>Archived news.</description><pubDate>Sat, 30 Apr 2022 18:10:58 GMT</pubDate></item><item><title>Current item last</title><link>https://www.commanders.com/news/current</link><description>Current official news.</description><pubDate>Fri, 22 Aug 2026 18:10:58 GMT</pubDate></item></channel></rss>`;
    const [source] = getOfficialSources("WAS");
    const items = parseOfficialTeamRss(outOfOrderRss, "WAS", source);
    expect(items.map((item) => item.title)).toEqual(["Current item last", "Historic item first"]);
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

  it("requires an explicit unavailability phrase instead of classifying generic out language as injury", () => {
    expect(classifyOfficialFeedItem("Falcons Camp Report: Fans show out under the lights", "", "https://www.atlantafalcons.com/news/falcons-camp-report-fans-show-out-under-the-lights")).toBe("news");
    expect(classifyOfficialFeedItem("Jacob Parrish Prepping for Hybrid Role in Bucs' Secondary", "The secondary has many moving parts.", "https://www.buccaneers.com/news/jacob-parrish-prepping-for-possible-dual-role-in-bucs-secondary")).toBe("news");
    expect(classifyOfficialFeedItem("Carson Beck To Sit Out Game Against Raiders", "", "https://www.azcardinals.com/news/carson-beck-to-sit-out-game-against-raiders")).toBe("injury");
  });

  it("keeps team-wide camp reports in news even when the headline references an existing injury", () => {
    expect(classifyOfficialFeedItem("Falcons Camp Report: With Divine Deablo working through injury, teammates step up", "", "https://www.atlantafalcons.com/news/falcons-camp-report-divine-deablo")).toBe("news");
    expect(classifyOfficialFeedItem("Training Camp Observations: injury updates and roster competition", "", "https://www.panthers.com/news/training-camp-observations")).toBe("news");
  });

  it("keeps non-injury absences and editorial highlight packages in news", () => {
    expect(classifyOfficialFeedItem("Defensive tackle Derrick Brown among players held out of preseason game at Buffalo", "Most starters will play, but Brown is not expected to play.", "https://www.panthers.com/news/defensive-tackle-derrick-brown-among-players-held-out")).toBe("news");
    expect(classifyOfficialFeedItem("Play of the Day: Devin Lloyd keeps forcing turnovers", "", "https://www.panthers.com/news/play-of-the-day-devin-lloyd-keeps-forcing-turnovers")).toBe("news");
    expect(classifyOfficialFeedItem("Play(s) of the Day: Jalen Coker brings in highlight catches", "", "https://www.panthers.com/news/play-of-the-day-jalen-coker-highlight-catches")).toBe("news");
  });

  it("classifies official roster and contract moves as transactions without mistaking autograph stories for moves", () => {
    expect(classifyOfficialFeedItem("Houston Texans Transactions (8-15-2026)", "The Houston Texans made roster moves.")).toBe("transaction");
    expect(classifyOfficialFeedItem("Packers announce roster move", "Green Bay releases QB Kyron Drones")).toBe("transaction");
    expect(classifyOfficialFeedItem("Roster Move: Eagles sign CB Isaiah Bolden", "The team makes a change following Saturday's preseason opener.", "https://www.philadelphiaeagles.com/news/roster-move-eagles-sign-cb-isaiah-bolden")).toBe("transaction");
    expect(classifyOfficialFeedItem("Falcons sign WR Beaux Collins, release WR Kristian Wilkerson", "", "https://www.atlantafalcons.com/news/falcons-sign-beaux-collins-release-wr-kristian-wilkerson")).toBe("transaction");
    expect(classifyOfficialFeedItem("Player signs autographs for fans", "A signature event at the team store.")).toBe("news");
  });

  it("does not classify viewing or streaming guides because their summary mentions injury terms", () => {
    expect(classifyOfficialFeedItem("How to Watch: Buccaneers at Jets", "Read the injury report and watch live coverage.", "https://www.buccaneers.com/news/how-to-watch-buccaneers-at-jets")).toBe("news");
    expect(classifyOfficialFeedItem("How to Stream 2026 Bucs Preseason Games", "The streaming guide includes IR and PUP roster notes.", "https://www.buccaneers.com/news/how-to-stream-bucs-preseason-games")).toBe("news");
  });

  it("keeps a direct practice report and roster transaction even when the summary is omitted", () => {
    expect(classifyOfficialFeedItem("Practice Report: player listed as questionable", "", "https://example.com/news/practice-report")).toBe("injury");
    expect(classifyOfficialFeedItem("Houston Texans Transactions", "", "https://example.com/news/transactions")).toBe("transaction");
  });

  it("keeps all 32 teams addressable and exposes both official source links", () => {
    expect(supportedOfficialTeamCodes).toHaveLength(32);
    expect(getOfficialSources("SEA")).toHaveLength(2);
  });

  it("uses team-specific official RSS domains for each team source", () => {
    expect(getOfficialSources("BUF")[0]?.url).toBe("https://www.buffalobills.com/rss/news");
    expect(getOfficialSources("SF")[0]?.url).toBe("https://www.49ers.com/rss/news");
  });

  it("keeps an RSS failure visible when schedule data succeeds for a group member", async () => {
    const results = await refreshOfficialTeamFeedGroup(3, {
      refreshFeed: async (teamCode) => {
        if (teamCode === "PIT") throw new Error("Official RSS request failed: 503");
        return 3;
      },
      refreshTeamData: async () => ({ games: 16, roster: 53 }),
    });
    const pit = results.find((result) => result.teamCode === "PIT");
    expect(pit).toMatchObject({ teamCode: "PIT", count: 0, games: 16, roster: 53, feedError: "Official RSS request failed: 503" });
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

  it("stores only a published team section from the NFL official Inactives page", () => {
    const page = `<h1>NFL Inactive Reports</h1><h2>Buffalo Bills</h2><ul><li>QB Example Player</li><li>WR Sample Player</li></ul><h2>Houston Texans</h2><ul><li>RB Other Player</li></ul>`;
    const items = parseOfficialNflInactivesPage(page, "BUF", new Date("2026-08-22T00:00:00.000Z"));
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ teamCode: "BUF", sourceKind: "nfl_official", title: "NFL Official Inactives · BUF" });
    expect(items[0]?.summary).toContain("QB Example Player");
    expect(items[0]?.summary).not.toContain("RB Other Player");
    expect(parseOfficialNflInactivesPage("NFL Inactive Reports Please check back soon for NFL Inactive Reports for this Season", "BUF")).toEqual([]);
  });

  it("extracts a distinct official Inactives section for all 32 teams", () => {
    const page = `<h1>NFL Inactive Reports</h1>${supportedOfficialTeamCodes.map((teamCode) => `<h2>${TEAM_NAMES[teamCode]}</h2><p>${teamCode} inactive player</p>`).join("")}`;
    for (const teamCode of supportedOfficialTeamCodes) {
      const [item] = parseOfficialNflInactivesPage(page, teamCode, new Date("2026-08-22T00:00:00.000Z"));
      expect(item).toMatchObject({ teamCode, sourceKind: "nfl_official", title: `NFL Official Inactives · ${teamCode}` });
      expect(item?.summary).toContain(`${teamCode} inactive player`);
    }
  });

  it("saves every published team section from the official Inactives source", async () => {
    const page = `<h1>NFL Inactive Reports</h1>${supportedOfficialTeamCodes.map((teamCode) => `<h2>${TEAM_NAMES[teamCode]}</h2><p>${teamCode} inactive player</p>`).join("")}`;
    let savedItems: Array<{ teamCode: string }> = [];
    const result = await refreshOfficialNflInactives({ fetchHtml: async () => page, saveItems: async (items) => { savedItems = items; }, now: () => new Date("2026-08-22T00:00:00.000Z") });
    expect(result).toEqual({ reports: 32 });
    expect(savedItems.map((item) => item.teamCode).sort()).toEqual([...supportedOfficialTeamCodes].sort());
  });

  it("reads an NFL article publication date and rejects a historic injury roundup", () => {
    const publishedAt = parseNflArticlePublishedAt(`{"datePublished":"2024-12-08T08:22:07.689Z"}`);
    expect(publishedAt?.toISOString()).toBe("2024-12-08T08:22:07.689Z");
    expect(isFreshNflInjuryArticle(publishedAt!, new Date("2026-08-16T00:00:00.000Z"))).toBe(false);
    expect(isFreshNflInjuryArticle(new Date("2026-08-13T00:00:00.000Z"), new Date("2026-08-16T00:00:00.000Z"))).toBe(true);
  });

  it("uses the requested eight-team UTC schedule groups", () => {
    expect(scheduledTeamGroups[0]).toEqual(["ARI", "ATL", "BAL", "BUF", "CAR", "CHI", "CIN", "CLE"]);
    expect(scheduledTeamGroups[2]).toEqual(["LAC", "LAR", "LV", "MIA", "MIN", "NE", "NO", "NYG"]);
  });

  it("tops up an incomplete official-news cache before the five-card news panel is rendered", () => {
    expect(needsOfficialNewsTopUp([{ category: "news" }, { category: "news" }, { category: "news" }])).toBe(true);
    expect(needsOfficialNewsTopUp([{ category: "news" }, { category: "news" }, { category: "news" }, { category: "news" }, { category: "news" }, { category: "injury" }])).toBe(false);
    expect(shouldSynchronouslyTopUpOfficialNews([])).toBe(true);
    expect(shouldSynchronouslyTopUpOfficialNews([{ category: "news" }])).toBe(false);
  });
});
