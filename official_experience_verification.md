# 公式試合・ロスター表示の検証記録

検証日時：2026-08-15 23:06 UTC（2026-08-16 08:06 JST）

## Buffalo Bills の公式データ表示

チーム公式の[Schedule](https://www.buffalobills.com/schedule/)と[Roster](https://www.buffalobills.com/team/players-roster/)をサーバー側で取得し、`teamSnapshot.byTeam` APIが以下の実データを返すことを確認した。

| 表示領域 | 検証済みの内容 | 公式参照元 |
| --- | --- | --- |
| GAME TICKET | BUF @ CLE、Preseason Week 2、2026-08-23 02:00 JST、Huntington Bank Field | Bills Schedule |
| YOUR HUDDLE | 次戦日時、チーム公式RSS／NFL公式Injury Reportの最新負傷更新 | Schedule / Official Feed |
| GAME NOTES | 次戦、公式負傷者記事、公式チームニュースをそれぞれ原文リンク付きで表示 | Schedule / Official Feed |
| STATUS RADAR | 93名の公式ロスター、Active 90／Reserve-Injured 1／Reserve-Non-Football Injury 1／Reserve-PUP 1、実名・背番号・ポジション | Bills Roster |

## 未取得時の扱い

初回の公式データ取得前は、GAME TICKETに`OFFICIAL SCHEDULE PENDING`、STATUS RADARに公式Rosterの待機状態を表示する。対戦相手・開始時刻・選手状態を代替の固定値で埋めない。初回取得後のモバイル表示では、上記の実データに置き換わることを確認した。

## デモ表記の除去

固定されたPRESEASON W1、架空の対戦相手、`QB/RB/CB`のダミー選手状態、`DEMO`バッジ、`DEMO DATA`フッターを削除した。残るデータは公式キャッシュまたは取得待機状態のみである。

## UTCグループ代表チームの取得確認

各UTCグループから1チームを選び、チーム公式ScheduleとRosterをサーバー側で取得・保存する診断を実行した。結果はすべて `errors=0` だった。

| UTCグループ | 代表チーム | Schedule件数 | Roster件数 |
| --- | --- | ---: | ---: |
| 00時 | BUF | 18 | 93 |
| 06時 | DAL | 19 | 93 |
| 12時 | NO | 18 | 95 |
| 18時 | SEA | 19 | 93 |

New Orleans Saintsは `neworleanssaints.com` を使用し、次戦 `NO @ LAR` と公式Roster 95件を取得できた。全32チームの公式ドメインは、チーム数・重複なし・Saintsの正しいドメインを確認する回帰テストで保証している。

## STATUS RADARとGAME NOTESの補足

`STATUS RADAR`には、公式Rosterの選手と区分に加えて、チーム公式・NFL公式Injury Report由来の負傷関連項目、公開日時、公式原文リンクを表示する。`GAME NOTES`は取得時刻をヘッダーに表示し、データ未取得時には各行で待機理由と「次回公式取得後に参照リンクが利用可能になる」ことを明示する。固定の分析文・固定選手ステータスは表示しない。

## NFL公式リーグ日程の優先とフォールバック確認

2026年8月16日にNFL公式の全32チーム別日程を初回同期し、将来試合544件を保存した。32チームすべてでNFL公式`nfl.com/schedules/`を参照する次戦が保存され、Buffaloでは`BUF @ CLE · 8/23(日) 02:00 JST`が通常モバイル画面に`NFL OFFICIAL SCHEDULE`として表示された。

リーグ公式日程が未取得の場合を実証するため、Arizonaのリーグ公式日程キャッシュをチーム公式Schedule由来の18件へ一時的に切り替えた。通常モバイル画面では`ARI VS DAL · 8/23(土) 11:00 JST`と`TEAM OFFICIAL SCHEDULE`を確認した。その後、Arizonaの日程はNFL公式の18件へ復元した。

さらにArizonaの試合キャッシュを一時的に空にして通常モバイル画面を確認した。`OFFICIAL SCHEDULE PENDING`と「NFL公式リーグ日程とチーム公式Scheduleを確認後に表示します。」が出て、固定値は表示されなかった。確認後、NFL公式日程を再取得して復元した。

### 通常モバイル画面の抽出証跡

フォールバック状態の通常モバイル画面から、`ARI VS DAL`、`8/23(日) 11:00`、`BROADCAST TBA · TEAM OFFICIAL SCHEDULE`、公式リンク`https://www.azcardinals.com/schedule/`を抽出した。同じ画面の`GAME NOTES`にも`ARI VS DAL`と`OFFICIAL SOURCE`が表示され、チーム公式日程の保存結果と一致した。

空キャッシュ状態の通常モバイル画面から、`ARI / NEXT GAME`、`OFFICIAL SCHEDULE PENDING`、`NFL公式リーグ日程とチーム公式Scheduleを確認後に表示します。`、`次戦情報をNFL公式リーグ日程から取得中です`、`OFFICIAL SCHEDULE PENDING`（GAME NOTES）を抽出した。対戦相手・開始時刻・会場などの固定値は表示されなかった。確認直後にArizonaのNFL公式日程18件を再取得し、通常状態へ復元した。

### teamSnapshot APIと通常UIの対応付け

Arizonaをチーム公式フォールバックへ切り替えた同一時点で、`teamSnapshot.byTeam` APIの`nextGame.sourceUrl`は`https://www.azcardinals.com/schedule/`を返した。通常モバイルUIも`ARI VS DAL`、`8/23(日) 11:00`、`TEAM OFFICIAL SCHEDULE`、同じ公式Scheduleリンクを表示した。

Arizonaの`official_games`を空にした同一時点では、同APIが`nextGame:null`を返した。通常モバイルUIは`OFFICIAL SCHEDULE PENDING`と「NFL公式リーグ日程とチーム公式Scheduleを確認後に表示します。」を表示し、対戦カード・日時・会場は表示しなかった。いずれの検証後も`refreshOfficialTeamData.mjs ARI`でNFL公式リーグ日程18件へ復元した。
