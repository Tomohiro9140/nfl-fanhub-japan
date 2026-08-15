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
