/** NFL team directory used by the Gameday Field Notes favorite-team selector. */
export type TeamTone = "sea" | "gb" | "sf" | "kc" | "phi" | "dal" | "buf" | "mia";

export type TeamStatus = {
  position: string;
  player: string;
  detail: string;
  status: string;
  statusClass: string;
};

export type FavoriteTeam = {
  code: string;
  name: string;
  conference: "AFC" | "NFC";
  division: "East" | "North" | "South" | "West";
  tone: TeamTone;
  opponent: string;
  opponentName: string;
  opponentTone: TeamTone;
  roster: TeamStatus[];
};

type TeamSeed = Omit<FavoriteTeam, "opponent" | "opponentName" | "opponentTone" | "roster">;

const teamSeeds: TeamSeed[] = [
  { code: "BUF", name: "Buffalo Bills", conference: "AFC", division: "East", tone: "buf" },
  { code: "MIA", name: "Miami Dolphins", conference: "AFC", division: "East", tone: "mia" },
  { code: "NE", name: "New England Patriots", conference: "AFC", division: "East", tone: "sea" },
  { code: "NYJ", name: "New York Jets", conference: "AFC", division: "East", tone: "phi" },
  { code: "BAL", name: "Baltimore Ravens", conference: "AFC", division: "North", tone: "sf" },
  { code: "CIN", name: "Cincinnati Bengals", conference: "AFC", division: "North", tone: "kc" },
  { code: "CLE", name: "Cleveland Browns", conference: "AFC", division: "North", tone: "mia" },
  { code: "PIT", name: "Pittsburgh Steelers", conference: "AFC", division: "North", tone: "gb" },
  { code: "HOU", name: "Houston Texans", conference: "AFC", division: "South", tone: "sea" },
  { code: "IND", name: "Indianapolis Colts", conference: "AFC", division: "South", tone: "dal" },
  { code: "JAX", name: "Jacksonville Jaguars", conference: "AFC", division: "South", tone: "mia" },
  { code: "TEN", name: "Tennessee Titans", conference: "AFC", division: "South", tone: "sea" },
  { code: "DEN", name: "Denver Broncos", conference: "AFC", division: "West", tone: "kc" },
  { code: "KC", name: "Kansas City Chiefs", conference: "AFC", division: "West", tone: "kc" },
  { code: "LAC", name: "Los Angeles Chargers", conference: "AFC", division: "West", tone: "dal" },
  { code: "LV", name: "Las Vegas Raiders", conference: "AFC", division: "West", tone: "sf" },
  { code: "DAL", name: "Dallas Cowboys", conference: "NFC", division: "East", tone: "dal" },
  { code: "NYG", name: "New York Giants", conference: "NFC", division: "East", tone: "sea" },
  { code: "PHI", name: "Philadelphia Eagles", conference: "NFC", division: "East", tone: "phi" },
  { code: "WAS", name: "Washington Commanders", conference: "NFC", division: "East", tone: "kc" },
  { code: "CHI", name: "Chicago Bears", conference: "NFC", division: "North", tone: "sf" },
  { code: "DET", name: "Detroit Lions", conference: "NFC", division: "North", tone: "mia" },
  { code: "GB", name: "Green Bay Packers", conference: "NFC", division: "North", tone: "gb" },
  { code: "MIN", name: "Minnesota Vikings", conference: "NFC", division: "North", tone: "sf" },
  { code: "ATL", name: "Atlanta Falcons", conference: "NFC", division: "South", tone: "kc" },
  { code: "CAR", name: "Carolina Panthers", conference: "NFC", division: "South", tone: "sea" },
  { code: "NO", name: "New Orleans Saints", conference: "NFC", division: "South", tone: "gb" },
  { code: "TB", name: "Tampa Bay Buccaneers", conference: "NFC", division: "South", tone: "kc" },
  { code: "ARI", name: "Arizona Cardinals", conference: "NFC", division: "West", tone: "kc" },
  { code: "LAR", name: "Los Angeles Rams", conference: "NFC", division: "West", tone: "dal" },
  { code: "SF", name: "San Francisco 49ers", conference: "NFC", division: "West", tone: "sf" },
  { code: "SEA", name: "Seattle Seahawks", conference: "NFC", division: "West", tone: "sea" },
];

const opponentCodes: Record<string, string> = {
  BUF: "MIA", MIA: "BUF", NE: "NYJ", NYJ: "NE", BAL: "CIN", CIN: "BAL", CLE: "PIT", PIT: "CLE",
  HOU: "IND", IND: "HOU", JAX: "TEN", TEN: "JAX", DEN: "LAC", LAC: "DEN", KC: "LV", LV: "KC",
  DAL: "PHI", PHI: "DAL", NYG: "WAS", WAS: "NYG", CHI: "GB", GB: "CHI", DET: "MIN", MIN: "DET",
  ATL: "NO", NO: "ATL", CAR: "TB", TB: "CAR", ARI: "LAR", LAR: "ARI", SF: "SEA", SEA: "SF",
};

function demoRoster(code: string): TeamStatus[] {
  return [
    { position: "QB", player: `${code} QB`, detail: "Practice report / DEMO", status: "ACTIVE", statusClass: "bg-[#e7f5dd] text-[#3f6d27]" },
    { position: "RB", player: `${code} RB`, detail: "Limited practice / DEMO", status: "WATCH", statusClass: "bg-[#fff0e9] text-[#c44719]" },
    { position: "CB", player: `${code} CB`, detail: "Roster report / DEMO", status: "TRACK", statusClass: "bg-[#e7ebf7] text-[#364d7c]" },
  ];
}

const teamsByCode = new Map(teamSeeds.map((team) => [team.code, team]));

export const nflTeams: FavoriteTeam[] = teamSeeds.map((team) => {
  const opponent = teamsByCode.get(opponentCodes[team.code]) ?? teamSeeds[0];
  return {
    ...team,
    opponent: opponent.code,
    opponentName: opponent.name,
    opponentTone: opponent.tone,
    roster: demoRoster(team.code),
  };
});

export function getTeamByCode(code: string | null): FavoriteTeam | undefined {
  return nflTeams.find((team) => team.code === code);
}
