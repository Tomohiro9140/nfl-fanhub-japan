import React from "react";
import { DraftPickItem } from "@/lib/draftOrder";
import { getTeamByCode } from "@/lib/nflTeams";

interface DraftOrderViewProps {
  draftPicks: DraftPickItem[];
}

// 2027年NFLドラフト 1巡目指名権のトレード譲渡情報
const TRADED_PICKS_2027: Record<string, { toTeam: string; note: string }> = {
  IND: { toTeam: "NYJ", note: "Sauce Gardnerトレード" },
  LAR: { toTeam: "CLE", note: "Myles Garrettトレード" },
  GB: { toTeam: "DAL", note: "Micah Parsonsトレード" },
  // DALの指名権は上位条件付きでNYJへ
  DAL: { toTeam: "NYJ", note: "Quinnen Williamsトレード" },
};

export const DraftOrderView: React.FC<DraftOrderViewProps> = ({ draftPicks }) => {
  return (
    <div className="space-y-3">
      {/* リスト本体 */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-100 bg-slate-50/70 px-3.5 py-2 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider text-slate-500">
            2027 NFL DRAFT ORDER (#1〜#18)
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            ※同勝率はSOS（対戦相手勝率）が低いチームが上位
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {draftPicks.map((item) => {
            const teamMeta = getTeamByCode(item.teamCode);
            const isTop5 = item.pickNumber <= 5;
            const traded = TRADED_PICKS_2027[item.teamCode];
            const tradedToMeta = traded ? getTeamByCode(traded.toTeam) : null;

            return (
              <div
                key={item.teamCode}
                className="flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 transition hover:bg-slate-50/80"
              >
                {/* 左側：順位バッジ ＋ ロゴ ＋ チーム名 ＋ 地区 ＋ トレード譲渡表示 */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 mr-2">
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full text-xs font-black tabular-nums shrink-0 ${
                      item.pickNumber === 1
                        ? "bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-xs"
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

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {teamMeta?.name ?? item.teamCode}
                      </span>

                      {/* トレード譲渡先バッジ */}
                      {traded && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-100/90 border border-amber-300/80 px-1.5 py-0.2 text-[10px] font-bold text-amber-900 shrink-0">
                          <span>→</span>
                          <span>{traded.toTeam}へ譲渡</span>
                          {tradedToMeta?.logo && (
                            <img
                              src={tradedToMeta.logo}
                              alt={traded.toTeam}
                              className="h-3.5 w-3.5 object-contain inline-block ml-0.5"
                            />
                          )}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {item.division}
                      {traded && <span className="ml-1.5 text-amber-700/80">({traded.note})</span>}
                    </div>
                  </div>
                </div>

                {/* 右側：勝敗 ＋ SOS */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  {/* 勝敗（W-L） */}
                  <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                    {item.record}
                  </span>

                  {/* SOS（対戦相手勝率） */}
                  <div className="text-right min-w-[3.8rem]">
                    <span className="font-mono text-xs sm:text-sm font-bold text-sky-600 tabular-nums">
                      .{Math.round(item.sos * 1000).toString().padStart(3, "0")}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold ml-0.5">SOS</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
