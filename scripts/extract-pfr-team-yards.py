import json
import sys
from pathlib import Path

import pandas as pd

TEAM_CODES = {
    "Arizona Cardinals": "ARI", "Atlanta Falcons": "ATL", "Baltimore Ravens": "BAL", "Buffalo Bills": "BUF",
    "Carolina Panthers": "CAR", "Chicago Bears": "CHI", "Cincinnati Bengals": "CIN", "Cleveland Browns": "CLE",
    "Dallas Cowboys": "DAL", "Denver Broncos": "DEN", "Detroit Lions": "DET", "Green Bay Packers": "GB",
    "Houston Texans": "HOU", "Indianapolis Colts": "IND", "Jacksonville Jaguars": "JAX", "Kansas City Chiefs": "KC",
    "Las Vegas Raiders": "LV", "Los Angeles Chargers": "LAC", "Los Angeles Rams": "LAR", "Miami Dolphins": "MIA",
    "Minnesota Vikings": "MIN", "New England Patriots": "NE", "New Orleans Saints": "NO", "New York Giants": "NYG",
    "New York Jets": "NYJ", "Philadelphia Eagles": "PHI", "Pittsburgh Steelers": "PIT", "San Francisco 49ers": "SF",
    "Seattle Seahawks": "SEA", "Tampa Bay Buccaneers": "TB", "Tennessee Titans": "TEN", "Washington Commanders": "WAS",
}


def numeric(value):
    return int(float(value)) if pd.notna(value) else None


def rows(path_text):
    table = pd.read_html(Path(path_text))[0]
    result = {}
    for _, row in table.iterrows():
        team_name = str(row.iloc[1])
        code = TEAM_CODES.get(team_name)
        if not code:
            continue
        result[code] = {
            "team_name": team_name,
            "games": numeric(row.iloc[2]),
            "pass_yards": numeric(row.iloc[12]),
            "rush_yards": numeric(row.iloc[18]),
        }
    return result


if __name__ == "__main__":
    offence, defence = sys.argv[1:3]
    output = {}
    for code, data in rows(offence).items():
        output[code] = {"team_name": data["team_name"], "games": data["games"], "pass_yards_for": data["pass_yards"], "rush_yards_for": data["rush_yards"]}
    for code, data in rows(defence).items():
        output.setdefault(code, {"team_name": data["team_name"], "games": data["games"]})
        output[code]["pass_yards_against"] = data["pass_yards"]
        output[code]["rush_yards_against"] = data["rush_yards"]
    print(json.dumps(dict(sorted(output.items())), ensure_ascii=False, indent=2))
