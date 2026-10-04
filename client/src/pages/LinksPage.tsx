import React, { useMemo, useState } from "react";
import { ArrowUpRight, ExternalLink, Globe, Lock, Mail, RefreshCw, Rss, HeartHandshake, Menu, X, Home, Database, Trophy, GitFork, Activity, ChevronRight } from "lucide-react";
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

// サイト内主要ナビゲーション項目（Excite Index削除、Fieldline & Coaching Tree追加）
const NAV_ITEMS = [
  { label: "HOME", href: "/", icon: Home, desc: "トップ・速報" },
  { label: "FIELDLINE", href: "/fieldline", icon: Activity, desc: "戦術・ドライブ分析" },
  { label: "COACHING TREE", href: "/coaching-tree", icon: GitFork, desc: "コーチ相関ツリー" },
  { label: "ATLAS", href: "/atlas", icon: Database, desc: "選手名鑑・契約" },
  { label: "PLAYOFF", href: "/playoff", icon: Trophy, desc: "進出シミュレーター" },
  { label: "LINKS", href: "/links", icon: Globe, desc: "ブログ・メディア", current: true },
];

export default function LinksPage() {
  const sortedLinks = useMemo(() => getSortedMediaLinks(), []);
  const [activeTab, setActiveTab] = useState<"directory" | "feed">("feed");
  const [isNavOpen, setIsNavOpen] = useState(false);

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

      {/* ヘッダーバー */}
      <header className="relative z-30 mx-auto flex w-full max-w-5xl items-center justify-between px-3 pt-4 sm:px-6">
        <a href="/" className="flex items-center gap-2 group">
          <span className="font-display text-sm sm:text-base font-black tracking-wider text-[#10213a] group-hover:text-[#e85d2a] transition">
            NFL FAN HUB <span className="text-[#e85d2a]">JAPAN</span>
          </span>
        </a>

        {/* 三本線アイコンボタン */}
        <button
          type="button"
          onClick={() => setIsNavOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#ded8cc] bg-white text-[#10213a] shadow-sm transition hover:border-[#10213a] hover:bg-[#fffaf0] active:scale-95"
          aria-label="メニューを開く"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* スライドイン ナビゲーションメニュー（画面の半分: w-1/2） */}
      {isNavOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* 背景オーバーレイ */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsNavOpen(false)}
          />

          {/* ドロワーメニュー本体（画面幅の50%） */}
          <div className="relative z-10 flex h-full w-1/2 flex-col border-l border-[#ded8cc] bg-[#fcfaf5] p-3 shadow-2xl sm:p-4">
            <div className="flex items-center justify-between border-b border-[#ded8cc] pb-2.5">
              <span className="font-mono text-[10px] font-bold tracking-widest text-[#64748b]">
                MENU
              </span>
              <button
                type="button"
                onClick={() => setIsNavOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#ded8cc] bg-white text-[#10213a] hover:bg-[#fffaf0]"
                aria-label="メニューを閉じる"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <nav className="mt-3 flex-1 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsNavOpen(false)}
                    className={`group flex items-center justify-between rounded-lg border px-2 py-2 transition ${
                      item.current
                        ? "border-[#10213a] bg-[#10213a] text-white shadow-sm"
                        : "border-transparent bg-transparent text-[#10213a] hover:border-[#ded8cc] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <div
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ${
                          item.current ? "bg-[#e85d2a] text-white" : "bg-[#ded8cc]/50 text-[#10213a]"
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-[11px] font-bold leading-tight truncate">{item.label}</p>
                        <p
                          className={`font-mono text-[8.5px] truncate ${
                            item.current ? "text-slate-300" : "text-[#64748b]"
                          }`}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-3 w-3 shrink-0 transition group-hover:translate-x-0.5 ${
                        item.current ? "text-[#e85d2a]" : "text-[#94a3b8]"
                      }`}
                    />
                  </a>
                );
              })}
            </nav>

            <div className="border-t border-[#ded8cc] pt-2.5 text-center">
              <p className="font-mono text-[8.5px] text-[#94a3b8]">
                NFL FAN HUB © 2026
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="relative z-10 mx-auto w-full min-w-0 max-w-5xl px-3 py-4 sm:px-6 sm:py-6">
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

        {/* 1. 最新記事フィード */}
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

        {/* 2. メディア一覧 */}
        {activeTab === "directory" && (
          <section className="space-y-2">
            {/* ① 最上位: AmesNFL */}
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

            {/* ② 残り47件 */}
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
                    {item.targetTeam && (
                      <span className="inline-flex items-center rounded border border-[#10213a]/20 bg-[#10213a] px-1 py-0.5 font-mono text-[9px] font-black text-white shrink-0">
                        {item.targetTeam}
                      </span>
                    )}

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

        {/* 3. リンク集・フィードのご案内とお問い合わせ */}
        <section className="mt-10 rounded-xl border border-[#ded8cc] bg-[#fffdf8] p-4 sm:p-5 text-xs text-[#526173]">
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-[#10213a]">
            <HeartHandshake className="h-4 w-4 text-[#e85d2a]" />
            リンク集・フィードの掲載とお問い合わせについて
          </div>

          <div className="mt-2.5 space-y-2 leading-relaxed text-[11px] sm:text-xs">
            <p>
              当ページは、日本国内でNFL情報を発信されている方への敬意を込め、ファンコミュニティの活性化やファン同士の情報アクセス向上を目的として開設・運営しております。
            </p>
            <p className="text-[#64748b]">
              ご紹介している各記事およびコンテンツの著作権・権利は、それぞれの運営者様に帰属します。
            </p>
            <p>
              新規掲載のご希望やリンク修正はもちろん、掲載やフィード配信の見合わせをご希望の場合も、いつでもお気軽にご連絡ください。確認次第、速やかに対応させていただきます。
            </p>
          </div>

          {/* お問い合わせ先リンク */}
          <div className="mt-4 flex flex-col gap-2 pt-2 border-t border-[#ded8cc]/60 sm:flex-row sm:items-center">
            <span className="font-mono text-[10px] font-bold tracking-wider text-[#64748b] shrink-0">
              CONTACT:
            </span>

            <div className="flex items-center gap-2">
              <a
                href="mailto:nfl.fanhub.japan@gmail.com"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#ded8cc] bg-white px-3 py-1.5 font-mono text-[11px] font-bold text-[#10213a] shadow-sm transition hover:border-[#10213a] hover:bg-[#fffaf0]"
              >
                <Mail className="h-3.5 w-3.5 text-[#e85d2a]" />
                <span>メール</span>
              </a>

              <a
                href="https://x.com/TK19TB12"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#ded8cc] bg-white px-3 py-1.5 font-mono text-[11px] font-bold text-[#10213a] shadow-sm transition hover:border-[#10213a] hover:bg-[#fffaf0]"
              >
                <span className="flex h-3.5 w-3.5 items-center justify-center font-display text-[11px] font-black leading-none">
                  𝕏
                </span>
                <span>@TK19TB12</span>
                <ExternalLink className="h-3 w-3 text-[#94a3b8]" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
