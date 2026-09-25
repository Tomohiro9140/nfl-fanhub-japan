import React, { useMemo, useRef, useState, useEffect } from "react";
import { X, Trophy, Share2, Sparkles, RotateCcw } from "lucide-react";
import { NFL_TEAMS } from "@/lib/tiebreaker/nflTeams";

// NFL公式チームカラー定義
const NFL_TEAM_COLORS: Record<string, { primary: string; secondary: string; text: string }> = {
  ARI: { primary: "#97233F", secondary: "#000000", text: "#FFFFFF" },
  ATL: { primary: "#A71930", secondary: "#000000", text: "#FFFFFF" },
  BAL: { primary: "#241773", secondary: "#9E7C0C", text: "#FFFFFF" },
  BUF: { primary: "#00338D", secondary: "#C60C30", text: "#FFFFFF" },
  CAR: { primary: "#0085CA", secondary: "#101820", text: "#FFFFFF" },
  CHI: { primary: "#0B162A", secondary: "#C83803", text: "#FFFFFF" },
  CIN: { primary: "#FB4F14", secondary: "#000000", text: "#FFFFFF" },
  CLE: { primary: "#311D00", secondary: "#FF3C00", text: "#FFFFFF" },
  DAL: { primary: "#003594", secondary: "#041E42", text: "#FFFFFF" },
  DEN: { primary: "#FB4F14", secondary: "#002244", text: "#FFFFFF" },
  DET: { primary: "#0076B6", secondary: "#B0B7BC", text: "#FFFFFF" },
  GB:  { primary: "#203731", secondary: "#FFB612", text: "#FFFFFF" },
  HOU: { primary: "#03202F", secondary: "#A71930", text: "#FFFFFF" },
  IND: { primary: "#002C5F", secondary: "#A2AAAD", text: "#FFFFFF" },
  JAX: { primary: "#006778", secondary: "#D7A22A", text: "#FFFFFF" },
  KC:  { primary: "#E31837", secondary: "#FFB81C", text: "#FFFFFF" },
  LV:  { primary: "#000000", secondary: "#A5ACAF", text: "#FFFFFF" },
  LAC: { primary: "#0080C6", secondary: "#FFC20E", text: "#FFFFFF" },
  LAR: { primary: "#003594", secondary: "#FFA300", text: "#FFFFFF" },
  MIA: { primary: "#008E97", secondary: "#FC4C02", text: "#FFFFFF" },
  MIN: { primary: "#4F2683", secondary: "#FFC62F", text: "#FFFFFF" },
  NE:  { primary: "#002244", secondary: "#C60C30", text: "#FFFFFF" },
  NO:  { primary: "#D3BC8D", secondary: "#101820", text: "#101820" },
  NYG: { primary: "#0B2265", secondary: "#A71930", text: "#FFFFFF" },
  NYJ: { primary: "#125740", secondary: "#000000", text: "#FFFFFF" },
  PHI: { primary: "#004C54", secondary: "#A5ACAF", text: "#FFFFFF" },
  PIT: { primary: "#101820", secondary: "#FFB612", text: "#FFFFFF" },
  SF:  { primary: "#AA0000", secondary: "#B3995D", text: "#FFFFFF" },
  SEA: { primary: "#002244", secondary: "#69BE28", text: "#FFFFFF" },
  TB:  { primary: "#D32F2F", secondary: "#0A0A0A", text: "#FFFFFF" },
  TEN: { primary: "#0C2340", secondary: "#4B92DB", text: "#FFFFFF" },
  WAS: { primary: "#5A1414", secondary: "#FFB612", text: "#FFFFFF" },
};

type SeedTeam = {
  team: string;
  seed?: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  afcSeeds: SeedTeam[];
  nfcSeeds: SeedTeam[];
};

