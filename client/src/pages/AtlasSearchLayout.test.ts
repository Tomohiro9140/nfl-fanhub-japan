import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const atlasStyles = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
const atlasSource = readFileSync(resolve(process.cwd(), "client/src/pages/Atlas.tsx"), "utf8");

describe("ATLAS検索トップのレイアウト", () => {
  it("旧ロゴを非表示にし、タイトルを画面上部と中央の中間へ置く", () => {
    expect(atlasStyles).toContain(".atlas-soft-grid > .atlas-shell > header { position: absolute; inset-inline: 0; top: 25svh; transform: translateY(-50%); }");
    expect(atlasStyles).toContain(".atlas-soft-grid > .atlas-shell > header > div > .atlas-display { display: none !important; }");
    expect(atlasStyles).toContain('font-family: "Barlow Condensed", "Noto Sans JP", sans-serif !important; font-size: clamp(4.25rem, 21vw, 5.5rem) !important; font-style: italic !important; font-weight: 800 !important;');
  });

  it("検索フォーム本体を縦中央に置き、入力後もタイトルと検索ボックス上端を固定する", () => {
    expect(atlasStyles).toContain(".atlas-soft-grid > .atlas-shell { position: relative; display: flex; height: 100%; min-height: 0; flex-direction: column; justify-content: center; }");
    expect(atlasStyles).toContain(".atlas-soft-grid:has(input:not(:placeholder-shown)) > .atlas-shell { justify-content: center; padding-top: 0; }");
  });

  it("チーム検索は名前検索の上端を保ち、選択後の内容だけを下方向へ展開する", () => {
    expect(atlasStyles).toContain(".atlas-team-search-stage > .atlas-shell { display: flex; height: 100%; min-height: 0; padding-top: 0 !important; }");
    expect(atlasStyles).toContain(".atlas-soft-grid > .atlas-shell > header,\n  .atlas-team-search-stage > .atlas-shell > header { top: 33.5svh !important; }");
    expect(atlasStyles).toContain(".atlas-soft-grid > .atlas-shell > section { transform: translateY(3.5rem); }");
    expect(atlasStyles).toContain(".atlas-team-search-stage > .atlas-shell > header { position: absolute !important; inset-inline: 0; top: 25svh !important; transform: translateY(-50%) !important; margin-bottom: 0 !important; }");
    expect(atlasSource).toContain('const isTeamSearch = mode === "filter";');
    expect(atlasSource).toContain('isLanding ? "h-[100svh] min-h-[100svh] overflow-hidden" : "min-h-screen pb-10"');
  });

  it("共通ナビゲーションを表示し、空の名前検索トップだけをビューポート固定にする", () => {
    expect(atlasSource).toContain('import { EmbeddedAppNav } from "@/components/EmbeddedAppNav";');
    expect((atlasSource.match(/<EmbeddedAppNav current="ATLAS"/g) ?? [])).toHaveLength(2);
    expect(atlasSource).toContain('const isLanding = mode === "name" && !typedQuery;');
    expect(atlasSource).toContain('isLanding ? "h-[100svh] min-h-[100svh] overflow-hidden" : "min-h-screen pb-10"');
  });
});
