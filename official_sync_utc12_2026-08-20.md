# UTC 12時グループの公式同期メモ

- 実行時刻: 2026-08-20 12:04 UTC
- 対象: LAC, LAR, LV, MIA, MIN, NE, NO, NYG
- NFL公式負傷者ページ: `https://www.nfl.com/injuries/` を直接確認。
- ページの動的カルーセルにはMIA、NO、NYG、LACなど対象チーム名を含む傷病記事カードが表示されたが、この表示時点では個別公開日時と記事URLを同時に検証できていない。
- 公開日時・個別URL・対象チームの明確な対応を検証できるまで、NFL公式負傷者ページ由来の項目は保存しない。

## 保存結果

公式チームRSSで検証した21件を`team_official`としてUPSERTした。保存対象はLAC、LAR、LV、MIN、NE、NO、NYGの各3件であり、MIAは`https://www.miamidolphins.com/rss/news`がHTTP 403およびCaptchaのため、推測保存を行わなかった。

NFL公式負傷者ページの対象記事候補は個別URLまで確認できたが、MIAは2024年Week 17、NYGおよびNOは2024年記事と本文で判明した。LAC候補は公開日時を取得できなかった。2026年の新規公開日時を確認できる対象記事がなかったため、`nfl_official`の追加保存は0件とした。
