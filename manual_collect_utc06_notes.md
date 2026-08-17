# UTC 06時グループ：公式キャッシュ手動同期記録

収集時刻は **2026-08-17 06:05 UTC**。対象はDAL、DEN、DET、GB、HOU、IND、JAX、KCの8チームである。各クラブの公式RSSから公開日時と公式URLを確認した上位3記事を保存し、合計24件を `team_official` としてUPSERTした。

分類の内訳はnews 22件、transaction 2件である。Green Bayの「Packers announce roster move」とHoustonの「Houston Texans Transactions」をtransactionとし、タイトルが契約内容を振り返るだけのDallas記事はnewsとした。明示的な負傷主題を持つ上位記事はなかった。

NFL公式負傷ページも確認したが、対象チームへ明確に結び付けられる個別URL・公開日時付きの新規項目を抽出できなかった。そのため、推測による `nfl_official` 保存は行っていない。8つのチームRSS URLの取得失敗は0件である。

## 取得元

- https://www.dallascowboys.com/rss/news
- https://www.denverbroncos.com/rss/news
- https://www.detroitlions.com/rss/news
- https://www.packers.com/rss/news
- https://www.houstontexans.com/rss/news
- https://www.colts.com/rss/news
- https://www.jaguars.com/rss/news
- https://www.chiefs.com/rss/news
- https://www.nfl.com/injuries/
