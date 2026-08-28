import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const atlasStyles = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
const atlasSource = readFileSync(resolve(process.cwd(), "client/src/pages/Atlas.tsx"), "utf8");

describe("ATLAS検索トップのレイアウト", () => {
  it("モバイルではタイトルをヘッダー行へ分離し、旧中央の絶対配置を上書きする", () => {
    expect(atlasStyles).toContain("/* ATLAS search-stage reset:");
    expect(atlasStyles).toContain("position: static !important;");
    expect(atlasStyles).toContain("height: 2.75rem;");
    expect(atlasStyles).toContain("font-size: 1.4rem !important;");
  });

  it("名前・チーム検索で同じカード上端を使い、背の高いチーム検索カードを下方向へだけ伸ばす", () => {
    expect(atlasStyles).toContain("@media (max-width: 960px)");
    expect(atlasStyles).toContain(".atlas-soft-grid > .atlas-shell > section");
    expect(atlasStyles).toContain("margin-top: clamp(7.75rem, calc(50svh - 13rem), 14.5rem) !important;");
    expect(atlasStyles).toContain("min-height: 100svh !important;");
    expect(atlasStyles).not.toContain(".atlas-team-search-stage > .atlas-shell { display: flex;");
    expect(atlasSource).toContain('const isTeamSearch = mode === "filter";');
    expect(atlasSource).toContain('isLanding ? "h-[100svh] min-h-[100svh] overflow-hidden" : "min-h-screen pb-10"');
  });

  it("共通ナビゲーションを表示し、空の名前検索トップだけをビューポート固定にする", () => {
    expect(atlasSource).toContain('import { EmbeddedAppNav } from "@/components/EmbeddedAppNav";');
    expect((atlasSource.match(/<EmbeddedAppNav current="ATLAS"/g) ?? [])).toHaveLength(2);
    expect(atlasSource).toContain('const isLanding = mode === "name" && !typedQuery;');
    expect(atlasSource).toContain('isLanding ? "h-[100svh] min-h-[100svh] overflow-hidden" : "min-h-screen pb-10"');
  });

  it("軽量な現役候補と全フィルターを先読みし、チーム変更時に追加待機しない", () => {
    expect(atlasSource).toContain('window.setTimeout(() => setDebouncedQuery(nameQuery), 120)');
    expect(atlasSource).toContain('trpc.atlas.searchSuggestions.useQuery(nameInput');
    expect(atlasSource).toContain('const filters = trpc.atlas.filters.useQuery(undefined, { staleTime: 6 * 60 * 60_000, refetchOnMount: false })');
    expect(atlasSource).toContain('const teamPositions = filters.data?.positionsByTeam?.[team]');
  });
});
