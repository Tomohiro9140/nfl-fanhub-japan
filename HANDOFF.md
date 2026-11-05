# HANDOFF.md — シフト申し送り（毎回上書き）
最終更新: 2026-11-05 / Claude

## 現在作業中の機能と背景
- 作業中の機能はない（区切りのよい状態）。直近は「シーズン移行の準備」と「自動更新の安定化」をしていた。
- 1月のプレーオフ、7月1日のシーズン切り替えに向けて、年の直書きをなくし（`shared/season.ts`）、プレーオフの試合を判定できるようにした。

## 直前のシフトで完了したこと（PR #5〜#12、すべてマージ済み）
- ハイライトを YouTube Data API 方式に変更し、試合日に毎時取り込むようにした: `server/nflGameHighlights.ts`、`scripts/refreshGameHighlights.mjs`、`.github/workflows/highlights.yml`
- 取得済み判定のバグ修正: `server/db.ts`（判定を `watch?v=` 基準に）
- 自動更新の安全対策: `.github/workflows/auto-update.yml`（DBマイグレーションの自動実行を削除、ボットのコミットを限定、pnpm を固定）、`.github/workflows/ci.yml`（新規）
- タイムアウトの解消: `scripts/*.mjs` の最後に `process.exit(0)` を追加
- 型エラーを0件にした: `tsconfig.json` ほか
- プレーオフ判定: `server/officialLeagueData.ts`（`-post-N` → `WILD CARD` など）、`server/gameStatus.ts`、`client/src/lib/leagueCalendar.ts`
- シーズン年の集約: `shared/season.ts`（新規）と、それを使うように直した画面・サーバー各所
- 運用カレンダー: `docs/season-operations.md`。引き継ぎ基盤: `AGENTS.md`、`CLAUDE.md`、`HANDOFF.md`

## 次のシフトでやること
- 急ぎの作業はない。ユーザーの新しい依頼を優先する。
- **2027年1月上旬（Week 18 終了後）**: プレーオフ進出チームのトップページに、次の試合（ワイルドカード）が出るか確認する。`server/officialTeamData.ts` の `parseNFLLeagueSchedulePage` はチーム別日程ページから取っているが、そのページにはプレーオフの試合が載らない可能性が高い。出なければ、各ラウンドのページ（`officialPostseasonScoreUrls`）から次の試合を補う。そのときは、実際のページの形式を確かめてから作る。
- **2027年6月中**: `docs/season-operations.md` の「6月中」の作業（ドラフトのトレード情報 `TRADED_PICKS_BY_DRAFT_YEAR`、スーパーボウルのロゴ、年次データ）。

## 注意点・申し送り事項
- 既存の失敗テストが34件ある（8ファイル）。新しい失敗を増やしていないかは、この件数で比べる。
- 作業環境から nfl.com や YouTube に直接つながらないことがある。外部ページの形式を調べるときは、作業ブランチに push したときだけ動く一時的な Actions を使う。調べ終わったら削除する。
- GitHub の定期実行は、予定の回数より少ないことがある（GitHub 側の仕様）。
