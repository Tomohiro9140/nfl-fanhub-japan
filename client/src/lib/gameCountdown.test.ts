import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GameCountdown } from "@/components/GameCountdown";
import { getGameCardStatus, getGameCountdown } from "./gameCountdown";

describe("getGameCountdown", () => {
  it("formats a live-updating future countdown", () => {
    const result = getGameCountdown("2026-09-13T17:00:05.000Z", new Date("2026-09-12T16:59:00.000Z"));
    expect(result).toEqual({ state: "upcoming", label: "STARTS IN 01D 00:01:05" });
  });

  it("never shows a negative countdown after kickoff", () => {
    expect(getGameCountdown("2026-09-13T17:00:00.000Z", new Date("2026-09-13T17:00:00.000Z"))).toEqual({ state: "kickoff-passed", label: "KICKOFF PASSED" });
  });

  it("shows LIVE during the game window and an official score when final", () => {
    const kickoff = "2026-09-13T17:00:00.000Z";
    expect(getGameCardStatus(kickoff, new Date("2026-09-13T18:00:00.000Z"), null)).toEqual({ state: "live", label: "LIVE" });
    expect(getGameCardStatus(kickoff, new Date("2026-09-13T21:00:00.000Z"), { gameState: "FINAL", awayScore: 24, homeScore: 17 })).toEqual({ state: "final", label: "FINAL 24 - 17" });
  });

  it("renders the LIVE badge and FINAL official score in the UI component", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-13T18:00:00.000Z"));
    expect(renderToStaticMarkup(createElement(GameCountdown, { kickoffAt: new Date("2026-09-13T17:00:00.000Z"), result: { gameState: null, awayScore: null, homeScore: null } }))).toContain("LIVE");
    expect(renderToStaticMarkup(createElement(GameCountdown, { kickoffAt: new Date("2026-09-13T17:00:00.000Z"), result: { gameState: "FINAL", awayScore: 24, homeScore: 17 } }))).toContain("FINAL 24 - 17");
    vi.useRealTimers();
  });
});
