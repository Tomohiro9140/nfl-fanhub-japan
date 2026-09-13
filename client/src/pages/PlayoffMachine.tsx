import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmbeddedAppNav } from "@/components/EmbeddedAppNav";
import { trpc } from "@/lib/trpc";
import { fieldlineTeamBrand } from "@/lib/fieldlineTeams";
import { NFL_TEAMS } from "@/lib/tiebreaker/nflTeams";
import { calculateAllStandings } from "@/lib/tiebreaker/playoffEngine";
import { generateRootingGuide } from "@/lib/tiebreaker/rootingGuide";
import { PLAYOFF_SCENARIOS, ScenarioPreset } from "@/lib/tiebreaker/scenarios";
import { Conference, GameOutcome, PlayoffSeed, ScheduledGame } from "@/lib/tiebreaker/types";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Layers,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { memo, useMemo, useState, useEffect } from "react";

function TeamMark({ code, size = "md" }: { code: string; size?: "sm" | "md" | "lg" }) {
  const brand = fieldlineTeamBrand[code];
  const dimension = size === "lg" ? "h-10 w-10" : size === "md" ? "h-7 w-7" : "h-5 w-5";
  return brand ? (
    <img
      src={brand.logo}
      alt={`${code} logo`}
      className={`${dimension} shrink-0 object-contain drop-shadow-sm`}
      style={{ mixBlendMode: "multiply" }}
    />
  ) : (
    <span className={`${dimension} inline-flex items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700`}>
      {code}
    </span>
  );
}
const MemoTeamMark = memo(TeamMark);

