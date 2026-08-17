import { ArrowUpRight, CircleAlert, Clock3, FileText, Tv, UsersRound } from "lucide-react";
import React from "react";
import { getTeamByCode, type FavoriteTeam } from "@/lib/nflTeams";
import { confirmedVenue } from "@/lib/gameVenue";
import { daznNflGamePassUrl, daznWatchTarget } from "@/lib/daznWatch";
import { GameCountdown } from "@/components/GameCountdown";
import { filterRosterByStatus } from "@/lib/rosterFilter";

const daznGamePassUrl = daznNflGamePassUrl;

export type TeamSnapshot = {
  nextGame?: { opponentCode: string; homeAway: "home" | "away"; seasonPhase: "preseason" | "regular" | "postseason"; weekLabel: string | null; kickoffAt: Date; venue: string | null; broadcast: string | null; sourceUrl: string; daznUrl: string | null; nflHighlightUrl?: string | null; gameState: string | null; awayScore: number | null; homeScore: number | null; fetchedAt: Date };
  gameDayStatus?: { opponentCode: string; homeAway: "home" | "away"; weekLabel: string | null; kickoffAt: Date; gameState: string | null; awayScore: number | null; homeScore: number | null; sourceUrl: string; fetchedAt: Date };
  roster: Array<{ id: number; playerName: string; jerseyNumber: string | null; position: string; rosterStatus: string; sourceUrl: string; fetchedAt: Date }>;
  rosterCounts: Array<{ status: string; count: number }>;
  injuries: Array<{ id: number; title: string; sourceName: string; sourceUrl: string; publishedAt: Date; category?: "injury" | "transaction" }>;
  rosterMoves?: Array<{ id: number; title: string; sourceName: string; sourceUrl: string; publishedAt: Date; category?: "injury" | "transaction" }>;
  externalInsights?: Array<{ id: number; playerName: string; statusLabel: string; headline: string; sourceName: string; sourceUrl: string; publishedAt: Date }>;
  news: Array<{ id: number; title: string; summary: string | null; sourceName: string; sourceUrl: string; publishedAt: Date }>;
  sources: { schedule: string | null; roster: string | null; injury: string | null; moves?: string | null; gameDay?: string | null };
  lastUpdatedAt?: Date;
};

function fmtDate(value: Date) {
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tokyo" }).format(new Date(value));
}

function fmtGameDate(value: Date) {
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", weekday: "short", timeZone: "Asia/Tokyo" }).format(new Date(value));
}

function sourceTime(value?: Date) {
  return value ? new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tokyo" }).format(new Date(value)) : "—";
}

function EmptyOfficial({ label, copy }: { label: string; copy: string }) {
  return <div className="border border-dashed border-white/30 bg-white/5 p-3 text-[12px] leading-5 text-[#d9e3f3]"><CircleAlert className="mr-1 inline h-3.5 w-3.5 text-[#ffc1a7]" /> <strong>{label}</strong><br />{copy}</div>;
}

