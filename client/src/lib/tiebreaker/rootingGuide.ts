import { NFL_TEAMS } from "./nflTeams";
import { calculateAllStandings } from "./playoffEngine";
import { RootingRecommendation, ScheduledGame } from "./types";

/**
 * カンファレンス順位（#1〜#16）における指定チームのシード順位番号を取得
 */
function getTeamSeedNumber(
  standings: ReturnType<typeof calculateAllStandings>,
  teamCode: string,
  conf: "AFC" | "NFC"
): number {
  const confStandings = standings[conf];
  const allInConf = [
    ...confStandings.divisionWinners,
    ...confStandings.wildCards,
    ...confStandings.inTheHunt,
  ];
  const target = allInConf.find((s) => s.team === teamCode);
  return target ? target.seed : 16;
}

/**
 * 指定チームの視点から、該当週の他試合で「どちらが勝つべきか」をシミュレーションして判定
 */
export function generateRootingGuide(
  targetTeamCode: string,
  allGames: ScheduledGame[],
  targetWeek: number
): RootingRecommendation[] {
  const targetInfo = NFL_TEAMS[targetTeamCode];
  if (!targetInfo) return [];

  const weekGames = allGames.filter((g) => g.week === targetWeek);
  const recommendations: RootingRecommendation[] = [];

  for (const game of weekGames) {
    // 1. 自チームが関わる試合の場合
    if (game.homeTeam === targetTeamCode || game.awayTeam === targetTeamCode) {
      const isHome = game.homeTeam === targetTeamCode;
      const opponent = isHome ? game.awayTeam : game.homeTeam;
      const oppName = NFL_TEAMS[opponent]?.name ?? opponent;
      recommendations.push({
        gameId: game.id,
        week: game.week,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        preferredWinner: isHome ? "home" : "away",
        importance: "CRITICAL",
        reasonJa: `直接対決（vs ${oppName}）。自チームの勝利が最優先です。`,
      });
      continue;
    }

    const homeInfo = NFL_TEAMS[game.homeTeam];
    const awayInfo = NFL_TEAMS[game.awayTeam];
    if (!homeInfo || !awayInfo) continue;

    // 2. 他試合の勝敗シミュレーション
    // パターンA: ホーム勝利の場合
    const hypoHomeGames = allGames.map((g) =>
      g.id === game.id ? { ...g, outcome: "home" as const } : g
    );
    const standingsIfHomeWins = calculateAllStandings(hypoHomeGames);
    const seedIfHomeWins = getTeamSeedNumber(
      standingsIfHomeWins,
      targetTeamCode,
      targetInfo.conference
    );

    // パターンB: アウェー勝利の場合
    const hypoAwayGames = allGames.map((g) =>
      g.id === game.id ? { ...g, outcome: "away" as const } : g
    );
    const standingsIfAwayWins = calculateAllStandings(hypoAwayGames);
    const seedIfAwayWins = getTeamSeedNumber(
      standingsIfAwayWins,
      targetTeamCode,
      targetInfo.conference
    );

    // 3. シード順位への直接影響がある場合の評価
    if (seedIfHomeWins !== seedIfAwayWins) {
      const preferred = seedIfHomeWins < seedIfAwayWins ? "home" : "away";
      const winnerName = preferred === "home" ? homeInfo.name : awayInfo.name;
      const loserName = preferred === "home" ? awayInfo.name : homeInfo.name;
      const betterSeed = Math.min(seedIfHomeWins, seedIfAwayWins);
      const worseSeed = Math.max(seedIfHomeWins, seedIfAwayWins);

      // プレイオフ進出圏内（#7以内）と圏外（#8以下）の境界を跨ぐ場合は最重要
      const isPlayoffBoundary =
        (betterSeed <= 7 && worseSeed >= 8) || betterSeed === 1;

      recommendations.push({
        gameId: game.id,
        week: game.week,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        preferredWinner: preferred,
        importance: isPlayoffBoundary ? "CRITICAL" : "HIGH",
        reasonJa: `${winnerName}が勝利（${loserName}が敗戦）すると、シード順位が #${betterSeed} へ浮上（相手勝利時は #${worseSeed}）します。`,
      });
      continue;
    }

    // 4. シード順位に即時変動がない場合のタイブレーカー・ライバル動向評価
    const isHomeDivRival = homeInfo.division === targetInfo.division;
    const isAwayDivRival = awayInfo.division === targetInfo.division;

    // 地区ライバルが直接対戦する場合
    if (isHomeDivRival && isAwayDivRival) {
      recommendations.push({
        gameId: game.id,
        week: game.week,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        preferredWinner: "home",
        importance: "HIGH",
        reasonJa: `地区内の直接対決。地区優勝争いで下位に位置するチームの勝利（または共倒れ・星の潰し合い）が望まれます。`,
      });
      continue;
    }

    // 一方のみが同地区ライバルの場合（地区ライバルの敗戦が最優先）
    if (isHomeDivRival || isAwayDivRival) {
      const preferred = isHomeDivRival ? "away" : "home";
      const rivalName = isHomeDivRival ? homeInfo.name : awayInfo.name;
      recommendations.push({
        gameId: game.id,
        week: game.week,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        preferredWinner: preferred,
        importance: "HIGH",
        reasonJa: `地区優勝争いのライバルである${rivalName}の敗戦が有利に働きます。`,
      });
      continue;
    }

    // カンファレンス内ライバル vs 別カンファレンスの場合（別カンファレンスの勝利が望ましい）
    const isHomeConf = homeInfo.conference === targetInfo.conference;
    const isAwayConf = awayInfo.conference === targetInfo.conference;

    if (isHomeConf && !isAwayConf) {
      recommendations.push({
        gameId: game.id,
        week: game.week,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        preferredWinner: "away",
        importance: "MEDIUM",
        reasonJa: `ワイルドカード争いのライバル${homeInfo.name}が別カンファレンスに敗れることで、カンファレンス内勝率差を広げられます。`,
      });
      continue;
    }

    if (!isHomeConf && isAwayConf) {
      recommendations.push({
        gameId: game.id,
        week: game.week,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        preferredWinner: "home",
        importance: "MEDIUM",
        reasonJa: `ワイルドカード争いのライバル${awayInfo.name}が別カンファレンスに敗れることで、カンファレンス内勝率差を広げられます。`,
      });
      continue;
    }

    // どちらも同一カンファレンスの場合
    if (isHomeConf && isAwayConf) {
      recommendations.push({
        gameId: game.id,
        week: game.week,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        preferredWinner: "home",
        importance: "LOW",
        reasonJa: `カンファレンス内の他カード。より勝率の低い側のアップセットにより、上位争いの混戦化が期待できます。`,
      });
      continue;
    }

    // 両チームとも別カンファレンス（影響極小）
    recommendations.push({
      gameId: game.id,
      week: game.week,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      preferredWinner: "home",
      importance: "LOW",
      reasonJa: `別カンファレンス同士の対戦。自チームの順位やタイブレーカーへの直接的な影響は軽微です。`,
    });
  }

  // 重要度順（CRITICAL ➔ HIGH ➔ MEDIUM ➔ LOW）にソート
  const priorityOrder: Record<string, number> = {
    CRITICAL: 1,
    HIGH: 2,
    MEDIUM: 3,
    LOW: 4,
  };

  return recommendations.sort(
    (a, b) => priorityOrder[a.importance] - priorityOrder[b.importance]
  );
}
