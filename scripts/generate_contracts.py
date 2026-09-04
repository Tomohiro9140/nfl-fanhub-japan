const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');
const { Readable } = require('stream');

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
};

function cleanToM(val) {
  if (!val) return 0;
  const n = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? 0 : Math.round((n / 1000000) * 100) / 100;
}

function toInt(val) {
  if (!val) return 0;
  const n = parseInt(String(val).replace(/[^0-9.-]/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

async function fetchCsv(url, isGz = false) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const text = isGz ? zlib.gunzipSync(buffer).toString('utf-8') : buffer.toString('utf-8');
  
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // 簡易CSVパース
    const cols = [];
    let current = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cols.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    cols.push(current.trim().replace(/^"|"$/g, ''));
    
    if (cols.length === headers.length) {
      const rowObj = {};
      headers.forEach((h, idx) => rowObj[h] = cols[idx]);
      rows.push(rowObj);
    }
  }
  return rows;
}

async function fetchOtcSeasonBreakdown(otcId) {
  try {
    const url = `https://overthecap.com/player/_/${otcId}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return [];
    const html = await res.text();
    
    const tables = html.match(/<table[\s\S]*?<\/table>/gi) || [];
    if (tables.length <= 4) return [];
    
    const target = tables[4]; // Table #5
    const trs = (target.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || []).slice(1);
    const seasons = [];

    for (const tr of trs) {
      const tds = (tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || []).map(d => d.replace(/<[^>]+>/g, "").trim());
      if (tds.length >= 8 && /^\d{4}$/.test(tds[0])) {
        const yearVal = parseInt(tds[0], 10);
        if (yearVal >= 2022) {
          seasons.push({
            year: tds[0],
            team: tds[1],
            baseSalary: cleanToM(tds[2]),
            proratedBonus: cleanToM(tds[3]),
            optionBonus: cleanToM(tds[4]),
            rosterBonus: cleanToM(tds[5]),
            workoutBonus: cleanToM(tds[6]),
            guaranteed: cleanToM(tds[7]),
            capHit: cleanToM(tds[8]),
            cashPaid: cleanToM(tds[10] || tds[9])
          });
        }
      }
    }
    return seasons;
  } catch (e) {
    console.log(`[Warn] OTC fetch error (${otcId}):`, e.message);
    return [];
  }
}

async function main() {
  console.log("1/4: players.csv を取得中...");
  const players = await fetchCsv("https://github.com/nflverse/nflverse-data/releases/download/players/players.csv");
  const otToGsis = {};
  players.forEach(p => {
    if (p.otc_id && p.gsis_id && p.otc_id !== "NA") {
      otToGsis[p.otc_id.trim()] = p.gsis_id.trim();
    }
  });
  console.log(` -> 紐付け完了 (${Object.keys(otToGsis).length} 選手)`);

  console.log("2/4: historical_contracts.csv.gz を取得中...");
  const contractsRaw = await fetchCsv("https://github.com/nflverse/nflverse-data/releases/download/contracts/historical_contracts.csv.gz", true);
  const contractsByOtc = {};
  contractsRaw.forEach(r => {
    const otcId = (r.otc_id || "").trim();
    if (!otcId || otcId === "NA") return;
    if (!contractsByOtc[otcId]) contractsByOtc[otcId] = [];
    contractsByOtc[otcId].push(r);
  });

  console.log("3/4: Over The Cap から Stafford (1060) の詳細内訳を取得中...");
  const staffordOtcId = "1060";
  const staffordSeasons = await fetchOtcSeasonBreakdown(staffordOtcId);
  console.log(` -> Stafford 取得件数: ${staffordSeasons.length} 件`);

  const otcSeasonsMap = {
    [staffordOtcId]: staffordSeasons
  };

  console.log("4/4: active_contracts.json インデックス構築中...");
  const resultContracts = {};

  for (const [otcId, rows] of Object.entries(contractsByOtc)) {
    const gsisId = otToGsis[otcId];
    if (!gsisId) continue;

    rows.sort((a, b) => parseInt(a.year_signed || 0, 10) - parseInt(b.year_signed || 0, 10));
    const activeRow = rows.slice().reverse().find(r => String(r.is_active || "").toUpperCase() === "TRUE") || rows[rows.length - 1];

    const contractHistory = rows.map(r => ({
      team: r.team || "",
      yearSigned: toInt(r.year_signed),
      years: toInt(r.years),
      total: cleanToM(r.value),
      apy: cleanToM(r.apy),
      guaranteed: cleanToM(r.guaranteed),
      type: "Contract",
      status: "",
      amountEarned: 0.0
    }));

    const seasons = otcSeasonsMap[otcId] || [];

    resultContracts[gsisId] = {
      team: activeRow.team || "",
      yearSigned: toInt(activeRow.year_signed),
      years: toInt(activeRow.years),
      total: cleanToM(activeRow.value),
      apy: cleanToM(active_row.apy),
      guaranteed: cleanToM(active_row.guaranteed),
      seasonHistory: seasons,
      contractHistory: contractHistory
    };
  }

  const payload = {
    source: "NFLverse / Over The Cap",
    sourceUpdatedAt: new Date().toISOString(),
    contracts: resultContracts
  };

  fs.mkdirSync("server/data", { recursive: true });
  const outputPath = "server/data/active_contracts.json";
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), "utf-8");
  
  console.log(`完了: ${outputPath} (${Object.keys(resultContracts).length} 選手)`);
  if (resultContracts["00-0026498"]) {
    console.log(`Stafford seasonHistory 件数: ${resultContracts["00-0026498"].seasonHistory.length}`);
  }
}

main().catch(err => {
  console.error("エラー発生:", err);
  process.exit(1);
});
