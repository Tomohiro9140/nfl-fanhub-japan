/**
 * Gameday Field Notes: mobile-first NFL viewing notebook.
 * Stable team metadata stays local; game, roster, injury and news data arrive from official caches.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CircleAlert, Eye, EyeOff, Flag, Menu, ShieldCheck, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getTeamByCode, nflTeams, type FavoriteTeam, type TeamBrand } from "@/lib/nflTeams";
import { OfficialTeamFeed } from "@/components/OfficialTeamFeed";
import { OfficialGameTicket, OfficialRosterMoveDigest, OfficialStatusRadar, type TeamSnapshot } from "@/components/OfficialGameExperience";
import { OfficialLatestResults, OfficialLeagueDashboard, type LeagueDashboard } from "@/components/OfficialLeagueDashboard";
import { preloadAtlasRoute, preloadFieldlineRoute } from "@/lib/routePreload";
import { spoilerModeForTeamChange } from "@/lib/teamExperience";
import { trpc } from "@/lib/trpc";

const brandLogo = "/manus-storage/fan-hub-field-mark_2da1d2c0.png";
const favoriteTeamStorageKey = "nfl-fan-hub-favorite-team";
const watchedTicketStorageKey = "nfl-fan-hub-watched-ticket";
const GameStatsDialog = React.lazy(async () => {
  const module = await import("@/components/GameStatsDialog");
  return { default: module.GameStatsDialog };
});

/** Defers below-the-fold data until the section is close enough to enter view. */
function useNearViewport(element: HTMLElement | null, rootMargin = "520px") {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!element || ready) return;
    if (!("IntersectionObserver" in window)) {
      setReady(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setReady(true);
      observer.disconnect();
    }, { rootMargin });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, ready, rootMargin]);
  return ready;
}

/** Starts a non-critical request after the first paint has had an idle opportunity. */
function useIdlePreload(timeout = 650) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const idleWindow = window as Window & typeof globalThis & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const markReady = () => setReady(true);
    const idleHandle = idleWindow.requestIdleCallback?.(markReady, { timeout });
    const timerHandle = idleHandle === undefined ? window.setTimeout(markReady, timeout) : undefined;
    return () => {
      if (idleHandle !== undefined) idleWindow.cancelIdleCallback?.(idleHandle);
      if (timerHandle !== undefined) window.clearTimeout(timerHandle);
    };
  }, [timeout]);
  return ready;
}

function TeamMark({ team, short, brand }: { team: string; short: string; brand: TeamBrand }) {
  return <div className="relative grid h-10 w-10 place-items-center rounded-[12px] border-2 font-display text-base font-black tracking-tight shadow-[0_2px_0_rgba(16,33,58,0.10)]" style={{ backgroundColor: brand.primary, borderColor: brand.accent, color: brand.onPrimary }} aria-label={team}>{short}</div>;
}

