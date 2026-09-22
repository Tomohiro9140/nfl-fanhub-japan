import React, { useState } from "react";
import { Sparkles, RotateCcw, ChevronDown, Shield } from "lucide-react";
import { PresetType } from "@/lib/playoffPresets";
import { NFL_TEAMS } from "@/lib/nflTeams";

interface PlayoffPresetsControlProps {
  onApplyPreset: (preset: PresetType, mode: "fill_remaining" | "overwrite_all", favoriteTeam?: string) => void;
  onClearPicks: () => void;
  totalPicksCount: number;
}

export const PlayoffPresetsControl: React.FC<PlayoffPresetsControlProps> = ({
  onApplyPreset,
  onClearPicks,
  totalPicksCount,
}) => {
  const [fillMode, setFillMode] = useState<"fill_remaining" | "overwrite_all">("fill_remaining");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);

  const handleSelectPreset = (preset: PresetType) => {
    setDropdownOpen(false);
    if (preset === "run_the_table") {
      setTeamModalOpen(true);
      return;
    }
    onApplyPreset(preset, fillMode);
  };

  const handleSelectFavoriteTeam = (teamCode: string) => {
    setTeamModalOpen(false);
    onApplyPreset("run_the_table", fillMode, teamCode);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0a1931]/90 p-3 shadow-lg backdrop-blur-md">
      {/* 左側：一括シミュレーション ドロップダウン ＆ モード切り替え */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:from-cyan-500 hover:to-blue-500 transition active:scale-95"
          >
            <Sparkles className="h-4 w-4 text-cyan-200" />
            <span>一括シミュレーション</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-white/15 bg-[#0f2444] p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2.5 py-1.5 text-[10px] font-bold tracking-wider text-[#a5b3c9] uppercase">
                シナリオ・プリセット選択
              </div>
              <button
                type="button"
                onClick={() => handleSelectPreset("better_record")}
                className="flex w-full flex-col rounded-lg px-2.5 py-2 text-left hover:bg-white/10 transition"
              >
                <span className="text-xs font-bold text-white">🏆 勝率上位（Better Record）</span>
                <span className="text-[10px] text-[#a5b3c9]">対戦時の勝率が高いチームの勝利を一括設定</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset("home_wins")}
                className="flex w-full flex-col rounded-lg px-2.5 py-2 text-left hover:bg-white/10 transition"
              >
                <span className="text-xs font-bold text-white">🏠 ホーム全勝（Home Team Wins）</span>
                <span className="text-[10px] text-[#a5b3c9]">ホームチームが全勝するシナリオを反映</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset("run_the_table")}
                className="flex w-full flex-col rounded-lg px-2.5 py-2 text-left hover:bg-white/10 transition"
              >
                <span className="text-xs font-bold text-[#ffc1a7]">🔥 推しチーム全勝（Run the Table）</span>
                <span className="text-[10px] text-[#a5b3c9]">指定した1チームの残り試合を全勝設定</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset("underdogs")}
                className="flex w-full flex-col rounded-lg px-2.5 py-2 text-left hover:bg-white/10 transition"
              >
                <span className="text-xs font-bold text-emerald-300">⚡ 最大波乱（Underdogs / Chaos）</span>
                <span className="text-[10px] text-[#a5b3c9]">格下のアンダードッグが全て勝利する展開</span>
              </button>
            </div>
          )}
        </div>

        {/* 適用モード切り替え */}
        <div className="flex items-center rounded-lg border border-white/10 bg-black/30 p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => setFillMode("fill_remaining")}
            className={`rounded-md px-2.5 py-1 font-semibold transition ${
              fillMode === "fill_remaining" ? "bg-white/20 text-white" : "text-[#8ea4c8] hover:text-white"
            }`}
          >
            未選択のみ
          </button>
          <button
            type="button"
            onClick={() => setFillMode("overwrite_all")}
            className={`rounded-md px-2.5 py-1 font-semibold transition ${
              fillMode === "overwrite_all" ? "bg-white/20 text-white" : "text-[#8ea4c8] hover:text-white"
            }`}
          >
            全上書き
          </button>
        </div>
      </div>

      {/* 右側：シミュレーション試合数 ＆ リセットボタン */}
      <div className="flex items-center gap-3">
        {totalPicksCount > 0 && (
          <span className="text-xs font-mono font-bold text-cyan-300">
            {totalPicksCount} 試合選択中
          </span>
        )}
        <button
          type="button"
          onClick={onClearPicks}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-[#d9e3f3] hover:bg-white/10 hover:text-white transition active:scale-95"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>リセット</span>
        </button>
      </div>

      {/* 推しチーム選択モーダル */}
      {teamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/20 bg-[#0a1931] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#ffc1a7]" />
                <h3 className="font-display text-lg font-bold text-white">推しチームを選択（Run the Table）</h3>
              </div>
              <button
                type="button"
                onClick={() => setTeamModalOpen(false)}
                className="rounded-lg p-1 text-[#8ea4c8] hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-xs text-[#a5b3c9]">
              選択したチームの残り全試合を「勝利」に設定し、その他の対戦は「勝率上位」で自動補完します。
            </p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(NFL_TEAMS).map(([code, team]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleSelectFavoriteTeam(code)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 text-left hover:border-cyan-400 hover:bg-white/15 transition active:scale-95"
                >
                  <span className="font-mono text-xs font-bold text-[#ffc1a7]">{code}</span>
                  <span className="truncate text-xs font-semibold text-white">{team.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
