import { createBackup, pruneBackupRetention } from "../backup/backup-utils.js";
import { getMillisecondsUntilNextBackup, getNextBackupRunAt } from "../backup/backup-schedule.js";
import { env } from "../config/env.js";

const sleep = (durationMs: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, durationMs);
    });

const formatRunTime = (date: Date) =>
    new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "short",
        timeStyle: "medium",
        timeZone: env.backupTimezone,
    }).format(date);

const runScheduledBackup = async () => {
    while (true) {
        const nextRunAt = getNextBackupRunAt();
        const waitMs = getMillisecondsUntilNextBackup();

        console.log(
            `[backup] Sonraki yedek ${formatRunTime(nextRunAt)} zamanında calisacak (${env.backupTimezone}, 72 saat aralik).`,
        );

        await sleep(waitMs);

        try {
            const backupPath = await createBackup();
            const retentionResult = pruneBackupRetention();

            console.log(`[backup] Yedek olusturuldu: ${backupPath}`);
            console.log(
                `[backup] Retention uygulandi. Korunan: ${retentionResult.keptCount}, silinen: ${retentionResult.removedCount}`,
            );
        } catch (error) {
            console.error("[backup] Yedek islemi basarisiz oldu.");
            console.error(error);
        }
    }
};

runScheduledBackup().catch((error) => {
    console.error("[backup] Scheduler baslatilamadi.");
    console.error(error);
    process.exit(1);
});
