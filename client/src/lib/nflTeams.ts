/** NFL team directory used by the Gameday Field Notes favorite-team selector. */
export type TeamBrand = {
  primary: string;
  accent: string;
  onPrimary: string;
};

export type FavoriteTeam = {
  code: string;
  name: string;
  conference: "AFC" | "NFC";
  division: "East" | "North" | "South" | "West";
  brand: TeamBrand;
};

type TeamSeed = FavoriteTeam;

const teamSeeds: TeamSeed[] = [
  { code: "BUF", name: "Buffalo Bills", conference: "AFC", division: "East", brand: { primary: "#00338D", accent: "#C60C30", onPrimary: "#FFFFFF" } },
  { code: "MIA", name: "Miami Dolphins", conference: "AFC", division: "East", brand: { primary: "#008E97", accent: "#FC4C02", onPrimary: "#FFFFFF" } },
  { code: "NE", name: "New England Patriots", conference: "AFC", division: "East", brand: { primary: "#002244", accent: "#C60C30", onPrimary: "#FFFFFF" } },
  { code: "NYJ", name: "New York Jets", conference: "AFC", division: "East", brand: { primary: "#125740", accent: "#FFFFFF", onPrimary: "#FFFFFF" } },
  { code: "BAL", name: "Baltimore Ravens", conference: "AFC", division: "North", brand: { primary: "#241773", accent: "#9E7C0C", onPrimary: "#FFFFFF" } },
  { code: "CIN", name: "Cincinnati Bengals", conference: "AFC", division: "North", brand: { primary: "#FB4F14", accent: "#101820", onPrimary: "#101820" } },
  { code: "CLE", name: "Cleveland Browns", conference: "AFC", division: "North", brand: { primary: "#311D00", accent: "#FF3C00", onPrimary: "#FFFFFF" } },
  { code: "PIT", name: "Pittsburgh Steelers", conference: "AFC", division: "North", brand: { primary: "#101820", accent: "#FFB612", onPrimary: "#FFFFFF" } },
  { code: "HOU", name: "Houston Texans", conference: "AFC", division: "South", brand: { primary: "#03202F", accent: "#A71930", onPrimary: "#FFFFFF" } },
  { code: "IND", name: "Indianapolis Colts", conference: "AFC", division: "South", brand: { primary: "#002C5F", accent: "#A2AAAD", onPrimary: "#FFFFFF" } },
  { code: "JAX", name: "Jacksonville Jaguars", conference: "AFC", division: "South", brand: { primary: "#006778", accent: "#D7A22A", onPrimary: "#FFFFFF" } },
  { code: "TEN", name: "Tennessee Titans", conference: "AFC", division: "South", brand: { primary: "#0C2340", accent: "#4B92DB", onPrimary: "#FFFFFF" } },
  { code: "DEN", name: "Denver Broncos", conference: "AFC", division: "West", brand: { primary: "#FB4F14", accent: "#002244", onPrimary: "#101820" } },
  { code: "KC", name: "Kansas City Chiefs", conference: "AFC", division: "West", brand: { primary: "#E31837", accent: "#FFB81C", onPrimary: "#FFFFFF" } },
  { code: "LAC", name: "Los Angeles Chargers", conference: "AFC", division: "West", brand: { primary: "#0080C6", accent: "#FFC20E", onPrimary: "#FFFFFF" } },
  { code: "LV", name: "Las Vegas Raiders", conference: "AFC", division: "West", brand: { primary: "#000000", accent: "#A5ACAF", onPrimary: "#FFFFFF" } },
  { code: "DAL", name: "Dallas Cowboys", conference: "NFC", division: "East", brand: { primary: "#003594", accent: "#869397", onPrimary: "#FFFFFF" } },
  { code: "NYG", name: "New York Giants", conference: "NFC", division: "East", brand: { primary: "#0B2265", accent: "#A71930", onPrimary: "#FFFFFF" } },
  { code: "PHI", name: "Philadelphia Eagles", conference: "NFC", division: "East", brand: { primary: "#004C54", accent: "#A5ACAF", onPrimary: "#FFFFFF" } },
  { code: "WAS", name: "Washington Commanders", conference: "NFC", division: "East", brand: { primary: "#5A1414", accent: "#FFB612", onPrimary: "#FFFFFF" } },
  { code: "CHI", name: "Chicago Bears", conference: "NFC", division: "North", brand: { primary: "#0B162A", accent: "#C83803", onPrimary: "#FFFFFF" } },
  { code: "DET", name: "Detroit Lions", conference: "NFC", division: "North", brand: { primary: "#0076B6", accent: "#B0B7BC", onPrimary: "#FFFFFF" } },
  { code: "GB", name: "Green Bay Packers", conference: "NFC", division: "North", brand: { primary: "#203731", accent: "#FFB612", onPrimary: "#FFFFFF" } },
  { code: "MIN", name: "Minnesota Vikings", conference: "NFC", division: "North", brand: { primary: "#4F2683", accent: "#FFC62F", onPrimary: "#FFFFFF" } },
  { code: "ATL", name: "Atlanta Falcons", conference: "NFC", division: "South", brand: { primary: "#A71930", accent: "#000000", onPrimary: "#FFFFFF" } },
  { code: "CAR", name: "Carolina Panthers", conference: "NFC", division: "South", brand: { primary: "#0085CA", accent: "#101820", onPrimary: "#FFFFFF" } },
  { code: "NO", name: "New Orleans Saints", conference: "NFC", division: "South", brand: { primary: "#101820", accent: "#D3BC8D", onPrimary: "#FFFFFF" } },
  { code: "TB", name: "Tampa Bay Buccaneers", conference: "NFC", division: "South", brand: { primary: "#D50A0A", accent: "#FF7900", onPrimary: "#FFFFFF" } },
  { code: "ARI", name: "Arizona Cardinals", conference: "NFC", division: "West", brand: { primary: "#97233F", accent: "#000000", onPrimary: "#FFFFFF" } },
  { code: "LAR", name: "Los Angeles Rams", conference: "NFC", division: "West", brand: { primary: "#003594", accent: "#FFA300", onPrimary: "#FFFFFF" } },
  { code: "SF", name: "San Francisco 49ers", conference: "NFC", division: "West", brand: { primary: "#AA0000", accent: "#B3995D", onPrimary: "#FFFFFF" } },
  { code: "SEA", name: "Seattle Seahawks", conference: "NFC", division: "West", brand: { primary: "#002244", accent: "#69BE28", onPrimary: "#FFFFFF" } },
];

