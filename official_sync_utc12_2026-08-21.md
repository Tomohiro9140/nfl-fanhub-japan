# UTC 12時グループ公式RSS同期記録

| 項目 | 結果 |
| --- | --- |
| 対象チーム | LAC、LAR、LV、MIA、MIN、NE、NO、NYG |
| 取得元 | 各クラブ公式RSS（`/rss/news`） |
| 保存件数 | 24件（8チーム × 最大3件） |
| 内訳 | news 22件、injury 2件 |
| 保存方式 | `team_official`、URL由来のSHA-256外部IDでUPSERT |

NFL公式負傷者ページはCaptchaにより個別記事の公開日時・URLを十分に検証できなかったため、対象チームの新規項目は推測保存せず0件とした。

NYGの「Joint Practice Report」はタイトル・要約に負傷関連語が含まれないため、injuryではなくnewsとして保存した。
