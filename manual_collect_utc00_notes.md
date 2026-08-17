# UTC 00時グループの公式フィード手動収集記録

収集時刻は **2026-08-17 00:06 UTC**。対象は ARI、ATL、BAL、BUF、CAR、CHI、CIN、CLE の8チームである。ARI、ATL、BAL、CAR、CHI、CIN、CLEの公式RSSでは2026年8月15日から17日に公開された現行記事を確認できたため、各チームの上位3件を保存候補とする。見出しに `injury`、`injured`、`questionable`、`doubtful`、`out`、`IR`、`PUP`、`practice report`、`故障`、`負傷` のいずれかを含む候補はなかったため、21件を `news` とする。

初回のテキスト抽出ではBUFが2025年7月の記事までしか返していないように見えたが、公式RSSのXMLを直接再取得・解析したところ、2026年8月15日の現行3記事を確認できた。したがって8チームすべてで上位3件、合計24件を保存候補とする。ATLの「Kevin Stefanski: 'We trust we have the guys to step up' in wake of James Pearce Jr. suspension, Jalon Walker injury」は見出しに `injury` を含むため `injury`、残る23件は `news` とする。

対象RSSは次の公式URLである：<https://www.azcardinals.com/rss/news>、<https://www.atlantafalcons.com/rss/news>、<https://www.baltimoreravens.com/rss/news>、<https://www.buffalobills.com/rss/news>、<https://www.panthers.com/rss/news>、<https://www.chicagobears.com/rss/news>、<https://www.bengals.com/rss/news>、<https://www.clevelandbrowns.com/rss/news>。

NFL公式負傷ページ（<https://www.nfl.com/injuries/>）も確認した。対象チームを含む表示は過去の「Injury roundup」見出しで、個別の公式URLおよび公開日時を検証できる現行項目ではなかったため、`nfl_official` の項目は保存しない。公式RSS 24件のUPSERT後、8チームすべてで3件ずつ保存されたことを確認した（news 23件、injury 1件）。
