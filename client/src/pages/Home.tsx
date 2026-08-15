/**
 * Gameday Field Notes: mobile-first NFL viewing notebook.
 * Style reminder — editorial data journalism, ink navy / bone / endzone orange,
 * asymmetric field-note hierarchy; every element should help users decide what to watch next.
 */
import { useState } from "react";
import {
  ArrowUpRight,
  Bell,
  CalendarPlus,
  ChevronRight,
  CircleAlert,
  Clock3,
  Eye,
  EyeOff,
  Flag,
  Headphones,
  Heart,
  Menu,
  MoreHorizontal,
  Play,
  Plus,
  Radio,
  ShieldCheck,
  Sparkles,
  Tv,
  UserRoundCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

const heroImage = "/manus-storage/nfl-fan-hub-field-notes-hero_49725db5.jpg";
const deskImage = "/manus-storage/nfl-fan-hub-watch-desk_f1552ed0.jpg";
const statusImage = "/manus-storage/nfl-fan-hub-status-board_53beb1fe.jpg";
const brandLogo = "/manus-storage/nfl-fan-hub-logo_44c04145.png";

type GameCardProps = {
  spoilerMode: boolean;
  onCalendar: () => void;
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

function TeamMark({ team, short, tone }: { team: string; short: string; tone: "sea" | "gb" }) {
  const styles =
    tone === "sea"
      ? "bg-[#002244] text-[#a5d4d7] ring-[#69be28]/25"
      : "bg-[#203731] text-[#ffb612] ring-[#ffb612]/30";
  return (
    <div className={`relative grid h-12 w-12 place-items-center rounded-[14px] font-display text-lg font-black tracking-tight ring-4 ${styles}`} aria-label={team}>
      {short}
    </div>
  );
}

function UpcomingGame({ spoilerMode, onCalendar }: GameCardProps) {
  return (
    <section className="ticket-cut ticket-paper relative overflow-hidden rounded-[18px] bg-[#0a1931] text-[#fffaf0] shadow-[0_24px_50px_rgba(10,25,49,0.2)]">
      <img src={heroImage} alt="夜明けのアメリカンフットボールフィールド" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(10,25,49,.96)_0%,rgba(10,25,49,.85)_56%,rgba(10,25,49,.48)_100%)]" />
      <div className="absolute inset-y-0 left-7 z-10 hidden border-l border-dashed border-white/25 lg:block" />
      <div className="relative p-5 sm:p-7 lg:pl-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#ffc1a7]">GAME TICKET / PRESEASON W1 <span className="ml-1 bg-[#e85d2a] px-1.5 py-0.5 text-[9px] text-white">DEMO</span></p>
            <h1 className="mt-2 font-display text-4xl font-extrabold leading-[0.82] tracking-[-0.045em] sm:text-[3.4rem]">次の観戦を、<br />迷わせない。</h1>
          </div>
          <button onClick={() => toast("フォロー設定を開く準備ができました")} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20 active:scale-[.97]" aria-label="フォロー設定">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex items-center gap-3">
            <TeamMark team="Seattle Seahawks" short="SEA" tone="sea" />
            <span className="font-display text-xl font-bold">SEA</span>
          </div>
          <div className="border-x border-dashed border-white/25 px-3 text-center">
            <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-[#a5b3c9]">JST / SUN</p>
            <p className="mt-0.5 font-display text-3xl font-extrabold tracking-[.08em]">02:00</p>
            <p className="mt-0.5 font-mono text-[9px] tracking-wide text-[#ffc1a7]">07:13:48 TO GO</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-xl font-bold">GB</span>
            <TeamMark team="Green Bay Packers" short="GB" tone="gb" />
          </div>
        </div>

        <div className="ticket-rule mt-7 grid grid-cols-2 gap-2 pt-4">
          <button onClick={onCalendar} className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#e85d2a] px-3 font-sans text-sm font-bold text-white transition hover:bg-[#cf4f20] active:scale-[.97]">
            <CalendarPlus className="h-4 w-4" /> 観戦予定に入れる
          </button>
          <button onClick={() => toast("視聴先の案内を準備しました", { description: "本番では正規の配信ページへ遷移します。" })} className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/25 bg-white/10 px-3 font-sans text-sm font-bold text-white transition hover:bg-white/20 active:scale-[.97]">
            <Tv className="h-4 w-4" /> 視聴先を見る
          </button>
        </div>
        {spoilerMode && <p className="mt-3 flex items-center gap-1.5 text-xs text-[#d5f4ca]"><ShieldCheck className="h-3.5 w-3.5" /> セーフモード中：試合結果と結果が分かる見出しは伏せています。</p>}
      </div>
    </section>
  );
}

function QuickRoute({ spoilerMode }: { spoilerMode: boolean }) {
  return (
    <section id="home" className="scroll-mt-24">
      <SectionLabel number="01" label="YOUR HUDDLE" />
      <div className="mt-3 grid gap-3 sm:grid-cols-[1.15fr_.85fr]">
        <article className="clip-note border border-[#ded8cc] bg-white p-4 shadow-[0_10px_30px_rgba(34,42,53,.05)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#e85d2a] text-white"><Bell className="h-4 w-4" /></div>
              <div><p className="font-display text-lg font-bold leading-none">フォロー中の変化</p><p className="mt-1 text-xs text-[#687587]">最終更新 11:18 JST</p></div>
            </div>
            <span className="rounded-full bg-[#fff0e9] px-2 py-1 font-mono text-[10px] font-bold text-[#c44719]">3 UPDATES</span>
          </div>
          <div className="mt-4 divide-y divide-[#eeeae1]">
            <div className="flex items-center justify-between gap-3 py-2.5"><p className="text-sm font-medium"><span className="mr-2 rounded bg-[#e7f5dd] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#3f6d27]">ACTIVE</span> DK Metcalf が練習に参加</p><ChevronRight className="h-4 w-4 text-[#94a3b8]" /></div>
            <div className="flex items-center justify-between gap-3 py-2.5"><p className="text-sm font-medium"><span className="mr-2 rounded bg-[#fff0e9] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#c44719]">WATCH</span> SEA の次戦まで 7時間</p><ChevronRight className="h-4 w-4 text-[#94a3b8]" /></div>
          </div>
        </article>
        <article className="margin-note relative overflow-hidden bg-[#e9e3d6] p-4">
          <div className="relative z-10 flex h-full flex-col justify-between"><div><p className="font-mono text-[10px] font-bold tracking-[.16em] text-[#657084]">LAST CHECKED</p><p className="mt-1 font-display text-2xl font-extrabold">{spoilerMode ? "結果は、まだ見ない。" : "前戦の流れを復習。"}</p></div><button onClick={() => toast(spoilerMode ? "セーフモード中は結果を表示しません" : "試合ノートを開く準備ができました")} className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-[#0a1931] underline decoration-[#e85d2a] decoration-2 underline-offset-4">{spoilerMode ? "結果を伏せたまま進む" : "試合ノートを開く"} <ArrowUpRight className="h-4 w-4" /></button></div>
          <div className="absolute -right-5 -bottom-7 font-display text-[120px] font-black leading-none text-[#d2c8b7]/65">H</div>
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
        <div className="min-w-0 flex-1"><p className="font-display text-lg font-bold leading-none">ネタバレ防止モード</p><p className="mt-1 text-xs text-[#687587]">{spoilerMode ? "結果・スコア・結果が分かる画像を隠しています" : "試合結果を通常どおり表示しています"}</p></div>
        <button onClick={onToggle} className={`relative h-7 w-12 rounded-full p-1 transition ${spoilerMode ? "bg-[#3d6b2c]" : "bg-[#cbd5e1]"}`} aria-pressed={spoilerMode} aria-label="ネタバレ防止モードを切り替える"><span className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${spoilerMode ? "translate-x-5" : "translate-x-0"}`} /></button>
      </div>
      {spoilerMode ? <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#cfe6c4] bg-white/80 px-3 py-2 text-xs text-[#426237]"><ShieldCheck className="h-4 w-4 shrink-0" /> 視聴が終わるまで、この設定を維持します。</div> : <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#e9e3d6] bg-white px-3 py-2 text-xs text-[#687587]"><CircleAlert className="h-4 w-4 shrink-0 text-[#e85d2a]" /> 見逃し視聴の前には、セーフモードをオンにしてください。</div>}
    </section>
  );
}

function Briefing() {
  const notes = [
    { label: "MATCHUP", title: "右サイドのパスラッシュ", copy: "GBの外側ラッシュを、SEAのRTがどこまで遅らせられるか。最初の3rd downに注目。", tag: "EDGE VS TACKLE" },
    { label: "STATUS", title: "RB の出場可否が鍵", copy: "練習参加状況は改善。ゲームデイの公式発表までは、役割限定の可能性も見ておく。", tag: "UPDATE 11:18" },
    { label: "WATCH", title: "最初の15プレー", copy: "序盤の早いダウンでランが出れば、プレーアクションの選択肢が広がる。", tag: "FIRST SCRIPT" },
  ];
  return (
    <section id="briefing" className="scroll-mt-24">
      <SectionLabel number="02" label="60-SECOND BRIEFING" />
      <div className="briefing-sheet bg-[#fff] p-4 shadow-[0_10px_30px_rgba(34,42,53,.05)] ring-1 ring-[#ded8cc]">
        <div className="flex items-end justify-between gap-4"><div><h2 className="font-display text-3xl font-extrabold tracking-[-.025em]">観戦前、60秒で。</h2><p className="mt-1 text-sm text-[#687587]">数字を開く前に、3つだけ押さえる。</p></div><div className="grid h-10 w-10 place-items-center rounded-full bg-[#e85d2a] text-white"><Sparkles className="h-4 w-4" /></div></div>
        <div className="mt-5 grid gap-3">
          {notes.map((note, index) => <article key={note.label} className="briefing-row group border border-[#e9e3d6] bg-[#fffdf8] p-3.5 transition hover:-translate-y-0.5 hover:border-[#e85d2a]/40 hover:shadow-sm">
            <div className="flex gap-3"><span className="font-display text-3xl font-black leading-none text-[#e85d2a]">0{index + 1}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="font-mono text-[10px] font-bold tracking-[.15em] text-[#64748b]">{note.label}</p><span className="rounded bg-[#e9e3d6] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#526173]">{note.tag}</span></div><h3 className="mt-1 font-display text-xl font-bold leading-none">{note.title}</h3><p className="mt-2 text-[13px] leading-5 text-[#526173]">{note.copy}</p></div></div>
          </article>)}
        </div>
      </div>
    </section>
  );
}

function RosterRadar() {
  const rows = [
    { position: "WR", player: "DK Metcalf", detail: "練習参加 / 膝", status: "ACTIVE", statusClass: "bg-[#e7f5dd] text-[#3f6d27]" },
    { position: "RB", player: "Kenneth Walker III", detail: "限定参加 / 足首", status: "WATCH", statusClass: "bg-[#fff0e9] text-[#c44719]" },
    { position: "CB", player: "Devon Witherspoon", detail: "IRから復帰候補", status: "TRACK", statusClass: "bg-[#e7ebf7] text-[#364d7c]" },
  ];
  return (
    <section id="status" className="scroll-mt-24">
      <SectionLabel number="03" label="STATUS RADAR" />
      <div className="roster-slip mt-3 overflow-hidden border border-[#ded8cc] bg-white shadow-[0_10px_30px_rgba(34,42,53,.05)]">
        <div className="relative min-h-[152px] overflow-hidden bg-[#0a1931] p-5 text-white"><img src={statusImage} alt="戦術ボードの抽象イラスト" className="absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-screen" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,25,49,.98),rgba(10,25,49,.42))]" /><div className="relative z-10"><p className="font-mono text-[10px] font-bold tracking-[.15em] text-[#ffc1a7]">ROSTER / INJURY / TRANSACTION <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[9px] text-white">DEMO</span></p><h2 className="mt-2 font-display text-3xl font-extrabold leading-[.9]">出場の前提が、<br />ひと目で変わる。</h2><p className="mt-3 text-xs text-[#d9e3f3]">公式発表・チーム発表の更新時刻を基準に表示します。</p></div></div>
        <div className="p-4"><div className="mb-3 flex items-center justify-between"><p className="font-display text-xl font-bold">SEA / 最新ステータス</p><button onClick={() => toast("すべてのロスター更新を表示する準備ができました")} className="text-xs font-bold text-[#0a1931] underline decoration-[#e85d2a] decoration-2 underline-offset-4">すべて見る</button></div><div className="divide-y divide-[#eeeae1]">{rows.map(row => <div key={row.player} className="flex items-center gap-3 py-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e9e3d6] font-mono text-[10px] font-bold text-[#0a1931]">{row.position}</span><div className="min-w-0 flex-1"><p className="text-sm font-bold text-[#10213a]">{row.player}</p><p className="mt-0.5 text-xs text-[#687587]">{row.detail}</p></div><span className={`rounded-full px-2 py-1 font-mono text-[9px] font-bold ${row.statusClass}`}>{row.status}</span></div>)}</div><p className="mt-3 flex items-center gap-1.5 border-t border-[#eeeae1] pt-3 font-mono text-[10px] text-[#64748b]"><Clock3 className="h-3.5 w-3.5" /> 最終更新 11:18 JST ・ 表示内容はデモです</p></div>
      </div>
    </section>
  );
}

function WatchDesk() {
  return <aside className="watch-slip relative overflow-hidden bg-[#243b33] p-5 text-white"><img src={deskImage} alt="フットボールと観戦ノートのデスク" className="absolute inset-0 h-full w-full object-cover opacity-45" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,44,37,.93),rgba(20,44,37,.44))]" /><div className="relative z-10"><p className="font-mono text-[10px] font-bold tracking-[.17em] text-[#d5f4ca]">WATCH PLAN</p><h3 className="mt-2 max-w-[16rem] font-display text-3xl font-extrabold leading-[.9]">朝の一戦は、<br />通知で逃さない。</h3><div className="mt-5 space-y-2"><p className="flex items-center gap-2 text-sm"><Radio className="h-4 w-4 text-[#d5f4ca]" /> キックオフ 15分前に通知</p><p className="flex items-center gap-2 text-sm"><Headphones className="h-4 w-4 text-[#d5f4ca]" /> 音声・速報は試合後に解禁</p></div><button onClick={() => toast("通知をオンにしました", { description: "デモでは通知は送信されません。" })} className="mt-5 inline-flex items-center gap-2 bg-white px-3 py-2.5 text-sm font-bold text-[#19362d] transition hover:bg-[#f5f2ea] active:scale-[.97]"><Bell className="h-4 w-4" /> 通知を設定する</button></div></aside>;
}

export default function Home() {
  const [spoilerMode, setSpoilerMode] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
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
          <nav className="hidden items-center gap-1 md:flex" aria-label="主要ナビゲーション"><a href="#home" className="nav-link">HOME</a><a href="#briefing" className="nav-link">BRIEFING</a><a href="#status" className="nav-link">RADAR</a><a href="#safe" className="nav-link">SAFE MODE</a></nav>
          <div className="flex items-center gap-2"><button onClick={() => toast("フォロー中のチームと選手を管理できます")} className="hidden items-center gap-2 border border-[#d7d1c4] bg-white px-3 py-2 text-xs font-bold transition hover:border-[#10213a] sm:inline-flex"><Heart className="h-3.5 w-3.5 fill-[#10213a] text-[#10213a]" /> 4 FOLLOWS</button><button onClick={() => setNavOpen(v => !v)} className="grid h-9 w-9 place-items-center rounded-full border border-[#d7d1c4] bg-white md:hidden" aria-label="メニューを開く">{navOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button></div>
        </div>
        {navOpen && <nav className="border-t border-[#ded8cc] bg-[#fffdf8] p-3 md:hidden"><div className="grid grid-cols-2 gap-2">{[["HOME", "#home"], ["BRIEFING", "#briefing"], ["RADAR", "#status"], ["SAFE MODE", "#safe"]].map(([label, href]) => <a onClick={() => setNavOpen(false)} className="rounded-lg bg-[#f5f2ea] px-3 py-2.5 font-mono text-xs font-bold tracking-wider" href={href} key={label}>{label}</a>)}</div></nav>}
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-28 pt-5 sm:px-6 sm:pt-8">
        <div className="mb-5 flex items-center justify-between gap-4"><p className="font-mono text-[10px] font-bold tracking-[.16em] text-[#64748b]">SAT / AUG 15 / 2026 <span className="mx-1 text-[#e85d2a]">•</span> TOKYO</p><p className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#526173]"><span className="h-1.5 w-1.5 rounded-full bg-[#69a84c]" /> DEMO INTERFACE</p></div>
        <div className="grid items-start gap-5 lg:grid-cols-[1.22fr_.78fr]">
          <div className="space-y-5"><UpcomingGame spoilerMode={spoilerMode} onCalendar={() => toast("観戦予定に追加しました", { description: "SEA @ GB / Sun 02:00 JST（デモ）" })} /><QuickRoute spoilerMode={spoilerMode} /><Briefing /></div>
          <div className="space-y-5"><SpoilerSwitch spoilerMode={spoilerMode} onToggle={toggleSpoiler} /><WatchDesk /><RosterRadar /></div>
        </div>
        <section className="mt-7 border-t border-[#d8d1c3] pt-4"><div className="flex flex-col justify-between gap-3 text-xs text-[#687587] sm:flex-row sm:items-center"><p>このページはプロダクト体験用のデモです。試合日程、ステータス、ニュースは実データ接続前のサンプル表示です。</p><button onClick={() => toast("選手データベースへの接続を準備中です")} className="inline-flex shrink-0 items-center gap-1.5 font-bold text-[#10213a] underline decoration-[#e85d2a] decoration-2 underline-offset-4"><UserRoundCheck className="h-3.5 w-3.5" /> 選手データベースへ</button></div></section>
      </main>
      <div className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#d7d1c4] bg-[#fffdf8]/95 px-3 py-2 shadow-[0_12px_30px_rgba(16,33,58,.15)] backdrop-blur sm:hidden"><Flag className="h-4 w-4 text-[#e85d2a]" /><span className="font-mono text-[10px] font-bold tracking-wide">JST / GAME DAY NOTES</span></div>
    </div>
  );
}
