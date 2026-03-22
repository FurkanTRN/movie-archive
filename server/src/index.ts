import { ensureAdminUser } from "./auth/ensure-admin-user.js";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { databaseInfo } from "./database/db.js";
import { sessionRuntimeInfo } from "./middleware/session-middleware.js";

const startServer = async () => {
    const adminBootstrap = await ensureAdminUser();
    const app = createApp();

    app.listen(env.port, () => {
        console.log(`Movie Archive API listening on http://localhost:${env.port}`);
        console.log(`SQLite database ready at ${databaseInfo.path}`);
        console.log(
            `Session store: ${sessionRuntimeInfo.storeKind}, cookie: ${sessionRuntimeInfo.cookieName}, secure: ${String(sessionRuntimeInfo.secureCookies)}`,
        );

        if (adminBootstrap.reason === "created") {
            console.log("Initial admin user created from environment variables");
        }

        if (adminBootstrap.reason === "missing-env") {
            console.warn("ADMIN_EMAIL veya ADMIN_PASSWORD tanımlı değil. Otomatik admin bootstrap atlandı.");
        }

        if (env.nodeEnv === "production" && !sessionRuntimeInfo.trustProxy) {
            console.warn("Production modunda TRUST_PROXY=false. Ters proxy arkasında çalışıyorsanız cookie davranışını kontrol edin.");
        }
    });
};

void startServer().catch((error: unknown) => {
    console.error("Sunucu başlatılamadı");
    if (error instanceof Error) {
        console.error(error.message);
        return;
    }

    console.error("Bilinmeyen hata");
});
