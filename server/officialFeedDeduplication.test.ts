import { describe, expect, it } from "vitest";
import { canonicalOfficialFeedUrl, dedupeOfficialFeedItems } from "./officialFeedDeduplication";

const publishedAt = new Date("2026-08-25T00:00:00.000Z");

describe("official feed deduplication", () => {
  it("prefers a team official row and removes repeated canonical URLs", () => {
    const items = dedupeOfficialFeedItems([
      { title: "Practice Report: Key update", sourceUrl: "https://www.example.com/news/report?utm_source=rss", sourceKind: "nfl_official", publishedAt },
      { title: "Practice Report: Key update", sourceUrl: "https://example.com/news/report", sourceKind: "team_official", publishedAt: new Date("2026-08-24T22:00:00.000Z") },
      { title: "A separate official article", sourceUrl: "https://example.com/news/separate", sourceKind: "team_official", publishedAt },
    ]);
    expect(items).toHaveLength(2);
    expect(items[0]?.sourceKind).toBe("team_official");
    expect(canonicalOfficialFeedUrl("https://www.example.com/news/report?utm_source=rss")).toBe("https://example.com/news/report");
  });

  it("removes repeated titles even when legacy rows have different URLs", () => {
    const items = dedupeOfficialFeedItems([
      { title: "Player Update", sourceUrl: "https://example.com/news/player-update", sourceKind: "team_official", publishedAt },
      { title: "PLAYER UPDATE", sourceUrl: "https://example.com/legacy/player-update", sourceKind: "team_official", publishedAt: new Date("2026-08-24T00:00:00.000Z") },
      { title: "Roster update", sourceUrl: "https://example.com/news/roster-update", sourceKind: "team_official", publishedAt },
    ]);
    expect(items.map((item) => item.title)).toEqual(["Player Update", "Roster update"]);
  });
});
