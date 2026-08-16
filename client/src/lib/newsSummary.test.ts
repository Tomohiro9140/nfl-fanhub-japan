import { describe, expect, it } from "vitest";
import { compactJapaneseSummary } from "./newsSummary";

describe("compactJapaneseSummary", () => {
  it("keeps short summaries unchanged", () => {
    expect(compactJapaneseSummary("短い公式要約です。", 30)).toBe("短い公式要約です。");
  });

  it("prefers a sentence boundary for long mobile summaries", () => {
    const value = "最初の要点です。次の重要な要点です。さらに詳細な補足説明が続きます。";
    expect(compactJapaneseSummary(value, 18)).toBe("最初の要点です。次の重要な要点です。…");
  });
});
