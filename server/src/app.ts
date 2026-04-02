import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth-router.js";
import { archiveRouter } from "./routes/archive-router.js";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { requestContextMiddleware, requestLoggingMiddleware } from "./middleware/request-logging.js";
import { sessionMiddleware } from "./middleware/session-middleware.js";
import { healthRouter } from "./routes/health-router.js";
import { moviesRouter } from "./routes/movies-router.js";

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(currentDirectoryPath, "../../dist");
const clientIndexHtmlPath = path.join(clientDistPath, "index.html");
const hasProductionClientBundle = fs.existsSync(clientIndexHtmlPath);

export const createApp = () => {
    const app = express();

    if (env.trustProxy) {
        app.set("trust proxy", 1);
    }

    if (env.nodeEnv !== "production") {
        app.use(
            cors({
                credentials: true,
                origin: env.appBaseUrl,
            }),
        );
    }

    app.use(express.json());
    app.use(requestContextMiddleware);
    app.use(sessionMiddleware);
    app.use(requestLoggingMiddleware);

    app.get("/api", (_request, response) => {
        response.json({
            message: "Movie Archive API",
            status: "ok",
        });
    });

    app.use("/api/health", healthRouter);
    app.use("/api/auth", authRouter);
    app.use("/api/movies", moviesRouter);
    app.use("/api/archive", archiveRouter);

    if (env.nodeEnv === "production" && hasProductionClientBundle) {
        app.use(express.static(clientDistPath));
        app.use((request, response, next) => {
            if (request.path.startsWith("/api")) {
                next();
                return;
            }

            response.sendFile(clientIndexHtmlPath);
        });
    }

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
};
