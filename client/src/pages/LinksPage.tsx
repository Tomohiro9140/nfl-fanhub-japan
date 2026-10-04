import React, { useMemo, useState } from "react";
import { ArrowUpRight, ExternalLink, Globe, Lock, RefreshCw, Rss, ShieldAlert } from "lucide-react";
import { getSortedMediaLinks } from "@/lib/nflMediaLinks";
import { trpc } from "@/lib/trpc";

function displayDate(isoString: string) {
  try {
    const d = new Date(isoString);
    return `${new Intl.DateTimeFormat("ja-JP", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Tokyo",
    }).format(d)} JST`;
  } catch {
    return "";
  }
}

export default function LinksPage() {
  const sortedLinks = useMemo(() => getSortedMediaLinks(), []);
  const [activeTab, setActiveTab] = useState<"directory" | "feed">("feed");

  // AmesNFL (最上位) とそれ以外の47件に分離
  const amesItem = sortedLinks.find((item) => item.id === 45);
  const otherItems = sortedLinks.filter((item) => item.id !== 45);

  const feedQuery = trpc.blogFeed.latest.useQuery(
    { limit: 50 },
    {
      refetchInterval: 15 * 60 * 1000,
      staleTime: 10 * 60 * 1000,
    }
  );

  return (
    <div className="min-h-screen bg-[#f5f2ea] text-[#10213a] selection:bg-[#e85d2a] selection:text-white">
      <div className="field-grid pointer-events-none fixed inset-0 z-0 opacity-[.16]" />

      <main className="relative z-10 mx-auto w-full min-w-0 max-w-5xl px-3 py-6 sm:px-6 sm:py-10">
        {/* ヘッダーエリア */}
        <div className="mb-5 border-b border-[#ded8cc] pb-4">
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.2em] text-[#64748b]">
            <span className="text-[#10213a]">05</span>
            <span>JAPAN NFL COMMUNITY & MEDIA</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-[#10213a] sm:text-4xl">
            LINKS <span className="text-[#e85d2a]">/</span> COMMUNITY
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-[#526173] sm:text-sm">
            日本のアメフト・NFLファンや有志による専門ブログ、解説ノート、チームメディアのリンク集および最新記事フィードです。
          </p>

          {/* 切り替えタブ */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("feed")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition ${
                activeTab === "feed"
                  ? "bg-[#10213a] text-white shadow-sm"
                  : "border border-[#ded8cc] bg-white text-[#526173] hover:bg-[#fffdf8]"
              }`}
            >
              <Rss className="h-3.5 w-3.5 text-[#e85d2a]" />
              最新記事フィード
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("directory")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition ${
                activeTab === "directory"
                  ? "bg-[#10213a] text-white shadow-sm"
                  : "border border-[#ded8cc] bg-white text-[#526173] hover:bg-[#fffdf8]"
              }`}
            >
              <Globe className="h-3.5 w-3.5 text-[#e85d2a]" />
              メディア一覧 ({sortedLinks.length})
            </button>
          </div>
        </div>

        {/* 1. 最新記事フィード (チームタグ完全削除) */}
        {activeTab === "feed" && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-wider text-[#64748b]">
                LATEST ARTICLES FROM COMMUNITY
              </span>
              <button
                type="button"
                onClick={() => feedQuery.refetch()}
                disabled={feedQuery.isFetching}
                className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[#526173] hover:text-[#e85d2a] disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${feedQuery.isFetching ? "animate-spin" : ""}`} />
                更新
              </button>
            </div>

            {feedQuery.isLoading ? (
              <div className="rounded-xl border border-[#ded8cc] bg-white p-8 text-center font-mono text-xs text-[#64748b]">
                記事フィードを受信中…
              </div>
            ) : feedQuery.data && feedQuery.data.length > 0 ? (
              <div className="divide-y divide-[#eeeae1] rounded-xl border border-[#ded8cc] bg-white shadow-sm overflow-hidden">
                {feedQuery.data.map((item) => (
                  <a
                    key={item.id}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-1 p-3 transition hover:bg-[#fffaf0] sm:p-3.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] sm:text-[11px] font-bold text-[#64748b] truncate max-w-[200px]">
                        {item.sourceName}
                      </span>

                      {item.isPaid && (
                        <span className="inline-flex items-center gap-0.5 rounded border border-[#e85d2a]/30 bg-[#fff4ef] px-1.5 py-0.2 font-mono text-[9px] font-bold text-[#e85d2a]">
                          <Lock className="h-2.5 w-2.5" /> 有料
                        </span>
                      )}

                      <span className="ml-auto font-mono text-[9px] text-[#94a3b8] shrink-0">
                        {displayDate(item.publishedAt)}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display text-xs sm:text-sm font-bold text-[#10213a] transition-colors group-hover:text-[#e85d2a] leading-snug">
                        {item.title}
                      </p>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#94a3b8] transition group-hover:text-[#e85d2a] mt-0.5" />
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#ded8cc] bg-white p-8 text-center text-xs text-[#64748b]">
                現在取得可能な新着記事がありません。
              </div>
            )}
          </section>
        )}

        {/* 2. メディア一覧 (Ames最上位全幅、余計な隙間なし、2列グリッド、2行折り返し表示) */}
        {activeTab === "directory" && (
          <section className="space-y-2">
            {/* ① 最上位: AmesNFL (全幅) */}
            {amesItem && (
              <a
                href={amesItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-lg border border-amber-300 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white px-3 py-2.5 transition hover:border-amber-400 shadow-sm"
              >
                <span className="font-display text-xs sm:text-sm font-bold text-[#10213a] group-hover:text-[#e85d2a]">
                  {amesItem.name}
                </span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-amber-600 transition group-hover:text-[#e85d2a]" />
              </a>
            )}

            {/* ② 残り47件 (隙間なし・連続2列グリッド) */}
            <div className="grid grid-cols-2 gap-2">
              {otherItems.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-[46px] items-center justify-between rounded-lg border border-[#ded8cc] bg-white p-2 transition hover:border-[#10213a] hover:bg-[#fffaf0]"
                >
                  <div className="flex items-center gap-1.5 min-w-0 pr-1 flex-1">
                    {/* チームタグ (チームブログのみ) */}
                    {item.targetTeam && (
                      <span className="inline-flex items-center rounded border border-[#10213a]/20 bg-[#10213a] px-1 py-0.5 font-mono text-[9px] font-black text-white shrink-0">
                        {item.targetTeam}
                      </span>
                    )}

                    {/* 媒体名: 2行折り返し（line-clamp-2）、3行禁止 */}
                    <span className="font-display text-xs sm:text-[12.5px] font-bold text-[#10213a] group-hover:text-[#e85d2a] leading-tight line-clamp-2 break-words">
                      {item.name}
                    </span>
                  </div>

                  <ExternalLink className="h-3 w-3 shrink-0 text-[#94a3b8] transition group-hover:text-[#e85d2a]" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* 3. 免責事項・削除要請文言ブロック */}
        <section className="mt-8 rounded-xl border border-[#ded8cc] bg-[#fffdf8] p-3.5 sm:p-4 text-xs text-[#526173]">
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-[#10213a]">
            <ShieldAlert className="h-4 w-4 text-[#e85d2a]" />
            掲載に関するお知らせ・削除要請について
          </div>
          <div className="mt-1.5 space-y-1 leading-relaxed text-[10px] sm:text-[11px]">
            <p>
              当サイト「NFL FAN HUB JAPAN」でご紹介・RSS取得している各ブログおよび記事コンテンツの著作権・知的財産権は、それぞれの著作者・運営者様に帰属します。
            </p>
            <p>
              当ページは日本国内におけるNFLコミュニティの活性化およびファン同士の情報アクセス向上を目的として、公開フィードおよびWebリンクを整理・掲載しております。
            </p>
            <p className="text-[#a34220]">
              掲載の取り下げ、RSS配信の停止、リンクの修正・削除をご希望の運営者様は、確認次第速やかに削除等の適切な対応を実施いたしますので、誠にお手数ですがお問い合わせ窓口または公式SNS等よりご連絡いただけますようお願い申し上げます。
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
