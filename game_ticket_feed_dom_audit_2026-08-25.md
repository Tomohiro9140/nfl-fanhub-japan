# Game Ticket・公式記事重複の実行DOM監査

確認日時は **2026-08-25 15:10 UTC** です。BUF・NYJ・SEAの推しページを、390pxモバイル幅と1280px PC幅で実行DOMとして確認しました。

| チーム | モバイル | PC | Game Ticket | LATEST NEWS | INJURY RELATED |
|---|---|---|---|---:|---:|
| BUF | `min-h-[320px]` を2箇所確認 | `min-h-[320px]` を2箇所確認 | LAST GAME 1件 | 見出し1件 | 見出し1件 |
| NYJ | `min-h-[320px]` を2箇所確認 | `min-h-[320px]` を2箇所確認 | LAST GAME 1件 | 見出し1件 | 見出し1件 |
| SEA | `min-h-[320px]` を2箇所確認 | `min-h-[320px]` を2箇所確認 | NEXT GAME 1件 | 見出し1件 | 見出し1件 |

`min-h-[320px]` は外側のGame Ticketと内側レイアウトの双方に適用され、ネタバレ表示の分岐に関わらず高い方のレイアウト高さを確保します。DB側の同一URL重複109行を削除したうえで、サーバー側URL・正規化タイトル重複除外と、クライアント側の表示保護を二重化しています。

## 記事行のURL一意性

`data-feed-article` と `data-article-url` を持つ実行DOMのカード行だけを抽出し、390px／1280pxの双方で総数とユニークURL数を照合しました。全行で **total = unique** です。

| チーム | LATEST NEWS（モバイル / PC） | INJURY RELATED（モバイル / PC） | 判定 |
|---|---:|---:|---|
| BUF | 5 / 5 URLs（各5 / 5） | 0 / 0 URLs（各0 / 0） | 重複なし |
| NYJ | 5 / 5 URLs（各5 / 5） | 3 / 3 URLs（各3 / 3） | 重複なし |
| SEA | 5 / 5 URLs（各5 / 5） | 3 / 3 URLs（各3 / 3） | 重複なし |

NYJのINJURY RELATEDでは8/18 Practice Report、8/19 Practice Report、T'Vondre Sweatの記事が1行ずつ、SEAではJake BoboのIR記事、Robbie OuztsのIR記事、Jake Boboのinjury記事が1行ずつ描画されました。同じURLが重複していた以前の行は存在しません。

複数チーム向けの画面出力回帰では、BUF・NYJ・SEAそれぞれでURL重複と正規化タイトル重複を注入し、LATEST NEWS・INJURY RELATEDの出力リンクが各記事につき1件になることを確認しています。最終検証は **152 tests passed** です。
