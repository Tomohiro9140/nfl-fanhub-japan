# 公式フィード同期記録 — UTC 18時グループ

確認日時は **2026-08-25 18:04–18:14 UTC** です。対象は NYJ、PHI、PIT、SF、SEA、TB、TEN、WAS です。全8チームの公式RSSはHTTP 200で取得でき、RSS内の公開日時で降順に最大3件を選択しました。失敗した公式RSS URLはありません。

| チーム | 公式RSS URL | 最新3件（UTC） |
|---|---|---|
| NYJ | https://www.newyorkjets.com/rss/news | 8/24 21:30 — Jets Practice Report \| Geno Smith Leads Crisp Touchdown Drive in 2-Minute Drill to End Practice<br>8/24 20:58 — What Has Been Aaron Glenn's Impact Been On the Defense Since Returning to Playcalling?<br>8/24 20:55 — Jets Pass-Catching LG Dylan Parham Goes Where Few O-Linemen Get to Go |
| PHI | https://www.philadelphiaeagles.com/rss/news | 8/24 22:30 — Spadaro: Savor the moment before the Eagles' offense takes flight<br>8/24 22:00 — Eagles sign DB Jaylen Mahoney, RB Jordan Mims<br>8/24 21:15 — Makai Lemon returns to full participation at practice |
| PIT | https://www.steelers.com/rss/news | 8/25 18:01:15 — Back on the road for the first time<br>8/25 15:00:36 — Roster moves continue<br>8/25 10:05 — Asked and Answered: Aug. 25 |
| SF | https://www.49ers.com/rss/news | 8/25 18:00:23 — Christian McCaffrey Steps Into New Role With a Signature Shoe \| Off the Field<br>8/25 16:35:02 — Ways to Watch and Listen \| 49ers vs. Raiders: Preseason Week 3<br>8/25 15:15 — 49ers Announce Trade for LB Deion Jones |
| SEA | https://www.seahawks.com/rss/news | 8/25 17:26 — How To Watch, Listen And Follow Seahawks at Chiefs In Preseason Week 3 On Friday, August 28<br>8/25 17:00 — Seahawks Celebrate The Season With "Countdown to Kickoff"<br>8/24 20:53:37 — Fantasy Football Sleepers, Value Picks for 2026 |
| TB | https://www.buccaneers.com/rss/news | 8/25 17:35 — Bucs Add Rookie Receiver Matthew Henry<br>8/23 18:00 — Takeaways from Buccaneers-Chiefs \| Preseason Week 2<br>8/23 17:31:18 — Buccaneers' Next Game: Tampa Bay Faces Jacksonville in Preseason Finale |
| TEN | https://www.titansonline.com/rss/news | 8/25 15:26:08 — Titans Sign LB Dyontae Johnson, Waive/Injured LB Dominique Hampton<br>8/25 13:57:07 — Titans To Wear "Music City" Rivalries Uniform Nov. 15 vs. Jaguars<br>8/24 20:19:09 — Titans Sign LB Reid Carrico, Place LB Milo Eifler on Injured Reserve |
| WAS | https://www.commanders.com/rss/news | 6/18 16:01:11 — Veteran scouts Paul Skansi and Chuck Cook retire<br>5/22 19:30:04 — Stafford, Virginia natives Michelle Boateng and Chris Hicks relish "surreal" Bill Walsh Fellowship opportunity<br>4/11 12:57:38 — Behind the Build Q&A: Andy VanHorn, Commanders Head of Real Estate |

PITはグループ同期ではRSS部分が0件でしたが、RSS URL自体はHTTP 200で最新3件を確認できました。負傷ページ待機を伴わない `refreshOfficialTeamNews("PIT")` を再実行し、12件を保存しました。その後の `team_official` 保存時刻はPITが18:14:03 UTC、その他7チームが18:12:23 UTCとなり、全8チームが今回の同期対象として更新済みです。

## PITの初回0件と再発防止

最初のグループ同期ではPITのフィード件数が0でしたが、同時に日程取得は成功したため、当時の実装はフィード側の失敗理由を結果へ残していませんでした。そのため最初の一時的なRSS取得失敗の例外文字列を事後に復元することはできません。直後のPIT公式RSS監査はHTTP 200で最新3件を返し、RSSのみを再同期した結果は12件でした。

再発防止として、`refreshOfficialTeamFeedGroup` はRSS処理が失敗して日程・ロスター処理だけが成功した場合でも、`feedError` をチーム別結果へ返すよう更新しました。診断付きのグループ再同期ではNYJ・PHI・PIT・SF・SEA・TB・TEN・WASがすべて `ok: true`、PITは12件で完走し、`feedError` は出力されませんでした。今後は一時的な公式RSSの失敗理由を運用ログで識別できます。

開発サーバーログには初回の一時スクリプト実行時のPIT例外文字列は保存されておらず、当時の結果オブジェクトもRSS側の失敗理由を返していませんでした。そのため、初回0件が「RSS HTTPエラー」「空の一時配信」などのどちらであったかは、推測せず**事後確定不能**と判定しました。確認できる事実は、PIT日程取得が成功していた一方でフィード処理が0件となったこと、直後のRSS URLがHTTP 200で最新3件を返したこと、RSSのみの再同期と診断付きグループ再同期が12件で成功したことです。

この観測不能性を再発させないため、RSS失敗・日程成功の組み合わせで `feedError` がチーム別結果に残る単体テストを追加し、154テスト、型チェック、本番ビルドを通過しました。

NFL公式Injuries一覧にはNYJのBreece Hall、SEAのJake Bobo、TBのEmeka Egbuka、WASのMarcus Mariotaなど対象チームに関連する見出しがありました。しかし個別記事URLと信頼できる公開日時を同時に取得できなかったため、公開日時を推測せず新規 `nfl_official` 項目は保存していません。
