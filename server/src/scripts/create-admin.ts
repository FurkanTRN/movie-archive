import { ensureAdminUser } from "../auth/ensure-admin-user.js";
import { AppError } from "../middleware/error-handler.js";

const createAdmin = async () => {
    if (!process.env.ADMIN_EMAIL?.trim() || !process.env.ADMIN_PASSWORD?.trim()) {
        throw new AppError("ADMIN_EMAIL and ADMIN_PASSWORD must be set", 400);
    }

    const result = await ensureAdminUser();

    switch (result.reason) {
        case "created":
            console.log("Admin user created from environment variables");
            return;
        case "existing-admin":
            console.log("Admin user already exists for the configured email");
            return;
        case "existing-users":
            console.log("Skipped admin creation because users already exist");
            return;
        case "missing-env":
            throw new AppError("ADMIN_EMAIL and ADMIN_PASSWORD must be set", 400);
    }
};

void createAdmin();
