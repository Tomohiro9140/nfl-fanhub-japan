import { ScheduledGame, TeamRecord, TiebreakerExplanation } from "./types";

function calculateWinPct(wins: number, losses: number, ties: number): number {
  const total = wins + losses + ties;
  return total === 0 ? 0 : (wins + ties * 0.5) / total;
}

/**
 * 全タイブレーカー対象チームに共通する対戦相手（コモン・オポーネント）での勝率を算出
 */
function getCommonOpponentsWinPct(
  teams: TeamRecord[],
  allGames: ScheduledGame[]
): Map<string, { winPct: number; played: number }> {
  const teamCodes = new Set(teams.map((t) => t.team));
  const opponentsByTeam = new Map<string, Set<string>>();

  for (const t of teams) {
    opponentsByTeam.set(t.team, new Set<string>());
  }

  // 確定済みの対戦相手をリスト化（自身および同タイブレーク内のチームは除外）
  for (const g of allGames) {
    if (!g.outcome) continue;
    if (opponentsByTeam.has(g.homeTeam) && !teamCodes.has(g.awayTeam)) {
      opponentsByTeam.get(g.homeTeam)!.add(g.awayTeam);
    }
    if (opponentsByTeam.has(g.awayTeam) && !teamCodes.has(g.homeTeam)) {
      opponentsByTeam.get(g.awayTeam)!.add(g.homeTeam);
    }
  }

  // 全チームが対戦している相手のみを抽出
  const commonOpponents = new Set<string>();
  const firstTeamOpponents = opponentsByTeam.get(teams[0].team) ?? new Set();
  for (const opp of firstTeamOpponents) {
    if (teams.every((t) => opponentsByTeam.get(t.team)?.has(opp))) {
      commonOpponents.add(opp);
    }
  }

  const result = new Map<string, { winPct: number; played: number }>();
  for (const t of teams) {
    let w = 0;
    let l = 0;
    let ties = 0;
    for (const g of allGames) {
      if (!g.outcome) continue;
      if (g.homeTeam === t.team && commonOpponents.has(g.awayTeam)) {
        if (g.outcome === "home") w++;
        else if (g.outcome === "away") l++;
        else ties++;
      } else if (g.awayTeam === t.team && commonOpponents.has(g.homeTeam)) {
        if (g.outcome === "away") w++;
        else if (g.outcome === "home") l++;
        else ties++;
      }
    }
    result.set(t.team, { winPct: calculateWinPct(w, l, ties), played: w + l + ties });
  }

  return result;
}

/**
 * 2チーム間の地区タイブレーカー解決
 */
