import { CalendarDays, ChevronRight, CircleAlert, ListOrdered, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getTeamByCode, nflTeams, type FavoriteTeam } from "@/lib/nflTeams";

export type LeagueDashboard = {
  standings: Array<{ teamCode: string; wins: number; losses: number; ties: number; pct: string; pointsFor: number | null; pointsAgainst: number | null; sourceUrl: string; fetchedAt: Date }>;
  results: Array<{ id: number; awayTeamCode: string; homeTeamCode: string; awayScore: number | null; homeScore: number | null; gameState: string; gameUrl: string; sourceUrl: string; fetchedAt: Date }>;
  calendar: Array<{ id: number; teamCode: string; opponentCode: string; homeAway: "home" | "away"; seasonPhase: "preseason" | "regular" | "postseason"; weekLabel: string | null; kickoffAt: Date; broadcast: string | null; sourceUrl: string }>;
  lastUpdatedAt?: Date;
};

function sourceTime(value?: Date) {
  return value ? new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tokyo" }).format(new Date(value)) : "—";
}

function gameLabel(game: LeagueDashboard["calendar"][number]) {
  const favorite = getTeamByCode(game.teamCode);
  const opponent = getTeamByCode(game.opponentCode);
  return `${favorite?.name ?? game.teamCode} ${game.homeAway === "away" ? "at" : "vs."} ${opponent?.name ?? game.opponentCode}`;
}

function weekKey(game: LeagueDashboard["calendar"][number]) {
  return `${game.seasonPhase}:${game.weekLabel ?? "SCHEDULE"}`;
}

function weekText(game: LeagueDashboard["calendar"][number]) {
  const prefix = game.seasonPhase === "preseason" ? "PRE" : game.seasonPhase === "postseason" ? "POST" : "REG";
  return `${prefix} ${game.weekLabel?.replace(/WEEK\s*/i, "W") ?? "SCHEDULE"}`;
}

