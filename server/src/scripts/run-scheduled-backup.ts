import { createBackup, pruneBackupRetention } from "../backup/backup-utils.js";
import { getMillisecondsUntilNextBackup, getNextBackupRunAt } from "../backup/backup-schedule.js";
import { logger } from "../lib/logger.js";

const sleep = (durationMs: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, durationMs);
    });

const formatRunTime = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
        dateStyle: "short",
        timeStyle: "medium",
    }).format(date);

const runScheduledBackup = async () => {
    while (true) {
        const nextRunAt = getNextBackupRunAt();
        const waitMs = getMillisecondsUntilNextBackup();

        logger.info("Next scheduled backup calculated", {
            event: "backup_scheduled",
            formattedNextRunAt: formatRunTime(nextRunAt),
            nextRunAt: nextRunAt.toISOString(),
            waitMs,
        });

        await sleep(waitMs);

        try {
            const backupPath = await createBackup();
            const retentionResult = pruneBackupRetention();

            logger.info("Scheduled backup completed", {
                backupPath,
                event: "backup_created",
                keptCount: retentionResult.keptCount,
                removedCount: retentionResult.removedCount,
            });
        } catch (error) {
            logger.error("Scheduled backup failed", {
                event: "backup_failed",
            }, error);
        }
    }
};

runScheduledBackup().catch((error) => {
    logger.error("Backup scheduler failed to start", {
        event: "backup_scheduler_start_failed",
    }, error);
    process.exit(1);
});
