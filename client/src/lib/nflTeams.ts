/** NFL team directory used by the Gameday Field Notes favorite-team selector. */
export type TeamTone = "sea" | "gb" | "sf" | "kc" | "phi" | "dal" | "buf" | "mia";

export type FavoriteTeam = {
  code: string;
  name: string;
  conference: "AFC" | "NFC";
  division: "East" | "North" | "South" | "West";
  tone: TeamTone;
};

type TeamSeed = FavoriteTeam;

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

export const nflTeams: FavoriteTeam[] = teamSeeds;

export function getTeamByCode(code: string | null): FavoriteTeam | undefined {
  return nflTeams.find((team) => team.code === code);
}