export function SpoilerSwitch({ spoilerMode, onToggle }: { spoilerMode: boolean; onToggle: () => void }) {
  const panelClass = ["memo-slip relative overflow-hidden border p-4 transition-colors", spoilerMode ? "border-[#b8dca8] bg-[#f0f8eb]" : "border-[#ded8cc] bg-[#fffdf8]"].join(" ");
  const iconClass = ["grid h-10 w-10 place-items-center rounded-xl", spoilerMode ? "bg-[#3d6b2c] text-white" : "bg-[#e9e3d6] text-[#526173]"].join(" ");
  const toggleClass = ["relative h-7 w-12 rounded-full p-1 transition", spoilerMode ? "bg-[#3d6b2c]" : "bg-[#cbd5e1]"].join(" ");
  const knobClass = ["block h-5 w-5 rounded-full bg-white shadow-sm transition-transform", spoilerMode ? "translate-x-5" : "translate-x-0"].join(" ");
  return <section id="safe" data-layout-scope="spoiler" className={panelClass}>
    <div className="flex items-center gap-3"><div className={iconClass}>{spoilerMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</div><p className="min-w-0 flex-1 font-display text-base font-bold leading-none tracking-wide">ネタバレ防止</p><button onClick={onToggle} className={toggleClass} aria-pressed={spoilerMode} aria-label="ネタバレ防止モードを切り替える"><span className={knobClass} /></button></div>
  </section>;
}

export default function Home() {
  const homeUtils = trpc.useUtils();
  const [spoilerMode, setSpoilerMode] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [gameStatsUrl, setGameStatsUrl] = useState<string | null>(null);
  const [pickerConference, setPickerConference] = useState<"AFC" | "NFC">("AFC");
  const [watchedTicketUrl, setWatchedTicketUrl] = useState<string | null>(null);
  const [forceLastGame, setForceLastGame] = useState(false);
  const [statusSection, setStatusSection] = useState<HTMLElement | null>(null);
  const [leagueSection, setLeagueSection] = useState<HTMLElement | null>(null);
  const statusSectionRef = useCallback((element: HTMLElement | null) => setStatusSection(element), []);
  const leagueSectionRef = useCallback((element: HTMLElement | null) => setLeagueSection(element), []);
  const debugTeamCode = typeof window !== "undefined" && import.meta.env.DEV ? new URLSearchParams(window.location.search).get("teamDebug") : null;
  const [favorite, setFavorite] = useState<FavoriteTeam>(() => {
    if (typeof window === "undefined") return nflTeams[0];
    return getTeamByCode(debugTeamCode) ?? getTeamByCode(window.localStorage.getItem(favoriteTeamStorageKey)) ?? nflTeams[0];
  });
  const snapshotInput = useMemo(() => ({ teamCode: favorite.code, skipGameUrl: watchedTicketUrl ?? undefined, forceLastGame: forceLastGame || undefined, includeRoster: false }), [favorite.code, watchedTicketUrl, forceLastGame]);
  const rosterSnapshotInput = useMemo(() => ({ ...snapshotInput, includeRoster: true }), [snapshotInput]);
  const leagueCalendarInput = useMemo(() => ({ teamCode: favorite.code }), [favorite.code]);
  const latestResultInput = useMemo(() => ({ teamCode: favorite.code }), [favorite.code]);
  const shouldLoadStatus = useNearViewport(statusSection, "160px");
  const shouldWarmLeagueSummary = useIdlePreload();
  const shouldLoadLeagueCalendar = useNearViewport(leagueSection, "900px");
  const shouldLoadLeagueSummary = shouldWarmLeagueSummary || shouldLoadLeagueCalendar;
  const shouldWarmGameStatsData = useIdlePreload(1_250);
  const snapshotQuery = trpc.teamSnapshot.byTeam.useQuery(snapshotInput, { refetchInterval: 60 * 1000, staleTime: 45 * 1000, refetchOnWindowFocus: true, refetchOnReconnect: true, retry: 1 });
  const rosterSnapshotQuery = trpc.teamSnapshot.byTeam.useQuery(rosterSnapshotInput, { enabled: shouldLoadStatus, refetchInterval: 5 * 60 * 1000, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false, refetchOnReconnect: false, retry: 1 });
  const latestResultQuery = trpc.leagueDashboard.latestResult.useQuery(latestResultInput, { refetchInterval: 60 * 1000, staleTime: 45 * 1000, refetchOnWindowFocus: true, refetchOnReconnect: true, retry: 1 });
  const leagueQuery = trpc.leagueDashboard.summary.useQuery(undefined, { enabled: shouldLoadLeagueSummary, refetchInterval: 60 * 1000, staleTime: 45 * 1000, refetchOnWindowFocus: true, refetchOnReconnect: true, retry: 1 });
  const leagueCalendarQuery = trpc.leagueDashboard.calendar.useQuery(leagueCalendarInput, { enabled: shouldLoadLeagueCalendar, refetchInterval: 15 * 60 * 1000, staleTime: 15 * 60 * 1000, refetchOnWindowFocus: false, refetchOnReconnect: false, retry: 1 });
  const gameStatsWarmUrl = useMemo(() => {
    if (spoilerMode) return null;
    return latestResultQuery.data?.results.find((game) => game.gameState === "FINAL" && game.gameUrl.includes("/games/"))?.gameUrl ?? null;
  }, [latestResultQuery.data, spoilerMode]);
  const snapshot = (rosterSnapshotQuery.data ?? snapshotQuery.data) as TeamSnapshot | undefined;
  const leagueDashboard = useMemo(() => leagueQuery.data ? { ...leagueQuery.data, calendar: leagueCalendarQuery.data?.calendar ?? [] } as LeagueDashboard : undefined, [leagueQuery.data, leagueCalendarQuery.data]);
  const forceScheduleEmpty = typeof window !== "undefined" && import.meta.env.DEV && new URLSearchParams(window.location.search).get("scheduleFallbackTest") === "empty";
  const displaySnapshot = forceScheduleEmpty && snapshot ? { ...snapshot, nextGame: undefined } : snapshot;
  const divisionGroups = useMemo(() => ["East", "North", "South", "West"].map((division) => ({ division, teams: nflTeams.filter((team) => team.conference === pickerConference && team.division === division) })), [pickerConference]);

  useEffect(() => { if (!debugTeamCode) window.localStorage.setItem(favoriteTeamStorageKey, favorite.code); }, [debugTeamCode, favorite.code]);
  useEffect(() => {
    if (debugTeamCode) { setWatchedTicketUrl(null); setForceLastGame(false); return; }
    setWatchedTicketUrl(window.localStorage.getItem(`${watchedTicketStorageKey}:${favorite.code}`));
    setForceLastGame(false);
  }, [debugTeamCode, favorite.code]);
  useEffect(() => {
    if (forceLastGame && snapshot && !snapshot.canRestoreLastGame) setForceLastGame(false);
  }, [forceLastGame, snapshot]);
  useEffect(() => {
    if (!shouldWarmGameStatsData || !gameStatsWarmUrl) return;
    const timer = window.setTimeout(() => { void homeUtils.gameStats.byGameUrl.prefetch({ gameUrl: gameStatsWarmUrl }); }, 160);
    return () => window.clearTimeout(timer);
  }, [gameStatsWarmUrl, homeUtils, shouldWarmGameStatsData]);
  const toggleSpoiler = () => {
    setSpoilerMode((current) => {
      const next = !current;
      if (!next) void import("@/components/GameStatsDialog");
      return next;
    });
  };
  const chooseFavorite = (team: FavoriteTeam) => {
    setSpoilerMode((current) => spoilerModeForTeamChange(favorite.code, team.code, current));
    setFavorite(team);
    setTeamDialogOpen(false);
  };
  const warmAtlasRoute = () => { void preloadAtlasRoute(); };
  const warmFieldlineRoute = () => { void preloadFieldlineRoute(); };
  const warmGameStats = (gameSourceUrl: string) => { void homeUtils.gameStats.byGameUrl.prefetch({ gameUrl: gameSourceUrl }); };
  const markTicketWatched = (gameSourceUrl: string) => {
    window.localStorage.setItem(`${watchedTicketStorageKey}:${favorite.code}`, gameSourceUrl);
    setWatchedTicketUrl(gameSourceUrl);
    setForceLastGame(false);
  };
  const restoreLastGame = () => {
    setForceLastGame(true);
  };

  return <div className="min-h-screen overflow-x-clip bg-[#f5f2ea] text-[#10213a] selection:bg-[#e85d2a] selection:text-white">
    <div className="field-grid pointer-events-none fixed inset-0 z-0 opacity-[.16]" />
    <header className="sticky top-0 z-30 border-b border-[#ded8cc]/80 bg-[#f5f2ea]/92 backdrop-blur-lg"><div className="mx-auto flex h-[68px] w-full min-w-0 max-w-6xl items-center justify-between px-4 sm:px-6"><a href="#home" className="flex items-center gap-2.5" aria-label="NFL Fan Hub Japan ホーム"><img src={brandLogo} alt="FAN/HUBのフィールドノートロゴ" className="h-9 w-9 object-contain" /><span className="font-display text-xl font-extrabold tracking-[-.03em]">FAN<span className="text-[#e85d2a]">/</span>HUB</span></a><nav className="hidden items-center gap-1 md:flex" aria-label="主要ナビゲーション"><a href="#home" className="nav-link">HOME</a><a href="#updates" className="nav-link">NEWS</a><a href="#status" className="nav-link">STATUS RADAR</a><a href="#league" className="nav-link">LEAGUE DESK</a><a href="/atlas/" onPointerEnter={warmAtlasRoute} onPointerDown={warmAtlasRoute} onFocus={warmAtlasRoute} className="nav-link">ATLAS</a><a href="/fieldline/" onPointerEnter={warmFieldlineRoute} onPointerDown={warmFieldlineRoute} onFocus={warmFieldlineRoute} className="nav-link">FIELDLINE</a></nav><div className="flex items-center gap-2"><button onClick={() => setTeamDialogOpen(true)} className="inline-flex items-center gap-2 border border-[#d7d1c4] bg-white px-2.5 py-2 text-[11px] font-bold transition hover:border-[#10213a]"><Flag className="h-3.5 w-3.5 text-[#e85d2a]" /> TEAM / {favorite.code}</button><button onClick={() => setNavOpen((value) => !value)} className="grid h-9 w-9 place-items-center rounded-full border border-[#d7d1c4] bg-white md:hidden" aria-label="メニューを開く">{navOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button></div></div>{navOpen && <nav className="border-t border-[#ded8cc] bg-[#fffdf8] p-3 md:hidden"><div className="grid grid-cols-2 gap-2">{[["HOME", "#home"], ["NEWS", "#updates"], ["STATUS RADAR", "#status"], ["LEAGUE DESK", "#league"], ["ATLAS", "/atlas/"], ["FIELDLINE", "/fieldline/"]].map(([label, href]) => <a onClick={() => setNavOpen(false)} onPointerEnter={label === "ATLAS" ? warmAtlasRoute : label === "FIELDLINE" ? warmFieldlineRoute : undefined} onPointerDown={label === "ATLAS" ? warmAtlasRoute : label === "FIELDLINE" ? warmFieldlineRoute : undefined} onFocus={label === "ATLAS" ? warmAtlasRoute : label === "FIELDLINE" ? warmFieldlineRoute : undefined} className="rounded-lg bg-[#f5f2ea] px-3 py-2.5 font-mono text-xs font-bold tracking-wider" href={href} key={label}>{label}</a>)}</div></nav>}</header>

    <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}><DialogContent className="border-[#d7d1c4] bg-[#f5f2ea] p-5 sm:max-w-md" showCloseButton><DialogHeader className="text-left"><p className="font-mono text-[10px] font-bold tracking-[.16em] text-[#64748b]">YOUR HUDDLE</p><DialogTitle className="font-display text-2xl font-extrabold tracking-[.08em]">FAVORITE TEAM</DialogTitle><DialogDescription className="text-[12px]">AFC／NFCと地区から推しチームを選択します。選択状態はこの端末に保存されます。</DialogDescription></DialogHeader><div className="flex gap-2 border-b border-[#d7d1c4] pb-3"><button onClick={() => setPickerConference("AFC")} className={`px-3 py-1.5 font-mono text-xs font-bold tracking-[.12em] ${pickerConference === "AFC" ? "bg-[#10213a] text-white" : "border border-[#d7d1c4] bg-white text-[#526173]"}`}>AFC</button><button onClick={() => setPickerConference("NFC")} className={`px-3 py-1.5 font-mono text-xs font-bold tracking-[.12em] ${pickerConference === "NFC" ? "bg-[#10213a] text-white" : "border border-[#d7d1c4] bg-white text-[#526173]"}`}>NFC</button></div><div className="max-h-[52vh] space-y-4 overflow-y-auto pr-1">{divisionGroups.map(({ division, teams }) => <section key={division}><p className="mb-2 font-mono text-[10px] font-bold tracking-[.16em] text-[#64748b]">{pickerConference} {division.toUpperCase()}</p><div className="grid grid-cols-2 gap-2">{teams.map((team) => <button key={team.code} onClick={() => chooseFavorite(team)} className={`flex items-center gap-2 border p-2.5 text-left transition hover:border-[#e85d2a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10213a] ${favorite.code === team.code ? "border-[#e85d2a] bg-[#fffaf0]" : "border-[#d7d1c4] bg-white"}`}><TeamMark team={team.name} short={team.code} brand={team.brand} /><span className="min-w-0 flex-1"><span className="block font-display text-base font-bold tracking-wide">{team.code}</span><span className="block truncate text-[10px] text-[#64748b]">{team.name}</span></span>{favorite.code === team.code && <ShieldCheck className="h-3.5 w-3.5 text-[#e85d2a]" />}</button>)}</div></section>)}</div></DialogContent></Dialog>

    <main className="relative z-10 mx-auto w-full min-w-0 max-w-6xl overflow-x-clip px-4 pb-24 pt-4 sm:px-6 sm:pt-6">{snapshotQuery.isError && <div className="mb-3 flex items-center gap-2 border border-[#f1c7b5] bg-[#fff4ef] px-3 py-2 text-[11px] text-[#a34220]"><CircleAlert className="h-4 w-4" />公式データを一時的に取得できません。保存済みの情報を再試行します。</div>}<div className="min-w-0 space-y-3"><OfficialGameTicket favorite={favorite} snapshot={displaySnapshot} loading={snapshotQuery.isLoading} spoilerMode={spoilerMode} hasWatchedTicket={Boolean(watchedTicketUrl)} canRestoreLastGame={Boolean(displaySnapshot?.canRestoreLastGame)} onMarkWatched={markTicketWatched} onRestoreLastGame={restoreLastGame} onOpenGameStats={setGameStatsUrl} /><SpoilerSwitch spoilerMode={spoilerMode} onToggle={toggleSpoiler} /><OfficialLatestResults favorite={favorite} dashboard={latestResultQuery.data} loading={latestResultQuery.isLoading} spoilerMode={spoilerMode} onOpenGameStats={setGameStatsUrl} onWarmGameStats={warmGameStats} /><div data-layout-scope="official-feed" className="min-w-0"><OfficialTeamFeed favorite={favorite} spoilerMode={spoilerMode} completedGame={displaySnapshot?.gameDayStatus} /></div><div ref={statusSectionRef}><OfficialStatusRadar favorite={favorite} snapshot={displaySnapshot} loading={snapshotQuery.isLoading || (shouldLoadStatus && rosterSnapshotQuery.isLoading)} /><OfficialRosterMoveDigest snapshot={displaySnapshot} loading={snapshotQuery.isLoading} /></div></div><div ref={leagueSectionRef} className="mt-3"><OfficialLeagueDashboard favorite={favorite} dashboard={leagueDashboard} loading={!shouldLoadLeagueSummary || leagueQuery.isLoading} calendarLoading={!shouldLoadLeagueCalendar || leagueCalendarQuery.isLoading} /></div></main>{gameStatsUrl ? <React.Suspense fallback={null}><GameStatsDialog gameUrl={gameStatsUrl} onOpenChange={(open) => { if (!open) setGameStatsUrl(null); }} /></React.Suspense> : null}
  </div>;
}
