/**
 * Gameday Field Notes: mobile-first NFL viewing notebook.
 * Style reminder — editorial data journalism, ink navy / bone / endzone orange,
 * asymmetric field-note hierarchy; every element should help users decide what to watch next.
 */
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bell,
  ChevronRight,
  CircleAlert,
  Clock3,
  Eye,
  EyeOff,
  Flag,
  Headphones,
  Menu,
  MoreHorizontal,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Tv,
  UserRoundCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getTeamByCode, nflTeams, type FavoriteTeam, type TeamTone } from "@/lib/nflTeams";
import { OfficialTeamFeed } from "@/components/OfficialTeamFeed";

const heroImage = "/manus-storage/nfl-fan-hub-field-notes-hero_49725db5.jpg";
const statusImage = "/manus-storage/nfl-fan-hub-status-board_53beb1fe.jpg";
const brandLogo = "/manus-storage/nfl-fan-hub-logo_44c04145.png";
const daznGamePassUrl = "https://www.dazn.com/ja-JP/l/nfl-game-pass";

const favoriteTeamStorageKey = "nfl-fan-hub-favorite-team";

type GameCardProps = {
  spoilerMode: boolean;
  favorite: FavoriteTeam;
};

function SectionLabel({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-[#64748b]">
      <span className="text-[#10213a]">{number}</span>
      <span>{label}</span>
      <span className="h-px flex-1 bg-[#d9d5cc]" />
    </div>
  );
}

function TeamMark({ team, short, tone }: { team: string; short: string; tone: TeamTone }) {
  const styles: Record<TeamTone, string> = {
    sea: "bg-[#002244] text-[#a5d4d7] ring-[#69be28]/25",
    gb: "bg-[#203731] text-[#ffb612] ring-[#ffb612]/30",
    sf: "bg-[#aa0000] text-[#b3995d] ring-[#b3995d]/30",
    kc: "bg-[#e31837] text-white ring-white/25",
    phi: "bg-[#004c54] text-[#a5acaf] ring-[#a5acaf]/30",
    dal: "bg-[#003594] text-[#b0b7bc] ring-[#b0b7bc]/30",
    buf: "bg-[#00338d] text-[#c60c30] ring-[#c60c30]/35",
    mia: "bg-[#008e97] text-[#fc4c02] ring-[#fc4c02]/35",
  };
  return (
    <div className={`relative grid h-10 w-10 place-items-center rounded-[12px] font-display text-base font-black tracking-tight ring-[3px] ${styles[tone]}`} aria-label={team}>
      {short}
    </div>
  );
}

function UpcomingGame({ spoilerMode, favorite }: GameCardProps) {
  return (
    <section className="ticket-cut ticket-paper relative overflow-hidden rounded-[18px] bg-[#0a1931] text-[#fffaf0] shadow-[0_24px_50px_rgba(10,25,49,0.2)]">
      <img src={heroImage} alt="夜明けのアメリカンフットボールフィールド" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(10,25,49,.96)_0%,rgba(10,25,49,.85)_56%,rgba(10,25,49,.48)_100%)]" />
      <div className="absolute inset-y-0 left-7 z-10 hidden border-l border-dashed border-white/25 lg:block" />
      <div className="relative p-4 sm:p-5 lg:pl-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#ffc1a7]">GAME TICKET / PRESEASON W1 <span className="ml-1 bg-[#e85d2a] px-1.5 py-0.5 text-[9px] text-white">DEMO</span></p>
            <p className="mt-2 font-display text-2xl font-extrabold tracking-[.08em] text-white sm:text-3xl">{favorite.code} @ {favorite.opponent}</p>
          </div>
          <button onClick={() => toast("フォロー設定を開く準備ができました")} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20 active:scale-[.97]" aria-label="フォロー設定">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex items-center gap-3">
            <TeamMark team={favorite.name} short={favorite.code} tone={favorite.tone} />
            <span className="font-display text-lg font-bold">{favorite.code}</span>
          </div>
          <div className="border-x border-dashed border-white/25 px-3 text-center">
            <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-[#a5b3c9]">JST / SUN</p>
            <p className="mt-0.5 font-display text-2xl font-extrabold tracking-[.08em]">02:00</p>
            <p className="mt-0.5 font-mono text-[9px] tracking-wide text-[#ffc1a7]">07:13:48 TO GO</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-bold">{favorite.opponent}</span>
            <TeamMark team={favorite.opponentName} short={favorite.opponent} tone={favorite.opponentTone} />
          </div>
        </div>

        <div className="ticket-rule mt-4 pt-3">
          <a href={daznGamePassUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 w-full items-center justify-center gap-2 bg-[#e85d2a] px-3 font-sans text-[13px] font-bold text-white transition hover:bg-[#cf4f20] active:scale-[.97]">
            <Tv className="h-4 w-4" /> 観戦する <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
        {spoilerMode && <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#d5f4ca]"><ShieldCheck className="h-3.5 w-3.5" /> SPOILER SAFE / 結果は非表示です</p>}
      </div>
    </section>
  );
}

function QuickRoute({ spoilerMode, favorite }: { spoilerMode: boolean; favorite: FavoriteTeam }) {
  return (
    <section id="home" className="scroll-mt-24">
      <SectionLabel number="01" label="YOUR HUDDLE" />
      <div className="mt-3 grid gap-3 sm:grid-cols-[1.15fr_.85fr]">
        <article className="clip-note border border-[#ded8cc] bg-white p-3 shadow-[0_10px_30px_rgba(34,42,53,.05)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#e85d2a] text-white"><Bell className="h-4 w-4" /></div>
              <div><p className="font-display text-base font-bold leading-none tracking-wide">FOLLOWED UPDATES</p><p className="mt-1 text-[11px] text-[#687587]">最終更新 11:18 JST</p></div>
            </div>
            <span className="rounded-full bg-[#fff0e9] px-2 py-1 font-mono text-[10px] font-bold text-[#c44719]">3 UPDATES</span>
          </div>
          <div className="mt-3 divide-y divide-[#eeeae1]">
            <div className="flex items-center justify-between gap-3 py-2"><p className="text-[13px] font-medium"><span className="mr-2 rounded bg-[#e7f5dd] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#3f6d27]">{favorite.roster[0].status}</span> {favorite.roster[0].player} の最新ステータス</p><ChevronRight className="h-4 w-4 text-[#94a3b8]" /></div>
            <div className="flex items-center justify-between gap-3 py-2"><p className="text-[13px] font-medium"><span className="mr-2 rounded bg-[#fff0e9] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#c44719]">WATCH</span> {favorite.code} の次戦まで 7時間</p><ChevronRight className="h-4 w-4 text-[#94a3b8]" /></div>
          </div>
        </article>
        <article className="margin-note relative overflow-hidden bg-[#e9e3d6] p-4">
          <div className="relative z-10 flex h-full flex-col justify-between"><div><p className="font-mono text-[10px] font-bold tracking-[.16em] text-[#657084]">LAST CHECKED</p><p className="mt-1 font-display text-xl font-extrabold tracking-wide">{spoilerMode ? "SPOILER SAFE" : "LAST GAME NOTES"}</p></div><button onClick={() => toast(spoilerMode ? "セーフモード中は結果を表示しません" : "試合ノートを開く準備ができました")} className="inline-flex w-fit items-center gap-1.5 text-[13px] font-bold text-[#0a1931] underline decoration-[#e85d2a] decoration-2 underline-offset-4">{spoilerMode ? "VIEW WITHOUT SCORE" : "OPEN GAME NOTES"} <ArrowUpRight className="h-4 w-4" /></button></div>
          <div className="absolute -right-5 -bottom-7 font-display text-[120px] font-black leading-none text-[#d2c8b7]/65">H</div>
        </article>
      </div>
    </section>
  );
}

function TeamUpdates({ favorite }: { favorite: FavoriteTeam }) {
  const news = [
    { label: "PRACTICE", time: "20 MIN AGO", title: `${favorite.code} practice report updated`, copy: "出場可否と練習参加状況の最新更新を確認できます。" },
    { label: "GAME PREP", time: "1 HR AGO", title: `${favorite.code} game-week notes`, copy: "次戦に向けた注目マッチアップとゲームプランの要点です。" },
  ];
  return (
    <section id="updates" className="scroll-mt-24">
      <SectionLabel number="02" label={`${favorite.code} TEAM FEED`} />
      <div className="mt-3 grid gap-3 lg:grid-cols-[1.16fr_.84fr]">
        <article className="clip-note border border-[#ded8cc] bg-white p-3 shadow-[0_10px_30px_rgba(34,42,53,.05)]">
          <div className="flex items-center justify-between border-b border-[#eeeae1] pb-2"><div className="flex items-center gap-2"><div className="grid h-7 w-7 place-items-center bg-[#10213a] text-white"><Newspaper className="h-3.5 w-3.5" /></div><p className="font-display text-lg font-bold tracking-wide">LATEST NEWS</p></div><span className="font-mono text-[9px] font-bold tracking-[.12em] text-[#64748b]">DEMO FEED</span></div>
          <div className="divide-y divide-[#eeeae1]">{news.map((item) => <button key={item.label} onClick={() => toast(`${favorite.code} のニュース詳細を開く準備ができました`)} className="flex w-full items-start gap-3 py-2.5 text-left transition hover:bg-[#fffaf0]"><span className="mt-0.5 w-12 shrink-0 font-mono text-[9px] font-bold tracking-[.1em] text-[#e85d2a]">{item.label}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="font-display text-base font-bold tracking-wide">{item.title}</span><ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#94a3b8]" /></span><span className="mt-0.5 block text-[11px] leading-4 text-[#687587]">{item.copy}</span></span><span className="hidden font-mono text-[8px] text-[#94a3b8] sm:block">{item.time}</span></button>)}</div>
        </article>
        <article className="border border-[#ded8cc] bg-[#fffdf8] p-3 shadow-[0_10px_30px_rgba(34,42,53,.05)]">
          <div className="flex items-center justify-between"><p className="font-display text-lg font-bold tracking-wide">INJURY WATCH</p><span className="rounded bg-[#fff0e9] px-1.5 py-0.5 font-mono text-[8px] font-bold text-[#c44719]">DEMO</span></div>
          <div className="mt-2 divide-y divide-[#eeeae1]">{favorite.roster.slice(0, 2).map((player) => <div key={player.player} className="flex items-center gap-2 py-2"><span className="grid h-6 w-6 place-items-center rounded bg-[#e9e3d6] font-mono text-[8px] font-bold">{player.position}</span><span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-bold">{player.player}</span><span className="block truncate text-[10px] text-[#687587]">{player.detail}</span></span><span className={`rounded-full px-1.5 py-1 font-mono text-[8px] font-bold ${player.statusClass}`}>{player.status}</span></div>)}</div>
          <button onClick={() => toast(`${favorite.code} の負傷者一覧を開く準備ができました`)} className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#10213a] underline decoration-[#e85d2a] decoration-2 underline-offset-4">VIEW INJURY REPORT <ArrowUpRight className="h-3.5 w-3.5" /></button>
        </article>
      </div>
    </section>
  );
}

function SpoilerSwitch({ spoilerMode, onToggle }: { spoilerMode: boolean; onToggle: () => void }) {
  return (
    <section id="safe" className={`memo-slip relative overflow-hidden border p-4 transition-colors ${spoilerMode ? "border-[#b8dca8] bg-[#f0f8eb]" : "border-[#ded8cc] bg-[#fffdf8]"}`}>
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${spoilerMode ? "bg-[#3d6b2c] text-white" : "bg-[#e9e3d6] text-[#526173]"}`}>{spoilerMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</div>
        <div className="min-w-0 flex-1"><p className="font-display text-base font-bold leading-none tracking-wide">SPOILER SAFE</p><p className="mt-1 text-[11px] text-[#687587]">{spoilerMode ? "結果・スコア・結果が分かる画像を隠しています" : "試合結果を通常どおり表示しています"}</p></div>
        <button onClick={onToggle} className={`relative h-7 w-12 rounded-full p-1 transition ${spoilerMode ? "bg-[#3d6b2c]" : "bg-[#cbd5e1]"}`} aria-pressed={spoilerMode} aria-label="ネタバレ防止モードを切り替える"><span className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${spoilerMode ? "translate-x-5" : "translate-x-0"}`} /></button>
      </div>
      {spoilerMode ? <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#cfe6c4] bg-white/80 px-3 py-1.5 text-[11px] text-[#426237]"><ShieldCheck className="h-3.5 w-3.5 shrink-0" /> 視聴が終わるまで、この設定を維持します。</div> : <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#e9e3d6] bg-white px-3 py-1.5 text-[11px] text-[#687587]"><CircleAlert className="h-3.5 w-3.5 shrink-0 text-[#e85d2a]" /> 見逃し視聴の前には、セーフモードをオンにしてください。</div>}
    </section>
  );
}

function Briefing({ favorite }: { favorite: FavoriteTeam }) {
  const notes = [
    { label: "MATCHUP", title: `${favorite.code} RT vs. ${favorite.opponent} EDGE`, copy: `${favorite.opponent}の外側ラッシュを、${favorite.code}のRTがどこまで遅らせられるか。最初の3rd downに注目。`, tag: "KEY MATCHUP" },
    { label: "STATUS", title: `${favorite.code} RB AVAILABILITY`, copy: "練習参加状況は改善。ゲームデイの公式発表までは、役割限定の可能性も見ておく。", tag: "UPDATE 11:18" },
    { label: "WATCH", title: `${favorite.code} OPENING SCRIPT`, copy: "序盤の早いダウンでランが出れば、プレーアクションの選択肢が広がる。", tag: "FIRST 15" },
  ];
  return (
    <section id="briefing" className="scroll-mt-24">
      <SectionLabel number="02" label="60-SECOND BRIEFING" />
      <div className="briefing-sheet bg-[#fff] p-3 shadow-[0_10px_30px_rgba(34,42,53,.05)] ring-1 ring-[#ded8cc]">
        <div className="flex items-end justify-between gap-4"><div><h2 className="font-display text-xl font-extrabold tracking-[.08em]">GAME NOTES</h2><p className="mt-0.5 text-[11px] text-[#687587]">THREE THINGS TO WATCH</p></div><div className="grid h-8 w-8 place-items-center rounded-full bg-[#e85d2a] text-white"><Sparkles className="h-3.5 w-3.5" /></div></div>
        <div className="mt-3 grid gap-2">
          {notes.map((note, index) => <article key={note.label} className="briefing-row group border border-[#e9e3d6] bg-[#fffdf8] p-3.5 transition hover:-translate-y-0.5 hover:border-[#e85d2a]/40 hover:shadow-sm">
            <div className="flex gap-3"><span className="font-display text-2xl font-black leading-none text-[#e85d2a]">0{index + 1}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="font-mono text-[9px] font-bold tracking-[.15em] text-[#64748b]">{note.label}</p><span className="rounded bg-[#e9e3d6] px-1.5 py-0.5 font-mono text-[8px] font-bold text-[#526173]">{note.tag}</span></div><h3 className="mt-1 font-display text-lg font-bold leading-none tracking-wide">{note.title}</h3><p className="mt-1.5 text-[12px] leading-[1.45] text-[#526173]">{note.copy}</p></div></div>
          </article>)}
        </div>
      </div>
    </section>
  );
}

function RosterRadar({ favorite }: { favorite: FavoriteTeam }) {
  const rows = favorite.roster;
  return (
    <section id="status" className="scroll-mt-24">
      <SectionLabel number="03" label="STATUS RADAR" />
      <div className="roster-slip mt-3 overflow-hidden border border-[#ded8cc] bg-white shadow-[0_10px_30px_rgba(34,42,53,.05)]">
        <div className="relative min-h-[116px] overflow-hidden bg-[#0a1931] p-4 text-white"><img src={statusImage} alt="戦術ボードの抽象イラスト" className="absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-screen" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,25,49,.98),rgba(10,25,49,.42))]" /><div className="relative z-10"><p className="font-mono text-[9px] font-bold tracking-[.15em] text-[#ffc1a7]">ROSTER / INJURY / TRANSACTION <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[8px] text-white">DEMO</span></p><h2 className="mt-1 font-display text-2xl font-extrabold leading-[.9] tracking-wide">STATUS RADAR</h2><p className="mt-2 text-[11px] text-[#d9e3f3]">OFFICIAL SOURCES · LAST UPDATE 11:18 JST</p></div></div>
        <div className="p-3"><div className="mb-2 flex items-center justify-between"><p className="font-display text-lg font-bold tracking-wide">{favorite.code} / STATUS</p><button onClick={() => toast("すべてのロスター更新を表示する準備ができました")} className="text-[11px] font-bold text-[#0a1931] underline decoration-[#e85d2a] decoration-2 underline-offset-4">VIEW ALL</button></div><div className="divide-y divide-[#eeeae1]">{rows.map(row => <div key={row.player} className="flex items-center gap-3 py-2.5"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#e9e3d6] font-mono text-[9px] font-bold text-[#0a1931]">{row.position}</span><div className="min-w-0 flex-1"><p className="text-[13px] font-bold text-[#10213a]">{row.player}</p><p className="mt-0.5 text-[11px] text-[#687587]">{row.detail}</p></div><span className={`rounded-full px-2 py-1 font-mono text-[8px] font-bold ${row.statusClass}`}>{row.status}</span></div>)}</div><p className="mt-2 flex items-center gap-1.5 border-t border-[#eeeae1] pt-2 font-mono text-[9px] text-[#64748b]"><Clock3 className="h-3.5 w-3.5" /> 11:18 JST · DEMO DATA</p></div>
      </div>
    </section>
  );
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
  const divisionGroups = useMemo(() => ["East", "North", "South", "West"].map((division) => ({
    division,
    teams: nflTeams.filter((team) => team.conference === pickerConference && team.division === division),
  })), [pickerConference]);
  useEffect(() => { if (!debugTeamCode) window.localStorage.setItem(favoriteTeamStorageKey, favorite.code); }, [debugTeamCode, favorite.code]);
  const toggleSpoiler = () => {
    setSpoilerMode(current => !current);
    toast(spoilerMode ? "通常モードに切り替えました" : "ネタバレ防止モードをオンにしました", { description: spoilerMode ? "試合結果を表示できます。" : "結果とスコアを伏せます。" });
  };

  return (
    <div className="min-h-screen bg-[#f5f2ea] text-[#10213a] selection:bg-[#e85d2a] selection:text-white">
      <div className="field-grid pointer-events-none fixed inset-0 z-0 opacity-[.16]" />
      <header className="sticky top-0 z-30 border-b border-[#ded8cc]/80 bg-[#f5f2ea]/92 backdrop-blur-lg">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#home" className="flex items-center gap-2.5" aria-label="NFL Fan Hub Japan ホーム"><img src={brandLogo} alt="NFL Fan Hub Japanのロゴ" className="h-9 w-9" /><span className="font-display text-xl font-extrabold tracking-[-.03em]">FAN<span className="text-[#e85d2a]">/</span>HUB</span><span className="hidden border-l border-[#cfc8bb] pl-2 font-mono text-[9px] font-bold tracking-[.17em] text-[#64748b] sm:inline">JAPAN</span></a>
          <nav className="hidden items-center gap-1 md:flex" aria-label="主要ナビゲーション"><a href="#home" className="nav-link">HOME</a><a href="#updates" className="nav-link">UPDATES</a><a href="#briefing" className="nav-link">BRIEFING</a><a href="#status" className="nav-link">RADAR</a><a href="#safe" className="nav-link">SAFE MODE</a></nav>
          <div className="flex items-center gap-2"><button onClick={() => setTeamDialogOpen(true)} className="inline-flex items-center gap-2 border border-[#d7d1c4] bg-white px-2.5 py-2 text-[11px] font-bold transition hover:border-[#10213a]"><Flag className="h-3.5 w-3.5 text-[#e85d2a]" /> TEAM / {favorite.code}</button><button onClick={() => setNavOpen(v => !v)} className="grid h-9 w-9 place-items-center rounded-full border border-[#d7d1c4] bg-white md:hidden" aria-label="メニューを開く">{navOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button></div>
        </div>
        {navOpen && <nav className="border-t border-[#ded8cc] bg-[#fffdf8] p-3 md:hidden"><div className="grid grid-cols-2 gap-2">{[["HOME", "#home"], ["UPDATES", "#updates"], ["BRIEFING", "#briefing"], ["RADAR", "#status"], ["SAFE MODE", "#safe"]].map(([label, href]) => <a onClick={() => setNavOpen(false)} className="rounded-lg bg-[#f5f2ea] px-3 py-2.5 font-mono text-xs font-bold tracking-wider" href={href} key={label}>{label}</a>)}</div></nav>}
      </header>

      <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
        <DialogContent className="border-[#d7d1c4] bg-[#f5f2ea] p-5 sm:max-w-md" showCloseButton>
          <DialogHeader className="text-left"><p className="font-mono text-[10px] font-bold tracking-[.16em] text-[#64748b]">YOUR HUDDLE</p><DialogTitle className="font-display text-2xl font-extrabold tracking-[.08em]">FAVORITE TEAM</DialogTitle><DialogDescription className="text-[12px]">AFC／NFCと地区から推しチームを選択します。選択状態はこの端末に保存されます。</DialogDescription></DialogHeader>
          <div className="flex gap-2 border-b border-[#d7d1c4] pb-3"><button onClick={() => setPickerConference("AFC")} className={`px-3 py-1.5 font-mono text-xs font-bold tracking-[.12em] ${pickerConference === "AFC" ? "bg-[#10213a] text-white" : "border border-[#d7d1c4] bg-white text-[#526173]"}`}>AFC</button><button onClick={() => setPickerConference("NFC")} className={`px-3 py-1.5 font-mono text-xs font-bold tracking-[.12em] ${pickerConference === "NFC" ? "bg-[#10213a] text-white" : "border border-[#d7d1c4] bg-white text-[#526173]"}`}>NFC</button></div>
          <div className="max-h-[52vh] space-y-4 overflow-y-auto pr-1">{divisionGroups.map(({ division, teams }) => <section key={division}><p className="mb-2 font-mono text-[10px] font-bold tracking-[.16em] text-[#64748b]">{pickerConference} {division.toUpperCase()}</p><div className="grid grid-cols-2 gap-2">{teams.map(team => <button key={team.code} onClick={() => { setFavorite(team); setTeamDialogOpen(false); toast(`${team.name} を推しチームに設定しました`, { description: "次回アクセス時にもこの設定を使用します。" }); }} className={`flex items-center gap-2 border p-2.5 text-left transition hover:border-[#e85d2a] ${favorite.code === team.code ? "border-[#e85d2a] bg-[#fffaf0]" : "border-[#d7d1c4] bg-white"}`}><TeamMark team={team.name} short={team.code} tone={team.tone} /><span className="min-w-0 flex-1"><span className="block font-display text-base font-bold tracking-wide">{team.code}</span><span className="block truncate text-[10px] text-[#64748b]">{team.name}</span></span>{favorite.code === team.code && <ShieldCheck className="h-3.5 w-3.5 text-[#e85d2a]" />}</button>)}</div></section>)}</div>
        </DialogContent>
      </Dialog>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-3 sm:px-6 sm:pt-5">
        <div className="mb-3 flex items-center justify-between gap-4"><p className="font-mono text-[10px] font-bold tracking-[.16em] text-[#64748b]">SAT / AUG 15 / 2026 <span className="mx-1 text-[#e85d2a]">•</span> TOKYO</p><p className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#526173]"><span className="h-1.5 w-1.5 rounded-full bg-[#69a84c]" /> DEMO INTERFACE</p></div>
        <div className="grid items-start gap-3 lg:grid-cols-[1.22fr_.78fr]">
          <div className="space-y-3"><UpcomingGame spoilerMode={spoilerMode} favorite={favorite} /><QuickRoute spoilerMode={spoilerMode} favorite={favorite} /><OfficialTeamFeed favorite={favorite} /><Briefing favorite={favorite} /></div>
          <div className="space-y-3"><SpoilerSwitch spoilerMode={spoilerMode} onToggle={toggleSpoiler} /><RosterRadar favorite={favorite} /></div>
        </div>
        <section className="mt-4 border-t border-[#d8d1c3] pt-3"><div className="flex flex-col justify-between gap-3 text-[11px] text-[#687587] sm:flex-row sm:items-center"><p>DEMO DATA · 実データ接続前のサンプル表示です。</p><button onClick={() => toast("選手データベースへの接続を準備中です")} className="inline-flex shrink-0 items-center gap-1.5 font-bold text-[#10213a] underline decoration-[#e85d2a] decoration-2 underline-offset-4"><UserRoundCheck className="h-3.5 w-3.5" /> PLAYER DATABASE</button></div></section>
      </main>
      <div className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#d7d1c4] bg-[#fffdf8]/95 px-3 py-2 shadow-[0_12px_30px_rgba(16,33,58,.15)] backdrop-blur sm:hidden"><Flag className="h-4 w-4 text-[#e85d2a]" /><span className="font-mono text-[10px] font-bold tracking-wide">JST / GAME DAY NOTES</span></div>
    </div>
  );
}
