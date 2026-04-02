import assert from "node:assert/strict";
import { test } from "node:test";
import { parseEnv } from "./env.js";

const createBaseEnv = () =>
    ({
        ADMIN_EMAIL: "admin@example.com",
        ADMIN_PASSWORD: "change-me-now",
        APP_BASE_URL: "http://localhost:5173",
        BACKUP_DIR: "./backups",
        NODE_ENV: "development",
        PORT: "3001",
        SESSION_SECRET: "a-very-long-session-secret",
        SQLITE_DB_PATH: "./data/movie-archive.db",
        TMDB_API_KEY: "demo-key",
        TRUST_PROXY: "false",
    }) satisfies NodeJS.ProcessEnv;

test("parseEnv returns normalized runtime values", () => {
    const env = parseEnv(createBaseEnv());

    assert.equal(env.port, 3001);
    assert.equal(env.trustProxy, false);
    assert.equal(env.adminEmail, "admin@example.com");
    assert.equal(env.logLevel, "debug");
});

test("parseEnv accepts explicit LOG_LEVEL", () => {
    const env = parseEnv({
        ...createBaseEnv(),
        LOG_LEVEL: "warn",
    });

    assert.equal(env.logLevel, "warn");
});

test("parseEnv rejects weak production session secrets", () => {
    assert.throws(
        () =>
            parseEnv({
                ...createBaseEnv(),
                NODE_ENV: "production",
                SESSION_SECRET: "change-me",
            }),
        /A strong SESSION_SECRET is required in production/,
    );
});
