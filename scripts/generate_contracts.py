import io
import json
import os
import urllib.request
import pandas as pd
import pyarrow.parquet as pq
from datetime import datetime, timezone

# 1. players.csv から otc_id と gsis_id の紐付けテーブルを作成
print("1/4: players.csv を取得中...")
req_p = urllib.request.Request(
    "https://github.com/nflverse/nflverse-data/releases/download/players/players.csv",
    headers={"User-Agent": "Mozilla/5.0"}
)
otc_to_gsis = {}
with urllib.request.urlopen(req_p) as resp:
    players_df = pd.read_csv(resp, low_memory=False)
    for _, row in players_df.iterrows():
        otc_id = str(row.get("otc_id") or "").strip()
        gsis_id = str(row.get("gsis_id") or "").strip()
        if otc_id and gsis_id and otc_id != "nan" and gsis_id != "nan":
            otc_to_gsis[otc_id] = gsis_id

print(f" -> 紐付け完了: {len(otc_to_gsis)} 選手")

# 2. historical_contracts.parquet (Over The Cap 由来) を取得
print("2/4: historical_contracts.parquet を解析中...")
req_c = urllib.request.Request(
    "https://github.com/nflverse/nflverse-data/releases/download/contracts/historical_contracts.parquet",
    headers={"User-Agent": "Mozilla/5.0"}
)
with urllib.request.urlopen(req_c) as resp:
    parquet_bytes = resp.read()

table = pq.read_table(io.BytesIO(parquet_bytes))
df = table.to_pandas()
print(f" -> 契約レコード数: {len(df)}")

def to_m(val):
    try:
        if pd.isna(val) or val is None:
            return 0.0
        v = float(val)
        return round(v / 1_000_000.0, 2)
    except:
        return 0.0

def to_num(val):
    try:
        if pd.isna(val) or val is None:
            return 0
        return int(float(val))
    except:
        return 0

# 3. 選手ごとの最新契約と年度別内訳 (seasonHistory) を構築
print("3/4: 契約サマリーおよび年度別内訳を構築中...")
contracts_by_otc = {}
for _, row in df.iterrows():
    otc_id = str(row.get("otc_id") or "").strip()
    if not otc_id or otc_id == "nan":
        continue
    if otc_id not in contracts_by_otc:
        contracts_by_otc[otc_id] = []
    contracts_by_otc[otc_id].append(row)

result_contracts = {}

for otc_id, rows in contracts_by_otc.items():
    gsis_id = otc_to_gsis.get(otc_id)
    if not gsis_id:
        continue

    rows.sort(key=lambda r: to_num(r.get("year_signed")))

    # 最新契約（is_active == True を優先、なければ最終行）
    active_rows = [r for r in rows if r.get("is_active") is True or str(r.get("is_active")).upper() == "TRUE"]
    active_row = active_rows[-1] if active_rows else rows[-1]

    # 過去契約履歴
    contract_history = []
    for r in rows:
        contract_history.append({
            "team": str(r.get("team") or ""),
            "yearSigned": to_num(r.get("year_signed")),
            "years": to_num(r.get("years")),
            "total": to_m(r.get("value")),
            "apy": to_m(r.get("apy")),
            "guaranteed": to_m(r.get("guaranteed")),
            "type": "Contract",
            "status": "Active" if r.get("is_active") is True else "Expired",
            "amountEarned": 0.0
        })

    # 年度別内訳 (seasonHistory)
    season_history = []
    raw_sh = active_row.get("season_history")
    
    if raw_sh is not None:
        sh_items = []
        if isinstance(raw_sh, pd.DataFrame):
            sh_items = raw_sh.to_dict(orient="records")
        elif hasattr(raw_sh, "tolist"):
            sh_items = raw_sh.tolist()
        elif isinstance(raw_sh, list):
            sh_items = raw_sh
            
        for item in sh_items:
            if not isinstance(item, dict):
                continue
            
            year_val = item.get("year") or item.get("season")
            if not year_val or pd.isna(year_val):
                continue
            year_str = str(int(float(year_val)))

            season_history.append({
                "year": year_str,
                "team": str(item.get("team") or active_row.get("team") or ""),
                "capHit": to_m(item.get("cap_number") or item.get("cap_hit") or item.get("cap_amount")),
                "baseSalary": to_m(item.get("base_salary")),
                "proratedBonus": to_m(item.get("prorated_bonus") or item.get("signing_bonus")),
                "rosterBonus": to_m(item.get("roster_bonus")),
                "optionBonus": to_m(item.get("option_bonus")),
                "guaranteed": to_m(item.get("guaranteed_salary") or item.get("guaranteed")),
                "cashPaid": to_m(item.get("cash_paid") or item.get("cash_spent")),
                "workoutBonus": to_m(item.get("workout_bonus")),
                "perGameRosterBonus": to_m(item.get("per_game_bonus") or item.get("per_game_roster_bonus")),
                "otherBonus": to_m(item.get("other_bonus"))
            })

    result_contracts[gsis_id] = {
        "team": str(active_row.get("team") or ""),
        "yearSigned": to_num(active_row.get("year_signed")),
        "years": to_num(active_row.get("years")),
        "total": to_m(active_row.get("value")),
        "apy": to_m(active_row.get("apy")),
        "guaranteed": to_m(active_row.get("guaranteed")),
        "seasonHistory": season_history,
        "contractHistory": contract_history
    }

print(f" -> 有効契約生成完了: {len(result_contracts)} 選手")

# 4. active_contracts.json へ出力
output_payload = {
    "source": "NFLverse / Over The Cap",
    "sourceUpdatedAt": datetime.now(timezone.utc).isoformat(),
    "contracts": result_contracts
}

os.makedirs("server/data", exist_ok=True)
out_path = "server/data/active_contracts.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(output_payload, f, ensure_ascii=False)

sz_mb = os.path.getsize(out_path) / (1024 * 1024)
print(f"4/4: 保存完了 {out_path} ({sz_mb:.2f} MB)")
