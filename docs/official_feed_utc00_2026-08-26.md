# UTC 00時グループ・公式フィード同期記録

実行時刻は **2026-08-26T00:03:10Z**。対象は ARI、ATL、BAL、BUF、CAR、CHI、CIN、CLE の8チームであり、チーム公式RSSと NFL公式負傷ページだけを参照した。

| Team | RSS URL | 保存したチーム公式記事 | 最新公開時刻（UTC） |
|---|---|---:|---|
| ARI | https://www.azcardinals.com/rss/news | 3 | 2026-08-25T17:51:06Z |
| ATL | https://www.atlantafalcons.com/rss/news | 3 | 2026-08-25T21:54:22Z |
| BAL | https://www.baltimoreravens.com/rss/news | 3 | 2026-08-25T19:46:50Z |
| BUF | https://www.buffalobills.com/rss/news | 3 | 2026-08-25T16:29:00Z |
| CAR | https://www.panthers.com/rss/news | 3 | 2026-08-25T12:26:58Z |
| CHI | https://www.chicagobears.com/rss/news | 3 | 2026-08-25T18:08:12Z |
| CIN | https://www.bengals.com/rss/news | 3 | 2026-08-25T02:02:31Z |
| CLE | https://www.clevelandbrowns.com/rss/news | 3 | 2026-08-25T22:03:56Z |

NFL公式負傷ページ https://www.nfl.com/injuries/ からは、公開日時まで検証できたARIの負傷記事1件だけを追加した。合計保存対象は **25件**（チーム公式24件、NFL公式1件）。全RSSはHTTP成功であり、失敗URLはなかった。

各行は `team_code:source_url` のSHA-256を `external_id` とし、`official_feed_items` へUPSERTした。記事概要は最大280文字へ切り詰め、チーム公式を `team_official`、NFL負傷記事を `nfl_official` として保存した。