export function OfficialLeagueDashboard({ favorite, dashboard, loading, spoilerMode }: { favorite: FavoriteTeam; dashboard?: LeagueDashboard; loading: boolean; spoilerMode: boolean }) {
  const divisionTeams = useMemo(() => nflTeams.filter((team) => team.conference === favorite.conference && team.division === favorite.division), [favorite]);
  const divisionStandings = useMemo(() => divisionTeams.map((team) => ({ team, row: dashboard?.standings.find((standing) => standing.teamCode === team.code) })).sort((a, b) => (b.row?.wins ?? -1) - (a.row?.wins ?? -1) || (a.row?.losses ?? 99) - (b.row?.losses ?? 99) || a.team.name.localeCompare(b.team.name)), [dashboard, divisionTeams]);
  const weeks = useMemo(() => {
    const seen = new Map<string, LeagueDashboard["calendar"][number]>();
    dashboard?.calendar.forEach((game) => { if (!seen.has(weekKey(game))) seen.set(weekKey(game), game); });
    return Array.from(seen.values());
  }, [dashboard]);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  useEffect(() => { if (!selectedWeek && weeks[0]) setSelectedWeek(weekKey(weeks[0])); }, [selectedWeek, weeks]);
  const weekGames = useMemo(() => dashboard?.calendar.filter((game) => weekKey(game) === selectedWeek).sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime()) ?? [], [dashboard, selectedWeek]);
  const resultGames = useMemo(() => {
    const favoriteGames = dashboard?.results.filter((game) => game.awayTeamCode === favorite.code || game.homeTeamCode === favorite.code) ?? [];
    return (favoriteGames.length ? favoriteGames : dashboard?.results ?? []).slice(0, 3);
  }, [dashboard, favorite]);

  return <section id="league" data-layout-scope="league-dashboard" className="scroll-mt-24 space-y-3"><div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-[#64748b]"><span className="text-[#10213a]">05</span><span>LEAGUE DESK</span><span className="h-px flex-1 bg-[#d9d5cc]" /></div>
    <div className="grid gap-3 lg:grid-cols-[.9fr_1.1fr]">
      <article className="clip-note border border-[#ded8cc] bg-white p-3 shadow-[0_10px_30px_rgba(34,42,53,.05)]"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[9px] font-bold tracking-[.14em] text-[#64748b]">NFL OFFICIAL</p><h2 className="mt-1 font-display text-xl font-extrabold tracking-wide">DIVISION STANDINGS</h2><p className="mt-1 text-[10px] text-[#687587]">{favorite.conference} {favorite.division.toUpperCase()} · UPDATED {sourceTime(dashboard?.lastUpdatedAt)} JST</p></div><ListOrdered className="h-5 w-5 text-[#e85d2a]" /></div>{loading ? <p className="py-5 text-center font-mono text-[10px] text-[#64748b]">LOADING OFFICIAL STANDINGS…</p> : divisionStandings.some((item) => item.row) ? <div className="mt-3 divide-y divide-[#eeeae1]">{divisionStandings.map(({ team, row }, index) => <div key={team.code} className={`grid grid-cols-[18px_1fr_auto] items-center gap-2 py-2.5 ${team.code === favorite.code ? "bg-[#fff8ed] -mx-1 px-1.5" : ""}`}><span className="font-mono text-[10px] text-[#64748b]">{index + 1}</span><p className="truncate text-[12px] font-bold">{team.name}</p><p className="font-mono text-[11px] font-bold">{row ? `${row.wins}-${row.losses}${row.ties ? `-${row.ties}` : ""}` : "—"}</p></div>)}</div> : <div className="mt-3 border border-dashed border-[#d7d1c4] bg-[#fffdf8] p-3 text-[11px] leading-5 text-[#687587]"><CircleAlert className="mr-1 inline h-3.5 w-3.5 text-[#e85d2a]" />NFL公式順位表の初回同期を待っています。</div>}<a href="https://www.nfl.com/standings" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold underline decoration-[#e85d2a] decoration-2 underline-offset-3">OFFICIAL STANDINGS <ChevronRight className="h-3 w-3" /></a></article>
      <article className="memo-slip border border-[#ded8cc] bg-[#fffdf8] p-3 shadow-[0_10px_30px_rgba(34,42,53,.05)]"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[9px] font-bold tracking-[.14em] text-[#64748b]">OFFICIAL SCORES</p><h2 className="mt-1 font-display text-xl font-extrabold tracking-wide">LATEST RESULTS</h2></div><Trophy className="h-5 w-5 text-[#e85d2a]" /></div>{loading ? <p className="py-5 text-center font-mono text-[10px] text-[#64748b]">LOADING OFFICIAL SCORES…</p> : resultGames.length ? <div className="mt-3 divide-y divide-[#e9e3d6]">{resultGames.map((game) => { const away = getTeamByCode(game.awayTeamCode); const home = getTeamByCode(game.homeTeamCode); return <a key={game.id} href={game.gameUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 py-2.5"><div className="min-w-0 flex-1 text-[12px] font-bold"><p className="truncate">{away?.name ?? game.awayTeamCode}</p><p className="mt-0.5 truncate">{home?.name ?? game.homeTeamCode}</p></div><div className="text-right"><p className="font-mono text-[12px] font-bold">{spoilerMode ? "—" : `${game.awayScore ?? "—"} - ${game.homeScore ?? "—"}`}</p><p className="mt-0.5 font-mono text-[9px] text-[#64748b]">{spoilerMode ? "RESULT HIDDEN" : game.gameState}</p></div></a>; })}</div> : <p className="mt-3 border border-dashed border-[#d7d1c4] bg-white p-3 text-[11px] leading-5 text-[#687587]">NFL公式スコアの初回同期を待っています。</p>}<a href="https://www.nfl.com/scores" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold underline decoration-[#e85d2a] decoration-2 underline-offset-3">OFFICIAL SCORES <ChevronRight className="h-3 w-3" /></a></article>
    </div>
    <article className="border border-[#ded8cc] bg-white p-3 shadow-[0_10px_30px_rgba(34,42,53,.05)]"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[9px] font-bold tracking-[.14em] text-[#64748b]">NFL OFFICIAL SCHEDULE</p><h2 className="mt-1 font-display text-xl font-extrabold tracking-wide">WEEKLY CALENDAR</h2></div><CalendarDays className="h-5 w-5 text-[#e85d2a]" /></div>{loading ? <p className="py-5 text-center font-mono text-[10px] text-[#64748b]">LOADING OFFICIAL CALENDAR…</p> : weeks.length ? <><div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">{weeks.map((game) => <button key={weekKey(game)} onClick={() => setSelectedWeek(weekKey(game))} className={`shrink-0 border px-2.5 py-1.5 font-mono text-[10px] font-bold ${selectedWeek === weekKey(game) ? "border-[#10213a] bg-[#10213a] text-white" : "border-[#d7d1c4] bg-[#fffdf8] text-[#526173]"}`}>{weekText(game)}</button>)}</div><div className="mt-3 grid gap-2 sm:grid-cols-2">{weekGames.slice(0, 18).map((game) => <a key={game.id} href={game.sourceUrl} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-2 border-l-2 border-[#e85d2a] bg-[#fffdf8] px-3 py-2.5"><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-bold">{gameLabel(game)}</p><p className="mt-0.5 text-[10px] text-[#687587]">{new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tokyo" }).format(new Date(game.kickoffAt))} JST</p></div>{game.broadcast ? <span className="font-mono text-[9px] text-[#64748b]">{game.broadcast}</span> : null}</a>)}</div></> : <p className="mt-3 border border-dashed border-[#d7d1c4] bg-[#fffdf8] p-3 text-[11px] leading-5 text-[#687587]">NFL公式週別日程の初回同期を待っています。</p>}<a href="https://www.nfl.com/schedules" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold underline decoration-[#e85d2a] decoration-2 underline-offset-3">OFFICIAL WEEKLY SCHEDULE <ChevronRight className="h-3 w-3" /></a></article>
  </section>;
}
