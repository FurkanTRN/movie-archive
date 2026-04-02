import type { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger.js";

export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 500) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
    }
}

export const notFoundHandler = (request: Request, _response: Response, next: NextFunction) => {
    logger.warn("Requested route was not found", {
        event: "route_not_found",
        method: request.method,
        path: request.originalUrl,
        requestId: request.requestId,
        userId: request.session.user?.id ?? null,
    });
    next(new AppError("Requested route was not found", 404));
};

export const errorHandler = (error: Error, request: Request, response: Response, _next: NextFunction) => {
    const statusCode = error instanceof AppError ? error.statusCode : 500;

    const metadata = {
        event: error instanceof AppError ? "request_error" : "unexpected_request_error",
        method: request.method,
        path: request.originalUrl,
        requestId: request.requestId,
        statusCode,
        userId: request.session.user?.id ?? null,
    };

    if (error instanceof AppError) {
        logger.warn(error.message, metadata, error);
    } else {
        logger.error("Unexpected request error", metadata, error);
    }

    response.status(statusCode).json({
        error: {
            message: error.message || "An unexpected server error occurred",
            statusCode,
        },
    });
};
