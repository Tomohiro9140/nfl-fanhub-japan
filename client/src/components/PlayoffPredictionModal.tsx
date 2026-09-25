import React, { useMemo, useRef, useState, useEffect } from "react";
import { X, Trophy, Share2, Sparkles, RotateCcw, ChevronRight, Award } from "lucide-react";
import { NFL_TEAMS } from "@/lib/tiebreaker/nflTeams";

// NFL公式チームカラーマップ（背景・アクセント用）
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

  // トーナメント状態
  const [afcWcWinners, setAfcWcWinners] = useState<{ [matchIndex: number]: string }>({});
  const [nfcWcWinners, setNfcWcWinners] = useState<{ [matchIndex: number]: string }>({});
  const [afcDivWinners, setAfcDivWinners] = useState<{ [matchIndex: number]: string }>({});
  const [nfcDivWinners, setNfcDivWinners] = useState<{ [matchIndex: number]: string }>({});
  const [afcChamp, setAfcChamp] = useState<string | null>(null);
  const [nfcChamp, setNfcChamp] = useState<string | null>(null);
  const [superBowlChamp, setSuperBowlChamp] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"AFC" | "NFC" | "SB">("AFC");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // シード番号辞書
  const afcSeedMap = useMemo(() => new Map(afcSeeds.map((s, i) => [s.team, i + 1])), [afcSeeds]);
  const nfcSeedMap = useMemo(() => new Map(nfcSeeds.map((s, i) => [s.team, i + 1])), [nfcSeeds]);

  // NFL公式リシーディング計算（#1シードは残った中で最もシード順位が低いチームと対戦）
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
      { home: seed1, away: lowest, id: "div1" },
      { home: mid1, away: mid2, id: "div2" },
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

  // 自動上位全勝入力
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

  // 1200 x 675 プロ仕様高画質グラフィックレンダリング
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1200;
    const height = 675;
    canvas.width = width;
    canvas.height = height;

    // 1. 深みのあるスタジアム調ダークグラデーション背景
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, width * 0.7);
    bgGrad.addColorStop(0, "#151e32");
    bgGrad.addColorStop(0.6, "#0b101b");
    bgGrad.addColorStop(1, "#05070d");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 微細グリッド背景
    ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. ヘッダーデザイン
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 30px 'Arial Black', sans-serif";
    ctx.textAlign = "center";
    ctx.letterSpacing = "2px";
    ctx.fillText("2026-27 NFL PLAYOFF BRACKET", width / 2, 52);

    ctx.fillStyle = "#eab308";
    ctx.font = "bold 12px monospace";
    ctx.letterSpacing = "3px";
    ctx.fillText("ROAD TO SUPER BOWL LXI", width / 2, 74);

    // 3. ブラケットカード描画ヘルパー
    const drawCard = (x: number, y: number, w: number, h: number, code?: string, seedNum?: number, isWinner?: boolean) => {
      ctx.save();
      if (!code) {
        // 未確定枠
        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText("TBD", x + w / 2, y + h / 2 + 4);
        ctx.restore();
        return;
      }

      const team = getTeamInfo(code);

      // 背景
      ctx.fillStyle = isWinner ? "#182238" : "#0d1320";
      ctx.strokeStyle = isWinner ? "#eab308" : "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = isWinner ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 6);
      ctx.fill();
      ctx.stroke();

      // チームカラーの左アクセントバー
      ctx.fillStyle = team.primaryColor;
      ctx.beginPath();
      ctx.roundRect(x, y, 6, h, [6, 0, 0, 6]);
      ctx.fill();

      // シード番号バッジ
      if (seedNum) {
        ctx.fillStyle = isWinner ? "#eab308" : "rgba(255, 255, 255, 0.2)";
        ctx.font = "900 11px monospace";
        ctx.textAlign = "left";
        ctx.fillText(`#${seedNum}`, x + 12, y + h / 2 + 4);
      }

      // チーム名
      ctx.fillStyle = isWinner ? "#ffffff" : "rgba(255, 255, 255, 0.75)";
      ctx.font = isWinner ? "bold 13px sans-serif" : "12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(team.name, x + (seedNum ? 34 : 14), y + h / 2 + 4);

      // 勝者マーク
      if (isWinner) {
        ctx.fillStyle = "#eab308";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "right";
        ctx.fillText("ADV ▶", x + w - 8, y + h / 2 + 3);
      }

      ctx.restore();
    };

    // 接続ライン描画ヘルパー
    const drawLine = (x1: number, y1: number, x2: number, y2: number, active = false) => {
      ctx.save();
      ctx.strokeStyle = active ? "#eab308" : "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = active ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      const midX = (x1 + x2) / 2;
      ctx.lineTo(midX, y1);
      ctx.lineTo(midX, y2);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    };

    // AFC 列設定 (左側)
    const cardW = 160;
    const cardH = 34;

    const afcWcX = 40;
    const afcDivX = 235;
    const afcChampX = 425;

    // NFC 列設定 (右側)
    const nfcChampX = 615;
    const nfcDivX = 805;
    const nfcWcX = 1000;

    // ヘッダーラベル
    ctx.fillStyle = "#ef4444";
    ctx.font = "900 16px monospace";
    ctx.textAlign = "left";
    ctx.fillText("AFC PLAYOFFS", afcWcX, 105);

    ctx.fillStyle = "#3b82f6";
    ctx.textAlign = "right";
    ctx.fillText("NFC PLAYOFFS", nfcWcX + cardW, 105);

    // ================= AFC ブラケット =================
    // WC 3試合
    const wcY = [135, 220, 305];
    const afcWcMatchups = [
      { hSeed: 2, aSeed: 7, win: afcWcWinners[0] },
      { hSeed: 3, aSeed: 6, win: afcWcWinners[1] },
      { hSeed: 4, aSeed: 5, win: afcWcWinners[2] },
    ];

    afcWcMatchups.forEach((m, i) => {
      const topY = wcY[i];
      const botY = topY + 40;
      const hTeam = afcSeeds[m.hSeed - 1]?.team;
      const aTeam = afcSeeds[m.aSeed - 1]?.team;

      drawCard(afcWcX, topY, cardW, cardH, hTeam, m.hSeed, m.win === hTeam);
      drawCard(afcWcX, botY, cardW, cardH, aTeam, m.aSeed, m.win === aTeam);

      // DIVへの接続線
      const targetDivY = i === 0 ? 175 : 285;
      drawLine(afcWcX + cardW, topY + cardH / 2, afcDivX, targetDivY + (i === 1 ? 0 : 40), Boolean(m.win));
    });

    // AFC Divisional 2試合
    const divY = [175, 285];
    const div1Home = afcSeeds[0]?.team;
    const div1Away = afcDivMatchups ? afcDivMatchups[0]?.away : undefined;
    const div2Home = afcDivMatchups ? afcDivMatchups[1]?.home : undefined;
    const div2Away = afcDivMatchups ? afcDivMatchups[1]?.away : undefined;

    drawCard(afcDivX, divY[0], cardW, cardH, div1Home, 1, afcDivWinners[0] === div1Home);
    drawCard(afcDivX, divY[0] + 40, cardW, cardH, div1Away, div1Away ? afcSeedMap.get(div1Away) : undefined, afcDivWinners[0] === div1Away);

    drawCard(afcDivX, divY[1], cardW, cardH, div2Home, div2Home ? afcSeedMap.get(div2Home) : undefined, afcDivWinners[1] === div2Home);
    drawCard(afcDivX, divY[1] + 40, cardW, cardH, div2Away, div2Away ? afcSeedMap.get(div2Away) : undefined, afcDivWinners[1] === div2Away);

    // CCGへの接続線
    drawLine(afcDivX + cardW, divY[0] + 20, afcChampX, 230, Boolean(afcDivWinners[0]));
    drawLine(afcDivX + cardW, divY[1] + 20, afcChampX, 270, Boolean(afcDivWinners[1]));

    // AFC Championship
    drawCard(afcChampX, 215, cardW, cardH, afcDivWinners[0], afcDivWinners[0] ? afcSeedMap.get(afcDivWinners[0]) : undefined, afcChamp === afcDivWinners[0]);
    drawCard(afcChampX, 255, cardW, cardH, afcDivWinners[1], afcDivWinners[1] ? afcSeedMap.get(afcDivWinners[1]) : undefined, afcChamp === afcDivWinners[1]);

    // ================= NFC ブラケット =================
    const nfcWcMatchups = [
      { hSeed: 2, aSeed: 7, win: nfcWcWinners[0] },
      { hSeed: 3, aSeed: 6, win: nfcWcWinners[1] },
      { hSeed: 4, aSeed: 5, win: nfcWcWinners[2] },
    ];

    nfcWcMatchups.forEach((m, i) => {
      const topY = wcY[i];
      const botY = topY + 40;
      const hTeam = nfcSeeds[m.hSeed - 1]?.team;
      const aTeam = nfcSeeds[m.aSeed - 1]?.team;

      drawCard(nfcWcX, topY, cardW, cardH, hTeam, m.hSeed, m.win === hTeam);
      drawCard(nfcWcX, botY, cardW, cardH, aTeam, m.aSeed, m.win === aTeam);

      const targetDivY = i === 0 ? 175 : 285;
      drawLine(nfcWcX, topY + cardH / 2, nfcDivX + cardW, targetDivY + (i === 1 ? 0 : 40), Boolean(m.win));
    });

    // NFC Divisional 2試合
    const nfcDiv1Home = nfcSeeds[0]?.team;
    const nfcDiv1Away = nfcDivMatchups ? nfcDivMatchups[0]?.away : undefined;
    const nfcDiv2Home = nfcDivMatchups ? nfcDivMatchups[1]?.home : undefined;
    const nfcDiv2Away = nfcDivMatchups ? nfcDivMatchups[1]?.away : undefined;

    drawCard(nfcDivX, divY[0], cardW, cardH, nfcDiv1Home, 1, nfcDivWinners[0] === nfcDiv1Home);
    drawCard(nfcDivX, divY[0] + 40, cardW, cardH, nfcDiv1Away, nfcDiv1Away ? nfcSeedMap.get(nfcDiv1Away) : undefined, nfcDivWinners[0] === nfcDiv1Away);

    drawCard(nfcDivX, divY[1], cardW, cardH, nfcDiv2Home, nfcDiv2Home ? nfcSeedMap.get(nfcDiv2Home) : undefined, nfcDivWinners[1] === nfcDiv2Home);
    drawCard(nfcDivX, divY[1] + 40, cardW, cardH, nfcDiv2Away, nfcDiv2Away ? nfcSeedMap.get(nfcDiv2Away) : undefined, nfcDivWinners[1] === nfcDiv2Away);

    drawLine(nfcDivX, divY[0] + 20, nfcChampX + cardW, 230, Boolean(nfcDivWinners[0]));
    drawLine(nfcDivX, divY[1] + 20, nfcChampX + cardW, 270, Boolean(nfcDivWinners[1]));

    // NFC Championship
    drawCard(nfcChampX, 215, cardW, cardH, nfcDivWinners[0], nfcDivWinners[0] ? nfcSeedMap.get(nfcDivWinners[0]) : undefined, nfcChamp === nfcDivWinners[0]);
    drawCard(nfcChampX, 255, cardW, cardH, nfcDivWinners[1], nfcDivWinners[1] ? nfcSeedMap.get(nfcDivWinners[1]) : undefined, nfcChamp === nfcDivWinners[1]);

    // ================= 中央：SUPER BOWL LXI =================
    const sbBoxW = 420;
    const sbBoxH = 175;
    const sbBoxX = (width - sbBoxW) / 2;
    const sbBoxY = 405;

    // 王者プレート
    const goldGrad = ctx.createLinearGradient(sbBoxX, sbBoxY, sbBoxX + sbBoxW, sbBoxY + sbBoxH);
    goldGrad.addColorStop(0, "rgba(234, 179, 8, 0.2)");
    goldGrad.addColorStop(0.5, "rgba(234, 179, 8, 0.05)");
    goldGrad.addColorStop(1, "rgba(234, 179, 8, 0.2)");

    ctx.fillStyle = goldGrad;
    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(sbBoxX, sbBoxY, sbBoxW, sbBoxH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#eab308";
    ctx.font = "900 13px monospace";
    ctx.letterSpacing = "2px";
    ctx.textAlign = "center";
    ctx.fillText("★ SUPER BOWL LXI CHAMPION ★", width / 2, sbBoxY + 34);

    if (superBowlChamp) {
      const champ = getTeamInfo(superBowlChamp);

      // 王者チーム名
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 38px sans-serif";
      ctx.fillText(champ.name, width / 2, sbBoxY + 86);

      // カラーチップ＆コード
      ctx.fillStyle = champ.primaryColor;
      ctx.fillRect(width / 2 - 35, sbBoxY + 104, 70, 4);

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "bold 16px monospace";
      ctx.fillText(`WORLD CHAMPIONS [ ${champ.code} ]`, width / 2, sbBoxY + 135);
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("PREDICTION PENDING", width / 2, sbBoxY + 95);
    }

    // サイトロゴ（右下に極小・目立たないウォーターマーク）
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.font = "bold 11px monospace";
    ctx.letterSpacing = "1px";
    ctx.fillText("NFL FAN HUB JAPAN · nfl-fanhub.onrender.com", width - 35, height - 20);

    setPreviewUrl(canvas.toDataURL("image/png"));
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => renderCanvas(), 80);
    }
  }, [isOpen, afcSeeds, nfcSeeds, afcWcWinners, nfcWcWinners, afcDivWinners, nfcDivWinners, afcChamp, nfcChamp, superBowlChamp]);

  // 画像保存・シェア
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
            // キャンセル時は何もしない
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
      <div className="relative w-full max-w-5xl rounded-2xl border border-slate-700/80 bg-[#0b101b] text-white shadow-2xl p-4 sm:p-6 my-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">NFL プレイオフ勝敗予想 ＆ 画像生成</h2>
              <p className="text-[11px] text-slate-400">タップして勝者をトーナメントに勝ち上がらせてください</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* コントロール ＆ カンファレンスタブ */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab("AFC")}
              className={`px-3 py-1 rounded-md transition ${activeTab === "AFC" ? "bg-red-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              AFC ブラケット
            </button>
            <button
              onClick={() => setActiveTab("NFC")}
              className={`px-3 py-1 rounded-md transition ${activeTab === "NFC" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              NFC ブラケット
            </button>
            <button
              onClick={() => setActiveTab("SB")}
              className={`px-3 py-1 rounded-md transition ${activeTab === "SB" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"}`}
            >
              スーパーボウル
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={autoFillHigherSeeds}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition"
            >
              <Sparkles className="h-3.5 w-3.5" /> 上位シード全勝で入力
            </button>
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" /> リセット
            </button>
          </div>
        </div>

        {/* ブラケット入力セクション */}
        <div className="mt-4">
          {activeTab === "AFC" && (
            <div className="space-y-4 rounded-xl border border-red-950/60 bg-red-950/10 p-3 sm:p-4">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-red-400 font-mono tracking-wider">AFC TOURNAMENT</span>
                <span className="text-slate-400">#1 {getTeamInfo(afcSeeds[0]?.team).name} ({afcSeeds[0]?.team}) はシード1位でBYE</span>
              </div>

              {/* Wild Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { hSeed: 2, aSeed: 7, idx: 0 },
                  { hSeed: 3, aSeed: 6, idx: 1 },
                  { hSeed: 4, aSeed: 5, idx: 2 },
                ].map(({ hSeed, aSeed, idx }) => {
                  const hCode = afcSeeds[hSeed - 1]?.team;
                  const aCode = afcSeeds[aSeed - 1]?.team;
                  const won = afcWcWinners[idx];
                  return (
                    <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/90 p-2.5">
                      <div className="text-[10px] font-mono text-slate-400 mb-1.5">WILD CARD {idx + 1}</div>
                      <div className="space-y-1.5">
                        {[
                          { code: hCode, seed: hSeed },
                          { code: aCode, seed: aSeed },
                        ].map((t) => (
                          <button
                            key={t.code}
                            onClick={() => setAfcWcWinners((prev) => ({ ...prev, [idx]: t.code }))}
                            className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-bold border transition ${
                              won === t.code
                                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                                : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                            }`}
                          >
                            <span className="truncate">#{t.seed} {getTeamInfo(t.code).name}</span>
                            <span className="text-[10px] opacity-75 font-mono">{t.code}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Divisional */}
              {afcDivMatchups && (
                <div className="pt-2 border-t border-red-950/80">
                  <div className="text-[10px] font-mono text-slate-400 mb-2">DIVISIONAL ROUND (リシーディング適用済み)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {afcDivMatchups.map((m, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/90 p-2.5">
                        <div className="text-[10px] font-mono text-slate-400 mb-1.5">DIV GAME {idx + 1}</div>
                        <div className="space-y-1.5">
                          {[m.home, m.away].map((code) => (
                            <button
                              key={code}
                              onClick={() => setAfcDivWinners((prev) => ({ ...prev, [idx]: code }))}
                              className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-bold border transition ${
                                afcDivWinners[idx] === code
                                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                                  : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                              }`}
                            >
                              <span className="truncate">#{afcSeedMap.get(code)} {getTeamInfo(code).name}</span>
                              <span className="text-[10px] opacity-75 font-mono">{code}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Championship */}
              {afcDivWinners[0] && afcDivWinners[1] && (
                <div className="pt-2 border-t border-red-950/80">
                  <div className="text-[10px] font-mono text-red-400 mb-1.5 font-bold">AFC CHAMPIONSHIP</div>
                  <div className="flex gap-2">
                    {[afcDivWinners[0], afcDivWinners[1]].map((code) => (
                      <button
                        key={code}
                        onClick={() => setAfcChamp(code)}
                        className={`flex-1 rounded-xl p-2.5 text-center font-bold text-xs border transition ${
                          afcChamp === code
                            ? "bg-red-600 text-white border-red-400 shadow-lg scale-[1.02]"
                            : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        🏆 AFC王者: {getTeamInfo(code).name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "NFC" && (
            <div className="space-y-4 rounded-xl border border-blue-950/60 bg-blue-950/10 p-3 sm:p-4">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-blue-400 font-mono tracking-wider">NFC TOURNAMENT</span>
                <span className="text-slate-400">#1 {getTeamInfo(nfcSeeds[0]?.team).name} ({nfcSeeds[0]?.team}) はシード1位でBYE</span>
              </div>

              {/* Wild Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { hSeed: 2, aSeed: 7, idx: 0 },
                  { hSeed: 3, aSeed: 6, idx: 1 },
                  { hSeed: 4, aSeed: 5, idx: 2 },
                ].map(({ hSeed, aSeed, idx }) => {
                  const hCode = nfcSeeds[hSeed - 1]?.team;
                  const aCode = nfcSeeds[aSeed - 1]?.team;
                  const won = nfcWcWinners[idx];
                  return (
                    <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/90 p-2.5">
                      <div className="text-[10px] font-mono text-slate-400 mb-1.5">WILD CARD {idx + 1}</div>
                      <div className="space-y-1.5">
                        {[
                          { code: hCode, seed: hSeed },
                          { code: aCode, seed: aSeed },
                        ].map((t) => (
                          <button
                            key={t.code}
                            onClick={() => setNfcWcWinners((prev) => ({ ...prev, [idx]: t.code }))}
                            className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-bold border transition ${
                              won === t.code
                                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                                : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                            }`}
                          >
                            <span className="truncate">#{t.seed} {getTeamInfo(t.code).name}</span>
                            <span className="text-[10px] opacity-75 font-mono">{t.code}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Divisional */}
              {nfcDivMatchups && (
                <div className="pt-2 border-t border-blue-950/80">
                  <div className="text-[10px] font-mono text-slate-400 mb-2">DIVISIONAL ROUND (リシーディング適用済み)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {nfcDivMatchups.map((m, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/90 p-2.5">
                        <div className="text-[10px] font-mono text-slate-400 mb-1.5">DIV GAME {idx + 1}</div>
                        <div className="space-y-1.5">
                          {[m.home, m.away].map((code) => (
                            <button
                              key={code}
                              onClick={() => setNfcDivWinners((prev) => ({ ...prev, [idx]: code }))}
                              className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-bold border transition ${
                                nfcDivWinners[idx] === code
                                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                                  : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                              }`}
                            >
                              <span className="truncate">#{nfcSeedMap.get(code)} {getTeamInfo(code).name}</span>
                              <span className="text-[10px] opacity-75 font-mono">{code}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Championship */}
              {nfcDivWinners[0] && nfcDivWinners[1] && (
                <div className="pt-2 border-t border-blue-950/80">
                  <div className="text-[10px] font-mono text-blue-400 mb-1.5 font-bold">NFC CHAMPIONSHIP</div>
                  <div className="flex gap-2">
                    {[nfcDivWinners[0], nfcDivWinners[1]].map((code) => (
                      <button
                        key={code}
                        onClick={() => setNfcChamp(code)}
                        className={`flex-1 rounded-xl p-2.5 text-center font-bold text-xs border transition ${
                          nfcChamp === code
                            ? "bg-blue-600 text-white border-blue-400 shadow-lg scale-[1.02]"
                            : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        🏆 NFC王者: {getTeamInfo(code).name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "SB" && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-center">
              <span className="font-mono text-xs text-amber-400 font-black tracking-widest">SUPER BOWL LXI</span>
              <h3 className="text-base font-bold mt-1 mb-3">ワールドチャンピオンを選択</h3>
              {afcChamp && nfcChamp ? (
                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
                  {[
                    { code: afcChamp, conf: "AFC" },
                    { code: nfcChamp, conf: "NFC" },
                  ].map(({ code, conf }) => (
                    <button
                      key={code}
                      onClick={() => setSuperBowlChamp(code)}
                      className={`flex-1 rounded-xl p-3 text-center font-bold border transition ${
                        superBowlChamp === code
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 shadow-xl scale-105"
                          : "bg-slate-900 text-white border-slate-700 hover:bg-slate-800"
                      }`}
                    >
                      <div className="text-[10px] opacity-75 font-mono">{conf} CHAMPION</div>
                      <div className="text-sm font-black mt-0.5">{getTeamInfo(code).name}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">AFCとNFCの王者を決定すると選択可能になります</p>
              )}
            </div>
          )}
        </div>

        {/* プレビュー表示エリア */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-mono text-slate-400">生成プレビュー（1200×675 / X最適化サイズ）</span>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-inner flex items-center justify-center min-h-[160px]">
            {previewUrl ? (
              <img src={previewUrl} alt="Bracket Preview" className="w-full h-auto object-contain max-h-[300px]" />
            ) : (
              <span className="py-8 text-xs text-slate-500">予想を入力すると高解像度カードが生成されます</span>
            )}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <button
            onClick={openTwitterIntent}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-700 transition"
          >
            X でポスト
          </button>
          <button
            onClick={handleShareOrSave}
            disabled={isGenerating || !superBowlChamp}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-black text-slate-950 shadow-md transition hover:from-amber-400 hover:to-orange-400 active:scale-95 disabled:opacity-50"
          >
            <Share2 className="h-4 w-4" />
            <span>スマホ保存 / Xでシェア（画像添付）</span>
          </button>
        </div>

        {/* 描画用隠しCanvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
