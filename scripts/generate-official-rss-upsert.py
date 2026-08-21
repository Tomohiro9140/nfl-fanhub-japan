import json
import sys
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path


TEAM_BY_DOMAIN = {
    "azcardinals.com": ("ARI", "Arizona Cardinals"),
    "atlantafalcons.com": ("ATL", "Atlanta Falcons"),
    "baltimoreravens.com": ("BAL", "Baltimore Ravens"),
    "buffalobills.com": ("BUF", "Buffalo Bills"),
    "panthers.com": ("CAR", "Carolina Panthers"),
    "chicagobears.com": ("CHI", "Chicago Bears"),
    "bengals.com": ("CIN", "Cincinnati Bengals"),
    "clevelandbrowns.com": ("CLE", "Cleveland Browns"),
    "dallascowboys.com": ("DAL", "Dallas Cowboys"),
    "denverbroncos.com": ("DEN", "Denver Broncos"),
    "detroitlions.com": ("DET", "Detroit Lions"),
    "packers.com": ("GB", "Green Bay Packers"),
    "houstontexans.com": ("HOU", "Houston Texans"),
    "colts.com": ("IND", "Indianapolis Colts"),
    "jaguars.com": ("JAX", "Jacksonville Jaguars"),
    "chiefs.com": ("KC", "Kansas City Chiefs"),
    "newyorkjets.com": ("NYJ", "New York Jets"),
    "philadelphiaeagles.com": ("PHI", "Philadelphia Eagles"),
    "steelers.com": ("PIT", "Pittsburgh Steelers"),
    "49ers.com": ("SF", "San Francisco 49ers"),
    "seahawks.com": ("SEA", "Seattle Seahawks"),
    "buccaneers.com": ("TB", "Tampa Bay Buccaneers"),
    "titansonline.com": ("TEN", "Tennessee Titans"),
    "commanders.com": ("WAS", "Washington Commanders"),
}


def quote(value):
    return "'" + str(value).replace("\\", "\\\\").replace("'", "''") + "'"


def published_at(value):
    if "T" in value and value.endswith("Z"):
        return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    return parsedate_to_datetime(value).astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")



if __name__ == "__main__":
    source = json.loads(Path(sys.argv[1]).read_text())
    rows = []
    for result in source["results"]:
        domain = result["input"]
        team_code, source_name = TEAM_BY_DOMAIN[domain]
        output = result["output"]
        if not output["success"]:
            continue
        for item in json.loads(output["items_json"]):
            summary = item.get("summary", "")[:280]
            url = item["source_url"]
            row = "(" + ", ".join([
                f"SHA2(CONCAT({quote(team_code + '|')}, {quote(url)}), 256)",
                quote(team_code), quote("team_official"), quote(source_name), quote(url),
                quote(item["title"]), quote(summary), quote(item["category"]), quote(published_at(item["published_at"])), "UTC_TIMESTAMP()",
            ]) + ")"
            rows.append(row)
    sql = "INSERT INTO official_feed_items (external_id, team_code, source_kind, source_name, source_url, title, summary, category, published_at, fetched_at) VALUES\n"
    sql += ",\n".join(rows)
    sql += "\nON DUPLICATE KEY UPDATE source_name = VALUES(source_name), title = VALUES(title), summary = VALUES(summary), category = VALUES(category), published_at = VALUES(published_at), fetched_at = UTC_TIMESTAMP();\n"
    print(sql)