function breakTwoTeamDivisionTie(
  teamA: TeamRecord,
  teamB: TeamRecord,
  allGames: ScheduledGame[]
): { winner: TeamRecord; loser: TeamRecord; explanation: TiebreakerExplanation } {
  // Step 1: 直接対決 (Head-to-head)
  const aWinsVsB = teamA.headToHeadWins[teamB.team] ?? 0;
  const bWinsVsA = teamB.headToHeadWins[teamA.team] ?? 0;
  if (aWinsVsB !== bWinsVsA) {
    const winner = aWinsVsB > bWinsVsA ? teamA : teamB;
    const loser = aWinsVsB > bWinsVsA ? teamB : teamA;
    const wWins = aWinsVsB > bWinsVsA ? aWinsVsB : bWinsVsA;
    const lWins = aWinsVsB > bWinsVsA ? bWinsVsA : aWinsVsB;
    return {
      winner,
      loser,
      explanation: {
        step: "HEAD_TO_HEAD",
        stepNameJa: "直接対決の勝率",
        reasonJa: `${winner.name}が直接対決（${wWins}勝${lWins}敗）で勝ち越しているため上位`,
        teamsCompared: [teamA.team, teamB.team],
        winnerTeam: winner.team,
        eliminatedTeams: [loser.team],
      },
    };
  }

  // Step 2: 地区内勝率 (Division Record)
  if (Math.abs(teamA.divWinPct - teamB.divWinPct) > 0.0001) {
    const winner = teamA.divWinPct > teamB.divWinPct ? teamA : teamB;
    const loser = teamA.divWinPct > teamB.divWinPct ? teamB : teamA;
    return {
      winner,
      loser,
      explanation: {
        step: "DIVISION_RECORD",
        stepNameJa: "地区内勝率",
        reasonJa: `${winner.name}の地区内勝率（${(winner.divWinPct * 100).toFixed(1)}%）が${loser.name}（${(loser.divWinPct * 100).toFixed(1)}%）を上回っているため上位`,
        teamsCompared: [teamA.team, teamB.team],
        winnerTeam: winner.team,
        eliminatedTeams: [loser.team],
      },
    };
  }

  // Step 3: 共通対戦相手勝率 (Common Games)
  const commonMap = getCommonOpponentsWinPct([teamA, teamB], allGames);
  const aCommon = commonMap.get(teamA.team)!;
  const bCommon = commonMap.get(teamB.team)!;
  if (aCommon.played > 0 && Math.abs(aCommon.winPct - bCommon.winPct) > 0.0001) {
    const winner = aCommon.winPct > bCommon.winPct ? teamA : teamB;
    const loser = aCommon.winPct > bCommon.winPct ? teamB : teamA;
    return {
      winner,
      loser,
      explanation: {
        step: "COMMON_GAMES",
        stepNameJa: "共通対戦相手での勝率",
        reasonJa: `共通対戦相手に対する勝率で${winner.name}（${(Math.max(aCommon.winPct, bCommon.winPct) * 100).toFixed(1)}%）が上位`,
        teamsCompared: [teamA.team, teamB.team],
        winnerTeam: winner.team,
        eliminatedTeams: [loser.team],
      },
    };
  }

  // Step 4: カンファレンス内勝率 (Conference Record)
  if (Math.abs(teamA.confWinPct - teamB.confWinPct) > 0.0001) {
    const winner = teamA.confWinPct > teamB.confWinPct ? teamA : teamB;
    const loser = teamA.confWinPct > teamB.confWinPct ? teamB : teamA;
    return {
      winner,
      loser,
      explanation: {
        step: "CONFERENCE_RECORD",
        stepNameJa: "カンファレンス内勝率",
        reasonJa: `${winner.name}のカンファレンス勝率（${(winner.confWinPct * 100).toFixed(1)}%）が${loser.name}（${(loser.confWinPct * 100).toFixed(1)}%）を上回っているため上位`,
        teamsCompared: [teamA.team, teamB.team],
        winnerTeam: winner.team,
        eliminatedTeams: [loser.team],
      },
    };
  }

  // Step 5: 勝利相手勝率 (Strength of Victory: SOV)
  if (Math.abs(teamA.sov - teamB.sov) > 0.0001) {
    const winner = teamA.sov > teamB.sov ? teamA : teamB;
    const loser = teamA.sov > teamB.sov ? teamB : teamA;
    return {
      winner,
      loser,
      explanation: {
        step: "STRENGTH_OF_VICTORY",
        stepNameJa: "勝利相手勝率 (SOV)",
        reasonJa: `勝利した対戦相手の合計勝率（SOV）で${winner.name}（${(winner.sov * 100).toFixed(1)}%）が${loser.name}（${(loser.sov * 100).toFixed(1)}%）を上回るため`,
        teamsCompared: [teamA.team, teamB.team],
        winnerTeam: winner.team,
        eliminatedTeams: [loser.team],
      },
    };
  }

  // Step 6: 対戦相手勝率 (Strength of Schedule: SOS)
  if (Math.abs(teamA.sos - teamB.sos) > 0.0001) {
    const winner = teamA.sos > teamB.sos ? teamA : teamB;
    const loser = teamA.sos > teamB.sos ? teamB : teamA;
    return {
      winner,
      loser,
      explanation: {
        step: "STRENGTH_OF_SCHEDULE",
        stepNameJa: "対戦相手勝率 (SOS)",
        reasonJa: `全対戦相手の合計勝率（SOS）で${winner.name}（${(winner.sos * 100).toFixed(1)}%）が${loser.name}（${(loser.sos * 100).toFixed(1)}%）を上回るため`,
        teamsCompared: [teamA.team, teamB.team],
        winnerTeam: winner.team,
        eliminatedTeams: [loser.team],
      },
    };
  }

  // Step 7: 総得失点差 (Point Differential)
  const winner = teamA.pointDiff >= teamB.pointDiff ? teamA : teamB;
  const loser = teamA.pointDiff >= teamB.pointDiff ? teamB : teamA;
  return {
    winner,
    loser,
    explanation: {
      step: "TOTAL_POINT_DIFF",
      stepNameJa: "総得失点差",
      reasonJa: `得失点差で${winner.name}（${winner.pointDiff > 0 ? `+${winner.pointDiff}` : winner.pointDiff}）が上位`,
      teamsCompared: [teamA.team, teamB.team],
      winnerTeam: winner.team,
      eliminatedTeams: [loser.team],
    },
  };
}

/**
 * 3チーム以上の地区タイブレーカー解決（1チーム選出後、残りでStep 1からリセット再評価）
 */
