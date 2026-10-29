# シーズン運用カレンダー

レギュラーシーズン終了からポストシーズン・オフシーズン、翌シーズン開幕までに、何が自動で切り替わり、何を人が確認・更新するかをまとめる。

## 自動で切り替わるもの

| 仕組み | 内容 | 場所 |
|---|---|---|
| シーズン年 | **7月1日（UTC）** に翌シーズンへ切り替わる。1〜6月は直前シーズンを表示し続ける | `shared/season.ts` の `nflSeasonFor()` |
| プレーオフの試合 | 試合URLの `-post-1`〜`-post-4` から、`WILD CARD` / `DIVISIONAL` / `CONF CHAMP` / `SUPER BOWL` として保存する | `server/officialLeagueData.ts` の `phaseAndWeek` |
| プレーオフ結果の補完 | 1〜2月は各ラウンドのページ（wild-card-weekend など）も読み、取りこぼしを防ぐ | `refreshOfficialLeagueDashboard` |
| ハイライト | 土曜開催（12月下旬〜プレーオフ）を含めて、試合のある時間帯に毎時取り込む | `.github/workflows/highlights.yml` |
| FIELDLINE 集計 | 集計するシーズン年を自動で決める | `scripts/import-fieldline-season.mjs` |
| ドラフト年・表示ラベル | シーズン年から「2027 NFL DRAFT」「2026-27シーズン」などを作る | `nflDraftYearFor()` / `nflSeasonDisplayLabel()` |

## 時期ごとの確認・作業

### 1月上旬（Week 18 終了直後）
- [ ] プレーオフ進出チームのトップページ（Game Ticket・次の試合）に、ワイルドカードの対戦が出るか確認する
  - 次の試合は、チーム別日程ページ（`/schedules/{season}/by-team/...`）から取っている
  - 2025シーズンの同じページにはプレーオフの試合が載っていなかったため、**出ない可能性がある**。出なければ、各ラウンドのページから次の試合を補う処理を追加する（そのときの実際のページで形式を確かめてから作る）
- [ ] 結果一覧に、ワイルドカードの試合が `WILD CARD` と表示されるか確認する（試合当日の夜）
- [ ] ハイライトが紐付くか確認する。Actions の「NFL Highlights Update」のログで `✅` / `❌` を見る

### 1月中旬〜2月（ディビジョナル〜スーパーボウル）
- [ ] ラウンドごとに、結果とハイライトが出ているか確認する
- [ ] プレイオフシミュレーターと勝敗予想は、シーズン終了後も今季のまま表示される（7月まで）

### 2月（スーパーボウル後）〜6月：オフシーズン
- 順位・結果・日程は、直前シーズンの最終状態を表示し続ける（7月1日まで切り替わらない）
- 3時間ごとの自動更新とハイライトの照合はそのまま動く。試合がないので、処理はすぐ終わる
- [ ] 5月の翌年日程発表後も、トップページとシミュレーターが直前シーズンのままか確認する

### 6月中（7月1日の切り替え前）
- [ ] `client/src/pages/PlayoffMachine.tsx` の `TRADED_PICKS_BY_DRAFT_YEAR` に、翌年ドラフトの1巡目トレード情報を追加する（例: 2027シーズン → `2028: {...}`）
- [ ] `client/src/components/PlayoffPredictionModal.tsx` のスーパーボウルのロゴ画像（`/superbowl2026.webp`）を、翌シーズンのものに差し替える
- [ ] `client/src/data/coachRegistry.ts` などの、年ごとに調べて書いているデータを更新する
- [ ] フッターの `© 2026`（`Home.tsx` / `EmbeddedAppNav.tsx`）を必要なら更新する

### 7月1日以降（新シーズン）
- [ ] 順位表が新シーズン（0勝0敗）になり、日程が新シーズンのものに入れ替わったか確認する
- [ ] プレイオフシミュレーターが新シーズンの日程を読み込んでいるか確認する
- [ ] 8月のプレシーズン開始後、プレシーズンの結果が表示されるか確認する

## 参考：NFL公式ページの形式（2025シーズンで確認済み）

- ラウンド別ページ: `https://www.nfl.com/schedules/{season}/by-week/{wild-card-weekend | divisional-playoffs | conference-championships | super-bowl-sunday}`
- 試合URL: `/games/rams-at-panthers-2025-post-1`（`post-1` = ワイルドカード、`post-2` = ディビジョナル、`post-3` = カンファレンス決勝、`post-4` = スーパーボウル）
- スコアの書き方はレギュラーシーズンと同じ（`Rams 34, Panthers 31, FINAL, Saturday, January 10th`）
- `/schedules/{season}/POST1` 形式のURLは使えず、トップの日程ページへ転送される
