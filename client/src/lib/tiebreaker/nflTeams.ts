import { Conference, Division } from "./types";

export type TeamInfo = {
  code: string;
  name: string;
  conference: Conference;
  division: Division;
};

export const NFL_TEAMS: Record<string, TeamInfo> = {
  // AFC East
  BUF: { code: "BUF", name: "Buffalo Bills", conference: "AFC", division: "AFC East" },
  MIA: { code: "MIA", name: "Miami Dolphins", conference: "AFC", division: "AFC East" },
  NE: { code: "NE", name: "New England Patriots", conference: "AFC", division: "AFC East" },
  NYJ: { code: "NYJ", name: "New York Jets", conference: "AFC", division: "AFC East" },

  // AFC North
  BAL: { code: "BAL", name: "Baltimore Ravens", conference: "AFC", division: "AFC North" },
  CIN: { code: "CIN", name: "Cincinnati Bengals", conference: "AFC", division: "AFC North" },
  CLE: { code: "CLE", name: "Cleveland Browns", conference: "AFC", division: "AFC North" },
  PIT: { code: "PIT", name: "Pittsburgh Steelers", conference: "AFC", division: "AFC North" },

  // AFC South
  HOU: { code: "HOU", name: "Houston Texans", conference: "AFC", division: "AFC South" },
  IND: { code: "IND", name: "Indianapolis Colts", conference: "AFC", division: "AFC South" },
  JAX: { code: "JAX", name: "Jacksonville Jaguars", conference: "AFC", division: "AFC South" },
  TEN: { code: "TEN", name: "Tennessee Titans", conference: "AFC", division: "AFC South" },

  // AFC West
  DEN: { code: "DEN", name: "Denver Broncos", conference: "AFC", division: "AFC West" },
  KC: { code: "KC", name: "Kansas City Chiefs", conference: "AFC", division: "AFC West" },
  LV: { code: "LV", name: "Las Vegas Raiders", conference: "AFC", division: "AFC West" },
  LAC: { code: "LAC", name: "Los Angeles Chargers", conference: "AFC", division: "AFC West" },

  // NFC East
  DAL: { code: "DAL", name: "Dallas Cowboys", conference: "NFC", division: "NFC East" },
  NYG: { code: "NYG", name: "New York Giants", conference: "NFC", division: "NFC East" },
  PHI: { code: "PHI", name: "Philadelphia Eagles", conference: "NFC", division: "NFC East" },
  WAS: { code: "WAS", name: "Washington Commanders", conference: "NFC", division: "NFC East" },

  // NFC North
  CHI: { code: "CHI", name: "Chicago Bears", conference: "NFC", division: "NFC North" },
  DET: { code: "DET", name: "Detroit Lions", conference: "NFC", division: "NFC North" },
  GB: { code: "GB", name: "Green Bay Packers", conference: "NFC", division: "NFC North" },
  MIN: { code: "MIN", name: "Minnesota Vikings", conference: "NFC", division: "NFC North" },

  // NFC South
  ATL: { code: "ATL", name: "Atlanta Falcons", conference: "NFC", division: "NFC South" },
  CAR: { code: "CAR", name: "Carolina Panthers", conference: "NFC", division: "NFC South" },
  NO: { code: "NO", name: "New Orleans Saints", conference: "NFC", division: "NFC South" },
  TB: { code: "TB", name: "Tampa Bay Buccaneers", conference: "NFC", division: "NFC South" },

  // NFC West
  ARI: { code: "ARI", name: "Arizona Cardinals", conference: "NFC", division: "NFC West" },
  LAR: { code: "LAR", name: "Los Angeles Rams", conference: "NFC", division: "NFC West" },
  SF: { code: "SF", name: "San Francisco 49ers", conference: "NFC", division: "NFC West" },
  SEA: { code: "SEA", name: "Seattle Seahawks", conference: "NFC", division: "NFC West" },
};

export const DIVISIONS: Record<Division, string[]> = {
  "AFC East": ["BUF", "MIA", "NE", "NYJ"],
  "AFC North": ["BAL", "CIN", "CLE", "PIT"],
  "AFC South": ["HOU", "IND", "JAX", "TEN"],
  "AFC West": ["DEN", "KC", "LV", "LAC"],
  "NFC East": ["DAL", "NYG", "PHI", "WAS"],
  "NFC North": ["CHI", "DET", "GB", "MIN"],
  "NFC South": ["ATL", "CAR", "NO", "TB"],
  "NFC West": ["ARI", "LAR", "SF", "SEA"],
};

export const ALL_DIVISIONS: Division[] = Object.keys(DIVISIONS) as Division[];

export function getTeam(teamCode: string): TeamInfo | undefined {
  return NFL_TEAMS[teamCode.trim().toUpperCase()];
}
