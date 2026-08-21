# Official RSS Sync — UTC 00 Group — 2026-08-21

対象はARI、ATL、BAL、BUF、CAR、CHI、CIN、CLEの8チームである。各チームの指定公式RSSから最新3件を取得し、公開日時・公式URL・タイトル・要約を確認した。

| 区分 | 結果 |
| --- | --- |
| 処理チーム | 8チーム |
| 公式RSS取得 | 8/8成功 |
| `team_official` UPSERT | 24件 |
| カテゴリ | news 19件、injury 5件 |
| 公式RSS失敗URL | なし |

NFL公式 `https://www.nfl.com/injuries/` では、BAL、BUF、ARIへ明確に言及する候補記事を確認した。しかし、一覧と個別抽出で公開日時を信頼できる形で取得できなかったため、推測保存は行わず `nfl_official` の新規保存は0件とした。

今回の保存確認では、対象8チームごとに3件のRSS項目が直近の取得時刻で保存されていることを確認した。
