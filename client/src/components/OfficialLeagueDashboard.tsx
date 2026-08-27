import { BarChart3, CalendarDays, ChevronRight, CircleAlert, ListOrdered, Trophy } from "lucide-react";
import React, { useMemo, useState } from "react";
import { nflTeams, officialTeamScheduleUrl, type FavoriteTeam } from "@/lib/nflTeams";
import { abbreviatedMatchup, getFavoriteLatestResults, getFavoriteSchedule, getNextSevenDayGames, seasonWeekLabel, type LeagueCalendarGame } from "@/lib/leagueCalendar";
import { daznWatchTarget } from "@/lib/daznWatch";
import { compactVenue } from "@/lib/gameVenue";
import { hasIndividualOfficialHighlight } from "@/lib/nflHighlights";

export type LeagueDashboard = {
  standings: Array<{ teamCode: string; wins: number; losses: number; ties: number; pct: string; pointsFor: number | null; pointsAgainst: number | null; sourceUrl: string; fetchedAt: Date }>;
  results: Array<{ id: number; weekLabel: string | null; awayTeamCode: string; homeTeamCode: string; awayScore: number | null; homeScore: number | null; gameState: string; gameDate: string | null; kickoffAt: Date | null; venue: string | null; gameUrl: string; nflHighlightUrl: string | null; daznUrl: string | null; sourceUrl: string; fetchedAt: Date }>;
  calendar: LeagueCalendarGame[];
  lastUpdatedAt?: Date;
};

function sourceTime(value?: Date) {
  return value ? new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tokyo" }).format(new Date(value)) : "—";
}

function calendarDate(value: Date) {
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tokyo" }).format(new Date(value));
}

