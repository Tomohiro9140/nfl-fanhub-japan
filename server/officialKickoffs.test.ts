import { describe, expect, it } from "vitest";
import { isEstimatedKickoff } from "@shared/kickoff";
import { kickoffPairKey, parseEspnKickoffs, planKickoffRepairs, preserveKnownKickoffs } from "./officialKickoffs";

const row = (overrides: Record<string, unknown>) => ({ externalId: "new", opponentCode: "DET", seasonPhase: "regular", weekLabel: "WEEK 10", kickoffAt: new Date("2026-11-15T18:00:59Z"), ...overrides });

describe("official kickoff protection", () => {
  // 2026 Week 10 のドイツ開催 NE@DET（実際は 14:30Z）で起きた取り違え
  it("keeps the known kickoff when a sync during the game only yields a provisional time", () => {
    const existing = [row({ externalId: "known", kickoffAt: new Date("2026-11-15T14:30:00Z") })];
    const [merged] = preserveKnownKickoffs(existing, [row({})]);
    expect(merged.kickoffAt.toISOString()).toBe("2026-11-15T14:30:00.000Z");
    expect(merged.externalId).toBe("known");
  });

  it("keeps a Thanksgiving Thursday kickoff instead of the provisional Sunday", () => {
    const existing = [row({ externalId: "thu", opponentCode: "CHI", weekLabel: "WEEK 12", kickoffAt: new Date("2026-11-26T18:00:00Z") })];
    const [merged] = preserveKnownKickoffs(existing, [row({ opponentCode: "CHI", weekLabel: "WEEK 12", kickoffAt: new Date("2026-11-29T18:00:59Z") })]);
    expect(merged.kickoffAt.toISOString()).toBe("2026-11-26T18:00:00.000Z");
  });

  it("accepts a newly announced exact time and never reuses another week's game", () => {
    const existing = [row({ externalId: "old", kickoffAt: new Date("2026-11-15T18:00:00Z") }), row({ externalId: "other", weekLabel: "WEEK 2", kickoffAt: new Date("2026-09-20T17:00:00Z") })];
    const flexed = row({ kickoffAt: new Date("2026-11-16T01:20:00Z") });
    expect(preserveKnownKickoffs(existing, [flexed])[0]).toBe(flexed);
    const otherWeek = row({ weekLabel: "WEEK 17", kickoffAt: new Date("2027-01-03T18:00:59Z") });
    expect(preserveKnownKickoffs(existing, [otherWeek])[0]).toBe(otherWeek);
  });

  it("reads confirmed kickoffs from the ESPN scoreboard and skips TBD games", () => {
    const event = (away: string, home: string, date: string, timeValid = true) => ({ date, competitions: [{ timeValid, competitors: [{ homeAway: "home", team: { abbreviation: home } }, { homeAway: "away", team: { abbreviation: away } }] }] });
    const kickoffs = parseEspnKickoffs({ events: [event("NE", "DET", "2026-11-15T14:30Z"), event("WSH", "NYG", "2026-11-13T01:15Z"), event("TB", "ATL", "2026-12-27T05:00Z", false)] });
    expect(kickoffs.get(kickoffPairKey("DET", "NE"))?.toISOString()).toBe("2026-11-15T14:30:00.000Z");
    expect(kickoffs.has(kickoffPairKey("WAS", "NYG"))).toBe(true);
    expect(kickoffs.has(kickoffPairKey("TB", "ATL"))).toBe(false);
  });

  it("repairs only provisional rows of the same week", () => {
    const kickoffs = new Map([[kickoffPairKey("NE", "DET"), new Date("2026-11-15T14:30:00Z")]]);
    const rows = [
      { id: 1, teamCode: "NE", opponentCode: "DET", kickoffAt: new Date("2026-11-15T18:00:59Z") },
      { id: 2, teamCode: "DET", opponentCode: "NE", kickoffAt: new Date("2026-11-15T14:30:00Z") },
      { id: 3, teamCode: "NE", opponentCode: "DET", kickoffAt: new Date("2026-12-20T18:00:59Z") },
    ];
    expect(planKickoffRepairs(rows, kickoffs)).toEqual([{ id: 1, kickoffAt: new Date("2026-11-15T14:30:00Z") }]);
  });

  it("recognises provisional kickoffs by the 59-second marker", () => {
    expect(isEstimatedKickoff(new Date("2026-11-15T18:00:59Z"))).toBe(true);
    expect(isEstimatedKickoff(new Date("2026-11-15T14:30:00Z"))).toBe(false);
    expect(isEstimatedKickoff(null)).toBe(false);
  });
});
