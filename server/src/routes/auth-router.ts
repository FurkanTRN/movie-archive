import type { Request } from "express";
import { Router } from "express";
import { requireAuth } from "../auth/auth-middleware.js";
import { verifyPassword } from "../auth/password.js";
import { env } from "../config/env.js";
import { userRepository } from "../database/user-repository.js";
import { AppError } from "../middleware/error-handler.js";
import { sessionClearCookieOptions } from "../middleware/session-middleware.js";
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
            console.warn("Kimlik doğrulama başarısız: kullanıcı bulunamadı");
            throw new AppError("E-posta veya şifre hatalı", 401);
        }

        const isPasswordValid = await verifyPassword(password, user.passwordHash);

        if (!isPasswordValid) {
            console.warn("Kimlik doğrulama başarısız: parola eşleşmedi");
            throw new AppError("E-posta veya şifre hatalı", 401);
        }

        await runSessionRegenerate(request);

        request.session.user = {
            email: user.email,
            id: user.id,
        };

        console.info("Kimlik doğrulama başarılı: oturum yenilendi");

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
            response.clearCookie(env.sessionCookieName, sessionClearCookieOptions);
            console.info("Oturum kapatma başarılı");
            response.status(204).send();
        })
        .catch(() => {
            next(new AppError("Oturum kapatılamadı", 500));
        });
});

authRouter.get("/me", requireAuth, (request, response) => {
    response.json({
        user: request.session.user,
    });
});
