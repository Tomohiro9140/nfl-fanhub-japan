// client/src/lib/draftOrder.ts
import { SimGame, SimulationPicks } from "./playoffPresets";

export interface TeamStandingData {
  teamCode: string;
  conference: "AFC" | "NFC";
  division: "East" | "North" | "South" | "West";
  wins: number;
  losses: number;
  ties: number;
  winPct: number;
  divisionWins: number;
  divisionLosses: number;
  divisionTies: number;
  divisionWinPct: number;
  confWins: number;
  confLosses: number;
  confTies: number;
  confWinPct: number;
}

export interface DraftPickItem {
  pickNumber: number; // 1 〜 18
  teamCode: string;
  record: string; // e.g. "4-13-0"
  winPct: number;
  sos: number; // Strength of Schedule (0.000〜1.000)
  tiebreakReason: string;
  conference: "AFC" | "NFC";
  division: string;
}

/**
 * 全チームのシーズン17試合の対戦相手の合計勝率（SOS）を算出する
 * ※同一ディビジョンなどで同一相手と2回対戦する場合は2試合分カウントされる（NFL公式仕様）
 */
export function calculateAllTeamsSOS(
  standings: Record<string, TeamStandingData>,
  allSeasonGames: SimGame[]
): Record<string, number> {
  const sosMap: Record<string, number> = {};

  for (const teamCode of Object.keys(standings)) {
    let opponentWins = 0;
    let opponentLosses = 0;
    let opponentTies = 0;

    // 自チームが出場する全試合を抽出
    const teamGames = allSeasonGames.filter(
      (g) => g.awayTeamCode === teamCode || g.homeTeamCode === teamCode
    );

    for (const g of teamGames) {
      const oppCode = g.awayTeamCode === teamCode ? g.homeTeamCode : g.awayTeamCode;
      const opp = standings[oppCode];
      if (opp) {
        opponentWins += opp.wins;
        opponentLosses += opp.losses;
        opponentTies += opp.ties;
      }
    }

    const totalOppGames = opponentWins + opponentLosses + opponentTies;
    if (totalOppGames > 0) {
      sosMap[teamCode] = (opponentWins + opponentTies * 0.5) / totalOppGames;
    } else {
      sosMap[teamCode] = 0.5;
    }
  }

  return sosMap;
}

/**
 * プレーオフ進出14チームを除く下位18チームを抽出し、
 * NFLドラフト・タイブレーク規定に沿って Pick #1〜#18 を決定する
 */
export function computeDraftOrder(
  allStandings: Record<string, TeamStandingData>,
  playoffTeamCodes: Set<string>, // AFC上位7 + NFC上位7 (計14チーム)
  allSeasonGames: SimGame[],
  simulationPicks: SimulationPicks
): DraftPickItem[] {
  // 1. プレーオフ進出チームを除外（非進出18チームを抽出）
  const nonPlayoffTeams = Object.values(allStandings).filter(
    (t) => !playoffTeamCodes.has(t.teamCode)
  );

  // 2. SOS（対戦相手勝率）を算出
  const sosMap = calculateAllTeamsSOS(allStandings, allSeasonGames);

  // 3. ソート処理（ドラフト順：弱い順）
  const sorted = [...nonPlayoffTeams].sort((a, b) => {
    // 基準 1: 全体勝率（低い方が上位）
    if (a.winPct !== b.winPct) {
      return a.winPct - b.winPct;
    }

    // 基準 2: SOS（低い＝弱い日程だったチームが上位指名権を獲得）
    const aSos = sosMap[a.teamCode] ?? 0.5;
    const bSos = sosMap[b.teamCode] ?? 0.5;
    if (Math.abs(aSos - bSos) >= 0.0001) {
      return aSos - bSos;
    }

    // 基準 3: 同一地区内の場合（地区内勝率の低い方を優先）
    if (a.conference === b.conference && a.division === b.division) {
      if (a.divisionWinPct !== b.divisionWinPct) {
        return a.divisionWinPct - b.divisionWinPct;
      }
    }

    // 基準 4: 同一カンファレンス内の場合（カンファレンス勝率の低い方を優先）
    if (a.conference === b.conference) {
      if (a.confWinPct !== b.confWinPct) {
        return a.confWinPct - b.confWinPct;
      }
    }

    // 基準 5: 直接対決の敗者を優先
    const h2hGames = allSeasonGames.filter(
      (g) =>
        (g.awayTeamCode === a.teamCode && g.homeTeamCode === b.teamCode) ||
        (g.awayTeamCode === b.teamCode && g.homeTeamCode === a.teamCode)
    );
    if (h2hGames.length > 0) {
      let aWins = 0;
      let bWins = 0;
      for (const g of h2hGames) {
        const winner = g.isFinished
          ? g.actualWinner
          : simulationPicks[g.id] ?? (g.homeTeamCode === a.teamCode ? "home" : "away");
        const winningTeam = winner === "home" ? g.homeTeamCode : g.awayTeamCode;
        if (winningTeam === a.teamCode) aWins++;
        if (winningTeam === b.teamCode) bWins++;
      }
      if (aWins !== bWins) {
        return aWins - bWins; // 勝利数が少ない（負けた）方を上位指名に
      }
    }

    return a.teamCode.localeCompare(b.teamCode);
  });

  // 4. タイブレーク理由の生成と Pick #1〜#18 の作成
  return sorted.slice(0, 18).map((t, idx) => {
    const pickNumber = idx + 1;
    const teamSos = sosMap[t.teamCode] ?? 0.5;
    let tiebreakReason = "全体勝率最下位";

    // 前後のチームと同率かチェックしてタイブレーク理由を付与
    const prev = sorted[idx - 1];
    const next = sorted[idx + 1];
    const isTiedWithAdjacent =
      (prev && prev.winPct === t.winPct) || (next && next.winPct === t.winPct);

    if (isTiedWithAdjacent) {
      const compareTarget = prev && prev.winPct === t.winPct ? prev : next;
      const otherSos = sosMap[compareTarget.teamCode] ?? 0.5;

      if (Math.abs(teamSos - otherSos) >= 0.0001) {
        tiebreakReason = `SOS差で優先 (.${Math.round(teamSos * 1000)} < .${Math.round(otherSos * 1000)})`;
      } else if (t.conference === compareTarget.conference && t.division === compareTarget.division) {
        tiebreakReason = "同率・同SOS・地区勝率差";
      } else if (t.conference === compareTarget.conference) {
        tiebreakReason = "同率・同SOS・カンファレンス勝率差";
      } else {
        tiebreakReason = "同率・直接対決結果により優先";
      }
    } else if (pickNumber > 1) {
      tiebreakReason = "全体勝率単独";
    }

    return {
      pickNumber,
      teamCode: t.teamCode,
      record: `${t.wins}-${t.losses}-${t.ties}`,
      winPct: t.winPct,
      sos: teamSos,
      tiebreakReason,
      conference: t.conference,
      division: `${t.conference} ${t.division}`,
    };
  });
}
