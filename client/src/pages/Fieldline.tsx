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
              <div className="flex rounded-lg border border-slate-200 bg-slate
