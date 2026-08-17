# 公式情報を短く確実に見るための追加機能検討

## 確認した公式データ導線

NFL公式にはゲームデーの `NFL Inactive Reports` 専用ページがあり、シーズン中に各チームの出場不可選手を確認できる。オフシーズンまたは公開前は「Please check back soon」と表示されるため、UIは未公開状態を明示し、古い一覧を最新情報のように見せない必要がある。[NFL Inactives](https://www.nfl.com/inactives/)

NFL公式負傷ページは負傷記事を集約するが、一覧には過去記事も混在する。公開日時と個別URLを検証してから表示する既存の鮮度ガードを維持することが必要である。[NFL Injuries](https://www.nfl.com/injuries/)

各クラブには週別の負傷レポートページがある。Falcons公式ページでは、練習参加状況（DNP/LP/FP）とゲームステータス（Out/Doubtful/Questionable）の定義を提示している。この構造は、全量を並べるより「今回変わった選手だけ」の要約に適する。[Falcons Injury Report](https://www.atlantafalcons.com/team/injury-report/)

## 追加候補の比較

| 候補 | ユーザー価値 | 公式性 | モバイル適性 | 実装優先度 |
|---|---|---|---|---|
| Since Last Visit | 前回閲覧以降に増えた公式項目だけを提示 | 既存キャッシュを利用 | 非常に高い | 最優先 |
| Game-Day Status | スコア、公式インアクティブ、公式ハイライトを1枚に集約 | NFL公式 | 高い | 高 |
| Roster Move Digest | 契約・解雇・IRなどの差分だけを日次表示 | チーム公式RSSと公式ロスター | 高い | 高 |
| Injury Delta | 練習参加・ゲームステータスの変化だけを表示 | チーム公式負傷レポート | 高い | 中 |
| Official Source Trace | 各カードに取得時刻・原典種別・原文リンクを統一表示 | 既存公式データ | 高い | 中 |

> 方針：新しい情報源を増やすより、すでに取得済みの公式データを「前回から何が変わったか」「今日の試合で何を確認すべきか」に圧縮する方が、正確性とスマホでの即読性を両立しやすい。

## 実装判断（2026-08-17）

`Game-Day Status`はGAME TICKET直下に置き、既存の公式日程・公式スコアキャッシュから `UPCOMING`、`GAME DAY`、`LIVE`、`FINAL` を短く表示する。公式インアクティブ一覧と公式Game Centerへのリンクだけを併設し、未公開時に推測した欠場者は表示しない。

`Roster Move Digest`は最新21日間の `transaction` 分類のチーム公式記事を最大3件に限定して、LATEST NEWSとSTATUS RADARの間に置く。STATUS RADARはReserveタグ、公式負傷記事、出場可否に関するPFT文脈だけへ限定し、契約・登録変更の重複を除く。

## 補助ソースの導入原則

大規模メディアを補助ソースとして検討する場合も、全文の自動転載や無許可スクレイピングは行わない。公開RSS・正式API・利用規約で許された短いリンクカードだけを候補とし、チーム公式・NFL公式の事実情報を上書きしない。ブラウズ環境ではESPNとCBS Sportsの直接ページ取得に制約があったため、導入判断は各社の公開フィード・ライセンス条件を個別に再確認してから行う。

## 大規模メディア候補の役割分担（2026-08-17）

PFTはロスター・契約・負傷・リーグニュースを短い記事単位で連続掲載しており、既存のSTATUS RADARにおける補助文脈として適している。ただし同サイト自身が「news and rumors」を掲げるため、公式確認前の事実をステータスやスコアへ反映してはならない。[PFT](https://www.nbcsports.com/nfl/profootballtalk)

Yahoo Sportsはニュース、スコア、日程、順位、スタッツ、チーム、選手、負傷者を一つのNFLハブで提供する。速報の発見や外部リンク先としては有用だが、当アプリでは試合結果・日程・出場可否の正本をNFL公式のまま維持する。[Yahoo Sports NFL](https://sports.yahoo.com/nfl/)

CBS Sportsはニュース、スコア、プレシーズン分析、負傷・契約・ロスター記事を幅広く掲載する。記事の見どころ・外部リンク候補には適するが、同ページは正確性や試合結果を保証しない旨を明記しているため、公式データより優先する自動更新元には使わない。[CBS Sports NFL](https://www.cbssports.com/nfl/)

Pro-Football-Referenceは現役・歴史的な選手、チーム、得点、リーダー、日程・結果、スタッツに強く、試合後の「Stat Note」や選手比較の参照先として適する。速報ニュースの代替ではなく、履歴・比較データの外部リンク専用とする。[Pro-Football-Reference](https://www.pro-football-reference.com/)

Spotracは契約、サラリーキャップ、フリーエージェント、トランザクション、トレード、延長、罰金・出場停止を体系化している。オフシーズンの契約背景リンクには有用だが、契約完了のアプリ内表示はチーム公式発表で確認してから行う。[Spotrac NFL](https://www.spotrac.com/nfl)
