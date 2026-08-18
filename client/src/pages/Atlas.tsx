import { ArrowLeft, ExternalLink, Search, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { filterAtlasPlayers, type AtlasPlayer } from "@/lib/atlasDirectory";
import { nflTeams } from "@/lib/nflTeams";

const brandLogo = "/manus-storage/fan-hub-field-mark_2da1d2c0.png";

function formatJst(value?: Date) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(value).replace(/\//g, "/");
}

export default function Atlas() {
  const [teamCode, setTeamCode] = useState("ALL");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(60);
  const directoryQuery = trpc.atlas.directory.useQuery(undefined, { staleTime: 15 * 60 * 1000, refetchOnWindowFocus: false, retry: 1 });
  const players = (directoryQuery.data?.players ?? []) as AtlasPlayer[];
  const filtered = useMemo(() => filterAtlasPlayers(players, teamCode, query), [players, query, teamCode]);
  const displayedPlayers = filtered.slice(0, visibleCount);
  const selected = filtered.find((player) => player.id === selectedId) ?? players.find((player) => player.id === selectedId) ?? filtered[0];
  const selectedTeam = selected ? nflTeams.find((team) => team.code === selected.teamCode) : undefined;
  useEffect(() => setVisibleCount(60), [query, teamCode]);

  return <div className="min-h-screen bg-[#f5f2ea] text-[#10213a]">
    <header className="sticky top-0 z-20 border-b border-[#ded8cc] bg-[#f5f2ea]/95 backdrop-blur"><div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6"><a href="/" className="flex items-center gap-2.5" aria-label="FAN/HUBへ戻る"><img src={brandLogo} alt="FAN/HUB" className="h-9 w-9 object-contain" /><span className="font-display text-xl font-extrabold tracking-[-.03em]">FAN<span className="text-[#e85d2a]">/</span>HUB</span></a><a href="/" className="inline-flex items-center gap-1.5 border border-[#d7d1c4] bg-white px-3 py-2 font-mono text-[11px] font-bold tracking-[.08em]"><ArrowLeft className="h-3.5 w-3.5" /> HOME</a></div></header>
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6"><div className="mb-6 border-l-4 border-[#e85d2a] pl-4"><p className="font-mono text-[10px] font-bold tracking-[.18em] text-[#64748b]">FAN/HUB REFERENCE DESK</p><h1 className="font-display text-3xl font-extrabold tracking-[.06em]">ATLAS / PLAYER DIRECTORY</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#526173]">全32チームの公式ロスターを、チーム・名前・ポジション・背番号から素早く探せます。掲載情報はクラブ公式ロスターの最新キャッシュです。</p></div>
      <section className="memo-slip border border-[#d7d1c4] bg-[#fffdf8] p-3 sm:p-4"><div className="grid gap-2 sm:grid-cols-[190px_1fr]"><label className="sr-only" htmlFor="atlas-team">チーム</label><select id="atlas-team" value={teamCode} onChange={(event) => { setTeamCode(event.target.value); setSelectedId(null); }} className="h-11 border border-[#d7d1c4] bg-white px-3 font-mono text-xs font-bold"><option value="ALL">ALL 32 TEAMS</option>{nflTeams.map((team) => <option value={team.code} key={team.code}>{team.code} · {team.name}</option>)}</select><label className="relative"><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#64748b]" /><span className="sr-only">選手を検索</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="SEARCH PLAYER, POSITION OR #" className="h-11 w-full border border-[#d7d1c4] bg-white pl-10 pr-3 font-mono text-xs font-bold tracking-[.06em] outline-none focus:border-[#e85d2a]" /></label></div><p className="mt-3 font-mono text-[10px] font-bold tracking-[.1em] text-[#64748b]">{directoryQuery.isLoading ? "LOADING OFFICIAL ROSTERS…" : `${filtered.length} PLAYERS · SHOWING ${Math.min(visibleCount, filtered.length)} · UPDATED ${formatJst(directoryQuery.data?.lastUpdatedAt)} JST`}</p></section>
      {selected && <section className="mt-4 grid gap-4 border border-[#10213a] bg-[#10213a] p-4 text-white sm:grid-cols-[auto_1fr_auto]"><div className="grid h-14 w-14 place-items-center border border-white/25 font-display text-2xl font-extrabold" style={{ color: selectedTeam?.brand.accent ?? "#e85d2a" }}>{selected.jerseyNumber ? `#${selected.jerseyNumber}` : "—"}</div><div><p className="font-mono text-[10px] font-bold tracking-[.16em] text-white/60">OFFICIAL PLAYER FILE</p><h2 className="font-display text-2xl font-extrabold tracking-wide">{selected.playerName}</h2><p className="mt-1 text-sm text-white/75">{selectedTeam?.name ?? selected.teamCode} · {selected.position} · {selected.rosterStatus}</p></div><a href={selected.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 border border-white/30 px-3 py-2 font-mono text-[10px] font-bold tracking-[.1em] hover:border-[#e85d2a]"><ExternalLink className="h-3.5 w-3.5" /> OFFICIAL ROSTER</a></section>}
      <section className="mt-4 overflow-hidden border border-[#d7d1c4] bg-white"><div className="grid grid-cols-[1fr_54px_64px] border-b border-[#d7d1c4] bg-[#f5f2ea] px-3 py-2 font-mono text-[10px] font-bold tracking-[.13em] text-[#64748b]"><span>PLAYER</span><span>POS</span><span>STATUS</span></div>{displayedPlayers.map((player) => <button type="button" onClick={() => setSelectedId(player.id)} key={player.id} className={`grid w-full grid-cols-[1fr_54px_64px] items-center border-b border-[#ece7dc] px-3 py-3 text-left transition hover:bg-[#fff7ef] ${selected?.id === player.id ? "bg-[#fff7ef]" : "bg-white"}`}><span className="min-w-0"><span className="block truncate font-display text-base font-bold">{player.playerName}</span><span className="block font-mono text-[10px] font-bold tracking-[.1em] text-[#64748b]">{player.teamCode} · {player.jerseyNumber ? `#${player.jerseyNumber}` : "NO #"}</span></span><span className="font-mono text-xs font-bold">{player.position}</span><span className="truncate font-mono text-[10px] font-bold text-[#526173]">{player.rosterStatus}</span></button>)}{!directoryQuery.isLoading && filtered.length === 0 && <div className="p-8 text-center text-sm text-[#64748b]"><UserRound className="mx-auto mb-2 h-5 w-5" />条件に合う公式ロスターが見つかりません。</div>}{displayedPlayers.length < filtered.length && <button type="button" onClick={() => setVisibleCount((count) => count + 60)} className="w-full border-t border-[#d7d1c4] bg-[#f5f2ea] px-3 py-3 font-mono text-[11px] font-bold tracking-[.1em] text-[#a84420] hover:bg-[#fff7ef]">SHOW 60 MORE</button>}</section>
    </main>
  </div>;
}
