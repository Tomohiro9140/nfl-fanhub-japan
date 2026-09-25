import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmbeddedAppNav } from "@/components/EmbeddedAppNav";
import { PlayoffPredictionModal } from "@/components/PlayoffPredictionModal";
import { trpc } from "@/lib/trpc";
import { NFL_TEAMS } from "@/lib/tiebreaker/nflTeams";
import { calculateAllStandings } from "@/lib/tiebreaker/playoffEngine";
import { generateRootingGuide } from "@/lib/tiebreaker/rootingGuide";
import { Conference, GameOutcome, PlayoffSeed, ScheduledGame } from "@/lib/tiebreaker/types";
import {
  Ban,
  CheckCircle2,
  ChevronDown,
  Flame,
  HelpCircle,
  Layers,
  Lock,
  RotateCcw,
  Sparkles,
  Trophy,
  Award,
  X,
} from "lucide-react";
import { memo, useMemo, useState, useEffect } from "react";

// ESPN CDN ロゴコード変換用マップ（略称の表記揺れ対応）
const ESPN_LOGO_CODES: Record<string, string> = {
  WAS: "wsh",
  WSH: "wsh",
  LAR: "lar",
  LAC: "lac",
  LV: "lv",
};

/** ESPN公式高解像度CDNからロゴを安全に表示（エラー時はテキストにフォールバック） */
function TeamMark({ code, size = "md" }: { code: string; size?: "sm" | "md" | "lg" }) {
  const [hasError, setHasError] = useState(false);
  const dimension = size === "lg" ? "h-10 w-10" : size === "md" ? "h-7 w-7" : "h-5 w-5";
  const espnCode = ESPN_LOGO_CODES[code.toUpperCase()] ?? code.toLowerCase();
  const logoUrl = `https://a.espncdn.com/i/teamlogos/nfl/500/${espnCode}.png`;

  if (hasError) {
    return (
      <span className={`${dimension} inline-flex shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700`}>
        {code}
      </span>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${code} logo`}
      onError={() => setHasError(true)}
      className={`${dimension} shrink-0 object-contain drop-shadow-xs`}
      loading="lazy"
    />
  );
}
const MemoTeamMark = memo(TeamMark);

interface DraftPickItem {
  pickNumber: number;
  team: string;
  teamName: string;
  conference: Conference;
  division: string;
  record: string;
  winPct: number;
  sos: number;
  tiebreakReason: string;
}

export default function PlayoffMachine() {
  const [focusTeam, setFocusTeam] = useState<string>("NE");
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [activeConf, setActiveConf] = useState<Conference>("AFC");
  const [mainViewMode, setMainViewMode] = useState<"playoffs" | "draft">("playoffs");
  const [activeTab, setActiveTab] = useState<"simulator" | "rooting">("simulator");
  const [explanationModalSeed, setExplanationModalSeed] = useState<PlayoffSeed | null>(null);
  const [showLowGuides, setShowLowGuides] = useState<boolean>(false);

  // プレイオフ予想モーダルの開閉ステート
  const [isPredictionOpen, setIsPredictionOpen] = useState(false);

  // 一括シミュレーションのステート
  const [presetDropdownOpen, setPresetDropdownOpen] = useState(false);
  const [fillMode, setFillMode] = useState<"fill_remaining" | "overwrite_all">("fill_remaining");

  // チーム名をアルファベット昇順（A to Z）でソート
  const alphabeticalTeams = useMemo(() => {
    return Object.values(NFL_TEAMS).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // 公式スケジュール・実データの取得
  const officialScheduleQuery = trpc.playoff.getSchedule.useQuery(
    { season: 2026 },
    { staleTime: 5 * 60_000 }
  );

  const [games, setGames] = useState<ScheduledGame[]>([]);

  useEffect(() => {
    if (officialScheduleQuery.data?.games) {
      const serverGames = officialScheduleQuery.data.games as ScheduledGame[];
      setGames(serverGames);

      const firstUnfinishedGame = serverGames.find((g) => !g.isFinished);
      if (firstUnfinishedGame) {
        setSelectedWeek(firstUnfinishedGame.week);
      }
    }
  }, [officialScheduleQuery.data]);

  // 未消化試合の勝敗個別トグル
  const toggleOutcome = (gameId: number, target: "home" | "away" | "tie") => {
    setGames((prev) =>
      prev.map((g) => {
        if (g.id !== gameId || g.isFinished) return g;
        const newOutcome: GameOutcome | undefined = g.outcome === target ? undefined : target;
        return { ...g, outcome: newOutcome };
      })
    );
  };

  // 全シミュレーション結果を公式実データ状態へリセット
  const resetToOfficial = () => {
    if (officialScheduleQuery.data?.games) {
      setGames(officialScheduleQuery.data.games as ScheduledGame[]);
    }
  };

  // タイブレーカーエンジンによる即時シード計算
  const standings = useMemo(() => calculateAllStandings(games), [games]);
  const currentConfStandings = standings[activeConf];

  // プレイオフ進出シード 1〜7 位（AFC / NFC の大文字キーで正確に取得）
  const afcPlayoffSeeds = useMemo(() => {
    return [
      ...(standings.AFC?.divisionWinners ?? []),
      ...(standings.AFC?.wildCards ?? []),
    ];
  }, [standings.AFC]);

  const nfcPlayoffSeeds = useMemo(() => {
    return [
      ...(standings.NFC?.divisionWinners ?? []),
      ...(standings.NFC?.wildCards ?? []),
    ];
  }, [standings.NFC]);

  // 全32チームのリアルタイム成績（ドラフト・プリセット用）
  const allTeamRecords = useMemo(() => {
    const records: Record<
      string,
      {
        wins: number;
        losses: number;
        ties: number;
        pct: number;
        confWins: number;
        confLosses: number;
        confTies: number;
        confPct: number;
        divWins: number;
        divLosses: number;
        divTies: number;
        divPct: number;
      }
    > = {};

    for (const code of Object.keys(NFL_TEAMS)) {
      records[code] = {
        wins: 0,
        losses: 0,
        ties: 0,
        pct: 0,
        confWins: 0,
        confLosses: 0,
        confTies: 0,
        confPct: 0,
        divWins: 0,
        divLosses: 0,
        divTies: 0,
        divPct: 0,
      };
    }

    for (const g of games) {
      const awayInfo = NFL_TEAMS[g.awayTeam];
      const homeInfo = NFL_TEAMS[g.homeTeam];
      if (!awayInfo || !homeInfo) continue;

      const outcome = g.isFinished
        ? g.homeScore !== undefined && g.awayScore !== undefined
          ? g.homeScore > g.awayScore
            ? "home"
            : g.homeScore < g.awayScore
            ? "away"
            : "tie"
          : g.outcome
        : g.outcome;

      if (!outcome) continue;

      const isConf = awayInfo.conference === homeInfo.conference;
      const isDiv = isConf && awayInfo.division === homeInfo.division;

      if (outcome === "home") {
        records[g.homeTeam].wins++;
        records[g.awayTeam].losses++;
        if (isConf) {
          records[g.homeTeam].confWins++;
          records[g.awayTeam].confLosses++;
        }
        if (isDiv) {
          records[g.homeTeam].divWins++;
          records[g.awayTeam].divLosses++;
        }
      } else if (outcome === "away") {
        records[g.awayTeam].wins++;
        records[g.homeTeam].losses++;
        if (isConf) {
          records[g.awayTeam].confWins++;
          records[g.homeTeam].confLosses++;
        }
        if (isDiv) {
          records[g.awayTeam].divWins++;
          records[g.homeTeam].divLosses++;
        }
      } else if (outcome === "tie") {
        records[g.homeTeam].ties++;
        records[g.awayTeam].ties++;
        if (isConf) {
          records[g.homeTeam].confTies++;
          records[g.awayTeam].confTies++;
        }
        if (isDiv) {
          records[g.homeTeam].divTies++;
          records[g.awayTeam].divTies++;
        }
      }
    }

    for (const r of Object.values(records)) {
      const total = r.wins + r.losses + r.ties;
      r.pct = total > 0 ? (r.wins + r.ties * 0.5) / total : 0;
      const confTotal = r.confWins + r.confLosses + r.confTies;
      r.confPct = confTotal > 0 ? (r.confWins + r.confTies * 0.5) / confTotal : 0;
      const divTotal = r.divWins + r.divLosses + r.divTies;
      r.divPct = divTotal > 0 ? (r.divWins + r.divTies * 0.5) / divTotal : 0;
    }

    return records;
  }, [games]);

  // 一括シミュレーション（プリセット適用）
  const applyPreset = (preset: "better_record" | "home_wins" | "run_the_table" | "underdogs") => {
    setPresetDropdownOpen(false);

    setGames((prev) =>
      prev.map((g) => {
        if (g.isFinished) return g;
        if (fillMode === "fill_remaining" && g.outcome) return g;

        const awayPct = allTeamRecords[g.awayTeam]?.pct ?? 0.5;
        const homePct = allTeamRecords[g.homeTeam]?.pct ?? 0.5;

        let targetOutcome: "home" | "away" = "home";

        switch (preset) {
          case "home_wins":
            targetOutcome = "home";
            break;
          case "better_record":
            targetOutcome = awayPct > homePct ? "away" : "home";
            break;
          case "underdogs":
            targetOutcome = awayPct < homePct ? "away" : "home";
            break;
          case "run_the_table":
            if (g.awayTeam === focusTeam) {
              targetOutcome = "away";
            } else if (g.homeTeam === focusTeam) {
              targetOutcome = "home";
            } else {
              targetOutcome = awayPct > homePct ? "away" : "home";
            }
            break;
        }

        return { ...g, outcome: targetOutcome };
      })
    );
  };

  // プレーオフ進出14チーム（AFC 1〜7位、NFC 1〜7位）
  const playoffTeamCodes = useMemo(() => {
    const set = new Set<string>();
    for (const conf of ["AFC", "NFC"] as Conference[]) {
      for (const t of standings[conf]?.divisionWinners ?? []) set.add(t.team);
      for (const t of standings[conf]?.wildCards ?? []) set.add(t.team);
    }
    return set;
  }, [standings]);

  // Tankathon連動 ドラフト指名順（Pick #1〜#18）のリアルタイム算出
  const draftOrder = useMemo<DraftPickItem[]>(() => {
    const nonPlayoff = Object.keys(NFL_TEAMS)
      .filter((code) => !playoffTeamCodes.has(code))
      .map((code) => ({
        code,
        info: NFL_TEAMS[code],
        record: allTeamRecords[code],
      }));

    // 対戦相手合計勝率（SOS）を算出
    const sosMap: Record<string, number> = {};
    for (const t of nonPlayoff) {
      const teamGames = games.filter((g) => g.awayTeam === t.code || g.homeTeam === t.code);
      let oppWins = 0;
      let oppLosses = 0;
      let oppTies = 0;

      for (const g of teamGames) {
        const oppCode = g.awayTeam === t.code ? g.homeTeam : g.awayTeam;
        const opp = allTeamRecords[oppCode];
        if (opp) {
          oppWins += opp.wins;
          oppLosses += opp.losses;
          oppTies += opp.ties;
        }
      }
      const totalOpp = oppWins + oppLosses + oppTies;
      sosMap[t.code] = totalOpp > 0 ? (oppWins + oppTies * 0.5) / totalOpp : 0.5;
    }

    // 弱い順にソート
    const sorted = [...nonPlayoff].sort((a, b) => {
      if (Math.abs(a.record.pct - b.record.pct) >= 0.0001) {
        return a.record.pct - b.record.pct;
      }
      const aSos = sosMap[a.code] ?? 0.5;
      const bSos = sosMap[b.code] ?? 0.5;
      if (Math.abs(aSos - bSos) >= 0.0001) {
        return aSos - bSos;
      }
      if (a.info.conference === b.info.conference && a.info.division === b.info.division) {
        if (Math.abs(a.record.divPct - b.record.divPct) >= 0.0001) {
          return a.record.divPct - b.record.divPct;
        }
      }
      if (a.info.conference === b.info.conference) {
        if (Math.abs(a.record.confPct - b.record.confPct) >= 0.0001) {
          return a.record.confPct - b.record.confPct;
        }
      }
      return a.code.localeCompare(b.code);
    });

    return sorted.slice(0, 18).map((t, idx) => {
      const pickNumber = idx + 1;
      const teamSos = sosMap[t.code] ?? 0.5;
      let tiebreakReason = "全体勝率最下位";

      const prev = sorted[idx - 1];
      const next = sorted[idx + 1];
      const isTied =
        (prev && Math.abs(prev.record.pct - t.record.pct) < 0.0001) ||
        (next && Math.abs(next.record.pct - t.record.pct) < 0.0001);

      if (isTied) {
        const compareTarget = prev && Math.abs(prev.record.pct - t.record.pct) < 0.0001 ? prev : next;
        const otherSos = sosMap[compareTarget.code] ?? 0.5;
        if (Math.abs(teamSos - otherSos) >= 0.0001) {
          tiebreakReason = `SOS差で優先 (.${Math.round(teamSos * 1000).toString().padStart(3, "0")} < .${Math.round(otherSos * 1000).toString().padStart(3, "0")})`;
        } else if (t.info.conference === compareTarget.info.conference && t.info.division === compareTarget.info.division) {
          tiebreakReason = "同率・同SOS・地区勝率差";
        } else {
          tiebreakReason = "同率・同SOS・カンファレンス勝率差";
        }
      } else if (pickNumber > 1) {
        tiebreakReason = "単独勝率";
      }

      return {
        pickNumber,
        team: t.code,
        teamName: t.info.name,
        conference: t.info.conference as Conference,
        division: `${t.info.conference} ${t.info.division}`,
        record: `${t.record.wins}-${t.record.losses}${t.record.ties > 0 ? `-${t.record.ties}` : ""}`,
        winPct: t.record.pct,
        sos: teamSos,
        tiebreakReason,
      };
    });
  }, [playoffTeamCodes, allTeamRecords, games]);

  // In the Hunt と Eliminated の分類
  const { inTheHuntTeams, eliminatedTeams } = useMemo(() => {
    const seed7Wins = currentConfStandings?.wildCards?.[2]?.record.wins ?? 0;
    const inTheHunt: PlayoffSeed[] = [];
    const eliminated: PlayoffSeed[] = [];

    for (const team of currentConfStandings?.inTheHunt ?? []) {
      const played = team.record.wins + team.record.losses + team.record.ties;
      const remainingGames = Math.max(0, 17 - played);
      const maxPossibleWins = team.record.wins + remainingGames;

      if (maxPossibleWins < seed7Wins) {
        eliminated.push(team);
      } else {
        inTheHunt.push(team);
      }
    }

    return { inTheHuntTeams: inTheHunt, eliminatedTeams: eliminated };
  }, [currentConfStandings]);

  // 週間応援ガイドの生成と重要度別の分類
  const rootingGuide = useMemo(
    () => generateRootingGuide(focusTeam, games, selectedWeek),
    [focusTeam, games, selectedWeek]
  );

  const { importantGuides, lowGuides } = useMemo(() => {
    const important: typeof rootingGuide = [];
    const low: typeof rootingGuide = [];
    for (const item of rootingGuide) {
      if (item.importance === "LOW") {
        low.push(item);
      } else {
        important.push(item);
      }
    }
    return { importantGuides: important, lowGuides: low };
  }, [rootingGuide]);

  const focusTeamInfo = NFL_TEAMS[focusTeam];
  const weekGames = useMemo(
    () => games.filter((g) => g.week === selectedWeek),
    [games, selectedWeek]
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <EmbeddedAppNav current="SIMULATOR" />

      {/* ヘッダー: アイコンとタイトル */}
      <header className="border-b border-white/10 bg-[#101827] text-white">
        <div className="container mx-auto flex min-h-16 items-center justify-center px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#f2bc62] to-[#e85d2a] shadow-lg">
              <Trophy className="h-5 w-5 text-[#101827]" />
            </div>
            <h1 className="font-display text-xl font-bold tracking-tight">NFL Season Simulator</h1>
          </div>
        </div>
      </header>

      {/* コントロールバー: 応援チーム選択 ＆ 一括シミュレーション ＆ プレイオフ予想ボタン */}
      <div className="border-b border-slate-200 bg-white shadow-xs">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-3 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* 応援チーム選択（ABC順） */}
            <div className="w-full sm:w-56">
              <Label className="text-[11px] font-semibold text-slate-500 uppercase">あなたの応援チーム（Focus）</Label>
              <Select
                value={focusTeam}
                onValueChange={(val) => {
                  setFocusTeam(val);
                  const info = NFL_TEAMS[val];
                  if (info) setActiveConf(info.conference as Conference);
                }}
              >
                <SelectTrigger className="mt-1 h-9 bg-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50 max-h-72 bg-white">
                  {alphabeticalTeams.map((team) => (
                    <SelectItem key={team.code} value={team.code}>
                      <div className="flex items-center gap-2">
                        <MemoTeamMark code={team.code} size="sm" />
                        <span>{team.name}</span>
                        <span className="text-[10px] text-slate-400">({team.division})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 一括シミュレーション ドロップダウン */}
            <div className="relative">
              <Label className="text-[11px] font-semibold text-slate-500 uppercase">一括シミュレーション</Label>
              <div className="mt-1 flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
                  className="h-9 border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5 text-[#e85d2a]" />
                  <span>プリセット適用</span>
                  <ChevronDown className={`ml-1.5 h-3.5 w-3.5 transition-transform ${presetDropdownOpen ? "rotate-180" : ""}`} />
                </Button>

                {/* 未選択のみ / 全上書き トグル */}
                <div className="flex h-9 items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setFillMode("fill_remaining")}
                    className={`h-full rounded-md px-2 font-semibold transition ${
                      fillMode === "fill_remaining" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    未選択のみ
                  </button>
                  <button
                    type="button"
                    onClick={() => setFillMode("overwrite_all")}
                    className={`h-full rounded-md px-2 font-semibold transition ${
                      fillMode === "overwrite_all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    全上書き
                  </button>
                </div>
              </div>

              {/* プリセットメニュー */}
              {presetDropdownOpen && (
                <div className="absolute left-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase">
                    シナリオを選択
                  </div>
                  <button
                    type="button"
                    onClick={() => applyPreset("better_record")}
                    className="flex w-full flex-col rounded-lg px-2.5 py-2 text-left hover:bg-slate-50 transition"
                  >
                    <span className="text-xs font-bold text-slate-800">🏆 勝率上位（Better Record）</span>
                    <span className="text-[10px] text-slate-500">対戦時の勝率が高いチームの勝利を一括設定</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("home_wins")}
                    className="flex w-full flex-col rounded-lg px-2.5 py-2 text-left hover:bg-slate-50 transition"
                  >
                    <span className="text-xs font-bold text-slate-800">🏠 ホーム全勝（Home Team Wins）</span>
                    <span className="text-[10px] text-slate-500">ホームチームが全勝するシナリオを反映</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("run_the_table")}
                    className="flex w-full flex-col rounded-lg px-2.5 py-2 text-left hover:bg-slate-50 transition"
                  >
                    <span className="text-xs font-bold text-[#e85d2a]">🔥 {focusTeamInfo?.name ?? focusTeam} 全勝</span>
                    <span className="text-[10px] text-slate-500">応援チームの残り全試合を勝利、他は勝率上位</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("underdogs")}
                    className="flex w-full flex-col rounded-lg px-2.5 py-2 text-left hover:bg-slate-50 transition"
                  >
                    <span className="text-xs font-bold text-emerald-700">⚡ 最大波乱（Underdogs / Chaos）</span>
                    <span className="text-[10px] text-slate-500">格下のアンダードッグが全て勝利する展開</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* プレイオフ勝敗予想 ＆ 画像シェアボタン */}
          <div className="flex items-center">
            <Button
              type="button"
              onClick={() => setIsPredictionOpen(true)}
              className="h-9 gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-xs transition active:scale-95"
              size="sm"
            >
              <Trophy className="h-4 w-4" />
              <span>プレイオフ勝敗予想</span>
            </Button>
          </div>
        </div>
      </div>

      {/* メインレイアウト */}
      <main className="container mx-auto mt-6 px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* 左カラム: シード順位表 ⇔ ドラフト指名順 */}
          <div className="space-y-6 lg:col-span-7">
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setMainViewMode("playoffs")}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                      mainViewMode === "playoffs"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Trophy className="h-3.5 w-3.5 text-[#e85d2a]" />
                    <span>シード順位表</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMainViewMode("draft")}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                      mainViewMode === "draft"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Award className="h-3.5 w-3.5 text-cyan-600" />
                    <span>ドラフト指名順 (#1〜#18)</span>
                  </button>
                </div>

                {mainViewMode === "playoffs" && (
                  <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
                    {(["AFC", "NFC"] as Conference[]).map((conf) => (
                      <button
                        key={conf}
                        type="button"
                        onClick={() => setActiveConf(conf)}
                        className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                          activeConf === conf ? "bg-[#101827] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {conf}
                      </button>
                    ))}
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-0">
                {mainViewMode === "playoffs" ? (
                  <div>
                    {/* 地区首位（#1〜#4） */}
                    <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-2 text-[11px] font-bold tracking-wider text-slate-500">
                      DIVISION LEADERS (#1〜#4)
                    </div>
                    <div className="divide-y divide-slate-100">
                      {(currentConfStandings?.divisionWinners ?? []).map((team) => (
                        <SeedRow
                          key={team.team}
                          seed={team}
                          isFocus={team.team === focusTeam}
                          onExplainClick={() => setExplanationModalSeed(team)}
                        />
                      ))}
                    </div>

                    {/* ワイルドカード（#5〜#7） */}
                    <div className="border-y border-slate-100 bg-amber-50/50 px-4 py-2 text-[11px] font-bold tracking-wider text-amber-800">
                      WILD CARD (#5〜#7)
                    </div>
                    <div className="divide-y divide-slate-100">
                      {(currentConfStandings?.wildCards ?? []).map((team) => (
                        <SeedRow
                          key={team.team}
                          seed={team}
                          isFocus={team.team === focusTeam}
                          onExplainClick={() => setExplanationModalSeed(team)}
                        />
                      ))}
                    </div>

                    {/* 追撃圏内 (IN THE HUNT) */}
                    <div className="flex items-center gap-1.5 border-y border-slate-100 bg-blue-50/50 px-4 py-2 text-[11px] font-bold tracking-wider text-blue-800">
                      <Flame className="h-3.5 w-3.5 text-blue-600" />
                      IN THE HUNT (進出可能性あり)
                    </div>
                    <div className="divide-y divide-slate-100">
                      {inTheHuntTeams.length > 0 ? (
                        inTheHuntTeams.map((team) => (
                          <SeedRow
                            key={team.team}
                            seed={team}
                            isFocus={team.team === focusTeam}
                            onExplainClick={() => setExplanationModalSeed(team)}
                          />
                        ))
                      ) : (
                        <div className="px-4 py-3 text-xs text-slate-400">該当球団なし</div>
                      )}
                    </div>

                    {/* 完全敗退 (ELIMINATED) */}
                    {eliminatedTeams.length > 0 && (
                      <>
                        <div className="flex items-center gap-1.5 border-y border-slate-100 bg-slate-100/70 px-4 py-2 text-[11px] font-bold tracking-wider text-slate-500">
                          <Ban className="h-3.5 w-3.5 text-rose-500" />
                          ELIMINATED (完全敗退決定)
                        </div>
                        <div className="divide-y divide-slate-100 opacity-60">
                          {eliminatedTeams.map((team) => (
                            <SeedRow
                              key={team.team}
                              seed={team}
                              isFocus={team.team === focusTeam}
                              isEliminated={true}
                              onExplainClick={() => setExplanationModalSeed(team)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[11px] font-bold text-slate-600 flex items-center justify-between">
                      <span>2027 NFL DRAFT ORDER (非プレーオフ18チーム)</span>
                      <span className="text-[10px] text-slate-400 font-normal">※全体勝率が低い順、同率はSOSが低い順に優先</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-100 bg-slate-50 font-mono text-[10px] uppercase text-slate-500">
                          <tr>
                            <th className="px-3 py-2.5 text-center w-12">PICK</th>
                            <th className="px-3 py-2.5">TEAM</th>
                            <th className="px-2 py-2.5 text-center">RECORD</th>
                            <th className="px-2 py-2.5 text-center">WIN%</th>
                            <th className="px-2 py-2.5 text-center font-bold text-cyan-700">SOS</th>
                            <th className="px-3 py-2.5">TIEBREAKER 理由</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {draftOrder.map((item) => (
                            <tr
                              key={item.team}
                              className={`hover:bg-slate-50 transition-colors ${
                                item.pickNumber === 1 ? "bg-amber-50/40" : ""
                              }`}
                            >
                              <td className="px-3 py-2 text-center font-mono">
                                <span
                                  className={`inline-grid h-6 w-6 place-items-center rounded text-xs font-bold ${
                                    item.pickNumber === 1
                                      ? "bg-[#e85d2a] text-white shadow-xs"
                                      : item.pickNumber <= 5
                                      ? "bg-[#101827] text-white"
                                      : "bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  {item.pickNumber}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <MemoTeamMark code={item.team} size="sm" />
                                  <div>
                                    <span className="font-bold text-slate-800">{item.teamName}</span>
                                    <span className="ml-1.5 text-[10px] text-slate-400">({item.division})</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-2 py-2 text-center font-mono font-bold text-slate-700">
                                {item.record}
                              </td>
                              <td className="px-2 py-2 text-center font-mono text-slate-500">
                                .{Math.round(item.winPct * 1000).toString().padStart(3, "0")}
                              </td>
                              <td className="px-2 py-2 text-center font-mono font-bold text-cyan-700">
                                .{Math.round(item.sos * 1000).toString().padStart(3, "0")}
                              </td>
                              <td className="px-3 py-2">
                                <span className="inline-block rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600">
                                  {item.tiebreakReason}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右カラム: 対象Weekセレクター ＆ 公式対戦カード（2列表示） ＆ 応援ガイド */}
          <div className="space-y-4 lg:col-span-5">
            {/* 1. 対象Weekセレクター ＆ 予想リセット（対戦カードの直上に統合） */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">対象 Week 選択</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                    Week {selectedWeek}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[11px] text-slate-500 hover:text-[#e85d2a]"
                  onClick={resetToOfficial}
                  title="シミュレーションした勝敗を消去し、初期状態に戻します"
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  予想リセット
                </Button>
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {Array.from({ length: 18 }, (_, i) => i + 1).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setSelectedWeek(w)}
                    className={`flex h-8 min-w-[2.2rem] shrink-0 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                      selectedWeek === w
                        ? "bg-[#e85d2a] text-white shadow-xs font-bold"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    W{w}
                  </button>
                ))}
              </div>
            </div>

            {/* タブ切り替え: 試合一覧 ⇔ 応援ガイド */}
            <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab("simulator")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
                  activeTab === "simulator"
                    ? "bg-[#e85d2a] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Layers className="h-4 w-4" />
                Week {selectedWeek} 試合一覧
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("rooting")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
                  activeTab === "rooting"
                    ? "bg-[#e85d2a] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                応援ガイド ({focusTeam})
              </button>
            </div>

            {/* タブ 1: 試合一覧（1段2試合の2列グリッドでスマホでもコンパクトに表示） */}
            {activeTab === "simulator" && (
              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-slate-800">
                      Week {selectedWeek} 公式対戦カード
                    </CardTitle>
                    <span className="text-[11px] text-slate-400">
                      タップして勝敗予想
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-3">
                  {officialScheduleQuery.isLoading ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      公式日程データを読み込み中...
                    </div>
                  ) : weekGames.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      この週に対戦カードはありません。
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {weekGames.map((game) => (
                        <div
                          key={game.id}
                          className={`flex flex-col justify-between rounded-xl border p-2 transition-all ${
                            game.isFinished
                              ? "border-slate-200 bg-slate-50/70"
                              : "border-slate-200 bg-white shadow-xs hover:border-slate-300"
                          }`}
                        >
                          {/* アウェーチーム */}
                          <button
                            type="button"
                            disabled={game.isFinished}
                            onClick={() => toggleOutcome(game.id, "away")}
                            className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-left transition-all ${
                              game.outcome === "away"
                                ? "bg-emerald-600 text-white font-bold shadow-xs"
                                : game.isFinished
                                ? "opacity-60 cursor-not-allowed text-slate-700"
                                : "hover:bg-slate-100 text-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <MemoTeamMark code={game.awayTeam} size="sm" />
                              <span className="text-xs font-bold truncate">{game.awayTeam}</span>
                            </div>
                            <span className="text-[9px] opacity-75 shrink-0">Away</span>
                          </button>

                          {/* 中央のステータス/VS/引分 */}
                          <div className="my-1 flex items-center justify-center">
                            {game.isFinished ? (
                              <span className="flex items-center gap-1 rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                                <Lock className="h-2.5 w-2.5" />
                                確定
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => toggleOutcome(game.id, "tie")}
                                className={`rounded px-2 py-0.5 text-[10px] font-bold transition-all ${
                                  game.outcome === "tie"
                                    ? "bg-amber-500 text-white"
                                    : "text-slate-400 hover:bg-slate-100"
                                }`}
                                title="引き分けにする"
                              >
                                {game.outcome === "tie" ? "引分" : "vs"}
                              </button>
                            )}
                          </div>

                          {/* ホームチーム */}
                          <button
                            type="button"
                            disabled={game.isFinished}
                            onClick={() => toggleOutcome(game.id, "home")}
                            className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-left transition-all ${
                              game.outcome === "home"
                                ? "bg-emerald-600 text-white font-bold shadow-xs"
                                : game.isFinished
                              ? "opacity-60 cursor-not-allowed text-slate-700"
                              : "hover:bg-slate-100 text-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <MemoTeamMark code={game.homeTeam} size="sm" />
                              <span className="text-xs font-bold truncate">{game.homeTeam}</span>
                            </div>
                            <span className="text-[9px] opacity-75 shrink-0">Home</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* タブ 2: 週間応援ガイド（重要度LOWをデフォルト折りたたみ） */}
            {activeTab === "rooting" && (
              <Card className="border-slate-200 shadow-xs">
                <CardHeader className="border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <MemoTeamMark code={focusTeam} size="sm" />
                    <CardTitle className="text-sm font-bold text-slate-800">
                      {focusTeamInfo?.name ?? focusTeam} の週間応援ガイド (Week {selectedWeek})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                  {rootingGuide.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      この週に推奨できる試合カードはありません。
                    </div>
                  ) : (
                    <>
                      {importantGuides.length === 0 && (
                        <div className="py-4 text-center text-xs text-slate-500">
                          この週に重要度「中」以上の推奨試合はありません。
                        </div>
                      )}

                      {/* 重要度 CRITICAL / HIGH / MEDIUM の試合カード（常に表示） */}
                      {importantGuides.map((item) => (
                        <RootingGuideCard key={item.gameId} item={item} />
                      ))}

                      {/* 重要度 LOW の折りたたみアコーディオン */}
                      {lowGuides.length > 0 && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setShowLowGuides((prev) => !prev)}
                            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <span>その他の試合（重要度 LOW: {lowGuides.length}件）</span>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <span>{showLowGuides ? "閉じる" : "表示する"}</span>
                              <ChevronDown
                                className={`h-4 w-4 transition-transform duration-200 ${
                                  showLowGuides ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </button>

                          {showLowGuides && (
                            <div className="mt-2.5 space-y-3 animate-in fade-in duration-200">
                              {lowGuides.map((item) => (
                                <RootingGuideCard key={item.gameId} item={item} />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* プレイオフ勝敗予想 & 画像シェアモーダル */}
      <PlayoffPredictionModal
        isOpen={isPredictionOpen}
        onClose={() => setIsPredictionOpen(false)}
        afcSeeds={afcPlayoffSeeds}
        nfcSeeds={nfcPlayoffSeeds}
      />

      {/* タイブレーカー解説モーダル */}
      {explanationModalSeed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setExplanationModalSeed(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <MemoTeamMark code={explanationModalSeed.team} size="lg" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    #{explanationModalSeed.seed} {explanationModalSeed.teamName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    タイブレーカー適用判定ステップの解説
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                onClick={() => setExplanationModalSeed(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {explanationModalSeed.tiebreakerExplanations && explanationModalSeed.tiebreakerExplanations.length > 0 ? (
                explanationModalSeed.tiebreakerExplanations.map((exp, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-slate-800">{exp.stepNameJa}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{exp.reasonJa}</p>
                    <div className="text-[10px] text-slate-400 pt-1">
                      対象球団: {exp.teamsCompared.join(", ")}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-500">
                  単独勝率のため、タイブレーカーの適用なしにシードが確定しています。
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setExplanationModalSeed(null)}
              >
                閉じる
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RootingGuideCard({
  item,
}: {
  item: ReturnType<typeof generateRootingGuide>[number];
}) {
  const preferredTeam = item.preferredWinner === "home" ? item.homeTeam : item.awayTeam;
  const preferredInfo = NFL_TEAMS[preferredTeam];

  const badgeColor =
    item.importance === "CRITICAL"
      ? "bg-rose-100 text-rose-800 border-rose-300"
      : item.importance === "HIGH"
      ? "bg-amber-100 text-amber-800 border-amber-300"
      : item.importance === "MEDIUM"
      ? "bg-sky-100 text-sky-800 border-sky-300"
      : "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${badgeColor}`}>
          重要度: {item.importance}
        </span>
        <span className="text-[11px] text-slate-400">
          {item.awayTeam} @ {item.homeTeam}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <MemoTeamMark code={preferredTeam} size="sm" />
        <div className="text-xs font-bold text-slate-800">
          <span className="text-[#e85d2a]">{preferredInfo?.name ?? preferredTeam}</span> の勝利を応援！
        </div>
      </div>

      <p className="text-xs leading-relaxed text-slate-600">{item.reasonJa}</p>
    </div>
  );
}

function SeedRow({
  seed,
  isFocus,
  isEliminated = false,
  onExplainClick,
}: {
  seed: PlayoffSeed;
  isFocus: boolean;
  isEliminated?: boolean;
  onExplainClick: () => void;
}) {
  const hasTiebreaker = seed.tiebreakerExplanations && seed.tiebreakerExplanations.length > 0;

  return (
    <div
      className={`flex items-center justify-between px-4 py-2.5 transition-colors ${
        isFocus ? "bg-amber-50/80 ring-1 ring-amber-300 ring-inset" : "hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
            isEliminated
              ? "bg-slate-200 text-slate-400 line-through"
              : seed.seed <= 4
              ? "bg-[#101827] text-white"
              : seed.seed <= 7
              ? "bg-[#e85d2a] text-white"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {seed.seed}
        </span>
        <MemoTeamMark code={seed.team} size="sm" />
        <div>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold ${isEliminated ? "text-slate-400 line-through" : "text-slate-800"}`}>
              {seed.teamName}
            </span>
            {seed.isDivisionWinner && (
              <span className="rounded bg-slate-100 px-1 py-0.2 text-[9px] font-semibold text-slate-600">
                地区1位
              </span>
            )}
            {isEliminated && (
              <span className="rounded bg-rose-100 px-1 py-0.2 text-[9px] font-semibold text-rose-600">
                敗退
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400">{seed.division}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-bold tabular-nums text-slate-700">
          {seed.record.wins}-{seed.record.losses}
          {seed.record.ties > 0 && `-${seed.record.ties}`}
        </span>

        {hasTiebreaker ? (
          <button
            type="button"
            onClick={onExplainClick}
            className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 transition-all hover:border-[#e85d2a] hover:text-[#e85d2a]"
          >
            <span>解説</span>
            <HelpCircle className="h-3 w-3 text-[#e85d2a]" />
          </button>
        ) : (
          <div className="w-12" />
        )}
      </div>
    </div>
  );
}
