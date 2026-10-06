import React, { useState } from "react";
import { DraftPickItem } from "@/lib/draftOrder";
import { getTeamByCode } from "@/lib/nflTeams";
import { HelpCircle, X } from "lucide-react";

interface DraftOrderViewProps {
  draftPicks: DraftPickItem[];
}

export const DraftOrderView: React.FC<DraftOrderViewProps> = ({ draftPicks }) => {
  // タイブレーク理由のポップアップ表示用ステート
  const [activeReason, setActiveReason] = useState<{ teamName: string; reason: string } | null>(null);

  return (
    <div className="space-y-4">
      {/* リスト本体 */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {draftPicks.map((item) => {
            const teamMeta = getTeamByCode(item.teamCode);
            const isTop5 = item.pickNumber <= 5;
            const hasTiebreak = Boolean(item.tiebreakReason && item.tiebreakReason !== "単独");

            return (
              <div
                key={item.teamCode}
                className="flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 transition hover:bg-slate-50/80"
              >
                {/* 左側：順位バッジ ＋ ロゴ ＋ チーム名 ＋ 地区 */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full text-xs font-black tabular-nums shrink-0 ${
                      item.pickNumber === 1
                        ? "bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-sm"
                        : isTop5
                        ? "bg-[#0a1931] text-[#ffc1a7]"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    {item.pickNumber}
                  </span>

                  {teamMeta?.logo ? (
                    <img
                      src={teamMeta.logo}
                      alt={item.teamCode}
                      className="h-6 w-6 sm:h-7 sm:w-7 object-contain shrink-0"
                    />
                  ) : (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-600 shrink-0">
                      {item.teamCode}
                    </span>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {teamMeta?.name ?? item.teamCode}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{item.division}</div>
                  </div>
                </div>

                {/* 右側：勝敗 ＋ SOS ＋ 解説ボタン */}
                <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 pl-2">
                  {/* 勝敗（W-L） */}
                  <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                    {item.record}
                  </span>

                  {/* SOS（対戦相手勝率） */}
                  <div className="text-right">
                    <span className="font-mono text-xs sm:text-sm font-bold text-sky-600 tabular-nums">
                      .{Math.round(item.sos * 1000).toString().padStart(3, "0")}
                    </span>
                    <span className="hidden sm:inline ml-1 text-[9px] text-slate-400 font-semibold">SOS</span>
                  </div>

                  {/* 解説ボタン（タイブレーク時のみ表示） */}
                  {hasTiebreak ? (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveReason({
                          teamName: teamMeta?.name ?? item.teamCode,
                          reason: item.tiebreakReason,
                        })
                      }
                      className="inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
                    >
                      <span>解説</span>
                      <HelpCircle className="h-3 w-3 text-orange-500" />
                    </button>
                  ) : (
                    <div className="w-[46px] hidden sm:block" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* タイブレーク解説ポップアップ */}
      {activeReason && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-in fade-in duration-150"
          onClick={() => setActiveReason(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-orange-500" />
                <h3 className="text-sm font-bold text-slate-900">ドラフト順決定理由</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveReason(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3.5 space-y-2">
              <p className="text-xs font-semibold text-slate-500">{activeReason.teamName}</p>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs text-slate-700 leading-relaxed font-mono">
                {activeReason.reason}
              </div>
              <p className="text-[10px] text-slate-400">
                ※同勝敗の場合、レギュラーシーズンの対戦相手勝率（SOS: Strength of Schedule）が低いチームに上位指名権が与えられます。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
