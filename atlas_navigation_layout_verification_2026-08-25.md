# ATLAS ナビゲーション・トップ画面検証

確認日時は **2026-08-25 16:35 UTC** です。ATLASの共通メニューを実際に開き、HOMEリンクをクリックして遷移を確認しました。

| ビューポート | ATLASパス | scrollHeight / viewport | HOMEリンク | クリック後 |
|---|---|---:|---|---|
| 390 × 844 | `/atlas/` | 701 / 701 | 表示・`href="/"` | `/`（NFL Fan Hub Japan — Gameday Notes） |
| 1280 × 720 | `/atlas/` | 577 / 577 | 表示・`href="/"` | `/`（NFL Fan Hub Japan — Gameday Notes） |

両方のビューポートで `scrollHeight` と `viewport` は一致しており、空の名前検索トップに縦スクロールは発生していません。検索語を入力するかチーム検索へ切り替えた場合だけ、結果を表示できる通常の縦スクロールへ移行します。
