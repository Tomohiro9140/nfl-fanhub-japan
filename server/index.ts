import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import apiApp from "./api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // 1. apiApp 自体にすでに "/api/trpc" 等が含まれているため、ルート (/) にそのままマウント
  app.use(apiApp);

  // 2. 静的ファイルの配信
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // 3. SPAルーティング (APIリクエスト以外の全パスを index.html へ流す)
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API Route Not Found" });
    }
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
