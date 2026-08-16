import { describe, expect, it } from "vitest";
import { daznNflGamePassUrl, daznWatchTarget } from "./daznWatch";

describe("DAZN watch navigation", () => {
  it("uses the official NFL Game Pass web URL", () => {
    expect(daznNflGamePassUrl).toBe("https://www.dazn.com/ja-JP/l/nfl-game-pass");
  });

  it("keeps mobile navigation in the current context and opens a desktop browser tab", () => {
    expect(daznWatchTarget("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")).toBe("_self");
    expect(daznWatchTarget("Mozilla/5.0 (Linux; Android 15; Pixel 9)")).toBe("_self");
    expect(daznWatchTarget("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)")).toBe("_blank");
  });
});
