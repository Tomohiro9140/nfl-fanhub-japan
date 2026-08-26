# Game Stats — Official Source Verification

## 2026-08-26

NFL公式Game Centerの終了試合ページを確認した。

- 対象: [Seattle Seahawks at Tennessee Titans — 2026 PRE 2](https://www.nfl.com/games/seahawks-at-titans-2026-pre-2?tab=stats)
- Game Centerは `STATS` タブを公開している。
- 画面上で `GAME STATS`、チーム切替、Passingの `PLAYER / CMP / ATT / YDS / CMP% / AVG / TD / INT / SACKS / RATING` を確認した。
- 同ページはスコア・ゲーム結果・試合情報も公開している。

この確認により、Game StatsはNFL公式Game Centerを唯一の表示根拠とし、結果確定試合だけを対象にする。アプリ側では外部画面の埋め込みではなく、必要な公開数値を取得・保存して、モバイル向けの詳細ビューに整形して表示する。

## 確認済み公開データ経路

Game Centerがブラウザから取得した公開JSONを確認した。

- `https://api.nfl.com/experience/v1/gamedetailsbyslug/{slug}?includeReplays=true`
- `https://api.nfl.com/experience/v2/gamedetails/{id}?includeDriveChart=false&includeReplays=true&includeStandings=false&includeTaggedVideos=true`

後者はHTTP 200で、`id`、両チーム、日付、試合状態、週、`externalIds`、`summary`を返した。個人成績・チーム比較の詳細フィールドは、このGame Detailsを起点にページが要求する追加の公開JSONから確認して実装する。

ページが実際に要求したNFL公式APIは、Game Details、週単位のGame Details、Replay/Highlightの各経路だった。スタッツ専用の別URLはブラウザのネットワーク要求として確認できなかったため、Game CenterのSSRデータまたは週単位Game Detailsにスタッツが含まれるかを次に確認する。

## 公式Game Bookによる全項目の補完

同じGame Center HTMLには、公式Game Book PDFが含まれる。

- [SEA at TEN Game Book PDF](https://static.www.nfl.com/image/upload/v1787571857/gamecenter/c74e206e-5f68-11f1-b1d0-bb70a4640075.pdf)
- Game Bookは `TOTAL FIRST DOWNS`、`THIRD DOWN EFFICIENCY`、`TOTAL NET YARDS`、`NET YARDS RUSHING`、`NET YARDS PASSING`、`Times thrown-yards lost attempting to pass`、`Penalties-Number and Yards`、`Fumbles-Number and Lost` を両チーム比較として公開している。
- 個人成績はPassing、Rushing、Receiving、Defenseを両チームで公開しており、DefenseにはTOT、SOLO、SACKS、PD、INT、FFを含む。
- Game Centerの埋め込みJSONテーブルはPassing、Rushing、Receiving、Fumbles、Interceptions、Defenseなど40テーブルを構造化して含むことを確認した。

実装ではGame CenterからGame Bookの公式URLを抽出し、必要なチーム比較をPDFテキストから、個人成績を埋め込みJSONテーブルから取得する。公開済みの数値のみを整形保存し、記事本文・Game Book全文は保存しない。
