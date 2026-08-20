# FIELDLINE × Pro Football Reference 2025 Yardage Audit

提供された `TeamOffence.xls` と `TeamDefence.xls` は、2025年レギュラーシーズンの32チーム・各17試合のPro Football Reference集計をHTML形式のXLSエクスポートとして保持している。比較対象は攻撃／守備それぞれのPassing YdsとRushing Ydsである。

初期移植では、パスヤードにサック損失を控除しないグロス値を使用していたため、PFRのネットパスヤードより大きくなった。例えばNEの攻撃パスヤードはFIELDLINE 4,459ヤードに対してPFR 4,258ヤードであり、差分201ヤードはサック損失に一致した。

また、INDの攻撃ランヤードとLACの守備ランヤードには3ヤード差が残った。これはnflverseの`lateral_rushing_yards`が通常の`rushing_yards`に含まれず、PFRはそのラテラルランを含めるためである。

修正後は以下のPFR互換式を使用する。

| 指標 | 集計式 |
| --- | --- |
| パスヤード | `passing_yards - sack_loss` |
| ランヤード | `rushing_yards + lateral_rushing_yards` |
| 総ヤード | ネットパスヤード + ランヤード |

2025年のnflverse 46,452プレー・272試合を再取込し、PFRの32チーム×攻守4指標（128比較）で差分0を確認した。

## PC layout diagnostic

1280px幅のブラウザ実測では、FIELDLINEの比較コンテンツは左端0px、幅1265px、右余白15pxとなっていた。これは内側コンテナが想定した72remではなく1280pxの最大幅規則を受けているためであり、FIELDLINEコンポーネント側で最大幅と自動マージンを明示する必要がある。