export default function PlayoffMachine() {
  // 1. シナリオ選択（検証済みプリセット / 2026公式）
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("week12_race");
  const [focusTeam, setFocusTeam] = useState<string>("NE");
  const [selectedWeek, setSelectedWeek] = useState<number>(12);
  const [activeConf, setActiveConf] = useState<Conference>("AFC");
  const [activeTab, setActiveTab] = useState<"simulator" | "rooting">("simulator");
  const [explanationModalSeed, setExplanationModalSeed] = useState<PlayoffSeed | null>(null);

  // 公式スケジュールの取得
  const officialScheduleQuery = trpc.playoff.getSchedule.useQuery({ season: 2026 }, { staleTime: 10 * 60_000 });

  // 試合データ（ローカルシミュレーション用）
  const [games, setGames] = useState<ScheduledGame[]>(() => {
    const preset = PLAYOFF_SCENARIOS.find((s) => s.id === "week12_race");
    return preset ? preset.games : [];
  });

  // シナリオ切り替えハンドラー
  const handleScenarioChange = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    if (scenarioId === "official_2026") {
      if (officialScheduleQuery.data?.games && officialScheduleQuery.data.games.length > 0) {
        setGames(officialScheduleQuery.data.games as ScheduledGame[]);
        setSelectedWeek(1);
      }
    } else {
      const preset = PLAYOFF_SCENARIOS.find((s) => s.id === scenarioId);
      if (preset) {
        setGames(preset.games);
        setSelectedWeek(preset.targetWeek);
      }
    }
  };

  // 公式スケジュールがロード完了した際に公式シナリオが選ばれていれば反映
  useEffect(() => {
    if (selectedScenarioId === "official_2026" && officialScheduleQuery.data?.games) {
      setGames(officialScheduleQuery.data.games as ScheduledGame[]);
    }
  }, [officialScheduleQuery.data, selectedScenarioId]);

  // 勝敗トグル処理
  const toggleOutcome = (gameId: number, target: "home" | "away" | "tie") => {
    setGames((prev) =>
      prev.map((g) => {
        if (g.id !== gameId) return g;
        // 既に同じ結果が選択されていた場合はクリア、それ以外は切り替え
        const newOutcome: GameOutcome | undefined = g.outcome === target ? undefined : target;
        return { ...g, outcome: newOutcome };
      })
    );
  };

  // 指定週の試合リセット
  const resetWeekOutcomes = (weekNum: number) => {
    setGames((prev) => prev.map((g) => (g.week === weekNum ? { ...g, outcome: undefined } : g)));
  };

  // タイブレーカーエンジンによる即時シード計算
  const standings = useMemo(() => calculateAllStandings(games), [games]);
  const currentConfStandings = standings[activeConf];

  // 週間応援ガイドの生成
  const rootingGuide = useMemo(
    () => generateRootingGuide(focusTeam, games, selectedWeek),
    [focusTeam, games, selectedWeek]
  );

  const focusTeamInfo = NFL_TEAMS[focusTeam];
  const weekGames = useMemo(() => games.filter((g) => g.week === selectedWeek), [games, selectedWeek]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <EmbeddedAppNav current="PLAYOFFS" />

      {/* ヘッダー */}
      <header className="border-b border-white/10 bg-[#101827] text-white">
        <div className="container mx-auto flex min-h-20 flex-col justify-center px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#f2bc62] to-[#e85d2a] shadow-lg">
                <Trophy className="h-5 w-5 text-[#101827]" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold tracking-tight">Playoff Machine</h1>
                <p className="text-[10px] font-medium tracking-[.18em] text-slate-400">
                  NFL POSTSEASON SEEDING & TIEBREAKER ENGINE
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* コントロールバー */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="container mx-auto grid gap-4 px-4 py-4 sm:px-6 md:grid-cols-3">
          {/* シナリオ選択 */}
          <div>
            <Label className="text-xs font-semibold text-slate-600">検証シナリオ・プリセット</Label>
            <Select value={selectedScenarioId} onValueChange={handleScenarioChange}>
              <SelectTrigger className="mt-1 h-9 bg-slate-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white">
                {PLAYOFF_SCENARIOS.map((scenario) => (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    {scenario.name}
                  </SelectItem>
                ))}
                <SelectItem value="official_2026">2026 公式スケジュール（実データ連動）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 応援チーム選択 */}
          <div>
            <Label className="text-xs font-semibold text-slate-600">あなたの応援チーム（Focus）</Label>
            <Select
              value={focusTeam}
              onValueChange={(val) => {
                setFocusTeam(val);
                const info = NFL_TEAMS[val];
                if (info) setActiveConf(info.conference);
              }}
            >
              <SelectTrigger className="mt-1 h-9 bg-slate-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50 max-h-72 bg-white">
                {Object.values(NFL_TEAMS).map((team) => (
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

          {/* 閲覧・シミュレーションWeek選択 */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-600">対象 Week</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] text-slate-500 hover:text-[#e85d2a]"
                onClick={() => resetWeekOutcomes(selectedWeek)}
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                この週のトグルをリセット
              </Button>
            </div>
            <div className="mt-1 flex gap-1 overflow-x-auto pb-1">
              {Array.from({ length: 18 }, (_, i) => i + 1).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setSelectedWeek(w)}
                  className={`flex h-8 min-w-[2.2rem] items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                    selectedWeek === w
                      ? "bg-[#e85d2a] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  W{w}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* メインレイアウト */}
      <main className="container mx-auto mt-6 px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* 左カラム: シード順位表（7カラム） */}
          <div className="space-y-6 lg:col-span-7">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#e85d2a]" />
                  <CardTitle className="text-base font-bold text-slate-800">
                    シード順位表（リアルタイム再計算）
                  </CardTitle>
                </div>
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
              </CardHeader>
              <CardContent className="p-0">
                {/* 地区優勝（#1〜#4） */}
                <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-2 text-[11px] font-bold tracking-wider text-slate-500">
                  DIVISION LEADERS (#1〜#4)
                </div>
                <div className="divide-y divide-slate-100">
                  {currentConfStandings.divisionWinners.map((team) => (
                    <SeedRow
                      key={team.team}
                      seed={team}
                      isFocus={team.team === focusTeam}
                      onExplainClick={() => setExplanationModalSeed(team)}
                    />
                  ))}
                </div>

                {/* ワイルドカード進出圏内（#5〜#7） */}
                <div className="border-y border-slate-100 bg-amber-50/50 px-4 py-2 text-[11px] font-bold tracking-wider text-amber-800">
                  WILD CARD (#5〜#7)
                </div>
                <div className="divide-y divide-slate-100">
                  {currentConfStandings.wildCards.map((team) => (
                    <SeedRow
                      key={team.team}
                      seed={team}
                      isFocus={team.team === focusTeam}
                      onExplainClick={() => setExplanationModalSeed(team)}
                    />
                  ))}
                </div>

                {/* 圏外・追撃チーム（#8〜#16） */}
                <div className="border-y border-slate-100 bg-slate-50/70 px-4 py-2 text-[11px] font-bold tracking-wider text-slate-500">
                  IN THE HUNT / ELIMINATED (#8〜#16)
                </div>
                <div className="divide-y divide-slate-100">
                  {currentConfStandings.inTheHunt.map((team) => (
                    <SeedRow
                      key={team.team}
                      seed={team}
                      isFocus={team.team === focusTeam}
                      onExplainClick={() => setExplanationModalSeed(team)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右カラム: 週間応援ガイド & 試合トグル（5カラム） */}
          <div className="space-y-6 lg:col-span-5">
            {/* タブ切り替え */}
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
                Week {selectedWeek} 勝敗トグル
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

            {/* タブ 1: 試合勝敗トグル */}
            {activeTab === "simulator" && (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-3">
                  <CardTitle className="text-sm font-bold text-slate-800">
                    Week {selectedWeek} 対戦カード（タップして結果を切り替え）
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                  {weekGames.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      この週に対戦スケジュールはありません。
                    </div>
                  ) : (
                    weekGames.map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 transition-all hover:border-slate-300 shadow-xs"
                      >
                        {/* アウェーチームボタン */}
                        <button
                          type="button"
                          onClick={() => toggleOutcome(game.id, "away")}
                          className={`flex flex-1 items-center gap-2 rounded-lg p-2 text-left transition-all ${
                            game.outcome === "away"
                              ? "bg-emerald-600 text-white font-bold shadow-xs"
                              : "hover:bg-slate-100 text-slate-800"
                          }`}
                        >
                          <MemoTeamMark code={game.awayTeam} size="sm" />
                          <div>
                            <p className="text-xs">{game.awayTeam}</p>
                            <p className="text-[9px] opacity-75">Away</p>
                          </div>
                        </button>

                        {/* 引分ボタン / VS */}
                        <div className="px-1 text-center">
                          <button
                            type="button"
                            onClick={() => toggleOutcome(game.id, "tie")}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition-all ${
                              game.outcome === "tie"
                                ? "bg-amber-500 text-white"
                                : "text-slate-400 hover:bg-slate-100"
                            }`}
                            title="引き分けにする"
                          >
                            {game.outcome === "tie" ? "引分" : "vs"}
                          </button>
                        </div>

                        {/* ホームチームボタン */}
                        <button
                          type="button"
                          onClick={() => toggleOutcome(game.id, "home")}
                          className={`flex flex-1 items-center justify-end gap-2 rounded-lg p-2 text-right transition-all ${
                            game.outcome === "home"
                              ? "bg-emerald-600 text-white font-bold shadow-xs"
                              : "hover:bg-slate-100 text-slate-800"
                          }`}
                        >
                          <div>
                            <p className="text-xs">{game.homeTeam}</p>
                            <p className="text-[9px] opacity-75">Home</p>
                          </div>
                          <MemoTeamMark code={game.homeTeam} size="sm" />
                        </button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {/* タブ 2: 週間応援ガイド */}
            {activeTab === "rooting" && (
              <Card className="border-slate-200 shadow-sm">
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
                    rootingGuide.map((item) => {
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
                        <div
                          key={item.gameId}
                          className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs space-y-2"
                        >
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

                          <p className="text-xs leading-relaxed text-slate-600">
                            {item.reasonJa}
                          </p>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

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

/**
 * シード行コンポーネント
 */
function SeedRow({
  seed,
  isFocus,
  onExplainClick,
}: {
  seed: PlayoffSeed;
  isFocus: boolean;
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
            seed.seed <= 4
              ? "bg-[#101827] text-white"
              : seed.seed <= 7
              ? "bg-[#e85d2a] text-white"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {seed.seed}
        </span>
        <MemoTeamMark code={seed.team} size="sm" />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800">{seed.teamName}</span>
            {seed.isDivisionWinner && (
              <span className="rounded bg-slate-100 px-1 py-0.2 text-[9px] font-semibold text-slate-600">
                地区1位
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
