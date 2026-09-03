import urllib.request, gzip, io, csv, json, os
from datetime import datetime, timezone

print("1/3: players.csv を取得中...")
req_p = urllib.request.Request("https://github.com/nflverse/nflverse-data/releases/download/players/players.csv", headers={"User-Agent": "Mozilla/5.0"})
otc_to_gsis = {}
with urllib.request.urlopen(req_p) as resp:
    reader = csv.DictReader(io.TextIOWrapper(resp, encoding="utf-8"))
    for r in reader:
        otc_id = r.get("otc_id")
        gsis_id = r.get("gsis_id")
        if otc_id and gsis_id and otc_id != "NA":
            otc_to_gsis[otc_id.strip()] = gsis_id.strip()

print(f" -> 紐付け完了 ({len(otc_to_gsis)} 選手)")

print("2/3: historical_contracts.csv.gz を解析中...")
req_c = urllib.request.Request("https://github.com/nflverse/nflverse-data/releases/download/contracts/historical_contracts.csv.gz", headers={"User-Agent": "Mozilla/5.0"})
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

print("3/3: gsis_id インデックスを構築中...")
result_contracts = {}
for otc_id, rows in contracts_by_otc.items():
    gsis_id = otc_to_gsis.get(otc_id)
    if not gsis_id:
        continue

    def parse_year(x):
        try: return int(x.get("year_signed", 0))
        except: return 0
    rows.sort(key=parse_year)

    active_row = next((r for r in reversed(rows) if r.get("is_active", "").upper() == "TRUE"), rows[-1])

    def to_num(val):
        try:
            v = float(val)
            return v if v == v else 0
        except:
            return 0

    contract_history = []
    for r in rows:
        contract_history.append({
            "team": r.get("team"),
            "yearSigned": int(to_num(r.get("year_signed"))),
            "years": int(to_num(r.get("years"))),
            "total": to_num(r.get("value")),
            "apy": to_num(r.get("apy")),
            "guaranteed": to_num(r.get("guaranteed")),
            "type": "Contract"
        })

    result_contracts[gsis_id] = {
        "team": active_row.get("team"),
        "yearSigned": int(to_num(active_row.get("year_signed"))),
        "years": int(to_num(active_row.get("years"))),
        "total": to_num(active_row.get("value")),
        "apy": to_num(active_row.get("apy")),
        "guaranteed": to_num(active_row.get("guaranteed")),
        "seasonHistory": [],
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

size_mb = os.path.getsize(output_path) / (1024 * 1024)
print(f"完了: {output_path} ({len(result_contracts)} 選手, {size_mb:.2f} MB)")
