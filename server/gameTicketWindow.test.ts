import { describe, expect, it } from "vitest";
import { isWithinJstReplayWindow, selectGameTicketGame } from "./gameTicketWindow";

const completed = { kickoffAt: new Date("2026-08-16T12:00:00.000Z"), gameState: "FINAL", awayScore: 14, homeScore: 20 };
const upcoming = { kickoffAt: new Date("2026-08-23T12:00:00.000Z"), gameState: null, awayScore: null, homeScore: null };

describe("JST replay window for Game Ticket", () => {
  it("keeps an officially final Sunday game through Wednesday 05:59:59 JST", () => {
    const justBeforeCutoff = new Date("2026-08-18T20:59:59.000Z");
    expect(isWithinJstReplayWindow(completed, justBeforeCutoff)).toBe(true);
    expect(selectGameTicketGame({ now: justBeforeCutoff, latestCompletedGame: completed, scheduledGame: upcoming })).toBe(completed);
  });

  it("switches to the next unfinished game exactly at Wednesday 06:00 JST", () => {
    const cutoff = new Date("2026-08-18T21:00:00.000Z");
    expect(isWithinJstReplayWindow(completed, cutoff)).toBe(false);
    expect(selectGameTicketGame({ now: cutoff, latestCompletedGame: completed, scheduledGame: upcoming })).toBe(upcoming);
  });

  it("keeps an active official game ahead of the replay window", () => {
    const live = { kickoffAt: new Date("2026-08-16T10:00:00.000Z"), gameState: "LIVE", awayScore: 7, homeScore: 3 };
    expect(selectGameTicketGame({ now: new Date("2026-08-16T11:00:00.000Z"), activeGame: live, latestCompletedGame: completed, scheduledGame: upcoming })).toBe(live);
  });

  it("lets a viewer explicitly skip the protected result and move to the next game before Wednesday", () => {
    const beforeCutoff = new Date("2026-08-18T20:59:59.000Z");
    expect(selectGameTicketGame({ now: beforeCutoff, latestCompletedGame: completed, scheduledGame: upcoming, skipReplayWindow: true })).toBe(upcoming);
  });

  it("returns to the watched final only while the replay window remains open", () => {
    const beforeCutoff = new Date("2026-08-18T20:59:59.000Z");
    expect(selectGameTicketGame({ now: beforeCutoff, latestCompletedGame: completed, scheduledGame: upcoming, skipReplayWindow: true, forceLastGame: true })).toBe(completed);

    const afterCutoff = new Date("2026-08-18T21:00:00.000Z");
    expect(selectGameTicketGame({ now: afterCutoff, latestCompletedGame: completed, scheduledGame: upcoming, skipReplayWindow: true, forceLastGame: true })).toBe(upcoming);
  });
});
