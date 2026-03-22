import type { NextFunction, Request, Response } from "express";

export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 500) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
    }
}

export const notFoundHandler = (_request: Request, _response: Response, next: NextFunction) => {
    next(new AppError("İstenen rota bulunamadı", 404));
};

export const errorHandler = (error: Error, _request: Request, response: Response, _next: NextFunction) => {
    const statusCode = error instanceof AppError ? error.statusCode : 500;

    response.status(statusCode).json({
        error: {
            message: error.message || "Sunucu tarafında beklenmeyen bir hata oluştu",
            statusCode,
        },
    });
};
