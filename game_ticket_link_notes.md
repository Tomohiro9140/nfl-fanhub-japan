# Game Ticket Link Notes

2026-08-18に、GAME CENTERとOFFICIAL SCHEDULEが同じ`nextGame.sourceUrl`を参照していたことを確認した。GAME TICKETでは重複リンクを廃止し、`/games/`のNFL公式試合ページでは`NFL GAME CENTER`、それ以外の日程URLでは`OFFICIAL SCHEDULE`を1つだけ表示する。

390px幅の保持中の終了試合で、INACTIVESの隣に`NFL GAME CENTER`だけが表示されることを確認した。

同日の余白調整で、固定最小高をモバイル248px（sm以上260px）へ圧縮した。外側の高さはネタバレ状態に依存せず、ヘッダー・試合情報・状態リンク群を`justify-between`で均等配分する。390px幅の保持中終了試合で、罫線下の余白が過剰にならず、試合情報の上下にも均等な空きがあることを確認した。
