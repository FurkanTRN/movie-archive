import type { Request } from "express";
import { Router } from "express";
import { requireAuth } from "../auth/auth-middleware.js";
import { verifyPassword } from "../auth/password.js";
import { userRepository } from "../database/user-repository.js";
import { logger } from "../lib/logger.js";
import { AppError } from "../middleware/error-handler.js";
import { sessionClearCookieOptions, sessionRuntimeInfo } from "../middleware/session-middleware.js";
import { loginBodySchema } from "../validation/auth-schemas.js";
import { parseWithSchema } from "../validation/parse-with-schema.js";

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const runSessionRegenerate = (request: Request) =>
    new Promise<void>((resolve, reject) => {
        request.session.regenerate((error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });

const destroySession = (request: Request) =>
    new Promise<void>((resolve, reject) => {
        request.session.destroy((error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });

export const authRouter = Router();

authRouter.post("/login", async (request, response, next) => {
    try {
        const { email, password } = parseWithSchema(loginBodySchema, request.body);

        const user = userRepository.findUserByEmail(normalizeEmail(email));

        if (!user) {
            logger.warn("Authentication failed", {
                event: "auth_login_failed",
                reason: "user_not_found",
                requestId: request.requestId,
            });
            throw new AppError("Email or password is incorrect", 401);
        }

        const isPasswordValid = await verifyPassword(password, user.passwordHash);

        if (!isPasswordValid) {
            logger.warn("Authentication failed", {
                event: "auth_login_failed",
                reason: "password_mismatch",
                requestId: request.requestId,
                userId: user.id,
            });
            throw new AppError("Email or password is incorrect", 401);
        }

        await runSessionRegenerate(request);

        request.session.user = {
            email: user.email,
            id: user.id,
        };

        logger.info("Authentication succeeded", {
            event: "auth_login_succeeded",
            requestId: request.requestId,
            userId: user.id,
        });

        response.json({
            user: request.session.user,
        });
    } catch (error) {
        next(error);
    }
});

authRouter.post("/logout", requireAuth, (request, response, next) => {
    destroySession(request)
        .then(() => {
            response.clearCookie(sessionRuntimeInfo.cookieName, sessionClearCookieOptions);
            logger.info("Logout succeeded", {
                event: "auth_logout_succeeded",
                requestId: request.requestId,
                userId: request.session.user?.id ?? null,
            });
            response.status(204).send();
        })
        .catch(() => {
            next(new AppError("Failed to log out", 500));
        });
});

authRouter.get("/me", requireAuth, (request, response) => {
    response.json({
        user: request.session.user,
    });
});
