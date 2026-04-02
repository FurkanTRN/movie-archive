import { ensureAdminUser } from "../auth/ensure-admin-user.js";
import { logger } from "../lib/logger.js";
import { AppError } from "../middleware/error-handler.js";

const createAdmin = async () => {
    if (!process.env.ADMIN_EMAIL?.trim() || !process.env.ADMIN_PASSWORD?.trim()) {
        throw new AppError("ADMIN_EMAIL and ADMIN_PASSWORD must be set", 400);
    }

    const result = await ensureAdminUser();

    switch (result.reason) {
        case "created":
            logger.info("Admin user created from environment variables", {
                event: "admin_bootstrap_created",
            });
            return;
        case "existing-admin":
            logger.info("Admin user already exists for the configured email", {
                event: "admin_bootstrap_existing_admin",
            });
            return;
        case "existing-users":
            logger.info("Skipped admin creation because users already exist", {
                event: "admin_bootstrap_existing_users",
            });
            return;
        case "missing-env":
            throw new AppError("ADMIN_EMAIL and ADMIN_PASSWORD must be set", 400);
    }
};

void createAdmin().catch((error) => {
    logger.error("Admin bootstrap script failed", {
        event: "admin_bootstrap_script_failed",
    }, error);
    process.exit(1);
});
