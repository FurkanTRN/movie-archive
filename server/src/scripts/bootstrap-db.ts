import { bootstrapDatabase, databaseInfo } from "../database/db.js";
import { logger } from "../lib/logger.js";

bootstrapDatabase();

logger.info("Database bootstrapped", {
    databasePath: databaseInfo.path,
    event: "database_bootstrapped",
});
