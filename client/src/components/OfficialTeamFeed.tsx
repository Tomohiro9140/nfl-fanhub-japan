import React, { useState } from "react";
import { ArrowUpRight, ChevronRight, CircleAlert, Newspaper, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { FavoriteTeam } from "@/lib/nflTeams";

type FeedItem = { id: number; title: string; summary: string | null; japaneseSummary: string | null; sourceUrl: string; sourceName: string; category: "news" | "injury" | "transaction"; publishedAt: Date; fetchedAt: Date };

function displayDate(value: Date) {
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tokyo" }).format(new Date(value));
}

export function OfficialTeamFeed({ favorite }: { favorite: FavoriteTeam }) {
  const [activeItem, setActiveItem] = useState<FeedItem | null>(null);
  const shouldSimulateUnavailable = typeof window !== "undefined" && import.meta.env.DEV && new URLSearchParams(window.location.search).has("feedError");
  const feed = trpc.officialFeed.byTeam.useQuery({ teamCode: shouldSimulateUnavailable ? "XXX" : favorite.code }, { refetchInterval: 15 * 60 * 1000, retry: 1 });
  const displayError = feed.isError || shouldSimulateUnavailable;
  const items = (shouldSimulateUnavailable ? [] : feed.data?.items ?? []) as FeedItem[];
  const byLatest = (left: FeedItem, right: FeedItem) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
  const news = items.filter((item) => item.category === "news").sort(byLatest).slice(0, 3);

  const japaneseSummary = trpc.officialFeed.japaneseSummary.useMutation({
    onSuccess: (result) => {
      if (result.generated && result.summary) {
        setActiveItem((current) => current?.id === result.itemId ? { ...current, japaneseSummary: result.summary } : current);
      }
    },
  });

  const openArticle = (item: FeedItem) => {
    setActiveItem(item);
    japaneseSummary.reset();
    if (!item.japaneseSummary) japaneseSummary.mutate({ itemId: item.id });
  };

  return (
    <section id="updates" className="scroll-mt-24">
      <div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-[#64748b]"><span className="text-[#10213a]">02</span><span>{favorite.code} OFFICIAL FEED</span><span className="h-px flex-1 bg-[#d9d5cc]" /></div>
      <div className="mt-3">
        <article className="clip-note border border-[#ded8cc] bg-white p-3 shadow-[0_10px_30px_rgba(34,42,53,.05)]">
          <div className="flex items-center justify-between border-b border-[#eeeae1] pb-2"><div className="flex items-center gap-2"><div className="grid h-7 w-7 place-items-center bg-[#10213a] text-white"><Newspaper className="h-3.5 w-3.5" /></div><p className="font-display text-lg font-bold tracking-wide">LATEST NEWS</p></div><button onClick={() => feed.refetch()} disabled={feed.isFetching} className="inline-flex items-center gap-1 font-mono text-[9px] font-bold tracking-[.1em] text-[#526173] hover:text-[#e85d2a] disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${feed.isFetching ? "animate-spin" : ""}`} /> REFRESH</button></div>
          {feed.isLoading && !shouldSimulateUnavailable ? <div className="py-5 text-center font-mono text-[10px] text-[#64748b]">LOADING OFFICIAL TEAM FEED…</div> : news.length > 0 ? <div className="divide-y divide-[#eeeae1]">{news.map((item) => <button key={item.id} onClick={() => openArticle(item)} className="flex w-full items-start gap-3 py-2.5 text-left transition hover:bg-[#fffaf0]"><span className="mt-0.5 w-12 shrink-0 font-mono text-[9px] font-bold tracking-[.1em] text-[#e85d2a]">TEAM</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="font-display text-base font-bold tracking-wide">{item.title}</span><ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#94a3b8]" /></span><span className="mt-0.5 block text-[11px] leading-4 text-[#687587]">{item.summary || "公式記事の詳細を開く"}</span></span><span className="hidden font-mono text-[8px] text-[#94a3b8] sm:block">{displayDate(item.publishedAt)}</span></button>)}</div> : <EmptyFeed teamCode={favorite.code} error={displayError} />}
        </article>
      </div>
      {displayError && <div className="mt-2 flex items-center gap-1.5 border border-[#f1c7b5] bg-[#fff4ef] px-3 py-2 font-mono text-[9px] font-bold tracking-[.06em] text-[#a34220]"><CircleAlert className="h-3.5 w-3.5 shrink-0" />LIVE REFRESH UNAVAILABLE — SHOWING LAST SAVED OFFICIAL ITEMS</div>}
      <Dialog open={Boolean(activeItem)} onOpenChange={(open) => !open && setActiveItem(null)}>
        <DialogContent className="border-[#d7d1c4] bg-[#f5f2ea] p-5 sm:max-w-lg"><DialogHeader className="text-left"><p className="font-mono text-[10px] font-bold tracking-[.16em] text-[#e85d2a]">{activeItem?.category === "injury" ? "INJURY WATCH" : "OFFICIAL TEAM NEWS"}</p><DialogTitle className="pr-7 font-display text-2xl font-extrabold leading-[.95] tracking-[.04em]">{activeItem?.title}</DialogTitle><DialogDescription className="font-mono text-[10px]">{activeItem ? `${activeItem.sourceName} · ${displayDate(activeItem.publishedAt)} JST` : ""}</DialogDescription></DialogHeader><div className="border-y border-[#d7d1c4] py-4"><p className="mb-2 font-mono text-[9px] font-bold tracking-[.14em] text-[#e85d2a]">日本語要約</p><div className="whitespace-pre-line text-[14px] leading-6 text-[#334155]">{japaneseSummary.isPending && !activeItem?.japaneseSummary ? "公式記事を読み込み、日本語要約を生成しています…" : activeItem?.japaneseSummary || japaneseSummary.data?.summary || activeItem?.summary || "公式記事の要約が提供されていません。原文で詳細をご確認ください。"}</div>{japaneseSummary.data && !japaneseSummary.data.generated && <p className="mt-3 text-[11px] leading-4 text-[#687587]">日本語要約を生成できなかったため、公式RSSの概要を表示しています。</p>}</div>{activeItem && <a href={activeItem.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 bg-[#10213a] px-4 font-sans text-[13px] font-bold text-white transition hover:bg-[#203a61] active:scale-[.97]">READ ON OFFICIAL SITE <ArrowUpRight className="h-4 w-4" /></a>}</DialogContent>
      </Dialog>
    </section>
  );
}

function EmptyFeed({ teamCode, error }: { teamCode: string; error: boolean }) {
  return <div className="py-5 text-center"><p className="font-display text-base font-bold tracking-wide">{error ? "OFFICIAL SOURCE UNAVAILABLE" : "WAITING FOR OFFICIAL UPDATE"}</p><p className="mt-1 text-[11px] leading-4 text-[#687587]">{teamCode}の公式フィードを確認中です。取得後に最新記事を表示します。</p></div>;
}
