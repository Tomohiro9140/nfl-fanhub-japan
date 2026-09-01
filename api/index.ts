import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { receiveOfficialFeedAgentHandler, refreshOfficialFeedHandler, refreshOfficialScorePulseHandler } from "../server/officialFeedScheduler";
import { refreshFieldlineSeasonHandler } from "../server/fieldlineScheduler";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

registerStorageProxy(app);
registerOAuthRoutes(app);

app.post("/api/scheduled/official-feed-refresh", refreshOfficialFeedHandler);
app.post("/api/scheduled/official-score-pulse", refreshOfficialScorePulseHandler);
app.post("/api/scheduled/official-feed-agent", receiveOfficialFeedAgentHandler);
app.post("/api/scheduled/fieldline-season-refresh", refreshFieldlineSeasonHandler);

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
