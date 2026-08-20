import { and, eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { seasonRefreshSchedules } from "../drizzle/schema";
import { getDb } from "./db";
import { importFieldlineSeasonFromNflverse } from "./fieldlineData";
import { sdk } from "./_core/sdk";

/** Platform-authenticated, idempotent weekly refresh endpoint for a deployed FIELDLINE instance. */
export async function refreshFieldlineSeasonHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const schedule = (await db.select().from(seasonRefreshSchedules).where(and(eq(seasonRefreshSchedules.scheduleCronTaskUid, user.taskUid), eq(seasonRefreshSchedules.isEnabled, true))).limit(1))[0];
    if (!schedule) return res.json({ ok: true, skipped: "orphan", taskUid: user.taskUid });
    await db.update(seasonRefreshSchedules).set({ lastStatus: "running", lastRunAt: new Date(), lastError: null }).where(eq(seasonRefreshSchedules.id, schedule.id));
    const result = await importFieldlineSeasonFromNflverse(schedule.season);
    await db.update(seasonRefreshSchedules).set({ lastStatus: "ready", lastSuccessAt: new Date(), lastError: null }).where(eq(seasonRefreshSchedules.id, schedule.id));
    res.json({ ok: true, taskUid: user.taskUid, ...result, timestamp: new Date().toISOString() });
  } catch (error) {
    const details = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
    res.status(500).json({ error: "fieldline-season-refresh-failed", details, timestamp: new Date().toISOString() });
  }
}