export const nflTeams: FavoriteTeam[] = teamSeeds;

const officialTeamDomains: Record<string, string> = {
  ARI: "azcardinals.com", ATL: "atlantafalcons.com", BAL: "baltimoreravens.com", BUF: "buffalobills.com",
  CAR: "panthers.com", CHI: "chicagobears.com", CIN: "bengals.com", CLE: "clevelandbrowns.com",
  DAL: "dallascowboys.com", DEN: "denverbroncos.com", DET: "detroitlions.com", GB: "packers.com",
  HOU: "houstontexans.com", IND: "colts.com", JAX: "jaguars.com", KC: "chiefs.com",
  LAC: "chargers.com", LAR: "therams.com", LV: "raiders.com", MIA: "miamidolphins.com",
  MIN: "vikings.com", NE: "patriots.com", NO: "neworleansaints.com", NYG: "giants.com",
  NYJ: "newyorkjets.com", PHI: "philadelphiaeagles.com", PIT: "steelers.com", SF: "49ers.com",
  SEA: "seahawks.com", TB: "buccaneers.com", TEN: "titansonline.com", WAS: "commanders.com",
};

/** Returns the selected club's official schedule hub, never an opponent's schedule page. */
export function officialTeamScheduleUrl(teamCode: string) {
  const domain = officialTeamDomains[teamCode];
  return domain ? `https://www.${domain}/schedule/` : "https://www.nfl.com/schedules/";
}

export function getTeamByCode(code: string | null): FavoriteTeam | undefined {
  return nflTeams.find((team) => team.code === code);
}
