import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  refreshOfficialTeamFeedGroup: vi.fn(),
  refreshOfficialLeagueDashboard: vi.fn(),
  refreshDaznGameLinks: vi.fn(),
  refreshPftAvailabilityInsights: vi.fn(),
}));

vi.mock("./_core/sdk", () => ({ sdk: { authenticateRequest: mocks.authenticateRequest } }));
vi.mock("./officialFeeds", () => ({ cacheAgentOfficialFeed: vi.fn(), refreshOfficialTeamFeedGroup: mocks.refreshOfficialTeamFeedGroup }));
vi.mock("./officialLeagueData", () => ({ refreshOfficialLeagueDashboard: mocks.refreshOfficialLeagueDashboard }));
vi.mock("./daznGameLinks", () => ({ refreshDaznGameLinks: mocks.refreshDaznGameLinks }));
vi.mock("./pftAvailability", () => ({ refreshPftAvailabilityInsights: mocks.refreshPftAvailabilityInsights }));

import { refreshOfficialFeedHandler } from "./officialFeedScheduler";

describe("official feed Heartbeat with PFT availability", () => {
  it("runs PFT availability alongside the official team and league refreshes for an authenticated cron request", async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: true, taskUid: "cron-pft-test" });
    mocks.refreshOfficialTeamFeedGroup.mockResolvedValue([{ teamCode: "NE", ok: true, count: 3 }]);
    mocks.refreshOfficialLeagueDashboard.mockResolvedValue({ standings: 32 });
    mocks.refreshDaznGameLinks.mockResolvedValue({ stored: 0 });
    mocks.refreshPftAvailabilityInsights.mockResolvedValue({ scanned: 1, stored: 1 });
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));

    await refreshOfficialFeedHandler({ body: { forceGroupIndex: 0 } } as never, { json, status } as never);

    expect(mocks.refreshOfficialTeamFeedGroup).toHaveBeenCalledWith(0);
    expect(mocks.refreshOfficialLeagueDashboard).toHaveBeenCalledTimes(1);
    expect(mocks.refreshDaznGameLinks).toHaveBeenCalledTimes(1);
    expect(mocks.refreshPftAvailabilityInsights).toHaveBeenCalledTimes(1);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ ok: true, pft: { scanned: 1, stored: 1 } }));
  });
});
