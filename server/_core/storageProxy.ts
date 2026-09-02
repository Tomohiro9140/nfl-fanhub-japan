import type { Express } from "express";

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    // 本家の画像配信URLへ307リダイレクト（ブラウザが直接CDNから最速で取得）
    res.redirect(307, `https://nfl-fanhub-japan.com/manus-storage/${key}`);
  });
}
