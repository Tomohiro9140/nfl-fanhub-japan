import React, { useMemo, useRef, useState, useEffect } from "react";
import { X, Trophy, Share2, Download, Sparkles, CheckCircle2, RotateCcw } from "lucide-react";
import { nflTeams } from "@/lib/nflTeams";

type SeedTeam = {
  team: string; // チームコード (例: "NE", "KC")
  seed?: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  afcSeeds: SeedTeam[]; // 1〜7位
  nfcSeeds: SeedTeam[]; // 1〜7位
};

function getTeamInfo(code: string) {
  return nflTeams.find((t) => t.code === code) ?? {
    code,
    name: code,
    brand: { primary: "#1e293b", onPrimary: "#ffffff" },
  };
}

export function PlayoffPredictionModal({ isOpen, onClose, afcSeeds, nfcSeeds }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // カンファレンス別トーナメント状態
  // WC 勝者
  const [afcWcWinners, setAfcWcWinners] = useState<{ [matchIndex: number]: string }>({});
  const [nfcWcWinners, setNfcWcWinners] = useState<{ [matchIndex: number]: string }>({});

  // DIV 勝者
  const [afcDivWinners, setAfcDivWinners] = useState<{ [matchIndex: number]: string }>({});
  const [nfcDivWinners, setNfcDivWinners] = useState<{ [matchIndex: number]: string }>({});

  // カンファレンス王者
  const [afcChamp, setAfcChamp] = useState<string | null>(null);
  const [nfcChamp, setNfcChamp] = useState<string | null>(null);

  // スーパーボウル王者
  const [superBowlChamp, setSuperBowlChamp] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // シード番号辞書
  const afcSeedMap = useMemo(() => new Map(afcSeeds.map((s, i) => [s.team, i + 1])), [afcSeeds]);
  const nfcSeedMap = useMemo(() => new Map(nfcSeeds.map((s, i) => [s.team, i + 1])), [nfcSeeds]);

  // リシーディング計算関数（最低シードが #1 と当たる）
  const getDivisionalMatchups = (
    seed1: string,
    wcWinners: string[],
    seedMap: Map<string, number>
  ) => {
    if (wcWinners.length < 3) return null;
    const sorted = [...wcWinners].sort((a, b) => (seedMap.get(a) ?? 99) - (seedMap.get(b) ?? 99));
    const lowest = sorted[2]; // シード順位が最も低い（数値が大きい）チーム
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

  // 全自動クイック予想（シード上位で埋める）
  const autoFillHigherSeeds = () => {
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

  // Canvas による画像描画（1200 x 675 / 16:9）
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1200;
    const height = 675;
    canvas.width = width;
    canvas.height = height;

    // 1. 背景グラデーション
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "#080c14");
    bg.addColorStop(0.5, "#0f172a");
    bg.addColorStop(1, "#080c14");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // 微細なグリッドパターン
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
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

    // 2. ヘッダータイトル
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.letterSpacing = "2px";
    ctx.fillText("2026-27 NFL PLAYOFF PREDICTION", width / 2, 58);

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "bold 13px monospace";
    ctx.fillText("ROAD TO SUPER BOWL LXI", width / 2, 85);

    // 3. 中央：スーパーボウル覇者
    if (superBowlChamp) {
      const champ = getTeamInfo(superBowlChamp);
      const boxW = 340;
      const boxH = 140;
      const boxX = (width - boxW) / 2;
      const boxY = 125;

      // 金色グロー枠
      ctx.fillStyle = "rgba(234, 179, 8, 0.12)";
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.fillStyle = "#eab308";
      ctx.font = "bold 13px monospace";
      ctx.fillText("★ SUPER BOWL CHAMPION ★", width / 2, boxY + 32);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px sans-serif";
      ctx.fillText(champ.name, width / 2, boxY + 84);

      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "bold 15px monospace";
      ctx.fillText(`[ ${champ.code} ]`, width / 2, boxY + 115);
    }

    // 4. 左側（AFC）と右側（NFC）のブラケット描画ヘルパー
    const drawBracketSide = (
      conf: "AFC" | "NFC",
      startX: number,
      seeds: SeedTeam[],
      wcWin: { [idx: number]: string },
      divWin: { [idx: number]: string },
      champCode: string | null
    ) => {
      const isLeft = conf === "AFC";
      const headerColor = isLeft ? "#dc2626" : "#2563eb";

      // カンファレンス見出し
      ctx.fillStyle = headerColor;
      ctx.font = "900 20px monospace";
      ctx.textAlign = isLeft ? "left" : "right";
      ctx.fillText(conf, startX, 150);

      // CHAMPION
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(`${conf} CHAMPION:`, startX, 185);
      ctx.fillStyle = champCode ? "#ffffff" : "rgba(255,255,255,0.25)";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(champCode ? getTeamInfo(champCode).name : "—", startX, 212);

      // ワイルドカード 3試合
      const wcYStart = 280;
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "bold 11px monospace";
      ctx.fillText("WILD CARD WINNERS", startX, wcYStart - 15);

      const wcPairs = [
        { seedH: 2, seedA: 7, win: wcWin[0] },
        { seedH: 3, seedA: 6, win: wcWin[1] },
        { seedH: 4, seedA: 5, win: wcWin[2] },
      ];

      wcPairs.forEach((pair, idx) => {
        const y = wcYStart + idx * 75;
        const hTeam = seeds[pair.seedH - 1]?.team;
        const aTeam = seeds[pair.seedA - 1]?.team;

        ctx.fillStyle = "rgba(255,255,255,0.06)";
        const cardW = 310;
        const cardX = isLeft ? startX : startX - cardW;
        ctx.fillRect(cardX, y, cardW, 58);

        ctx.font = "13px sans-serif";
        ctx.textAlign = "left";

        // Home
        const hWon = pair.win === hTeam;
        ctx.fillStyle = hWon ? "#eab308" : "rgba(255,255,255,0.6)";
        ctx.fillText(`#${pair.seedH} ${hTeam}`, cardX + 15, y + 25);

        // Away
        const aWon = pair.win === aTeam;
        ctx.fillStyle = aWon ? "#eab308" : "rgba(255,255,255,0.6)";
        ctx.fillText(`#${pair.seedA} ${aTeam}`, cardX + 15, y + 47);

        // 勝者バッジ
        if (pair.win) {
          ctx.textAlign = "right";
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 14px sans-serif";
          ctx.fillText(`ADV > ${pair.win}`, cardX + cardW - 15, y + 36);
        }
      });
    };

    // AFC 描画（左端）
    drawBracketSide("AFC", 60, afcSeeds, afcWcWinners, afcDivWinners, afcChamp);
    // NFC 描画（右端）
    drawBracketSide("NFC", width - 60, nfcSeeds, nfcWcWinners, nfcDivWinners, nfcChamp);

    // 5. 【ユーザーご要望】：サイトロゴは極力目立たないように端に小さく
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)"; // 半透明で控えめ
    ctx.font = "bold 11px monospace";
    ctx.letterSpacing = "1px";
    ctx.fillText("NFL FAN HUB JAPAN · nfl-fanhub.onrender.com", width - 30, height - 20);

    // プレビュー用URLの生成
    setPreviewUrl(canvas.toDataURL("image/png"));
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => renderCanvas(), 100);
    }
  }, [isOpen, afcWcWinners, nfcWcWinners, afcDivWinners, nfcDivWinners, afcChamp, nfcChamp, superBowlChamp]);

  // スマホ保存・X（Twitter）シェアのハンドラ
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

        // スマホの Web Share API（画像添付共有）に対応している場合
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
            // シェアシートをキャンセルした場合は何もしない
          }
        }

        // 非対応またはPCの場合は通常ダウンロード
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

  // X（Twitter）投稿インテントを開く（PCフォールバック用）
  const openTwitterIntent = () => {
    const text = encodeURIComponent(
      `私の2026-27 NFLプレイオフ勝敗予想！\nスーパーボウル覇者は【${superBowlChamp ? getTeamInfo(superBowlChamp).name : "未定"}】🏆\n\n#NFL #NFLJapan #NFLFanHub\nhttps://nfl-fanhub.onrender.com/simulator`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 text-white shadow-2xl p-4 sm:p-6 my-auto">
        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold">プレイオフ勝敗予想 ＆ 画像シェア</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* コントロールバー */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          <span className="text-xs text-slate-300">各対戦の勝者をタップして勝ち上がらせてください</span>
          <div className="flex gap-2">
            <button onClick={autoFillHigherSeeds} className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-300 border border-amber-500/40 hover:bg-amber-500/30">
              <Sparkles className="h-3.5 w-3.5" /> 上位シード全勝で入力
            </button>
            <button onClick={resetAll} className="inline-flex items-center gap-1 rounded bg-slate-700 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-600">
              <RotateCcw className="h-3.5 w-3.5" /> リセット
            </button>
          </div>
        </div>

        {/* ブラケット選択エリア */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* AFC ブラケット */}
          <div className="rounded-xl border border-red-950/60 bg-red-950/20 p-3.5">
            <h3 className="font-mono text-xs font-extrabold tracking-wider text-red-400 flex items-center justify-between">
              <span>AFC BRACKET</span>
              <span className="text-[10px] text-slate-400 font-normal">#1 {afcSeeds[0]?.team} はBYE</span>
            </h3>

            {/* Wild Card */}
            <div className="mt-2.5 space-y-2">
              {[
                { hSeed: 2, aSeed: 7, idx: 0 },
                { hSeed: 3, aSeed: 6, idx: 1 },
                { hSeed: 4, aSeed: 5, idx: 2 },
              ].map(({ hSeed, aSeed, idx }) => {
                const hCode = afcSeeds[hSeed - 1]?.team;
                const aCode = afcSeeds[aSeed - 1]?.team;
                const won = afcWcWinners[idx];
                return (
                  <div key={idx} className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg border border-slate-700 text-xs">
                    <span className="font-mono text-[10px] text-slate-400">WC {idx + 1}</span>
                    <div className="flex gap-1.5">
                      <button onClick={() => setAfcWcWinners((prev) => ({ ...prev, [idx]: hCode }))} className={`px-2.5 py-1 rounded font-bold transition ${won === hCode ? "bg-amber-500 text-slate-950" : "bg-slate-700 text-slate-200 hover:bg-slate-600"}`}>
                        #{hSeed} {hCode}
                      </button>
                      <button onClick={() => setAfcWcWinners((prev) => ({ ...prev, [idx]: aCode }))} className={`px-2.5 py-1 rounded font-bold transition ${won === aCode ? "bg-amber-500 text-slate-950" : "bg-slate-700 text-slate-200 hover:bg-slate-600"}`}>
                        #{aSeed} {aCode}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Divisional & CCG */}
            {afcDivMatchups && (
              <div className="mt-3 pt-3 border-t border-red-900/40 space-y-2">
                <span className="text-[10px] font-mono text-slate-400">DIVISIONAL ROUND (リシーディング適用)</span>
                {afcDivMatchups.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg border border-slate-700 text-xs">
                    <span className="font-mono text-[10px] text-slate-400">DIV {idx + 1}</span>
                    <div className="flex gap-1.5">
                      <button onClick={() => setAfcDivWinners((prev) => ({ ...prev, [idx]: m.home }))} className={`px-2.5 py-1 rounded font-bold transition ${afcDivWinners[idx] === m.home ? "bg-amber-500 text-slate-950" : "bg-slate-700 text-slate-200 hover:bg-slate-600"}`}>
                        {m.home}
                      </button>
                      <button onClick={() => setAfcDivWinners((prev) => ({ ...prev, [idx]: m.away }))} className={`px-2.5 py-1 rounded font-bold transition ${afcDivWinners[idx] === m.away ? "bg-amber-500 text-slate-950" : "bg-slate-700 text-slate-200 hover:bg-slate-600"}`}>
                        {m.away}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AFC Championship */}
            {afcDivWinners[0] && afcDivWinners[1] && (
              <div className="mt-3 pt-3 border-t border-red-900/40 flex items-center justify-between bg-slate-800/90 p-2 rounded-lg border border-red-500/30 text-xs">
                <span className="font-bold text-red-300">AFC 王者決定</span>
                <div className="flex gap-1.5">
                  <button onClick={() => setAfcChamp(afcDivWinners[0])} className={`px-2.5 py-1 rounded font-bold ${afcChamp === afcDivWinners[0] ? "bg-red-600 text-white" : "bg-slate-700 text-slate-200"}`}>
                    {afcDivWinners[0]}
                  </button>
                  <button onClick={() => setAfcChamp(afcDivWinners[1])} className={`px-2.5 py-1 rounded font-bold ${afcChamp === afcDivWinners[1] ? "bg-red-600 text-white" : "bg-slate-700 text-slate-200"}`}>
                    {afcDivWinners[1]}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* NFC ブラケット */}
          <div className="rounded-xl border border-blue-950/60 bg-blue-950/20 p-3.5">
            <h3 className="font-mono text-xs font-extrabold tracking-wider text-blue-400 flex items-center justify-between">
              <span>NFC BRACKET</span>
              <span className="text-[10px] text-slate-400 font-normal">#1 {nfcSeeds[0]?.team} はBYE</span>
            </h3>

            {/* Wild Card */}
            <div className="mt-2.5 space-y-2">
              {[
                { hSeed: 2, aSeed: 7, idx: 0 },
                { hSeed: 3, aSeed: 6, idx: 1 },
                { hSeed: 4, aSeed: 5, idx: 2 },
              ].map(({ hSeed, aSeed, idx }) => {
                const hCode = nfcSeeds[hSeed - 1]?.team;
                const aCode = nfcSeeds[aSeed - 1]?.team;
                const won = nfcWcWinners[idx];
                return (
                  <div key={idx} className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg border border-slate-700 text-xs">
                    <span className="font-mono text-[10px] text-slate-400">WC {idx + 1}</span>
                    <div className="flex gap-1.5">
                      <button onClick={() => setNfcWcWinners((prev) => ({ ...prev, [idx]: hCode }))} className={`px-2.5 py-1 rounded font-bold transition ${won === hCode ? "bg-amber-500 text-slate-950" : "bg-slate-700 text-slate-200 hover:bg-slate-600"}`}>
                        #{hSeed} {hCode}
                      </button>
                      <button onClick={() => setNfcWcWinners((prev) => ({ ...prev, [idx]: aCode }))} className={`px-2.5 py-1 rounded font-bold transition ${won === aCode ? "bg-amber-500 text-slate-950" : "bg-slate-700 text-slate-200 hover:bg-slate-600"}`}>
                        #{aSeed} {aCode}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Divisional & CCG */}
            {nfcDivMatchups && (
              <div className="mt-3 pt-3 border-t border-blue-900/40 space-y-2">
                <span className="text-[10px] font-mono text-slate-400">DIVISIONAL ROUND (リシーディング適用)</span>
                {nfcDivMatchups.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg border border-slate-700 text-xs">
                    <span className="font-mono text-[10px] text-slate-400">DIV {idx + 1}</span>
                    <div className="flex gap-1.5">
                      <button onClick={() => setNfcDivWinners((prev) => ({ ...prev, [idx]: m.home }))} className={`px-2.5 py-1 rounded font-bold transition ${nfcDivWinners[idx] === m.home ? "bg-amber-500 text-slate-950" : "bg-slate-700 text-slate-200 hover:bg-slate-600"}`}>
                        {m.home}
                      </button>
                      <button onClick={() => setNfcDivWinners((prev) => ({ ...prev, [idx]: m.away }))} className={`px-2.5 py-1 rounded font-bold transition ${nfcDivWinners[idx] === m.away ? "bg-amber-500 text-slate-950" : "bg-slate-700 text-slate-200 hover:bg-slate-600"}`}>
                        {m.away}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* NFC Championship */}
            {nfcDivWinners[0] && nfcDivWinners[1] && (
              <div className="mt-3 pt-3 border-t border-blue-900/40 flex items-center justify-between bg-slate-800/90 p-2 rounded-lg border border-blue-500/30 text-xs">
                <span className="font-bold text-blue-300">NFC 王者決定</span>
                <div className="flex gap-1.5">
                  <button onClick={() => setNfcChamp(nfcDivWinners[0])} className={`px-2.5 py-1 rounded font-bold ${nfcChamp === nfcDivWinners[0] ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-200"}`}>
                    {nfcDivWinners[0]}
                  </button>
                  <button onClick={() => setNfcChamp(nfcDivWinners[1])} className={`px-2.5 py-1 rounded font-bold ${nfcChamp === nfcDivWinners[1] ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-200"}`}>
                    {nfcDivWinners[1]}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Super Bowl 覇者選択 */}
        {afcChamp && nfcChamp && (
          <div className="mt-4 rounded-xl border border-amber-500/50 bg-amber-500/10 p-3.5 text-center">
            <h4 className="font-display font-black text-amber-400 text-sm tracking-wider">SUPER BOWL LXI</h4>
            <div className="mt-2 flex justify-center gap-3">
              <button onClick={() => setSuperBowlChamp(afcChamp)} className={`px-4 py-2 rounded-xl font-bold transition ${superBowlChamp === afcChamp ? "bg-amber-500 text-slate-950 shadow-lg scale-105" : "bg-slate-800 text-white border border-slate-700"}`}>
                🏆 {getTeamInfo(afcChamp).name} (AFC)
              </button>
              <button onClick={() => setSuperBowlChamp(nfcChamp)} className={`px-4 py-2 rounded-xl font-bold transition ${superBowlChamp === nfcChamp ? "bg-amber-500 text-slate-950 shadow-lg scale-105" : "bg-slate-800 text-white border border-slate-700"}`}>
                🏆 {getTeamInfo(nfcChamp).name} (NFC)
              </button>
            </div>
          </div>
        )}

        {/* プレビュー表示エリア */}
        <div className="mt-4">
          <p className="text-[11px] font-mono text-slate-400 mb-1.5">生成プレビュー（1200×675 / X最適化サイズ）:</p>
          <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-inner max-h-56 flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Playoff Prediction Preview" className="w-full h-auto object-contain" />
            ) : (
              <span className="py-12 text-xs text-slate-500">予想を選択するとプレビューが生成されます</span>
            )}
          </div>
        </div>

        {/* 操作アクションボタン */}
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <button onClick={openTwitterIntent} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-700 transition">
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
