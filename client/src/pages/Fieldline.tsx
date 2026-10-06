import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { EmbeddedAppNav } from "@/components/EmbeddedAppNav";
import { trpc } from "@/lib/trpc";
import { fieldlineTeamBrand } from "@/lib/fieldlineTeams";
import { ArrowLeftRight, CalendarRange, ChevronDown, ChevronUp, HelpCircle, ShieldAlert, Trophy, X, BarChart3, SlidersHorizontal } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

type VenueFilter = "all" | "home" | "away";
type Selection = { season: number; team: string; weeks: number[]; venue: VenueFilter };
type AvailableWeek = { week: number; opponent: string; isHome: boolean | null; isBye: boolean; hasStats?: boolean };

type MetricKey =
  // OFFENSE
  | "pointsPerGame"
  | "yardsPerGame"
  | "passYardsPerGame"
  | "rushYardsPerGame"
  | "passEpaPerPlay"
  | "rushEpaPerPlay"
  | "successRate"
  | "passerRating"
  | "thirdDownPct"
  | "redZoneTdPct"
  | "sacksAllowed"
  | "giveaways"
  // DEFENSE
  | "pointsAllowedPerGame"
  | "yardsAllowedPerGame"
  | "passYardsAllowedPerGame"
  | "rushYardsAllowedPerGame"
  | "opponentPassEpaPerPlay"
  | "opponentRushEpaPerPlay"
  | "opponentSuccessRate"
  | "opponentThirdDownPct"
  | "opponentRedZoneTdPct"
  | "sacksDefense"
  | "interceptionsDefense"
  | "turnovers"
  // SPECIAL TEAMS
  | "fieldGoalPct"
  | "extraPointPct"
  | "puntInside20Pct"
  | "netPuntAvg"
  | "startFieldPos"
  // DISCIPLINE
  | "penalties"
  | "penaltyYardsPerGame";

type MetricConfig = {
  key: MetricKey;
  label: string;
  format: "number" | "decimal" | "percent" | "epa";
};

const metricGroups: { title: string; metrics: MetricConfig[] }[] = [
  {
    title: "OFFENSE",
    metrics: [
      { key: "pointsPerGame", label: "得点 / G", format: "decimal" },
      { key: "yardsPerGame", label: "獲得ヤード / G", format: "decimal" },
      { key: "passYardsPerGame", label: "パスヤード / G", format: "decimal" },
      { key: "rushYardsPerGame", label: "ランヤード / G", format: "decimal" },
      { key: "passEpaPerPlay", label: "Pass EPA / Play", format: "epa" },
      { key: "rushEpaPerPlay", label: "Rush EPA / Play", format: "epa" },
      { key: "successRate", label: "Success Rate", format: "percent" },
      { key: "passerRating", label: "Passer Rating", format: "decimal" },
      { key: "thirdDownPct", label: "3rd Down", format: "percent" },
      { key: "redZoneTdPct", label: "RZ TD", format: "percent" },
      { key: "sacksAllowed", label: "被サック数", format: "number" },
      { key: "giveaways", label: "Giveaways", format: "number" },
    ],
  },
  {
    title: "DEFENSE",
    metrics: [
      { key: "pointsAllowedPerGame", label: "失点 / G", format: "decimal" },
      { key: "yardsAllowedPerGame", label: "喪失ヤード / G", format: "decimal" },
      { key: "passYardsAllowedPerGame", label: "パス喪失ヤード / G", format: "decimal" },
      { key: "rushYardsAllowedPerGame", label: "ラン喪失ヤード / G", format: "decimal" },
      { key: "opponentPassEpaPerPlay", label: "Opp. Pass EPA / P", format: "epa" },
      { key: "opponentRushEpaPerPlay", label: "Opp. Rush EPA / P", format: "epa" },
      { key: "opponentSuccessRate", label: "Opp. Success Rate", format: "percent" },
      { key: "opponentThirdDownPct", label: "Opp. 3rd Down", format: "percent" },
      { key: "opponentRedZoneTdPct", label: "Opp. RZ TD", format: "percent" },
      { key: "sacksDefense", label: "Sacks", format: "number" },
      { key: "interceptionsDefense", label: "INT", format: "number" },
      { key: "turnovers", label: "Takeaways", format: "number" },
    ],
  },
  {
    title: "SPECIAL TEAMS",
    metrics: [
      { key: "fieldGoalPct", label: "FG%", format: "percent" },
      { key: "extraPointPct", label: "XP%", format: "percent" },
      { key: "puntInside20Pct", label: "Punt In-20%", format: "percent" },
      { key: "netPuntAvg", label: "Net Punt Avg", format: "decimal" },
      { key: "startFieldPos", label: "Start Field Pos", format: "decimal" },
    ],
  },
  {
    title: "DISCIPLINE",
    metrics: [
      { key: "penalties", label: "Penalties", format: "number" },
      { key: "penaltyYardsPerGame", label: "Penalty Yds / G", format: "decimal" },
    ],
  },
];

