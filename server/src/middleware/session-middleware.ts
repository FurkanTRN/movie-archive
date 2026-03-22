import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "../database/db.js";
import { env } from "../config/env.js";
import { SqliteSessionStore } from "./sqlite-session-store.js";

const MemoryStore = createMemoryStore(session);

const sessionCookieSecure = env.cookieSecureAuto ? env.nodeEnv === "production" : false;

export const sessionCookieOptions = {
    httpOnly: true,
    maxAge: env.sessionMaxAgeMs,
    path: "/",
    sameSite: "lax" as const,
    secure: sessionCookieSecure,
};

export const sessionClearCookieOptions = {
    httpOnly: sessionCookieOptions.httpOnly,
    path: sessionCookieOptions.path,
    sameSite: sessionCookieOptions.sameSite,
    secure: sessionCookieOptions.secure,
};

const store =
    env.nodeEnv === "production"
        ? new SqliteSessionStore({
              db,
          })
        : new MemoryStore({
              checkPeriod: 1000 * 60 * 60 * 24,
          });

export const sessionRuntimeInfo = {
    cookieName: env.sessionCookieName,
    secureCookies: sessionCookieSecure,
    storeKind: env.nodeEnv === "production" ? "sqlite" : "memory",
    trustProxy: env.trustProxy,
} as const;

export const sessionMiddleware = session({
    cookie: sessionCookieOptions,
    name: env.sessionCookieName,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    secret: env.sessionSecret,
    store,
});
