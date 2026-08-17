import React, { useEffect, useState } from "react";
import { getGameCardStatus, type OfficialGameResult } from "@/lib/gameCountdown";

export function GameCountdown({ kickoffAt, result, className = "", hideFinalScore = false }: { kickoffAt: Date; result?: OfficialGameResult; className?: string; hideFinalScore?: boolean }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);
  const status = getGameCardStatus(kickoffAt, now, result);
  const tone = status.state === "upcoming" ? "text-[#e85d2a]" : status.state === "live" ? "bg-[#e85d2a] px-1.5 py-0.5 text-white" : status.state === "final" ? "text-[#10213a]" : "text-[#687587]";
  const label = hideFinalScore && status.state === "final" ? "FINAL · ネタバレ防止中" : status.label;
  return <p aria-live="polite" className={`font-mono font-bold tracking-[.06em] ${tone} ${className}`}>{label}</p>;
}
