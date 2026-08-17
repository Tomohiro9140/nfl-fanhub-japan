# UTC 18時グループ公式RSS収集記録（2026-08-17）

## 対象時刻と前半4チーム

2026-08-17 18:04 UTCのため、対象はNYJ、PHI、PIT、SF、SEA、TB、TEN、WASとした。チーム公式RSSのみを保存候補とし、チームごとに公開日時の新しい記事を最大3件まで扱う。

| チーム | 公式RSS | 確認結果 | 保存判断 |
|---|---|---|---|
| NYJ | https://www.newyorkjets.com/rss/news | 2026-08-17のPractice Report、Jeremy Ruckert、Brian Duker記事を確認 | 上位3件を候補化 |
| PHI | https://www.philadelphiaeagles.com/rss/news | 2026-08-17のJihaad Campbell、Isaiah BoldenのRoster Move、Radiothon記事を確認 | 上位3件を候補化 |
| PIT | https://www.steelers.com/rss/news | 2026-08-17のTraining Camp、Community Corner、Coordinators記事を確認 | 上位3件を候補化 |
| SF | https://www.49ers.com/rss/news | 最新公開日時が2025-07-24で、現在時点から45日を大きく超過 | 保存しない |

SFの公開RSSは取得自体には成功したが、鮮度の基準を満たさないためエラーではなく保存見送りとする。

## 後半4チーム

| チーム | 公式RSS | 確認結果 | 保存判断 |
|---|---|---|---|
| SEA | https://www.seahawks.com/rss/news | 最新公開日時が2025-07-24で鮮度を満たさない | 保存しない |
| TB | https://www.buccaneers.com/rss/news | 2026-08-17のTristan Wirfs練習復帰、David Walker、Training Camp Updates記事を確認 | 上位3件を候補化 |
| TEN | https://www.titansonline.com/rss/news | 2026-08-17のCorey Mayfield Jr.契約、Mailbag、IR登録を含むRoster Move記事を確認 | 上位3件を候補化 |
| WAS | https://www.commanders.com/rss/news | フィード先頭に2022年・2026年6月の記事が混在し、45日以内の現行記事を確認できない | 保存しない |

SEAとWASのRSSは接続に失敗していないが、鮮度の基準を満たす記事がないため保存見送りとする。

## 直接XML解析による最終判定

ブラウズ用の抽出経路ではSF・SEAに古いフィード内容が返ったが、同じ公開RSSを通常のXML取得で再確認したところ、両チームとも2026-08-16〜17の現行記事を返した。この直接取得結果を保存判断の正本とする。保存候補はNYJ、PHI、PIT、SF、SEA、TB、TENの各3件、合計21件である。WASのみ45日以内の記事を確認できず保存を見送る。

NFL公式負傷ページは対象8チームに関連する見出しを返したが、今回のページ抽出では個別記事URLと公開日時を同時に検証できなかった。そのため、推測によるNFL公式負傷項目の追加は行わない。
