import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");
const snapshotCacheSource = readFileSync(new URL("../../../server/officialDashboardCache.ts", import.meta.url), "utf8");

describe("favorite team home performance path", () => {
  it("loads a light game-day snapshot first and delays the roster snapshot until Status Radar is near", () => {
    expect(homeSource).toContain("includeRoster: false");
    expect(homeSource).toContain('const shouldLoadStatus = useNearViewport(statusSection, "160px")');
    expect(homeSource).toContain("enabled: shouldLoadStatus");
    expect(homeSource).toContain("const snapshot = (rosterSnapshotQuery.data ?? snapshotQuery.data)");
  });

  it("keeps light and roster-inclusive snapshots in distinct short-lived cache entries", () => {
    expect(snapshotCacheSource).toContain('rosterMode === "roster"');
    expect(snapshotCacheSource).toContain('includeRoster ? "roster" : "light"');
  });

  it("loads only the favorite team's latest result above the fold and defers the full league summary", () => {
    expect(homeSource).toContain("trpc.leagueDashboard.latestResult.useQuery");
    expect(homeSource).toContain("enabled: shouldLoadLeagueCalendar");
    expect(homeSource).toContain("dashboard={latestResultQuery.data}");
  });

  it("loads the Game Stats dialog only after a user requests it", () => {
    expect(homeSource).toContain('React.lazy(async () =>');
    expect(homeSource).toContain('import("@/components/GameStatsDialog")');
    expect(homeSource).toContain("<React.Suspense fallback={null}>");
  });

  it("keeps the full league dashboard below the fold while retaining the visible latest-result card", () => {
    expect(homeSource).toContain("dashboard={leagueDashboard}");
    expect(homeSource).toContain("loading={!shouldLoadLeagueCalendar || leagueQuery.isLoading}");
  });
});
