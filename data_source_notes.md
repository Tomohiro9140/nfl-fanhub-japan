# 公式NFL情報連携の調査メモ

調査日：2026-08-15

## 確認した公開ページ

| 情報種別 | 公式ページ | 確認できた内容 | 実装上の扱い |
|---|---|---|---|
| 負傷者関連ニュース | https://www.nfl.com/injuries/ | NFL.comの負傷者ラウンドアップ記事のタイトル・リンク・画像が公開されている。 | 公式ページへのリンクを出典として明示し、見出し・公開時刻・要約を取得対象にする。試合ごとの正式なステータスは公開ページの構造変化に備えた検証が必要。 |
| チームページ | https://www.nfl.com/teams/green-bay-packers/ | チームページに動画・ニュースのタイトル、公開日、記事リンク、ロスターや日程への導線がある。 | チーム別ニュースを作る際は、公式チームページからの見出し・URL・日付を利用し、詳細はモーダルで短い要約と原文リンクを表示する。 |

## 公式チームRSSの追加確認

Packers、Patriots、49ers、Cowboys、Billsの公式サイトで `https://www.<team-domain>/rss/news` 形式のRSSを確認した。RSSには公式記事のタイトル、記事URL、公開日時、短い説明があり、ニュース一覧を構造化して保存するための優先的な取得元として適している。対象URLの例は、[Packers](https://www.packers.com/rss/news)、[Patriots](https://www.patriots.com/rss/news)、[49ers](https://www.49ers.com/rss/news)、[Cowboys](https://www.dallascowboys.com/rss/news)、[Bills](https://www.buffalobills.com/rss/news)である。

Bills公式RSSには、2025年7月23日公開のトレーニングキャンプ記事と、負傷により初日の練習を欠場する選手についての公式発表が確認できた。NFL公式の[Injuriesページ](https://www.nfl.com/injuries/)には、2026年Week 1のBills TE Dalton KincaidおよびWR Keon Colemanに関する負傷ラウンドアップ記事が表示されている。これらは初回の表示・統合テストに利用できる。

## UTC 12時区分の公式RSS収集結果

2026年8月15日に、UTC 12時区分の8チームについて公式RSSを確認した。対象は [Chargers](https://www.chargers.com/rss/news)、[Rams](https://www.therams.com/rss/news)、[Raiders](https://www.raiders.com/rss/news)、[Dolphins](https://www.miamidolphins.com/rss/news)、[Vikings](https://www.vikings.com/rss/news)、[Patriots](https://www.patriots.com/rss/news)、[Saints](https://www.neworleanssaints.com/rss/news)、[Giants](https://www.giants.com/rss/news) である。各RSSから実在する最新記事を1件ずつ抽出し、チームコード、公式URL、公開日時、sourceKind=`team_official`、category=`news`としてキャッシュに保存した。対象RSSでは、同一取得時点に各チームへ明確に紐づくNFL公式負傷者記事を抽出できなかったため、推測による追加は行わなかった。

### NFL公式負傷者ページの確認結果

NFL公式の[Injuriesページ](https://www.nfl.com/injuries/)では、対象チームに明確に紐づくラウンドアップ記事として、[Dolphins: Tyreek Hill／Jaylen Waddle](https://www.nfl.com/news/injury-roundup-dolphins-wr-tyreek-hill-wrist-expected-to-play-versus-browns-while-wr-jaylen-waddle-knee-unlikely-to-play)、[Giants: Malik Nabers](https://www.nfl.com/news/injury-roundup-giants-wr-malik-nabers-groin-expected-to-play-sunday-vs-buccaneers)、[Saints: Alvin Kamara／Chris Olave](https://www.nfl.com/news-migrated-v2/injury-roundup-saints-rb-alvin-kamara-hip-ribs-wr-chris-olave-hamstring-both-expected-to-play-versus-falcons)を確認した。各記事は `sourceKind=nfl_official`、`category=injury` として保存する。ページ上の掲出は確認できたが、検索結果の公開日は2024年であるため、UIでは公開日時を表示し、現在の選手状態としての断定には利用しない。

## アーキテクチャ判断

現在の静的サイトでは、クロスオリジン制約、取得元の更新、ニュース本文の整形、データの保存が安定しない。そのため、公式ページから取得した情報をサーバー側で検証・正規化し、保存済みの最新データを画面へ返す構成が必要である。

更新は高頻度の外部情報取得であり、ブラウザが開いているかに依存せず自動実行できる仕組みを使う。ニュース本文・サムネイル・ロゴの再利用可否は、各提供元の利用規約を本番公開前に確認する。初期版では、短い抜粋ではなく自前の簡潔な要約と公式原文へのリンクを表示する。

## 認証済みHeartbeatによる最終検証

2026年8月15日17:21 UTCに、認証済みHeartbeatからUTC 12時区分（LAC、LAR、LV、MIA、MIN、NE、NO、NYG）の公式フィード更新を実行した。処理は8チームすべてで成功し、チーム公式RSSとNFL公式負傷者ページ由来の情報をキャッシュへ保存した。最新の保存結果ではLAC・LAR・MIA・NO・NYGに `nfl_official` / `injury` の項目が含まれ、各チームの `team_official` 項目は同じ取得時刻で先に返る並び順になっている。

同都市チーム間の誤分類を避けるため、負傷記事のチーム判定は都市名ではなく固有ニックネーム（Chargers／Rams、Giants／Jets）で行う。判定対象が取得できない場合は推測で補わず、該当チームのNFL公式負傷者項目を保存しない。

### 分類修正後のUI確認

2026年8月15日18:15 UTCのHeartbeat再取得後、NYJ公式RSSの「3 Standout Players From Jets-Buccaneers Preseason Game」は `category=news` として保存された。同じNYJ画面の **INJURY WATCH** には、公式負傷者ページ由来の「Jets RB Braelon Allen Roars Back in Return From Injury」など、負傷関連の記事だけが表示された。LAC／LAR／NYG／NYJの開発環境表示では、各チームの **OFFICIAL FEED** が対応するチームコードおよび公式ニュースを表示し、都市名だけを根拠とするチーム間の混同は確認されなかった。
