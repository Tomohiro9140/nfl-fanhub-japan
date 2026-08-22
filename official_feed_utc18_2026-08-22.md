# 公式フィード同期記録 — UTC 18時グループ

確認日時は **2026-08-22 18:02–18:12 UTC** です。対象は NYJ、PHI、PIT、SF、SEA、TB、TEN、WAS です。各チームの公式RSSはHTTP 200で取得でき、最大3件の公開日時・URL・見出しを監査しました。URL単位の失敗はありません。

| チーム | 最新の確認記事 | 公開日時（UTC） | 公式RSS |
|---|---|---|---|
| NYJ | 5 Standout Players in Jets preseason shutout win | 2026-08-22 15:00:00 | https://www.newyorkjets.com/rss/news |
| PHI | Spadaro: 6 things to watch vs. Patriots | 2026-08-22 12:00:00 | https://www.philadelphiaeagles.com/rss/news |
| PIT | Why Graham prefers a bird's eye view | 2026-08-22 17:30:00 | https://www.steelers.com/rss/news |
| SF | What the 49ers and Chargers Had to Say After Preseason Week 2 | 2026-08-21 23:46:07 | https://www.49ers.com/rss/news |
| SEA | Seahawks Place WR Jake Bobo On Injured Reserve; Sign WR Julian Hicks | 2026-08-22 17:21:10 | https://www.seahawks.com/rss/news |
| TB | How to Watch: Tampa Bay Buccaneers vs. Kansas City Chiefs | 2026-08-22 23:29:00 | https://www.buccaneers.com/rss/news |
| TEN | Ten Observations From Friday's Titans vs Seahawks Joint Practice | 2026-08-21 19:52:20 | https://www.titansonline.com/rss/news |
| WAS | Veteran scouts Paul Skansi and Chuck Cook retire | 2026-06-18 16:01:11 | https://www.commanders.com/rss/news |

既存公式同期ロジックは全8チームで成功し、RSS・公式チームデータを含めて156件を処理しました。各チームの `team_official` 最新取得時刻は18:04:58–18:05:02 UTCです。

WASのRSSには2022年記事が先頭に混在していました。解析を公開日時降順へ変更して再同期し、現在の配信中で最も新しい2026-06-18の記事を選ぶことを確認しました。RSSが提供していない新しい記事は推測・生成していません。

NFL公式Injuries一覧にはNYJのBreece Hall、SEAのJake Bobo、TBのEmeka Egbuka、WASのMarcus Mariota等に関する見出しがありました。ただし一覧抽出では個別URL・信頼できる公開日時が取得できなかったため、プレイブックに従い新規 `nfl_official` 項目は保存していません。

## NFL公式負傷情報のチーム別監査

| チーム | NFL公式記事・見出しの確認結果 | 個別URL | 公開日時の取得 | 保存判断 |
|---|---|---|---|---|
| NYJ | Breece Hall groin | https://www.nfl.com/news/breece-hall-groin-expected-to-be-ready-for-jets-week-1-game-vs-titans | ページ上は `Published: Loading...` | 推測せず保存なし |
| PHI | Friday RoundupにTariq Castro-FieldsのIR記載 | https://www.nfl.com/news/nfl-news-roundup-latest-league-updates-from-friday-aug-21 | ページ上は `Published: Loading...` | 推測せず保存なし |
| PIT | 現行Injuries一覧に明確な対象項目なし | — | 対象なし | 保存なし |
| SF | Friday Roundupに明確な対象項目なし | — | 対象なし | 保存なし |
| SEA | Jake Bobo serious knee injury | https://www.nfl.com/news/nfl-news-roundup-latest-league-updates-from-friday-aug-21 | ページ上は `Published: Loading...` | 推測せず保存なし |
| TB | 現行Injuries一覧に見出しはあるが、検証可能な個別NFL.com URLなし | — | URL・日時未取得 | 保存なし |
| TEN | Nazeeh JohnsonのIR記載 | https://www.nfl.com/news/nfl-news-roundup-latest-league-updates-from-friday-aug-21 | ページ上は `Published: Loading...` | 推測せず保存なし |
| WAS | 現行Injuries一覧に見出しはあるが、検証可能な個別NFL.com URLなし | — | URL・日時未取得 | 保存なし |

2026-08-22時点で、上記の記事本文はチーム対応を確認できましたが、Web抽出で公開日時を信頼できる形で得られませんでした。既存の保存処理も、記事本文内の構造化公開日時を得られない場合には新規 `nfl_official` 項目を保存しません。
