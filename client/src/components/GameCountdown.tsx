import { useEffect, useState } from "react";
import { getGameCountdown } from "@/lib/gameCountdown";

export function GameCountdown({ kickoffAt, className = "" }: { kickoffAt: Date; className?: string }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);
  const countdown = getGameCountdown(kickoffAt, now);
  return <p aria-live="polite" className={`font-mono font-bold tracking-[.06em] ${countdown.state === "upcoming" ? "text-[#e85d2a]" : "text-[#687587]"} ${className}`}>{countdown.label}</p>;
}
