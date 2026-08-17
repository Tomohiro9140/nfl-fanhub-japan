# GAME TICKET 見逃し視聴検証

2026-08-17に、Buffalo Bills対Carolina Panthersのプレシーズン第1週の公式FINAL結果を実データで確認した。ネタバレ防止中は、GAME TICKETが`LAST GAME`、試合日時、`FINAL · ネタバレ防止中`を表示し、スコアを表示しない。保持中の終了試合には、公式インアクティブ、Game Center、`DAZN REPLAY`、`VIEWED · SHOW NEXT`の導線が同時に表示される。

ネタバレ防止を解除した状態では、試合日のみを上段へ表示し、その下に大きな公式スコアを出す。`VIEWED · SHOW NEXT`は保持中の結果を手動でスキップして次の未完了試合を表示するための操作であり、選択状態はチーム別にこの端末へ保存する。

ネタバレ防止を解除した実画面では、中央列が`8/16(日)`、`14 — 29`、`FINAL SCORE`の順で描画されることを確認した。`VIEWED · SHOW NEXT`を押すと確認メッセージを出し、保持中の終了試合をスキップして次の未完了試合を取得する処理へ切り替わることを確認した。

視聴済み状態で次戦を表示している時は、GAME TICKET右上のDAZNリンク直下に`RETURN TO LAST GAME`が表示される。これを押すとチーム別に保存した視聴済み状態を解除し、保持中の終了試合へ戻す。

LAST GAMEへ戻したBuffalo対Carolinaの実データでは、右上にDAZN、個別NFL公式動画URLの`WATCH HIGHLIGHTS`、`VIEWED · SHOW NEXT`が縦に並ぶことを確認した。ネタバレ解除時は、勝利したBuffalo Billsのチーム名とスコア`29`だけをエンドゾーンオレンジで控えめに強調し、敗戦側の`14`は標準色で表示する。
