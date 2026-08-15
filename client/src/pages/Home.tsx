/**
 * Gameday Field Notes: mobile-first NFL viewing notebook.
 * Stable team metadata stays local; game, roster, injury and news data arrive from official caches.
 */
import { useEffect, useMemo, useState } from "react";
import { CircleAlert, Eye, EyeOff, Flag, Menu, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getTeamByCode, nflTeams, type FavoriteTeam, type TeamTone } from "@/lib/nflTeams";
import { OfficialTeamFeed } from "@/components/OfficialTeamFeed";
import { OfficialGameNotes, OfficialGameTicket, OfficialHuddle, OfficialStatusRadar, type TeamSnapshot } from "@/components/OfficialGameExperience";
import { trpc } from "@/lib/trpc";

const brandLogo = "/manus-storage/nfl-fan-hub-logo_44c04145.png";
const favoriteTeamStorageKey = "nfl-fan-hub-favorite-team";

function TeamMark({ team, short, tone }: { team: string; short: string; tone: TeamTone }) {
  const styles: Record<TeamTone, string> = {
    sea: "bg-[#002244] text-[#a5d4d7] ring-[#69be28]/25", gb: "bg-[#203731] text-[#ffb612] ring-[#ffb612]/30",
    sf: "bg-[#aa0000] text-[#b3995d] ring-[#b3995d]/30", kc: "bg-[#e31837] text-white ring-white/25",
    phi: "bg-[#004c54] text-[#a5acaf] ring-[#a5acaf]/30", dal: "bg-[#003594] text-[#b0b7bc] ring-[#b0b7bc]/30",
    buf: "bg-[#00338d] text-[#c60c30] ring-[#c60c30]/35", mia: "bg-[#008e97] text-[#fc4c02] ring-[#fc4c02]/35",
  };
  return <div className={`relative grid h-10 w-10 place-items-center rounded-[12px] font-display text-base font-black tracking-tight ring-[3px] ${styles[tone]}`} aria-label={team}>{short}</div>;
}

