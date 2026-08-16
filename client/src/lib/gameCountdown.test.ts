import { describe, expect, it } from "vitest";
import { getGameCountdown } from "./gameCountdown";

describe("getGameCountdown", () => {
  it("formats a live-updating future countdown", () => {
    const result = getGameCountdown("2026-09-13T17:00:05.000Z", new Date("2026-09-12T16:59:00.000Z"));
    expect(result).toEqual({ state: "upcoming", label: "STARTS IN 01D 00:01:05" });
  });

  it("never shows a negative countdown after kickoff", () => {
    expect(getGameCountdown("2026-09-13T17:00:00.000Z", new Date("2026-09-13T17:00:00.000Z"))).toEqual({ state: "kickoff-passed", label: "KICKOFF PASSED" });
  });
});
