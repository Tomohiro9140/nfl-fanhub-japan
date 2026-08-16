# UTC 18時グループの公式フィード手動収集記録

収集時刻は **2026-08-16 18:03 UTC**。対象は NYJ、PHI、PIT、SF、SEA、TB、TEN、WAS の8チームである。NYJ、PHI、PIT、TB、TENの公式RSSでは2026年8月14日から16日に公開された現行記事を確認できたため、各チームの上位3件を保存候補とする。

SFとSEAのRSSは2025年7月の記事までしか返しておらず、WASのRSSは先頭に2022年の記事を返していた。これらは現在の公式更新として扱わず、推測による補完も行わない。RSS URLへの接続自体は成功したが、鮮度条件を満たす保存候補がなかったことを最終報告へ記載する。

対象RSSは次の公式URLである：<https://www.newyorkjets.com/rss/news>、<https://www.philadelphiaeagles.com/rss/news>、<https://www.steelers.com/rss/news>、<https://www.49ers.com/rss/news>、<https://www.seahawks.com/rss/news>、<https://www.buccaneers.com/rss/news>、<https://www.titansonline.com/rss/news>、<https://www.commanders.com/rss/news>。

NFL公式負傷ページ（<https://www.nfl.com/injuries/>）も確認した。抽出可能な表示は、Jets、49ers、Seahawks、Buccaneersなどを含む過去シーズンの「Injury roundup」見出しであり、個別の公式URLと公開日時を検証できる新規項目ではなかった。このため、対象8チームについて `nfl_official` の負傷情報は保存しない。

保存候補は NYJ、PHI、PIT、TB、TEN の各上位3件、合計15件である。TENの「Titans Sign TE Matt Lauter, RB Dominic Richardson While Placing Jaylen Harrell and Jaren Kanak on Injured Reserve」は見出しに `injured` を含むため `injury` とする。残る14件は `news` とする。PHIの上位3件は個別公式ページで正式タイトル・公開日時・短い概要を確認した。PIT、TB、TENのRSSは概要を提供していないため、記事本文を推測して保存せず `summary` はNULLにする。
