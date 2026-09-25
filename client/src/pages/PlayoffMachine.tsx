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

const ESPN_LOGO_CODES: Record<string, string> = {
  WAS: "wsh",
  WSH: "wsh",
  LAR: "lar",
  LAC: "lac",
  LV: "lv",
};

function TeamMark({ code, size = "md" }: { code: string; size?: "sm" | "md" | "lg" }) {
  const [hasError, setHasError] = useState(false);
  const dimension = size === "lg" ? "h-8 w-8" : size === "md" ? "h-5 w-5" : "h-4 w-4";
  const espnCode = ESPN_LOGO_CODES[code.toUpperCase()] ?? code.toLowerCase();
  const logoUrl = `https://a.espncdn.com/i/teamlogos/nfl/500/${espnCode}.png`;

  if (hasError) {
    return (
      <span className={`${dimension} inline-flex shrink-0 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-700`}>
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

  const [isPredictionOpen, setIsPredictionOpen] = useState(false);
  const [presetDropdownOpen, setPresetDropdownOpen] = useState(false);

  const alphabeticalTeams = useMemo(() => {
    return Object.values(NFL_TEAMS).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

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

  const toggleOutcome = (gameId: number, target: "home" | "away" | "tie") => {
    setGames((prev) =>
      prev.map((g) => {
        if (g.id !== gameId || g.isFinished) return g;
        const newOutcome: GameOutcome | undefined = g.outcome === target ? undefined : target;
        return { ...g, outcome: newOutcome };
      })
    );
  };

  const resetToOfficial = () => {
    if (officialScheduleQuery.data?.games) {
      setGames(officialScheduleQuery.data.games as ScheduledGame[]);
    }
  };

  const standings = useMemo(() => calculateAllStandings(games), [games]);
  const currentConfStandings = standings[activeConf];

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

  // プリセット適用（常に全試合一括上書き）
  const applyPreset = (preset: "better_record" | "home_wins" | "run_the_table" | "underdogs") => {
    setPresetDropdownOpen(false);

    setGames((prev) =>
      prev.map((g) => {
        if (g.isFinished) return g;

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

  const playoffTeamCodes = useMemo(() => {
    const set = new Set<string>();
    for (const conf of ["AFC", "NFC"] as Conference[]) {
      for (const t of standings[conf]?.divisionWinners ?? []) set.add(t.team);
      for (const t of standings[conf]?.wildCards ?? []) set.add(t.team);
    }
    return set;
  }, [standings]);

  const draftOrder = useMemo<DraftPickItem[]>(() => {
    const nonPlayoff = Object.keys(NFL_TEAMS)
      .filter((code) => !playoffTeamCodes.has(code))
      .map((code) => ({
        code,
        info: NFL_TEAMS[code],
        record: allTeamRecords[code],
      }));

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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 w-full max-w-full overflow-x-hidden">
      <EmbeddedAppNav current="SIMULATOR" />

      {/* ヘッダー */}
      <header className="border-b border-white/10 bg-[#101827] text-white">
        <div className="container mx-auto flex min-h-12 items-center justify-center px-3 py-2 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-[#f2bc62] to-[#e85d2a] shadow">
              <Trophy className="h-3.5 w-3.5 text-[#101827]" />
            </div>
            <h1 className="font-display text-base sm:text-lg font-bold tracking-tight">NFL Season Simulator</h1>
          </div>
        </div>
      </header>

      {/* コントロールバー */}
      <div className="border-b border-slate-200 bg-white shadow-xs">
        <div className="container mx-auto flex flex-col gap-2.5 px-3 py-2.5 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
            {/* 応援チーム選択 */}
            <div className="w-full sm:w-52">
              <Select
                value={focusTeam}
                onValueChange={(val) => {
                  setFocusTeam(val);
                  const info = NFL_TEAMS[val];
                  if (info) setActiveConf(info.conference as Conference);
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50 max-h-72 bg-white">
                  {alphabeticalTeams.map((team) => (
                    <SelectItem key={team.code} value={team.code}>
                      <div className="flex items-center gap-1.5">
                        <MemoTeamMark code={team.code} size="sm" />
                        <span className="text-xs">{team.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 一括プリセット（スマホでも画面外に突き抜けない配置） */}
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
                className="h-8 border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 px-3"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-[#e85d2a]" />
                <span>一括プリセット</span>
                <ChevronDown className={`ml-1 h-3 w-3 ${presetDropdownOpen ? "rotate-180" : ""}`} />
              </Button>

              {presetDropdownOpen && (
                <div className="absolute left-0 top-full z-50 mt-1.5 w-56 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <button
                    type="button"
                    onClick={() => applyPreset("better_record")}
                    className="flex w-full flex-col rounded-lg px-2.5 py-1.5 text-left hover:bg-slate-50"
                  >
                    <span className="text-xs font-bold text-slate-800">🏆 勝率上位（Better Record）</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("home_wins")}
                    className="flex w-full flex-col rounded-lg px-2.5 py-1.5 text-left hover:bg-slate-50"
                  >
                    <span className="text-xs font-bold text-slate-800">🏠 ホーム全勝（Home Wins）</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("run_the_table")}
                    className="flex w-full flex-col rounded-lg px-2.5 py-1.5 text-left hover:bg-slate-50"
                  >
                    <span className="text-xs font-bold text-[#e85d2a]">🔥 {focusTeamInfo?.name ?? focusTeam} 全勝</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("underdogs")}
                    className="flex w-full flex-col rounded-lg px-2.5 py-1.5 text-left hover:bg-slate-50"
                  >
                    <span className="text-xs font-bold text-emerald-700">⚡ 最大波乱（Chaos）</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* プレイオフ予想ボタン */}
          <div className="w-full sm:w-auto">
            <Button
              type="button"
              onClick={() => setIsPredictionOpen(true)}
              className="w-full sm:w-auto h-8 gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-xs"
              size="sm"
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>プレイオフ勝敗予想</span>
            </Button>
          </div>
        </div>
      </div>

      {/* メインレイアウト */}
      <main className="container mx-auto mt-3 px-2 sm:px-6">
        <div className="grid gap-3.5 lg:grid-cols-12">
          {/* 左カラム: シード順位表 ⇔ ドラフト指名順 */}
          <div className="space-y-3 lg:col-span-7 min-w-0">
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="flex flex-col gap-2 border-b border-slate-100 p-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                  <button
                    type="button"
                    onClick={() => setMainViewMode("playoffs")}
                    className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-bold ${
                      mainViewMode === "playoffs" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    <Trophy className="h-3 w-3 text-[#e85d2a]" />
                    <span>シード順位表</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMainViewMode("draft")}
                    className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-bold ${
                      mainViewMode === "draft" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    <Award className="h-3 w-3 text-cyan-600" />
                    <span>ドラフト順 (#1〜#18)</span>
                  </button>
                </div>

                {mainViewMode === "playoffs" && (
                  <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                    {(["AFC", "NFC"] as Conference[]).map((conf) => (
                      <button
                        key={conf}
                        type="button"
                        onClick={() => setActiveConf(conf)}
                        className={`rounded px-2.5 py-0.5 text-xs font-bold ${
                          activeConf === conf ? "bg-[#101827] text-white shadow-xs" : "text-slate-600"
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
                    <div className="border-b border-slate-100 bg-slate-50/70 px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-500">
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

                    <div className="border-y border-slate-100 bg-amber-50/50 px-3 py-1.5 text-[10px] font-bold tracking-wider text-amber-800">
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

                    <div className="flex items-center gap-1 border-y border-slate-100 bg-blue-50/50 px-3 py-1.5 text-[10px] font-bold tracking-wider text-blue-800">
                      <Flame className="h-3 w-3 text-blue-600" />
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
                        <div className="px-3 py-2 text-xs text-slate-400">該当球団なし</div>
                      )}
                    </div>

                    {eliminatedTeams.length > 0 && (
                      <>
                        <div className="flex items-center gap-1 border-y border-slate-100 bg-slate-100/70 px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-500">
                          <Ban className="h-3 w-3 text-rose-500" />
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
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-100 bg-slate-50 font-mono text-[9px] uppercase text-slate-500">
                        <tr>
                          <th className="px-2 py-2 text-center w-8">#</th>
                          <th className="px-2 py-2">TEAM</th>
                          <th className="px-2 py-2 text-center">W-L</th>
                          <th className="px-2 py-2 text-center">PCT</th>
                          <th className="px-2 py-2 text-center text-cyan-700">SOS</th>
                          <th className="px-2 py-2">REASON</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {draftOrder.map((item) => (
                          <tr key={item.team} className="hover:bg-slate-50">
                            <td className="px-2 py-1 text-center font-mono font-bold text-[10px]">{item.pickNumber}</td>
                            <td className="px-2 py-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <MemoTeamMark code={item.team} size="sm" />
                                <span className="font-bold truncate text-xs">{item.teamName}</span>
                              </div>
                            </td>
                            <td className="px-2 py-1 text-center font-mono text-[11px] font-semibold">{item.record}</td>
                            <td className="px-2 py-1 text-center font-mono text-[11px] text-slate-500">.{Math.round(item.winPct * 1000).toString().padStart(3, "0")}</td>
                            <td className="px-2 py-1 text-center font-mono text-[11px] font-bold text-cyan-700">.{Math.round(item.sos * 1000).toString().padStart(3, "0")}</td>
                            <td className="px-2 py-1 text-[9px] text-slate-500">{item.tiebreakReason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右カラム: 週選択 ＆ 対戦カード（スマホ横2列・縦幅半減） */}
          <div className="space-y-3 lg:col-span-5 min-w-0">
            <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("simulator")}
                    className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-bold ${
                      activeTab === "simulator" ? "bg-[#e85d2a] text-white shadow-xs" : "text-slate-600"
                    }`}
                  >
                    <Layers className="h-3 w-3" />
                    <span>W{selectedWeek} 対戦</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("rooting")}
                    className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-bold ${
                      activeTab === "rooting" ? "bg-[#e85d2a] text-white shadow-xs" : "text-slate-600"
                    }`}
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>応援ガイド</span>
                  </button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1.5 text-[10px] text-slate-500 hover:text-[#e85d2a]"
                  onClick={resetToOfficial}
                >
                  <RotateCcw className="mr-0.5 h-2.5 w-2.5" />
                  リセット
                </Button>
              </div>

              {/* Week セレクター */}
              <div className="flex gap-1 overflow-x-auto pt-1.5 pb-0.5">
                {Array.from({ length: 18 }, (_, i) => i + 1).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setSelectedWeek(w)}
                    className={`flex h-6 min-w-[1.8rem] shrink-0 items-center justify-center rounded text-[11px] font-semibold ${
                      selectedWeek === w
                        ? "bg-[#101827] text-white font-bold shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    W{w}
                  </button>
                ))}
              </div>
            </div>

            {/* 対戦カード（スマホ横2列・縦幅半減） */}
            {activeTab === "simulator" && (
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {weekGames.map((game) => (
                  <div
                    key={game.id}
                    className={`flex flex-col justify-between rounded-lg border p-1 sm:p-1.5 ${
                      game.isFinished ? "border-slate-200 bg-slate-50/70" : "border-slate-200 bg-white shadow-xs"
                    }`}
                  >
                    {/* Away */}
                    <button
                      type="button"
                      disabled={game.isFinished}
                      onClick={() => toggleOutcome(game.id, "away")}
                      className={`flex items-center justify-between rounded px-1.5 py-1 text-left ${
                        game.outcome === "away"
                          ? "bg-emerald-600 text-white font-bold"
                          : game.isFinished
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-1 min-w-0">
                        <MemoTeamMark code={game.awayTeam} size="sm" />
                        <span className="text-[11px] font-bold truncate">{game.awayTeam}</span>
                      </div>
                      <span className="text-[8px] opacity-75">A</span>
                    </button>

                    {/* vs / 引分 */}
                    <div className="my-0.5 flex items-center justify-center">
                      {game.isFinished ? (
                        <span className="flex items-center gap-0.5 rounded bg-slate-200 px-1 text-[8px] font-bold text-slate-600">
                          <Lock className="h-1.5 w-1.5" /> 確定
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleOutcome(game.id, "tie")}
                          className={`rounded px-1.5 text-[8px] font-bold ${
                            game.outcome === "tie" ? "bg-amber-500 text-white" : "text-slate-400"
                          }`}
                        >
                          {game.outcome === "tie" ? "引分" : "vs"}
                        </button>
                      )}
                    </div>

                    {/* Home */}
                    <button
                      type="button"
                      disabled={game.isFinished}
                      onClick={() => toggleOutcome(game.id, "home")}
                      className={`flex items-center justify-between rounded px-1.5 py-1 text-left ${
                        game.outcome === "home"
                          ? "bg-emerald-600 text-white font-bold"
                          : game.isFinished
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-1 min-w-0">
                        <MemoTeamMark code={game.homeTeam} size="sm" />
                        <span className="text-[11px] font-bold truncate">{game.homeTeam}</span>
                      </div>
                      <span className="text-[8px] opacity-75">H</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 応援ガイド */}
            {activeTab === "rooting" && (
              <div className="space-y-2">
                {rootingGuide.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">推奨カードはありません。</div>
                ) : (
                  <>
                    {importantGuides.map((item) => (
                      <RootingGuideCard key={item.gameId} item={item} />
                    ))}
                    {lowGuides.length > 0 && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setShowLowGuides((prev) => !prev)}
                          className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-600"
                        >
                          <span>その他の試合 ({lowGuides.length}件)</span>
                          <ChevronDown className={`h-3 w-3 ${showLowGuides ? "rotate-180" : ""}`} />
                        </button>
                        {showLowGuides && (
                          <div className="mt-1.5 space-y-1.5">
                            {lowGuides.map((item) => (
                              <RootingGuideCard key={item.gameId} item={item} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <PlayoffPredictionModal
        isOpen={isPredictionOpen}
        onClose={() => setIsPredictionOpen(false)}
        afcSeeds={afcPlayoffSeeds}
        nfcSeeds={nfcPlayoffSeeds}
      />

      {explanationModalSeed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setExplanationModalSeed(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <MemoTeamMark code={explanationModalSeed.team} size="lg" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    #{explanationModalSeed.seed} {explanationModalSeed.teamName}
                  </h3>
                  <p className="text-[11px] text-slate-500">タイブレーカー判定詳細</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                onClick={() => setExplanationModalSeed(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {explanationModalSeed.tiebreakerExplanations && explanationModalSeed.tiebreakerExplanations.length > 0 ? (
                explanationModalSeed.tiebreakerExplanations.map((exp, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs space-y-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="font-bold text-slate-800">{exp.stepNameJa}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">{exp.reasonJa}</p>
                    <div className="text-[9px] text-slate-400">対象: {exp.teamsCompared.join(", ")}</div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-slate-500">単独勝率のため確定しています。</div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => setExplanationModalSeed(null)}>
                閉じる
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RootingGuideCard({ item }: { item: ReturnType<typeof generateRootingGuide>[number] }) {
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
    <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs space-y-1.5">
      <div className="flex items-center justify-between">
        <span className={`rounded-full border px-2 py-0.2 text-[9px] font-bold ${badgeColor}`}>
          重要度: {item.importance}
        </span>
        <span className="text-[10px] text-slate-400">
          {item.awayTeam} @ {item.homeTeam}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <MemoTeamMark code={preferredTeam} size="sm" />
        <div className="text-xs font-bold text-slate-800">
          <span className="text-[#e85d2a]">{preferredInfo?.name ?? preferredTeam}</span> の勝利を応援！
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-slate-600">{item.reasonJa}</p>
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
      className={`flex items-center justify-between px-3 py-2 transition-colors ${
        isFocus ? "bg-amber-50/80 ring-1 ring-amber-300 ring-inset" : "hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-bold ${
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
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 min-w-0">
            <span className={`text-xs font-bold truncate ${isEliminated ? "text-slate-400 line-through" : "text-slate-800"}`}>
              {seed.teamName}
            </span>
            {seed.isDivisionWinner && (
              <span className="shrink-0 rounded bg-slate-100 px-1 py-0.2 text-[8px] font-semibold text-slate-600">
                地区1位
              </span>
            )}
            {isEliminated && (
              <span className="shrink-0 rounded bg-rose-100 px-1 py-0.2 text-[8px] font-semibold text-rose-600">
                敗退
              </span>
            )}
          </div>
          <span className="text-[9px] text-slate-400 block truncate">{seed.division}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-bold tabular-nums text-slate-700">
          {seed.record.wins}-{seed.record.losses}
          {seed.record.ties > 0 && `-${seed.record.ties}`}
        </span>

        {hasTiebreaker ? (
          <button
            type="button"
            onClick={onExplainClick}
            className="flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 hover:border-[#e85d2a] hover:text-[#e85d2a]"
          >
            <span>解説</span>
            <HelpCircle className="h-2.5 w-2.5 text-[#e85d2a]" />
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>
    </div>
  );
}
