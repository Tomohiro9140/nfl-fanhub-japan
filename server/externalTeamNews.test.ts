import { describe, expect, it } from "vitest";
import { externalNewsSources, parseExternalTeamNewsRss } from "./externalTeamNews";

const cbsRss = `<?xml version="1.0"?><rss><channel>
<item><title>Buffalo Bills sign veteran receiver</title><link>https://www.cbssports.com/nfl/news/bills-sign-receiver/</link><description>The Bills add depth at wide receiver.</description><pubDate>Mon, 17 Aug 2026 01:00:00 +0000</pubDate></item>
<item><title>Best NFL bets for Sunday</title><link>https://www.cbssports.com/betting/news/best-bets/</link><description>Odds and picks for every game.</description><pubDate>Mon, 17 Aug 2026 02:00:00 +0000</pubDate></item>
<item><title>Dallas Cowboys add a pass rusher</title><link>https://www.cbssports.com/nfl/news/cowboys-pass-rusher/</link><description>Dallas makes a roster move.</description><pubDate>Mon, 17 Aug 2026 03:00:00 +0000</pubDate></item>
</channel></rss>`;

describe("external team news RSS", () => {
  it("stores only team-matched editorial RSS cards and excludes betting content", () => {
    const items = parseExternalTeamNewsRss(cbsRss, externalNewsSources[1], ["BUF", "DAL"], new Date("2026-08-17T08:00:00.000Z"));
    expect(items).toHaveLength(2);
    expect(items.map((item) => item.teamCode)).toEqual(["DAL", "BUF"]);
    expect(items.every((item) => item.sourceKind === "cbs" && item.category === "news")).toBe(true);
    expect(items.some((item) => item.title.includes("bets"))).toBe(false);
  });

  it("does not attach a city-matched article to the wrong local team", () => {
    const xml = `<?xml version="1.0"?><rss><channel><item><title>New York Giants update</title><link>https://example.test/giants</link><description>Giants news.</description><pubDate>Mon, 17 Aug 2026 03:00:00 +0000</pubDate></item></channel></rss>`;
    expect(parseExternalTeamNewsRss(xml, externalNewsSources[0], ["NYJ"], new Date("2026-08-17T08:00:00.000Z"))).toHaveLength(0);
  });
});
