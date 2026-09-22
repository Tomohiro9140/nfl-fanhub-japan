import React from "react";
import { DraftPickItem } from "@/lib/draftOrder";
import { getTeamByCode } from "@/lib/nflTeams";
import { HelpCircle } from "lucide-react";

interface DraftOrderViewProps {
  draftPicks: DraftPickItem[];
}

export const DraftOrderView: React.FC<DraftOrderViewProps> = ({ draftPicks }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a1931] shadow-2xl">
      {/* テーブルヘッダー説明 */}
      <div className="border-b border-white/10 bg-[#0f2444] px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-extrabold tracking-wide text-white">
              2027 NFL DRAFT ORDER <span className="text-[#ffc1a7]">#1 〜 #18</span>
            </h2>
            <p className="text-[11px] text-[#a5b3c9]">
              プレーオフ進出を逃した下位18チームの1巡目指名順位（Tankathon連動シミュレーション）
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-1 text-[11px] text-cyan-300">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>SOS（対戦相手勝率）が低いチームが上位指名権を獲得</span>
          </div>
        </div>
      </div>

      {/* ドラフト順位一覧テーブル */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-white/5 font-mono text-[10px] uppercase text-[#8ea4c8]">
            <tr>
              <th className="px-4 py-3 text-center w-14">PICK</th>
              <th className="px-4 py-3">TEAM</th>
              <th className="px-3 py-3 text-center">RECORD</th>
              <th className="px-3 py-3 text-center">WIN%</th>
              <th className="px-3 py-3 text-center font-bold text-[#38bdf8]">SOS</th>
              <th className="px-4 py-3">TIEBREAKER / 決定理由</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-sans">
            {draftPicks.map((item) => {
              const teamMeta = getTeamByCode(item.teamCode);
              const isTop5 = item.pickNumber <= 5;
              const isNumberOne = item.pickNumber === 1;

              return (
                <tr
                  key={item.teamCode}
                  className={`hover:bg-white/[0.07] transition-colors ${
                    isNumberOne ? "bg-gradient-to-r from-amber-500/10 via-transparent to-transparent" : ""
                  }`}
                >
                  {/* 指名順位 (Pick #) */}
                  <td className="px-4 py-3 text-center font-mono">
                    <span
                      className={`inline-grid h-7 w-7 place-items-center rounded-lg font-display text-xs font-black ${
                        isNumberOne
                          ? "bg-gradient-to-br from-amber-400 to-orange-500 text-black shadow-md shadow-orange-500/30"
                          : isTop5
                          ? "bg-[#ffc1a7] text-[#0a1931]"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {item.pickNumber}
                    </span>
                  </td>

                  {/* チーム情報 */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-sm font-black tracking-wider text-[#ffc1a7]">
                        {item.teamCode}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs sm:text-sm">
                          {teamMeta?.name ?? item.teamCode}
                        </div>
                        <div className="text-[10px] text-[#8ea4c8]">{item.division}</div>
                      </div>
                    </div>
                  </td>

                  {/* 勝敗成績 */}
                  <td className="px-3 py-3 text-center font-mono font-bold text-[#d9e3f3]">
                    {item.record}
                  </td>

                  {/* 勝率 */}
                  <td className="px-3 py-3 text-center font-mono text-[#a5b3c9]">
                    .{Math.round(item.winPct * 1000).toString().padStart(3, "0")}
                  </td>

                  {/* SOS（対戦相手勝率） */}
                  <td className="px-3 py-3 text-center font-mono font-bold text-cyan-300">
                    .{Math.round(item.sos * 1000).toString().padStart(3, "0")}
                  </td>

                  {/* タイブレーク理由 */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 font-mono text-[10px] font-semibold ${
                        item.tiebreakReason.includes("SOS")
                          ? "border border-cyan-500/40 bg-cyan-950/40 text-cyan-300"
                          : item.tiebreakReason.includes("全体勝率")
                          ? "bg-white/10 text-[#d9e3f3]"
                          : "border border-amber-500/40 bg-amber-950/40 text-amber-300"
                      }`}
                    >
                      {item.tiebreakReason}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
