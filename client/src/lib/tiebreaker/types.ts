export type Conference = "AFC" | "NFC";

export type Division =
  | "AFC East"
  | "AFC North"
  | "AFC South"
  | "AFC West"
  | "NFC East"
  | "NFC North"
  | "NFC South"
  | "NFC West";

export type GameOutcome = "home" | "away" | "tie";

export type ScheduledGame = {
  id: number;
  season: number;
  week: number;
  homeTeam: string;
  awayTeam: string;
  outcome?: GameOutcome;
  isFinished: boolean;
};

export type TeamRecord = {
  team: string;
  name: string;
  conference: Conference;
  division: Division;
  wins: number;
  losses: number;
  ties: number;
  winPct: number;
  divWins: number;
  divLosses: number;
  divTies: number;
  divWinPct: number;
  confWins: number;
  confLosses: number;
  confTies: number;
  confWinPct: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  sov: number; // Strength of Victory (勝利相手の総勝率)
  sos: number; // Strength of Schedule (全対戦相手の総勝率)
  headToHeadWins: Record<string, number>;
  headToHeadLosses: Record<string, number>;
  headToHeadTies: Record<string, number>;
};

export type TiebreakerStep =
  | "HEAD_TO_HEAD"
  | "DIVISION_RECORD"
  | "COMMON_GAMES"
  | "CONFERENCE_RECORD"
  | "STRENGTH_OF_VICTORY"
  | "STRENGTH_OF_SCHEDULE"
  | "CONFERENCE_POINT_DIFF"
  | "TOTAL_POINT_DIFF"
  | "COIN_TOSS";

export type TiebreakerExplanation = {
  step: TiebreakerStep;
  stepNameJa: string;
  reasonJa: string;
  teamsCompared: string[];
  winnerTeam?: string;
  eliminatedTeams?: string[];
};

export type PlayoffSeed = {
  seed: number;
  team: string;
  teamName: string;
  division: Division;
  conference: Conference;
  record: { wins: number; losses: number; ties: number };
  isDivisionWinner: boolean;
  tiebreakerExplanations?: TiebreakerExplanation[];
};

export type ConferenceStandings = {
  conference: Conference;
  divisionWinners: PlayoffSeed[]; // #1〜#4
  wildCards: PlayoffSeed[];       // #5〜#7
  inTheHunt: PlayoffSeed[];       // #8〜#16 (圏外)
};

export type RootingRecommendation = {
  gameId: number;
  week: number;
  homeTeam: string;
  awayTeam: string;
  preferredWinner: "home" | "away";
  importance: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  reasonJa: string;
};
