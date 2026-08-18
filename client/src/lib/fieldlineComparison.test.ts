import { describe, expect, it } from "vitest";
import { buildFieldlineMetrics } from "./fieldlineComparison";

describe("buildFieldlineMetrics", () => {
  it("builds ranked official-standing comparison rows for two teams", () => {
    const metrics = buildFieldlineMetrics([
      { teamCode: "BUF", wins: 12, losses: 5, ties: 0, pct: ".706", pointsFor: 480, pointsAgainst: 330 },
      { teamCode: "KC", wins: 10, losses: 7, ties: 0, pct: ".588", pointsFor: 420, pointsAgainst: 360 },
    ], "BUF", "KC");
    expect(metrics[0]).toMatchObject({ label: "RECORD", leftValue: "12-5", rightRank: 2 });
    expect(metrics.find((metric) => metric.label === "POINTS AGAINST")?.leftRank).toBe(1);
  });
});