export function breakDivisionTie(
  tiedTeams: TeamRecord[],
  allGames: ScheduledGame[]
): { ranked: TeamRecord[]; explanations: TiebreakerExplanation[] } {
  if (tiedTeams.length <= 1) return { ranked: tiedTeams, explanations: [] };
  if (tiedTeams.length === 2) {
    const res = breakTwoTeamDivisionTie(tiedTeams[0], tiedTeams[1], allGames);
    return { ranked: [res.winner, res.loser], explanations: [res.explanation] };
  }

  const explanations: TiebreakerExplanation[] = [];
  let remaining = [...tiedTeams];
  const finalRanked: TeamRecord[] = [];

  while (remaining.length > 2) {
    // Step 1: 直接対決総当り勝率
    const h2hMap = new Map<string, { wins: number; total: number; pct: number }>();
    const teamSet = new Set(remaining.map((t) => t.team));

    for (const t of remaining) {
      let w = 0;
      let total = 0;
      for (const opp of remaining) {
        if (t.team === opp.team) continue;
        const wins = t.headToHeadWins[opp.team] ?? 0;
        const losses = t.headToHeadLosses[opp.team] ?? 0;
        const ties = t.headToHeadTies[opp.team] ?? 0;
        w += wins + ties * 0.5;
        total += wins + losses + ties;
      }
      h2hMap.set(t.team, { wins: w, total, pct: total > 0 ? w / total : 0 });
    }

    const allPlayed = remaining.every((t) => (h2hMap.get(t.team)?.total ?? 0) > 0);
    if (allPlayed) {
      const bestH2H = Math.max(...remaining.map((t) => h2hMap.get(t.team)!.pct));
      const topTeams = remaining.filter((t) => Math.abs(h2hMap.get(t.team)!.pct - bestH2H) < 0.0001);
      if (topTeams.length === 1) {
        const winner = topTeams[0];
        explanations.push({
          step: "HEAD_TO_HEAD",
          stepNameJa: "直接対決勝率（3球団以上）",
          reasonJa: `同率球団間の直接対決勝率で${winner.name}が最上位`,
          teamsCompared: remaining.map((t) => t.team),
          winnerTeam: winner.team,
        });
        finalRanked.push(winner);
        remaining = remaining.filter((t) => t.team !== winner.team);
        continue; // NFL規程: 1球団決定後はStep 1からリセット
      }
    }

    // Step 2: 地区内勝率
    const bestDiv = Math.max(...remaining.map((t) => t.divWinPct));
    const topDivTeams = remaining.filter((t) => Math.abs(t.divWinPct - bestDiv) < 0.0001);
    if (topDivTeams.length === 1) {
      const winner = topDivTeams[0];
      explanations.push({
        step: "DIVISION_RECORD",
        stepNameJa: "地区内勝率",
        reasonJa: `地区内勝率で${winner.name}（${(winner.divWinPct * 100).toFixed(1)}%）が最上位`,
        teamsCompared: remaining.map((t) => t.team),
        winnerTeam: winner.team,
      });
      finalRanked.push(winner);
      remaining = remaining.filter((t) => t.team !== winner.team);
      continue;
    }

    // Step 3: カンファレンス勝率
    const bestConf = Math.max(...remaining.map((t) => t.confWinPct));
    const topConfTeams = remaining.filter((t) => Math.abs(t.confWinPct - bestConf) < 0.0001);
    if (topConfTeams.length === 1) {
      const winner = topConfTeams[0];
      explanations.push({
        step: "CONFERENCE_RECORD",
        stepNameJa: "カンファレンス勝率",
        reasonJa: `カンファレンス内勝率で${winner.name}（${(winner.confWinPct * 100).toFixed(1)}%）が最上位`,
        teamsCompared: remaining.map((t) => t.team),
        winnerTeam: winner.team,
      });
      finalRanked.push(winner);
      remaining = remaining.filter((t) => t.team !== winner.team);
      continue;
    }

    // Step 4: 得失点差によるフォールバック
    remaining.sort((a, b) => b.pointDiff - a.pointDiff);
    const topTeam = remaining[0];
    finalRanked.push(topTeam);
    remaining = remaining.slice(1);
  }

  // 残り2チームの判定
  if (remaining.length === 2) {
    const twoRes = breakTwoTeamDivisionTie(remaining[0], remaining[1], allGames);
    finalRanked.push(twoRes.winner, twoRes.loser);
    explanations.push(twoRes.explanation);
  } else if (remaining.length === 1) {
    finalRanked.push(remaining[0]);
  }

  return { ranked: finalRanked, explanations };
}

/**
 * 地区内の全4チームをタイブレーカー適用の上で1位〜4位に整列
 */
export function resolveDivisionStandings(
  divisionTeams: TeamRecord[],
  allGames: ScheduledGame[]
): { standings: TeamRecord[]; explanations: TiebreakerExplanation[] } {
  // 勝率で降順グループ分け
  const groups = new Map<number, TeamRecord[]>();
  for (const t of divisionTeams) {
    const roundedPct = Math.round(t.winPct * 10000) / 10000;
    if (!groups.has(roundedPct)) groups.set(roundedPct, []);
    groups.get(roundedPct)!.push(t);
  }

  const sortedPcts = Array.from(groups.keys()).sort((a, b) => b - a);
  const standings: TeamRecord[] = [];
  const explanations: TiebreakerExplanation[] = [];

  for (const pct of sortedPcts) {
    const tied = groups.get(pct)!;
    if (tied.length === 1) {
      standings.push(tied[0]);
    } else {
      const res = breakDivisionTie(tied, allGames);
      standings.push(...res.ranked);
      explanations.push(...res.explanations);
    }
  }

  return { standings, explanations };
}
