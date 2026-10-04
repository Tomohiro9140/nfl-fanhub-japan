import React, { useState } from "react";
import {
  Menu,
  X,
  Home,
  Database,
  Trophy,
  GitFork,
  Activity,
  Globe,
  ChevronRight,
} from "lucide-react";

export type NavPageId =
  | "HOME"
  | "FIELDLINE"
  | "COACHING TREE"
  | "ATLAS"
  | "PLAYOFFS"
  | "SIMULATOR"
  | "LINKS";

interface EmbeddedAppNavProps {
  current?: NavPageId;
}

const NAV_ITEMS = [
  { id: "HOME", label: "HOME", href: "/", icon: Home, desc: "トップ・速報" },
  { id: "FIELDLINE", label: "FIELDLINE", href: "/fieldline", icon: Activity, desc: "戦術・ドライブ分析" },
  { id: "COACHING TREE", label: "COACHING TREE", href: "/coaching-tree", icon: GitFork, desc: "コーチ相関ツリー" },
  { id: "ATLAS", label: "ATLAS", href: "/atlas", icon: Database, desc: "選手名鑑・契約" },
  { id: "PLAYOFFS", label: "PLAYOFF", href: "/playoffs", icon: Trophy, desc: "進出シミュレーター" },
  { id: "LINKS", label: "LINKS", href: "/links", icon: Globe, desc: "ブログ・メディア" },
];

export function EmbeddedAppNav({ current }: EmbeddedAppNavProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <>
      {/* 共通ヘッダーバー */}
      <header className="relative z-30 mx-auto flex w-full max-w-5xl items-center justify-between px-3 pt-4 sm:px-6">
        <a href="/" className="group flex items-center gap-2">
          <span className="font-display text-sm font-black tracking-wider text-[#10213a] transition group-hover:text-[#e85d2a] sm:text-base">
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
                const isCurrent =
                  current === item.id ||
                  (current === "SIMULATOR" && item.id === "PLAYOFFS");

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsNavOpen(false)}
                    className={`group flex items-center justify-between rounded-lg border px-2 py-2 transition ${
                      isCurrent
                        ? "border-[#10213a] bg-[#10213a] text-white shadow-sm"
                        : "border-transparent bg-transparent text-[#10213a] hover:border-[#ded8cc] hover:bg-white"
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2 pr-1">
                      <div
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ${
                          isCurrent
                            ? "bg-[#e85d2a] text-white"
                            : "bg-[#ded8cc]/50 text-[#10213a]"
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-display text-[11px] font-bold leading-tight">
                          {item.label}
                        </p>
                        <p
                          className={`truncate font-mono text-[8.5px] ${
                            isCurrent ? "text-slate-300" : "text-[#64748b]"
                          }`}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-3 w-3 shrink-0 transition group-hover:translate-x-0.5 ${
                        isCurrent ? "text-[#e85d2a]" : "text-[#94a3b8]"
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
    </>
  );
}

export default EmbeddedAppNav;
