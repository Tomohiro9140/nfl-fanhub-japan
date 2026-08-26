import { ChevronDown, ChevronUp, ExternalLink, Loader2, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";

type Player = { name: string; values: Record<string, string> };
type CategoryKey = "passing" | "rushing" | "receiving" | "defense";
type PlayerCategoryDefinition = { key: CategoryKey; title: string; fields: string[] };

const categories: PlayerCategoryDefinition[] = [
  { key: "passing", title: "PASSING", fields: ["C/ATT", "YDS", "TD", "INT", "RTG"] },
  { key: "rushing", title: "RUSHING", fields: ["CAR", "YDS", "AVG", "TD", "LONG"] },
  { key: "receiving", title: "RECEIVING", fields: ["REC", "YDS", "AVG", "TGTS", "TD", "LONG"] },
  { key: "defense", title: "DEFENSE", fields: ["TOT / SOLO", "SACKS", "INT", "FF", "PD"] },
];

function numberValue(value: string | undefined) {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function leadersFor(players: Player[], category: CategoryKey) {
  if (!players.length) return [];
  if (category !== "defense") {
    const max = Math.max(...players.map((player) => numberValue(player.values.YDS)));
    return players.filter((player) => numberValue(player.values.YDS) === max).slice(0, 1);
  }
  const leaders = new Map<string, Player>();
  for (const stat of ["SACKS", "INT", "FF"]) {
    const max = Math.max(...players.map((player) => numberValue(player.values[stat])));
    if (max > 0) players.filter((player) => numberValue(player.values[stat]) === max).forEach((player) => leaders.set(player.name, player));
  }
  return leaders.size ? Array.from(leaders.values()) : players.slice().sort((a, b) => numberValue(b.values.TOT) - numberValue(a.values.TOT)).slice(0, 1);
}

function fieldValue(player: Player, field: string) {
  if (field === "C/ATT") return `${player.values.CMP ?? "—"}/${player.values.ATT ?? "—"}`;
  if (field === "RTG") return player.values.RATING ?? "—";
  if (field === "CAR") return player.values.ATT ?? "—";
  if (field === "TOT / SOLO") return `${player.values.TOT ?? "—"}/${player.values.SOLO ?? "—"}`;
  return player.values[field] ?? "—";
}

function compareValue(value: string, kind: "higher" | "lower" | "ratio") {
  if (kind === "ratio") {
    const [made, attempts] = value.split("-").map((part) => Number.parseFloat(part));
    return Number.isFinite(made) && Number.isFinite(attempts) && attempts > 0 ? made / attempts : -1;
  }
  if (value.includes(":")) {
    const [minutes, seconds] = value.split(":").map((part) => Number.parseInt(part, 10));
    return (minutes || 0) * 60 + (seconds || 0);
  }
  const [first, second] = value.split("-").map((part) => Number.parseFloat(part));
  if (kind === "lower" && Number.isFinite(second)) return (first || 0) * 10_000 + second;
  return Number.isFinite(first) ? first : -1;
}

function StatValue({ value, other, better }: { value: string; other: string; better: "higher" | "lower" | "ratio" }) {
  const own = compareValue(value, better);
  const peer = compareValue(other, better);
  const leading = own !== peer && (better === "lower" ? own < peer : own > peer);
  return <span className={`font-mono text-[12px] font-black tabular-nums ${leading ? "rounded bg-[#e85d2a] px-1.5 py-0.5 text-white" : "text-[#10213a]"}`}>{value}</span>;
}

function TeamPlayerTable({ teamName, players, category, expanded }: { teamName: string; players: Player[]; category: PlayerCategoryDefinition; expanded: boolean }) {
  const visible = expanded ? players : leadersFor(players, category.key);
  const columns = { gridTemplateColumns: `minmax(84px, 1fr) repeat(${category.fields.length}, minmax(25px, auto))` };
  return <div className="overflow-hidden rounded-md border border-[#ded8cc] bg-white"><p className="truncate border-b border-[#ded8cc] bg-[#f5f2ea] px-2.5 py-2 font-display text-[12px] font-black tracking-[.03em] text-[#10213a]" title={teamName}>{teamName}</p><div className="overflow-x-auto"><div className="min-w-[265px]"><div style={columns} className="grid items-center gap-x-2 border-b border-[#eeeae1] px-2.5 py-1.5 font-mono text-[7px] font-black tracking-[.05em] text-[#64748b]"><span>PLAYER</span>{category.fields.map((field) => <span key={field} className="text-right">{field}</span>)}</div>{visible.map((player) => <div style={columns} key={player.name} className="grid items-center gap-x-2 border-b border-[#f0ece4] px-2.5 py-2 last:border-b-0"><span className="truncate font-display text-[11px] font-black text-[#10213a]" title={player.name}>{player.name}</span>{category.fields.map((field) => <span key={field} className="text-right font-mono text-[9px] font-bold tabular-nums text-[#334155]">{fieldValue(player, field)}</span>)}</div>)}</div></div></div>;
}

function PlayerCategory({ category, away, home, awayName, homeName }: { category: PlayerCategoryDefinition; away: Player[]; home: Player[]; awayName: string; homeName: string }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = away.length > leadersFor(away, category.key).length || home.length > leadersFor(home, category.key).length;
  return <section className="border-t border-[#e9e3d6] pt-4"><div className="flex items-center justify-between gap-3"><h3 className="font-display text-lg font-extrabold tracking-[.06em] text-[#10213a]">{category.title}</h3>{hasMore ? <button type="button" onClick={() => setExpanded((value) => !value)} className="inline-flex items-center gap-1 font-mono text-[9px] font-black tracking-[.08em] text-[#a84420] underline decoration-[#e85d2a] decoration-2 underline-offset-3">MORE {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}</button> : null}</div><div className="mt-2 grid gap-2 md:grid-cols-2"><TeamPlayerTable teamName={awayName} players={away} category={category} expanded={expanded} /><TeamPlayerTable teamName={homeName} players={home} category={category} expanded={expanded} /></div></section>;
}

export function GameStatsDialog({ gameUrl, onOpenChange }: { gameUrl: string; onOpenChange: (open: boolean) => void }) {
  const queryInput = useMemo(() => ({ gameUrl }), [gameUrl]);
  const statsQuery = trpc.gameStats.byGameUrl.useQuery(queryInput, { staleTime: 60_000, retry: 1 });
  const data = statsQuery.data;
  const awayWon = Boolean(data && data.away.score > data.home.score);
  const homeWon = Boolean(data && data.home.score > data.away.score);

  return <Dialog open onOpenChange={onOpenChange}><DialogContent className="h-[100dvh] w-screen max-w-none overflow-y-auto rounded-none border-0 bg-[#fffdf8] p-0 sm:h-[min(88vh,820px)] sm:max-w-4xl sm:rounded-[18px] sm:border sm:border-[#d7d1c4]"><div className="sticky top-0 z-10 border-b border-[#d7d1c4] bg-[#fffdf8]/95 px-4 pb-3 pt-5 backdrop-blur sm:px-6"><button type="button" onClick={() => onOpenChange(false)} aria-label="Game Statsを閉じる" className="absolute right-4 top-4 inline-flex items-center gap-1 border border-[#cfc8ba] bg-white px-2.5 py-1.5 font-mono text-[9px] font-black tracking-[.08em] text-[#10213a] transition hover:border-[#e85d2a] hover:text-[#a84420] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e85d2a]"><X className="h-3.5 w-3.5" /> CLOSE</button><DialogHeader className="pr-20 text-left"><p className="font-mono text-[9px] font-black tracking-[.16em] text-[#a84420]">NFL OFFICIAL GAME CENTER</p><DialogTitle className="mt-1 font-display text-2xl font-black tracking-[.07em] text-[#10213a]">GAME STATS</DialogTitle><DialogDescription className="text-[11px] text-[#526173]">FINAL GAME · OFFICIAL BOX SCORE</DialogDescription></DialogHeader></div>{statsQuery.isLoading ? <div className="grid min-h-[55vh] place-items-center"><div className="text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-[#e85d2a]" /><p className="mt-3 font-mono text-[10px] font-bold tracking-[.1em] text-[#526173]">LOADING OFFICIAL STATS…</p></div></div> : statsQuery.isError || !data ? <div className="m-4 border border-dashed border-[#d7d1c4] bg-white p-4 text-[12px] leading-5 text-[#526173]">公式Game Bookがまだ利用できないか、一時的に取得できません。NFL公式Game Centerで確認してください。</div> : <div className="p-4 sm:p-6"><section className="rounded-[4px_18px_4px_18px] bg-[#0a1931] px-4 py-5 text-white sm:px-6"><div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-5"><div><p className={`font-display text-[17px] font-black leading-[1.05] tracking-[.02em] sm:text-[26px] ${awayWon ? "text-[#ffc1a7]" : "text-white"}`}>{data.away.name}</p></div><p className="font-display text-[38px] font-black tracking-[-.06em] sm:text-5xl"><span className={awayWon ? "text-[#ffc1a7]" : undefined}>{data.away.score}</span><span className="text-[#a5b3c9]"> — </span><span className={homeWon ? "text-[#ffc1a7]" : undefined}>{data.home.score}</span></p><div className="text-right"><p className={`font-display text-[17px] font-black leading-[1.05] tracking-[.02em] sm:text-[26px] ${homeWon ? "text-[#ffc1a7]" : "text-white"}`}>{data.home.name}</p></div></div><p className="mt-4 text-center font-mono text-[8px] font-bold tracking-[.15em] text-[#ffc1a7]">FINAL · OFFICIAL RESULTS</p></section><section className="mt-5"><div className="mb-2 flex items-center gap-2"><p className="font-mono text-[9px] font-black tracking-[.14em] text-[#64748b]">TEAM COMPARISON</p><span className="h-px flex-1 bg-[#d9d5cc]" /></div><div className="overflow-hidden rounded border border-[#ded8cc] bg-white"><div className="grid grid-cols-[1fr_1.25fr_1fr] items-center border-b border-[#ded8cc] bg-[#f5f2ea] px-2 py-2 font-mono text-[9px] font-black tracking-[.05em] text-[#526173]"><span className="truncate" title={data.away.name}>{data.away.name}</span><span className="text-center">GAME TOTAL</span><span className="truncate text-right" title={data.home.name}>{data.home.name}</span></div>{data.teamStats.map((stat) => <div key={stat.key} className="grid grid-cols-[1fr_1.25fr_1fr] items-center gap-2 border-b border-[#eeeae1] px-2 py-2 last:border-b-0"><StatValue value={stat.away} other={stat.home} better={stat.better} /><span className="text-center font-mono text-[8px] font-black tracking-[.05em] text-[#526173]">{stat.label}</span><span className="text-right"><StatValue value={stat.home} other={stat.away} better={stat.better} /></span></div>)}</div></section><section className="mt-5"><div className="mb-2 flex items-center gap-2"><p className="font-mono text-[9px] font-black tracking-[.14em] text-[#64748b]">INDIVIDUAL STATS</p><span className="h-px flex-1 bg-[#d9d5cc]" /></div><div className="space-y-5">{categories.map((category) => <PlayerCategory key={category.key} category={category} away={data.players[category.key].away} home={data.players[category.key].home} awayName={data.away.name} homeName={data.home.name} />)}</div></section><a href={data.sourceUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-1 font-mono text-[10px] font-black tracking-[.08em] text-[#a84420] underline decoration-[#e85d2a] decoration-2 underline-offset-4">OFFICIAL GAME BOOK <ExternalLink className="h-3.5 w-3.5" /></a></div>}</DialogContent></Dialog>;
}
