import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { snapshot, league } = vi.hoisted(() => ({
  snapshot: {
    nextGame: undefined,
    roster: [], rosterCounts: [], injuries: [], news: [],
    sources: { schedule: null, roster: null, injury: null },
    lastUpdatedAt: new Date("2026-08-16T00:00:00.000Z"),
  },
  league: { standings: [], results: [], calendar: [] },
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    teamSnapshot: { byTeam: { useQuery: () => ({ data: snapshot, isError: false, isLoading: false }) } },
    leagueDashboard: { summary: { useQuery: () => ({ data: league, isError: false, isLoading: false }) } },
    officialFeed: {
      byTeam: { useQuery: () => ({ data: { items: [], sources: [] }, isError: false, isLoading: false, isFetching: false, refetch: () => undefined }) },
      japaneseSummary: { useMutation: () => ({ data: undefined, isPending: false, mutate: () => undefined, mutateAsync: async () => undefined, reset: () => undefined }) },
      englishSummary: { useMutation: () => ({ data: undefined, isPending: false, mutate: () => undefined, reset: () => undefined }) },
    },
  },
}));

import Home from "./Home";

describe("mobile team page information hierarchy", () => {
  it("keeps Latest News and Status Radar while removing duplicate huddle, injury, and game-notes sections", () => {
    const markup = renderToStaticMarkup(createElement(Home));
    expect(markup).toContain("LATEST NEWS");
    expect(markup).toContain("STATUS RADAR");
    expect(markup).not.toContain("YOUR HUDDLE");
    expect(markup).not.toContain("INJURY WATCH");
    expect(markup).not.toContain("GAME NOTES");
    expect(markup).not.toContain("OFFICIAL BRIEFING");
  });

  it("keeps mobile menu destinations and section numbering aligned with the rebuilt page", () => {
    const markup = renderToStaticMarkup(createElement(Home));
    expect(markup).toContain('href="#updates"');
    expect(markup).toContain('href="#status"');
    expect(markup).toContain('href="#league"');
    expect(markup).not.toContain('href="#results"');
    expect(markup).not.toContain('href="#safe"');
    expect(markup).toContain("01");
    expect(markup).toContain("04");
  });
});
