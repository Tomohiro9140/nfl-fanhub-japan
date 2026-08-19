import { EmbeddedAppNav } from "@/components/EmbeddedAppNav";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Award, BadgeDollarSign, CalendarDays, GraduationCap, Hash, LoaderCircle, Search, Shield, SlidersHorizontal, Trophy, UserRoundSearch, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type SearchMode = "name" | "filter";
type DetailTab = "career" | "awards" | "stats" | "contracts";
type AtlasPreview = {
  id: string;
  name: string;
  position: string;
  number: string;
  headshot: string;
  rosterStatus: "current" | "past";
  lastSeason: number | null;
  team: { abbreviation: string; name: string; color: string; logo?: string };
};

function PlayerAvatar({ player, size = "md" }: { player: Pick<AtlasPreview, "name" | "headshot">; size?: "sm" | "md" | "lg" }) {
  const dimension = size === "lg" ? "h-28 w-28" : size === "sm" ? "h-11 w-11" : "h-14 w-14";
  const initials = player.name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("") || "NFL";
  return <div className={`relative grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-slate-900 font-mono text-sm font-bold text-white/85 ${dimension}`}>
    <span>{initials}</span>
    {player.headshot ? <img src={player.headshot} alt={`${player.name}の写真`} className="absolute inset-0 h-full w-full object-cover object-top" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : null}
  </div>;
}

function SectionTitle({ children }: { children: string }) {
  return <p className="font-mono text-[10px] font-bold tracking-[.16em] text-slate-400">{children}</p>;
}

function AtlasDetailLoading({ label }: { label: string }) {
  return <div className="flex min-h-28 flex-col items-center justify-center gap-2 py-5 text-center"><LoaderCircle className="h-5 w-5 animate-spin text-[#e85d2a]" /><p className="text-xs font-bold text-slate-500">{label}を読み込んでいます</p></div>;
}

function AtlasDetailError({ onRetry }: { onRetry: () => void }) {
  return <div className="py-5 text-center"><p className="text-xs font-bold text-rose-700">データを取得できませんでした。</p><button type="button" onClick={onRetry} className="mt-2 rounded-lg bg-rose-50 px-3 py-1.5 text-[11px] font-extrabold text-rose-800">再試行</button></div>;
}

function money(value: number) {
  if (!value) return "—";
  return value >= 1_000_000 ? `$${(value / 1_000_000).toFixed(1)}M` : `$${value.toFixed(1)}M`;
}

function atlasStatValue(values: object, key: string) {
  return (values as Record<string, unknown>)[key] ?? "—";
}

