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

  // 全ブログの最新記事フィード取得 (tRPC)
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

      <main className="relative z-10 mx-auto w-full min-w-0 max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {/* ヘッダーエリア */}
        <div className="mb-6 border-b border-[#ded8cc] pb-5">
          <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-[0.2em] text-[#64748b]">
            <span className="text-[#10213a]">05</span>
            <span>JAPAN NFL COMMUNITY & MEDIA</span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-[#10213a] sm:text-4xl">
            LINKS <span className="text-[#e85d2a]">/</span> COMMUNITY
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-[#526173] sm:text-sm">
            日本のアメフト・NFLファンや有志による専門ブログ、解説ノート、チームメディアのリンク集および最新記事フィードです。
          </p>

          {/* 切り替えタブ */}
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("feed")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 font-mono text-xs font-bold transition ${
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
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 font-mono text-xs font-bold transition ${
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

        {/* 1. 最新記事フィード (タイトル・ブログ名・更新日時・有料バッジのみ) */}
        {activeTab === "feed" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold tracking-wider text-[#64748b]">
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
              <div className="rounded-xl border border-[#ded8cc] bg-white p-10 text-center font-mono text-xs text-[#64748b]">
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
                    className="group flex flex-col gap-1.5 p-3.5 transition hover:bg-[#fffaf0] sm:p-4"
                  >
                    {/* メタ情報行: 対象チーム / ブログ名 / 有料バッジ / 更新日時 */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* 対象チーム略称バッジ (存在する場合) */}
                      {item.targetTeam && (
                        <span className="inline-flex items-center rounded border border-[#10213a]/20 bg-[#10213a] px-1.5 py-0.5 font-mono text-[9px] font-black text-white">
                          {item.targetTeam}
                        </span>
                      )}

                      {/* ブログ名 */}
                      <span className="font-mono text-[11px] font-bold text-[#64748b]">
                        {item.sourceName}
                      </span>

                      {/* 有料記事バッジ */}
                      {item.isPaid && (
                        <span className="inline-flex items-center gap-0.5 rounded border border-[#e85d2a]/30 bg-[#fff4ef] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#e85d2a]">
                          <Lock className="h-2.5 w-2.5" /> 有料
                        </span>
                      )}

                      {/* 更新日時 */}
                      <span className="ml-auto font-mono text-[10px] text-[#94a3b8]">
                        {displayDate(item.publishedAt)}
                      </span>
                    </div>

                    {/* タイトル行 (本文抜粋は非表示) */}
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-display text-sm sm:text-base font-bold text-[#10213a] transition-colors group-hover:text-[#e85d2a] leading-snug">
                        {item.title}
                      </p>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-[#94a3b8] transition group-hover:text-[#e85d2a] mt-0.5" />
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

        {/* 2. メディア一覧 (全48サイト) */}
        {activeTab === "directory" && (
          <section className="space-y-3">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {sortedLinks.map((item) => {
                const isAmes = item.isPinnedTop;

                return (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative flex items-center justify-between rounded-xl border p-3.5 transition ${
                      isAmes
                        ? "col-span-1 sm:col-span-2 border-amber-300 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white shadow-sm hover:border-amber-400"
                        : "border-[#ded8cc] bg-white hover:border-[#10213a] hover:bg-[#fffaf0]"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        {/* 対象チーム略称バッジ (存在する場合のみ) */}
                        {item.targetTeam && (
                          <span className="inline-flex items-center rounded border border-[#10213a]/20 bg-[#10213a] px-1.5 py-0.5 font-mono text-[9px] font-black text-white">
                            {item.targetTeam}
                          </span>
                        )}

                        {/* 媒体名 */}
                        <span className="truncate font-display text-base font-bold text-[#10213a] group-hover:text-[#e85d2a]">
                          {item.name}
                        </span>
                      </div>

                      {/* 対象チームの日本語名等 (サブテキスト) */}
                      {item.targetTeamName && (
                        <p className="mt-0.5 truncate text-[10px] text-[#64748b]">
                          {item.targetTeamName}
                        </p>
                      )}
                    </div>

                    <ExternalLink className="h-4 w-4 shrink-0 text-[#94a3b8] transition group-hover:text-[#e85d2a]" />
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. 免責事項・削除要請文言ブロック */}
        <section className="mt-12 rounded-xl border border-[#ded8cc] bg-[#fffdf8] p-4 sm:p-5 text-xs text-[#526173]">
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-[#10213a]">
            <ShieldAlert className="h-4 w-4 text-[#e85d2a]" />
            掲載に関するお知らせ・削除要請について
          </div>
          <div className="mt-2 space-y-1.5 leading-relaxed text-[11px] sm:text-xs">
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
