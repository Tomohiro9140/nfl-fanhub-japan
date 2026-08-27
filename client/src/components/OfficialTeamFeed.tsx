import React, { useMemo } from "react";
import { ArrowUpRight, BadgeCheck, CircleAlert, Newspaper, Radio, RefreshCw, Tv } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { hasDistinctNewsSummary } from "@/lib/newsSummary";
import { dedupeDisplayArticles } from "@/lib/articleDedup";
import type { FavoriteTeam } from "@/lib/nflTeams";
import { NEWS_SUMMARIES_ENABLED } from "@shared/newsSummaryFeature";

type SourceKind = "team_official" | "nfl_official" | "pft" | "cbs";
type FeedItem = { id: number; title: string; summary: string | null; sourceUrl: string; sourceName: string; sourceKind: SourceKind; category: "news" | "injury" | "transaction"; publishedAt: Date; fetchedAt: Date };
type CompletedGame = { gameState: string | null; gameDate?: string | null; finishedAt?: Date | null; kickoffAt: Date; kickoffAtEstimated?: boolean };
const externalSourceKinds = new Set<SourceKind>(["pft", "cbs"]);

function isRosterMoveNews(item: FeedItem) {
  if (item.sourceKind !== "team_official") return false;
  const text = `${item.title} ${item.sourceUrl}`.toLowerCase();
  if (/\b(?:autographs?|signature event|signed poster|signed memorabilia)\b/.test(text)) return false;
  return /\b(?:transactions?|roster moves?|sign(?:ed|s)?|released?|waived|waivers?|claimed|claim|trade(?:d)?|contract(?: extension)?|extensions?|activated?|designated (?:for|to return)|placed on (?:injured reserve|ir|pup))\b/.test(text);
}

function sourceLabel(kind: SourceKind) {
  if (kind === "pft") return "PFT";
  if (kind === "cbs") return "CBS";
  return "OFFICIAL";
}

function SourceMark({ kind }: { kind: SourceKind }) {
  const label = sourceLabel(kind);
  const Icon = kind === "pft" ? Radio : kind === "cbs" ? Tv : BadgeCheck;
  const tone = kind === "pft" ? "border-[#bfd0e8] bg-[#eff5fb] text-[#23527d]" : kind === "cbs" ? "border-[#e7c5bf] bg-[#fff4ef] text-[#a34220]" : "border-[#cfe6c4] bg-[#f0f8eb] text-[#426237]";
  return <span className={`mt-0.5 inline-flex h-5 w-[58px] shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap border px-1 font-mono text-[8px] font-bold tracking-[.08em] ${tone}`}><Icon className="h-2.5 w-2.5 shrink-0" />{label}</span>;
}

/** Hides all coverage from the official kickoff, or from gameDate UTC midnight only when kickoff is unavailable. */
export function spoilerNewsCutoff(game?: CompletedGame) {
  if (!game) return null;
  // All persisted timestamps are UTC instants. Prefer the precise official kickoff in every normal case.
  const kickoffAt = new Date(game.kickoffAt);
  if (!game.kickoffAtEstimated && !Number.isNaN(kickoffAt.getTime())) return kickoffAt;
  // A live scoreboard can lack an official kickoff. Only in that fallback case, retain the requested gameDate UTC boundary.
  const gameDateCutoff = game.gameDate ? new Date(`${game.gameDate}T00:00:00.000Z`) : null;
  return gameDateCutoff && !Number.isNaN(gameDateCutoff.getTime()) ? gameDateCutoff : null;
}

/** A live game with neither official kickoff nor gameDate has no trustworthy boundary, so hide safely until official data arrives. */
export function shouldHideAllSpoilerNews(game?: CompletedGame) {
  return Boolean(game?.kickoffAtEstimated && !game.gameDate && /live|ingame|in_progress|halftime/i.test(game.gameState ?? ""));
}

/** Keeps official stories foremost while reserving room for one PFT and one CBS team story when available. */
export function selectLatestNews(items: FeedItem[], hideFrom?: Date | null, hideAll = false) {
  const sorted = dedupeDisplayArticles([...items].filter((item) => !hideAll && item.category === "news" && !isRosterMoveNews(item) && (!hideFrom || new Date(item.publishedAt).getTime() < hideFrom.getTime())).sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()));
  const official = sorted.filter((item) => !externalSourceKinds.has(item.sourceKind));
  const selected = [...official.slice(0, 3)];
  for (const kind of ["pft", "cbs"] as const) {
    const item = sorted.find((candidate) => candidate.sourceKind === kind);
    if (item) selected.push(item);
  }
  const selectedIds = new Set(selected.map((item) => item.id));
  for (const item of sorted) {
    if (selected.length >= 5) break;
    if (!selectedIds.has(item.id)) {
      selectedIds.add(item.id);
      selected.push(item);
    }
  }
  return selected.slice(0, 5);
}

