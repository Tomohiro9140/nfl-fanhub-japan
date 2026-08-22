# NFL公式負傷情報確認記録 — UTC 06時グループ

確認日時は **2026-08-22 06:08 UTC** です。NFL公式Injuries一覧と個別NFL.com記事を確認しました。対象チームへ明確に対応付けられる内容は下表のとおりですが、取得可能なページ本文では `Published` が `Loading...` のままで、信頼できる公開日時を取得できませんでした。プレイブックの「公開日時を保存する」「推測しない」原則に従い、今回の `nfl_official` 新規UPSERTは行いません。

| チーム | 確認結果 | 個別NFL公式URL | 保存判断 |
|---|---|---|---|
| DAL | 現在のInjuries一覧に明確な対象項目なし | — | 保存なし |
| DEN | Taylor Rappの契約、Levelle Baileyのinjury designation | https://www.nfl.com/news/nfl-news-roundup-latest-league-updates-from-thursday-aug-20 | 公開日時未取得のため保存なし |
| DET | Sam LaPortaのhip injury、Ben Bartchのconcussion protocol等 | https://www.nfl.com/news/nfl-news-roundup-latest-league-updates-from-thursday-aug-20 | 公開日時未取得のため保存なし |
| GB | 現在のInjuries一覧に明確な対象項目なし | — | 保存なし |
| HOU | Jayden Higginsのtorn ACL、2026 season out | https://www.nfl.com/news/texans-wr-jayden-higgins-torn-acl-out-2026-season | 公開日時未取得のため保存なし |
| IND | Tyler Warrenのminor groin injury | https://www.nfl.com/news/nfl-news-roundup-latest-league-updates-from-wednesday-aug-19 | 公開日時未取得のため保存なし |
| JAX | Cole Van LanenのPUP解除 | https://www.nfl.com/news/nfl-news-roundup-latest-league-updates-from-thursday-aug-20 | 公開日時未取得のため保存なし |
| KC | Jeff Caldwellのknee、Ashton Gillotteのplantar fascia | https://www.nfl.com/news/nfl-news-roundup-latest-league-updates-from-thursday-aug-20 | 公開日時未取得のため保存なし |

SQL照合では、対象8チームの `source_kind = 'nfl_official'` 行は0件でした。チーム公式RSSについては、公開日時を取得できた23件を別途保存しています。

## 取得ログとチーム対応

| チーム | 取得元 | 抽出したチーム対応 | 個別URL | 公開日時の取得可否 |
|---|---|---|---|---|
| DAL | NFL公式Injuries一覧・8/19および8/20のRoundup本文 | 当該チームの新規負傷項目は本文に出現せず | なし | 対象なし |
| DEN | 8/19 Roundup本文・8/20 Roundup本文 | Bo Nixの過去ankle言及、Taylor Rapp契約／Levelle Bailey injury designation | https://www.nfl.com/news/nfl-news-roundup-latest-league-updates-from-thursday-aug-20 | ページ上は `Published: Loading...` |
| DET | 8/20 Roundup本文 | Sam LaPorta hip、Ben Bartch concussion、Ennis Rakestraw Jr. lower leg | https://www.nfl.com/news/nfl-news-roundup-latest-league-updates-from-thursday-aug-20 | ページ上は `Published: Loading...` |
| GB | NFL公式Injuries一覧・8/19および8/20のRoundup本文 | 当該チームの新規負傷項目は本文に出現せず | なし | 対象なし |
| HOU | 8/19 Roundup本文・個別NFL記事 | Jayden Higgins torn ACL／2026 season out | https://www.nfl.com/news/texans-wr-jayden-higgins-torn-acl-out-2026-season | ページ上は `Published: Loading...` |
| IND | 8/19 Roundup本文 | Tyler Warren groin | https://www.nfl.com/news/nfl-news-roundup-latest-league-updates-from-wednesday-aug-19 | ページ上は `Published: Loading...` |
| JAX | 8/20 Roundup本文 | Cole Van Lanen knee／PUPからactivation | https://www.nfl.com/news/nfl-news-roundup-latest-league-updates-from-thursday-aug-20 | ページ上は `Published: Loading...` |
| KC | 8/20 Roundup本文 | Jeff Caldwell hyperextended knee、Ashton Gillotte ruptured plantar fascia | https://www.nfl.com/news/nfl-news-roundup-latest-league-updates-from-thursday-aug-20 | ページ上は `Published: Loading...` |

上記は `https://www.nfl.com/injuries/` と、記事本文を抽出できた8/19・8/20のNFL公式RoundupおよびHiggins個別記事から確認したものです。公開日時が信頼できる形で取得できないため、`published_at` を推測して保存することはしていません。
