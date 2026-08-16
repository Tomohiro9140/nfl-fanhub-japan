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

### 同都市チームの最終キャッシュ・UI照合

最終キャッシュを `team_code` と `source_kind` の優先順で照合し、通常UIの **INJURY WATCH** は各チームのレコードだけを表示することを確認した。LACでは「Why Rashawn Slater is Taking 'Smart & Thoughtful' Approach With Return From Knee Injury」と「Chargers Training Camp Report: Mesidor, Tucker Flash at Edge Rusher on Day 10」、LARでは「McVay: Puka Nacua dealing with soreness in psoas...」、NYGでは「Practice Report (8/12): View from the sideline」と「Practice Report (8/11): Sideline observations」、NYJでは「Jets RB Braelon Allen Roars Back in Return From Injury」と「Geno Smith Won't Play vs. Buccaneers in Preseason Opener」を確認した。リーグ公式の負傷ラウンドアップは、チーム公式の記事の後に補完情報として保持する。LAC／LARおよびNYG／NYJは固有のニックネームで判定され、都市名だけによる横断表示はない。

「3 Standout Players From Jets-Buccaneers Preseason Game」と「5 Chargers Players That Stood Out in Preseason Win Over Texans」は、分類修正後に `category=news` として保存し直した。通常UIでもこれらは **LATEST NEWS** に表示され、**INJURY WATCH** には表示されないことを確認した。

## 実試合・公式ロスターへの置換に使用する公開情報

NFL公式の[2026年チーム別日程](https://www.nfl.com/schedules/2026/by-team)は全32チームの選択導線を提供する。各チーム公式のScheduleページには、試合ごとのホーム／アウェー、対戦相手、現地開始時刻、会場、配信局が掲載される。たとえば[Bills公式Schedule](https://www.buffalobills.com/schedule/)は、2026年レギュラーシーズンWeek 1の`AT Texans`（Sun 09/13、1:00 PM EDT）およびプレシーズン次戦の`AT Browns`（Sat 08/22、1:00 PM EDT）を掲載している。ページHTMLは各試合に`data-gametime`とschema.orgの`SportsEvent`（startDate、homeTeam、awayTeam）を含むため、サーバー側で構造化して保存できる。

[Bills公式Roster](https://www.buffalobills.com/team/players-roster/)は、Active／Reserve-Injured／Reserve-Non-Football Injury／Reserve-PUPなどの区分を分け、各選手名・背番号・ポジションを表形式で公開する。HTMLには`nfl-o-roster__player-name`と各行のポジションセルが含まれるため、公式ロスターのスナップショットとして解析できる。各チームサイトは同じNFLクラブサイト構造を採るため、`https://www.<team-domain>/schedule/`と`https://www.<team-domain>/team/players-roster/`をチームコードに応じて取得する方針とする。

### NFL公式リーグ日程を優先する構成

NFL公式のチーム別日程ページ（例：[Buffalo Bills 2026 Schedule](https://www.nfl.com/schedules/2026/by-team/buffalo-bills)）は、プレシーズンからレギュラーシーズンまでのWeek、対戦、ホーム／アウェー、日付、開始時刻、放送局を掲載する。2026年のBillsページでは、Week 2の`Bills at Browns, Saturday, August 22nd, 1:00 PM, NFLN`、レギュラーシーズンWeek 1の`Bills at Texans, Sunday, September 13th, 1:00 PM, CBS`などを確認した。Week 18のように公式にTBDとされる日程は、確定日時として保存せず、TBDのまま扱う。

ブラウザで確認した公式ページのネットワーク経路には、チーム別ページ`/schedules/2026/by-team/<team-slug>`と、NFL公式の`api.nfl.com/experience/v1/gamedetails/season/2026/team/<team-id>`が含まれる。実装では、公開チーム別ページをリーグ公式の優先日程ソースとし、チーム公式Scheduleは照合・フォールバックに位置付ける。

2026年8月15日23:53 UTCに、NFL公式の全32チーム別日程ページを初回同期した。32チームすべてでリーグ公式日程の解析に成功し、今季の将来試合は合計544件保存された。DB集計では、将来試合を持つチームは32、NFL公式`nfl.com/schedules/`を参照する保存済み試合は544件であり、次戦表示がチーム公式Scheduleの取得待ちに依存しない状態になった。

## NFL公式スコア・順位・週別日程

NFL公式の[Standings](https://www.nfl.com/standings/league/2026/reg)は、全32チームについて勝敗、引き分け、勝率、得失点、ホーム／ロード、地区／カンファレンス成績を公開している。2026年レギュラーシーズン開始前の表示は各チーム0勝0敗だが、成績が未確定であることをそのまま表示できる。

[Schedules](https://www.nfl.com/schedules)は、Hall of Fame、Preseason Week 1〜3、Week 1〜18の週単位切替と、各試合の対戦・得点・試合状態を公開している。[Scores](https://www.nfl.com/scores)はLIVE GAMESとCOMPLETED GAMESを区別し、完了試合には`FINAL`、進行中試合にはクオーター・残り時間を表示する。これらを公式スコア・結果の同期元とし、カレンダーは週ラベル単位、順位表は地区ごとにモバイルで表示する。

2026年8月16日00:44 UTCに、NFL公式[Standings](https://www.nfl.com/standings/league/2026/reg)と[Schedules](https://www.nfl.com/schedules)を初回同期した。公式順位表は32チーム、完了試合スコアは16件を解析・保存した。順位表は今季の公式レギュラーシーズン成績（開始前の場合は0-0-0）を保持し、スコアは公式カードで`FINAL`と明記された完了試合だけを保存する。

## モバイル表示検証（2026-08-16）

390×844pxの実機相当ビューポートでトップ画面を確認した。GAME TICKETでは通常チーム名（Buffalo Bills／Cleveland Browns）と開催日時を表示し、略称だけの対戦行と未確定会場は表示されなかった。SPOILER SAFEはYOUR HUDDLEの直上にあり、有効時のLATEST RESULTSは結果を`RESULT HIDDEN`として隠す設計になっている。LEAGUE DESKは同一幅内にDIVISION STANDINGS、LATEST RESULTS、横スクロール可能な週選択、週内の全試合を表示し、ページ全体・各主要カードに横はみ出しは確認されなかった。

### LATEST RESULTS／SCHEDULE DESK変更後の確認

同じ390×844pxビューポートで、LATEST RESULTSがSPOILER SAFEの直下に配置され、スイッチ有効時に得点ではなく`RESULT HIDDEN`を表示することを確認した。SCHEDULE DESKの初期タブは`MY TEAM / FULL SCHEDULE`で、Buffalo Billsの今季予定を時系列に並べ、対戦表記はすべて`BUF @ CLE`のような略称に統一した。`ALL GAMES / NEXT 7 DAYS`は現在時刻から7日未満にキックオフする全試合を返すロジックをテストで確認し、チーム視点のホーム／アウェー反転と略称表示も回帰テストで確認した。両タブのカードはモバイル1列表示で、対戦略称・日時・放送局が同一幅内に収まる設計である。
