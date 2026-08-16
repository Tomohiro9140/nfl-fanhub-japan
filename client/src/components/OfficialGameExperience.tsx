import { ArrowUpRight, CalendarDays, CircleAlert, Clock3, FileText, ShieldCheck, Tv, UsersRound } from "lucide-react";
import { getTeamByCode, type FavoriteTeam } from "@/lib/nflTeams";
import { confirmedVenue } from "@/lib/gameVenue";
import { daznNflGamePassUrl, daznWatchTarget } from "@/lib/daznWatch";

const daznGamePassUrl = daznNflGamePassUrl;

export type TeamSnapshot = {
  nextGame?: { opponentCode: string; homeAway: "home" | "away"; seasonPhase: "preseason" | "regular" | "postseason"; weekLabel: string | null; kickoffAt: Date; venue: string | null; broadcast: string | null; sourceUrl: string; fetchedAt: Date };
  roster: Array<{ id: number; playerName: string; jerseyNumber: string | null; position: string; rosterStatus: string; sourceUrl: string; fetchedAt: Date }>;
  rosterCounts: Array<{ status: string; count: number }>;
  injuries: Array<{ id: number; title: string; sourceName: string; sourceUrl: string; publishedAt: Date }>;
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

function scheduleSourceLabel(sourceUrl?: string | null) {
  return sourceUrl?.includes("nfl.com/schedules/") ? "NFL OFFICIAL SCHEDULE" : "TEAM OFFICIAL SCHEDULE";
}

function EmptyOfficial({ label, copy }: { label: string; copy: string }) {
  return <div className="border border-dashed border-white/30 bg-white/5 p-3 text-[12px] leading-5 text-[#d9e3f3]"><CircleAlert className="mr-1 inline h-3.5 w-3.5 text-[#ffc1a7]" /> <strong>{label}</strong><br />{copy}</div>;
}

export function OfficialGameTicket({ favorite, snapshot, loading, spoilerMode }: { favorite: FavoriteTeam; snapshot?: TeamSnapshot; loading: boolean; spoilerMode: boolean }) {
  const game = snapshot?.nextGame;
  const opponent = getTeamByCode(game?.opponentCode ?? null);
  const watchTarget = typeof navigator === "undefined" ? "_blank" : daznWatchTarget(navigator.userAgent);
  return <section data-layout-scope="hero" className="ticket-cut ticket-paper relative overflow-hidden rounded-[18px] bg-[#0a1931] text-[#fffaf0] shadow-[0_24px_50px_rgba(10,25,49,0.2)]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_5%,rgba(56,189,248,.19),transparent_30%),linear-gradient(115deg,#0a1931,#112a4b)]" />
    <div className="relative p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] font-bold tracking-[.18em] text-[#ffc1a7]">GAME TICKET / {game ? `${game.seasonPhase.toUpperCase()} ${game.weekLabel ?? ""}` : "OFFICIAL SCHEDULE"}</p><p className="mt-2 font-display text-2xl font-extrabold tracking-[.08em] text-white">NEXT GAME</p></div><CalendarDays className="mt-1 h-5 w-5 text-[#ffc1a7]" /></div>
      {loading ? <p className="mt-5 font-mono text-[11px] text-[#d9e3f3]">LOADING OFFICIAL SCHEDULE…</p> : game && opponent ? <><div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3"><div><p className="font-display text-base font-bold leading-tight">{favorite.name}</p></div><div className="border-x border-dashed border-white/25 px-3 text-center"><p className="font-mono text-[9px] font-semibold tracking-[.14em] text-[#a5b3c9]">JST</p><p className="mt-1 font-display text-lg font-extrabold leading-none">{fmtDate(game.kickoffAt)}</p>{confirmedVenue(game.venue) ? <p className="mt-1 text-[10px] text-[#ffc1a7]">{confirmedVenue(game.venue)}</p> : null}</div><div className="text-right"><p className="font-display text-base font-bold leading-tight">{opponent.name}</p></div></div><p className="mt-3 font-mono text-[9px] tracking-[.08em] text-[#d9e3f3]">{[game.broadcast, scheduleSourceLabel(game.sourceUrl)].filter(Boolean).join(" · ")}</p></> : <div className="mt-4"><EmptyOfficial label="OFFICIAL SCHEDULE PENDING" copy="NFL公式リーグ日程とチーム公式Scheduleを確認後に表示します。" /></div>}
      <div className="ticket-rule mt-4 pt-3"><a href={daznGamePassUrl} target={watchTarget} rel="noreferrer" className="inline-flex min-h-10 w-full items-center justify-center gap-2 bg-[#e85d2a] px-3 font-sans text-[13px] font-bold text-white transition hover:bg-[#cf4f20] active:scale-[.97]" aria-label="DAZN NFL Game Passを開いて観戦する"><Tv className="h-4 w-4" /> 観戦する <ArrowUpRight className="h-4 w-4" /></a><p className="mt-1.5 text-center font-mono text-[9px] text-[#a5b3c9]">DAZN NFL GAME PASS · APP / BROWSER</p></div>
      {game && <a href={game.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 font-mono text-[9px] text-[#d9e3f3] underline underline-offset-2">OFFICIAL SCHEDULE <ArrowUpRight className="h-3 w-3" /></a>}
      {spoilerMode && <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#d5f4ca]"><ShieldCheck className="h-3.5 w-3.5" /> SPOILER SAFE / 結果は非表示です</p>}
    </div>
  </section>;
}

export function OfficialHuddle({ favorite, snapshot }: { favorite: FavoriteTeam; snapshot?: TeamSnapshot }) {
  const game = snapshot?.nextGame;
  return <section id="home" data-layout-scope="huddle" className="scroll-mt-24"><div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-[#64748b]"><span className="text-[#10213a]">01</span><span>YOUR HUDDLE</span><span className="h-px flex-1 bg-[#d9d5cc]" /></div><div className="mt-3 grid gap-3 sm:grid-cols-[1.15fr_.85fr]"><article className="clip-note border border-[#ded8cc] bg-white p-3 shadow-[0_10px_30px_rgba(34,42,53,.05)]"><div className="flex items-start justify-between gap-3"><div><p className="font-display text-base font-bold tracking-wide">OFFICIAL STATUS</p><p className="mt-1 text-[11px] text-[#687587]">更新 {sourceTime(snapshot?.lastUpdatedAt)} JST</p></div><span className="rounded-full bg-[#e7f5dd] px-2 py-1 font-mono text-[9px] font-bold text-[#3f6d27]">LIVE CACHE</span></div><div className="mt-3 divide-y divide-[#eeeae1]"><p className="py-2 text-[13px] font-medium">{game ? `${favorite.code} ${game.homeAway === "away" ? "@" : "vs."} ${game.opponentCode} · ${fmtDate(game.kickoffAt)} JST` : "次戦情報をNFL公式リーグ日程から取得中です"}</p><p className="py-2 text-[13px] font-medium">{snapshot?.injuries[0] ? `INJURY · ${snapshot.injuries[0].title}` : "負傷関連の公式更新は現在ありません"}</p></div></article><article className="margin-note relative overflow-hidden bg-[#e9e3d6] p-4"><div className="relative z-10"><p className="font-mono text-[10px] font-bold tracking-[.16em] text-[#657084]">SOURCE STATUS</p><p className="mt-1 font-display text-xl font-extrabold tracking-wide">{snapshot?.roster.length ? `${snapshot.roster.length} ROSTERED` : "WAITING FOR ROSTER"}</p><p className="mt-3 text-[11px] leading-4 text-[#526173]">NFL公式リーグ日程を優先し、チーム公式Schedule、Roster、Newsで補完します。</p></div></article></div></section>;
}

export function OfficialGameNotes({ favorite, snapshot }: { favorite: FavoriteTeam; snapshot?: TeamSnapshot }) {
  const game = snapshot?.nextGame;
  const notes = [
    { label: "NEXT GAME", title: game ? `${favorite.code} ${game.homeAway === "away" ? "@" : "VS"} ${game.opponentCode}` : "OFFICIAL SCHEDULE PENDING", copy: game ? `${fmtDate(game.kickoffAt)} JST${confirmedVenue(game.venue) ? ` · ${confirmedVenue(game.venue)}` : ""}` : "チーム公式Scheduleの更新を待っています。", url: game?.sourceUrl },
    { label: "INJURY", title: snapshot?.injuries[0]?.title ?? "NO OFFICIAL INJURY UPDATE", copy: snapshot?.injuries[0] ? `${snapshot.injuries[0].sourceName} · ${sourceTime(snapshot.injuries[0].publishedAt)} JST` : "NFL公式・チーム公式の負傷者更新を確認中です。", url: snapshot?.injuries[0]?.sourceUrl },
    { label: "TEAM NEWS", title: snapshot?.news[0]?.title ?? "NO OFFICIAL TEAM NEWS", copy: snapshot?.news[0]?.summary ?? "チーム公式RSSの次回更新を待っています。", url: snapshot?.news[0]?.sourceUrl },
  ];
  return <section id="briefing" data-layout-scope="briefing" className="scroll-mt-24"><div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-[#64748b]"><span className="text-[#10213a]">03</span><span>OFFICIAL BRIEFING</span><span className="h-px flex-1 bg-[#d9d5cc]" /></div><div className="briefing-sheet mt-3 bg-white p-3 shadow-[0_10px_30px_rgba(34,42,53,.05)] ring-1 ring-[#ded8cc]"><div className="flex items-end justify-between gap-3"><div><h2 className="font-display text-xl font-extrabold tracking-[.08em]">GAME NOTES</h2><p className="mt-0.5 text-[11px] text-[#687587]">OFFICIAL SOURCES ONLY · UPDATED {sourceTime(snapshot?.lastUpdatedAt)} JST</p></div><FileText className="h-4 w-4 text-[#e85d2a]" /></div><div className="mt-3 grid gap-2">{notes.map((note, index) => <article key={note.label} className="briefing-row border border-[#e9e3d6] bg-[#fffdf8] p-3.5"><div className="flex gap-3"><span className="font-display text-2xl font-black leading-none text-[#e85d2a]">0{index + 1}</span><div className="min-w-0 flex-1"><p className="font-mono text-[9px] font-bold tracking-[.15em] text-[#64748b]">{note.label}</p><h3 className="mt-1 font-display text-base font-bold leading-tight tracking-wide">{note.title}</h3><p className="mt-1.5 text-[12px] leading-[1.45] text-[#526173]">{note.copy}</p>{note.url ? <a href={note.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold underline decoration-[#e85d2a] decoration-2 underline-offset-3">OFFICIAL SOURCE <ArrowUpRight className="h-3 w-3" /></a> : <p className="mt-2 font-mono text-[9px] text-[#9a7560]">SOURCE LINK AVAILABLE AFTER NEXT OFFICIAL FETCH</p>}</div></div></article>)}</div>{!snapshot?.lastUpdatedAt && <div className="mt-3 border border-dashed border-[#d7d1c4] bg-[#fffdf8] p-3 text-[11px] text-[#687587]"><CircleAlert className="mr-1 inline h-3.5 w-3.5 text-[#e85d2a]" />公式データの初回取得を待っています。固定の試合分析は表示しません。</div>}</div></section>;
}

export function OfficialStatusRadar({ favorite, snapshot, loading }: { favorite: FavoriteTeam; snapshot?: TeamSnapshot; loading: boolean }) {
  const roster = snapshot?.roster.slice(0, 3) ?? [];
  return <section id="status" data-layout-scope="roster" className="scroll-mt-24"><div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-[#64748b]"><span className="text-[#10213a]">04</span><span>STATUS RADAR</span><span className="h-px flex-1 bg-[#d9d5cc]" /></div><div className="roster-slip mt-3 overflow-hidden border border-[#ded8cc] bg-white shadow-[0_10px_30px_rgba(34,42,53,.05)]"><div className="bg-[#0a1931] p-4 text-white"><p className="font-mono text-[9px] font-bold tracking-[.15em] text-[#ffc1a7]">OFFICIAL ROSTER / INJURY / TRANSACTION</p><h2 className="mt-1 font-display text-2xl font-extrabold leading-[.9] tracking-wide">STATUS RADAR</h2><p className="mt-2 text-[11px] text-[#d9e3f3]">LAST UPDATE {sourceTime(snapshot?.lastUpdatedAt)} JST</p></div><div className="p-3">{loading ? <p className="py-5 text-center font-mono text-[10px] text-[#64748b]">LOADING OFFICIAL ROSTER…</p> : roster.length ? <><div className="mb-2 flex flex-wrap gap-1.5">{snapshot?.rosterCounts.map((item) => <span key={item.status} className="rounded bg-[#eef2f8] px-2 py-1 font-mono text-[9px] font-bold text-[#365077]">{item.status.toUpperCase()} {item.count}</span>)}</div><div className="divide-y divide-[#eeeae1]">{roster.map((entry) => <div key={entry.id} className="flex items-center gap-3 py-2.5"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#e9e3d6] font-mono text-[9px] font-bold">{entry.position}</span><div className="min-w-0 flex-1"><p className="text-[13px] font-bold text-[#10213a]">{entry.playerName}</p><p className="mt-0.5 text-[11px] text-[#687587]">#{entry.jerseyNumber ?? "—"} · {entry.rosterStatus}</p></div><UsersRound className="h-4 w-4 text-[#64748b]" /></div>)}</div><a href={roster[0].sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold underline decoration-[#e85d2a] decoration-2 underline-offset-4">OFFICIAL ROSTER <ArrowUpRight className="h-3.5 w-3.5" /></a></> : <div className="border border-dashed border-[#d7d1c4] bg-[#fffdf8] p-3 text-[12px] leading-5 text-[#687587]"><CircleAlert className="mr-1 inline h-3.5 w-3.5 text-[#e85d2a]" />{favorite.code}の公式Rosterを取得後に、選手とステータスを表示します。</div>}<div className="mt-3 border-t border-[#eeeae1] pt-3"><p className="font-mono text-[9px] font-bold tracking-[.12em] text-[#64748b]">OFFICIAL INJURY ITEMS</p>{snapshot?.injuries.length ? <div className="mt-1 divide-y divide-[#eeeae1]">{snapshot.injuries.map((item) => <a key={item.id} href={item.sourceUrl} target="_blank" rel="noreferrer" className="block py-2"><p className="text-[11px] font-bold leading-4 text-[#10213a]">{item.title}</p><p className="mt-0.5 text-[10px] text-[#687587]">{item.sourceName} · {sourceTime(item.publishedAt)} JST</p></a>)}</div> : <p className="mt-1 text-[11px] text-[#687587]">負傷関連の公式記事は現在キャッシュにありません。次回更新で確認します。</p>}{snapshot?.sources.injury && <a href={snapshot.sources.injury} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold underline decoration-[#e85d2a] decoration-2 underline-offset-3">OFFICIAL INJURY SOURCE <ArrowUpRight className="h-3 w-3" /></a>}</div></div></div></section>;
}
