import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger.js";

const getRequestPath = (request: Request) => request.originalUrl.split("?")[0] ?? request.originalUrl;

export const requestContextMiddleware = (request: Request, response: Response, next: NextFunction) => {
    request.requestId = randomUUID();
    response.setHeader("X-Request-Id", request.requestId);
    next();
};

export const requestLoggingMiddleware = (request: Request, response: Response, next: NextFunction) => {
    const startedAt = performance.now();

    response.on("finish", () => {
        const metadata = {
            durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
            event: "request_completed",
            method: request.method,
            path: getRequestPath(request),
            requestId: request.requestId,
            statusCode: response.statusCode,
            userId: request.session.user?.id ?? null,
        };

        if (response.statusCode >= 500) {
            logger.error("HTTP request failed", metadata);
            return;
        }

        if (response.statusCode >= 400) {
            logger.warn("HTTP request completed with client error", metadata);
            return;
        }

        logger.info("HTTP request completed", metadata);
    });

    next();
};
