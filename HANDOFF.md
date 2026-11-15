# HANDOFF.md — シフト申し送り（毎回上書き）
最終更新: 2026-11-16 / Claude

## 現在作業中の機能と背景
- 作業中の機能はない。直近は「試合中にキックオフ時刻が仮の時刻に書き換わり、ネタバレ防止が効かなくなる不具合」を直した。
- 背景: NFL公式の日程ページは、試合が始まるとその試合のカードから開始時刻が消える。以前はそのとき「その週の日曜18:00:59Z」の仮の時刻で上書きしていた（2026 Week 10 のドイツ開催 NE@DET で発生。実際は14:30Z）。

## このシフトで完了したこと
- `shared/kickoff.ts`（新規）: 秒59＝仮の時刻の判定 `isEstimatedKickoff`。
- `server/officialKickoffs.ts`（新規）: 確定時刻を仮の時刻で上書きしない `preserveKnownKickoffs`、ESPN から確定時刻を補う `fetchEspnWeekKickoffs` / `planKickoffRepairs`。
- `server/db.ts`: `replaceOfficialGamesForTeam` で確定時刻を保持。`repairEstimatedOfficialGameKickoffs` を追加。
- `server/officialLeagueData.ts`: 順位・スコア更新（自動更新の Step 2、毎回実行）で仮の時刻を ESPN の時刻に直す。
- `server/officialTeamData.ts`: 日付しか読めないときも仮の時刻（秒59）にする。
- `client/src/components/OfficialTeamFeed.tsx`: 仮の時刻しかない試合は、4日前からネタバレ防止を効かせる。
- `client/src/components/OfficialGameExperience.tsx`: 仮の時刻のときは「日時確認中」と表示し、カウントダウンを出さない。
- テスト: `server/officialKickoffs.test.ts`、`client/src/components/spoilerKickoff.test.ts`。

## 次のシフトでやること
- 急ぎの追加作業はない。ユーザーの新しい依頼を優先する。
- **11/26（サンクスギビング）前後**: 木曜の3試合（GB@LAR は水曜夜）で、試合中もキックオフ時刻が変わらず、ネタバレ防止が効くか確認する。自動更新 Step 2 のログの `kickoffRepairs` も見る。
- **2027年1月上旬（Week 18 終了後）**: プレーオフ進出チームのトップページに次の試合が出るか確認。出なければ `server/officialTeamData.ts` の `parseNFLLeagueSchedulePage` を、実際の各ラウンドのページ形式を確かめてから補う。
- **2027年6月中**: `docs/season-operations.md` の「6月中」の作業。

## 注意点
- 既存の失敗テストは34件（8ファイル）。新しい失敗を増やさない。
- 外部ページの形式を調べるときは、作業ブランチへの push でだけ動く一時的な Actions を使い、調査後に削除する。
- GitHubの定期実行は予定より少ないことがある。
