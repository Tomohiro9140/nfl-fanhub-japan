import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, BadgeCheck, ChevronRight, CircleAlert, Newspaper, Radio, RefreshCw, Tv } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { compactJapaneseSummary } from "@/lib/newsSummary";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { FavoriteTeam } from "@/lib/nflTeams";

type SourceKind = "team_official" | "nfl_official" | "pft" | "cbs";
type FeedItem = { id: number; title: string; summary: string | null; japaneseSummary: string | null; englishSummary: string | null; sourceUrl: string; sourceName: string; sourceKind: SourceKind; category: "news" | "injury" | "transaction"; publishedAt: Date; fetchedAt: Date };
type SummaryMode = "ja" | "en";

const externalSourceKinds = new Set<SourceKind>(["pft", "cbs"]);

function sourceLabel(kind: SourceKind) {
  if (kind === "pft") return "PFT";
  if (kind === "cbs") return "CBS";
  return "OFFICIAL";
}

function SourceMark({ kind }: { kind: SourceKind }) {
  const label = sourceLabel(kind);
  const Icon = kind === "pft" ? Radio : kind === "cbs" ? Tv : BadgeCheck;
  const tone = kind === "pft" ? "border-[#bfd0e8] bg-[#eff5fb] text-[#23527d]" : kind === "cbs" ? "border-[#e7c5bf] bg-[#fff4ef] text-[#a34220]" : "border-[#cfe6c4] bg-[#f0f8eb] text-[#426237]";
  return <span className={`mt-0.5 inline-flex w-12 shrink-0 items-center gap-1 border px-1 py-0.5 font-mono text-[8px] font-bold tracking-[.08em] ${tone}`}><Icon className="h-2.5 w-2.5" />{label}</span>;
}

