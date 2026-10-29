import { describe, expect, it } from "vitest";
import { nflDraftYearFor, nflSeasonDisplayLabel, nflSeasonFor } from "./season";

describe("NFL season year", () => {
  it("keeps the season through the playoffs and the offseason until July", () => {
    expect(nflSeasonFor(new Date("2026-10-29T00:00:00Z"))).toBe(2026);
    expect(nflSeasonFor(new Date("2027-01-10T00:00:00Z"))).toBe(2026); // ワイルドカード
    expect(nflSeasonFor(new Date("2027-02-14T00:00:00Z"))).toBe(2026); // スーパーボウル
    expect(nflSeasonFor(new Date("2027-05-15T00:00:00Z"))).toBe(2026); // 翌年日程の発表後も直前シーズンを表示
    expect(nflSeasonFor(new Date("2027-06-30T23:59:59Z"))).toBe(2026);
  });

  it("switches to the next season on July 1 (UTC)", () => {
    expect(nflSeasonFor(new Date("2027-07-01T00:00:00Z"))).toBe(2027);
    expect(nflSeasonFor(new Date("2027-08-10T00:00:00Z"))).toBe(2027); // プレシーズン
  });

  it("formats the season and draft year", () => {
    expect(nflSeasonDisplayLabel(2026)).toBe("2026-27");
    expect(nflSeasonDisplayLabel(2099)).toBe("2099-00");
    expect(nflDraftYearFor(2026)).toBe(2027);
  });
});
