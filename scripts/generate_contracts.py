import io
import gzip
import csv
import json
import os
import re
import urllib.request
from datetime import datetime, timezone

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

def clean_to_m(val):
    if not val:
        return 0.0
    clean = re.sub(r"[^0-9.-]", "", str(val))
    try:
        n = float(clean)
        return round(n / 1_000_000, 2)
    except Exception:
        return 0.0

def to_int(val):
    if not val:
        return 0
    clean = re.sub(r"[^0-9.-]", "", str(val))
    try:
        return int(float(clean))
    except Exception:
        return 0

print("1/4: players.csv を取得中...")
otc_to_gsis = {}
req_p = urllib.request.Request(
    "https://github.com/nflverse/nflverse-data/releases/download/players/players.csv",
    headers=HEADERS
)
with urllib.request.urlopen(req_p) as resp:
    reader = csv.DictReader(io.TextIOWrapper(resp, encoding="utf-8"))
    for r in reader:
        otc_id = r.get("otc_id")
        gsis_id = r.get("gsis_id")
        if otc_id and gsis_id and otc_id != "NA":
            otc_to_gsis[otc_id.strip()] = gsis_id.strip()

print(f" -> 紐付け完了 ({len(otc_to_gsis)} 選手)")

print("2/4: historical_contracts.csv.gz を解析中...")
req_c = urllib.request.Request(
    "https://github.com/nflverse/nflverse-data/releases/download/contracts/historical_contracts.csv.gz",
    headers=HEADERS
)
contracts_by_otc = {}
with urllib.request.urlopen(req_c) as resp:
    with gzip.GzipFile(fileobj=resp) as gz:
        reader = csv.DictReader(io.TextIOWrapper(gz, encoding="utf-8"))
        for r in reader:
            otc_id = r.get("otc_id", "").strip()
            if not otc_id or otc_id == "NA":
                continue
            if otc_id not in contracts_by_otc:
                contracts_by_otc[otc_id] = []
            contracts_by_otc[otc_id].append(r)

print("3/4: Over The Cap から年度別内訳テーブルを取得中...")
def fetch_otc_season_breakdown(otc_id):
    url = f"https://overthecap.com/player/_/{otc_id}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"  [Warn] OTC取得失敗 ({otc_id}): {e}")
        return []

    tables = re.findall(r"<table[\s\S]*?<\/table>", html, re.I)
    if not tables:
        return []

    # Table #5 (インデックス4) を最優先、見つからない場合は探索
    target_table = None
    if len(tables) >= 5:
        target_table = tables[4]
    else:
        for t in tables:
            if "Base Salary" in t:
                target_table = t
                break

    if not target_table:
        return []

    rows = re.findall(r"<tr[^>]*>([\s\S]*?)<\/tr>", target_table, re.I)
    seasons = []
    for tr in rows[1:]:
        tds = re.findall(r"<td[^>]*>([\s\S]*?)<\/td>", tr, re.I)
        cleaned = [re.sub(r"<[^>]+>", "", d).strip() for d in tds]
        if len(cleaned) >= 8 and re.match(r"^\d{4}$", cleaned[0]):
            year_val = int(cleaned[0])
            # 現契約（2022年以降）に絞り込み
            if year_val >= 2022:
                seasons.append({
                    "year": cleaned[0],
                    "team": cleaned[1],
                    "baseSalary": clean_to_m(cleaned[2]),
                    "proratedBonus": clean_to_m(cleaned[3]),
                    "optionBonus": clean_to_m(cleaned[4]),
                    "rosterBonus": clean_to_m(cleaned[5]),
                    "workoutBonus": clean_to_m(cleaned[6]),
                    "guaranteed": clean_to_m(cleaned[7]),
                    "capHit": clean_to_m(cleaned[8]),
                    "cashPaid": clean_to_m(cleaned[10] if len(cleaned) > 10 else cleaned[9])
                })
    return seasons

target_otc_ids = {"1060"}
otc_seasons_map = {}
for oid in target_otc_ids:
    print(f" -> OTC ID {oid} の詳細テーブル取得中...")
    parsed = fetch_otc_season_breakdown(oid)
    print(f"    取得成功件数: {len(parsed)} 件")
    otc_seasons_map[oid] = parsed

print("4/4: active_contracts.json インデックス構築中...")
result_contracts = {}
for otc_id, rows in contracts_by_otc.items():
    gsis_id = otc_to_gsis.get(otc_id)
    if not gsis_id:
        continue

    def parse_year(x):
        try:
            return int(x.get("year_signed", 0))
        except Exception:
            return 0

    rows.sort(key=parse_year)
    active_row = next((r for r in reversed(rows) if str(r.get("is_active", "")).upper() == "TRUE"), rows[-1])

    contract_history = []
    for r in rows:
        contract_history.append({
            "team": r.get("team") or "",
            "yearSigned": to_int(r.get("year_signed")),
            "years": to_int(r.get("years")),
            "total": clean_to_m(r.get("value")),
            "apy": clean_to_m(r.get("apy")),
            "guaranteed": clean_to_m(r.get("guaranteed")),
            "type": "Contract",
            "status": "",
            "amountEarned": 0.0
        })

    seasons = otc_seasons_map.get(otc_id, [])

    result_contracts[gsis_id] = {
        "team": active_row.get("team") or "",
        "yearSigned": to_int(active_row.get("year_signed")),
        "years": to_int(active_row.get("years")),
        "total": clean_to_m(active_row.get("value")),
        "apy": clean_to_m(active_row.get("apy")),
        "guaranteed": clean_to_m(active_row.get("guaranteed")),
        "seasonHistory": seasons,
        "contractHistory": contract_history
    }

output_payload = {
    "source": "NFLverse / Over The Cap",
    "sourceUpdatedAt": datetime.now(timezone.utc).isoformat(),
    "contracts": result_contracts
}

os.makedirs("server/data", exist_ok=True)
output_path = "server/data/active_contracts.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(output_payload, f, ensure_ascii=False)

print(f"完了: {output_path} ({len(result_contracts)} 選手)")
if "00-0026498" in result_contracts:
    st = result_contracts["00-0026498"]
    print(f"Stafford seasonHistory 件数: {len(st.get('seasonHistory', []))}")