function getTeamInfo(code: string) {
  const meta = NFL_TEAMS[code];
  const color = NFL_TEAM_COLORS[code] ?? { primary: "#1e293b", secondary: "#475569", text: "#ffffff" };
  return {
    code,
    name: meta?.name ?? code,
    primaryColor: color.primary,
    secondaryColor: color.secondary,
    textColor: color.text,
  };
}

export function PlayoffPredictionModal({ isOpen, onClose, afcSeeds, nfcSeeds }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // トーナメント勝者
  const [afcWcWinners, setAfcWcWinners] = useState<{ [matchIndex: number]: string }>({});
  const [nfcWcWinners, setNfcWcWinners] = useState<{ [matchIndex: number]: string }>({});
  const [afcDivWinners, setAfcDivWinners] = useState<{ [matchIndex: number]: string }>({});
  const [nfcDivWinners, setNfcDivWinners] = useState<{ [matchIndex: number]: string }>({});
  const [afcChamp, setAfcChamp] = useState<string | null>(null);
  const [nfcChamp, setNfcChamp] = useState<string | null>(null);
  const [superBowlChamp, setSuperBowlChamp] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const afcSeedMap = useMemo(() => new Map(afcSeeds.map((s, i) => [s.team, i + 1])), [afcSeeds]);
  const nfcSeedMap = useMemo(() => new Map(nfcSeeds.map((s, i) => [s.team, i + 1])), [nfcSeeds]);

  // リシーディング計算（#1シードはWC勝ち残りの中で最もシードが低いチームと対戦）
  const getDivisionalMatchups = (
    seed1: string | undefined,
    wcWinners: string[],
    seedMap: Map<string, number>
  ) => {
    if (!seed1 || wcWinners.length < 3) return null;
    const sorted = [...wcWinners].sort((a, b) => (seedMap.get(a) ?? 99) - (seedMap.get(b) ?? 99));
    const lowest = sorted[2];
    const mid1 = sorted[0];
    const mid2 = sorted[1];
    return [
      { home: seed1, away: lowest },
      { home: mid1, away: mid2 },
    ];
  };

  const afcDivMatchups = useMemo(() => {
    const winners = [afcWcWinners[0], afcWcWinners[1], afcWcWinners[2]].filter(Boolean);
    return getDivisionalMatchups(afcSeeds[0]?.team, winners, afcSeedMap);
  }, [afcSeeds, afcWcWinners, afcSeedMap]);

  const nfcDivMatchups = useMemo(() => {
    const winners = [nfcWcWinners[0], nfcWcWinners[1], nfcWcWinners[2]].filter(Boolean);
    return getDivisionalMatchups(nfcSeeds[0]?.team, winners, nfcSeedMap);
  }, [nfcSeeds, nfcWcWinners, nfcSeedMap]);

  // 上位シード全勝一括
  const autoFillHigherSeeds = () => {
    if (afcSeeds.length < 4 || nfcSeeds.length < 4) return;
    setAfcWcWinners({ 0: afcSeeds[1]?.team, 1: afcSeeds[2]?.team, 2: afcSeeds[3]?.team });
    setNfcWcWinners({ 0: nfcSeeds[1]?.team, 1: nfcSeeds[2]?.team, 2: nfcSeeds[3]?.team });
    setAfcDivWinners({ 0: afcSeeds[0]?.team, 1: afcSeeds[1]?.team });
    setNfcDivWinners({ 0: nfcSeeds[0]?.team, 1: nfcSeeds[1]?.team });
    setAfcChamp(afcSeeds[0]?.team);
    setNfcChamp(nfcSeeds[0]?.team);
    setSuperBowlChamp(afcSeeds[0]?.team);
  };

  const resetAll = () => {
    setAfcWcWinners({});
    setNfcWcWinners({});
    setAfcDivWinners({});
    setNfcDivWinners({});
    setAfcChamp(null);
    setNfcChamp(null);
    setSuperBowlChamp(null);
    setPreviewUrl(null);
  };

  // 添付画像(Image 36)を忠実に再現したCanvas描画
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1200;
    const height = 675;
    canvas.width = width;
    canvas.height = height;

    // 1. 深みのあるダークスタジアム背景 ＆ 百合紋章の透かし
    ctx.fillStyle = "#0c111c";
    ctx.fillRect(0, 0, width, height);

    // フルール・ド・リス（透かし模様）
    ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
    for (let x = 60; x < width; x += 120) {
      for (let y = 60; y < height; y += 120) {
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.arc(x - 12, y + 10, 10, 0, Math.PI * 2);
        ctx.arc(x + 12, y + 10, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. カンファレンス巨大透かし文字 (NFC / AFC)
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.font = "900 110px 'Impact', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("NFC", 330, 360);
    ctx.fillText("AFC", 870, 360);

    // 3. 上部中央：ロンバルディ・トロフィー ＆ SUPER BOWL LXI
    const trophyX = width / 2;
    // トロフィーシルエット
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.beginPath();
    ctx.ellipse(trophyX, 60, 18, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(trophyX - 4, 85, 8, 35);
    ctx.fillRect(trophyX - 22, 115, 44, 8);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 36px 'Arial Black', sans-serif";
    ctx.fillText("LXI", trophyX, 100);

    ctx.fillStyle = "#eab308";
    ctx.font = "900 13px monospace";
    ctx.letterSpacing = "2px";
    ctx.fillText("SUPER BOWL", trophyX, 140);

    // 4. 公式スタイルカード描画（上下2チーム結合バナー ＋ 白地シード四角バッジ）
    const cardW = 165;
    const rowH = 26;

    const drawCardMatchup = (
      x: number,
      y: number,
      teamTop?: string,
      seedTop?: number,
      teamBot?: string,
      seedBot?: number,
      winner?: string
    ) => {
      // 枠線
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cardW, rowH * 2);

      const renderTeam = (rowY: number, code?: string, seed?: number, isWon?: boolean) => {
        if (!code) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
          ctx.fillRect(x, rowY, cardW, rowH);
          ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
          ctx.font = "bold 11px monospace";
          ctx.textAlign = "center";
          ctx.fillText("TBD", x + cardW / 2, rowY + 17);
          return;
        }

        const info = getTeamInfo(code);
        // チームカラー背景
        ctx.fillStyle = isWon ? info.primaryColor : "#151c2c";
        ctx.fillRect(x, rowY, cardW, rowH);

        // チームコード
        ctx.fillStyle = "#ffffff";
        ctx.font = isWon ? "bold 13px sans-serif" : "12px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(code, x + 10, rowY + 18);

        // シード四角バッジ（右端の白四角の中に黒文字）
        if (seed) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x + cardW - 26, rowY + 2, 24, rowH - 4);
          ctx.fillStyle = "#000000";
          ctx.font = "900 13px 'Arial Black', monospace";
          ctx.textAlign = "center";
          ctx.fillText(String(seed), x + cardW - 14, rowY + 18);
        }

        // 勝者ハイライト
        if (isWon) {
          ctx.strokeStyle = "#eab308";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, rowY, cardW, rowH);
        }
      };

      renderTeam(y, teamTop, seedTop, winner === teamTop);
      renderTeam(y + rowH, teamBot, seedBot, winner === teamBot);
    };

    // 接続線
    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      const mid = (x1 + x2) / 2;
      ctx.lineTo(mid, y1);
      ctx.lineTo(mid, y2);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    // 座標定義（左右対称）
    // NFC (左側)
    const nfcWcX = 45;
    const nfcDivX = 230;
    const nfcCcgX = 390;

    // AFC (右側)
    const afcCcgX = 645;
    const afcDivX = 805;
    const afcWcX = 990;

    // WC 3試合の Y 座標
    const wcY = [110, 260, 410];

    // ============= NFC 描画 (左) =============
    const nfcWcList = [
      { hSeed: 2, aSeed: 7, win: nfcWcWinners[0] },
      { hSeed: 3, aSeed: 6, win: nfcWcWinners[1] },
      { hSeed: 4, aSeed: 5, win: nfcWcWinners[2] },
    ];
    nfcWcList.forEach((m, i) => {
      const topT = nfcSeeds[m.hSeed - 1]?.team;
      const botT = nfcSeeds[m.aSeed - 1]?.team;
      drawCardMatchup(nfcWcX, wcY[i], topT, m.hSeed, botT, m.aSeed, m.win);

      const targetDivY = i === 0 ? 180 : 340;
      drawLine(nfcWcX + cardW, wcY[i] + rowH, nfcDivX, targetDivY + (i === 1 ? 0 : rowH));
    });

    // NFC Divisional
    const nfcD1Away = nfcDivMatchups ? nfcDivMatchups[0]?.away : undefined;
    const nfcD2Home = nfcDivMatchups ? nfcDivMatchups[1]?.home : undefined;
    const nfcD2Away = nfcDivMatchups ? nfcDivMatchups[1]?.away : undefined;

    drawCardMatchup(nfcDivX, 180, nfcSeeds[0]?.team, 1, nfcD1Away, nfcD1Away ? nfcSeedMap.get(nfcD1Away) : undefined, nfcDivWinners[0]);
    drawCardMatchup(nfcDivX, 340, nfcD2Home, nfcD2Home ? nfcSeedMap.get(nfcD2Home) : undefined, nfcD2Away, nfcD2Away ? nfcSeedMap.get(nfcD2Away) : undefined, nfcDivWinners[1]);

    drawLine(nfcDivX + cardW, 180 + rowH, nfcCcgX, 260);
    drawLine(nfcDivX + cardW, 340 + rowH, nfcCcgX, 260 + rowH);

    // NFC Championship
    drawCardMatchup(nfcCcgX, 260, nfcDivWinners[0], nfcDivWinners[0] ? nfcSeedMap.get(nfcDivWinners[0]) : undefined, nfcDivWinners[1], nfcDivWinners[1] ? nfcSeedMap.get(nfcDivWinners[1]) : undefined, nfcChamp ?? undefined);

    // ============= AFC 描画 (右) =============
    const afcWcList = [
      { hSeed: 2, aSeed: 7, win: afcWcWinners[0] },
      { hSeed: 3, aSeed: 6, win: afcWcWinners[1] },
      { hSeed: 4, aSeed: 5, win: afcWcWinners[2] },
    ];
    afcWcList.forEach((m, i) => {
      const topT = afcSeeds[m.hSeed - 1]?.team;
      const botT = afcSeeds[m.aSeed - 1]?.team;
      drawCardMatchup(afcWcX, wcY[i], topT, m.hSeed, botT, m.aSeed, m.win);

      const targetDivY = i === 0 ? 180 : 340;
      drawLine(afcWcX, wcY[i] + rowH, afcDivX + cardW, targetDivY + (i === 1 ? 0 : rowH));
    });

    // AFC Divisional
    const afcD1Away = afcDivMatchups ? afcDivMatchups[0]?.away : undefined;
    const afcD2Home = afcDivMatchups ? afcDivMatchups[1]?.home : undefined;
    const afcD2Away = afcDivMatchups ? afcDivMatchups[1]?.away : undefined;

    drawCardMatchup(afcDivX, 180, afcSeeds[0]?.team, 1, afcD1Away, afcD1Away ? afcSeedMap.get(afcD1Away) : undefined, afcDivWinners[0]);
    drawCardMatchup(afcDivX, 340, afcD2Home, afcD2Home ? afcSeedMap.get(afcD2Home) : undefined, afcD2Away, afcD2Away ? afcSeedMap.get(afcD2Away) : undefined, afcDivWinners[1]);

    drawLine(afcDivX, 180 + rowH, afcCcgX + cardW, 260);
    drawLine(afcDivX, 340 + rowH, afcCcgX + cardW, 260 + rowH);

    // AFC Championship
    drawCardMatchup(afcCcgX, 260, afcDivWinners[0], afcDivWinners[0] ? afcSeedMap.get(afcDivWinners[0]) : undefined, afcDivWinners[1], afcDivWinners[1] ? afcSeedMap.get(afcDivWinners[1]) : undefined, afcChamp ?? undefined);

    // ============= 中央：SUPER BOWL LXI =============
    const sbX = (width - cardW) / 2;
    const sbY = 480;

    drawLine(nfcCcgX + cardW / 2, 260 + rowH * 2, sbX, sbY + rowH / 2);
    drawLine(afcCcgX + cardW / 2, 260 + rowH * 2, sbX + cardW, sbY + rowH * 1.5);

    drawCardMatchup(sbX, sbY, nfcChamp ?? undefined, nfcChamp ? nfcSeedMap.get(nfcChamp) : undefined, afcChamp ?? undefined, afcChamp ? afcSeedMap.get(afcChamp) : undefined, superBowlChamp ?? undefined);

    // サイトロゴ（右下に極小・目立たないウォーターマーク）
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.font = "bold 11px monospace";
    ctx.fillText("NFL FAN HUB JAPAN · nfl-fanhub.onrender.com", width - 35, height - 20);

    setPreviewUrl(canvas.toDataURL("image/png"));
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => renderCanvas(), 80);
    }
  }, [isOpen, afcSeeds, nfcSeeds, afcWcWinners, nfcWcWinners, afcDivWinners, nfcDivWinners, afcChamp, nfcChamp, superBowlChamp]);

  const handleShareOrSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsGenerating(false);
          return;
        }

        const fileName = `NFL_Playoff_Prediction_2026.png`;
        const file = new File([blob], fileName, { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: "NFL プレイオフ勝敗予想",
              text: `私の2026-27 NFLプレイオフ予想！スーパーボウル覇者は【${superBowlChamp ? getTeamInfo(superBowlChamp).name : "未定"}】！ #NFL #NFLJapan`,
              files: [file],
            });
            setIsGenerating(false);
            return;
          } catch {
            // キャンセル
          }
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        setIsGenerating(false);
      }, "image/png");
    } catch {
      setIsGenerating(false);
    }
  };

  const openTwitterIntent = () => {
    const text = encodeURIComponent(
      `私の2026-27 NFLプレイオフ勝敗予想！\nスーパーボウル覇者は【${superBowlChamp ? getTeamInfo(superBowlChamp).name : "未定"}】🏆\n\n#NFL #NFLJapan #NFLFanHub\nhttps://nfl-fanhub.onrender.com/simulator`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl border border-slate-700/80 bg-[#0b101b] text-white shadow-2xl p-3 sm:p-5 my-auto">
        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm sm:text-base font-black">プレイオフ勝敗予想 ＆ ブラケット画像シェア</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* コントロールバー */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 text-[11px]">チームをタップして勝ち上がらせてください</span>
          <div className="flex gap-2">
            <button
              onClick={autoFillHigherSeeds}
              className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
            >
              <Sparkles className="h-3 w-3" /> 上位シード全勝
            </button>
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-700"
            >
              <RotateCcw className="h-3 w-3" /> リセット
            </button>
          </div>
        </div>

        {/* タブなし！スマホでも左右同時に見られる2カラムグリッド */}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-4">
          {/* 左：NFC カラム */}
          <div className="rounded-xl border border-blue-950/60 bg-blue-950/15 p-2 sm:p-3 space-y-2.5">
            <div className="flex items-center justify-between font-mono text-[11px] font-black text-blue-400 border-b border-blue-900/40 pb-1">
              <span>NFC TOURNAMENT</span>
              <span className="text-[9px] text-slate-400">#1 {nfcSeeds[0]?.team} はBYE</span>
            </div>

            {/* WC */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-slate-400 block">WILD CARD</span>
              {[
                { hSeed: 2, aSeed: 7, idx: 0 },
                { hSeed: 3, aSeed: 6, idx: 1 },
                { hSeed: 4, aSeed: 5, idx: 2 },
              ].map(({ hSeed, aSeed, idx }) => {
                const hCode = nfcSeeds[hSeed - 1]?.team;
                const aCode = nfcSeeds[aSeed - 1]?.team;
                const won = nfcWcWinners[idx];
                return (
                  <div key={idx} className="flex gap-1">
                    {[
                      { code: hCode, seed: hSeed },
                      { code: aCode, seed: aSeed },
                    ].map((t) => (
                      <button
                        key={t.code}
                        onClick={() => setNfcWcWinners((prev) => ({ ...prev, [idx]: t.code }))}
                        className={`flex-1 rounded py-1 px-1 text-center text-[10px] font-bold border truncate transition ${
                          won === t.code
                            ? "bg-amber-500 text-slate-950 border-amber-400"
                            : "bg-slate-900/90 text-slate-200 border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        #{t.seed} {t.code}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* DIV */}
            {nfcDivMatchups && (
              <div className="space-y-1.5 pt-1.5 border-t border-blue-900/40">
                <span className="text-[9px] font-mono text-slate-400 block">DIVISIONAL</span>
                {nfcDivMatchups.map((m, idx) => (
                  <div key={idx} className="flex gap-1">
                    {[m.home, m.away].map((code) => (
                      <button
                        key={code}
                        onClick={() => setNfcDivWinners((prev) => ({ ...prev, [idx]: code }))}
                        className={`flex-1 rounded py-1 px-1 text-center text-[10px] font-bold border truncate transition ${
                          nfcDivWinners[idx] === code
                            ? "bg-amber-500 text-slate-950 border-amber-400"
                            : "bg-slate-900/90 text-slate-200 border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        #{nfcSeedMap.get(code)} {code}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* CCG */}
            {nfcDivWinners[0] && nfcDivWinners[1] && (
              <div className="space-y-1.5 pt-1.5 border-t border-blue-900/40">
                <span className="text-[9px] font-mono text-blue-300 block">NFC CHAMPIONSHIP</span>
                <div className="flex gap-1">
                  {[nfcDivWinners[0], nfcDivWinners[1]].map((code) => (
                    <button
                      key={code}
                      onClick={() => setNfcChamp(code)}
                      className={`flex-1 rounded py-1.5 px-1 text-center text-[11px] font-bold border truncate transition ${
                        nfcChamp === code
                          ? "bg-blue-600 text-white border-blue-400 shadow"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                      }`}
                    >
                      #{nfcSeedMap.get(code)} {code}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右：AFC カラム */}
          <div className="rounded-xl border border-red-950/60 bg-red-950/15 p-2 sm:p-3 space-y-2.5">
            <div className="flex items-center justify-between font-mono text-[11px] font-black text-red-400 border-b border-red-900/40 pb-1">
              <span>AFC TOURNAMENT</span>
              <span className="text-[9px] text-slate-400">#1 {afcSeeds[0]?.team} はBYE</span>
            </div>

            {/* WC */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-slate-400 block">WILD CARD</span>
              {[
                { hSeed: 2, aSeed: 7, idx: 0 },
                { hSeed: 3, aSeed: 6, idx: 1 },
                { hSeed: 4, aSeed: 5, idx: 2 },
              ].map(({ hSeed, aSeed, idx }) => {
                const hCode = afcSeeds[hSeed - 1]?.team;
                const aCode = afcSeeds[aSeed - 1]?.team;
                const won = afcWcWinners[idx];
                return (
                  <div key={idx} className="flex gap-1">
                    {[
                      { code: hCode, seed: hSeed },
                      { code: aCode, seed: aSeed },
                    ].map((t) => (
                      <button
                        key={t.code}
                        onClick={() => setAfcWcWinners((prev) => ({ ...prev, [idx]: t.code }))}
                        className={`flex-1 rounded py-1 px-1 text-center text-[10px] font-bold border truncate transition ${
                          won === t.code
                            ? "bg-amber-500 text-slate-950 border-amber-400"
                            : "bg-slate-900/90 text-slate-200 border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        #{t.seed} {t.code}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* DIV */}
            {afcDivMatchups && (
              <div className="space-y-1.5 pt-1.5 border-t border-red-900/40">
                <span className="text-[9px] font-mono text-slate-400 block">DIVISIONAL</span>
                {afcDivMatchups.map((m, idx) => (
                  <div key={idx} className="flex gap-1">
                    {[m.home, m.away].map((code) => (
                      <button
                        key={code}
                        onClick={() => setAfcDivWinners((prev) => ({ ...prev, [idx]: code }))}
                        className={`flex-1 rounded py-1 px-1 text-center text-[10px] font-bold border truncate transition ${
                          afcDivWinners[idx] === code
                            ? "bg-amber-500 text-slate-950 border-amber-400"
                            : "bg-slate-900/90 text-slate-200 border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        #{afcSeedMap.get(code)} {code}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* CCG */}
            {afcDivWinners[0] && afcDivWinners[1] && (
              <div className="space-y-1.5 pt-1.5 border-t border-red-900/40">
                <span className="text-[9px] font-mono text-red-300 block">AFC CHAMPIONSHIP</span>
                <div className="flex gap-1">
                  {[afcDivWinners[0], afcDivWinners[1]].map((code) => (
                    <button
                      key={code}
                      onClick={() => setAfcChamp(code)}
                      className={`flex-1 rounded py-1.5 px-1 text-center text-[11px] font-bold border truncate transition ${
                        afcChamp === code
                          ? "bg-red-600 text-white border-red-400 shadow"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                      }`}
                    >
                      #{afcSeedMap.get(code)} {code}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 最下部中央：SUPER BOWL LXI */}
        {afcChamp && nfcChamp && (
          <div className="mt-3 rounded-xl border border-amber-500/50 bg-amber-500/10 p-2 sm:p-3 text-center animate-in fade-in duration-200">
            <span className="font-mono text-[10px] text-amber-400 font-black tracking-widest block">SUPER BOWL LXI</span>
            <div className="mt-1.5 flex gap-2 justify-center max-w-sm mx-auto">
              {[
                { code: nfcChamp, conf: "NFC", seedMap: nfcSeedMap },
                { code: afcChamp, conf: "AFC", seedMap: afcSeedMap },
              ].map(({ code, conf, seedMap }) => (
                <button
                  key={code}
                  onClick={() => setSuperBowlChamp(code)}
                  className={`flex-1 rounded-xl p-2 text-center font-bold border transition ${
                    superBowlChamp === code
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 shadow-lg scale-105"
                      : "bg-slate-900 text-white border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  <div className="text-[9px] opacity-75 font-mono">{conf} CHAMP</div>
                  <div className="text-xs font-black">#{seedMap.get(code)} {code}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* プレビュー表示エリア */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-slate-400">生成プレビュー（1200×675 / X最適化サイズ）</span>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-inner flex items-center justify-center min-h-[140px]">
            {previewUrl ? (
              <img src={previewUrl} alt="Bracket Preview" className="w-full h-auto object-contain max-h-[260px]" />
            ) : (
              <span className="py-6 text-xs text-slate-500">予想を入力すると高解像度カードが生成されます</span>
            )}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="mt-3 flex flex-wrap items-center justify-end gap-2 pt-2.5 border-t border-slate-800">
          <button
            onClick={openTwitterIntent}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700"
          >
            X でポスト
          </button>
          <button
            onClick={handleShareOrSave}
            disabled={isGenerating || !superBowlChamp}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-1.5 text-xs font-black text-slate-950 shadow-md transition hover:from-amber-400 hover:to-orange-400 active:scale-95 disabled:opacity-50"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>スマホ保存 / Xでシェア（画像添付）</span>
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