export default function Atlas() {
  const [mode, setMode] = useState<SearchMode>("name");
  const [nameQuery, setNameQuery] = useState(() => new URLSearchParams(window.location.search).get("q") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(nameQuery);
  const [team, setTeam] = useState("");
  const [position, setPosition] = useState("");
  const [jersey, setJersey] = useState("");
  const [selectedPreview, setSelectedPreview] = useState<AtlasPreview | null>(null);
  const [selectedId, setSelectedId] = useState(() => new URLSearchParams(window.location.search).get("player") ?? "");
  const [detailTab, setDetailTab] = useState<DetailTab>("career");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(nameQuery), 240);
    return () => window.clearTimeout(timer);
  }, [nameQuery]);

  const nameInput = useMemo(() => ({ query: debouncedQuery.trim() }), [debouncedQuery]);
  const browseInput = useMemo(() => ({ team, position: position || undefined, jersey: jersey.trim() || undefined }), [team, position, jersey]);
  const teamFilterInput = useMemo(() => team ? { team } : undefined, [team]);
  const profileInput = useMemo(() => ({ playerId: selectedId }), [selectedId]);

  const filters = trpc.atlas.filters.useQuery();
  const filteredOptions = trpc.atlas.filters.useQuery(teamFilterInput, { enabled: Boolean(team) });
  const nameSearch = trpc.atlas.search.useQuery(nameInput, { enabled: nameInput.query.length >= 2, staleTime: 60_000 });
  const browse = trpc.atlas.browse.useQuery(browseInput, { enabled: Boolean(team) && Boolean(position || jersey.trim()), staleTime: 60_000 });
  const profile = trpc.atlas.profile.useQuery(profileInput, { enabled: Boolean(selectedId), staleTime: 5 * 60_000 });
  const career = trpc.atlas.career.useQuery(profileInput, { enabled: Boolean(selectedId) && detailTab === "career", staleTime: 12 * 60_000 });
  const awards = trpc.atlas.awards.useQuery(profileInput, { enabled: Boolean(selectedId) && detailTab === "awards", staleTime: 12 * 60_000 });
  const stats = trpc.atlas.stats.useQuery(profileInput, { enabled: Boolean(selectedId) && detailTab === "stats", staleTime: 12 * 60_000 });
  const contracts = trpc.atlas.contracts.useQuery(profileInput, { enabled: Boolean(selectedId) && detailTab === "contracts", staleTime: 12 * 60_000 });

  const results = mode === "name" ? nameSearch.data?.players ?? [] : browse.data?.players ?? [];
  const resultsLoading = mode === "name" ? nameSearch.isFetching : browse.isFetching;
  const resultsError = mode === "name" ? nameSearch.error : browse.error;
  const availablePositions = filteredOptions.data?.positions ?? filters.data?.positions ?? [];

  const selectPlayer = (player: AtlasPreview) => {
    setSelectedPreview(player);
    setSelectedId(player.id);
    setDetailTab("career");
    const url = new URL(window.location.href);
    url.searchParams.set("player", player.id);
    window.history.pushState({}, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeDetail = () => {
    setSelectedId("");
    setSelectedPreview(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("player");
    window.history.pushState({}, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearName = () => {
    setNameQuery("");
    const url = new URL(window.location.href);
    url.searchParams.delete("q");
    window.history.replaceState({}, "", url);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const profileDetails = profile.data?.profile;
  const player = profileDetails ?? selectedPreview;
  if (selectedId) {
    const teamColor = player?.team.color || "#142033";
    return <main className="min-h-[100dvh] bg-[#f7f5f0] pb-12 text-slate-900">
      <EmbeddedAppNav current="ATLAS" />
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 pb-3 pt-5">
        <button type="button" onClick={closeDetail} className="inline-flex h-10 items-center gap-1.5 rounded-xl px-2 text-sm font-bold text-slate-700 transition hover:bg-white active:scale-95"><ArrowLeft className="h-4 w-4" />検索へ戻る</button>
        <span className="font-mono text-[10px] font-bold tracking-[.18em] text-slate-400">PLAYER CARD</span>
      </header>
      <div className="mx-auto w-full max-w-3xl px-4">
        {!player ? <div className="animate-pulse rounded-[2rem] bg-slate-900 px-5 py-7"><div className="h-4 w-20 rounded bg-white/20" /><div className="mt-4 h-9 w-44 rounded bg-white/20" /><div className="mt-6 h-20 rounded bg-white/10" /></div> : <>
          <section className="overflow-hidden rounded-[2rem] text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]" style={{ background: `linear-gradient(135deg, ${teamColor} 0%, #091423 100%)` }}>
            <div className="relative px-5 pb-6 pt-5"><div className="absolute -right-8 -top-8 h-40 w-40 rounded-full border-[20px] border-white/[.07]" />
              <div className="relative flex items-start justify-between gap-4"><div className="min-w-0"><div className="mb-4 flex items-center gap-2"><span className="rounded-md bg-white/15 px-2 py-1 font-mono text-[10px] font-bold tracking-[.12em]">{player.rosterStatus === "past" ? "PAST PLAYER" : player.team.abbreviation}</span><span className="text-xs font-semibold text-white/65">{player.rosterStatus === "past" ? `LAST ACTIVE ${player.lastSeason ?? "—"}` : `#${player.number}`}</span></div><h1 className="text-4xl font-black leading-[.92] tracking-[-.05em]">{player.name}</h1><p className="mt-2 text-sm font-bold text-white/75">{player.position} <span className="mx-1.5 text-white/35">/</span> {player.rosterStatus === "past" ? `Last Team ${player.team.name}` : player.team.name}</p></div><PlayerAvatar player={player} size="lg" /></div>
              <div className="mt-6 grid grid-cols-3 divide-x divide-white/15 border-t border-white/15 pt-4"><div><p className="text-[10px] font-bold tracking-[.1em] text-white/50">AGE</p><p className="mt-1 text-base font-extrabold">{profileDetails?.age ?? "—"}</p><p className="mt-1 text-[10px] font-semibold text-white/60">{profileDetails?.birthDate ?? "—"}</p></div><div className="pl-4"><p className="text-[10px] font-bold tracking-[.1em] text-white/50">HEIGHT</p><p className="mt-1 text-base font-extrabold">{profileDetails?.displayHeight ?? "—"}</p></div><div className="pl-4"><p className="text-[10px] font-bold tracking-[.1em] text-white/50">WEIGHT</p><p className="mt-1 text-base font-extrabold">{profileDetails?.displayWeight ?? "—"}</p></div></div>
            </div>
          </section>
          <section className="mt-4 grid grid-cols-2 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-900/[.05]"><div className="flex gap-2.5 px-1 py-1"><GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" /><div className="min-w-0"><SectionTitle>COLLEGE</SectionTitle><p className="mt-1 text-xs font-bold leading-snug text-slate-700">{profileDetails?.college ?? "—"}</p></div></div><div className="flex gap-2.5 border-l border-slate-100 px-3 py-1"><Hash className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" /><div className="min-w-0"><SectionTitle>DRAFT</SectionTitle><p className="mt-1 text-xs font-bold leading-snug text-slate-700">{profileDetails?.draft ?? "—"}</p></div></div></section>
          <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/[.05]"><div className="grid grid-cols-4 border-b border-slate-100">{([
            ["career", "CAREER", Shield], ["awards", "AWARDS", Trophy], ["stats", "STATS", Award], ["contracts", "CONTRACT", BadgeDollarSign],
          ] as const).map(([key, label, Icon]) => <button key={key} type="button" onClick={() => setDetailTab(key)} className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[9px] font-black tracking-[.04em] ${detailTab === key ? "border-b-2 border-[#e85d2a] bg-[#fffaf6] text-[#10213a]" : "text-slate-400"}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div>
            <div className="p-4">{detailTab === "career" ? <>{career.isFetching ? <AtlasDetailLoading label="キャリア" /> : career.isError ? <AtlasDetailError onRetry={() => void career.refetch()} /> : career.data?.spans.length ? <div className="space-y-2">{career.data.spans.map((span) => <div key={`${span.startSeason}-${span.team.abbreviation}`} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5"><span className="h-8 w-1 rounded-full" style={{ backgroundColor: span.team.color }} /><span className="min-w-0 flex-1"><span className="block text-sm font-extrabold text-slate-800">{span.team.name}</span><span className="mt-0.5 block font-mono text-[10px] font-bold text-slate-400">{span.startSeason === span.endSeason ? span.startSeason : `${span.startSeason} — ${span.endSeason}`}</span></span><span className="rounded-md bg-white px-2 py-1 text-[10px] font-black text-slate-500 shadow-sm">{span.team.abbreviation}</span></div>)}</div> : <p className="py-5 text-center text-xs font-bold text-slate-400">確認できるキャリア履歴がありません。</p>}</> : null}
            {detailTab === "awards" ? <>{awards.isFetching ? <AtlasDetailLoading label="受賞歴" /> : awards.isError ? <AtlasDetailError onRetry={() => void awards.refetch()} /> : awards.data?.awards.length ? <ul className="space-y-2">{awards.data.awards.map((item) => <li key={item} className="flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-950"><Trophy className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />{item}</li>)}</ul> : <p className="py-5 text-center text-xs font-bold text-slate-400">公開受賞歴は確認できませんでした。</p>}</> : null}
            {detailTab === "stats" ? <>
              {stats.isFetching ? <AtlasDetailLoading label="シーズン成績" /> : stats.isError ? <AtlasDetailError onRetry={() => void stats.refetch()} /> : stats.data?.seasons.length ? <div className="overflow-x-auto"><table className="w-full min-w-[430px] border-collapse text-left"><thead><tr className="border-b border-slate-100 text-[9px] font-black tracking-[.08em] text-slate-400"><th className="px-2 py-2">SEASON</th><th className="px-2 py-2">TEAM</th>{stats.data.columns.map((column) => <th key={column.key} className="px-2 py-2 text-right">{column.label}</th>)}</tr></thead><tbody>{stats.data.seasons.map((season) => <tr key={`${season.season}-${season.team}`} className="border-b border-slate-50 text-[11px] font-bold text-slate-700"><td className="px-2 py-2.5">{season.season}</td><td className="px-2 py-2.5">{season.team}</td>{stats.data.columns.map((column) => <td key={column.key} className="px-2 py-2.5 text-right tabular-nums">{String(atlasStatValue(season.values, column.key))}</td>)}</tr>)}</tbody></table></div> : <p className="py-5 text-center text-xs font-bold text-slate-400">公開成績は確認できませんでした。</p>}
            </> : null}
            {detailTab === "contracts" ? <>{contracts.isFetching ? <AtlasDetailLoading label="契約情報" /> : contracts.isError ? <AtlasDetailError onRetry={() => void contracts.refetch()} /> : contracts.data?.available && contracts.data.records.length ? <div className="space-y-2">{contracts.data.records.map((record) => <div key={`${record.team}-${record.yearSigned}`} className="rounded-xl border border-slate-100 px-3 py-3"><div className="flex items-center justify-between gap-3"><span className="text-sm font-extrabold text-slate-800">{record.team}</span><span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-500">{record.yearSigned}</span></div><div className="mt-2 grid grid-cols-3 gap-2 text-center"><div><SectionTitle>TOTAL</SectionTitle><p className="mt-1 text-[11px] font-black text-slate-800">{money(record.total)}</p></div><div><SectionTitle>APY</SectionTitle><p className="mt-1 text-[11px] font-black text-slate-800">{money(record.apy)}</p></div><div><SectionTitle>GUAR.</SectionTitle><p className="mt-1 text-[11px] font-black text-slate-800">{money(record.guaranteed)}</p></div></div></div>)}</div> : <div className="py-5 text-center"><p className="text-xs font-bold text-slate-500">{contracts.data?.source.message ?? "公開契約情報は確認できませんでした。"}</p><p className="mt-1 text-[10px] text-slate-400">nflverse / OverTheCap 公開データを参照</p></div>}</> : null}</div>
          </section>
        </>}
        {profile.isError ? <button type="button" onClick={() => void profile.refetch()} className="mx-auto mt-4 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-rose-700 shadow-sm ring-1 ring-rose-100"><LoaderCircle className="h-3.5 w-3.5" />プロフィールを再試行</button> : null}
      </div>
    </main>;
  }

  return <main className="min-h-[100dvh] bg-[#f7f5f0] pb-12 text-slate-900">
    <EmbeddedAppNav current="ATLAS" />
    <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-8 sm:px-6"><header className="mb-7 pr-12"><p className="font-mono text-[10px] font-bold tracking-[.18em] text-[#e85d2a]">FAN/HUB · PLAYER ATLAS</p><h1 className="mt-2 text-4xl font-black tracking-[-.06em] text-[#10213a]">NFL PLAYER<br />DIRECTORY</h1><p className="mt-3 max-w-lg text-sm font-medium leading-6 text-slate-600">現役選手と過去のNFL選手を、名前・チーム・ポジション・背番号から検索できます。</p></header>
      <section className="overflow-hidden rounded-[1.8rem] bg-white shadow-[0_12px_35px_rgba(15,23,42,.08)] ring-1 ring-slate-900/[.05]"><div className="flex border-b border-slate-100"><button type="button" onClick={() => setMode("name")} className={`flex flex-1 items-center justify-center gap-2 px-3 py-3 text-xs font-extrabold ${mode === "name" ? "border-b-2 border-[#e85d2a] text-[#10213a]" : "text-slate-400"}`}><Search className="h-3.5 w-3.5" />名前から検索</button><button type="button" onClick={() => setMode("filter")} className={`flex flex-1 items-center justify-center gap-2 px-3 py-3 text-xs font-extrabold ${mode === "filter" ? "border-b-2 border-[#e85d2a] text-[#10213a]" : "text-slate-400"}`}><SlidersHorizontal className="h-3.5 w-3.5" />条件で探す</button></div>
        <div className="p-4">{mode === "name" ? <div><label htmlFor="atlas-name" className="sr-only">選手名</label><div className="flex items-center rounded-xl bg-slate-50 px-3 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-[#e85d2a]/50"><Search className="h-4 w-4 text-slate-400" /><input ref={inputRef} id="atlas-name" value={nameQuery} onChange={(event) => setNameQuery(event.target.value)} placeholder="選手名を入力（2文字以上）" className="h-12 min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none placeholder:text-slate-400" />{nameQuery ? <button type="button" onClick={clearName} aria-label="検索語を消去" className="rounded-md p-1 text-slate-400 hover:bg-white"><X className="h-4 w-4" /></button> : null}</div><p className="mt-2 text-[11px] font-medium text-slate-400">例: Mahomes, Allen, Brady</p></div> : <div className="grid gap-3 sm:grid-cols-3"><label className="block"><span className="mb-1.5 block font-mono text-[10px] font-bold tracking-[.12em] text-slate-400">TEAM</span><select value={team} onChange={(event) => { setTeam(event.target.value); setPosition(""); }} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-[#e85d2a]"><option value="">チームを選択</option>{filters.data?.teams.map((item) => <option key={item.abbreviation} value={item.abbreviation}>{item.name}</option>)}</select></label><label className="block"><span className="mb-1.5 block font-mono text-[10px] font-bold tracking-[.12em] text-slate-400">POSITION</span><select value={position} onChange={(event) => setPosition(event.target.value)} disabled={!team} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none disabled:opacity-40 focus:border-[#e85d2a]"><option value="">すべて</option>{availablePositions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="block"><span className="mb-1.5 block font-mono text-[10px] font-bold tracking-[.12em] text-slate-400">JERSEY</span><input value={jersey} onChange={(event) => setJersey(event.target.value.replace(/\D/g, "").slice(0, 3))} disabled={!team} inputMode="numeric" placeholder="#" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none disabled:opacity-40 focus:border-[#e85d2a]" /></label></div>}</div>
      </section>
      <section className="mt-7"><div className="mb-3 flex items-center justify-between"><SectionTitle>{mode === "name" ? "SEARCH RESULTS" : "FILTER RESULTS"}</SectionTitle>{resultsLoading ? <LoaderCircle className="h-4 w-4 animate-spin text-[#e85d2a]" /> : null}</div>{resultsError ? <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-6 text-center text-sm font-semibold text-rose-800">選手データを取得できませんでした。接続を確認して再度お試しください。</div> : results.length ? <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/[.05]">{results.map((item) => <button key={item.id} type="button" onClick={() => selectPlayer(item)} className="flex w-full items-center gap-3 border-b border-slate-100 px-3 py-3 text-left transition last:border-b-0 hover:bg-slate-50 active:scale-[.995]"><PlayerAvatar player={item} size="sm" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-extrabold text-slate-900">{item.name}</span><span className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-500"><span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700">{item.position}</span><span className={`rounded-md px-1.5 py-0.5 text-[10px] ${item.rosterStatus === "current" ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>{item.rosterStatus === "current" ? "現役" : "過去"}</span><span>{item.rosterStatus === "current" ? `${item.team.abbreviation} · #${item.number}` : `Last Team: ${item.team.abbreviation} · ${item.lastSeason ?? "—"}`}</span></span></span><span className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: item.team.color }} /></button>)}</div> : <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-9 text-center"><UserRoundSearch className="mx-auto h-5 w-5 text-slate-300" /><p className="mt-2 text-sm font-semibold text-slate-500">{mode === "name" ? "選手名を2文字以上入力してください" : "チームとポジション、または背番号を選択してください"}</p></div>}</section>
      <footer className="mt-8 flex items-center gap-2 text-[10px] font-medium leading-5 text-slate-400"><CalendarDays className="h-3.5 w-3.5 shrink-0" />選手索引はNFLverse公開データをもとに更新されます。</footer>
    </div>
  </main>;
}