const lowerIsBetter = new Set<MetricKey>([
  "sacksAllowed",
  "giveaways",
  "pointsAllowedPerGame",
  "yardsAllowedPerGame",
  "passYardsAllowedPerGame",
  "rushYardsAllowedPerGame",
  "opponentPassEpaPerPlay",
  "opponentRushEpaPerPlay",
  "opponentSuccessRate",
  "opponentThirdDownPct",
  "opponentRedZoneTdPct",
  "penalties",
  "penaltyYardsPerGame",
]);

const storageKey = "fieldline:selected-teams:v1";
const staticQueryOptions = { staleTime: 10 * 60_000, gcTime: 30 * 60_000, refetchOnWindowFocus: false, retry: 1 } as const;
const weekQueryOptions = { staleTime: 5 * 60_000, gcTime: 15 * 60_000, refetchOnWindowFocus: false, retry: 1 } as const;
const comparisonQueryOptions = { staleTime: 2 * 60_000, gcTime: 10 * 60_000, refetchOnWindowFocus: false, retry: false } as const;

function TeamMark({ code, size = "md" }: { code: string; size?: "sm" | "md" | "lg" }) {
  const brand = fieldlineTeamBrand[code];
  const dimension = size === "lg" ? "h-14 w-14" : size === "md" ? "h-10 w-10" : "h-6 w-6";
  return brand ? (
    <img src={brand.logo} alt={`${code} logo`} className={`${dimension} shrink-0 object-contain drop-shadow-sm`} style={{ mixBlendMode: "multiply" }} />
  ) : (
    <span className={`${dimension} inline-flex items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-600`}>
      {code}
    </span>
  );
}
const MemoTeamMark = memo(TeamMark);

function getStoredTeam(side: "left" | "right", fallback: string) {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}");
    return typeof saved[`${side}Team`] === "string" && saved[`${side}Team`] in fieldlineTeamBrand ? saved[`${side}Team`] : fallback;
  } catch {
    return fallback;
  }
}

function formatMetric(value: number | null | undefined, format: "number" | "decimal" | "percent" | "epa") {
  if (value === null || value === undefined) return "—";
  if (format === "percent") return `${(value * 100).toFixed(1)}%`;
  if (format === "decimal") return value.toFixed(1);
  if (format === "epa") return value > 0 ? `+${value.toFixed(3)}` : value.toFixed(3);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatRecord(record: { wins: number; losses: number; ties: number }) {
  return `${record.wins}勝 ${record.losses}敗${record.ties ? ` ${record.ties}分` : ""}`;
}

function formatLastUpdatedAt(value: Date | null | undefined) {
  return value ? new Intl.DateTimeFormat("ja-JP", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Tokyo" }).format(new Date(value)) : null;
}

function isSuperior(value: number | null | undefined, opponent: number | null | undefined, metric: MetricKey) {
  return (
    value !== null &&
    value !== undefined &&
    opponent !== null &&
    opponent !== undefined &&
    value !== opponent &&
    (lowerIsBetter.has(metric) ? value < opponent : value > opponent)
  );
}

function useDebouncedSelection(selection: Selection, delay = 180) {
  const [debounced, setDebounced] = useState(selection);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(selection), delay);
    return () => window.clearTimeout(timer);
  }, [selection, delay]);
  return debounced;
}

const venueLabel = (venue: VenueFilter) => (venue === "home" ? "ホーム" : venue === "away" ? "アウェー" : "全試合");

