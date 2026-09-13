import { ScheduledGame, TeamRecord, TiebreakerExplanation } from "./types";
import { breakDivisionTie } from "./divisionTie";

function calculateWinPct(wins: number, losses: number, ties: number): number {
  const total = wins + losses + ties;
  return total === 0 ? 0 : (wins + ties * 0.5) / total;
}

/**
 * 複数チーム間の共通対戦相手勝率を計算（カンファレンスタイブレーカー用）
 */
function getCommonGamesWinPct(
  teams: TeamRecord[],
  allGames: ScheduledGame[]
): Map<string, { winPct: number; played: number }> {
  const teamCodes = new Set(teams.map((t) => t.team));
  const opponentsByTeam = new Map<string, Set<string>>();

  for (const t of teams) {
    opponentsByTeam.set(t.team, new Set<string>());
  }

  for (const g of allGames) {
    if (!g.outcome) continue;
    if (opponentsByTeam.has(g.homeTeam) && !teamCodes.has(g.awayTeam)) {
      opponentsByTeam.get(g.homeTeam)!.add(g.awayTeam);
    }
    if (opponentsByTeam.has(g.awayTeam) && !teamCodes.has(g.homeTeam)) {
      opponentsByTeam.get(g.awayTeam)!.add(g.homeTeam);
    }
  }

  const commonOpponents = new Set<string>();
  const firstOpponents = opponentsByTeam.get(teams[0].team) ?? new Set();
  for (const opp of firstOpponents) {
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
 * 2チーム間のカンファレンスタイブレーカー解決（地区が異なる場合）
 */
export function breakTwoTeamConferenceTie(
  teamA: TeamRecord,
  teamB: TeamRecord,
  allGames: ScheduledGame[]
): { winner: TeamRecord; loser: TeamRecord; explanation: TiebreakerExplanation } {
  // Step 1: 直接対決（対戦がある場合のみ）
  const aWins = teamA.headToHeadWins[teamB.team] ?? 0;
  const bWins = teamB.headToHeadWins[teamA.team] ?? 0;
  if (aWins > 0 || bWins > 0) {
    if (aWins !== bWins) {
      const winner = aWins > bWins ? teamA : teamB;
      const loser = aWins > bWins ? teamB : teamA;
      return {
        winner,
        loser,
        explanation: {
          step: "HEAD_TO_HEAD",
          stepNameJa: "直接対決の勝率",
          reasonJa: `${winner.name}が直接対決（${Math.max(aWins, bWins)}勝${Math.min(aWins, bWins)}敗）で勝利しているため上位`,
          teamsCompared: [teamA.team, teamB.team],
          winnerTeam: winner.team,
          eliminatedTeams: [loser.team],
        },
      };
    }
  }

  // Step 2: カンファレンス内勝率
  if (Math.abs(teamA.confWinPct - teamB.confWinPct) > 0.0001) {
    const winner = teamA.confWinPct > teamB.confWinPct ? teamA : teamB;
    const loser = teamA.confWinPct > teamB.confWinPct ? teamB : teamA;
    return {
      winner,
      loser,
      explanation: {
        step: "CONFERENCE_RECORD",
        stepNameJa: "カンファレンス内勝率",
        reasonJa: `カンファレンス内勝率で${winner.name}（${(winner.confWinPct * 100).toFixed(1)}%）が${loser.name}（${(loser.confWinPct * 100).toFixed(1)}%）を上回るため`,
        teamsCompared: [teamA.team, teamB.team],
        winnerTeam: winner.team,
        eliminatedTeams: [loser.team],
      },
    };
  }

  // Step 3: 共通対戦相手勝率（最低4試合以上）
  const commonMap = getCommonGamesWinPct([teamA, teamB], allGames);
  const aCommon = commonMap.get(teamA.team)!;
  const bCommon = commonMap.get(teamB.team)!;
  if (aCommon.played >= 4 && bCommon.played >= 4 && Math.abs(aCommon.winPct - bCommon.winPct) > 0.0001) {
    const winner = aCommon.winPct > bCommon.winPct ? teamA : teamB;
    const loser = aCommon.winPct > bCommon.winPct ? teamB : teamA;
    return {
      winner,
      loser,
      explanation: {
        step: "COMMON_GAMES",
        stepNameJa: "共通対戦相手勝率 (4試合以上)",
        reasonJa: `共通対戦相手に対する勝率で${winner.name}（${(Math.max(aCommon.winPct, bCommon.winPct) * 100).toFixed(1)}%）が上位`,
        teamsCompared: [teamA.team, teamB.team],
        winnerTeam: winner.team,
        eliminatedTeams: [loser.team],
      },
    };
  }

  // Step 4: 勝利相手勝率 (SOV)
  if (Math.abs(teamA.sov - teamB.sov) > 0.0001) {
    const winner = teamA.sov > teamB.sov ? teamA : teamB;
    const loser = teamA.sov > teamB.sov ? teamB : teamA;
    return {
      winner,
      loser,
      explanation: {
        step: "STRENGTH_OF_VICTORY",
        stepNameJa: "勝利相手勝率 (SOV)",
        reasonJa: `勝利相手勝率（SOV）で${winner.name}（${(winner.sov * 100).toFixed(1)}%）が${loser.name}（${(loser.sov * 100).toFixed(1)}%）を上回るため`,
        teamsCompared: [teamA.team, teamB.team],
        winnerTeam: winner.team,
        eliminatedTeams: [loser.team],
      },
    };
  }

  // Step 5: 対戦相手勝率 (SOS)
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

  // Step 6: 得失点差
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
 * 3チーム以上のカンファレンスタイブレーカーから最上位1チームを選出
 */
function pickTopFromMultiConferenceTie(
  tiedTeams: TeamRecord[],
  allGames: ScheduledGame[]
): { winner: TeamRecord; explanation: TiebreakerExplanation } {
  // Step 1: 直接対決スイープ（全勝チーム、または全敗チームの除外）
  for (const t of tiedTeams) {
    const others = tiedTeams.filter((o) => o.team !== t.team);
    const beatAll = others.every((o) => (t.headToHeadWins[o.team] ?? 0) > 0 && (t.headToHeadLosses[o.team] ?? 0) === 0);
    if (beatAll) {
      return {
        winner: t,
        explanation: {
          step: "HEAD_TO_HEAD",
          stepNameJa: "直接対決スイープ（全勝）",
          reasonJa: `${t.name}が同率の他全チームとの直接対決に全勝しているため最上位`,
          teamsCompared: tiedTeams.map((item) => item.team),
          winnerTeam: t.team,
        },
      };
    }
  }

  // Step 2: カンファレンス勝率
  const bestConf = Math.max(...tiedTeams.map((t) => t.confWinPct));
  const topConfTeams = tiedTeams.filter((t) => Math.abs(t.confWinPct - bestConf) < 0.0001);
  if (topConfTeams.length === 1) {
    const winner = topConfTeams[0];
    return {
      winner,
      explanation: {
        step: "CONFERENCE_RECORD",
        stepNameJa: "カンファレンス勝率",
        reasonJa: `カンファレンス勝率で${winner.name}（${(winner.confWinPct * 100).toFixed(1)}%）が最上位`,
        teamsCompared: tiedTeams.map((item) => item.team),
        winnerTeam: winner.team,
      },
    };
  }

  // Step 3: SOV
  const bestSov = Math.max(...tiedTeams.map((t) => t.sov));
  const topSovTeams = tiedTeams.filter((t) => Math.abs(t.sov - bestSov) < 0.0001);
  if (topSovTeams.length === 1) {
    const winner = topSovTeams[0];
    return {
      winner,
      explanation: {
        step: "STRENGTH_OF_VICTORY",
        stepNameJa: "勝利相手勝率 (SOV)",
        reasonJa: `勝利相手勝率（SOV）で${winner.name}（${(winner.sov * 100).toFixed(1)}%）が最上位`,
        teamsCompared: tiedTeams.map((item) => item.team),
        winnerTeam: winner.team,
      },
    };
  }

  // Step 4: SOS
  const bestSos = Math.max(...tiedTeams.map((t) => t.sos));
  const topSosTeams = tiedTeams.filter((t) => Math.abs(t.sos - bestSos) < 0.0001);
  if (topSosTeams.length === 1) {
    const winner = topSosTeams[0];
    return {
      winner,
      explanation: {
        step: "STRENGTH_OF_SCHEDULE",
        stepNameJa: "対戦相手勝率 (SOS)",
        reasonJa: `対戦相手勝率（SOS）で${winner.name}（${(winner.sos * 100).toFixed(1)}%）が最上位`,
        teamsCompared: tiedTeams.map((item) => item.team),
        winnerTeam: winner.team,
      },
    };
  }

  // フォールバック: 得失点差
  const sorted = [...tiedTeams].sort((a, b) => b.pointDiff - a.pointDiff);
  const winner = sorted[0];
  return {
    winner,
    explanation: {
      step: "TOTAL_POINT_DIFF",
      stepNameJa: "総得失点差",
      reasonJa: `総得失点差で${winner.name}（${winner.pointDiff > 0 ? `+${winner.pointDiff}` : winner.pointDiff}）が最上位`,
      teamsCompared: tiedTeams.map((item) => item.team),
      winnerTeam: winner.team,
    },
  };
}

/**
 * 地区優勝4チーム間のシード順位（#1〜#4）を決定
 */
export function seedDivisionWinners(
  divisionWinners: TeamRecord[],
  allGames: ScheduledGame[]
): { seeded: TeamRecord[]; explanations: TiebreakerExplanation[] } {
  const explanations: TiebreakerExplanation[] = [];
  const seeded: TeamRecord[] = [];
  let pool = [...divisionWinners];

  while (pool.length > 0) {
    // 勝率の最大値を算出
    const maxWinPct = Math.max(...pool.map((t) => t.winPct));
    const tied = pool.filter((t) => Math.abs(t.winPct - maxWinPct) < 0.0001);

    if (tied.length === 1) {
      seeded.push(tied[0]);
      pool = pool.filter((t) => t.team !== tied[0].team);
    } else if (tied.length === 2) {
      const res = breakTwoTeamConferenceTie(tied[0], tied[1], allGames);
      seeded.push(res.winner);
      explanations.push(res.explanation);
      pool = pool.filter((t) => t.team !== res.winner.team);
    } else {
      const res = pickTopFromMultiConferenceTie(tied, allGames);
      seeded.push(res.winner);
      explanations.push(res.explanation);
      pool = pool.filter((t) => t.team !== res.winner.team);
    }
  }

  return { seeded, explanations };
}

/**
 * ワイルドカード枠および圏外チーム（#5〜#16）を決定
 * ※NFL公式ルール: 同一地区から複数チームがタイになった場合、まず地区タイブレーカーを適用して
 * 各地区の「最上位1チーム」のみをカンファレンス比較に進出させ、1枠決定ごとにリセットする
 */
export function seedWildCardsAndRemaining(
  candidateTeams: TeamRecord[],
  allGames: ScheduledGame[]
): { seeded: TeamRecord[]; explanations: TiebreakerExplanation[] } {
  const explanations: TiebreakerExplanation[] = [];
  const seeded: TeamRecord[] = [];
  let pool = [...candidateTeams];

  while (pool.length > 0) {
    const maxWinPct = Math.max(...pool.map((t) => t.winPct));
    const tied = pool.filter((t) => Math.abs(t.winPct - maxWinPct) < 0.0001);

    if (tied.length === 1) {
      seeded.push(tied[0]);
      pool = pool.filter((t) => t.team !== tied[0].team);
      continue;
    }

    // 地区ごとに最高勝率の1チームのみを選出
    const divisionGroups = new Map<string, TeamRecord[]>();
    for (const t of tied) {
      if (!divisionGroups.has(t.division)) divisionGroups.set(t.division, []);
      divisionGroups.get(t.division)!.push(t);
    }

    const divisionReps: TeamRecord[] = [];
    for (const [div, teams] of Array.from(divisionGroups.entries())) {
      if (teams.length === 1) {
        divisionReps.push(teams[0]);
      } else {
        const divRes = breakDivisionTie(teams, allGames);
        divisionReps.push(divRes.ranked[0]);
        explanations.push(...divRes.explanations);
      }
    }

    // 地区代表同士での比較
    let winner: TeamRecord;
    if (divisionReps.length === 1) {
      winner = divisionReps[0];
    } else if (divisionReps.length === 2) {
      const confRes = breakTwoTeamConferenceTie(divisionReps[0], divisionReps[1], allGames);
      winner = confRes.winner;
      explanations.push(confRes.explanation);
    } else {
      const multiRes = pickTopFromMultiConferenceTie(divisionReps, allGames);
      winner = multiRes.winner;
      explanations.push(multiRes.explanation);
    }

    seeded.push(winner);
    pool = pool.filter((t) => t.team !== winner.team);
  }

  return { seeded, explanations };
}
