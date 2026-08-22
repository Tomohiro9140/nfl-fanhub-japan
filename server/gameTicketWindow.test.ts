import { describe, expect, it } from "vitest";
import { getRegularSeasonByeWeek, isWithinJstReplayWindow, selectGameTicketGame } from "./gameTicketWindow";

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

  it("keeps a live scoreboard candidate ahead of a later fixture when its schedule row is unavailable", () => {
    const liveScoreboard = { kickoffAt: new Date("2026-08-22T01:50:00.000Z"), gameState: "INGAME", awayScore: 7, homeScore: 10, weekLabel: "PRESEASON WEEK 2", seasonPhase: "preseason" as const };
    const weekThree = { kickoffAt: new Date("2026-08-29T01:00:00.000Z"), gameState: null, awayScore: null, homeScore: null, weekLabel: "PRESEASON WEEK 3", seasonPhase: "preseason" as const };
    expect(selectGameTicketGame({ now: new Date("2026-08-22T02:00:00.000Z"), activeGame: liveScoreboard, scheduledGame: weekThree })).toBe(liveScoreboard);
  });

  it("keeps every current Week 2 participant on its live score instead of selecting Week 3", () => {
    const pairs = [["GB", "DEN"], ["NYJ", "PIT"], ["CAR", "JAX"]] as const;
    for (const [awayTeamCode, homeTeamCode] of pairs) {
      const liveScoreboard = { awayTeamCode, homeTeamCode, kickoffAt: new Date("2026-08-22T01:50:00.000Z"), gameState: "INGAME", awayScore: 7, homeScore: 10, weekLabel: "PRESEASON WEEK 2", seasonPhase: "preseason" as const };
      const weekThree = { kickoffAt: new Date("2026-08-29T01:00:00.000Z"), gameState: null, awayScore: null, homeScore: null, weekLabel: "PRESEASON WEEK 3", seasonPhase: "preseason" as const };
      const selected = selectGameTicketGame({ now: new Date("2026-08-22T02:00:00.000Z"), activeGame: liveScoreboard, scheduledGame: weekThree });
      expect(selected).toBe(liveScoreboard);
      expect(selected?.weekLabel).toBe("PRESEASON WEEK 2");
    }
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

  it("selects the next actual game when a club has no game during its bye week", () => {
    const lastBeforeBye = { kickoffAt: new Date("2026-10-18T17:00:00.000Z"), gameState: "FINAL", awayScore: 17, homeScore: 24 };
    const nextAfterBye = { kickoffAt: new Date("2026-11-01T17:00:00.000Z"), gameState: null, awayScore: null, homeScore: null };

    expect(selectGameTicketGame({ now: new Date("2026-10-26T12:00:00.000Z"), latestCompletedGame: lastBeforeBye, scheduledGame: nextAfterBye, skipReplayWindow: true })).toBe(nextAfterBye);
  });

  it("shows a bye-week notice only after the prior replay window closes", () => {
    const latestCompletedGame = { kickoffAt: new Date("2026-10-18T17:00:00.000Z"), gameState: "FINAL", awayScore: 17, homeScore: 24, seasonPhase: "regular" as const, weekLabel: "WEEK 6" };
    const scheduledGame = { kickoffAt: new Date("2026-10-30T00:15:00.000Z"), gameState: null, awayScore: null, homeScore: null, seasonPhase: "regular" as const, weekLabel: "WEEK 8" };
    expect(getRegularSeasonByeWeek({ now: new Date("2026-10-20T00:00:00.000Z"), latestCompletedGame, scheduledGame })).toBeUndefined();
    expect(getRegularSeasonByeWeek({ now: new Date("2026-10-22T00:00:00.000Z"), latestCompletedGame, scheduledGame })).toEqual({ weekLabel: "WEEK 7", nextGameWeekLabel: "WEEK 8" });
  });
});
