import { describe, expect, it } from "vitest";
import { isSameJstCalendarDay } from "./db";

describe("official schedule retention", () => {
  it("identifies a current Japan-day game that a partial official schedule refresh must preserve", () => {
    const now = new Date("2026-08-22T03:00:00.000Z"); // 12:00 JST
    expect(isSameJstCalendarDay(new Date("2026-08-21T23:30:00.000Z"), now)).toBe(true); // 08:30 JST
    expect(isSameJstCalendarDay(new Date("2026-08-22T15:00:00.000Z"), now)).toBe(false); // Next JST day
  });
});
