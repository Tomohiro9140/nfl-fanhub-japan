import { ArrowUpRight, CircleAlert, Clock3, FileText, Tv, UsersRound } from "lucide-react";
import React from "react";
import { getTeamByCode, type FavoriteTeam } from "@/lib/nflTeams";
import { confirmedVenue } from "@/lib/gameVenue";
import { daznNflGamePassUrl, daznWatchTarget } from "@/lib/daznWatch";
import { GameCountdown } from "@/components/GameCountdown";
import { filterRosterByStatus } from "@/lib/rosterFilter";

const daznGamePassUrl = daznNflGamePassUrl;

export type TeamSnapshot = {
  nextGame?: { opponentCode: string; homeAway: "home" | "away"; seasonPhase: "preseason" | "regular" | "postseason"; weekLabel: string | null; kickoffAt: Date; venue: string | null; broadcast: string | null; sourceUrl: string; daznUrl: string | null; gameState: string | null; awayScore: number | null; homeScore: number | null; fetchedAt: Date };
  roster: Array<{ id: number; playerName: string; jerseyNumber: string | null; position: string; rosterStatus: string; sourceUrl: string; fetchedAt: Date }>;
  rosterCounts: Array<{ status: string; count: number }>;
  injuries: Array<{ id: number; title: string; sourceName: string; sourceUrl: string; publishedAt: Date; category?: "injury" | "transaction" }>;
  externalInsights?: Array<{ id: number; playerName: string; statusLabel: string; headline: string; sourceName: string; sourceUrl: string; publishedAt: Date }>;
  news: Array<{ id: number; title: string; summary: string | null; sourceName: string; sourceUrl: string; publishedAt: Date }>;
  sources: { schedule: string | null; roster: string | null; injury: string | null };
  lastUpdatedAt?: Date;
};

function fmtDate(value: Date) {
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tokyo" }).format(new Date(value));
}

function sourceTime(value?: Date) {
  return value ? new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tokyo" }).format(new Date(value)) : "—";
}

function EmptyOfficial({ label, copy }: { label: string; copy: string }) {
  return <div className="border border-dashed border-white/30 bg-white/5 p-3 text-[12px] leading-5 text-[#d9e3f3]"><CircleAlert className="mr-1 inline h-3.5 w-3.5 text-[#ffc1a7]" /> <strong>{label}</strong><br />{copy}</div>;
}

