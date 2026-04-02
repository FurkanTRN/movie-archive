import type { NextFunction, Request, Response } from "express";
import { userRepository } from "../database/user-repository.js";
import { AppError } from "../middleware/error-handler.js";

export const requireAuth = (request: Request, _response: Response, next: NextFunction) => {
    if (!request.session.user) {
        next(new AppError("You must be signed in", 401));
        return;
    }

    const user = userRepository.findUserById(request.session.user.id);

    if (!user) {
        request.session.destroy(() => undefined);
        next(new AppError("You must be signed in", 401));
        return;
    }

    request.session.user = {
        email: user.email,
        id: user.id,
    };

    next();
};
