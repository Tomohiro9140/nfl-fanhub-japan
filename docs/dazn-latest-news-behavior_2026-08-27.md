# DAZNリンクとLATEST NEWS更新の確認記録

## 実画面確認

- 開発プレビューのPCブラウザでは、GAME TICKETのDAZNリンクは `https://www.dazn.com/ja-JP/home` を `target="_blank"`、`rel="noreferrer"` で開く。
- LATEST NEWSのREFRESHは有効なボタンで、アクセシビリティ名は「チーム公式RSSとNFL公式負傷情報を同期して最新ニュースを更新」。

## 動作仕様

- モバイルでは、公式NFL Game Pass URLを同一画面で開く。DAZNアプリがOSのUniversal Link / App LinkとしてURLを関連付けている端末ではアプリへ遷移できるが、Webサイト側から未公開のカスタムスキームを使って強制起動はしない。
- PCでは、DAZN日本トップページを新しいタブで開く。
- REFRESHは対象チームの公式RSSとNFL公式負傷ページをサーバー側で再取得し、確認できた項目をキャッシュへ保存した後、画面のフィードを再取得する。連続クリック中はボタンを無効化して `UPDATING` を表示する。
