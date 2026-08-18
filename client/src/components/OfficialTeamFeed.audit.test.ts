import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FavoriteTeam } from "@/lib/nflTeams";

const { mockedItems } = vi.hoisted(() => ({ mockedItems: [] as Array<Record<string, unknown>> }));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    officialFeed: {
      byTeam: {
        useQuery: () => ({ data: { items: mockedItems, sources: [] }, isError: false, isLoading: false, isFetching: false, refetch: () => undefined }),
      },
      get japaneseSummary() { throw new Error("Japanese summary must remain frozen from the LATEST NEWS card"); },
      get englishSummary() { throw new Error("English summary must remain frozen from the LATEST NEWS card"); },
    },
  },
}));

import { OfficialTeamFeed, selectLatestNews, spoilerNewsCutoff } from "./OfficialTeamFeed";

const favorite: FavoriteTeam = { code: "BUF", name: "Buffalo Bills", conference: "AFC", division: "East", tone: "blue" };
const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

describe("official feed mobile content selection", () => {
  beforeEach(() => {
    mockedItems.splice(0, mockedItems.length,
      { id: 1, sourceKind: "team_official", category: "news", title: "News newest", summary: null, sourceUrl: "https://www.buffalobills.com/news/1", sourceName: "BUF Official News", publishedAt: daysAgo(0), fetchedAt: now },
      { id: 2, sourceKind: "team_official", category: "news", title: "News second", summary: null, sourceUrl: "https://www.buffalobills.com/news/2", sourceName: "BUF Official News", publishedAt: daysAgo(1), fetchedAt: now },
      { id: 3, sourceKind: "team_official", category: "news", title: "News third", summary: null, sourceUrl: "https://www.buffalobills.com/news/3", sourceName: "BUF Official News", publishedAt: daysAgo(2), fetchedAt: now },
      { id: 4, sourceKind: "team_official", category: "news", title: "News fourth", summary: null, sourceUrl: "https://www.buffalobills.com/news/4", sourceName: "BUF Official News", publishedAt: daysAgo(3), fetchedAt: now },
      { id: 9, sourceKind: "team_official", category: "news", title: "News fifth", summary: null, sourceUrl: "https://www.buffalobills.com/news/5", sourceName: "BUF Official News", publishedAt: daysAgo(4), fetchedAt: now },
      { id: 10, sourceKind: "team_official", category: "news", title: "News sixth hidden", summary: null, sourceUrl: "https://www.buffalobills.com/news/6", sourceName: "BUF Official News", publishedAt: daysAgo(5), fetchedAt: now },
      { id: 13, sourceKind: "team_official", category: "news", title: "Bills sign WR Example Player, release WR Example Veteran", summary: null, sourceUrl: "https://www.buffalobills.com/news/bills-sign-example-player-release-example-veteran", sourceName: "BUF Official News", publishedAt: daysAgo(0), fetchedAt: now },
      { id: 11, sourceKind: "pft", category: "news", title: "PFT Bills brief", summary: null, sourceUrl: "https://www.nbcsports.com/nfl/profootballtalk/bills", sourceName: "PFT · NBC SPORTS", publishedAt: daysAgo(0), fetchedAt: now },
      { id: 12, sourceKind: "cbs", category: "news", title: "CBS Bills brief", summary: null, sourceUrl: "https://www.cbssports.com/nfl/news/bills", sourceName: "CBS SPORTS", publishedAt: daysAgo(0), fetchedAt: now },
      { id: 5, sourceKind: "team_official", category: "injury", title: "Current injury newest", summary: null, sourceUrl: "https://www.buffalobills.com/news/injury-newest", sourceName: "BUF Official News", publishedAt: daysAgo(0), fetchedAt: now },
      { id: 6, sourceKind: "team_official", category: "injury", title: "Current injury update", summary: null, sourceUrl: "https://www.buffalobills.com/news/injury-now", sourceName: "BUF Official News", publishedAt: daysAgo(1), fetchedAt: now },
      { id: 7, sourceKind: "team_official", category: "injury", title: "Current injury older", summary: null, sourceUrl: "https://www.buffalobills.com/news/injury-older", sourceName: "BUF Official News", publishedAt: daysAgo(3), fetchedAt: now },
      { id: 8, sourceKind: "team_official", category: "injury", title: "Historic injury hidden", summary: null, sourceUrl: "https://www.buffalobills.com/news/injury-old", sourceName: "BUF Official News", publishedAt: daysAgo(60), fetchedAt: now },
    );
  });

  it("keeps three official stories first while reserving one card each for PFT and CBS", () => {
    const selected = selectLatestNews(mockedItems as never[]);
    expect(selected.map((item) => item.id)).toEqual([1, 2, 3, 11, 12]);
    expect(selected.map((item) => item.id)).not.toContain(13);
  });

  it("removes post-game articles before rendering any external links while spoiler protection is active", () => {
    const finalConfirmedAt = new Date("2026-08-15T18:00:00.000Z");
    const cutoff = spoilerNewsCutoff({ gameState: "FINAL", gameDate: "2026-08-15", finishedAt: finalConfirmedAt, kickoffAt: new Date("2026-08-15T18:00:00.000Z") });
    const safe = { id: 30, sourceKind: "team_official", category: "news", title: "Pregame notebook", summary: null, sourceUrl: "https://www.buffalobills.com/news/pregame", sourceName: "BUF Official News", publishedAt: new Date("2026-08-14T23:59:00.000Z"), fetchedAt: now };
    const hidden = { id: 31, sourceKind: "team_official", category: "news", title: "Postgame reaction", summary: null, sourceUrl: "https://www.buffalobills.com/news/postgame", sourceName: "BUF Official News", publishedAt: new Date("2026-08-15T05:00:00.000Z"), fetchedAt: now };
    expect(selectLatestNews([safe, hidden] as never[], cutoff).map((item) => item.id)).toEqual([30]);
    mockedItems.splice(0, mockedItems.length, safe, hidden);
    const markup = renderToStaticMarkup(createElement(OfficialTeamFeed, { favorite, spoilerMode: true, completedGame: { gameState: "FINAL", gameDate: "2026-08-15", finishedAt: finalConfirmedAt, kickoffAt: new Date("2026-08-15T18:00:00.000Z") } }));
    expect(markup).not.toContain("https://www.buffalobills.com/news/postgame");
    expect(markup).not.toContain("Postgame reaction");
  });

  it("renders the source icons and five mixed news cards while moving injury status out of the news panel", () => {
    const markup = renderToStaticMarkup(createElement(OfficialTeamFeed, { favorite }));
    expect(markup).toContain("News newest");
    expect(markup).toContain("News second");
    expect(markup).toContain("News third");
    expect(markup).toContain("PFT Bills brief");
    expect(markup).toContain("CBS Bills brief");
    expect(markup).not.toContain("News sixth hidden");
    expect(markup.indexOf("News newest")).toBeLessThan(markup.indexOf("News second"));
    expect(markup.indexOf("News second")).toBeLessThan(markup.indexOf("News third"));
    expect(markup.indexOf("News third")).toBeLessThan(markup.indexOf("PFT Bills brief"));
    expect(markup.indexOf("PFT Bills brief")).toBeLessThan(markup.indexOf("CBS Bills brief"));
    expect(markup).toContain("OFFICIAL");
    expect(markup).toContain("PFT");
    expect(markup).toContain("CBS");
    expect(markup).toContain("PUBLISHED ·");
    expect(markup).toContain("JST");
    expect(markup).toContain('href="https://www.buffalobills.com/news/1"');
    expect(markup).toContain('target="_blank"');
    expect(markup).not.toContain("日本語要約");
    expect(markup).not.toContain("ENGLISH SUMMARY");
    expect(markup).not.toContain("INJURY WATCH");
    expect(markup).not.toContain("Current injury newest");
    expect(markup).not.toContain("Current injury update");
    expect(markup).not.toContain("Current injury older");
    expect(markup).not.toContain("Historic injury hidden");
    expect(markup).not.toContain("Bills sign WR Example Player");
  });

  it("keeps every source mark inside a fixed non-wrapping card slot", () => {
    const markup = renderToStaticMarkup(createElement(OfficialTeamFeed, { favorite }));
    expect(markup).toContain("w-[58px]");
    expect(markup).toContain("overflow-hidden");
    expect(markup).toContain("whitespace-nowrap");
  });
});
