import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "../database/db.js";
import { env } from "../config/env.js";
import { SqliteSessionStore } from "./sqlite-session-store.js";

const MemoryStore = createMemoryStore(session);
const SESSION_COOKIE_NAME = "movie-archive.sid";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

const sessionCookieSecure = env.nodeEnv === "production";

export const sessionCookieOptions = {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_MS,
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
    cookieName: SESSION_COOKIE_NAME,
    secureCookies: sessionCookieSecure,
    storeKind: env.nodeEnv === "production" ? "sqlite" : "memory",
    trustProxy: env.trustProxy,
} as const;

export const sessionMiddleware = session({
    cookie: sessionCookieOptions,
    name: SESSION_COOKIE_NAME,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    secret: env.sessionSecret,
    store,
});