function calendarDayKey(value: Date) {
  return new Intl.DateTimeFormat("sv-SE", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Tokyo" }).format(new Date(value));
}

function calendarDayLabel(value: Date) {
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", weekday: "short", timeZone: "Asia/Tokyo" }).format(new Date(value));
}

export function jstResultDate(value: Date | null, officialDate?: string | null) {
  const date = value ?? (officialDate ? new Date(`${officialDate}T12:00:00.000Z`) : null);
  if (!date || Number.isNaN(new Date(date).getTime())) return null;
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", weekday: "short", timeZone: "Asia/Tokyo" }).format(new Date(date));
}

export function OfficialLatestResults({ favorite, dashboard, loading, spoilerMode, onOpenGameStats, onWarmGameStats }: { favorite: FavoriteTeam; dashboard?: Pick<LeagueDashboard, "results" | "lastUpdatedAt">; loading: boolean; spoilerMode: boolean; onOpenGameStats?: (gameUrl: string) => void; onWarmGameStats?: (gameUrl: string) => void }) {
  const resultGames = useMemo(() => {
    return getFavoriteLatestResults(dashboard?.results ?? [], favorite.code);
  }, [dashboard, favorite]);
  const footerHighlightGame = resultGames.find((game) => hasIndividualOfficialHighlight(game.nflHighlightUrl));
  const footerHighlightAway = footerHighlightGame ? nflTeams.find((team) => team.code === footerHighlightGame.awayTeamCode) : undefined;
  const footerHighlightHome = footerHighlightGame ? nflTeams.find((team) => team.code === footerHighlightGame.homeTeamCode) : undefined;

  return (
    <section id="results" data-layout-scope="latest-results" className="scroll-mt-24">
      <div className="mb-1.5 flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-[#64748b]">
        <span className="text-[#10213a]">01</span><span>LATEST RESULTS</span><span className="h-px flex-1 bg-[#d9d5cc]" />
      </div>
      <div className="rounded-[2px_14px_2px_14px] border border-[#ded8cc] bg-[#fffdf8] px-3 py-2 shadow-[0_10px_30px_rgba(34,42,53,.05)]">
        <div>
          <p className="font-mono text-[9px] font-bold tracking-[.14em] text-[#64748b]">OFFICIAL SCORES</p>
          <h2 className="mt-0.5 font-display text-[19px] font-extrabold leading-none tracking-wide">LATEST RESULTS</h2>
        </div>
        {loading ? (
          <p className="py-2.5 text-center font-mono text-[10px] text-[#64748b]">LOADING OFFICIAL SCORES…</p>
        ) : resultGames.length ? (
          <div className="mt-1.5 divide-y divide-[#e9e3d6]">
            {resultGames.map((game) => {
              const away = nflTeams.find((team) => team.code === game.awayTeamCode);
              const home = nflTeams.find((team) => team.code === game.homeTeamCode);
              const hasOfficialScore = typeof game.awayScore === "number" && typeof game.homeScore === "number";
              const awayScore = game.awayScore ?? 0;
              const homeScore = game.homeScore ?? 0;
              const awayWon = !spoilerMode && hasOfficialScore && awayScore > homeScore;
              const homeWon = !spoilerMode && hasOfficialScore && homeScore > awayScore;
              const gameDate = jstResultDate(game.kickoffAt, game.gameDate);
              const hasExactKickoff = Boolean(game.kickoffAt);
              const venue = compactVenue(game.venue);
              const resultMeta = [game.weekLabel ?? "OFFICIAL", !spoilerMode && game.gameState !== "FINAL" ? game.gameState : null].filter(Boolean).join(" · ");
              return (
                <div key={game.id} className="grid min-h-[84px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 py-7 pb-2.5">
                  <a href={game.gameUrl} target="_blank" rel="noreferrer" className="min-w-0 self-center overflow-visible text-[13px] leading-[1.45]">
                    <p className={`truncate pb-px leading-[1.45] ${awayWon ? "font-extrabold text-[#a84420]" : "font-bold"}`}>{away?.name ?? game.awayTeamCode}</p>
                    <p className={`mt-1 truncate pb-px leading-[1.45] ${homeWon ? "font-extrabold text-[#a84420]" : "font-bold"}`}>@ {home?.name ?? game.homeTeamCode}</p>
                  </a>
                  <div className="relative min-w-[106px] self-center text-right">
                    <div className="absolute bottom-full right-0 mb-1.5 w-[164px] text-right">
                      {gameDate ? <p className="font-mono text-[8px] font-bold leading-[10px] tracking-[.08em] text-[#526173]">{hasExactKickoff ? "GAME DATE" : "OFFICIAL DATE"} · {gameDate}{hasExactKickoff ? " JST" : ""}</p> : null}
                      <p className="font-mono text-[8px] font-bold leading-[10px] tracking-[.08em] text-[#64748b]">{resultMeta}</p>
                      {venue ? <p className="truncate font-mono text-[8px] font-bold leading-[10px] tracking-[.08em] text-[#7a6557]" title={game.venue ?? undefined}>VENUE · {venue}</p> : null}
                    </div>
                    <p className="font-mono text-[26px] font-black leading-[.85] tracking-[-.06em]">{spoilerMode ? "—" : <><span className={awayWon ? "text-[#a84420]" : undefined}>{game.awayScore ?? "—"}</span><span> - </span><span className={homeWon ? "text-[#a84420]" : undefined}>{game.homeScore ?? "—"}</span></>}</p>
                    {!spoilerMode && game.gameState === "FINAL" && onOpenGameStats ? <button type="button" onClick={() => onOpenGameStats(game.gameUrl)} onPointerEnter={() => onWarmGameStats?.(game.gameUrl)} onPointerDown={() => onWarmGameStats?.(game.gameUrl)} onFocus={() => onWarmGameStats?.(game.gameUrl)} className="mt-2 inline-flex h-3 items-center gap-1 font-mono text-[8px] font-black tracking-[.06em] text-[#a84420] underline decoration-[#e85d2a] decoration-2 underline-offset-2"><BarChart3 className="h-3 w-3" /> GAME STATS</button> : game.gameState === "FINAL" && onOpenGameStats ? <span aria-hidden="true" className="mt-2 block h-3" /> : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-1.5 border border-dashed border-[#d7d1c4] bg-white p-2 text-[11px] leading-5 text-[#687587]">NFL公式スコアの初回同期を待っています。</p>
        )}
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <a href="https://www.nfl.com/scores" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold underline decoration-[#e85d2a] decoration-2 underline-offset-3">OFFICIAL SCORES <ChevronRight className="h-3 w-3" /></a>
          {!loading && resultGames.length ? footerHighlightGame ? (
            <a href={footerHighlightGame.nflHighlightUrl ?? "https://www.nfl.com/videos/"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 whitespace-nowrap font-mono text-[8px] font-bold tracking-[.06em] text-[#a84420] underline decoration-[#e85d2a] decoration-2 underline-offset-2" aria-label={`${footerHighlightAway?.name ?? footerHighlightGame.awayTeamCode}対${footerHighlightHome?.name ?? footerHighlightGame.homeTeamCode}のNFL公式ハイライトを開く`}>WATCH HIGHLIGHTS <ChevronRight className="h-3 w-3" /></a>
          ) : <span className="font-mono text-[8px] font-bold tracking-[.06em] text-[#8a96a5]">HIGHLIGHTS · 準備中</span> : <span aria-hidden="true" />}
        </div>
      </div>
    </section>
  );
}

export function OfficialLeagueDashboard({ favorite, dashboard, loading, calendarLoading = loading }: { favorite: FavoriteTeam; dashboard?: LeagueDashboard; loading: boolean; calendarLoading?: boolean }) {
  const [calendarView, setCalendarView] = useState<"team" | "week">("team");
  const divisionTeams = useMemo(() => nflTeams.filter((team) => team.conference === favorite.conference && team.division === favorite.division), [favorite]);
  const divisionStandings = useMemo(() => divisionTeams.map((team) => ({ team, row: dashboard?.standings.find((standing) => standing.teamCode === team.code) })).sort((a, b) => (b.row?.wins ?? -1) - (a.row?.wins ?? -1) || (a.row?.losses ?? 99) - (b.row?.losses ?? 99) || a.team.name.localeCompare(b.team.name)), [dashboard, divisionTeams]);
  const teamSchedule = useMemo(() => getFavoriteSchedule(dashboard?.calendar ?? [], favorite.code), [dashboard, favorite]);
  const nextWeekGames = useMemo(() => getNextSevenDayGames(dashboard?.calendar ?? [], new Date()), [dashboard]);
  const calendarGames = calendarView === "team" ? teamSchedule : nextWeekGames;
  const groupedWeekGames = useMemo(() => {
    const groups = new Map<string, { label: string; games: LeagueCalendarGame[] }>();
    for (const game of nextWeekGames) {
      const key = calendarDayKey(game.kickoffAt);
      const group = groups.get(key) ?? { label: calendarDayLabel(game.kickoffAt), games: [] };
      group.games.push(game);
      groups.set(key, group);
    }
    return Array.from(groups.values());
  }, [nextWeekGames]);
  const watchTarget = typeof navigator === "undefined" ? "_blank" : daznWatchTarget(navigator.userAgent);
  const calendarCard = (game: LeagueCalendarGame) => {
    const teamScheduleLink = calendarView === "team";
    const href = teamScheduleLink ? officialTeamScheduleUrl(favorite.code) : (game.daznUrl ?? game.sourceUrl);
    const target = teamScheduleLink ? "_blank" : (game.daznUrl ? watchTarget : "_blank");
    const isHomeTeamGame = teamScheduleLink && game.homeAway === "home";
    const isAwayTeamGame = teamScheduleLink && game.homeAway === "away";
    const favoriteVenue = game.teamCode === favorite.code ? game.homeAway : game.opponentCode === favorite.code ? game.homeAway === "home" ? "away" : "home" : undefined;
    const isFavoriteHomeGame = !teamScheduleLink && favoriteVenue === "home";
    const isFavoriteAwayGame = !teamScheduleLink && favoriteVenue === "away";
    const usesFavoriteBrand = isHomeTeamGame || isFavoriteHomeGame;
    const usesAwayGray = isAwayTeamGame || isFavoriteAwayGame;
    const venueStyle = usesFavoriteBrand ? "border-l-4" : usesAwayGray ? "border-[#9ca3af] bg-[#f3f4f6]" : "border-[#d7d1c4] bg-[#fffdf8]";
    const brandStyle = usesFavoriteBrand ? { backgroundColor: favorite.brand.primary, borderLeftColor: favorite.brand.accent, color: favorite.brand.onPrimary } : undefined;
    return <a key={game.id} href={href} target={target} rel="noreferrer" style={brandStyle} className={`min-w-0 border-l-2 px-2 py-2 ${venueStyle}`}><p className="truncate font-mono text-[11px] font-bold">{abbreviatedMatchup(game)}</p><p className={`mt-0.5 truncate text-[9px] ${usesFavoriteBrand ? "opacity-80" : "text-[#5b6472]"}`}>{game.liveScoreboardFallback ? "LIVE · OFFICIAL SCOREBOARD" : `${calendarDate(game.kickoffAt)} JST`}</p><p className={`mt-1 truncate font-mono text-[9px] font-bold tracking-[.04em] ${usesFavoriteBrand ? "opacity-90" : "text-[#4b5563]"}`}>{seasonWeekLabel(game)}{game.broadcast ? ` · ${game.broadcast}` : ""}</p></a>;
  };

  return <section id="league" data-layout-scope="league-dashboard" className="scroll-mt-24 space-y-3"><div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-[#64748b]"><span className="text-[#10213a]">04</span><span>LEAGUE DESK</span><span className="h-px flex-1 bg-[#d9d5cc]" /></div>
    <article className="clip-note border border-[#ded8cc] bg-white p-3 shadow-[0_10px_30px_rgba(34,42,53,.05)]"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[9px] font-bold tracking-[.14em] text-[#64748b]">NFL OFFICIAL</p><h2 className="mt-1 font-display text-xl font-extrabold tracking-wide">DIVISION STANDINGS</h2><p className="mt-1 text-[10px] text-[#687587]">{favorite.conference} {favorite.division.toUpperCase()} · UPDATED {sourceTime(dashboard?.lastUpdatedAt)} JST</p></div><ListOrdered className="h-5 w-5 text-[#e85d2a]" /></div>{loading ? <p className="py-5 text-center font-mono text-[10px] text-[#64748b]">LOADING OFFICIAL STANDINGS…</p> : divisionStandings.some((item) => item.row) ? <div className="mt-3 divide-y divide-[#eeeae1]">{divisionStandings.map(({ team, row }, index) => <div key={team.code} className={`grid grid-cols-[18px_1fr_auto] items-center gap-2 py-2.5 ${team.code === favorite.code ? "bg-[#fff8ed]" : ""}`}><span className="font-mono text-[10px] text-[#64748b]">{index + 1}</span><p className="truncate text-[12px] font-bold">{team.name}</p><p className="font-mono text-[11px] font-bold">{row ? `${row.wins}-${row.losses}${row.ties ? `-${row.ties}` : ""}` : "—"}</p></div>)}</div> : <div className="mt-3 border border-dashed border-[#d7d1c4] bg-[#fffdf8] p-3 text-[11px] leading-5 text-[#687587]"><CircleAlert className="mr-1 inline h-3.5 w-3.5 text-[#e85d2a]" />NFL公式順位表の初回同期を待っています。</div>}<a href="https://www.nfl.com/standings/league/2026/REG" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold underline decoration-[#e85d2a] decoration-2 underline-offset-3">OFFICIAL STANDINGS <ChevronRight className="h-3 w-3" /></a></article>
    <article className="border border-[#ded8cc] bg-white p-3 shadow-[0_10px_30px_rgba(34,42,53,.05)]"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[9px] font-bold tracking-[.14em] text-[#64748b]">NFL OFFICIAL SCHEDULE</p><h2 className="mt-1 font-display text-xl font-extrabold tracking-wide">SCHEDULE DESK</h2></div><CalendarDays className="h-5 w-5 text-[#e85d2a]" /></div>{calendarLoading ? <p className="py-5 text-center font-mono text-[10px] text-[#64748b]">LOADING OFFICIAL CALENDAR…</p> : <><div className="mt-3 grid grid-cols-2 gap-1.5" role="tablist" aria-label="Schedule view"><button role="tab" aria-selected={calendarView === "team"} onClick={() => setCalendarView("team")} className={`border px-2 py-2 font-mono text-[9px] font-bold leading-3 ${calendarView === "team" ? "border-[#10213a] bg-[#10213a] text-white" : "border-[#d7d1c4] bg-[#fffdf8] text-[#526173]"}`}>MY TEAM<br />FULL SCHEDULE</button><button role="tab" aria-selected={calendarView === "week"} onClick={() => setCalendarView("week")} className={`border px-2 py-2 font-mono text-[9px] font-bold leading-3 ${calendarView === "week" ? "border-[#10213a] bg-[#10213a] text-white" : "border-[#d7d1c4] bg-[#fffdf8] text-[#526173]"}`}>ALL GAMES<br />NEXT 7 DAYS</button></div><p className="mt-2 font-mono text-[9px] font-bold tracking-[.1em] text-[#64748b]">{calendarView === "team" ? `${favorite.code} · ALL SCHEDULED GAMES` : "ALL TEAMS · ROLLING 7-DAY WINDOW"}</p>{calendarGames.length ? calendarView === "week" ? <div className="mt-2 space-y-3">{groupedWeekGames.map((group) => <section key={group.label}><p className="mb-1 font-mono text-[9px] font-bold tracking-[.12em] text-[#526173]">GAME DAY / {group.label}</p><div className="grid grid-cols-2 gap-1.5 sm:gap-2">{group.games.map(calendarCard)}</div></section>)}</div> : <div className="mt-2 grid grid-cols-2 gap-1.5 sm:gap-2">{calendarGames.map(calendarCard)}</div> : <p className="mt-3 border border-dashed border-[#d7d1c4] bg-[#fffdf8] p-3 text-[11px] leading-5 text-[#687587]">{calendarView === "team" ? `${favorite.code}の公式日程は次回同期で表示します。` : "今後7日間にNFL公式日程の試合はありません。"}</p>}</>}<a href="https://www.nfl.com/schedules" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold underline decoration-[#e85d2a] decoration-2 underline-offset-3">OFFICIAL SCHEDULE <ChevronRight className="h-3 w-3" /></a></article>
  </section>;
}
