import json
import sys
from pathlib import Path


def diff(left, right):
    return None if left is None or right is None else left - right


if __name__ == "__main__":
    pfr = json.loads(Path(sys.argv[1]).read_text())
    fieldline = json.loads(Path(sys.argv[2]).read_text())
    output = []
    for code in sorted(pfr):
        source = pfr[code]
        current = fieldline[code]
        projected = {
            "pass_yards_for": current["legacyFor"] - current["rushYardsFor"],
            "rush_yards_for": current["rushYardsFor"],
            "pass_yards_against": current["legacyAgainst"] - current["rushYardsAgainst"],
            "rush_yards_against": current["rushYardsAgainst"],
        }
        current_values = {
            "pass_yards_for": current["passYardsFor"],
            "rush_yards_for": current["rushYardsFor"],
            "pass_yards_against": current["passYardsAgainst"],
            "rush_yards_against": current["rushYardsAgainst"],
        }
        output.append({
            "team": code,
            "pfr": {metric: source[metric] for metric in projected},
            "current_fieldline": current_values,
            "current_differences": {metric: diff(current_values[metric], source[metric]) for metric in projected},
            "projected_pfr_compatible": projected,
            "projected_differences": {metric: diff(projected[metric], source[metric]) for metric in projected},
        })
    print(json.dumps(output, ensure_ascii=False, indent=2))
