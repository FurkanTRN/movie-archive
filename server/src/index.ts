import { ensureAdminUser } from "./auth/ensure-admin-user.js";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { databaseInfo } from "./database/db.js";
import { logger } from "./lib/logger.js";
import { sessionRuntimeInfo } from "./middleware/session-middleware.js";
import { tmdbClient } from "./tmdb/tmdb-client.js";

const startServer = async () => {
    const adminBootstrap = await ensureAdminUser();
    await tmdbClient.validateConfiguration();
    const app = createApp();

    app.listen(env.port, () => {
        logger.info("Movie Archive API is listening", {
            event: "server_started",
            port: env.port,
        });
        logger.info("SQLite database is ready", {
            databasePath: databaseInfo.path,
            event: "database_ready",
        });
        logger.info("TMDb configuration validated successfully", {
            event: "tmdb_configuration_validated",
        });
        logger.info("Session runtime configured", {
            cookieName: sessionRuntimeInfo.cookieName,
            event: "session_runtime_ready",
            secureCookies: sessionRuntimeInfo.secureCookies,
            storeKind: sessionRuntimeInfo.storeKind,
        });

        if (adminBootstrap.reason === "created") {
            logger.info("Initial admin user created from environment variables", {
                event: "admin_bootstrap_created",
            });
        }

        if (adminBootstrap.reason === "missing-env") {
            logger.warn("Automatic admin bootstrap was skipped because ADMIN_EMAIL or ADMIN_PASSWORD is not set", {
                event: "admin_bootstrap_skipped_missing_env",
            });
        }

        if (env.nodeEnv === "production" && !sessionRuntimeInfo.trustProxy) {
            logger.warn("TRUST_PROXY=false in production. If you are running behind a reverse proxy, verify cookie behavior.", {
                event: "trust_proxy_disabled_in_production",
            });
        }
    });
};

void startServer().catch((error: unknown) => {
    logger.error("Server failed to start", {
        event: "server_start_failed",
    }, error);
});
