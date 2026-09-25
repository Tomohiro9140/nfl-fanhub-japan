import React, { useMemo, useRef, useState, useEffect } from "react";
import { X, Trophy, Share2, Sparkles, RotateCcw } from "lucide-react";
import { NFL_TEAMS } from "@/lib/tiebreaker/nflTeams";

// ESPN CDN 略称マップ
const ESPN_LOGO_CODES: Record<string, string> = {
  WAS: "wsh",
  WSH: "wsh",
  LAR: "lar",
  LAC: "lac",
  LV: "lv",
};

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
  const logoCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // 勝敗ステート
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

  // ロゴ画像の事前ロード（CORS対応）
  useEffect(() => {
    const allTeams = [...afcSeeds, ...nfcSeeds].map((s) => s.team);
    allTeams.forEach((code) => {
      if (!logoCache.current.has(code)) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        const espnCode = ESPN_LOGO_CODES[code.toUpperCase()] ?? code.toLowerCase();
        img.src = `https://a.espncdn.com/i/teamlogos/nfl/500/${espnCode}.png`;
        img.onload = () => {
          logoCache.current.set(code, img);
          renderCanvas();
        };
      }
    });
  }, [afcSeeds, nfcSeeds]);

  // リシーディング計算
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

  // Canvas描画（参考写真 Image 19 の高密度TVブロードキャスト完全再現）
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1200;
    const height = 675;
    canvas.width = width;
    canvas.height = height;

    // 1. 深みのあるダークテクスチャ背景
    ctx.fillStyle = "#0c101a";
    ctx.fillRect(0, 0, width, height);

    // 百合の紋章透かしパターン
    ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
    for (let x = 60; x < width; x += 100) {
      for (let y = 50; y < height; y += 100) {
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.arc(x - 10, y + 8, 8, 0, Math.PI * 2);
        ctx.arc(x + 10, y + 8, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. カンファレンス透かし文字 (NFC / AFC)
    ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
    ctx.font = "900 130px 'Impact', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("NFC", 320, 360);
    ctx.fillText("AFC", 880, 360);

    // 3. 上部中央：SUPER BOWL LXI & トロフィーエンブレム
    const midX = width / 2;
    // トロフィーシルエット（シルバーグラデーション）
    const trophyGrad = ctx.createLinearGradient(midX - 20, 30, midX + 20, 110);
    trophyGrad.addColorStop(0, "#ffffff");
    trophyGrad.addColorStop(0.5, "#94a3b8");
    trophyGrad.addColorStop(1, "#475569");
    ctx.fillStyle = trophyGrad;
    ctx.beginPath();
    ctx.ellipse(midX, 50, 16, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(midX - 3.5, 70, 7, 28);
    ctx.fillRect(midX - 18, 98, 36, 6);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 34px 'Arial Black', sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("LXI", midX, 90);

    ctx.fillStyle = "#eab308";
    ctx.font = "900 12px monospace";
    ctx.letterSpacing = "3px";
    ctx.fillText("SUPER BOWL", midX, 126);

    // 4. 公式スタイルカード描画（チームロゴ ＋ チームカラー ＋ 白四角シードバッジ）
    const cardW = 168;
    const rowH = 32;

    const drawCard = (
      x: number,
      y: number,
      teamTop?: string,
      seedTop?: number,
      teamBot?: string,
      seedBot?: number,
      winner?: string
    ) => {
      ctx.save();
      // 外枠シャドウ
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cardW, rowH * 2);

      const renderTeamRow = (rowY: number, code?: string, seed?: number, isWinner?: boolean) => {
        if (!code) {
          ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
          ctx.fillRect(x, rowY, cardW, rowH);
          ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
          ctx.font = "bold 11px monospace";
          ctx.textAlign = "center";
          ctx.fillText("TBD", x + cardW / 2, rowY + 20);
          return;
        }

        const info = getTeamInfo(code);
        // 背景色（チーム公式カラー）
        ctx.fillStyle = isWinner ? info.primaryColor : "#141c2b";
        ctx.fillRect(x, rowY, cardW, rowH);

        // チームロゴ（ESPN CDN）
        const logoImg = logoCache.current.get(code);
        if (logoImg && logoImg.complete) {
          try {
            ctx.drawImage(logoImg, x + 6, rowY + 4, 24, 24);
          } catch {
            // エラー時はスキップ
          }
        }

        // チーム略称
        ctx.fillStyle = "#ffffff";
        ctx.font = isWinner ? "900 14px sans-serif" : "bold 13px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(code, x + 36, rowY + 21);

        // 白四角シードバッジ（黒太字）
        if (seed) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x + cardW - 28, rowY + 3, 25, rowH - 6);
          ctx.fillStyle = "#000000";
          ctx.font = "900 14px 'Arial Black', monospace";
          ctx.textAlign = "center";
          ctx.fillText(String(seed), x + cardW - 15.5, rowY + 21);
        }

        // 勝者ハイライト枠
        if (isWinner) {
          ctx.strokeStyle = "#eab308";
          ctx.lineWidth = 2.5;
          ctx.strokeRect(x, rowY, cardW, rowH);
        }
      };

      renderTeamRow(y, teamTop, seedTop, winner === teamTop);
      renderTeamRow(y + rowH, teamBot, seedBot, winner === teamBot);
      ctx.restore();
    };

    // 接続線
    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      const mid = (x1 + x2) / 2;
      ctx.lineTo(mid, y1);
      ctx.lineTo(mid, y2);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    // 左右対称座標
    // NFC (左)
    const nfcWcX = 45;
    const nfcDivX = 230;
    const nfcCcgX = 390;

    // AFC (右)
    const afcCcgX = 642;
    const afcDivX = 802;
    const afcWcX = 987;

    const wcY = [115, 265, 415];

    // ============= NFC (左側) =============
    const nfcWcList = [
      { hSeed: 2, aSeed: 7, win: nfcWcWinners[0] },
      { hSeed: 3, aSeed: 6, win: nfcWcWinners[1] },
      { hSeed: 4, aSeed: 5, win: nfcWcWinners[2] },
    ];
    nfcWcList.forEach((m, i) => {
      const topT = nfcSeeds[m.hSeed - 1]?.team;
      const botT = nfcSeeds[m.aSeed - 1]?.team;
      drawCard(nfcWcX, wcY[i], topT, m.hSeed, botT, m.aSeed, m.win);

      const targetDivY = i === 0 ? 190 : 340;
      drawLine(nfcWcX + cardW, wcY[i] + rowH, nfcDivX, targetDivY + (i === 1 ? 0 : rowH));
    });

    const nfcD1Away = nfcDivMatchups ? nfcDivMatchups[0]?.away : undefined;
    const nfcD2Home = nfcDivMatchups ? nfcDivMatchups[1]?.home : undefined;
    const nfcD2Away = nfcDivMatchups ? nfcDivMatchups[1]?.away : undefined;

    drawCard(nfcDivX, 190, nfcSeeds[0]?.team, 1, nfcD1Away, nfcD1Away ? nfcSeedMap.get(nfcD1Away) : undefined, nfcDivWinners[0]);
    drawCard(nfcDivX, 340, nfcD2Home, nfcD2Home ? nfcSeedMap.get(nfcD2Home) : undefined, nfcD2Away, nfcD2Away ? nfcSeedMap.get(nfcD2Away) : undefined, nfcDivWinners[1]);

    drawLine(nfcDivX + cardW, 190 + rowH, nfcCcgX, 265);
    drawLine(nfcDivX + cardW, 340 + rowH, nfcCcgX, 265 + rowH);

    drawCard(nfcCcgX, 265, nfcDivWinners[0], nfcDivWinners[0] ? nfcSeedMap.get(nfcDivWinners[0]) : undefined, nfcDivWinners[1], nfcDivWinners[1] ? nfcSeedMap.get(nfcDivWinners[1]) : undefined, nfcChamp ?? undefined);

    // ============= AFC (右側) =============
    const afcWcList = [
      { hSeed: 2, aSeed: 7, win: afcWcWinners[0] },
      { hSeed: 3, aSeed: 6, win: afcWcWinners[1] },
      { hSeed: 4, aSeed: 5, win: afcWcWinners[2] },
    ];
    afcWcList.forEach((m, i) => {
      const topT = afcSeeds[m.hSeed - 1]?.team;
      const botT = afcSeeds[m.aSeed - 1]?.team;
      drawCard(afcWcX, wcY[i], topT, m.hSeed, botT, m.aSeed, m.win);

      const targetDivY = i === 0 ? 190 : 340;
      drawLine(afcWcX, wcY[i] + rowH, afcDivX + cardW, targetDivY + (i === 1 ? 0 : rowH));
    });

    const afcD1Away = afcDivMatchups ? afcDivMatchups[0]?.away : undefined;
    const afcD2Home = afcDivMatchups ? afcDivMatchups[1]?.home : undefined;
    const afcD2Away = afcDivMatchups ? afcDivMatchups[1]?.away : undefined;

    drawCard(afcDivX, 190, afcSeeds[0]?.team, 1, afcD1Away, afcD1Away ? afcSeedMap.get(afcD1Away) : undefined, afcDivWinners[0]);
    drawCard(afcDivX, 340, afcD2Home, afcD2Home ? afcSeedMap.get(afcD2Home) : undefined, afcD2Away, afcD2Away ? afcSeedMap.get(afcD2Away) : undefined, afcDivWinners[1]);

    drawLine(afcDivX, 190 + rowH, afcCcgX + cardW, 265);
    drawLine(afcDivX, 340 + rowH, afcCcgX + cardW, 265 + rowH);

    drawCard(afcCcgX, 265, afcDivWinners[0], afcDivWinners[0] ? afcSeedMap.get(afcDivWinners[0]) : undefined, afcDivWinners[1], afcDivWinners[1] ? afcSeedMap.get(afcDivWinners[1]) : undefined, afcChamp ?? undefined);

    // ============= 中央最下部：SUPER BOWL LXI =============
    const sbX = (width - cardW) / 2;
    const sbY = 485;

    drawLine(nfcCcgX + cardW / 2, 265 + rowH * 2, sbX, sbY + rowH / 2);
    drawLine(afcCcgX + cardW / 2, 265 + rowH * 2, sbX + cardW, sbY + rowH * 1.5);

    drawCard(sbX, sbY, nfcChamp ?? undefined, nfcChamp ? nfcSeedMap.get(nfcChamp) : undefined, afcChamp ?? undefined, afcChamp ? afcSeedMap.get(afcChamp) : undefined, superBowlChamp ?? undefined);

    // サイトロゴ（右下端に控えめ配置）
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
    ctx.font = "bold 11px monospace";
    ctx.fillText("NFL FAN HUB JAPAN · nfl-fanhub.onrender.com", width - 30, height - 16);

    setPreviewUrl(canvas.toDataURL("image/png"));
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => renderCanvas(), 60);
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
              text: `私の2026-27 NFLプレイオフ勝敗予想！スーパーボウル覇者は【${superBowlChamp ? getTeamInfo(superBowlChamp).name : "未定"}】！ #NFL #NFLJapan`,
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

        {/* タブなし！スマホ左右2列（チームカラー即時反映ボタン） */}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-4">
          {/* 左：NFC カラム */}
          <div className="rounded-xl border border-blue-950/60 bg-blue-950/15 p-2 sm:p-3 space-y-2.5">
            <div className="flex items-center justify-between font-mono text-[11px] font-black text-blue-400 border-b border-blue-900/40 pb-1">
              <span>NFC</span>
              <span className="text-[9px] text-slate-400">#1 {nfcSeeds[0]?.team} (BYE)</span>
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
                    ].map((t) => {
                      const color = t.code ? NFL_TEAM_COLORS[t.code]?.primary : "#1e293b";
                      return (
                        <button
                          key={t.code}
                          onClick={() => setNfcWcWinners((prev) => ({ ...prev, [idx]: t.code }))}
                          style={{ backgroundColor: won === t.code ? color : undefined }}
                          className={`flex-1 rounded py-1 px-1 text-center text-[11px] font-bold border truncate ${
                            won === t.code
                              ? "text-white border-amber-400 ring-1 ring-amber-400"
                              : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                          }`}
                        >
                          #{t.seed} {t.code}
                        </button>
                      );
                    })}
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
                    {[m.home, m.away].map((code) => {
                      const color = code ? NFL_TEAM_COLORS[code]?.primary : "#1e293b";
                      const won = nfcDivWinners[idx] === code;
                      return (
                        <button
                          key={code}
                          onClick={() => setNfcDivWinners((prev) => ({ ...prev, [idx]: code }))}
                          style={{ backgroundColor: won ? color : undefined }}
                          className={`flex-1 rounded py-1 px-1 text-center text-[11px] font-bold border truncate ${
                            won
                              ? "text-white border-amber-400 ring-1 ring-amber-400"
                              : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                          }`}
                        >
                          #{nfcSeedMap.get(code)} {code}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* CCG */}
            {nfcDivWinners[0] && nfcDivWinners[1] && (
              <div className="space-y-1.5 pt-1.5 border-t border-blue-900/40">
                <span className="text-[9px] font-mono text-blue-300 block">NFC CHAMPIONSHIP</span>
                <div className="flex gap-1">
                  {[nfcDivWinners[0], nfcDivWinners[1]].map((code) => {
                    const color = code ? NFL_TEAM_COLORS[code]?.primary : "#1e293b";
                    const won = nfcChamp === code;
                    return (
                      <button
                        key={code}
                        onClick={() => setNfcChamp(code)}
                        style={{ backgroundColor: won ? color : undefined }}
                        className={`flex-1 rounded py-1.5 px-1 text-center text-[11px] font-black border truncate ${
                          won
                            ? "text-white border-blue-400 ring-2 ring-blue-400 shadow-md"
                            : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        #{nfcSeedMap.get(code)} {code}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 右：AFC カラム */}
          <div className="rounded-xl border border-red-950/60 bg-red-950/15 p-2 sm:p-3 space-y-2.5">
            <div className="flex items-center justify-between font-mono text-[11px] font-black text-red-400 border-b border-red-900/40 pb-1">
              <span>AFC</span>
              <span className="text-[9px] text-slate-400">#1 {afcSeeds[0]?.team} (BYE)</span>
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
                    ].map((t) => {
                      const color = t.code ? NFL_TEAM_COLORS[t.code]?.primary : "#1e293b";
                      return (
                        <button
                          key={t.code}
                          onClick={() => setAfcWcWinners((prev) => ({ ...prev, [idx]: t.code }))}
                          style={{ backgroundColor: won === t.code ? color : undefined }}
                          className={`flex-1 rounded py-1 px-1 text-center text-[11px] font-bold border truncate ${
                            won === t.code
                              ? "text-white border-amber-400 ring-1 ring-amber-400"
                              : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                          }`}
                        >
                          #{t.seed} {t.code}
                        </button>
                      );
                    })}
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
                    {[m.home, m.away].map((code) => {
                      const color = code ? NFL_TEAM_COLORS[code]?.primary : "#1e293b";
                      const won = afcDivWinners[idx] === code;
                      return (
                        <button
                          key={code}
                          onClick={() => setAfcDivWinners((prev) => ({ ...prev, [idx]: code }))}
                          style={{ backgroundColor: won ? color : undefined }}
                          className={`flex-1 rounded py-1 px-1 text-center text-[11px] font-bold border truncate ${
                            won
                              ? "text-white border-amber-400 ring-1 ring-amber-400"
                              : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                          }`}
                        >
                          #{afcSeedMap.get(code)} {code}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* CCG */}
            {afcDivWinners[0] && afcDivWinners[1] && (
              <div className="space-y-1.5 pt-1.5 border-t border-red-900/40">
                <span className="text-[9px] font-mono text-red-300 block">AFC CHAMPIONSHIP</span>
                <div className="flex gap-1">
                  {[afcDivWinners[0], afcDivWinners[1]].map((code) => {
                    const color = code ? NFL_TEAM_COLORS[code]?.primary : "#1e293b";
                    const won = afcChamp === code;
                    return (
                      <button
                        key={code}
                        onClick={() => setAfcChamp(code)}
                        style={{ backgroundColor: won ? color : undefined }}
                        className={`flex-1 rounded py-1.5 px-1 text-center text-[11px] font-black border truncate ${
                          won
                            ? "text-white border-red-400 ring-2 ring-red-400 shadow-md"
                            : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        #{afcSeedMap.get(code)} {code}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 最下部中央：SUPER BOWL LXI */}
        {afcChamp && nfcChamp && (
          <div className="mt-3 rounded-xl border border-amber-500/50 bg-amber-500/10 p-2 sm:p-2.5 text-center">
            <span className="font-mono text-[10px] text-amber-400 font-black tracking-widest block">SUPER BOWL LXI</span>
            <div className="mt-1 flex gap-2 justify-center max-w-xs mx-auto">
              {[
                { code: nfcChamp, seedMap: nfcSeedMap },
                { code: afcChamp, seedMap: afcSeedMap },
              ].map(({ code, seedMap }) => {
                const color = NFL_TEAM_COLORS[code]?.primary;
                const won = superBowlChamp === code;
                return (
                  <button
                    key={code}
                    onClick={() => setSuperBowlChamp(code)}
                    style={{ backgroundColor: won ? color : undefined }}
                    className={`flex-1 rounded-xl p-1.5 text-center font-bold border transition-all ${
                      won
                        ? "text-white border-amber-400 ring-2 ring-amber-400 shadow-lg scale-105"
                        : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                    }`}
                  >
                    <div className="text-xs font-black">#{seedMap.get(code)} {code}</div>
                  </button>
                );
              })}
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