export function OfficialGameTicket({ favorite, snapshot, loading, spoilerMode = false, hasWatchedTicket = false, onMarkWatched, onRestoreLastGame }: { favorite: FavoriteTeam; snapshot?: TeamSnapshot; loading: boolean; spoilerMode?: boolean; hasWatchedTicket?: boolean; onMarkWatched?: (gameSourceUrl: string) => void; onRestoreLastGame?: () => void }) {
  const game = snapshot?.nextGame;
  const gameDay = snapshot?.gameDayStatus ?? game;
  const gameStatus = gameStateCopy(gameDay, spoilerMode);
  const opponent = getTeamByCode(game?.opponentCode ?? null);
  const watchTarget = typeof navigator === "undefined" ? "_blank" : daznWatchTarget(navigator.userAgent);
  const watchUrl = daznGamePassUrl;
  const favoriteLabel = game?.homeAway === "home" ? `@ ${favorite.name}` : favorite.name;
  const opponentLabel = game?.homeAway === "away" && opponent ? `@ ${opponent.name}` : opponent?.name;
  const isRevealedFinal = gameStatus.label === "FINAL" && !spoilerMode && Boolean(gameStatus.score);
  const favoriteScore = game ? (game.homeAway === "home" ? game.homeScore : game.awayScore) : null;
  const opponentScore = game ? (game.homeAway === "home" ? game.awayScore : game.homeScore) : null;
  return <section data-layout-scope="hero" className="ticket-cut ticket-paper relative min-h-[272px] overflow-hidden rounded-[18px] bg-[#0a1931] text-[#fffaf0] shadow-[0_24px_50px_rgba(10,25,49,0.2)] sm:min-h-[284px]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_5%,rgba(56,189,248,.19),transparent_30%),linear-gradient(115deg,#0a1931,#112a4b)]" />
    <div className="relative p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[10px] font-bold tracking-[.18em] text-[#ffc1a7]">GAME TICKET / {game ? (game.weekLabel ?? game.seasonPhase.toUpperCase()) : "OFFICIAL SCHEDULE"}</p><p className="mt-2 font-display text-2xl font-extrabold tracking-[.08em] text-white">{gameStatus.label === "FINAL" ? "LAST GAME" : "NEXT GAME"}</p></div><div className="flex shrink-0 flex-col items-start gap-1.5"><a href={watchUrl} target={watchTarget} rel="noreferrer" className="inline-flex items-center gap-1 border border-[#ffc1a7]/70 bg-white/10 px-2 py-1.5 font-mono text-[9px] font-bold tracking-[.08em] text-white transition hover:bg-white/20" aria-label="DAZN NFL Game Passホームを開いて観戦する"><Tv className="h-3.5 w-3.5 text-[#ffc1a7]" /> DAZN <ArrowUpRight className="h-3.5 w-3.5" /></a>{gameStatus.label === "FINAL" ? game?.nflHighlightUrl ? <a href={game.nflHighlightUrl} target="_blank" rel="noreferrer" className="font-mono text-[8px] font-bold text-[#ffc1a7] underline underline-offset-2">WATCH HIGHLIGHTS <ArrowUpRight className="inline h-3 w-3" /></a> : <span className="font-mono text-[8px] font-bold tracking-[.06em] text-[#a5b3c9]">HIGHLIGHTS · 準備中</span> : null}{gameStatus.label === "FINAL" && game && onMarkWatched ? <button type="button" onClick={() => onMarkWatched(game.sourceUrl)} className="font-mono text-[8px] font-bold text-[#d9e3f3] underline underline-offset-2">ON TO THE NEXT GAME</button> : null}{gameStatus.label !== "FINAL" && hasWatchedTicket && onRestoreLastGame ? <button type="button" onClick={onRestoreLastGame} className="font-mono text-[8px] font-bold text-[#ffc1a7] underline underline-offset-2">RETURN TO LAST GAME</button> : null}</div></div>
      {loading ? <p className="mt-5 font-mono text-[11px] text-[#d9e3f3]">LOADING OFFICIAL SCHEDULE…</p> : game && opponent ? <><div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3"><div><p className={`font-display text-base font-bold leading-tight ${isRevealedFinal && favoriteScore !== null && opponentScore !== null && favoriteScore > opponentScore ? "text-[#ffc1a7]" : ""}`}>{favoriteLabel}</p></div><div className="border-x border-dashed border-white/25 px-3 text-center">{isRevealedFinal ? <><p className="-mt-1 font-mono text-[9px] font-semibold tracking-[.14em] text-[#a5b3c9]">{fmtGameDate(game.kickoffAt)}</p><p className="mt-1 font-display text-3xl font-black leading-none tracking-[.03em] text-white"><span className={favoriteScore !== null && opponentScore !== null && favoriteScore > opponentScore ? "text-[#ffc1a7]" : ""}>{favoriteScore}</span><span> — </span><span className={favoriteScore !== null && opponentScore !== null && opponentScore > favoriteScore ? "text-[#ffc1a7]" : ""}>{opponentScore}</span></p><p className="mt-1 font-mono text-[8px] font-bold tracking-[.14em] text-[#ffc1a7]">FINAL SCORE</p></> : <><p className="font-mono text-[9px] font-semibold tracking-[.14em] text-[#a5b3c9]">JST</p><p className="mt-1 font-display text-lg font-extrabold leading-none">{fmtDate(game.kickoffAt)}</p><GameCountdown kickoffAt={game.kickoffAt} result={{ gameState: game.gameState, awayScore: game.awayScore, homeScore: game.homeScore }} hideFinalScore={spoilerMode} className="mt-1 text-[9px]" />{confirmedVenue(game.venue) ? <p className="mt-1 text-[10px] text-[#ffc1a7]">{confirmedVenue(game.venue)}</p> : null}</>}</div><div className="text-right"><p className={`font-display text-base font-bold leading-tight ${isRevealedFinal && favoriteScore !== null && opponentScore !== null && opponentScore > favoriteScore ? "text-[#ffc1a7]" : ""}`}>{opponentLabel}</p></div></div>{game.broadcast ? <p className="mt-3 font-mono text-[9px] tracking-[.08em] text-[#d9e3f3]">{game.broadcast}</p> : null}<div className="mt-3 border-t border-white/15 pt-2 font-mono text-[9px]"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><span className="font-bold tracking-[.1em] text-[#a5b3c9]">GAME STATUS</span><span className={`rounded px-1.5 py-0.5 font-bold ${gameStatus.label === "LIVE" ? "bg-[#e85d2a] text-white" : gameStatus.label === "FINAL" ? "bg-white text-[#10213a]" : "bg-[#315272] text-white"}`}>{gameStatus.label}</span><span className="text-[#d9e3f3]">{isRevealedFinal ? "OFFICIAL SCORE CONFIRMED" : gameStatus.score ? `OFFICIAL SCORE ${gameStatus.score}` : gameStatus.detail}</span></div><div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1"><a href="https://www.nfl.com/inactives/" target="_blank" rel="noreferrer" className="font-bold text-[#ffc1a7] underline underline-offset-2">INACTIVES <ArrowUpRight className="inline h-3 w-3" /></a>{gameDay?.sourceUrl ? <a href={gameDay.sourceUrl} target="_blank" rel="noreferrer" className="font-bold text-[#ffc1a7] underline underline-offset-2">GAME CENTER <ArrowUpRight className="inline h-3 w-3" /></a> : null}<a href={game.sourceUrl} target="_blank" rel="noreferrer" className="font-bold text-[#ffc1a7] underline underline-offset-2">OFFICIAL SCHEDULE <ArrowUpRight className="inline h-3 w-3" /></a></div></div></> : <div className="mt-4"><EmptyOfficial label="OFFICIAL SCHEDULE PENDING" copy="NFL公式リーグ日程とチーム公式Scheduleを確認後に表示します。" /></div>}
    </div>
  </section>;
}

function gameStateCopy(game?: TeamSnapshot["gameDayStatus"], hideFinalScore = false) {
  if (!game) return { label: "SCHEDULE PENDING", detail: "公式リーグ日程の更新を待っています。", score: null };
  const state = (game.gameState ?? "").toUpperCase();
  const hasScore = game.awayScore !== null && game.homeScore !== null;
  const score = hasScore ? `${game.awayScore} — ${game.homeScore}` : null;
  if (state === "FINAL" || state === "COMPLETED") return { label: "FINAL", detail: hideFinalScore ? "ネタバレ防止中 · 結果は隠しています" : "公式スコアを確認済み", score: hideFinalScore ? null : score };
  if (state.includes("LIVE") || state.includes("IN_PROGRESS") || state.includes("HALFTIME")) return { label: "LIVE", detail: "公式スコアを更新中", score };
  const hoursUntil = (new Date(game.kickoffAt).getTime() - Date.now()) / 3_600_000;
  return { label: hoursUntil <= 30 ? "GAME DAY" : "UPCOMING", detail: hoursUntil <= 30 ? "公式インアクティブ発表前" : "試合当日の公式更新を待っています", score };
}

export function OfficialRosterMoveDigest({ snapshot, loading }: { snapshot?: TeamSnapshot; loading: boolean }) {
  const moves = snapshot?.rosterMoves ?? [];
  return <section data-layout-scope="roster-move-digest" className="border border-[#d9d5cc] bg-white p-3 shadow-[0_10px_30px_rgba(34,42,53,.04)]"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[9px] font-bold tracking-[.15em] text-[#64748b]">OFFICIAL TEAM UPDATES</p><h2 className="mt-1 font-display text-lg font-extrabold tracking-[.06em]">ROSTER MOVE DIGEST</h2></div><span className="rounded bg-[#e8f0fb] px-2 py-1 font-mono text-[9px] font-bold text-[#365077]">LAST 21 DAYS</span></div>{loading ? <p className="mt-3 font-mono text-[10px] text-[#687587]">LOADING OFFICIAL ROSTER MOVES…</p> : moves.length ? <div className="mt-2 divide-y divide-[#eeeae1]">{moves.map((item) => <a key={item.id} href={item.sourceUrl} target="_blank" rel="noreferrer" className="block py-2"><div className="flex items-center gap-2"><span className="shrink-0 rounded bg-[#e8f0fb] px-1.5 py-0.5 font-mono text-[8px] font-bold text-[#365077]">MOVE</span><p className="text-[11px] font-bold leading-4 text-[#10213a]">{item.title}</p></div><p className="mt-1 text-[10px] text-[#687587]">{item.sourceName} · {sourceTime(item.publishedAt)} JST</p></a>)}</div> : <p className="mt-3 text-[11px] leading-5 text-[#687587]">過去21日間の公式ロスター変更はありません。</p>}{snapshot?.sources.moves ? <a href={snapshot.sources.moves} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 font-mono text-[9px] font-bold text-[#365077] underline decoration-[#e85d2a] decoration-2 underline-offset-3">OFFICIAL SOURCE <ArrowUpRight className="h-3 w-3" /></a> : null}</section>;
}

export function OfficialHuddle({ favorite, snapshot }: { favorite: FavoriteTeam; snapshot?: TeamSnapshot }) {
  const rosterSummary = snapshot?.rosterCounts.map((item) => `${item.status}: ${item.count}`).join(" · ");
  return <section id="home" data-layout-scope="huddle" className="scroll-mt-24"><div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-[#64748b]"><span className="text-[#10213a]">01</span><span>YOUR HUDDLE</span><span className="h-px flex-1 bg-[#d9d5cc]" /></div><article className="clip-note mt-3 border border-[#ded8cc] bg-white p-3 shadow-[0_10px_30px_rgba(34,42,53,.05)]"><div className="flex items-start justify-between gap-3"><div><p className="font-display text-base font-bold tracking-wide">OFFICIAL STATUS</p><p className="mt-1 text-[11px] text-[#687587]">更新 {sourceTime(snapshot?.lastUpdatedAt)} JST</p></div><span className="rounded-full bg-[#e7f5dd] px-2 py-1 font-mono text-[9px] font-bold text-[#3f6d27]">LIVE CACHE</span></div><div className="mt-3 divide-y divide-[#eeeae1]"><div className="py-2"><p className="font-mono text-[9px] font-bold tracking-[.12em] text-[#64748b]">LATEST TEAM UPDATE</p><p className="mt-1 text-[13px] font-medium">{snapshot?.news[0]?.title ?? "チーム公式ニュースの次回更新を待っています"}</p></div><div className="py-2"><p className="font-mono text-[9px] font-bold tracking-[.12em] text-[#64748b]">INJURY CHECK</p><p className="mt-1 text-[13px] font-medium">{snapshot?.injuries[0]?.title ?? "現在の公式負傷関連更新はありません"}</p></div><div className="py-2"><p className="font-mono text-[9px] font-bold tracking-[.12em] text-[#64748b]">ROSTER SNAPSHOT</p><p className="mt-1 text-[13px] font-medium">{snapshot?.roster.length ? `${snapshot.roster.length} registered · ${rosterSummary ?? "official roster updated"}` : "公式ロスターの次回更新を待っています"}</p></div></div></article></section>;
}

export function OfficialGameNotes({ favorite, snapshot }: { favorite: FavoriteTeam; snapshot?: TeamSnapshot }) {
  const notes = [
    { label: "OFFICIAL STORYLINE", title: snapshot?.news[0]?.title ?? "WAITING FOR OFFICIAL STORYLINE", copy: snapshot?.news[0]?.summary ?? "チーム公式RSSの次回更新後に、注目すべき公式ストーリーを表示します。", url: snapshot?.news[0]?.sourceUrl },
    { label: "AVAILABILITY WATCH", title: snapshot?.injuries[0]?.title ?? "NO NEW INJURY UPDATE", copy: snapshot?.injuries[0] ? `${snapshot.injuries[0].sourceName} · ${sourceTime(snapshot.injuries[0].publishedAt)} JST` : "最新のNFL公式・チーム公式の負傷情報を確認中です。", url: snapshot?.injuries[0]?.sourceUrl },
    { label: "ROSTER PULSE", title: snapshot?.roster.length ? `${snapshot.roster.length} PLAYERS ON THE OFFICIAL ROSTER` : "OFFICIAL ROSTER UPDATE PENDING", copy: snapshot?.rosterCounts.length ? snapshot.rosterCounts.map((item) => `${item.status}: ${item.count}`).join(" · ") : "公式ロスターの次回更新を待っています。", url: snapshot?.roster[0]?.sourceUrl },
  ];
  return <section id="briefing" data-layout-scope="briefing" className="scroll-mt-24"><div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-[#64748b]"><span className="text-[#10213a]">03</span><span>OFFICIAL BRIEFING</span><span className="h-px flex-1 bg-[#d9d5cc]" /></div><div className="briefing-sheet mt-3 bg-white p-3 shadow-[0_10px_30px_rgba(34,42,53,.05)] ring-1 ring-[#ded8cc]"><div className="flex items-end justify-between gap-3"><div><h2 className="font-display text-xl font-extrabold tracking-[.08em]">GAME NOTES</h2><p className="mt-0.5 text-[11px] text-[#687587]">OFFICIAL SOURCES ONLY · UPDATED {sourceTime(snapshot?.lastUpdatedAt)} JST</p></div><FileText className="h-4 w-4 text-[#e85d2a]" /></div><div className="mt-3 grid gap-2">{notes.map((note, index) => <article key={note.label} className="briefing-row border border-[#e9e3d6] bg-[#fffdf8] p-3.5"><div className="flex gap-3"><span className="font-display text-2xl font-black leading-none text-[#e85d2a]">0{index + 1}</span><div className="min-w-0 flex-1"><p className="font-mono text-[9px] font-bold tracking-[.15em] text-[#64748b]">{note.label}</p><h3 className="mt-1 font-display text-base font-bold leading-tight tracking-wide">{note.title}</h3><p className="mt-1.5 text-[12px] leading-[1.45] text-[#526173]">{note.copy}</p>{note.url ? <a href={note.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold underline decoration-[#e85d2a] decoration-2 underline-offset-3">OFFICIAL SOURCE <ArrowUpRight className="h-3 w-3" /></a> : <p className="mt-2 font-mono text-[9px] text-[#9a7560]">SOURCE LINK AVAILABLE AFTER NEXT OFFICIAL FETCH</p>}</div></div></article>)}</div>{!snapshot?.lastUpdatedAt && <div className="mt-3 border border-dashed border-[#d7d1c4] bg-[#fffdf8] p-3 text-[11px] text-[#687587]"><CircleAlert className="mr-1 inline h-3.5 w-3.5 text-[#e85d2a]" />公式データの初回取得を待っています。固定の試合分析は表示しません。</div>}</div></section>;
}

export function OfficialStatusRadar({ favorite, snapshot, loading }: { favorite: FavoriteTeam; snapshot?: TeamSnapshot; loading: boolean }) {
  const [rosterFilter, setRosterFilter] = React.useState<string | null>(null);
  const allRoster = snapshot?.roster ?? [];
  const reserveCounts = snapshot?.rosterCounts.filter((item) => item.status.toLowerCase() !== "active") ?? [];
  const visibleRoster = rosterFilter ? filterRosterByStatus(allRoster, rosterFilter) : [];
  React.useEffect(() => setRosterFilter(null), [favorite.code]);
  const relatedItems = snapshot?.injuries ?? [];
  const pftInsights = (snapshot?.externalInsights ?? []).filter((item) => item.statusLabel !== "TRANSACTION");
  return <section id="status" data-layout-scope="roster" className="scroll-mt-24">
    <div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-[#64748b]"><span className="text-[#10213a]">03</span><span>STATUS RADAR</span><span className="h-px flex-1 bg-[#d9d5cc]" /></div>
    <div className="roster-slip mt-3 overflow-hidden border border-[#ded8cc] bg-white shadow-[0_10px_30px_rgba(34,42,53,.05)]">
      <div className="bg-[#0a1931] p-4 text-white"><p className="font-mono text-[9px] font-bold tracking-[.15em] text-[#ffc1a7]">OFFICIAL ROSTER / AVAILABILITY</p><h2 className="mt-1 font-display text-2xl font-extrabold leading-[.9] tracking-wide">STATUS RADAR</h2><p className="mt-2 text-[11px] text-[#d9e3f3]">LAST UPDATE {sourceTime(snapshot?.lastUpdatedAt)} JST</p></div>
      <div className="p-3">
        {loading ? <p className="py-4 text-center font-mono text-[10px] text-[#64748b]">LOADING OFFICIAL ROSTER…</p> : allRoster.length ? <>
          <div className="mb-2 flex flex-wrap gap-1.5">{reserveCounts.map((item) => <button type="button" key={item.status} onClick={() => setRosterFilter(item.status)} aria-pressed={rosterFilter === item.status} className={`rounded px-2 py-1 font-mono text-[9px] font-bold ${rosterFilter === item.status ? "bg-[#e85d2a] text-white" : "bg-[#eef2f8] text-[#365077]"}`}>{item.status.toUpperCase()} {item.count}</button>)}</div>
          {reserveCounts.length ? <p className="mb-1 font-mono text-[8px] font-bold tracking-[.08em] text-[#687587]">{rosterFilter ? `${rosterFilter.toUpperCase()} · ${visibleRoster.length} PLAYERS` : "SELECT A RESERVE TAG TO VIEW PLAYERS"}</p> : <p className="mb-1 font-mono text-[8px] font-bold tracking-[.08em] text-[#687587]">NO RESERVE TRANSACTIONS</p>}
          <div className="divide-y divide-[#eeeae1]">{visibleRoster.map((entry) => <div key={entry.id} className="flex items-center gap-3 py-2.5"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#e9e3d6] font-mono text-[9px] font-bold">{entry.position}</span><div className="min-w-0 flex-1"><p className="text-[13px] font-bold text-[#10213a]">{entry.playerName}</p><p className="mt-0.5 text-[11px] text-[#687587]">#{entry.jerseyNumber ?? "—"} · {entry.rosterStatus}</p></div><UsersRound className="h-4 w-4 text-[#64748b]" /></div>)}</div>
          {rosterFilter && !visibleRoster.length ? <p className="py-3 text-[11px] text-[#687587]">この登録区分の選手は現在いません。</p> : null}
          <a href={allRoster[0].sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold underline decoration-[#e85d2a] decoration-2 underline-offset-4">OFFICIAL ROSTER <ArrowUpRight className="h-3.5 w-3.5" /></a>
        </> : <div className="border border-dashed border-[#d7d1c4] bg-[#fffdf8] p-3 text-[12px] leading-5 text-[#687587]"><CircleAlert className="mr-1 inline h-3.5 w-3.5 text-[#e85d2a]" />{favorite.code}の公式Rosterを取得後に、選手とステータスを表示します。</div>}
        <div className="mt-3 border-t border-[#eeeae1] pt-3"><p className="font-mono text-[9px] font-bold tracking-[.12em] text-[#64748b]">INJURY RELATED</p>{relatedItems.length ? <div className="mt-1 divide-y divide-[#eeeae1]">{relatedItems.map((item) => <a key={item.id} href={item.sourceUrl} target="_blank" rel="noreferrer" className="block py-2"><div className="flex items-center gap-1.5"><span className="rounded bg-[#fff0e9] px-1.5 py-0.5 font-mono text-[8px] font-bold text-[#c44719]">INJURY</span><p className="min-w-0 flex-1 text-[11px] font-bold leading-4 text-[#10213a]">{item.title}</p></div><p className="mt-0.5 text-[10px] text-[#687587]">{item.sourceName} · {sourceTime(item.publishedAt)} JST</p></a>)}</div> : <p className="mt-1 text-[11px] text-[#687587]">新しい公式負傷関連の記事は現在キャッシュにありません。次回更新で確認します。</p>}{snapshot?.sources.injury && <a href={snapshot.sources.injury} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold underline decoration-[#e85d2a] decoration-2 underline-offset-3">OFFICIAL SOURCE <ArrowUpRight className="h-3 w-3" /></a>}</div>
        <div className="mt-3 border-t border-[#eeeae1] pt-3"><p className="font-mono text-[9px] font-bold tracking-[.12em] text-[#64748b]">AVAILABILITY WATCH · PFT</p>{pftInsights.length ? <div className="mt-1 divide-y divide-[#eeeae1]">{pftInsights.map((item) => <a key={item.id} href={item.sourceUrl} target="_blank" rel="noreferrer" className="block py-2"><div className="flex items-center gap-2"><span className="rounded bg-[#fff0e9] px-1.5 py-0.5 font-mono text-[8px] font-bold text-[#c44719]">{item.statusLabel}</span><p className="min-w-0 truncate text-[11px] font-bold leading-4 text-[#10213a]">{item.playerName}</p></div><p className="mt-1 text-[10px] leading-4 text-[#526173]">{item.headline}</p><p className="mt-0.5 text-[10px] text-[#687587]">{item.sourceName} · {sourceTime(item.publishedAt)} JST</p></a>)}</div> : <p className="mt-1 text-[11px] text-[#687587]">PFTの新しい出場可否・負傷関連記事は現在ありません。</p>}</div>
      </div>
    </div>
  </section>;
}
