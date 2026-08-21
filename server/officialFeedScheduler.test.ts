import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  refreshOfficialTeamFeedGroup: vi.fn(),
  refreshOfficialLeagueDashboard: vi.fn(),
  refreshOfficialScorePulse: vi.fn(),
  refreshDaznGameLinks: vi.fn(),
  refreshPftAvailabilityInsights: vi.fn(),
  refreshExternalTeamNews: vi.fn(),
}));

vi.mock("./_core/sdk", () => ({ sdk: { authenticateRequest: mocks.authenticateRequest } }));
vi.mock("./officialFeeds", () => ({ cacheAgentOfficialFeed: vi.fn(), refreshOfficialTeamFeedGroup: mocks.refreshOfficialTeamFeedGroup, scheduledTeamGroups: [["ARI", "ATL", "BAL", "BUF", "CAR", "CHI", "CIN", "CLE"]] }));
vi.mock("./officialLeagueData", () => ({ refreshOfficialLeagueDashboard: mocks.refreshOfficialLeagueDashboard, refreshOfficialScorePulse: mocks.refreshOfficialScorePulse }));
vi.mock("./daznGameLinks", () => ({ refreshDaznGameLinks: mocks.refreshDaznGameLinks }));
vi.mock("./pftAvailability", () => ({ refreshPftAvailabilityInsights: mocks.refreshPftAvailabilityInsights }));
vi.mock("./externalTeamNews", () => ({ refreshExternalTeamNews: mocks.refreshExternalTeamNews }));

import { refreshOfficialFeedHandler, refreshOfficialScorePulseHandler } from "./officialFeedScheduler";

describe("official feed Heartbeat with PFT availability", () => {
  it("runs PFT availability alongside the official team and league refreshes for an authenticated cron request", async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: true, taskUid: "cron-pft-test" });
    mocks.refreshOfficialTeamFeedGroup.mockResolvedValue([{ teamCode: "NE", ok: true, count: 3 }]);
    mocks.refreshOfficialLeagueDashboard.mockResolvedValue({ standings: 32 });
    mocks.refreshDaznGameLinks.mockResolvedValue({ stored: 0 });
    mocks.refreshPftAvailabilityInsights.mockResolvedValue({ scanned: 1, stored: 1 });
    mocks.refreshExternalTeamNews.mockResolvedValue({ stored: 2, sources: [] });
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));

    await refreshOfficialFeedHandler({ body: { forceGroupIndex: 0 } } as never, { json, status } as never);

    expect(mocks.refreshOfficialTeamFeedGroup).toHaveBeenCalledWith(0);
    expect(mocks.refreshOfficialLeagueDashboard).toHaveBeenCalledTimes(1);
    expect(mocks.refreshDaznGameLinks).toHaveBeenCalledTimes(1);
    expect(mocks.refreshPftAvailabilityInsights).toHaveBeenCalledTimes(1);
    expect(mocks.refreshExternalTeamNews).toHaveBeenCalledWith(["ARI", "ATL", "BAL", "BUF", "CAR", "CHI", "CIN", "CLE"]);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ ok: true, pft: { scanned: 1, stored: 1 }, externalNews: { stored: 2, sources: [] } }));
  });

  it("refreshes official scores through the dedicated authenticated score-pulse endpoint", async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: true, taskUid: "cron-score-pulse" });
    mocks.refreshOfficialScorePulse.mockResolvedValue({ refreshed: true, scores: 16, season: 2026 });
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));

    await refreshOfficialScorePulseHandler({ body: {} } as never, { json, status } as never);

    expect(mocks.refreshOfficialScorePulse).toHaveBeenCalledTimes(1);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ ok: true, scorePulse: { refreshed: true, scores: 16, season: 2026 } }));
  });
});
