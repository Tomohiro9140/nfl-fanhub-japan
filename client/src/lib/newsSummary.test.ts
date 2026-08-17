import { describe, expect, it } from "vitest";
import { compactJapaneseSummary, hasDistinctNewsSummary } from "./newsSummary";

describe("compactJapaneseSummary", () => {
  it("keeps short summaries unchanged", () => {
    expect(compactJapaneseSummary("短い公式要約です。", 30)).toBe("短い公式要約です。");
  });

  it("prefers a sentence boundary for long mobile summaries", () => {
    const value = "最初の要点です。次の重要な要点です。さらに詳細な補足説明が続きます。";
    expect(compactJapaneseSummary(value, 18)).toBe("最初の要点です。次の重要な要点です。…");
  });

  it("suppresses an RSS description that simply repeats the article headline", () => {
    expect(hasDistinctNewsSummary("Training Camp Notebook: A closer look", "Training Camp Notebook: A closer look")).toBe(false);
    expect(hasDistinctNewsSummary("Training Camp Notebook: A closer look", "The coach explained how the group will use its final camp practice.")).toBe(true);
  });
});
