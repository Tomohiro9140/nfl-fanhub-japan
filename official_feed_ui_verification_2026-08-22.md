# 公式フィードのDB・UI照合記録

確認日時は **2026-08-22 15:50 UTC** です。WAF復旧後の全32チーム再同期について、DALを代表チームとしてDB保存内容と通常のモバイルUI（390px実行DOM）を照合しました。

| 確認項目 | DB | 通常UI | 照合結果 |
|---|---|---|---|
| 最新記事タイトル | `Rank'em: Top 20 standouts from Oxnard camp` | 同一タイトル | 一致 |
| 公式URL | `https://www.dallascowboys.com/news/rank-em-top-20-standouts-from-oxnard-camp` | 同一URLのリンク | 一致 |
| 公開日時 | 2026-08-21 20:51:56 UTC | 8/22 05:51 JST | 一致 |
| 情報源 | `DAL Official News` | `OFFICIAL` | 一致 |
| DB取得時刻 | 2026-08-22 06:10:33 UTC | 通常UIで表示 | 確認済み |

なお、ネタバレ防止オンの終了試合チームでは、試合終了後の新規記事を意図的にLATEST NEWSから除外します。そのため、UI照合は終了試合の後続記事を隠さないDALで行いました。
