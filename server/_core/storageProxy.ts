import type { Express } from "express";
import { ENV } from "./env";

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    // Render等の外部環境（Manus専用キーがない場合）は本家サイトから画像を取得して配信
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      try {
        const originResp = await fetch(
          `https://nfl-fanhub-japan.com/manus-storage/${encodeURI(key)}`
        );
        if (!originResp.ok) {
          res.status(originResp.status).send(originResp.statusText);
          return;
        }

        const contentType = originResp.headers.get("content-type");
        if (contentType) {
          res.setHeader("Content-Type", contentType);
        }
        res.setHeader("Cache-Control", "public, max-age=86400");

        const arrayBuffer = await originResp.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
        return;
      } catch (err) {
        console.error("[StorageProxy Fallback] failed:", err);
        res.status(500).send("Storage proxy fallback error");
        return;
      }
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
