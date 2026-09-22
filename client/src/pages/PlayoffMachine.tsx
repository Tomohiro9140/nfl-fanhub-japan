import React, { useState, useMemo } from "react";
import { Trophy, Award, Calendar, RotateCcw, ChevronRight, Shield } from "lucide-react";
import { PlayoffPresetsControl } from "@/components/PlayoffPresetsControl";
import { DraftOrderView } from "@/components/DraftOrderView";
import { generatePresetPicks, PresetType, SimulationPicks, SimGame } from "@/lib/playoffPresets";
import { computeDraftOrder, TeamStandingData } from "@/lib/draftOrder";
import { NFL_TEAMS, getTeamByCode } from "@/lib/nflTeams";

// 既存のディビジョン定義
const DIVISIONS: Record<string, { conference: "AFC" | "NFC"; division: "East" | "North" | "South" | "West"; teams: string[] }> = {
  "AFC East": { conference: "AFC", division: "East", teams: ["BUF", "MIA", "NE", "NYJ"] },
  "AFC North": { conference: "AFC", division: "North", teams: ["BAL", "CIN", "CLE", "PIT"] },
  "AFC South": { conference: "AFC", division: "South", teams: ["HOU", "IND", "JAX", "TEN"] },
  "AFC West": { conference: "AFC", division: "West", teams: ["DEN", "KC", "LV", "LAC"] },
  "NFC East": { conference: "NFC", division: "East", teams: ["DAL", "NYG", "PHI", "WAS"] },
  "NFC North": { conference: "NFC", division: "North", teams: ["CHI", "DET", "GB", "MIN"] },
  "NFC South": { conference: "NFC", division: "South", teams: ["ATL", "CAR", "NO", "TB"] },
  "NFC West": { conference: "NFC", division: "West", teams: ["ARI", "LAR", "SF", "SEA"] },
};

