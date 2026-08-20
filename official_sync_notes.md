# Official RSS Sync Notes

## 2026-08-20 UTC 06:06 Group

対象はDAL、DEN、DET、GB、HOU、IND、JAX、KCです。公式RSSは各チームの `https://www.<team-domain>/rss/news` を使用し、収集結果は `/home/ubuntu/collect_six_utc_team_rss.json` に保存されています。NFL公式負傷者ページは `https://www.nfl.com/injuries/` を確認しましたが、対象チームの公開日時・個別URLを検証できる新しい記事は保存していません。

既存キャッシュより新しい公式チームRSS記事16件を `team_official` としてUPSERTしました。内訳はDEN 2件、DET 3件、GB 2件、HOU 1件、IND 3件、JAX 3件、KC 2件で、DALは新規候補なしです。INDの「Colts sign 6-time Pro Bowl WR Keenan Allen」はtransaction、残り15件はnewsです。取得に失敗した公式RSS URLはありません。
