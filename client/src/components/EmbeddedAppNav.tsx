import { Menu, X } from "lucide-react";
import { useState } from "react";

type EmbeddedAppNavProps = {
  current: "ATLAS" | "FIELDLINE" | "COACHING TREE";
};

const destinations = [
  { label: "HOME", href: "/" },
  { label: "ATLAS", href: "/atlas/" },
  { label: "COACHING TREE", href: "/coaching-tree/" },
  { label: "FIELDLINE", href: "/fieldline/" },
] as const;

/** FAN/HUB's compact mobile-style navigation over the preserved standalone apps. */
export function EmbeddedAppNav({ current }: EmbeddedAppNavProps) {
  const [navOpen, setNavOpen] = useState(false);

  return <div className="fixed right-3 top-3 z-30">
    <button onClick={() => setNavOpen((value) => !value)} className="grid h-9 w-9 place-items-center rounded-full border border-[#d7d1c4] bg-white/95 text-[#10213a] shadow-sm backdrop-blur transition hover:border-[#10213a] active:scale-95" aria-label={navOpen ? "メニューを閉じる" : "メニューを開く"} aria-expanded={navOpen} aria-controls="embedded-app-menu">{navOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
    {navOpen && <nav id="embedded-app-menu" aria-label="FAN/HUBナビゲーション" className="absolute right-0 top-11 w-48 rounded-xl border border-[#ded8cc] bg-[#fffdf8]/98 p-2 shadow-lg backdrop-blur"><div className="grid gap-1">{destinations.map(({ label, href }) => label === current ? <span key={label} aria-current="page" className="rounded-lg bg-[#10213a] px-3 py-2.5 font-mono text-xs font-bold tracking-wider text-white">{label}</span> : <a key={label} href={href} onClick={() => setNavOpen(false)} className="rounded-lg bg-[#f5f2ea] px-3 py-2.5 font-mono text-xs font-bold tracking-wider text-[#10213a] transition hover:bg-[#ebe5d9] active:scale-[.98]">{label}</a>)}</div></nav>}
  </div>;
}