function SelectPanel({
  title,
  value,
  onChange,
  onVenueChange,
  onDatasetChange,
  teams,
  seasons,
  availableWeeks,
  weeksLoading,
}: {
  title: string;
  side: "left" | "right";
  value: Selection;
  onChange: (value: Selection) => void;
  onVenueChange: (venue: VenueFilter) => void;
  onDatasetChange: () => void;
  teams: { code: string; name: string }[];
  seasons: number[];
  availableWeeks: AvailableWeek[];
  weeksLoading: boolean;
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const update = (key: "season" | "team" | "venue", raw: string) => {
    if (key === "venue") return onVenueChange(raw as VenueFilter);
    onDatasetChange();
    onChange({ ...value, [key]: key === "season" ? Number(raw) : raw, weeks: [] } as Selection);
  };

  const toggleWeek = (week: number) => {
    const info = availableWeeks.find((item) => item.week === week);
    if (!info || (!info.hasStats && !info.isBye)) return;
    onChange({
      ...value,
      weeks: value.weeks.includes(week) ? value.weeks.filter((item) => item !== week) : [...value.weeks, week].sort((a, b) => a - b),
    });
  };

  const brand = fieldlineTeamBrand[value.team];
  const selectableList = availableWeeks.filter((item) => item.hasStats || item.isBye);
  const venueText = venueLabel(value.venue);

  return (
    <section
      className="rounded-[1.6rem] p-px shadow-[0_18px_45px_rgba(14,19,31,0.16)]"
      style={{ backgroundImage: `linear-gradient(135deg, ${brand?.primary ?? "#1f2e50"}, ${brand?.accent ?? "#e85d2a"})` }}
    >
      <div className="rounded-[1.55rem] bg-white/[.97] p-3.5 sm:p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <MemoTeamMark code={value.team} size="sm" />
            <p className="font-mono text-[10px] font-bold tracking-[.18em] text-slate-500 uppercase">{title}</p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="h-7 px-2 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100/90 hover:bg-slate-200 shrink-0"
          >
            <span>
              {venueText} · {value.weeks.length}W
            </span>
            {isFilterOpen ? <ChevronUp className="ml-1 h-3.5 w-3.5" /> : <ChevronDown className="ml-1 h-3.5 w-3.5" />}
          </Button>
        </div>

        <div className="grid grid-cols-[84px_1fr] gap-2">
          <Select value={String(value.season)} onValueChange={(item) => update("season", item)}>
            <SelectTrigger className="h-9 text-xs font-bold font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white z-50 border border-slate-200 shadow-xl">
              {seasons.map((year) => (
                <SelectItem key={year} value={String(year)} className="font-mono text-xs font-semibold">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={value.team} onValueChange={(item) => update("team", item)}>
            <SelectTrigger className="h-9 text-xs font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white z-50 border border-slate-200 shadow-xl max-h-[300px]">
              {teams.map((item) => (
                <SelectItem key={item.code} value={item.code}>
                  <span className="flex items-center gap-2">
                    <MemoTeamMark code={item.code} size="sm" />
                    <span className="text-xs font-medium">{item.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isFilterOpen && (
          <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500">開催地</Label>
              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1" role="group" aria-label="開催地フィルター">
                {(["all", "home", "away"] as VenueFilter[]).map((venue) => (
                  <Button
                    key={venue}
                    type="button"
                    size="sm"
                    variant={value.venue === venue ? "default" : "ghost"}
                    className={
                      value.venue === venue
                        ? "flex-1 bg-[#e85d2a] px-2 text-xs text-white shadow-sm hover:bg-[#c84b21]"
                        : "flex-1 px-2 text-xs text-slate-600 hover:bg-[#fff1e8] hover:text-[#a84420]"
                    }
                    onClick={() => update("venue", venue)}
                  >
                    {venueLabel(venue)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-[10px] font-bold text-slate-500">比較するWeek</Label>
                <span className="text-xs font-medium text-slate-500">{value.weeks.length} Week選択中</span>
              </div>
              {weeksLoading ? (
                <div className="h-16 rounded-lg border border-slate-200 bg-slate-50" />
              ) : availableWeeks.length ? (
                <>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 text-xs"
                      onClick={() => onChange({ ...value, weeks: selectableList.map((item) => item.week) })}
                    >
                      全選択
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2.5 text-xs text-slate-500"
                      onClick={() => onChange({ ...value, weeks: [] })}
                    >
                      クリア
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {Array.from({ length: 18 }, (_, index) => index + 1).map((week) => {
                      const info = availableWeeks.find((item) => item.week === week);
                      const isBye = info?.isBye === true;
                      const hasStats = info?.hasStats ?? false;
                      const selectable = Boolean(info && (hasStats || isBye));
                      const selected = value.weeks.includes(week);

                      let titleText = `Week ${week}`;
                      if (!info) {
                        titleText = "開催地条件に一致する試合なし";
                      } else if (isBye) {
                        titleText = `Week ${week} · Bye（試合なし）`;
                      } else if (!hasStats) {
                        titleText = `Week ${week} · 試合未終了（未開催）`;
                      }

                      let buttonClass = "min-w-[40px] h-7 px-1.5 text-xs ";
                      if (selected) {
                        buttonClass += "bg-[#e85d2a] text-white shadow-sm hover:bg-[#c84b21]";
                      } else if (isBye) {
                        buttonClass += "border-dashed border-slate-400 text-slate-500 hover:border-[#e85d2a] hover:bg-[#fff1e8]";
                      } else if (!selectable) {
                        buttonClass += "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200";
                      } else {
                        buttonClass += "hover:border-[#e85d2a] hover:bg-[#fff1e8] hover:text-[#a84420]";
                      }

                      return (
                        <Button
                          key={week}
                          type="button"
                          size="sm"
                          variant={selected ? "default" : "outline"}
                          disabled={!selectable}
                          aria-pressed={selected}
                          title={titleText}
                          className={buttonClass}
                          onClick={() => toggleWeek(week)}
                        >
                          {isBye ? (
                            <>
                              <span>W{week}</span>
                              <span className="ml-0.5 text-[8px] opacity-75">Bye</span>
                            </>
                          ) : (
                            `W${week}`
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
                  選択可能なWeekはありません
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
const MemoSelectPanel = memo(SelectPanel);

function Unavailable({ side, message }: { side: string; message?: string }) {
  return (
    <Card className="border-dashed border-slate-300 bg-slate-50/75">
      <CardContent className="flex min-h-52 flex-col items-center justify-center px-8 py-10 text-center">
        <ShieldAlert className="mb-3 h-7 w-7 text-amber-600" />
        <h3 className="font-semibold text-slate-800">{side}のデータは未取得です</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{message ?? "この選択条件には集計済みの成績がありません。"}</p>
      </CardContent>
    </Card>
  );
}

// ★ 使い方（ヘルプ）モーダルコンポーネント
function GuideModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#e85d2a]/10 text-[#e85d2a]">
              <HelpCircle className="h-4 w-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Fieldline の使い方</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs leading-relaxed text-slate-600">
          <div className="flex gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
            <SlidersHorizontal className="h-5 w-5 shrink-0 text-[#e85d2a]" />
            <div>
              <p className="font-bold text-slate-800 text-sm">1. 条件を選んで合算比較</p>
              <p className="mt-1">
                Week 1〜18から任意の複数Weekや開催地（ホーム / アウェー / 全試合）を自由に選択可能。選択した試合のみを合算・平均して2チームの実力を直接比較します（Bye Weekは分母に含まれません）。
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-2xl bg-amber-50/60 p-3.5 border border-amber-100">
            <BarChart3 className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-bold text-slate-800 text-sm">2. 中央タップでリーグTop 5・Worst 5</p>
              <p className="mt-1">
                中央のスタッツ名（例: <span className="font-semibold text-slate-700">Pass EPA / Play</span> や <span className="font-semibold text-slate-700">3rd Down</span> 等）をタップすると、<strong>左パネルの条件に基づいたリーグ全体のTop 5（上位）およびWorst 5（下位）</strong>をポップアップで確認できます。
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-2xl bg-emerald-50/60 p-3.5 border border-emerald-100">
            <CalendarRange className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold text-slate-800 text-sm">3. チームの選択保存</p>
              <p className="mt-1">
                選んだチームはブラウザに自動保存されるため、次回訪問時も同じ対戦カードからすぐに分析を再開できます。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#101827] px-5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            閉じる
          </Button>
        </div>
      </div>
    </div>
  );
}

// ★ Top 5 / Worst 5 表示モーダルコンポーネント
function RankingModal({
  metric,
  allSummaries,
  leftSummary,
  rightSummary,
  onClose,
}: {
  metric: MetricConfig;
  allSummaries: any[];
  leftSummary: any;
  rightSummary: any;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const validSummaries = useMemo(() => {
    return allSummaries
      .filter((item) => item.games > 0 && item.metrics[metric.key] !== null)
      .sort((a, b) => (a.ranks[metric.key] ?? 999) - (b.ranks[metric.key] ?? 999));
  }, [allSummaries, metric.key]);

  const top5 = useMemo(() => validSummaries.slice(0, 5), [validSummaries]);
  const worst5 = useMemo(() => {
    if (validSummaries.length <= 5) return [];
    return validSummaries.slice(Math.max(5, validSummaries.length - 5));
  }, [validSummaries]);

  const leftRank = leftSummary?.ranks?.[metric.key];
  const rightRank = rightSummary?.ranks?.[metric.key];
  const leftValue = leftSummary?.metrics?.[metric.key];
  const rightValue = rightSummary?.metrics?.[metric.key];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">LEAGUE RANKINGS</span>
              <span className="text-[11px] font-medium text-slate-400">（左パネル選択条件）</span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-slate-900">{metric.label}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 現在の比較チーム状況カード */}
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-2.5 border border-slate-200/80">
          <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-1.5 min-w-0">
              <MemoTeamMark code={leftSummary.team} size="sm" />
              <span className="truncate text-xs font-semibold text-slate-800">{leftSummary.team}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#e85d2a]">#{leftRank ?? "—"}</span>
              <p className="text-[11px] font-medium tabular-nums text-slate-500">{formatMetric(leftValue, metric.format)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-1.5 min-w-0">
              <MemoTeamMark code={rightSummary.team} size="sm" />
              <span className="truncate text-xs font-semibold text-slate-800">{rightSummary.team}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#e85d2a]">#{rightRank ?? "—"}</span>
              <p className="text-[11px] font-medium tabular-nums text-slate-500">{formatMetric(rightValue, metric.format)}</p>
            </div>
          </div>
        </div>

        {/* Top 5 & Worst 5 グリッド */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* TOP 5 */}
          <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/20 p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase">TOP 5 (上位)</span>
              <span className="text-[10px] font-semibold text-emerald-600">BEST</span>
            </div>
            <div className="space-y-1.5">
              {top5.map((item) => {
                const isSelectedTeam = item.team === leftSummary.team || item.team === rightSummary.team;
                return (
                  <div
                    key={item.team}
                    className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 border text-xs transition ${
                      isSelectedTeam
                        ? "border-[#e85d2a] bg-[#fff5f0] shadow-sm font-semibold"
                        : "border-slate-100 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="inline-block min-w-7 rounded bg-emerald-100 px-1 py-0.5 text-center text-[11px] font-bold tabular-nums text-emerald-800">
                        #{item.ranks[metric.key]}
                      </span>
                      <MemoTeamMark code={item.team} size="sm" />
                      <span className="truncate text-slate-800">{item.team}</span>
                    </div>
                    <span className="font-semibold tabular-nums text-slate-900">
                      {formatMetric(item.metrics[metric.key], metric.format)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WORST 5 */}
          <div className="rounded-2xl border border-rose-200/70 bg-rose-50/20 p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[11px] font-bold tracking-wider text-rose-800 uppercase">WORST 5 (下位)</span>
              <span className="text-[10px] font-semibold text-rose-600">BOTTOM</span>
            </div>
            <div className="space-y-1.5">
              {worst5.map((item) => {
                const isSelectedTeam = item.team === leftSummary.team || item.team === rightSummary.team;
                return (
                  <div
                    key={item.team}
                    className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 border text-xs transition ${
                      isSelectedTeam
                        ? "border-[#e85d2a] bg-[#fff5f0] shadow-sm font-semibold"
                        : "border-slate-100 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="inline-block min-w-7 rounded bg-rose-100 px-1 py-0.5 text-center text-[11px] font-bold tabular-nums text-rose-800">
                        #{item.ranks[metric.key]}
                      </span>
                      <MemoTeamMark code={item.team} size="sm" />
                      <span className="truncate text-slate-800">{item.team}</span>
                    </div>
                    <span className="font-semibold tabular-nums text-slate-900">
                      {formatMetric(item.metrics[metric.key], metric.format)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl px-4 text-xs font-semibold"
          >
            閉じる
          </Button>
        </div>
      </div>
    </div>
  );
}

function MetricGroup({
  group,
  left,
  right,
  onSelectMetric,
}: {
  group: (typeof metricGroups)[number];
  left: any;
  right: any;
  onSelectMetric: (metric: MetricConfig) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,.05)]">
      <div className="flex items-center border-b border-slate-100 bg-slate-50/70 px-5 py-2.5">
        <p className="text-[11px] font-bold tracking-[.16em] text-slate-500">{group.title}</p>
      </div>
      <div>
        {group.metrics.map((metric) => {
          const leftValue = left.summary.metrics[metric.key];
          const rightValue = right.summary.metrics[metric.key];
          const leftSuperior = isSuperior(leftValue, rightValue, metric.key);
          const rightSuperior = isSuperior(rightValue, leftValue, metric.key);
          return (
            <div key={metric.key} className="grid min-h-12 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-slate-100 px-5 py-2 last:border-0">
              <div className="text-right">
                <span
                  className={`inline-block rounded-md text-lg font-semibold tabular-nums ${
                    leftSuperior ? "bg-emerald-50 px-1.5 py-0.5 text-emerald-700 ring-1 ring-emerald-200" : "text-slate-900"
                  }`}
                >
                  {formatMetric(leftValue, metric.format)}
                </span>
                <span className="ml-2 text-xs font-medium tabular-nums text-slate-400">#{left.summary.ranks[metric.key] ?? "—"}</span>
              </div>

              <div className="min-w-[8.2rem] text-center">
                <button
                  type="button"
                  onClick={() => onSelectMetric(metric)}
                  className="group inline-flex items-center justify-center rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95"
                  title="タップしてリーグTop5・Worst5を表示"
                >
                  <span className="border-b border-dashed border-slate-300 group-hover:border-slate-600 pb-0.5">
                    {metric.label}
                  </span>
                </button>
              </div>

              <div>
                <span
                  className={`inline-block rounded-md text-lg font-semibold tabular-nums ${
                    rightSuperior ? "bg-emerald-50 px-1.5 py-0.5 text-emerald-700 ring-1 ring-emerald-200" : "text-slate-900"
                  }`}
                >
                  {formatMetric(rightValue, metric.format)}
                </span>
                <span className="ml-2 text-xs font-medium tabular-nums text-slate-400">#{right.summary.ranks[metric.key] ?? "—"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ComparisonTable({
  data,
  onSelectMetric,
}: {
  data: any;
  onSelectMetric: (metric: MetricConfig) => void;
}) {
  const left = data?.left;
  const right = data?.right;
  if (!left?.available || !right?.available)
    return (
      <div className="grid gap-5 lg:grid-cols-2">
        <Unavailable side="左パネル" message={left?.reason} />
        <Unavailable side="右パネル" message={right?.reason} />
      </div>
    );
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5">
        <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5">
          <MemoTeamMark code={left.summary.team} size="sm" />
          <p className="min-w-0 truncate text-xs font-semibold text-slate-900">{left.summary.teamName}</p>
        </div>
        <div className="flex min-w-0 items-center justify-end gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5 text-right">
          <p className="min-w-0 truncate text-xs font-semibold text-slate-900">{right.summary.teamName}</p>
          <MemoTeamMark code={right.summary.team} size="sm" />
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-[0_6px_18px_rgba(15,23,42,.04)]">
        <p className="text-center text-base font-bold tabular-nums text-slate-900">{formatRecord(left.summary.record)}</p>
        <p className="text-[10px] font-bold tracking-[.12em] text-slate-400">勝敗</p>
        <p className="text-center text-base font-bold tabular-nums text-slate-900">{formatRecord(right.summary.record)}</p>
      </div>
      {metricGroups.map((group) => (
        <MetricGroup
          key={group.title}
          group={group}
          left={left}
          right={right}
          onSelectMetric={onSelectMetric}
        />
      ))}
    </div>
  );
}

function ComparisonSkeleton() {
  return (
    <div className="space-y-4" aria-label="比較結果を読み込んでいます" aria-busy="true">
      {[0, 1, 2, 3].map((item) => (
        <section key={item} className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white">
          <div className="h-9 border-b border-slate-100 bg-slate-50/70" />
          <div className="space-y-3 px-5 py-3">
            {[0, 1, 2].map((row) => (
              <div key={row} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="ml-auto h-5 w-20 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                <div className="h-5 w-20 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function Fieldline() {
  const utils = trpc.useUtils();
  const { data: teams = [] } = trpc.fieldline.teams.useQuery(undefined, staticQueryOptions);
  const { data: imports = [], isLoading: seasonsLoading } = trpc.fieldline.seasons.useQuery(undefined, staticQueryOptions);
  const seasons = useMemo(() => {
    const currentYear = Math.max(2026, new Date().getFullYear());
    const selectableYears = Array.from({ length: currentYear - 2024 }, (_, index) => 2025 + index);
    return Array.from(new Set([...selectableYears, ...imports.map((item) => item.season)])).sort((a, b) => b - a);
  }, [imports]);
  const [left, setLeft] = useState<Selection>(() => ({ season: 2026, team: getStoredTeam("left", "DAL"), weeks: [], venue: "all" }));
  const [right, setRight] = useState<Selection>(() => ({ season: 2026, team: getStoredTeam("right", "SEA"), weeks: [], venue: "all" }));
  const freshnessInput = useMemo(() => ({ seasons: [left.season] }), [left.season]);
  const freshness = trpc.fieldline.freshness.useQuery(freshnessInput, { ...weekQueryOptions, refetchInterval: 5 * 60_000 });
  const leftWeekInput = useMemo(() => ({ season: left.season, team: left.team, venue: left.venue }), [left.season, left.team, left.venue]);
  const rightWeekInput = useMemo(() => ({ season: right.season, team: right.team, venue: right.venue }), [right.season, right.team, right.venue]);
  const leftWeeksQuery = trpc.fieldline.weeks.useQuery(leftWeekInput, weekQueryOptions);
  const rightWeeksQuery = trpc.fieldline.weeks.useQuery(rightWeekInput, weekQueryOptions);
  const leftWeeks = leftWeeksQuery.data ?? [];
  const rightWeeks = rightWeeksQuery.data ?? [];
  const leftInitialWeeks = useRef(true);
  const rightInitialWeeks = useRef(true);
  const leftVenueChange = useRef(false);
  const rightVenueChange = useRef(false);
  const prefetched = useRef(false);

  // ★ モーダル状態管理
  const [selectedMetric, setSelectedMetric] = useState<MetricConfig | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ leftTeam: left.team, rightTeam: right.team }));
    } catch {
      /* storage is optional */
    }
  }, [left.team, right.team]);

  useEffect(() => {
    if (!seasons.includes(left.season)) setLeft((item) => ({ ...item, season: seasons[0] ?? 2026 }));
    if (!seasons.includes(right.season)) setRight((item) => ({ ...item, season: seasons[0] ?? 2026 }));
  }, [seasons, left.season, right.season]);

  useEffect(() => {
    if (!leftWeeksQuery.isFetching && leftWeeks.length) {
      const selectableList = leftWeeks.filter((item) => item.hasStats || item.isBye);
      const playable = new Set(selectableList.map((item) => item.week));
      let weeks = left.weeks.filter((week) => playable.has(week));
      if (leftInitialWeeks.current) {
        const playedWeeks = leftWeeks.filter((item) => item.hasStats).map((item) => item.week);
        weeks = playedWeeks.length ? playedWeeks : selectableList.map((item) => item.week);
        leftInitialWeeks.current = false;
      } else if (!weeks.length && leftVenueChange.current) {
        weeks = [leftWeeks.find((item) => item.hasStats)?.week ?? leftWeeks.find((item) => !item.isBye)?.week ?? leftWeeks[0]!.week];
      }
      if (weeks.join(",") !== left.weeks.join(",")) setLeft((item) => ({ ...item, weeks }));
      leftVenueChange.current = false;
    }
  }, [leftWeeks, leftWeeksQuery.isFetching, left.weeks]);

  useEffect(() => {
    if (!rightWeeksQuery.isFetching && rightWeeks.length) {
      const selectableList = rightWeeks.filter((item) => item.hasStats || item.isBye);
      const playable = new Set(selectableList.map((item) => item.week));
      let weeks = right.weeks.filter((week) => playable.has(week));
      if (rightInitialWeeks.current) {
        const playedWeeks = rightWeeks.filter((item) => item.hasStats).map((item) => item.week);
        weeks = playedWeeks.length ? playedWeeks : selectableList.map((item) => item.week);
        rightInitialWeeks.current = false;
      } else if (!weeks.length && rightVenueChange.current) {
        weeks = [rightWeeks.find((item) => item.hasStats)?.week ?? rightWeeks.find((item) => !item.isBye)?.week ?? rightWeeks[0]!.week];
      }
      if (weeks.join(",") !== right.weeks.join(",")) setRight((item) => ({ ...item, weeks }));
      rightVenueChange.current = false;
    }
  }, [rightWeeks, rightWeeksQuery.isFetching, right.weeks]);

  useEffect(() => {
    if (prefetched.current || !leftWeeks.length || !rightWeeks.length) return;
    prefetched.current = true;
    const leftPlayable = leftWeeks.filter((item) => item.hasStats).map((item) => item.week);
    const rightPlayable = rightWeeks.filter((item) => item.hasStats).map((item) => item.week);
    void utils.fieldline.compare.prefetch({
      left: { ...left, weeks: left.weeks.length ? left.weeks : leftPlayable.length ? leftPlayable : leftWeeks.map((item) => item.week) },
      right: { ...right, weeks: right.weeks.length ? right.weeks : rightPlayable.length ? rightPlayable : rightWeeks.map((item) => item.week) },
    });
  }, [left, leftWeeks, right, rightWeeks, utils.fieldline.compare]);

  const deferredLeft = useDebouncedSelection(left);
  const deferredRight = useDebouncedSelection(right);
  const compareInput = useMemo(() => ({ left: deferredLeft, right: deferredRight }), [deferredLeft, deferredRight]);
  const missingWeeks = !left.weeks.length || !right.weeks.length;
  const selectionsInSync = deferredLeft === left && deferredRight === right;
  const leftReady = !leftWeeksQuery.isFetching && left.weeks.every((week) => leftWeeks.some((item) => item.week === week));
  const rightReady = !rightWeeksQuery.isFetching && right.weeks.every((week) => rightWeeks.some((item) => item.week === week));
  const comparison = trpc.fieldline.compare.useQuery(compareInput, {
    ...comparisonQueryOptions,
    enabled: selectionsInSync && !missingWeeks && leftReady && rightReady,
  });
  const pending = !missingWeeks && (!selectionsInSync || comparison.isLoading || comparison.isFetching);
  const noWeeks = !leftWeeksQuery.isLoading && !rightWeeksQuery.isLoading && (!leftWeeks.length || !rightWeeks.length);
  const onLeftVenue = useCallback((venue: VenueFilter) => {
    leftVenueChange.current = true;
    setLeft((item) => ({ ...item, venue, weeks: [] }));
  }, []);
  const onRightVenue = useCallback((venue: VenueFilter) => {
    rightVenueChange.current = true;
    setRight((item) => ({ ...item, venue, weeks: [] }));
  }, []);
  const lastUpdated = freshness.data?.[0]?.lastUpdatedAt;

  return (
    <div className="fieldline-hub-surface min-h-screen text-slate-900">
      <EmbeddedAppNav current="FIELDLINE" />
      
      {/* ★ ヘッダー：左端に「使い方」ボタンを配置 */}
      <header className="border-b border-white/10 bg-[#101827] text-white">
        <div className="container relative flex min-h-20 items-center justify-center">
          {/* 使い方ボタン（ヘッダー左側に配置） */}
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1.5 sm:px-3 text-xs font-semibold text-slate-200 backdrop-blur-sm transition hover:bg-white/20 hover:text-white shadow-sm"
            title="使い方を見る"
          >
            <HelpCircle className="h-3.5 w-3.5 text-[#f2bc62]" />
            <span className="hidden sm:inline">使い方</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#f2bc62] to-[#e85d2a] shadow-lg">
              <Trophy className="h-5 w-5 text-[#101827]" />
            </div>
            <div>
              <h1 className="font-display text-xl tracking-tight">Fieldline</h1>
              <p className="text-[10px] font-medium tracking-[.18em] text-slate-400">NFL TEAM COMPARATOR</p>
            </div>
          </div>
        </div>
      </header>

      {formatLastUpdatedAt(lastUpdated) && (
        <div className="container flex h-6 items-center justify-end">
          <p className="text-right text-[10px] text-slate-400">
            最終更新: <time dateTime={new Date(lastUpdated!).toISOString()}>{formatLastUpdatedAt(lastUpdated)}</time>
          </p>
        </div>
      )}

      <main className="container mx-auto max-w-6xl px-4 pt-1 pb-6 sm:px-6 sm:pt-2 sm:pb-8">
        {seasonsLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-slate-500">シーズン情報を読み込んでいます。</CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <MemoSelectPanel
              title="LEFT COMPARISON"
              side="left"
              value={left}
              onChange={setLeft}
              onVenueChange={onLeftVenue}
              onDatasetChange={() => {
                leftInitialWeeks.current = true;
              }}
              teams={teams}
              seasons={seasons}
              availableWeeks={leftWeeks}
              weeksLoading={leftWeeksQuery.isLoading}
            />
            <div className="flex items-center gap-3 px-2">
              <Separator className="flex-1" />
              <span className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white shadow-sm">
                <ArrowLeftRight className="h-4 w-4 text-slate-500" />
              </span>
              <Separator className="flex-1" />
            </div>
            <MemoSelectPanel
              title="RIGHT COMPARISON"
              side="right"
              value={right}
              onChange={setRight}
              onVenueChange={onRightVenue}
              onDatasetChange={() => {
                rightInitialWeeks.current = true;
              }}
              teams={teams}
              seasons={seasons}
              availableWeeks={rightWeeks}
              weeksLoading={rightWeeksQuery.isLoading}
            />
          </div>
        )}

        <section className="mt-8">
          <div className="mb-3 flex justify-end">
            {comparison.data?.left.available && comparison.data?.right.available && (
              <p className="text-xs text-slate-400">
                {comparison.data.left.summary.games} games <span className="mx-1">/</span> {comparison.data.right.summary.games}
              </p>
            )}
          </div>
          {noWeeks ? (
            <Card className="border-dashed border-slate-300 bg-slate-50/75">
              <CardContent className="py-12 text-center">
                <p className="text-sm font-semibold text-slate-700">選択した年には、比較可能なレギュラーシーズンWeekがまだありません。</p>
                <p className="mt-2 text-sm text-slate-500">試合データの公開・取込後に、Week選択肢が自動的に表示されます。</p>
              </CardContent>
            </Card>
          ) : missingWeeks ? (
            <Card className="border-dashed border-slate-300 bg-slate-50/75">
              <CardContent className="py-12 text-center text-sm text-slate-500">
                左右それぞれで比較するWeekを1つ以上選択してください。
              </CardContent>
            </Card>
          ) : pending ? (
            <ComparisonSkeleton />
          ) : (
            <ComparisonTable
              data={comparison.data}
              onSelectMetric={(metric) => setSelectedMetric(metric)}
            />
          )}
        </section>
      </main>

      {/* ★ 使い方ガイドモーダル */}
      {isGuideOpen && <GuideModal onClose={() => setIsGuideOpen(false)} />}

      {/* ★ Top 5 / Worst 5 モーダル */}
      {selectedMetric && comparison.data?.left.available && (
        <RankingModal
          metric={selectedMetric}
          allSummaries={comparison.data.left.allSummaries ?? []}
          leftSummary={comparison.data.left.summary}
          rightSummary={comparison.data.right?.available ? comparison.data.right.summary : null}
          onClose={() => setSelectedMetric(null)}
        />
      )}
    </div>
  );
}
