import React, { useState } from "react";
import { ArrowUpRight, Flame, Loader2, Sparkles, Star, Trophy, Tv, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getTeamByCode } from "@/lib/nflTeams";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExciteIndexDialogProps {
  open: boolean;
  onClose: () => void;
  season?: number;
  initialWeekLabel?: string;
}

/** 熱狂度スコアに応じた見どころタグの生成（ネタバレなし） */
function getExciteTags(game: {
  exciteIndex: {
    score: number;
    margin: number;
    totalPoints: number;
    isOvertime: boolean;
  } | null;
}) {
  const tags: string[] = [];
  if (!game.exciteIndex) return tags;

  if (game.exciteIndex.isOvertime) {
    tags.push("延長戦突入 (OT)");
  }
  if (game.exciteIndex.margin <= 3) {
    tags.push("ワンポゼッション決着");
  } else if (game.exciteIndex.margin <= 7) {
    tags.push("大接戦");
  }
  if (game.exciteIndex.totalPoints >= 55) {
    tags.push("ハイスコア激闘");
  }
  if (game.exciteIndex.score >= 85) {
    tags.push("屈指の名勝負");
  } else if (game.exciteIndex.score >= 70) {
    tags.push("見応え十分");
  }

  return tags.slice(0, 3);
}

/** 星評価（1〜5）の描画 */
function StarRating({ stars }: { stars: number }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((idx) => (
        <Star
          key={idx}
          className={`h-3.5 w-3.5 ${
            idx <= stars
              ? "fill-[#ffc1a7] text-[#ffc1a7]"
              : "fill-transparent text-[#64748b]/40"
          }`}
        />
      ))}
    </div>
  );
}

