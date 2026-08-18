import React, { useMemo } from "react";
import { ArrowUpRight, BadgeCheck, CircleAlert, Newspaper, Radio, RefreshCw, Tv } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { hasDistinctNewsSummary } from "@/lib/newsSummary";
import type { FavoriteTeam } from "@/lib/nflTeams";

type SourceKind = "team_official" | "nfl_official" | "pft" | "cbs";
type FeedItem = { id: number; title: string; summary: string | null; japaneseSummary: string | null; englishSummary: string | null; sourceUrl: string; sourceName: string; sourceKind: SourceKind; category: "news" | "injury" | "transaction"; publishedAt: Date; fetchedAt: Date };
const externalSourceKinds = new Set<SourceKind>(["pft", "cbs"]);

/** AI article summaries are deliberately frozen until the user explicitly re-enables this feature. */
export const NEWS_SUMMARIES_ENABLED = false;

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

/** Keeps official stories foremost while reserving room for one PFT and one CBS team story when available. */
export function selectLatestNews(items: FeedItem[]) {
  const sorted = [...items].filter((item) => item.category === "news" && !isRosterMoveNews(item)).sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime());
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
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tokyo" }).format(new Date(value));
}

export function OfficialTeamFeed({ favorite }: { favorite: FavoriteTeam }) {
  const shouldSimulateUnavailable = typeof window !== "undefined" && import.meta.env.DEV && new URLSearchParams(window.location.search).has("feedError");
  const feedInput = useMemo(() => ({ teamCode: shouldSimulateUnavailable ? "XXX" : favorite.code }), [shouldSimulateUnavailable, favorite.code]);
  const feed = trpc.officialFeed.byTeam.useQuery(feedInput, { refetchInterval: 15 * 60 * 1000, staleTime: 15 * 60 * 1000, refetchOnWindowFocus: false, refetchOnReconnect: false, retry: 1 });
  const displayError = feed.isError || shouldSimulateUnavailable;
  const items = (shouldSimulateUnavailable ? [] : feed.data?.items ?? []) as FeedItem[];
  const news = useMemo(() => selectLatestNews(items), [items]);
  return (
    <section id="updates" className="scroll-mt-24">
      <div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-[#64748b]"><span className="text-[#10213a]">02</span><span>{favorite.code} NEWS DESK</span><span className="h-px flex-1 bg-[#d9d5cc]" /></div>
      <div className="mt-3">
        <article className="clip-note border border-[#ded8cc] bg-white p-3 shadow-[0_10px_30px_rgba(34,42,53,.05)]">
          <div className="flex items-center justify-between border-b border-[#eeeae1] pb-2"><div className="flex items-center gap-2"><div className="grid h-7 w-7 place-items-center bg-[#10213a] text-white"><Newspaper className="h-3.5 w-3.5" /></div><p className="font-display text-lg font-bold tracking-wide">LATEST NEWS</p></div><button onClick={() => feed.refetch()} disabled={feed.isFetching} className="inline-flex items-center gap-1 font-mono text-[9px] font-bold tracking-[.1em] text-[#526173] hover:text-[#e85d2a] disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${feed.isFetching ? "animate-spin" : ""}`} /> REFRESH</button></div>
          {feed.isLoading && !shouldSimulateUnavailable ? <div className="py-5 text-center font-mono text-[10px] text-[#64748b]">LOADING TEAM NEWS…</div> : news.length > 0 ? <div className="divide-y divide-[#eeeae1]">{news.map((item) => <a key={item.id} href={item.sourceUrl} target="_blank" rel="noreferrer" aria-label={`${item.title}を${sourceLabel(item.sourceKind)}で開く`} className="group flex w-full items-start gap-3 py-2.5 text-left transition hover:bg-[#fffaf0] active:bg-[#fff4ef]"><SourceMark kind={item.sourceKind} /><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="font-display text-base font-bold tracking-wide">{item.title}</span><ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#94a3b8] transition group-hover:text-[#e85d2a]" /></span>{hasDistinctNewsSummary(item.title, item.summary) ? <span className="mt-0.5 block text-[11px] leading-4 text-[#687587]">{item.summary}</span> : null}</span><span className="hidden font-mono text-[8px] text-[#94a3b8] sm:block">{displayDate(item.publishedAt)}</span></a>)}</div> : <EmptyFeed teamCode={favorite.code} error={displayError} />}
        </article>
      </div>
      {displayError && <div className="mt-2 flex items-center gap-1.5 border border-[#f1c7b5] bg-[#fff4ef] px-3 py-2 font-mono text-[9px] font-bold tracking-[.06em] text-[#a34220]"><CircleAlert className="h-3.5 w-3.5 shrink-0" />LIVE REFRESH UNAVAILABLE — SHOWING LAST SAVED OFFICIAL ITEMS</div>}
    </section>
  );
}

function EmptyFeed({ teamCode, error }: { teamCode: string; error: boolean }) {
  return <div className="py-5 text-center"><p className="font-display text-base font-bold tracking-wide">{error ? "OFFICIAL SOURCE UNAVAILABLE" : "WAITING FOR OFFICIAL UPDATE"}</p><p className="mt-1 text-[11px] leading-4 text-[#687587]">{teamCode}の公式フィードを確認中です。取得後に最新記事を表示します。</p></div>;
}
