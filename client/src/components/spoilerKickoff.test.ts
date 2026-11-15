import { describe, expect, it } from "vitest";
import { spoilerNewsCutoff, spoilerProtectionStart } from "./OfficialTeamFeed";

describe("spoiler protection with provisional kickoffs", () => {
  it("uses the exact kickoff when it is known", () => {
    const game = { gameState: null, kickoffAt: new Date("2026-11-15T14:30:00Z") };
    expect(spoilerNewsCutoff(game)?.toISOString()).toBe("2026-11-15T13:00:00.000Z");
    expect(spoilerProtectionStart(game)?.toISOString()).toBe("2026-11-15T14:30:00.000Z");
  });

  // 仮の時刻（秒59）は実際より遅いことがある：ドイツ開催は 14:30Z、仮の時刻は 18:00:59Z
  it("starts protection days early when only a provisional kickoff exists", () => {
    const game = { gameState: null, kickoffAt: new Date("2026-11-15T18:00:59Z") };
    const germanyKickoff = new Date("2026-11-15T14:30:00Z").getTime();
    expect(spoilerNewsCutoff(game)!.getTime()).toBeLessThan(germanyKickoff);
    expect(spoilerProtectionStart(game)!.getTime()).toBeLessThan(germanyKickoff);
  });

  it("covers a Thanksgiving Thursday game whose provisional kickoff is the following Sunday", () => {
    const game = { gameState: null, kickoffAt: new Date("2026-11-29T18:00:59Z") };
    const thanksgivingKickoff = new Date("2026-11-26T18:00:00Z").getTime();
    expect(spoilerNewsCutoff(game)!.getTime()).toBeLessThanOrEqual(thanksgivingKickoff - 90 * 60 * 1000);
    expect(spoilerProtectionStart(game)!.getTime()).toBeLessThanOrEqual(thanksgivingKickoff);
  });
});
