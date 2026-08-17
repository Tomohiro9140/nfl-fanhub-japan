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
