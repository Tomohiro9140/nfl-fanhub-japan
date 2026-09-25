import React, { useMemo, useRef, useState, useEffect } from "react";
import { X, Trophy, Share2, RotateCcw } from "lucide-react";
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

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  maxW: number,
  maxH: number
) {
  if (!img.complete || img.naturalWidth === 0) return;
  const imgRatio = img.naturalWidth / img.naturalHeight;
  let w = maxW;
  let h = maxW / imgRatio;
  if (h > maxH) {
    h = maxH;
    w = maxH * imgRatio;
  }
  const drawX = x + (maxW - w) / 2;
  const drawY = y + (maxH - h) / 2;
  ctx.drawImage(img, drawX, drawY, w, h);
}

export function PlayoffPredictionModal({ isOpen, onClose, afcSeeds, nfcSeeds }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const logoCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const tournamentLogos = useRef<{
    sb?: HTMLImageElement;
    afc?: HTMLImageElement;
    nfc?: HTMLImageElement;
  }>({});

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

  useEffect(() => {
    const loadTournamentLogo = (key: "sb" | "afc" | "nfc", src: string) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        tournamentLogos.current[key] = img;
        renderCanvas();
      };
    };

    loadTournamentLogo("sb", "/superbowl2026.webp");
    loadTournamentLogo("afc", "/Afc_championship_logo.svg.webp");
    loadTournamentLogo("nfc", "/Nfc_championship_logo.svg.webp");

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

  // Canvas 描画（余白完全排除・凝縮デザイン）
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1200;
    const height = 675;
    canvas.width = width;
    canvas.height = height;

    // 1. 深みのあるダークスタジアム背景
    ctx.fillStyle = "#070b12";
    ctx.fillRect(0, 0, width, height);

    // 百合の紋章透かし
    ctx.fillStyle = "rgba(255, 255, 255, 0.015)";
    for (let x = 60; x < width; x += 100) {
      for (let y = 50; y < height; y += 100) {
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.arc(x - 10, y + 8, 8, 0, Math.PI * 2);
        ctx.arc(x + 10, y + 8, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. カンファレンス透かし文字
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.font = "900 135px 'Impact', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("AFC", 280, 370);
    ctx.fillText("NFC", 920, 370);

    // 3. 【スーパーボウル公式ロゴ】中央上部（サイズ固定・美プロポーション）
    const midX = width / 2;
    if (tournamentLogos.current.sb) {
      drawImageContain(ctx, tournamentLogos.current.sb, midX - 180, 15, 360, 170);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 36px 'Arial Black', sans-serif";
      ctx.fillText("SUPER BOWL LXI", midX, 95);
    }

    // 4. 【カンファレンス公式ロゴ】左右の真ん中下（サイズ固定・美プロポーション）
    if (tournamentLogos.current.afc) {
      drawImageContain(ctx, tournamentLogos.current.afc, 205, 475, 175, 120);
    }
    if (tournamentLogos.current.nfc) {
      drawImageContain(ctx, tournamentLogos.current.nfc, 820, 475, 175, 120);
    }

    // 5. 【通常対戦カード描画】幅138px / 隙間ゼロ化 / ロゴ34px / 文字20px
    const cardW = 138;
    const rowH = 44;

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
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cardW, rowH * 2);

      const renderTeamRow = (rowY: number, code?: string, seed?: number, isWinner?: boolean) => {
        if (!code) {
          ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          ctx.fillRect(x, rowY, cardW, rowH);
          ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
          ctx.font = "bold 13px monospace";
          ctx.textAlign = "center";
          ctx.fillText("TBD", x + cardW / 2, rowY + 27);
          return;
        }

        const info = getTeamInfo(code);
        ctx.fillStyle = isWinner ? info.primaryColor : "#141c2b";
        ctx.fillRect(x, rowY, cardW, rowH);

        // チームロゴ（34x34）
        const logoImg = logoCache.current.get(code);
        if (logoImg && logoImg.complete) {
          try {
            ctx.drawImage(logoImg, x + 5, rowY + 5, 34, 34);
          } catch {
            // スキップ
          }
        }

        // チームコード（20px 極太フォント）
        ctx.fillStyle = "#ffffff";
        ctx.font = isWinner ? "900 20px sans-serif" : "bold 19px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(code, x + 44, rowY + 29);

        // 白四角シードバッジ（チームコードのすぐ右隣に密着！隙間ゼロ）
        if (seed) {
          const badgeW = 28;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x + cardW - badgeW - 3, rowY + 3, badgeW, rowH - 6);
          ctx.fillStyle = "#000000";
          ctx.font = "900 19px 'Arial Black', monospace";
          ctx.textAlign = "center";
          ctx.fillText(String(seed), x + cardW - badgeW / 2 - 3, rowY + 28);
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

    // 接続線描画
    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
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
    const afcWcX = 25;
    const afcDivX = 195;
    const afcCcgX = 365;

    const nfcCcgX = 697;
    const nfcDivX = 867;
    const nfcWcX = 1037;

    const wcY = [50, 220, 390];

    // ============= 左側：AFC 描画 =============
    const afcWcList = [
      { hSeed: 2, aSeed: 7, win: afcWcWinners[0] },
      { hSeed: 3, aSeed: 6, win: afcWcWinners[1] },
      { hSeed: 4, aSeed: 5, win: afcWcWinners[2] },
    ];
    afcWcList.forEach((m, i) => {
      const topT = afcSeeds[m.hSeed - 1]?.team;
      const botT = afcSeeds[m.aSeed - 1]?.team;
      drawCard(afcWcX, wcY[i], topT, m.hSeed, botT, m.aSeed, m.win);

      const targetDivY = i === 0 ? 135 : 305;
      drawLine(afcWcX + cardW, wcY[i] + rowH, afcDivX, targetDivY + (i === 1 ? 0 : rowH));
    });

    const afcD1Away = afcDivMatchups ? afcDivMatchups[0]?.away : undefined;
    const afcD2Home = afcDivMatchups ? afcDivMatchups[1]?.home : undefined;
    const afcD2Away = afcDivMatchups ? afcDivMatchups[1]?.away : undefined;

    drawCard(afcDivX, 135, afcSeeds[0]?.team, 1, afcD1Away, afcD1Away ? afcSeedMap.get(afcD1Away) : undefined, afcDivWinners[0]);
    drawCard(afcDivX, 305, afcD2Home, afcD2Home ? afcSeedMap.get(afcD2Home) : undefined, afcD2Away, afcD2Away ? afcSeedMap.get(afcD2Away) : undefined, afcDivWinners[1]);

    drawLine(afcDivX + cardW, 135 + rowH, afcCcgX, 220);
    drawLine(afcDivX + cardW, 305 + rowH, afcCcgX, 220 + rowH);

    drawCard(afcCcgX, 220, afcDivWinners[0], afcDivWinners[0] ? afcSeedMap.get(afcDivWinners[0]) : undefined, afcDivWinners[1], afcDivWinners[1] ? afcSeedMap.get(afcDivWinners[1]) : undefined, afcChamp ?? undefined);

    // ============= 右側：NFC 描画 =============
    const nfcWcList = [
      { hSeed: 2, aSeed: 7, win: nfcWcWinners[0] },
      { hSeed: 3, aSeed: 6, win: nfcWcWinners[1] },
      { hSeed: 4, aSeed: 5, win: nfcWcWinners[2] },
    ];
    nfcWcList.forEach((m, i) => {
      const topT = nfcSeeds[m.hSeed - 1]?.team;
      const botT = nfcSeeds[m.aSeed - 1]?.team;
      drawCard(nfcWcX, wcY[i], topT, m.hSeed, botT, m.aSeed, m.win);

      const targetDivY = i === 0 ? 135 : 305;
      drawLine(nfcWcX, wcY[i] + rowH, nfcDivX + cardW, targetDivY + (i === 1 ? 0 : rowH));
    });

    const nfcD1Away = nfcDivMatchups ? nfcDivMatchups[0]?.away : undefined;
    const nfcD2Home = nfcDivMatchups ? nfcDivMatchups[1]?.home : undefined;
    const nfcD2Away = nfcDivMatchups ? nfcDivMatchups[1]?.away : undefined;

    drawCard(nfcDivX, 135, nfcSeeds[0]?.team, 1, nfcD1Away, nfcD1Away ? nfcSeedMap.get(nfcD1Away) : undefined, nfcDivWinners[0]);
    drawCard(nfcDivX, 305, nfcD2Home, nfcD2Home ? nfcSeedMap.get(nfcD2Home) : undefined, nfcD2Away, nfcD2Away ? nfcSeedMap.get(nfcD2Away) : undefined, nfcDivWinners[1]);

    drawLine(nfcDivX, 135 + rowH, nfcCcgX + cardW, 220);
    drawLine(nfcDivX, 305 + rowH, nfcCcgX + cardW, 220 + rowH);

    drawCard(nfcCcgX, 220, nfcDivWinners[0], nfcDivWinners[0] ? nfcSeedMap.get(nfcDivWinners[0]) : undefined, nfcDivWinners[1], nfcDivWinners[1] ? nfcSeedMap.get(nfcDivWinners[1]) : undefined, nfcChamp ?? undefined);

    // ============= 中央最下部：SUPER BOWL LXI（幅200px / 隙間ゼロ化 / 特大主役カード） =============
    const sbCardW = 200;
    const sbRowH = 64;
    const sbX = (width - sbCardW) / 2;
    const sbY = 480;

    drawLine(afcCcgX + cardW / 2, 220 + rowH * 2, sbX, sbY + sbRowH / 2);
    drawLine(nfcCcgX + cardW / 2, 220 + rowH * 2, sbX + sbCardW, sbY + sbRowH * 1.5);

    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 2;
    ctx.strokeRect(sbX, sbY, sbCardW, sbRowH * 2);

    const renderSbRow = (rowY: number, code?: string, seed?: number, isWon?: boolean) => {
      if (!code) {
        ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
        ctx.fillRect(sbX, rowY, sbCardW, sbRowH);
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.font = "bold 16px monospace";
        ctx.textAlign = "center";
        ctx.fillText("TBD", sbX + sbCardW / 2, rowY + 39);
        return;
      }

      const info = getTeamInfo(code);
      ctx.fillStyle = isWon ? info.primaryColor : "#141c2b";
      ctx.fillRect(sbX, rowY, sbCardW, sbRowH);

      // 特大ロゴ (48x48)
      const logoImg = logoCache.current.get(code);
      if (logoImg && logoImg.complete) {
        try {
          ctx.drawImage(logoImg, sbX + 8, rowY + 8, 48, 48);
        } catch {
          // スキップ
        }
      }

      // 特大チームコード (30px 超太字)
      ctx.fillStyle = "#ffffff";
      ctx.font = isWon ? "900 30px sans-serif" : "bold 28px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(code, sbX + 64, rowY + 43);

      // 特大シードバッジ（チームコードのすぐ右隣に密着！隙間ゼロ）
      if (seed) {
        const bW = 44;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(sbX + sbCardW - bW - 4, rowY + 4, bW, sbRowH - 8);
        ctx.fillStyle = "#000000";
        ctx.font = "900 26px 'Arial Black', monospace";
        ctx.textAlign = "center";
        ctx.fillText(String(seed), sbX + sbCardW - bW / 2 - 4, rowY + 42);
      }

      // 王者ハイライト（ゴールド枠）
      if (isWon) {
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 4;
        ctx.strokeRect(sbX, rowY, sbCardW, sbRowH);
      }
    };

    renderSbRow(sbY, afcChamp ?? undefined, afcChamp ? afcSeedMap.get(afcChamp) : undefined, superBowlChamp === afcChamp && Boolean(afcChamp));
    renderSbRow(sbY + sbRowH, nfcChamp ?? undefined, nfcChamp ? nfcSeedMap.get(nfcChamp) : undefined, superBowlChamp === nfcChamp && Boolean(nfcChamp));
    ctx.restore();

    // サイトロゴ
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
    ctx.font = "bold 11px monospace";
    ctx.fillText("NFL FAN HUB JAPAN · nfl-fanhub.onrender.com", width - 25, height - 14);

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
        <div className="mt-2.5 flex items-center justify-between bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 text-[11px]">チームをタップして勝ち上がらせてください</span>
          <button
            onClick={resetAll}
            className="inline-flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-700"
          >
            <RotateCcw className="h-3 w-3" /> リセット
          </button>
        </div>

        {/* 左右2列（左：AFC / 右：NFC） */}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-4">
          {/* 左：AFC カラム */}
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

          {/* 右：NFC カラム */}
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
        </div>

        {/* 最下部中央：SUPER BOWL LXI */}
        {afcChamp && nfcChamp && (
          <div className="mt-3 rounded-xl border border-amber-500/50 bg-amber-500/10 p-2 sm:p-2.5 text-center">
            <span className="font-mono text-[10px] text-amber-400 font-black tracking-widest block">SUPER BOWL LXI</span>
            <div className="mt-1 flex gap-2 justify-center max-w-xs mx-auto">
              {[
                { code: afcChamp, seedMap: afcSeedMap },
                { code: nfcChamp, seedMap: nfcSeedMap },
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
