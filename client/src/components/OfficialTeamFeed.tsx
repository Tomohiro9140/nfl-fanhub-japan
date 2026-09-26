import React, { useMemo, useState } from "react";
import { ArrowUpRight, BadgeCheck, CircleAlert, Newspaper, Radio, RefreshCw, Sparkles, Tv, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { dedupeDisplayArticles } from "@/lib/articleDedup";
import type { FavoriteTeam } from "@/lib/nflTeams";
import { ArticleSummaryDialog } from "./ArticleSummaryDialog";

type SourceKind = "team_official" | "nfl_official" | "pft" | "cbs" | "local";
type FeedItem = {
  id: number;
  title: string;
  summary: string | null;
  japaneseSummary?: string | null;
  englishSummary?: string | null;
  sourceUrl: string;
  sourceName: string;
  sourceKind: SourceKind;
  category: "news" | "injury" | "transaction";
  publishedAt: Date;
  fetchedAt: Date;
};
type CompletedGame = { gameState: string | null; gameDate?: string | null; finishedAt?: Date | null; kickoffAt: Date; kickoffAtEstimated?: boolean };
const externalSourceKinds = new Set<SourceKind>(["pft", "cbs", "local"]);

function isRosterMoveNews(item: FeedItem) {
  if (item.sourceKind !== "team_official") return false;
  const text = `${item.title} ${item.sourceUrl}`.toLowerCase();
  if (/\b(?:autographs?|signature event|signed poster|signed memorabilia)\b/.test(text)) return false;
  return /\b(?:transactions?|roster moves?|sign(?:ed|s)?|released?|waived|waivers?|claimed|claim|trade(?:d)?|contract(?: extension)?|extensions?|activated?|designated (?:for|to return)|placed on (?:injured reserve|ir|pup))\b/.test(text);
}

function isBroadcastOrWatchArticle(item: FeedItem) {
  const text = `${item.title} ${item.sourceUrl}`.toLowerCase();
  return /\b(?:how to (?:watch|listen|stream)|ways to watch|where to watch|tune in|broadcast guide|tv schedule|game preview & stream|stream & listen)\b/i.test(text);
}

function isNonEnglishArticle(item: FeedItem) {
  const text = `${item.title} ${item.summary ?? ""} ${item.sourceUrl}`.toLowerCase();
  if (/\/(?:es|espanol|somos-?cowboys)\//i.test(item.sourceUrl)) return true;
  if (/\b(?:claves del juego|contra|semana|lesi[oó]n|en vivo|partido|temporada|entrenamiento|noticias|jugador|equipo|alineaci[oó]n|por la|de la)\b/i.test(text)) return true;
  return /[¿¡]/.test(item.title);
}

function isSpoilerNoiseArticle(item: FeedItem) {
  const text = `${item.title} ${item.summary ?? ""} ${item.sourceUrl}`.toLowerCase();
  return /\b(?:live chat|game blog|live updates|in-game updates|highlights?|sliding int|pick-?6|interception|touchdown|final score|instant analysis|postgame|post-game|what we learned|takeaways|game recap)\b/i.test(text);
}

function sourceLabel(kind: SourceKind) {
  if (kind === "pft") return "PFT";
  if (kind === "cbs") return "CBS";
  if (kind === "local") return "Local";
  return "OFFICIAL";
}

function SourceMark({ kind }: { kind: SourceKind }) {
  const label = sourceLabel(kind);
  const Icon = kind === "pft" ? Radio : kind === "cbs" ? Tv : kind === "local" ? Globe : BadgeCheck;
  const tone =
    kind === "pft"
      ? "border-[#bfd0e8] bg-[#eff5fb] text-[#23527d]"
      : kind === "cbs"
      ? "border-[#e7c5bf] bg-[#fff4ef] text-[#a34220]"
      : kind === "local"
      ? "border-[#d8ccf0] bg-[#f4effc] text-[#5b2f8c]"
      : "border-[#cfe6c4] bg-[#f0f8eb] text-[#426237]";

  return (
    <span className={`mt-0.5 inline-flex h-5 w-[58px] shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap border px-1 font-mono text-[8px] font-bold tracking-[.08em] ${tone}`}>
      <Icon className="h-2.5 w-2.5 shrink-0" />
      {label}
    </span>
  );
}

export function spoilerNewsCutoff(game?: CompletedGame) {
  if (!game) return null;
  const kickoffAt = new Date(game.kickoffAt);
  if (!game.kickoffAtEstimated && !Number.isNaN(kickoffAt.getTime())) {
    return new Date(kickoffAt.getTime() - 90 * 60 * 1000);
  }
  const gameDateCutoff = game.gameDate ? new Date(`${game.gameDate}T00:00:00.000Z`) : null;
  return gameDateCutoff && !Number.isNaN(gameDateCutoff.getTime()) ? gameDateCutoff : null;
}

export function shouldHideAllSpoilerNews(game?: CompletedGame) {
  return Boolean(game?.kickoffAtEstimated && !game.gameDate && /live|ingame|in_progress|halftime/i.test(game.gameState ?? ""));
}

export function selectLatestNews(
  items: FeedItem[],
  hideFrom?: Date | null,
  hideAll = false,
  spoilerMode = false,
  limit: 8 | 15 = 8
) {
  const filtered = items.filter((item) => {
    if (hideAll) return false;
    if (item.category !== "news") return false;
    if (isRosterMoveNews(item)) return false;
    if (isBroadcastOrWatchArticle(item)) return false;
    if (isNonEnglishArticle(item)) return false;
    if (spoilerMode && isSpoilerNoiseArticle(item)) return false;
    if (hideFrom && new Date(item.publishedAt).getTime() >= hideFrom.getTime()) return false;
    return true;
  });

  const sorted = dedupeDisplayArticles(
    filtered.sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime())
  );

  // 枠設定: 8件 (3/3/1/1) または 15件 (4/4/2/2 + 新着3)
  const quota = limit === 15
    ? { official: 4, local: 4, cbs: 2, pft: 2 }
    : { official: 3, local: 3, cbs: 1, pft: 1 };

  const selected: FeedItem[] = [];
  const selectedIds = new Set<number>();

  const addIfUnique = (item: FeedItem) => {
    if (!selectedIds.has(item.id)) {
      selectedIds.add(item.id);
      selected.push(item);
    }
  };

  // 1. Team Official 枠
  const officialItems = sorted.filter((item) => item.sourceKind === "team_official" || item.sourceKind === "nfl_official");
  officialItems.slice(0, quota.official).forEach(addIfUnique);

  // 2. Local (SB Nation) 枠
  const localItems = sorted.filter((item) => item.sourceKind === "local");
  localItems.slice(0, quota.local).forEach(addIfUnique);

  // 3. CBS 枠
  const cbsItems = sorted.filter((item) => item.sourceKind === "cbs");
  cbsItems.slice(0, quota.cbs).forEach(addIfUnique);

  // 4. PFT 枠
  const pftItems = sorted.filter((item) => item.sourceKind === "pft");
  pftItems.slice(0, quota.pft).forEach(addIfUnique);

  // 5. 残り枠（15件時の残り3枠や、各ソース不足時の穴埋め）を最新順で補充
  for (const item of sorted) {
    if (selected.length >= limit) break;
    addIfUnique(item);
  }

  // 6. 枠取りされた記事を最終的に公開日時の降順（最新順）でソート
  return selected
    .slice(0, limit)
    .sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime());
}

