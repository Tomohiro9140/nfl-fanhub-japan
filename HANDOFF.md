# HANDOFF.md — シフト申し送り（毎回上書き）
最終更新: 2026-11-08 / Codex

## 現在作業中の機能と背景
- 右上の三本線メニューに外部サイト NFL WARROOM JAPAN へのリンクを追加した。作業ブランチ: `codex/add-war-room-menu-link`。

## このシフトで完了したこと
- `client/src/pages/Home.tsx` のトップページ用メニューに `WAR ROOM` を追加。
- `client/src/components/EmbeddedAppNav.tsx` の共通メニューにも同じリンクを追加。ATLAS、COACHING TREE、FIELDLINE、SIMULATOR、LINKS で表示される。
- リンク先は `https://nfl-warroom-japan.onrender.com/`。別タブで開き、`noopener noreferrer` を付けた。
- 変更対象は上記2ファイルと本ファイルのみ。PRのCIで型チェック・ビルドを確認する。

## 次のシフトでやること
- 急ぎの追加作業はない。ユーザーの新しい依頼を優先する。
- **2027年1月上旬（Week 18 終了後）**: プレーオフ進出チームのトップページに次の試合が出るか確認。出なければ `server/officialTeamData.ts` の `parseNFLLeagueSchedulePage` を、実際の各ラウンドのページ形式を確かめてから補う。
- **2027年6月中**: `docs/season-operations.md` の「6月中」の作業（ドラフトのトレード情報、スーパーボウルのロゴ、年次データ）。

## 注意点
- 既存の失敗テストは34件（8ファイル）。新しい失敗を増やさない。
- 外部ページの形式を調べる必要がある場合、作業環境から直接つながらないことがある。一時的なActionsを使うなら調査後に削除する。
- GitHubの定期実行は予定より少ないことがある。
