import type { Request, Response } from "express";
import { z } from "zod";
import { cacheAgentOfficialFeed, refreshOfficialTeamFeedGroup } from "./officialFeeds";
import { refreshOfficialLeagueDashboard } from "./officialLeagueData";
import { refreshDaznGameLinks } from "./daznGameLinks";
import { sdk } from "./_core/sdk";

const agentFeedPayload = z.object({
  teamCode: z.string().min(2).max(3),
  items: z.array(z.object({
    title: z.string().min(1).max(800),
    summary: z.string().max(560).nullable().optional(),
    sourceUrl: z.string().url(),
    sourceName: z.string().min(1).max(128),
    sourceKind: z.enum(["team_official", "nfl_official"]),
    category: z.enum(["news", "injury"]),
    publishedAt: z.string().min(1),
  })).max(24),
});

const heartbeatPayload = z.object({
  forceGroupIndex: z.number().int().min(0).max(3).optional(),
});

/** Platform-authenticated endpoint for a project-level official-feed refresh job. */
export async function refreshOfficialFeedHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const hour = new Date().getUTCHours();
    const payload = heartbeatPayload.parse(req.body ?? {});
    if (payload.forceGroupIndex === undefined && ![0, 6, 12, 18].includes(hour)) return res.json({ ok: true, skipped: "outside-utc-window", hour });
    const groupIndex = payload.forceGroupIndex ?? hour / 6;
    const [results, league, dazn] = await Promise.all([refreshOfficialTeamFeedGroup(groupIndex), refreshOfficialLeagueDashboard(), refreshDaznGameLinks()]);
    const stored = results.filter((result) => result.ok).reduce((sum, result) => sum + result.count, 0);
    res.json({ ok: true, groupIndex, forced: payload.forceGroupIndex !== undefined, processed: results.length, stored, results, league, dazn, timestamp: new Date().toISOString() });
  } catch (error) {
    const details = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
    res.status(500).json({ error: "official-feed-refresh-failed", details, timestamp: new Date().toISOString() });
  }
}

/** Receives normalized snippets collected by a platform-run browser job from official sites. */
export async function receiveOfficialFeedAgentHandler(req: Request, res: Response) {
  try {
    console.log("[official-feed-agent] received", {
      hasCookie: Boolean(req.headers.cookie),
      hasAuthorization: Boolean(req.headers.authorization),
      bodyKeys: Object.keys(req.body ?? {}),
    });
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const payload = agentFeedPayload.parse(req.body);
    const count = await cacheAgentOfficialFeed(payload.teamCode.toUpperCase(), payload.items);
    console.log("[official-feed-agent] stored", { teamCode: payload.teamCode.toUpperCase(), count });
    res.json({ ok: true, count, teamCode: payload.teamCode.toUpperCase(), timestamp: new Date().toISOString() });
  } catch (error) {
    const details = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
    res.status(500).json({ error: "official-feed-agent-ingest-failed", details, timestamp: new Date().toISOString() });
  }
}
