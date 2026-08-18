import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { EmbeddedAppNav } from "@/components/EmbeddedAppNav";

const originalFieldlineUrl = "https://nflteamstats-4q87cnse.manus.space/";

/** Preserves the original NFL Team Stats Comparator behind a FAN/HUB return affordance. */
export default function Fieldline() {
  const [isLoaded, setIsLoaded] = useState(false);

  return <main className="relative min-h-[100dvh] w-full overflow-hidden bg-[#f7f5f0]">
    <EmbeddedAppNav current="FIELDLINE" />
    {!isLoaded && <div role="status" aria-live="polite" className="absolute inset-0 z-20 grid place-items-center bg-[#f7f5f0]"><div className="flex flex-col items-center gap-3 text-[#10213a]"><span className="grid h-12 w-12 place-items-center rounded-full border border-[#d7d1c4] bg-white shadow-sm"><LoaderCircle className="h-5 w-5 animate-spin text-[#e85d2a]" /></span><span className="font-mono text-[11px] font-bold tracking-[.14em]">LOADING FIELDLINE…</span></div></div>}
    <iframe title="NFL Team Stats Comparator" src={originalFieldlineUrl} onLoad={() => setIsLoaded(true)} className={`block h-[100dvh] w-full border-0 transition-opacity duration-200 ${isLoaded ? "opacity-100" : "opacity-0"}`} />
  </main>;
}
