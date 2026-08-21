# Official RSS Sync — UTC 06 Group — 2026-08-21

対象はDAL、DEN、DET、GB、HOU、IND、JAX、KCの8チームである。指定公式RSSは8/8で取得に成功し、各RSSから最新3件、計24件の候補を確認した。取得結果の原本は `/home/ubuntu/collect_official_rss_utc06.json` に保持する。

| 区分 | 結果 |
| --- | --- |
| 処理チーム | 8チーム |
| 公式RSS取得 | 8/8成功 |
| `team_official` UPSERT | 24件 |
| カテゴリ | news 24件 |
| 公式RSS失敗URL | なし |

NFL公式 `https://www.nfl.com/injuries/` では、DEN・DET、HOU、INDに明確に言及する候補記事を確認した。しかし、個別記事の公開日時を信頼できる形で取得できなかったため、推測保存は行わず `nfl_official` の新規保存は0件とした。

今回の保存確認では、対象8チームごとに3件のRSS項目が直近の取得時刻で保存されていることを確認した。