export function ExciteIndexDialog({
  open,
  onClose,
  season = 2026,
  initialWeekLabel,
}: ExciteIndexDialogProps) {
  const [selectedWeek, setSelectedWeek] = useState<string | undefined>(initialWeekLabel);

  const { data, isLoading } = trpc.exciteIndex.getWeeklyRankings.useQuery(
    { season, weekLabel: selectedWeek },
    { enabled: open }
  );

  const activeWeek = selectedWeek ?? data?.weekLabel ?? "";
  const completedGames = (data?.games ?? []).filter((g) => g.exciteIndex !== null);
  const top3Games = completedGames.slice(0, 3);
  const remainingGames = completedGames.slice(3);

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[#ded8cc] bg-[#0a1931] p-0 text-[#fffaf0] shadow-2xl sm:rounded-[20px]">
        {/* ヘッダーエリア */}
        <div className="relative border-b border-white/10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1d3557] to-[#0a1931] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[.18em] text-[#ffc1a7]">
                <Flame className="h-3.5 w-3.5 text-[#e85d2a]" />
                EXCITE INDEX / HEAT MAP
              </div>
              <DialogTitle className="mt-1 font-display text-2xl font-black tracking-wide text-white">
                今週の注目ゲーム・熱狂度ランキング
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-[#d9e3f3]">
                ネタバレ完全防止。点差や勝敗を隠したまま、試合の白熱度・ドラマ性だけを数値化しています。
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="閉じる"
              className="rounded-full bg-white/10 p-1.5 text-[#d9e3f3] transition hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 週選択タブ */}
          {data?.availableWeeks && data.availableWeeks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
              {data.availableWeeks.map((week) => (
                <button
                  key={week}
                  type="button"
                  onClick={() => setSelectedWeek(week)}
                  className={`rounded px-2.5 py-1 font-mono text-[9px] font-bold tracking-wider transition ${
                    activeWeek === week
                      ? "bg-[#e85d2a] text-white shadow-md"
                      : "bg-white/10 text-[#d9e3f3] hover:bg-white/20"
                  }`}
                >
                  {week}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* コンテンツエリア */}
        <div className="p-4 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#ffc1a7]" />
              <p className="mt-3 font-mono text-xs text-[#d9e3f3]">熱狂度指数を算出中…</p>
            </div>
          ) : completedGames.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/20 bg-white/5 py-12 text-center">
              <p className="font-display text-base font-bold text-white">試合データがありません</p>
              <p className="mt-1 text-xs text-[#a5b3c9]">
                対象週の試合が終了（FINAL）すると自動的に熱狂度ランキングが算出されます。
              </p>
            </div>
          ) : (
            <>
              {/* TOP 3 ピックアップカード */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[.15em] text-[#ffc1a7]">
                    <Trophy className="h-3.5 w-3.5 text-[#ffc1a7]" />
                    MUST-WATCH GAMES / TOP 3
                  </h3>
                  <span className="font-mono text-[9px] text-[#a5b3c9]">見逃し配信推奨</span>
                </div>

                <div className="grid gap-3">
                  {top3Games.map((game) => {
                    const away = getTeamByCode(game.awayTeamCode);
                    const home = getTeamByCode(game.homeTeamCode);
                    const tags = getExciteTags(game);
                    const rank = game.rank ?? 1;

                    return (
                      <div
                        key={game.id}
                        className={`relative overflow-hidden rounded-xl border p-4 transition ${
                          rank === 1
                            ? "border-[#e85d2a]/60 bg-gradient-to-r from-white/[0.08] to-transparent shadow-lg shadow-[#e85d2a]/10"
                            : "border-white/15 bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* 順位 & 対戦カード */}
                          <div className="flex items-center gap-3">
                            <span
                              className={`grid h-8 w-8 place-items-center rounded-lg font-display text-base font-black ${
                                rank === 1
                                  ? "bg-[#e85d2a] text-white"
                                  : rank === 2
                                  ? "bg-[#ffc1a7] text-[#0a1931]"
                                  : "bg-white/20 text-white"
                              }`}
                            >
                              {rank}
                            </span>
                            <div>
                              <div className="font-display text-lg font-bold leading-tight text-white">
                                {away?.name ?? game.awayTeamCode}{" "}
                                <span className="text-white/40 font-mono text-sm">@</span>{" "}
                                {home?.name ?? game.homeTeamCode}
                              </div>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {tags.map((t) => (
                                  <span
                                    key={t}
                                    className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[8px] font-bold text-[#ffc1a7]"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* 熱狂度スコア */}
                          <div className="text-right shrink-0">
                            <div className="font-display text-2xl font-black leading-none text-[#ffc1a7]">
                              {game.exciteIndex?.score}
                              <span className="font-mono text-[10px] font-normal text-white/50">/100</span>
                            </div>
                            <div className="mt-1">
                              <StarRating stars={game.exciteIndex?.stars ?? 1} />
                            </div>
                          </div>
                        </div>

                        {/* 下部アクション（ハイライト等） */}
                        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
                          <span className="font-mono text-[8px] font-medium text-[#a5b3c9]">
                            {game.exciteIndex?.stars === 5
                              ? "★★★★★ 歴史的名戦・必見"
                              : game.exciteIndex?.stars === 4
                              ? "★★★★☆ 白熱の好ゲーム"
                              : "★★★☆☆ 安定した展開"}
                          </span>
                          {game.nflHighlightUrl ? (
                            <a
                              href={game.nflHighlightUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-[#ffc1a7] underline underline-offset-2 hover:text-white"
                            >
                              <Tv className="h-3 w-3" /> WATCH HIGHLIGHTS <ArrowUpRight className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="font-mono text-[8px] text-[#a5b3c9]">
                              ハイライト準備中
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4位以下の全試合ランキングリスト */}
              {remainingGames.length > 0 && (
                <div>
                  <h3 className="mb-2 font-mono text-[10px] font-bold tracking-[.15em] text-[#a5b3c9]">
                    FULL WEEKLY RANKINGS / 4位以降
                  </h3>
                  <div className="divide-y divide-white/10 rounded-xl border border-white/15 bg-white/[0.02]">
                    {remainingGames.map((game) => {
                      const away = getTeamByCode(game.awayTeamCode);
                      const home = getTeamByCode(game.homeTeamCode);
                      const rank = game.rank;

                      return (
                        <div
                          key={game.id}
                          className="flex items-center justify-between gap-3 p-3 text-xs hover:bg-white/[0.03]"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 text-center font-mono font-bold text-[#a5b3c9]">
                              {rank}
                            </span>
                            <div>
                              <p className="font-bold text-white">
                                {away?.name ?? game.awayTeamCode}{" "}
                                <span className="text-white/40">@</span>{" "}
                                {home?.name ?? game.homeTeamCode}
                              </p>
                              <p className="font-mono text-[9px] text-[#a5b3c9]">
                                熱狂度: {game.exciteIndex?.score}点 · ★{game.exciteIndex?.stars}
                              </p>
                            </div>
                          </div>

                          <div>
                            {game.nflHighlightUrl ? (
                              <a
                                href={game.nflHighlightUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-mono text-[8px] font-bold text-[#ffc1a7] underline underline-offset-2 hover:text-white"
                              >
                                HIGHLIGHTS <ArrowUpRight className="h-2.5 w-2.5" />
                              </a>
                            ) : (
                              <span className="font-mono text-[8px] text-[#64748b]">—</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