/** Keeps official stories foremost while reserving room for one PFT and one CBS team story when available. */
export function selectLatestNews(items: FeedItem[]) {
  const sorted = [...items].filter((item) => item.category === "news").sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime());
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
  const [activeItem, setActiveItem] = useState<FeedItem | null>(null);
  const [detailLanguage, setDetailLanguage] = useState<SummaryMode>("ja");
  const [warmedSummaries, setWarmedSummaries] = useState<Record<number, string>>({});
  const warmedItemIds = useRef(new Set<number>());
  const shouldSimulateUnavailable = typeof window !== "undefined" && import.meta.env.DEV && new URLSearchParams(window.location.search).has("feedError");
  const feed = trpc.officialFeed.byTeam.useQuery({ teamCode: shouldSimulateUnavailable ? "XXX" : favorite.code }, { refetchInterval: 15 * 60 * 1000, retry: 1 });
  const displayError = feed.isError || shouldSimulateUnavailable;
  const items = (shouldSimulateUnavailable ? [] : feed.data?.items ?? []) as FeedItem[];
  const news = useMemo(() => selectLatestNews(items), [items]);
  const newsSignature = news.map((item) => `${item.id}:${Boolean(item.japaneseSummary)}`).join(",");

  const japaneseSummary = trpc.officialFeed.japaneseSummary.useMutation({
    onSuccess: (result) => {
      const generatedSummary: string | undefined = result.generated && typeof result.summary === "string" ? result.summary : undefined;
      if (generatedSummary) {
        setWarmedSummaries((current) => ({ ...current, [result.itemId]: generatedSummary }));
        setActiveItem((current) => current?.id === result.itemId ? { ...current, japaneseSummary: generatedSummary } : current);
      }
    },
  });
  const warmJapaneseSummary = trpc.officialFeed.japaneseSummary.useMutation({
    onSuccess: (result) => {
      const generatedSummary: string | undefined = result.generated && typeof result.summary === "string" ? result.summary : undefined;
      if (generatedSummary) setWarmedSummaries((current) => ({ ...current, [result.itemId]: generatedSummary }));
    },
  });
  const englishSummary = trpc.officialFeed.englishSummary.useMutation({
    onSuccess: (result) => {
      const generatedSummary: string | undefined = result.generated && typeof result.summary === "string" ? result.summary : undefined;
      if (generatedSummary) setActiveItem((current) => current?.id === result.itemId ? { ...current, englishSummary: generatedSummary } : current);
    },
  });

  useEffect(() => {
    const candidates = news.filter((item) => !item.japaneseSummary && !warmedItemIds.current.has(item.id));
    if (!candidates.length) return;
    const timer = window.setTimeout(() => {
      void (async () => {
        for (const item of candidates) {
          warmedItemIds.current.add(item.id);
          try {
            await warmJapaneseSummary.mutateAsync({ itemId: item.id });
          } catch {
            // Clicking the article still shows an RSS fallback if background warm-up fails.
          }
        }
      })();
    }, 700);
    return () => window.clearTimeout(timer);
  }, [favorite.code, newsSignature]);

  const openArticle = (item: FeedItem) => {
    setActiveItem(item);
    setDetailLanguage("ja");
    japaneseSummary.reset();
    englishSummary.reset();
    if (!externalSourceKinds.has(item.sourceKind) && !item.japaneseSummary && !warmedSummaries[item.id] && !warmedItemIds.current.has(item.id)) {
      warmedItemIds.current.add(item.id);
      japaneseSummary.mutate({ itemId: item.id });
    }
    if (!externalSourceKinds.has(item.sourceKind) && !item.englishSummary) englishSummary.mutate({ itemId: item.id });
  };

  const activeJapaneseSummary = activeItem ? activeItem.japaneseSummary || warmedSummaries[activeItem.id] || (japaneseSummary.data?.itemId === activeItem.id ? japaneseSummary.data.summary : null) : null;
  const activeEnglishSummary = activeItem ? activeItem.englishSummary || (englishSummary.data?.itemId === activeItem.id ? englishSummary.data.summary : null) : null;
  const displayedJapaneseSummary = activeJapaneseSummary ? compactJapaneseSummary(activeJapaneseSummary) : null;
  const showEnglishSummary = () => {
    if (!activeItem) return;
    setDetailLanguage("en");
    if (!activeEnglishSummary) englishSummary.mutate({ itemId: activeItem.id });
  };
  return (
    <section id="updates" className="scroll-mt-24">
      <div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-[#64748b]"><span className="text-[#10213a]">02</span><span>{favorite.code} NEWS DESK</span><span className="h-px flex-1 bg-[#d9d5cc]" /></div>
      <div className="mt-3">
        <article className="clip-note border border-[#ded8cc] bg-white p-3 shadow-[0_10px_30px_rgba(34,42,53,.05)]">
          <div className="flex items-center justify-between border-b border-[#eeeae1] pb-2"><div className="flex items-center gap-2"><div className="grid h-7 w-7 place-items-center bg-[#10213a] text-white"><Newspaper className="h-3.5 w-3.5" /></div><p className="font-display text-lg font-bold tracking-wide">LATEST NEWS</p></div><button onClick={() => feed.refetch()} disabled={feed.isFetching} className="inline-flex items-center gap-1 font-mono text-[9px] font-bold tracking-[.1em] text-[#526173] hover:text-[#e85d2a] disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${feed.isFetching ? "animate-spin" : ""}`} /> REFRESH</button></div>
          {feed.isLoading && !shouldSimulateUnavailable ? <div className="py-5 text-center font-mono text-[10px] text-[#64748b]">LOADING TEAM NEWS…</div> : news.length > 0 ? <div className="divide-y divide-[#eeeae1]">{news.map((item) => <button key={item.id} onClick={() => openArticle(item)} className="flex w-full items-start gap-3 py-2.5 text-left transition hover:bg-[#fffaf0]"><SourceMark kind={item.sourceKind} /><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="font-display text-base font-bold tracking-wide">{item.title}</span><ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#94a3b8]" /></span><span className="mt-0.5 block text-[11px] leading-4 text-[#687587]">{item.summary || "記事の詳細を開く"}</span></span><span className="hidden font-mono text-[8px] text-[#94a3b8] sm:block">{displayDate(item.publishedAt)}</span></button>)}</div> : <EmptyFeed teamCode={favorite.code} error={displayError} />}
        </article>
      </div>
      {displayError && <div className="mt-2 flex items-center gap-1.5 border border-[#f1c7b5] bg-[#fff4ef] px-3 py-2 font-mono text-[9px] font-bold tracking-[.06em] text-[#a34220]"><CircleAlert className="h-3.5 w-3.5 shrink-0" />LIVE REFRESH UNAVAILABLE — SHOWING LAST SAVED OFFICIAL ITEMS</div>}
      <Dialog open={Boolean(activeItem)} onOpenChange={(open) => !open && setActiveItem(null)}>
        <DialogContent className="border-[#d7d1c4] bg-[#f5f2ea] p-5 sm:max-w-lg">
          <DialogHeader className="text-left"><p className="font-mono text-[10px] font-bold tracking-[.16em] text-[#e85d2a]">{activeItem?.category === "injury" ? "INJURY WATCH" : `${activeItem ? sourceLabel(activeItem.sourceKind) : ""} TEAM NEWS`}</p><DialogTitle className="pr-7 font-display text-2xl font-extrabold leading-[.95] tracking-[.04em]">{activeItem?.title}</DialogTitle><DialogDescription className="font-mono text-[10px]">{activeItem ? `${activeItem.sourceName} · ${displayDate(activeItem.publishedAt)} JST` : ""}</DialogDescription></DialogHeader>
          {activeItem && externalSourceKinds.has(activeItem.sourceKind) ? <div className="mt-3 border-y border-[#d7d1c4] py-4"><p className="mb-2 font-mono text-[9px] font-bold tracking-[.14em] text-[#e85d2a]">EXTERNAL ARTICLE BRIEF</p><div className="text-[14px] leading-6 text-[#334155]">{activeItem.summary || "記事の概要は提供されていません。原文で詳細をご確認ください。"}</div><p className="mt-3 text-[11px] leading-4 text-[#687587]">外部記事は情報源を明示したリンクカードとして表示しています。公式発表と区別してご確認ください。</p></div> : <><div className="mt-4 grid grid-cols-2 gap-1 rounded-sm border border-[#d7d1c4] bg-white p-1"><button type="button" aria-pressed={detailLanguage === "ja"} onClick={() => setDetailLanguage("ja")} className={`min-h-9 font-mono text-[10px] font-bold tracking-[.08em] ${detailLanguage === "ja" ? "bg-[#10213a] text-white" : "text-[#526173]"}`}>日本語要約</button><button type="button" aria-pressed={detailLanguage === "en"} onClick={showEnglishSummary} className={`min-h-9 font-mono text-[10px] font-bold tracking-[.08em] ${detailLanguage === "en" ? "bg-[#10213a] text-white" : "text-[#526173]"}`}>ENGLISH SUMMARY</button></div><div className="mt-3 border-y border-[#d7d1c4] py-4"><p className="mb-2 font-mono text-[9px] font-bold tracking-[.14em] text-[#e85d2a]">{detailLanguage === "ja" ? "日本語要約" : "英語要約（公式記事）"}</p><div className="whitespace-pre-line text-[14px] leading-6 text-[#334155]">{detailLanguage === "ja" ? (japaneseSummary.isPending && !displayedJapaneseSummary ? "公式記事を読み込み、日本語要約を生成しています…" : displayedJapaneseSummary || activeItem?.summary || "公式記事の要約が提供されていません。原文で詳細をご確認ください。") : (englishSummary.isPending && !activeEnglishSummary ? "公式記事を読み込み、英語要約を生成しています…" : activeEnglishSummary || activeItem?.summary || "英語要約を取得できませんでした。公式サイトで全文をご確認ください。")}</div>{detailLanguage === "ja" && displayedJapaneseSummary && activeJapaneseSummary && displayedJapaneseSummary !== activeJapaneseSummary && <p className="mt-3 text-[11px] leading-4 text-[#687587]">長い要約はモバイル向けに短く表示しています。詳しい内容は公式サイトでご確認ください。</p>}{detailLanguage === "ja" && japaneseSummary.data && !japaneseSummary.data.generated && <p className="mt-3 text-[11px] leading-4 text-[#687587]">日本語要約を生成できなかったため、公式RSSの概要を表示しています。</p>}{detailLanguage === "en" && englishSummary.data && !englishSummary.data.generated && <p className="mt-3 text-[11px] leading-4 text-[#687587]">英語要約を生成できなかったため、公式RSSの概要を表示しています。</p>}{detailLanguage === "en" && <p className="mt-3 text-[11px] leading-4 text-[#687587]">詳しい内容は公式サイトで全文をご確認ください。</p>}</div></>}
          {activeItem && <a href={activeItem.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 bg-[#10213a] px-4 font-sans text-[13px] font-bold text-white transition hover:bg-[#203a61] active:scale-[.97]">READ ON {sourceLabel(activeItem.sourceKind)} <ArrowUpRight className="h-4 w-4" /></a>}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function EmptyFeed({ teamCode, error }: { teamCode: string; error: boolean }) {
  return <div className="py-5 text-center"><p className="font-display text-base font-bold tracking-wide">{error ? "OFFICIAL SOURCE UNAVAILABLE" : "WAITING FOR OFFICIAL UPDATE"}</p><p className="mt-1 text-[11px] leading-4 text-[#687587]">{teamCode}の公式フィードを確認中です。取得後に最新記事を表示します。</p></div>;
}