export function OfficialGameTicket({ favorite, snapshot, loading }: { favorite: FavoriteTeam; snapshot?: TeamSnapshot; loading: boolean }) {
  const game = snapshot?.nextGame;
  const opponent = getTeamByCode(game?.opponentCode ?? null);
  const watchTarget = typeof navigator === "undefined" ? "_blank" : daznWatchTarget(navigator.userAgent);
  const watchUrl = daznGamePassUrl;
  return <section data-layout-scope="hero" className="ticket-cut ticket-paper relative overflow-hidden rounded-[18px] bg-[#0a1931] text-[#fffaf0] shadow-[0_24px_50px_rgba(10,25,49,0.2)]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_5%,rgba(56,189,248,.19),transparent_30%),linear-gradient(115deg,#0a1931,#112a4b)]" />
    <div className="relative p-4 sm:p-5">
      <div><p className="font-mono text-[10px] font-bold tracking-[.18em] text-[#ffc1a7]">GAME TICKET / {game ? (game.weekLabel ?? game.seasonPhase.toUpperCase()) : "OFFICIAL SCHEDULE"}</p><p className="mt-2 font-display text-2xl font-extrabold tracking-[.08em] text-white">NEXT GAME</p></div>
      {loading ? <p className="mt-5 font-mono text-[11px] text-[#d9e3f3]">LOADING OFFICIAL SCHEDULE…</p> : game && opponent ? <><div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3"><div><p className="font-display text-base font-bold leading-tight">{favorite.name}</p></div><div className="border-x border-dashed border-white/25 px-3 text-center"><p className="font-mono text-[9px] font-semibold tracking-[.14em] text-[#a5b3c9]">JST</p><p className="mt-1 font-display text-lg font-extrabold leading-none">{fmtDate(game.kickoffAt)}</p><GameCountdown kickoffAt={game.kickoffAt} result={{ gameState: game.gameState, awayScore: game.awayScore, homeScore: game.homeScore }} className="mt-1 text-[9px]" />{confirmedVenue(game.venue) ? <p className="mt-1 text-[10px] text-[#ffc1a7]">{confirmedVenue(game.venue)}</p> : null}</div><div className="text-right"><p className="font-display text-base font-bold leading-tight">{opponent.name}</p></div></div>{game.broadcast ? <p className="mt-3 font-mono text-[9px] tracking-[.08em] text-[#d9e3f3]">{game.broadcast}</p> : null}</> : <div className="mt-4"><EmptyOfficial label="OFFICIAL SCHEDULE PENDING" copy="NFL公式リーグ日程とチーム公式Scheduleを確認後に表示します。" /></div>}
      <div className="ticket-rule mt-4 pt-3"><a href={watchUrl} target={watchTarget} rel="noreferrer" className="inline-flex min-h-10 w-full items-center justify-center gap-2 bg-[#e85d2a] px-3 font-sans text-[13px] font-bold text-white transition hover:bg-[#cf4f20] active:scale-[.97]" aria-label="DAZN NFL Game Passホームを開いて観戦する"><Tv className="h-4 w-4" /> 観戦する <ArrowUpRight className="h-4 w-4" /></a></div>
      {game && <a href={game.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 font-mono text-[9px] text-[#d9e3f3] underline underline-offset-2">OFFICIAL SCHEDULE <ArrowUpRight className="h-3 w-3" /></a>}
    </div>
  </section>;
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
  const pftInsights = snapshot?.externalInsights ?? [];
  return <section id="status" data-layout-scope="roster" className="scroll-mt-24">
    <div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-[#64748b]"><span className="text-[#10213a]">03</span><span>STATUS RADAR</span><span className="h-px flex-1 bg-[#d9d5cc]" /></div>
    <div className="roster-slip mt-3 overflow-hidden border border-[#ded8cc] bg-white shadow-[0_10px_30px_rgba(34,42,53,.05)]">
      <div className="bg-[#0a1931] p-4 text-white"><p className="font-mono text-[9px] font-bold tracking-[.15em] text-[#ffc1a7]">OFFICIAL ROSTER / INJURY / TRANSACTION</p><h2 className="mt-1 font-display text-2xl font-extrabold leading-[.9] tracking-wide">STATUS RADAR</h2><p className="mt-2 text-[11px] text-[#d9e3f3]">LAST UPDATE {sourceTime(snapshot?.lastUpdatedAt)} JST</p></div>
      <div className="p-3">
        {loading ? <p className="py-4 text-center font-mono text-[10px] text-[#64748b]">LOADING OFFICIAL ROSTER…</p> : allRoster.length ? <>
          <div className="mb-2 flex flex-wrap gap-1.5">{reserveCounts.map((item) => <button type="button" key={item.status} onClick={() => setRosterFilter(item.status)} aria-pressed={rosterFilter === item.status} className={`rounded px-2 py-1 font-mono text-[9px] font-bold ${rosterFilter === item.status ? "bg-[#e85d2a] text-white" : "bg-[#eef2f8] text-[#365077]"}`}>{item.status.toUpperCase()} {item.count}</button>)}</div>
          {reserveCounts.length ? <p className="mb-1 font-mono text-[8px] font-bold tracking-[.08em] text-[#687587]">{rosterFilter ? `${rosterFilter.toUpperCase()} · ${visibleRoster.length} PLAYERS` : "SELECT A RESERVE TAG TO VIEW PLAYERS"}</p> : <p className="mb-1 font-mono text-[8px] font-bold tracking-[.08em] text-[#687587]">NO RESERVE TRANSACTIONS</p>}
          <div className="divide-y divide-[#eeeae1]">{visibleRoster.map((entry) => <div key={entry.id} className="flex items-center gap-3 py-2.5"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#e9e3d6] font-mono text-[9px] font-bold">{entry.position}</span><div className="min-w-0 flex-1"><p className="text-[13px] font-bold text-[#10213a]">{entry.playerName}</p><p className="mt-0.5 text-[11px] text-[#687587]">#{entry.jerseyNumber ?? "—"} · {entry.rosterStatus}</p></div><UsersRound className="h-4 w-4 text-[#64748b]" /></div>)}</div>
          {rosterFilter && !visibleRoster.length ? <p className="py-3 text-[11px] text-[#687587]">この登録区分の選手は現在いません。</p> : null}
          <a href={allRoster[0].sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold underline decoration-[#e85d2a] decoration-2 underline-offset-4">OFFICIAL ROSTER <ArrowUpRight className="h-3.5 w-3.5" /></a>
        </> : <div className="border border-dashed border-[#d7d1c4] bg-[#fffdf8] p-3 text-[12px] leading-5 text-[#687587]"><CircleAlert className="mr-1 inline h-3.5 w-3.5 text-[#e85d2a]" />{favorite.code}の公式Rosterを取得後に、選手とステータスを表示します。</div>}
        <div className="mt-3 border-t border-[#eeeae1] pt-3"><p className="font-mono text-[9px] font-bold tracking-[.12em] text-[#64748b]">INJURY OR TRANSACTION RELATED</p>{relatedItems.length ? <div className="mt-1 divide-y divide-[#eeeae1]">{relatedItems.map((item) => <a key={item.id} href={item.sourceUrl} target="_blank" rel="noreferrer" className="block py-2"><div className="flex items-center gap-1.5"><span className={`rounded px-1.5 py-0.5 font-mono text-[8px] font-bold ${item.category === "transaction" ? "bg-[#e8f0fb] text-[#365077]" : "bg-[#fff0e9] text-[#c44719]"}`}>{item.category === "transaction" ? "TRANSACTION" : "INJURY"}</span><p className="min-w-0 flex-1 text-[11px] font-bold leading-4 text-[#10213a]">{item.title}</p></div><p className="mt-0.5 text-[10px] text-[#687587]">{item.sourceName} · {sourceTime(item.publishedAt)} JST</p></a>)}</div> : <p className="mt-1 text-[11px] text-[#687587]">負傷・契約／登録関連の公式記事は現在キャッシュにありません。次回更新で確認します。</p>}{snapshot?.sources.injury && <a href={snapshot.sources.injury} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold underline decoration-[#e85d2a] decoration-2 underline-offset-3">OFFICIAL SOURCE <ArrowUpRight className="h-3 w-3" /></a>}</div>
        <div className="mt-3 border-t border-[#eeeae1] pt-3"><p className="font-mono text-[9px] font-bold tracking-[.12em] text-[#64748b]">TEAM UPDATE WATCH · PFT</p>{pftInsights.length ? <div className="mt-1 divide-y divide-[#eeeae1]">{pftInsights.map((item) => <a key={item.id} href={item.sourceUrl} target="_blank" rel="noreferrer" className="block py-2"><div className="flex items-center gap-2"><span className={`rounded px-1.5 py-0.5 font-mono text-[8px] font-bold ${item.statusLabel === "TRANSACTION" ? "bg-[#e8f0fb] text-[#365077]" : "bg-[#fff0e9] text-[#c44719]"}`}>{item.statusLabel}</span><p className="min-w-0 truncate text-[11px] font-bold leading-4 text-[#10213a]">{item.playerName}</p></div><p className="mt-1 text-[10px] leading-4 text-[#526173]">{item.headline}</p><p className="mt-0.5 text-[10px] text-[#687587]">{item.sourceName} · {sourceTime(item.publishedAt)} JST</p></a>)}</div> : <p className="mt-1 text-[11px] text-[#687587]">PFTの新しい負傷・契約／登録関連記事は現在ありません。</p>}</div>
      </div>
    </div>
  </section>;
}
