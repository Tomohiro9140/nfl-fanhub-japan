import { describe, expect, it } from "vitest";
import { daznNflGamePassUrl, daznWatchTarget, resultWatchHref } from "./daznWatch";

describe("DAZN watch navigation", () => {
  it("uses the official NFL Game Pass web URL", () => {
    expect(daznNflGamePassUrl).toBe("https://www.dazn.com/ja-JP/l/nfl-game-pass");
  });

  it("keeps mobile navigation in the current context and opens a desktop browser tab", () => {
    expect(daznWatchTarget("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")).toBe("_self");
    expect(daznWatchTarget("Mozilla/5.0 (Linux; Android 15; Pixel 9)")).toBe("_self");
    expect(daznWatchTarget("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)")).toBe("_blank");
  });

  it("uses a verified DAZN game URL for results and falls back to the official NFL game page", () => {
    expect(resultWatchHref("https://www.dazn.com/ja-JP/home/buf-cle", "https://www.nfl.com/games/buf-cle")).toBe("https://www.dazn.com/ja-JP/home/buf-cle");
    expect(resultWatchHref(null, "https://www.nfl.com/games/buf-cle")).toBe("https://www.nfl.com/games/buf-cle");
  });
});
