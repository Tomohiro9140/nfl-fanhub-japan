import React, { useMemo, useState } from "react";
// 誤った import を削除し、元の date-format-jp を使用
import { format, isAfter, subWeeks } from "date-format-jp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Newspaper, ChevronDown, ChevronUp } from "lucide-react";
import type { FavoriteTeam } from "@/lib/nflTeams";
import { dedupeDisplayArticles } from "@/lib/articleDedup";
// 元のダイアログを復元
import { ArticlesSummaryDialog } from "./ArticlesSummaryDialog";

// --- 型定義の拡張 ---
type SourceKind = "team_official" | "nfl_official" | "pft" | "cbs" | "local";

interface FeedItem {
  id: number;
  title: string;
  summary: string | null;
  japaneseSummary?: string | null;
  englishSummary?: string | null;
  sourceUrl: string;
  sourceName: string;
  sourceKind: SourceKind;
  category: "news" | "injury" | "transaction";
  publishedAt: Date;
}

// ニュース選別タスクの目標（8件 or 15件）
type NewsCountGoal = 8 | 15;

// --- 定数定義 ---
// 既存の大手・外部ソースのKindセット
const externalSourceKinds = new Set<SourceKind>(["pft", "cbs"]);

// 各ソースのバッジ・ラベル定義
const sourceLabel = (kind: SourceKind): string => {
  switch (kind) {
    case "team_official": return "Official";
    case "pft": return "PFT";
    case "cbs": return "CBS";
    case "local": return "Local"; // SB Nation用
    default: return "NFL News";
  }
};

// --- UIコンポーネント（タグ表示） ---
function SourceMark({ kind }: { kind: SourceKind }) {
  const label = sourceLabel(kind);
  switch (kind) {
    case "team_official":
      return (
        <Badge variant="outline" className="text-sky-400 border-sky-600 bg-sky-950/40 text-[10px] h-4.5 px-1 font-bold">
          {label}
        </Badge>
      );
    case "local":
      return (
        <Badge variant="outline" className="text-emerald-300 border-emerald-700 bg-emerald-950/50 text-[10px] h-4.5 px-1 font-bold">
          {label}
        </Badge>
      );
    case "pft":
    case "cbs":
      return (
        <Badge variant="secondary" className="text-slate-300 bg-slate-800 text-[10px] h-4.5 px-1 font-medium">
          {label}
        </Badge>
      );
    default:
      return (
        <Badge variant="ghost" className="text-slate-500 text-[10px] h-4.5 px-1 font-medium">
          {label}
        </Badge>
      );
  }
}

// --- コアロジック：ニュース選別 ＆ 固定枠配分 ---
/**
 * ご指定いただいた配分ロジックに基づいて記事を選別し、
 * 最後に全体を公開日時順でソートして返す。
 */