function displayDate(value: Date) {
  return `${new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tokyo" }).format(new Date(value))} JST`;
}

export function OfficialTeamFeed({ favorite, spoilerMode = false, completedGame }: { favorite: FavoriteTeam; spoilerMode?: boolean; completedGame?: CompletedGame }) {
  const shouldSimulateUnavailable = typeof window !== "undefined" && import.meta.env.DEV && new URLSearchParams(window.location.search).has("feedError");
  const feedInput = useMemo(() => ({ teamCode: shouldSimulateUnavailable ? "XXX" : favorite.code }), [shouldSimulateUnavailable, favorite.code]);
  const feed = trpc.officialFeed.byTeam.useQuery(feedInput, { refetchInterval: 15 * 60 * 1000, staleTime: 15 * 60 * 1000, refetchOnWindowFocus: false, refetchOnReconnect: false, retry: 1 });
  const displayError = feed.isError || shouldSimulateUnavailable;
  const items = (shouldSimulateUnavailable ? [] : feed.data?.items ?? []) as FeedItem[];
  const hideFrom = spoilerMode ? spoilerNewsCutoff(completedGame) : null;
  const hideAll = spoilerMode && shouldHideAllSpoilerNews(completedGame);
  const news = useMemo(() => selectLatestNews(items, hideFrom, hideAll), [items, hideFrom, hideAll]);
  return (
    <section id="updates" className="scroll-mt-24">
      <div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-[#64748b]"><span className="text-[#10213a]">02</span><span>{favorite.code} NEWS DESK</span><span className="h-px flex-1 bg-[#d9d5cc]" /></div>
      <div className="mt-3">
        <article className="clip-note border border-[#ded8cc] bg-white p-3 shadow-[0_10px_30px_rgba(34,42,53,.05)]">
          <div className="flex items-center justify-between border-b border-[#eeeae1] pb-2"><div className="flex items-center gap-2"><div className="grid h-7 w-7 place-items-center bg-[#10213a] text-white"><Newspaper className="h-3.5 w-3.5" /></div><p className="font-display text-lg font-bold tracking-wide">LATEST NEWS</p></div><button onClick={() => feed.refetch()} disabled={feed.isFetching} className="inline-flex items-center gap-1 font-mono text-[9px] font-bold tracking-[.1em] text-[#526173] hover:text-[#e85d2a] disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${feed.isFetching ? "animate-spin" : ""}`} /> REFRESH</button></div>
          {feed.isLoading && !shouldSimulateUnavailable ? <div className="py-5 text-center font-mono text-[10px] text-[#64748b]">LOADING TEAM NEWS…</div> : news.length > 0 ? <div className="divide-y divide-[#eeeae1]">{news.map((item) => <a key={item.id} href={item.sourceUrl} target="_blank" rel="noreferrer" data-feed-article="latest-news" data-article-url={item.sourceUrl} aria-label={`${item.title}を${sourceLabel(item.sourceKind)}で開く`} className="group flex w-full items-start gap-3 py-2.5 text-left transition hover:bg-[#fffaf0] active:bg-[#fff4ef]"><SourceMark kind={item.sourceKind} /><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="font-display text-base font-bold tracking-wide">{item.title}</span><ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#94a3b8] transition group-hover:text-[#e85d2a]" /></span>{hasDistinctNewsSummary(item.title, item.summary) ? <span className="mt-0.5 block text-[11px] leading-4 text-[#687587]">{item.summary}</span> : null}<span className="mt-1 block font-mono text-[8px] font-bold tracking-[.05em] text-[#94a3b8]">PUBLISHED · {displayDate(item.publishedAt)}</span></span></a>)}</div> : <EmptyFeed teamCode={favorite.code} error={displayError} />}
        </article>
      </div>
      {displayError && <div className="mt-2 flex items-center gap-1.5 border border-[#f1c7b5] bg-[#fff4ef] px-3 py-2 font-mono text-[9px] font-bold tracking-[.06em] text-[#a34220]"><CircleAlert className="h-3.5 w-3.5 shrink-0" />LIVE REFRESH UNAVAILABLE — SHOWING LAST SAVED OFFICIAL ITEMS</div>}
    </section>
  );
}

function EmptyFeed({ teamCode, error }: { teamCode: string; error: boolean }) {
  return <div className="py-5 text-center"><p className="font-display text-base font-bold tracking-wide">{error ? "OFFICIAL SOURCE UNAVAILABLE" : "WAITING FOR OFFICIAL UPDATE"}</p><p className="mt-1 text-[11px] leading-4 text-[#687587]">{teamCode}の公式フィードを確認中です。取得後に最新記事を表示します。</p></div>;
}
