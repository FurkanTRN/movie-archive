import fs from "node:fs";
import { Router } from "express";
import { getLatestBackup } from "../backup/backup-utils.js";
import { env } from "../config/env.js";
import { databaseInfo } from "../database/db.js";
import { sessionRuntimeInfo } from "../middleware/session-middleware.js";

export const healthRouter = Router();

const RECENT_BACKUP_THRESHOLD_HOURS = 84;

healthRouter.get("/", (_request, response) => {
    const latestBackup = getLatestBackup();
    const latestBackupAgeHours = latestBackup
        ? Math.floor((Date.now() - latestBackup.modifiedAtMs) / (1000 * 60 * 60))
        : null;

    response.json({
        appBaseUrl: env.appBaseUrl,
        backup: {
            directory: env.backupDir,
            hasRecentBackup: latestBackupAgeHours !== null ? latestBackupAgeHours <= RECENT_BACKUP_THRESHOLD_HOURS : false,
            latestBackupAgeHours,
            latestBackupAt: latestBackup?.modifiedAt.toISOString() ?? null,
        },
        checks: {
            backupDirectoryExists: fs.existsSync(env.backupDir),
            databaseFileExists: fs.existsSync(databaseInfo.path),
        },
        databasePath: databaseInfo.path,
        nodeEnv: env.nodeEnv,
        session: sessionRuntimeInfo,
        status: "ok",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
    });
});
