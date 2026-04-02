import { createBackup } from "../backup/backup-utils.js";
import { logger } from "../lib/logger.js";

const run = async () => {
    const backupPath = await createBackup();
    logger.info("SQLite backup created", {
        backupPath,
        event: "backup_created",
    });
};

run().catch((error) => {
    logger.error("Failed to create SQLite backup", {
        event: "backup_failed",
    }, error);
    process.exit(1);
});
