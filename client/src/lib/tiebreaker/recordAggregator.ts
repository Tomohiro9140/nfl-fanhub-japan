import { NFL_TEAMS } from "./nflTeams";
import { ScheduledGame, TeamRecord } from "./types";

function calculateWinPct(wins: number, losses: number, ties: number): number {
  const totalGames = wins + losses + ties;
  if (totalGames === 0) return 0;
  return (wins + ties * 0.5) / totalGames;
}

export function buildTeamRecords(games: ScheduledGame[]): Map<string, TeamRecord> {
  const records = new Map<string, TeamRecord>();

  // 1. 全32チームの初期化
  for (const [code, info] of Object.entries(NFL_TEAMS)) {
    records.set(code, {
      team: code,
      name: info.name,
      conference: info.conference,
      division: info.division,
      wins: 0,
      losses: 0,
      ties: 0,
      winPct: 0,
      divWins: 0,
      divLosses: 0,
      divTies: 0,
      divWinPct: 0,
      confWins: 0,
      confLosses: 0,
      confTies: 0,
      confWinPct: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointDiff: 0,
      sov: 0,
      sos: 0,
      headToHeadWins: {},
      headToHeadLosses: {},
      headToHeadTies: {},
    });
  }

  // 2. 確定済み・トグルされた試合結果の集計
  for (const game of games) {
    if (!game.outcome) continue;

    const home = records.get(game.homeTeam);
    const away = records.get(game.awayTeam);
    if (!home || !away) continue;

    const isDivisionGame = home.division === away.division;
    const isConferenceGame = home.conference === away.conference;

    if (game.outcome === "home") {
      home.wins += 1;
      away.losses += 1;

      home.headToHeadWins[away.team] = (home.headToHeadWins[away.team] ?? 0) + 1;
      away.headToHeadLosses[home.team] = (away.headToHeadLosses[home.team] ?? 0) + 1;

      if (isDivisionGame) {
        home.divWins += 1;
        away.divLosses += 1;
      }
      if (isConferenceGame) {
        home.confWins += 1;
        away.confLosses += 1;
      }
    } else if (game.outcome === "away") {
      away.wins += 1;
      home.losses += 1;

      away.headToHeadWins[home.team] = (away.headToHeadWins[home.team] ?? 0) + 1;
      home.headToHeadLosses[away.team] = (home.headToHeadLosses[away.team] ?? 0) + 1;

      if (isDivisionGame) {
        away.divWins += 1;
        home.divLosses += 1;
      }
      if (isConferenceGame) {
        away.confWins += 1;
        home.confLosses += 1;
      }
    } else if (game.outcome === "tie") {
      home.ties += 1;
      away.ties += 1;

      home.headToHeadTies[away.team] = (home.headToHeadTies[away.team] ?? 0) + 1;
      away.headToHeadTies[home.team] = (away.headToHeadTies[home.team] ?? 0) + 1;

      if (isDivisionGame) {
        home.divTies += 1;
        away.divTies += 1;
      }
      if (isConferenceGame) {
        home.confTies += 1;
        away.confTies += 1;
      }
    }
  }

  // 3. 勝率の計算
  for (const record of records.values()) {
    record.winPct = calculateWinPct(record.wins, record.losses, record.ties);
    record.divWinPct = calculateWinPct(record.divWins, record.divLosses, record.divTies);
    record.confWinPct = calculateWinPct(record.confWins, record.confLosses, record.confTies);
    record.pointDiff = record.pointsFor - record.pointsAgainst;
  }

  // 4. SOV (Strength of Victory) と SOS (Strength of Schedule) の算出
  for (const record of records.values()) {
    let defeatedOpponentsWins = 0;
    let defeatedOpponentsLosses = 0;
    let defeatedOpponentsTies = 0;

    let allOpponentsWins = 0;
    let allOpponentsLosses = 0;
    let allOpponentsTies = 0;

    for (const game of games) {
      const isHome = game.homeTeam === record.team;
      const isAway = game.awayTeam === record.team;
      if (!isHome && !isAway) continue;

      const oppTeamCode = isHome ? game.awayTeam : game.homeTeam;
      const oppRecord = records.get(oppTeamCode);
      if (!oppRecord) continue;

      // 対戦相手全員の集計（SOS）
      allOpponentsWins += oppRecord.wins;
      allOpponentsLosses += oppRecord.losses;
      allOpponentsTies += oppRecord.ties;

      // 勝利した対戦相手のみの集計（SOV）
      const wonThisGame = (isHome && game.outcome === "home") || (isAway && game.outcome === "away");
      if (wonThisGame) {
        defeatedOpponentsWins += oppRecord.wins;
        defeatedOpponentsLosses += oppRecord.losses;
        defeatedOpponentsTies += oppRecord.ties;
      }
    }

    record.sov = calculateWinPct(defeatedOpponentsWins, defeatedOpponentsLosses, defeatedOpponentsTies);
    record.sos = calculateWinPct(allOpponentsWins, allOpponentsLosses, allOpponentsTies);
  }

  return records;
}
