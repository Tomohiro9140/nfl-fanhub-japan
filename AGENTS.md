# AGENTS.md — 開発ルールブック（Claude / Codex 共通）

このリポジトリは Claude と Web版Codex がシフト制で交互に開発する。どちらのAIもこのファイルに従う。
ユーザーはプログラミング初心者なので、説明は日本語でかみ砕いて行う。

## 0. シフト制の運用ルール（最優先）
1. **セッション開始時は、必ず最初に `AGENTS.md` と `HANDOFF.md` を読む。** 作業は `HANDOFF.md` の「次のシフトでやること」か、ユーザーの指示から始める。指示された対象ファイル以外は、むやみに探索・変更しない。探すときは下の「2. 案内地図」から当たりをつける。
2. **ユーザーが「引き継ぎ」と言ったら、直ちに作業を区切る。** `HANDOFF.md` を最新の状態に上書きし（最大30行程度）、コミットしてPRを作る。書きかけのコードは、動く状態に戻すか、未完了であることを HANDOFF に明記する。
3. ブランチ・PR: `main` へは必ずPR経由で入れる。PRでは CI（`.github/workflows/ci.yml`：型チェック＋ビルド）が緑になってからマージする。ユーザーからはマージ・Actions の手動実行・ログ確認まで任されている。
4. 本番DB・`main` を書き換える操作（マイグレーション、強制push、履歴の書き換え）は、ユーザーの許可なしに行わない。

## 1. プロジェクト概要
- 日本のNFLファン向けの総合情報サイト（2026シーズン運用中）。試合日程・スコア・順位・ロスター・ニュース（AI日本語要約）・YouTube公式ハイライト・プレイオフシミュレーター・選手名鑑（ATLAS）・コーチ系譜・チーム成績比較（FIELDLINE）を扱う。
- 目標: データ同期を完全自動化し、手動メンテ（URLの直書きなど）をなくす。外部サイトへの負荷を抑え、IPブロックを避ける。
- 技術スタック:
  - TypeScript（Node 22）、pnpm 10.4.1（`packageManager` で固定。CIは `--frozen-lockfile`）、tsx
  - 画面: React 19、Vite 7、Tailwind CSS 4、shadcn/ui、wouter（ルーティング）、Lucide アイコン
  - サーバー: Express、tRPC 11、Drizzle ORM、TiDB（MySQL互換）
  - インフラ: Render（Web）。`api/index.js`（`server/api.ts` を esbuild でまとめたもの）は自動更新ボットが毎回作り直してコミットする。`vercel.json` もある
  - 外部API: YouTube Data API（`YOUTUBE_API_KEY`）、Gemini（AI要約、`GEMINI_API_KEY`）。Secrets は GitHub / Render 側で管理し、コードに書かない
- もとは Manus で作られた。ログイン・heartbeat・`vite-plugin-manus-runtime` などに名残があるが、ほぼ使われていない。

## 2. 案内地図（主要ファイル）
| 目的 | 場所 |
|---|---|
| 画面のルーティング | `client/src/App.tsx`（`/`, `/atlas`, `/coaching-tree`, `/fieldline`, `/links`） |
| トップページ | `client/src/pages/Home.tsx`、`client/src/components/Official*.tsx` |
| プレイオフシミュレーター | `client/src/pages/PlayoffMachine.tsx`、`client/src/lib/tiebreaker/`、`server/playoffRouter.ts` |
| tRPC の窓口一覧 | `server/routers.ts`（＋ `*Router.ts`）、サーバーの入口は `server/api.ts` |
| DBの表の定義 | `drizzle/schema.ts`（読み書きは `server/db.ts`） |
| 日程・スコア・順位の取得 | `server/officialLeagueData.ts`（スコア・順位）、`server/officialTeamData.ts`（チーム別日程・ロスター） |
| ニュース・負傷者・出場可否 | `server/officialFeeds.ts`、`server/externalTeamNews.ts`、`server/pftAvailability.ts` |
| AI要約 | `server/geminiSummary.ts`（Gemini。`server/newsJapaneseSummary.ts` は旧Manus経由） |
| ハイライト動画 | `server/nflGameHighlights.ts`（YouTube Data API で照合） |
| シーズン年の判定 | `shared/season.ts` の `nflSeasonFor()`（**7月1日に翌シーズンへ切り替わる**） |
| 自動更新 | `.github/workflows/auto-update.yml`（3時間おき）、`highlights.yml`（試合日に毎時）、`ci.yml`（PR時） |
| 自動更新が呼ぶスクリプト | `scripts/syncAllLeagueSchedules.mjs`、`refreshOfficialLeagueDashboard.mjs`、`refreshPftAvailability.mjs`、`refreshGameHighlights.mjs`、`import-fieldline-season.mjs` |
| 年間の運用カレンダー | `docs/season-operations.md` |

ルート直下の多数の `*.md` は過去の調査メモ。必要なときだけ読む。

## 3. コーディング規約・設計方針（必ず守る）
- **年を直書きしない。** シーズン年・ドラフト年・表示ラベルは `shared/season.ts`（`nflSeasonFor` / `nflDraftYearFor` / `nflSeasonDisplayLabel`）から求める。
- **外部サイトの取得は自動更新（GitHub Actions）側でまとめて行う。** 画面の表示はDBの保存済みデータを読む。外部サイトへのアクセス回数を増やす変更は、負荷とブロックの危険を考えて最小限にする。
- **Actions から呼ぶスクリプトは、最後に必ず `process.exit(0)` を書く。** DB接続が残ってプロセスが終わらず、タイムアウトするのを防ぐため。モジュールの読み込み時に `setInterval` を起動しない。
- 自動更新ボットがコミットしてよいのは `api/index.js` と `.sync_state/` だけ（`git add -A` は禁止）。
- DBの表の形を変えたら、人が確認して手動で `pnpm run db:push` を実行する（自動実行しない）。
- NFL公式ページの解析は、まずURLの形式で判定する（例: 試合URLの `-pre-N` / `-reg-N` / `-post-N`）。ページ内のナビの文言を拾うと誤判定するため。
- プレーオフの週表示は `WILD CARD` / `DIVISIONAL` / `CONF CHAMP` / `SUPER BOWL`。
- 型エラーは0件を保つ（`pnpm check`）。テストは vitest（`pnpm test`）。既存の失敗テストが34件（8ファイル、主に古いUIの監査テスト）あるが、その機能を触るときに直す。**新しく失敗を増やさない。テストを消したり飛ばしたりして通すのも禁止。**
- コメント・コミットメッセージ・PR本文は日本語。周りのコードの書き方に合わせる。

## 4. デザイン・UIのトーン＆マナー
- **スマホ優先**の省スペースUI。余白は詰め、情報は横並びでコンパクトに見せる。
- 配色: 背景は生成り `#f5f2ea`、カードは `#fffdf8`、文字は濃紺 `#10213a`、アクセントはオレンジ `#e85d2a`（淡色 `#ffc1a7`、濃色 `#a84420`）、補助のグレーは `#64748b`。
- フォント: 本文は Noto Sans JP、見出し・数字は Barlow Condensed（`font-display`）、ラベルは IBM Plex Mono（`font-mono`、大文字・字間広め・小さめ）。ATLAS は Manrope / DM Serif Display。
- ラベルは英語の大文字（例: `WATCH HIGHLIGHTS`、`HIGHLIGHTS · 準備中`）、説明は日本語。
- **ネタバレ防止**機能がある。スコアや試合後の記事を出す変更では、ネタバレ防止中に隠れることを必ず確かめる（`docs/spoiler-protection-faq.md`）。