function SpoilerSwitch({ spoilerMode, onToggle }: { spoilerMode: boolean; onToggle: () => void }) {
  const panelClass = ["memo-slip relative overflow-hidden border p-4 transition-colors", spoilerMode ? "border-[#b8dca8] bg-[#f0f8eb]" : "border-[#ded8cc] bg-[#fffdf8]"].join(" ");
  const iconClass = ["grid h-10 w-10 place-items-center rounded-xl", spoilerMode ? "bg-[#3d6b2c] text-white" : "bg-[#e9e3d6] text-[#526173]"].join(" ");
  const toggleClass = ["relative h-7 w-12 rounded-full p-1 transition", spoilerMode ? "bg-[#3d6b2c]" : "bg-[#cbd5e1]"].join(" ");
  const knobClass = ["block h-5 w-5 rounded-full bg-white shadow-sm transition-transform", spoilerMode ? "translate-x-5" : "translate-x-0"].join(" ");
  return <section id="safe" data-layout-scope="spoiler" className={panelClass}>
    <div className="flex items-center gap-3"><div className={iconClass}>{spoilerMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</div><div className="min-w-0 flex-1"><p className="font-display text-base font-bold leading-none tracking-wide">SPOILER SAFE</p><p className="mt-1 text-[11px] text-[#687587]">{spoilerMode ? "結果・スコア・結果が分かる画像を隠しています" : "試合結果を通常どおり表示しています"}</p></div><button onClick={onToggle} className={toggleClass} aria-pressed={spoilerMode} aria-label="ネタバレ防止モードを切り替える"><span className={knobClass} /></button></div>
    <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#cfe6c4] bg-white/80 px-3 py-1.5 text-[11px] text-[#426237]"><ShieldCheck className="h-3.5 w-3.5 shrink-0" /> 視聴が終わるまで、この設定を維持します。</div>
  </section>;
}

export default function Home() {
  const [spoilerMode, setSpoilerMode] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [pickerConference, setPickerConference] = useState<"AFC" | "NFC">("AFC");
  const debugTeamCode = typeof window !== "undefined" && import.meta.env.DEV ? new URLSearchParams(window.location.search).get("teamDebug") : null;
  const [favorite, setFavorite] = useState<FavoriteTeam>(() => {
    if (typeof window === "undefined") return nflTeams[0];
    return getTeamByCode(debugTeamCode) ?? getTeamByCode(window.localStorage.getItem(favoriteTeamStorageKey)) ?? nflTeams[0];
  });
  const snapshotQuery = trpc.teamSnapshot.byTeam.useQuery({ teamCode: favorite.code }, { refetchInterval: 15 * 60 * 1000, retry: 1 });
  const snapshot = snapshotQuery.data as TeamSnapshot | undefined;
  const divisionGroups = useMemo(() => ["East", "North", "South", "West"].map((division) => ({ division, teams: nflTeams.filter((team) => team.conference === pickerConference && team.division === division) })), [pickerConference]);

  useEffect(() => { if (!debugTeamCode) window.localStorage.setItem(favoriteTeamStorageKey, favorite.code); }, [debugTeamCode, favorite.code]);

  const toggleSpoiler = () => {
    setSpoilerMode((current) => !current);
    toast(spoilerMode ? "通常モードに切り替えました" : "ネタバレ防止モードをオンにしました", { description: spoilerMode ? "試合結果を表示できます。" : "結果とスコアを伏せます。" });
  };

  return <div className="min-h-screen overflow-x-clip bg-[#f5f2ea] text-[#10213a] selection:bg-[#e85d2a] selection:text-white">
    <div className="field-grid pointer-events-none fixed inset-0 z-0 opacity-[.16]" />
    <header className="sticky top-0 z-30 border-b border-[#ded8cc]/80 bg-[#f5f2ea]/92 backdrop-blur-lg"><div className="mx-auto flex h-[68px] w-full min-w-0 max-w-6xl items-center justify-between px-4 sm:px-6"><a href="#home" className="flex items-center gap-2.5" aria-label="NFL Fan Hub Japan ホーム"><img src={brandLogo} alt="NFL Fan Hub Japanのロゴ" className="h-9 w-9" /><span className="font-display text-xl font-extrabold tracking-[-.03em]">FAN<span className="text-[#e85d2a]">/</span>HUB</span><span className="hidden border-l border-[#cfc8bb] pl-2 font-mono text-[9px] font-bold tracking-[.17em] text-[#64748b] sm:inline">JAPAN</span></a><nav className="hidden items-center gap-1 md:flex" aria-label="主要ナビゲーション"><a href="#home" className="nav-link">HOME</a><a href="#updates" className="nav-link">UPDATES</a><a href="#briefing" className="nav-link">BRIEFING</a><a href="#status" className="nav-link">RADAR</a><a href="#safe" className="nav-link">SAFE MODE</a></nav><div className="flex items-center gap-2"><button onClick={() => setTeamDialogOpen(true)} className="inline-flex items-center gap-2 border border-[#d7d1c4] bg-white px-2.5 py-2 text-[11px] font-bold transition hover:border-[#10213a]"><Flag className="h-3.5 w-3.5 text-[#e85d2a]" /> TEAM / {favorite.code}</button><button onClick={() => setNavOpen((value) => !value)} className="grid h-9 w-9 place-items-center rounded-full border border-[#d7d1c4] bg-white md:hidden" aria-label="メニューを開く">{navOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button></div></div>{navOpen && <nav className="border-t border-[#ded8cc] bg-[#fffdf8] p-3 md:hidden"><div className="grid grid-cols-2 gap-2">{[["HOME", "#home"], ["UPDATES", "#updates"], ["BRIEFING", "#briefing"], ["RADAR", "#status"], ["SAFE MODE", "#safe"]].map(([label, href]) => <a onClick={() => setNavOpen(false)} className="rounded-lg bg-[#f5f2ea] px-3 py-2.5 font-mono text-xs font-bold tracking-wider" href={href} key={label}>{label}</a>)}</div></nav>}</header>

    <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}><DialogContent className="border-[#d7d1c4] bg-[#f5f2ea] p-5 sm:max-w-md" showCloseButton><DialogHeader className="text-left"><p className="font-mono text-[10px] font-bold tracking-[.16em] text-[#64748b]">YOUR HUDDLE</p><DialogTitle className="font-display text-2xl font-extrabold tracking-[.08em]">FAVORITE TEAM</DialogTitle><DialogDescription className="text-[12px]">AFC／NFCと地区から推しチームを選択します。選択状態はこの端末に保存されます。</DialogDescription></DialogHeader><div className="flex gap-2 border-b border-[#d7d1c4] pb-3"><button onClick={() => setPickerConference("AFC")} className={`px-3 py-1.5 font-mono text-xs font-bold tracking-[.12em] ${pickerConference === "AFC" ? "bg-[#10213a] text-white" : "border border-[#d7d1c4] bg-white text-[#526173]"}`}>AFC</button><button onClick={() => setPickerConference("NFC")} className={`px-3 py-1.5 font-mono text-xs font-bold tracking-[.12em] ${pickerConference === "NFC" ? "bg-[#10213a] text-white" : "border border-[#d7d1c4] bg-white text-[#526173]"}`}>NFC</button></div><div className="max-h-[52vh] space-y-4 overflow-y-auto pr-1">{divisionGroups.map(({ division, teams }) => <section key={division}><p className="mb-2 font-mono text-[10px] font-bold tracking-[.16em] text-[#64748b]">{pickerConference} {division.toUpperCase()}</p><div className="grid grid-cols-2 gap-2">{teams.map((team) => <button key={team.code} onClick={() => { setFavorite(team); setTeamDialogOpen(false); toast(`${team.name} を推しチームに設定しました`); }} className={`flex items-center gap-2 border p-2.5 text-left transition hover:border-[#e85d2a] ${favorite.code === team.code ? "border-[#e85d2a] bg-[#fffaf0]" : "border-[#d7d1c4] bg-white"}`}><TeamMark team={team.name} short={team.code} tone={team.tone} /><span className="min-w-0 flex-1"><span className="block font-display text-base font-bold tracking-wide">{team.code}</span><span className="block truncate text-[10px] text-[#64748b]">{team.name}</span></span>{favorite.code === team.code && <ShieldCheck className="h-3.5 w-3.5 text-[#e85d2a]" />}</button>)}</div></section>)}</div></DialogContent></Dialog>

    <main className="relative z-10 mx-auto w-full min-w-0 max-w-6xl overflow-x-clip px-4 pb-24 pt-3 sm:px-6 sm:pt-5"><div className="mb-3 flex items-center justify-between gap-4"><p className="font-mono text-[10px] font-bold tracking-[.16em] text-[#64748b]">JST · OFFICIAL DATA</p><p className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#526173]"><span className={`h-1.5 w-1.5 rounded-full ${snapshotQuery.isError ? "bg-[#e85d2a]" : "bg-[#69a84c]"}`} /> {snapshotQuery.isError ? "CACHE UNAVAILABLE" : "OFFICIAL CACHE"}</p></div>{snapshotQuery.isError && <div className="mb-3 flex items-center gap-2 border border-[#f1c7b5] bg-[#fff4ef] px-3 py-2 text-[11px] text-[#a34220]"><CircleAlert className="h-4 w-4" />公式データを一時的に取得できません。保存済みの情報を再試行します。</div>}<div className="grid min-w-0 items-start gap-3 lg:grid-cols-[1.22fr_.78fr]"><div className="min-w-0 space-y-3"><OfficialGameTicket favorite={favorite} snapshot={snapshot} loading={snapshotQuery.isLoading} spoilerMode={spoilerMode} /><SpoilerSwitch spoilerMode={spoilerMode} onToggle={toggleSpoiler} /><OfficialHuddle favorite={favorite} snapshot={snapshot} /><div data-layout-scope="official-feed" className="min-w-0"><OfficialTeamFeed favorite={favorite} /></div><OfficialGameNotes favorite={favorite} snapshot={snapshot} /></div><div className="min-w-0 space-y-3"><OfficialStatusRadar favorite={favorite} snapshot={snapshot} loading={snapshotQuery.isLoading} /></div></div><section className="mt-4 border-t border-[#d8d1c3] pt-3"><p className="text-[11px] text-[#687587]">公式チームSchedule、Roster、News、NFL公式Injury Reportを参照しています。更新時刻は各カードに表示されます。</p></section></main>
  </div>;
}
