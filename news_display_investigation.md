# LATEST NEWS 5件表示の調査メモ

## 2026-08-16

クライアント側の `OfficialTeamFeed` は既にカテゴリ `news` の最新5件を描画する実装であり、モバイル専用に4件目以降を非表示にするCSSは存在しない。表示が3件以下になる直接の原因は、一部チームのキャッシュに `news` 分類の公式記事が5件未満しか保存されていないことである。

Dallas Cowboysでは画面表示時点で `news` が2件、`transaction` が1件だった。公式RSSには十分な数の実在記事が公開されている一方、アプリ実行環境からのRSS再取得は403で失敗した。公式RSS本体の公開内容は外部抽出経路で確認できたため、データ不足自体ではなく取得元のアクセス制限が主因である。ニュース画面は、RSSキャッシュが5件未満の場合に公式RSSのみを再取得して補充する処理を追加した。取得が拒否された場合は推測や架空の記事を追加せず、保存済みの公式項目だけを表示する。

今回の不足分は、各クラブが公開する公式RSSを確認し、タイトル・公式URL・公開日時を照合した実在記事だけをキャッシュへ補充した。参照した公式RSSは、[Dallas Cowboys](https://www.dallascowboys.com/rss/news)、[Denver Broncos](https://www.denverbroncos.com/rss/news)、[Detroit Lions](https://www.detroitlions.com/rss/news)、[Green Bay Packers](https://www.packers.com/rss/news)、[Houston Texans](https://www.houstontexans.com/rss/news)、[Indianapolis Colts](https://www.colts.com/rss/news)、[Jacksonville Jaguars](https://www.jaguars.com/rss/news)、[Kansas City Chiefs](https://www.chiefs.com/rss/news)である。

補充後に `category = news` の件数を全32チームで検査し、5件未満のチームは0件となった。390px幅のDallas表示では、LATEST NEWSが5件すべて描画されることを確認した。同じ画面で、GAME TICKETはホーム側のArizona Cardinals、LATEST RESULTSはホーム側のSeattle Seahawksに `@` が付くことを確認した。
