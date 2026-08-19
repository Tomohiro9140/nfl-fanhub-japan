import { ExternalLink, LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { EmbeddedAppNav } from "@/components/EmbeddedAppNav";

const originalAtlasUrl = "https://nflplayeratl-tus9mrqw.manus.space/";

/** Preserves the original NFL Player Atlas application behind a FAN/HUB return affordance. */
export default function Atlas() {
  useEffect(() => {
    const redirectTimer = window.setTimeout(() => window.location.replace(originalAtlasUrl), 180);
    return () => window.clearTimeout(redirectTimer);
  }, []);

  return <main className="relative grid min-h-[100dvh] w-full place-items-center overflow-hidden bg-[#f7f5f0] px-5">
    <EmbeddedAppNav current="ATLAS" />
    <div role="status" aria-live="polite" className="flex max-w-xs flex-col items-center gap-4 text-center text-[#10213a]"><span className="grid h-12 w-12 place-items-center rounded-full border border-[#d7d1c4] bg-white shadow-sm"><LoaderCircle className="h-5 w-5 animate-spin text-[#e85d2a]" /></span><div><p className="font-mono text-[11px] font-bold tracking-[.14em]">OPENING ATLAS…</p><p className="mt-2 text-[11px] leading-5 text-[#687587]">選手データの公式公開ページへ移動しています。</p></div><a href={originalAtlasUrl} className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[#10213a] underline decoration-[#e85d2a] decoration-2 underline-offset-4">OPEN ATLAS DIRECTLY <ExternalLink className="h-3.5 w-3.5" /></a></div>
  </main>;
}
