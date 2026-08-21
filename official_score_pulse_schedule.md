# Official Score Pulse Schedule

| 項目 | 値 |
| --- | --- |
| Heartbeat名 | `official-score-pulse` |
| タスクID | `mn7k6wzsfBnpX8r5Vj8T2D` |
| Cron（UTC） | `0 */1 * * * *` |
| エンドポイント | `/api/scheduled/official-score-pulse` |
| 状態 | 有効 |

このジョブは毎分起動するが、公式日程に試合開始から6時間以内、または開始5分前以内の試合が存在する場合にだけNFL公式スケジュールを再取得する。試合がない時間帯は外部取得を行わず、終了直後のFINALスコアを優先してキャッシュへ反映する。
