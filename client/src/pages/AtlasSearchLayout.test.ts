import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const atlasStyles = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

describe("ATLAS検索トップのレイアウト", () => {
  it("旧ロゴを非表示にし、タイトルを画面上部と中央の中間へ置く", () => {
    expect(atlasStyles).toContain(".atlas-soft-grid > .atlas-shell > header { position: absolute; inset-inline: 0; top: 25svh; transform: translateY(-50%); }");
    expect(atlasStyles).toContain(".atlas-soft-grid > .atlas-shell > header > div > .atlas-display { display: none !important; }");
  });

  it("検索フォーム本体を縦中央に置き、入力後は結果表示用に上へ展開する", () => {
    expect(atlasStyles).toContain(".atlas-soft-grid > .atlas-shell { position: relative; display: flex; min-height: 100svh; flex-direction: column; justify-content: center; }");
    expect(atlasStyles).toContain(".atlas-soft-grid:has(input:not(:placeholder-shown)) > .atlas-shell { justify-content: flex-start; padding-top: 7rem; }");
  });
});
