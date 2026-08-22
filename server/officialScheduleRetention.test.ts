import { describe, expect, it } from "vitest";
import { isSameJstCalendarDay, shouldCreateScoreboardCalendarFallback } from "./db";

describe("official schedule retention", () => {
  it("identifies a current Japan-day game that a partial official schedule refresh must preserve", () => {
    const now = new Date("2026-08-22T03:00:00.000Z"); // 12:00 JST
    expect(isSameJstCalendarDay(new Date("2026-08-21T23:30:00.000Z"), now)).toBe(true); // 08:30 JST
    expect(isSameJstCalendarDay(new Date("2026-08-22T15:00:00.000Z"), now)).toBe(false); // Next JST day
  });

  it("keeps NYJ@PIT and CAR@JAX same-JST-day FINAL scoreboard rows in ALL GAMES when schedule rows are missing", () => {
    const now = new Date("2026-08-22T03:00:00.000Z"); // 12:00 JST
    const finals = [
      { matchup: "NYJ@PIT", gameState: "FINAL", kickoffAt: new Date("2026-08-21T23:00:00.000Z"), fetchedAt: now },
      { matchup: "CAR@JAX", gameState: "FINAL", kickoffAt: new Date("2026-08-21T23:30:00.000Z"), fetchedAt: now },
    ];
    for (const final of finals) {
      expect(shouldCreateScoreboardCalendarFallback(final, false, now), final.matchup).toBe(true);
      expect(shouldCreateScoreboardCalendarFallback(final, true, now), final.matchup).toBe(false);
      expect(shouldCreateScoreboardCalendarFallback(final, false, new Date("2026-08-22T15:30:00.000Z")), final.matchup).toBe(false); // next JST day
    }
  });
});
