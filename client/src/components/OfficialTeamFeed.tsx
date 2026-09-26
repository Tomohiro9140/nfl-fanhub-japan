import React, { useMemo, useState } from "react";
import { format, isAfter, subWeeks } from "date-format-jp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Newspaper, ChevronDown, ChevronUp } from "lucide-react";
import type { FavoriteTeam } from "@/lib/nflTeams";
import { dedupeDisplayArticles } from "@/lib/articleDedup";

// --- 型定義の拡張 ---
// ニュースソースの種類（"local" を追加）
type SourceKind = "team_official" | "nfl_official" | "pft" | "cbs" | "local";

interface FeedItem {
  id: number;
  title: string;
  summary: string | null;
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
// ソースごとのタグ（バッジ）をスタイル付きで表示する
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
 * 取得した全記事から、指定された枠数（8 or 15）の保証枠に従って記事を選別し、
 * 最後に全体を公開日時順でソートして返す。
 */
export function selectLatestNews(
  items: FeedItem[],
  goal: NewsCountGoal
): FeedItem[] {
  // 1. 重複除外 ＆ 全体を一旦新着順にソート（選別時の優先度のため）
  const dedupedRaw = dedupeDisplayArticles(items);
  dedupedRaw.sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  );

  // 選択された記事を保持する配列とIDセット
  const selected: FeedItem[] = [];
  const selectedIds = new Set<number>();

  // ガード: 記事がない場合
  if (dedupedRaw.length === 0) return [];

  // 記事を追加するためのヘルパー（重複を防ぐ）
  const addIfNew = (item: FeedItem) => {
    if (!selectedIds.has(item.id)) {
      selected.push(item);
      selectedIds.add(item.id);
      return true;
    }
    return false;
  };

  // --- 2. 各ソースの「保証枠（クォータ）」を定義 ---
  // 目標数（8 or 15）に応じて切り替え
  const quota = {
    official: goal === 8 ? 3 : 4,
    local: goal === 8 ? 3 : 4,
    cbs: goal === 8 ? 1 : 2,
    pft: goal === 8 ? 1 : 2,
  };

  // --- 3. 保証枠の抽出処理 ---

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

  // ③ 大手メディア (CBS / PFT) - 連続制限を行いながら抽出
  const fetchExternal = (kind: "cbs" | "pft", count: number) => {
    const extRaw = dedupedRaw.filter((item) => item.sourceKind === kind);
    // CBS/PFTは同一ソースの連投が多いため、保証枠をさらに期間で区切るなどしても良いが、
    // ここでは単純にクォータ分を抽出
    const extSelected = extRaw.slice(0, count);
    extSelected.forEach(addIfNew);
  };

  fetchExternal("cbs", quota.cbs);
  fetchExternal("pft", quota.pft);

  // --- 4. 残りの枠の補充処理 ---
  // ソースを問わず、選ばれていない記事の中から公開日時が新しい順に目標数まで埋める
  if (selected.length < goal) {
    for (const item of dedupedRaw) {
      if (selected.length >= goal) break;
      addIfNew(item); // 重複していなければ追加される
    }
  }

  // --- 5. 最終ソート ---
  // 枠取りされた最大8/15件を、改めて公開日時の降順（最新順）でソート
  return selected
    .slice(0, goal) // 安全のため目標数で切り出し
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
  // アコーディオンの展開状態（初期値: 折りたたみ）
  const [isExpanded, setIsExpanded] = useState(false);

  // 1週間前の日付（日付表示の判定用）
  const oneWeekAgo = useMemo(() => subWeeks(new Date(), 1), []);

  // --- ニュース選別・ソート処理 ---
  // items が更新された時や、展開状態（isExpanded）が変わった時に再計算
  const newsItems = useMemo(() => {
    // 展開状態に応じて目標件数（8 or 15）を切り替え
    const goal: NewsCountGoal = isExpanded ? 15 : 8;
    return selectLatestNews(items, goal);
  }, [items, isExpanded]);

  // 日付の表示フォーマット判定
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
                // 初期表示（8件）と展開時（15件）の表示制御
                // CollapsibleContent を用いてスムーズなアニメーションを実現
                const cardView = (
                  <div key={item.id} className="p-3.5 hover:bg-slate-900/40 transition-colors">
                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="block group">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2">
                            {/* ソースタグ（Local, Officialなど） */}
                            <SourceMark kind={item.sourceKind} />
                            {/* ソース名 ＆ 日付 */}
                            <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-300">
                              {item.sourceName} ・ {displayDate(item.publishedAt)}
                            </span>
                          </div>
                          {/* 記事タイトル */}
                          <p className="text-sm font-semibold text-slate-100 leading-snug group-hover:text-sky-300 transition-colors">
                            {item.title}
                          </p>
                          {/* 記事要約 */}
                          {item.summary && (
                            <p className="text-xs font-medium text-slate-400 leading-relaxed line-clamp-2 pt-0.5">
                              {item.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </a>
                  </div>
                );

                // 9件目以降の記事は CollapsibleContent に入れる
                return index < 8 ? (
                  cardView
                ) : (
                  <CollapsibleContent key={item.id} className="CollapsibleContent">
                    {cardView}
                  </CollapsibleContent>
                );
              })}
            </div>

            {/* アコーディオン展開ボタン（記事が9件以上ある場合のみ表示） */}
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
    </Card>
  );
}
