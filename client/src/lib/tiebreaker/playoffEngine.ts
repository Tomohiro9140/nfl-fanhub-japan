import { ALL_DIVISIONS, DIVISIONS } from "./nflTeams";
import { buildTeamRecords } from "./recordAggregator";
import { resolveDivisionStandings } from "./divisionTie";
import { seedDivisionWinners, seedWildCardsAndRemaining } from "./wildCardTie";
import {
  Conference,
  ConferenceStandings,
  Division,
  PlayoffSeed,
  ScheduledGame,
  TeamRecord,
  TiebreakerExplanation,
} from "./types";

export type FullStandings = {
  AFC: ConferenceStandings;
  NFC: ConferenceStandings;
  records: Map<string, TeamRecord>;
};

function toPlayoffSeed(
  team: TeamRecord,
  seed: number,
  isDivisionWinner: boolean,
  explanations: TiebreakerExplanation[]
): PlayoffSeed {
  // 当該チームに関連するタイブレーカー解説文のみをフィルタリング
  const teamExplanations = explanations.filter(
    (exp) => exp.winnerTeam === team.team || exp.teamsCompared.includes(team.team)
  );

  return {
    seed,
    team: team.team,
    teamName: team.name,
    division: team.division,
    conference: team.conference,
    record: {
      wins: team.wins,
      losses: team.losses,
      ties: team.ties,
    },
    isDivisionWinner,
    tiebreakerExplanations: teamExplanations.length > 0 ? teamExplanations : undefined,
  };
}

/**
 * 1つのカンファレンス（AFC または NFC）のシード順位（#1〜#16）を計算
 */
export function calculateConferenceStandings(
  conference: Conference,
  allGames: ScheduledGame[],
  allRecords?: Map<string, TeamRecord>
): ConferenceStandings {
  const records = allRecords ?? buildTeamRecords(allGames);

  // カンファレンスに属する地区を抽出
  const confDivisions = ALL_DIVISIONS.filter((div) => div.startsWith(conference));

  const divisionWinners: TeamRecord[] = [];
  const nonDivisionWinners: TeamRecord[] = [];
  const divisionExplanations: TiebreakerExplanation[] = [];

  // 各地区の1位〜4位を決定
  for (const div of confDivisions) {
    const teamCodes = DIVISIONS[div];
    const teamList = teamCodes.map((code) => records.get(code)!).filter(Boolean);

    const { standings, explanations } = resolveDivisionStandings(teamList, allGames);
    divisionExplanations.push(...explanations);

    divisionWinners.push(standings[0]);
    nonDivisionWinners.push(...standings.slice(1));
  }

  // 1. 地区優勝4チームをシード順（#1〜#4）にソート
  const divSeedResult = seedDivisionWinners(divisionWinners, allGames);
  const divSeeds: PlayoffSeed[] = divSeedResult.seeded.map((team, index) =>
    toPlayoffSeed(team, index + 1, true, [
      ...divisionExplanations,
      ...divSeedResult.explanations,
    ])
  );

  // 2. 残り12チームからワイルドカード枠（#5〜#7）および圏外（#8〜#16）を決定
  const wcSeedResult = seedWildCardsAndRemaining(nonDivisionWinners, allGames);
  const remainingSeeds: PlayoffSeed[] = wcSeedResult.seeded.map((team, index) =>
    toPlayoffSeed(team, index + 5, false, [
      ...divisionExplanations,
      ...wcSeedResult.explanations,
    ])
  );

  const wildCards = remainingSeeds.slice(0, 3);   // #5, #6, #7
  const inTheHunt = remainingSeeds.slice(3);      // #8〜#16

  return {
    conference,
    divisionWinners: divSeeds,
    wildCards,
    inTheHunt,
  };
}

/**
 * AFC / NFC 両カンファレンスの完全なプレイオフ順位を算出
 */
export function calculateAllStandings(allGames: ScheduledGame[]): FullStandings {
  const records = buildTeamRecords(allGames);
  return {
    AFC: calculateConferenceStandings("AFC", allGames, records),
    NFC: calculateConferenceStandings("NFC", allGames, records),
    records,
  };
}
