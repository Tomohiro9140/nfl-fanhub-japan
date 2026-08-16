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
      japaneseSummary: {
        useMutation: () => ({ data: undefined, isPending: false, mutate: () => undefined, mutateAsync: async () => undefined, reset: () => undefined }),
      },
      englishSummary: { useMutation: () => ({ data: undefined, isPending: false, mutate: () => undefined, reset: () => undefined }) },
    },
  },
}));

import { OfficialTeamFeed } from "./OfficialTeamFeed";

const favorite: FavoriteTeam = { code: "BUF", name: "Buffalo Bills", conference: "AFC", division: "East", tone: "blue" };
const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

describe("official feed mobile content selection", () => {
  beforeEach(() => {
    mockedItems.splice(0, mockedItems.length,
      { id: 1, category: "news", title: "News newest", summary: null, sourceUrl: "https://www.buffalobills.com/news/1", sourceName: "BUF Official News", publishedAt: daysAgo(0), fetchedAt: now },
      { id: 2, category: "news", title: "News second", summary: null, sourceUrl: "https://www.buffalobills.com/news/2", sourceName: "BUF Official News", publishedAt: daysAgo(1), fetchedAt: now },
      { id: 3, category: "news", title: "News third", summary: null, sourceUrl: "https://www.buffalobills.com/news/3", sourceName: "BUF Official News", publishedAt: daysAgo(2), fetchedAt: now },
      { id: 4, category: "news", title: "News fourth", summary: null, sourceUrl: "https://www.buffalobills.com/news/4", sourceName: "BUF Official News", publishedAt: daysAgo(3), fetchedAt: now },
      { id: 9, category: "news", title: "News fifth", summary: null, sourceUrl: "https://www.buffalobills.com/news/5", sourceName: "BUF Official News", publishedAt: daysAgo(4), fetchedAt: now },
      { id: 10, category: "news", title: "News sixth hidden", summary: null, sourceUrl: "https://www.buffalobills.com/news/6", sourceName: "BUF Official News", publishedAt: daysAgo(5), fetchedAt: now },
      { id: 5, category: "injury", title: "Current injury newest", summary: null, sourceUrl: "https://www.buffalobills.com/news/injury-newest", sourceName: "BUF Official News", publishedAt: daysAgo(0), fetchedAt: now },
      { id: 6, category: "injury", title: "Current injury update", summary: null, sourceUrl: "https://www.buffalobills.com/news/injury-now", sourceName: "BUF Official News", publishedAt: daysAgo(1), fetchedAt: now },
      { id: 7, category: "injury", title: "Current injury older", summary: null, sourceUrl: "https://www.buffalobills.com/news/injury-older", sourceName: "BUF Official News", publishedAt: daysAgo(3), fetchedAt: now },
      { id: 8, category: "injury", title: "Historic injury hidden", summary: null, sourceUrl: "https://www.buffalobills.com/news/injury-old", sourceName: "BUF Official News", publishedAt: daysAgo(60), fetchedAt: now },
    );
  });

  it("renders the five newest news cards while moving injury status out of the news panel", () => {
    const markup = renderToStaticMarkup(createElement(OfficialTeamFeed, { favorite }));
    expect(markup).toContain("News newest");
    expect(markup).toContain("News second");
    expect(markup).toContain("News third");
    expect(markup).toContain("News fourth");
    expect(markup).toContain("News fifth");
    expect(markup).not.toContain("News sixth hidden");
    expect(markup.indexOf("News newest")).toBeLessThan(markup.indexOf("News second"));
    expect(markup.indexOf("News second")).toBeLessThan(markup.indexOf("News third"));
    expect(markup.indexOf("News third")).toBeLessThan(markup.indexOf("News fourth"));
    expect(markup.indexOf("News fourth")).toBeLessThan(markup.indexOf("News fifth"));
    expect(markup).not.toContain("INJURY WATCH");
    expect(markup).not.toContain("Current injury newest");
    expect(markup).not.toContain("Current injury update");
    expect(markup).not.toContain("Current injury older");
    expect(markup).not.toContain("Historic injury hidden");
  });
});
