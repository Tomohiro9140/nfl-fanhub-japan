# Official RSS Sync — UTC 18 Group — 2026-08-20

対象はNYJ、PHI、PIT、SF、SEA、TB、TEN、WASの8チームである。各チームの指定公式RSSから最新3件を取得し、公開日時・公式URL・タイトル・要約を確認した。

| 区分 | 結果 |
| --- | --- |
| 処理チーム | 8チーム |
| 公式RSS取得 | 8/8成功 |
| `team_official` UPSERT | 24件 |
| カテゴリ | news 23件、injury 1件（SF） |
| 公式RSS失敗URL | なし |

NFL公式の `https://www.nfl.com/injuries/` はCaptchaにより最新の個別記事URLと公開日時を信頼できる形で検証できなかった。画面に表示された候補には過去シーズンの記事が混在していたため、推測保存は行わず `nfl_official` の新規保存は0件とした。

今回の保存確認では、対象8チームごとに3件のRSS項目が直近の取得時刻で保存されていることを確認した。
