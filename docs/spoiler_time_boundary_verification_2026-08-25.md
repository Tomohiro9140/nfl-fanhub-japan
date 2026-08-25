# LATEST NEWS ネタバレ防止・時刻境界検証

## 結論

LATEST NEWS のネタバレ防止は、**記事公開時刻 `publishedAt` と NFL 公式スコアボードが最初に FINAL を確認した時刻 `finishedAt` を UTC の絶対時刻（epoch milliseconds）として比較**する。画面の JST は `Intl.DateTimeFormat` による表示専用であり、判定に使用しない。

従来の `gameDate` から UTC 00:00 を作るフォールバックは削除した。これは、米国での日付と無関係に、たとえば 17:00 UTC にキックオフする試合の 13:42 UTC の試合前記事を、00:00 UTC 以後という理由だけで隠してしまう不具合を防ぐためである。

## 確定仕様

| 試合状態 | `finishedAt` | ネタバレ防止ONのLATEST NEWS | 時刻比較 |
|---|---:|---|---|
| UPCOMING / LIVE | 不要 | 通常どおり表示 | フィルタなし |
| FINAL / COMPLETED | あり | `publishedAt < finishedAt` のみ表示 | UTC epoch比較 |
| FINAL / COMPLETED | なし | 時刻推測をしないため通常どおり表示 | フィルタなし |

> `publishedAt === finishedAt` は非表示にする。FINAL確定と同時刻以後の記事は結果を含むおそれがあるためである。

この仕様では、**試合開始直前の記事は表示される**。また、FINAL確定前に公開された試合中記事も表示対象である。試合中の記事本文自体にスコアが含まれる場合まで遮断する仕様ではない。

## 実データ照合: BUF @ CLE

2026年8月22日の BUF @ CLE について、公式スコアキャッシュはキックオフを `2026-08-22T17:00:00Z`、初回FINAL確認を `2026-08-22T20:57:53Z` と保持していた。以下の記事公開時刻は DB の UTC 表記である。

| UTC公開時刻 | JST表示 | 記事 | FINAL時刻基準での扱い |
|---|---|---|---|
| 2026-08-22T13:42:00Z | 8/22 22:42 JST | Where to watch, stream & listen | 表示 |
| 2026-08-22T16:29:21Z | 8/23 01:29 JST | Statement from the Buffalo Bills on Ed Oliver | 表示 |
| 2026-08-22T21:09:56Z | 8/23 06:09 JST | Bills 31, Browns 7 — Final score… | 非表示 |
| 2026-08-22T22:46:18Z | 8/23 07:46 JST | The Bills reflect on the … preseason victory | 非表示 |

この実例では、旧来の `gameDate = 2026-08-22` → `2026-08-22T00:00:00Z` という誤った境界なら、キックオフ前の 13:42 UTC 記事まで隠れていた。修正後は 20:57:53 UTC より後だけを隠す。

## 自動回帰テスト

`OfficialTeamFeed.audit.test.ts` は以下の境界を固定値で検証する。

| 時刻 | テスト上の状態 | 期待結果 |
|---|---|---|
| 16:59:59 UTC | キックオフ1秒前 | 表示 |
| 18:30:00 UTC | 試合中 | 表示 |
| 20:12:00 UTC | FINAL確認と同時 | 非表示 |
| LIVE | FINAL未確認 | フィルタなし |
| FINALかつ `finishedAt = null` | 終了時刻不明 | フィルタなし |

2026-08-25 の検証では、Vitest **155件**、TypeScript型チェック、production build がすべて通過した。

## 画面確認範囲

モバイル 390×844 とPC 1280×720で、ネタバレ防止ONの LATEST NEWS レイアウトを確認した。確認時点のBUFは水曜06:00 JST後のため GAME TICKET が次戦へ切り替わっており、現在のリプレイ保護対象ではない。よって実画面には次戦向け記事と過去FINAL後の記事が通常表示される。これは、過去試合のFINAL時刻を長期間使って次戦の記事まで隠さないための既存仕様である。

FINAL表示中の境界は、同じReactコンポーネントを実際のURL付きアンカーとして静的レンダリングする回帰テストで確認した。試合前・試合中URLは残り、FINAL時刻以後のURLはHTMLへ出力されないため、クリック導線も生成されない。