export function selectLatestNews(
  items: FeedItem[],
  goal: NewsCountGoal
): FeedItem[] {
  // 1. 重複除外 ＆ 全体を一旦新着順にソート（選別時の優先度のため）
  const dedupedRaw = dedupeDisplayArticles(items);
  dedupedRaw.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  // 選択された記事を保持する配列とIDセット
  const selected: FeedItem[] = [];
  const selectedIds = new Set<number>();

  if (dedupedRaw.length === 0) return [];

  // 重複を防いで追加するヘルパー
  const addIfNew = (item: FeedItem) => {
    if (!selectedIds.has(item.id)) {
      selected.push(item);
      selectedIds.add(item.id);
      return true;
    }
    return false;
  };

  // --- 2. 各ソースの「保証枠」を目標数（8 or 15）に応じて定義 ---
  const quota = {
    official: goal === 8 ? 3 : 4,
    local: goal === 8 ? 3 : 4,
    cbs: goal === 8 ? 1 : 2,
    pft: goal === 8 ? 1 : 2,
  };

  // --- 3. 保証枠の抽出 ---

  // ① Team Official (Official)
  const officialItems = dedupedRaw
    .filter((item) => item.sourceKind === "team_official")
    .slice(0, quota.official);
  officialItems.forEach(addIfNew);

  // ② Local (SB Nation)
  const localItems = dedupedRaw
    .filter((item) => item.sourceKind === "local")
    .slice(0, quota.local);
  localItems.forEach(addIfNew);

  // ③ 大手メディア (CBS / PFT)
  const fetchExternal = (kind: "cbs" | "pft", count: number) => {
    dedupedRaw
      .filter((item) => item.sourceKind === kind)
      .slice(0, count)
      .forEach(addIfNew);
  };
  fetchExternal("cbs", quota.cbs);
  fetchExternal("pft", quota.pft);

  // --- 4. 残りの枠の補充 ---
  // ソースを問わず、選ばれていない記事の中から公開日時が新しい順に目標数まで埋める
  if (selected.length < goal) {
    for (const item of dedupedRaw) {
      if (selected.length >= goal) break;
      addIfNew(item);
    }
  }

  // --- 5. 最終ソート ---
  // 枠取りされた記事を、改めて公開日時の降順（最新順）でソート
  return selected
    .slice(0, goal)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

// --- メイン UI コンポーネント ---
export function OfficialTeamFeed({
  favorite,
  items,
}: {
  favorite: FavoriteTeam;
  items: FeedItem[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  // 元のダイアログ表示状態を復元
  const [activeArticle, setActiveArticle] = useState<FeedItem | null>(null);

  const oneWeekAgo = useMemo(() => subWeeks(new Date(), 1), []);

  const newsItems = useMemo(() => {
    const goal: NewsCountGoal = isExpanded ? 15 : 8;
    return selectLatestNews(items, goal);
  }, [items, isExpanded]);

  const displayDate = (date: Date) => {
    if (isAfter(date, oneWeekAgo)) {
      return format(date, "M/d(EE) HH:mm JST");
    }
    return format(date, "yyyy/M/d JST");
  };

  return (
    <Card className="border-slate-800 bg-slate-950 shadow-lg">
      <CardHeader className="p-4 pb-2 border-b border-slate-800 flex flex-row items-center gap-3">
        <Newspaper className="h-6 w-6 text-sky-500" />
        <CardTitle className="text-xl font-black text-white tracking-tight">
          Latest News
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {newsItems.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs font-medium">
            No news available.
          </div>
        ) : (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <div className="divide-y divide-slate-800/60">
              {newsItems.map((item, index) => {
                const cardView = (
                  <div key={item.id} className="p-3.5 hover:bg-slate-900/40 transition-colors">
                    {/* 元のダイアログを開く処理を復元 */}
                    <button onClick={() => setActiveArticle(item)} className="block w-full text-left group">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <SourceMark kind={item.sourceKind} />
                            <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-300">
                              {item.sourceName} ・ {displayDate(item.publishedAt)}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-100 leading-snug group-hover:text-sky-300 transition-colors">
                            {item.title}
                          </p>
                          {item.summary && (
                            <p className="text-xs font-medium text-slate-400 leading-relaxed line-clamp-2 pt-0.5">
                              {item.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                );

                return index < 8 ? (
                  cardView
                ) : (
                  <CollapsibleContent key={item.id}>
                    {cardView}
                  </CollapsibleContent>
                );
              })}
            </div>

            {items.filter((i) => i.category === "news").length > 8 && (
              <div className="p-2 border-t border-slate-800">
                <Button
                  variant="ghost"
                  className="w-full text-xs font-bold text-sky-400 hover:text-sky-300 hover:bg-slate-800/60 flex items-center justify-center gap-1.5 py-1.5"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" /> 折りたたむ
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" /> もっと見る（最大15件）
                    </>
                  )}
                </Button>
              </div>
            )}
          </Collapsible>
        )}
      </CardContent>
      {/* 元の記事詳細ダイアログを復元 */}
      {activeArticle && (
        <ArticlesSummaryDialog
          item={activeArticle}
          onClose={() => setActiveArticle(null)}
        />
      )}
    </Card>
  );
}