function displayDate(value: Date) {
  return `${new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tokyo" }).format(new Date(value))} JST`;
}

export function OfficialTeamFeed({ favorite, spoilerMode = false, completedGame }: { favorite: FavoriteTeam; spoilerMode?: boolean; completedGame?: CompletedGame }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldSimulateUnavailable = typeof window !== "undefined" && import.meta.env.DEV && new URLSearchParams(window.location.search).has("feedError");
  const feedInput = useMemo(() => ({ teamCode: shouldSimulateUnavailable ? "XXX" : favorite.code }), [shouldSimulateUnavailable, favorite.code]);
  const feed = trpc.officialFeed.byTeam.useQuery(feedInput, { refetchInterval: 15 * 60 * 1000, staleTime: 15 * 60 * 1000, refetchOnWindowFocus: false, refetchOnReconnect: false, retry: 1 });
  const refresh = trpc.officialFeed.refresh.useMutation({
    onSuccess: () => {
      void feed.refetch();
    },
  });
  const displayError = feed.isError || shouldSimulateUnavailable;
  const items = (shouldSimulateUnavailable ? [] : feed.data?.items ?? []) as FeedItem[];
  const hideFrom = spoilerMode ? spoilerNewsCutoff(completedGame) : null;
  const hideAll = spoilerMode && shouldHideAllSpoilerNews(completedGame);

  // 開閉状態（isExpanded）に応じて 8件 または 15件 を選出
  const news = useMemo(
    () => selectLatestNews(items, hideFrom, hideAll, spoilerMode, isExpanded ? 15 : 8),
    [items, hideFrom, hideAll, spoilerMode, isExpanded]
  );

  const [activeArticle, setActiveArticle] = useState<FeedItem | null>(null);

  return (
    <section id="updates" className="scroll-mt-24">
      <div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-[#64748b]">
        <span className="text-[#10213a]">02</span>
        <span>{favorite.code} NEWS DESK</span>
        <span className="h-px flex-1 bg-[#d9d5cc]" />
      </div>
      <div className="mt-3">
        <article className="clip-note border border-[#ded8cc] bg-white p-3 shadow-[0_10px_30px_rgba(34,42,53,.05)]">
          <div className="flex items-center justify-between border-b border-[#eeeae1] pb-2">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center bg-[#10213a] text-white">
                <Newspaper className="h-3.5 w-3.5" />
              </div>
              <p className="font-display text-lg font-bold tracking-wide">LATEST NEWS</p>
            </div>
            <button
              onClick={() => refresh.mutate(feedInput)}
              disabled={feed.isFetching || refresh.isPending || shouldSimulateUnavailable}
              className="inline-flex items-center gap-1 font-mono text-[9px] font-bold tracking-[.1em] text-[#526173] hover:text-[#e85d2a] disabled:opacity-50"
              aria-label="チーム公式RSSとNFL公式負傷情報を同期して最新ニュースを更新"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${feed.isFetching || refresh.isPending ? "animate-spin" : ""}`} /> {refresh.isPending ? "UPDATING" : "REFRESH"}
            </button>
          </div>
          {feed.isLoading && !shouldSimulateUnavailable ? (
            <div className="py-5 text-center font-mono text-[10px] text-[#64748b]">LOADING TEAM NEWS…</div>
          ) : news.length > 0 ? (
            <div>
              <div className="divide-y divide-[#eeeae1]">
                {news.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveArticle(item)}
                    data-feed-article="latest-news"
                    data-article-url={item.sourceUrl}
                    aria-label={`${item.title}の要約を読む`}
                    className="group flex w-full items-start gap-3 py-2.5 text-left transition hover:bg-[#fffaf0] active:bg-[#fff4ef]"
                  >
                    <SourceMark kind={item.sourceKind} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-display text-base font-bold tracking-wide group-hover:text-[#e85d2a] transition-colors">{item.title}</span>
                        <span className="inline-flex items-center gap-0.5 font-mono text-[9px] font-bold text-[#e85d2a] shrink-0 opacity-80 group-hover:opacity-100">
                          <Sparkles className="h-3 w-3" /> 要約
                        </span>
                      </span>
                      <span className="mt-1 block font-mono text-[8px] font-bold tracking-[.05em] text-[#94a3b8]">PUBLISHED · {displayDate(item.publishedAt)}</span>
                    </span>
                  </button>
                ))}
              </div>

              {/* 記事が8件以上ある場合に表示される開閉アコーディオンボタン */}
              {items.filter((i) => i.category === "news").length > 8 && (
                <div className="border-t border-[#eeeae1] pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-1 font-mono text-[10px] font-bold tracking-[.08em] text-[#526173] hover:text-[#e85d2a] py-1.5 px-3 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3.5 w-3.5" /> 折りたたむ (8件表示)
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" /> さらに表示 (最大15件)
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <EmptyFeed teamCode={favorite.code} error={displayError} />
          )}
        </article>
      </div>
      {displayError && (
        <div className="mt-2 flex items-center gap-1.5 border border-[#f1c7b5] bg-[#fff4ef] px-3 py-2 font-mono text-[9px] font-bold tracking-[.06em] text-[#a34220]">
          <CircleAlert className="h-3.5 w-3.5 shrink-0" />LIVE REFRESH UNAVAILABLE — SHOWING LAST SAVED OFFICIAL ITEMS
        </div>
      )}

      <ArticleSummaryDialog
        article={activeArticle}
        open={Boolean(activeArticle)}
        onClose={() => setActiveArticle(null)}
      />
    </section>
  );
}

function EmptyFeed({ teamCode, error }: { teamCode: string; error: boolean }) {
  return (
    <div className="py-5 text-center">
      <p className="font-display text-base font-bold tracking-wide">{error ? "OFFICIAL SOURCE UNAVAILABLE" : "WAITING FOR OFFICIAL UPDATE"}</p>
      <p className="mt-1 text-[11px] leading-4 text-[#687587]">{teamCode}の公式フィードを確認中です。取得後に最新記事を表示します。</p>
    </div>
  );
}
