import { describe, expect, it, vi } from "vitest";
import { createTimedLoader } from "./officialDashboardCache";

describe("short-lived official dashboard cache", () => {
  it("shares concurrent reads and reuses a fresh result", async () => {
    const load = vi.fn(async (key: string) => ({ key, call: load.mock.calls.length }));
    const cached = createTimedLoader(10_000, load);
    const [first, second] = await Promise.all([cached("NE"), cached("NE")]);
    const third = await cached("NE");

    expect(load).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
    expect(third).toEqual(first);
  });
});
