# 公式フィード同期記録 — UTC 12時グループ

確認日時は **2026-08-22 12:04–12:05 UTC** です。対象は LAC、LAR、LV、MIA、MIN、NE、NO、NYG です。

| チーム | 公式RSS URL | HTTP | 最新記事数 | 同期結果 |
|---|---|---:|---:|---|
| LAC | https://www.chargers.com/rss/news | 200 | 3 | 成功 |
| LAR | https://www.therams.com/rss/news | 200 | 3 | 成功 |
| LV | https://www.raiders.com/rss/news | 200 | 3 | 成功 |
| MIA | https://www.miamidolphins.com/rss/news | 200 | 3 | 成功 |
| MIN | https://www.vikings.com/rss/news | 200 | 3 | 成功 |
| NE | https://www.patriots.com/rss/news | 200 | 3 | 成功 |
| NO | https://www.neworleanssaints.com/rss/news | 200 | 3 | 成功 |
| NYG | https://www.giants.com/rss/news | 200 | 3 | 成功 |

URL単位の失敗は **0件** でした。既存の公式同期ロジックは全8チームで `ok: true` を返し、LAC/LAR/LV/NYGは各24件、MIAは12件、MINは8件、NEは6件、NOは20件の公式ソース項目を同期処理しました。`official_feed_items` のチーム公式フィードは全チームで12:04–12:05 UTCに更新されています。

NFL公式Injuries一覧には、対象グループについてLACのTyler Biadasz、MINのJamal Adams、NEのChristian Gonzalez、NOのJordyn Tyson、NYGのNajee Harris等の見出しがありました。しかし一覧抽出では個別記事URLと公開日時を取得できず、公開日時を推測しない方針に従い新規 `nfl_official` 項目は追加していません。NEの既存 `nfl_official` 1件は同期により12:04:59 UTCへ取得時刻のみ更新されています。