export default function PlayoffMachinePage() {
  // 1. 表示タブ ("playoffs": シード表・対戦表 / "draft": ドラフト1巡目指名順)
  const [activeTab, setActiveTab] = useState<"playoffs" | "draft">("playoffs");

  // 2. 選択中のカンファレンス表示 ("ALL" | "AFC" | "NFC")
  const [confFilter, setConfFilter] = useState<"ALL" | "AFC" | "NFC">("ALL");

  // 3. 各試合の勝敗シミュレーション状態 (gameId -> "home" | "away")
  const [simulationPicks, setSimulationPicks] = useState<SimulationPicks>({});

  // 4. 週フィルター（試合一覧用）
  const [selectedWeek, setSelectedWeek] = useState<number | "ALL">("ALL");

  // ※ シーズン全日程データ（API連携または内蔵スケジュール）
  // 既存のスケジュール取得処理と連動
  const allGames: SimGame[] = useMemo(() => {
    // 既存の全試合リストを参照（未設定時はサンプル・基本スケジュールを保持）
    return (window as any).__NFL_SEASON_GAMES__ ?? [];
  }, []);

  // 5. 各チームの基本成績（シミュレーション適用前）
  const baseTeamRecords = useMemo(() => {
    const lookup: Record<string, { wins: number; losses: number; ties: number; winPct: number }> = {};
    for (const code of Object.keys(NFL_TEAMS)) {
      lookup[code] = { wins: 0, losses: 0, ties: 0, winPct: 0 };
    }
    return lookup;
  }, []);

  // 6. 手動トグルハンドラー
  const handleTogglePick = (gameId: string | number, winner: "home" | "away") => {
    setSimulationPicks((prev) => {
      if (prev[gameId] === winner) {
        const next = { ...prev };
        delete next[gameId];
        return next;
      }
      return { ...prev, [gameId]: winner };
    });
  };

  // 7. 一括プリセット適用ハンドラー
  const handleApplyPreset = (preset: PresetType, mode: "fill_remaining" | "overwrite_all", favoriteTeam?: string) => {
    const updatedPicks = generatePresetPicks({
      preset,
      mode,
      favoriteTeam,
      currentPicks: simulationPicks,
      games: allGames,
      teamRecords: baseTeamRecords,
    });
    setSimulationPicks(updatedPicks);
  };

  // 8. リセット（初期状態へ復旧）
  const handleClearPicks = () => {
    setSimulationPicks({});
  };

  // 9. リアルタイム計算：Standings ＆ プレーオフシード（14チーム） ＆ ドラフト順位（18チーム）
  const { standings, afcSeeds, nfcSeeds, draftOrder } = useMemo(() => {
    // 各チームの勝敗を集計
    const teamStats: Record<string, TeamStandingData> = {};

    for (const [divName, divInfo] of Object.entries(DIVISIONS)) {
      for (const code of divInfo.teams) {
        teamStats[code] = {
          teamCode: code,
          conference: divInfo.conference,
          division: divInfo.division,
          wins: baseTeamRecords[code]?.wins ?? 0,
          losses: baseTeamRecords[code]?.losses ?? 0,
          ties: baseTeamRecords[code]?.ties ?? 0,
          winPct: 0,
          divisionWins: 0,
          divisionLosses: 0,
          divisionTies: 0,
          divisionWinPct: 0,
          confWins: 0,
          confLosses: 0,
          confTies: 0,
          confWinPct: 0,
        };
      }
    }

    // シミュレーションされた勝敗を反映
    for (const game of allGames) {
      const winner = game.isFinished ? game.actualWinner : simulationPicks[game.id];
      if (!winner) continue;

      const winningCode = winner === "home" ? game.homeTeamCode : game.awayTeamCode;
      const losingCode = winner === "home" ? game.awayTeamCode : game.homeTeamCode;

      const wTeam = teamStats[winningCode];
      const lTeam = teamStats[losingCode];

      if (wTeam && lTeam) {
        wTeam.wins++;
        lTeam.losses++;

        // カンファレンス内対戦
        if (wTeam.conference === lTeam.conference) {
          wTeam.confWins++;
          lTeam.confLosses++;

          // 地区内対戦
          if (wTeam.division === lTeam.division) {
            wTeam.divisionWins++;
            lTeam.divisionLosses++;
          }
        }
      }
    }

    // 勝率の再計算
    for (const team of Object.values(teamStats)) {
      const total = team.wins + team.losses + team.ties;
      team.winPct = total > 0 ? (team.wins + team.ties * 0.5) / total : 0;

      const divTotal = team.divisionWins + team.divisionLosses + team.divisionTies;
      team.divisionWinPct = divTotal > 0 ? (team.divisionWins + team.divisionTies * 0.5) / divTotal : 0;

      const confTotal = team.confWins + team.confLosses + team.confTies;
      team.confWinPct = confTotal > 0 ? (team.confWins + team.confTies * 0.5) / confTotal : 0;
    }

    // カンファレンス別にシード順（1〜7位）を決定
    const determineConferenceSeeds = (conf: "AFC" | "NFC") => {
      const confTeams = Object.values(teamStats).filter((t) => t.conference === conf);

      // 各地区（4地区）の首位を決定
      const divisionWinners: TeamStandingData[] = [];
      const nonDivWinners: TeamStandingData[] = [];

      const divGroups = ["East", "North", "South", "West"] as const;
      for (const d of divGroups) {
        const divTeams = confTeams.filter((t) => t.division === d);
        divTeams.sort((a, b) => {
          if (b.winPct !== a.winPct) return b.winPct - a.winPct;
          if (b.divisionWinPct !== a.divisionWinPct) return b.divisionWinPct - a.divisionWinPct;
          return b.confWinPct - a.confWinPct;
        });
        if (divTeams[0]) divisionWinners.push(divTeams[0]);
        nonDivWinners.push(...divTeams.slice(1));
      }

      // 地区優勝4チームをシード 1〜4位にソート
      divisionWinners.sort((a, b) => {
        if (b.winPct !== a.winPct) return b.winPct - a.winPct;
        return b.confWinPct - a.confWinPct;
      });

      // 残りのワイルドカード候補をシード 5〜7位にソート
      nonDivWinners.sort((a, b) => {
        if (b.winPct !== a.winPct) return b.winPct - a.winPct;
        return b.confWinPct - a.confWinPct;
      });

      return [...divisionWinners, ...nonDivWinners.slice(0, 3)].map((t, idx) => ({
        seed: idx + 1,
        teamCode: t.teamCode,
        record: `${t.wins}-${t.losses}-${t.ties}`,
        division: `${t.conference} ${t.division}`,
        isDivWinner: idx < 4,
      }));
    };

    const afc = determineConferenceSeeds("AFC");
    const nfc = determineConferenceSeeds("NFC");

    // プレーオフ進出14チームのコード
    const playoffSet = new Set<string>([
      ...afc.map((t) => t.teamCode),
      ...nfc.map((t) => t.teamCode),
    ]);

    // 下位18チームのドラフト指名順（Pick #1〜#18）を算出
    const draft = computeDraftOrder(teamStats, playoffSet, allGames, simulationPicks);

    return {
      standings: teamStats,
      afcSeeds: afc,
      nfcSeeds: nfc,
      draftOrder: draft,
    };
  }, [allGames, simulationPicks, baseTeamRecords]);

  return (
    <div className="min-h-screen bg-[#060e1e] text-[#fffaf0] pb-20">
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
        
        {/* ヘッダーエリア */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#ffc1a7] px-2 py-0.5 font-mono text-[10px] font-black text-[#0a1931]">
                NFL 2026-27
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-black tracking-wide text-white">
                PLAYOFF MACHINE & DRAFT SIMULATOR
              </h1>
            </div>
            <p className="mt-1 text-xs text-[#a5b3c9]">
              勝敗シミュレーション、プレーオフ進出決定タイブレーク、およびTankathon連動ドラフト順位
            </p>
          </div>

          {/* メイン表示タブ（プレーオフ ⇔ ドラフト順位） */}
          <div className="flex rounded-xl border border-white/10 bg-[#0a1931] p-1 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab("playoffs")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                activeTab === "playoffs"
                  ? "bg-[#ffc1a7] text-[#0a1931] shadow"
                  : "text-[#8ea4c8] hover:text-white"
              }`}
            >
              <Trophy className="h-4 w-4" />
              <span>プレーオフ（Playoffs）</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("draft")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                activeTab === "draft"
                  ? "bg-[#ffc1a7] text-[#0a1931] shadow"
                  : "text-[#8ea4c8] hover:text-white"
              }`}
            >
              <Award className="h-4 w-4" />
              <span>ドラフト指名順（#1〜#18）</span>
            </button>
          </div>
        </div>

        {/* コントロールバー：一括シミュレーション（プリセット適用 ＆ リセット） */}
        <div className="mb-6">
          <PlayoffPresetsControl
            onApplyPreset={handleApplyPreset}
            onClearPicks={handleClearPicks}
            totalPicksCount={Object.keys(simulationPicks).length}
          />
        </div>

        {/* コンテンツ描画エリア */}
        {activeTab === "playoffs" ? (
          <div className="space-y-6">
            {/* カンファレンス切り替え ＆ シード順位表 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              
              {/* AFC シード表 */}
              {(confFilter === "ALL" || confFilter === "AFC") && (
                <div className="overflow-hidden rounded-2xl border border-red-500/20 bg-[#0a1931] shadow-xl">
                  <div className="border-b border-white/10 bg-red-950/40 px-4 py-3">
                    <h2 className="font-display text-base font-bold text-red-300">AFC PLAYOFF PICTURE</h2>
                  </div>
                  <div className="divide-y divide-white/5">
                    {afcSeeds.map((team) => (
                      <div key={team.teamCode} className="flex items-center justify-between px-4 py-2.5 text-xs">
                        <div className="flex items-center gap-3">
                          <span className={`inline-grid h-6 w-6 place-items-center rounded font-mono font-black ${
                            team.seed === 1 ? "bg-red-500 text-white" : "bg-white/10 text-[#ffc1a7]"
                          }`}>
                            {team.seed}
                          </span>
                          <div>
                            <span className="font-bold text-white text-sm">{team.teamCode}</span>
                            <span className="ml-2 text-[10px] text-[#8ea4c8]">{team.division}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="font-bold text-white">{team.record}</span>
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                            team.isDivWinner ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-white/10 text-[#a5b3c9]"
                          }`}>
                            {team.isDivWinner ? "DIV" : "WC"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NFC シード表 */}
              {(confFilter === "ALL" || confFilter === "NFC") && (
                <div className="overflow-hidden rounded-2xl border border-blue-500/20 bg-[#0a1931] shadow-xl">
                  <div className="border-b border-white/10 bg-blue-950/40 px-4 py-3">
                    <h2 className="font-display text-base font-bold text-blue-300">NFC PLAYOFF PICTURE</h2>
                  </div>
                  <div className="divide-y divide-white/5">
                    {nfcSeeds.map((team) => (
                      <div key={team.teamCode} className="flex items-center justify-between px-4 py-2.5 text-xs">
                        <div className="flex items-center gap-3">
                          <span className={`inline-grid h-6 w-6 place-items-center rounded font-mono font-black ${
                            team.seed === 1 ? "bg-blue-500 text-white" : "bg-white/10 text-[#ffc1a7]"
                          }`}>
                            {team.seed}
                          </span>
                          <div>
                            <span className="font-bold text-white text-sm">{team.teamCode}</span>
                            <span className="ml-2 text-[10px] text-[#8ea4c8]">{team.division}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="font-bold text-white">{team.record}</span>
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                            team.isDivWinner ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-white/10 text-[#a5b3c9]"
                          }`}>
                            {team.isDivWinner ? "DIV" : "WC"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 試合一覧 ＆ 勝敗手動トグル */}
            {allGames.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-[#0a1931] p-4 shadow-xl">
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="font-display text-base font-bold text-white">MATCHUP SELECTOR (勝敗トグル)</h3>
                  <span className="text-[11px] text-[#a5b3c9]">チームをクリックして勝敗を変更</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {allGames.map((game) => {
                    const currentPick = simulationPicks[game.id];
                    return (
                      <div
                        key={game.id}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2.5"
                      >
                        {/* アウェイチーム */}
                        <button
                          type="button"
                          onClick={() => handleTogglePick(game.id, "away")}
                          className={`flex flex-1 items-center justify-center rounded-lg py-1.5 font-mono text-xs font-bold transition ${
                            currentPick === "away"
                              ? "bg-cyan-500 text-black shadow"
                              : "bg-white/5 text-white hover:bg-white/15"
                          }`}
                        >
                          {game.awayTeamCode}
                        </button>
                        <span className="px-2 text-[10px] font-bold text-[#8ea4c8]">@</span>
                        {/* ホームチーム */}
                        <button
                          type="button"
                          onClick={() => handleTogglePick(game.id, "home")}
                          className={`flex flex-1 items-center justify-center rounded-lg py-1.5 font-mono text-xs font-bold transition ${
                            currentPick === "home"
                              ? "bg-cyan-500 text-black shadow"
                              : "bg-white/5 text-white hover:bg-white/15"
                          }`}
                        >
                          {game.homeTeamCode}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* タブ2: Tankathon連動ドラフト順位テーブル */
          <DraftOrderView draftPicks={draftOrder} />
        )}

      </div>
    </div>
  );
}
