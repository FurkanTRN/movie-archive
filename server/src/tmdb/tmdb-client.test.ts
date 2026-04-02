import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

const originalFetch = global.fetch;

const createBaseEnvironment = () => {
    process.env.ADMIN_EMAIL = "admin@example.com";
    process.env.ADMIN_PASSWORD = "change-me-now";
    process.env.APP_BASE_URL = "http://localhost:5173";
    process.env.BACKUP_DIR = "./backups";
    process.env.BACKUP_TIMEZONE = "Europe/Istanbul";
    process.env.NODE_ENV = "test";
    process.env.PORT = "3001";
    process.env.SESSION_SECRET = "a-very-long-session-secret";
    process.env.SQLITE_DB_PATH = "./data/movie-archive.db";
    process.env.TMDB_API_KEY = "demo-key";
    process.env.TRUST_PROXY = "false";
};

afterEach(() => {
    global.fetch = originalFetch;
});

test("validateConfiguration succeeds when TMDb responds with ok", async () => {
    createBaseEnvironment();
    global.fetch = (async () => new Response("{}", { status: 200 })) as typeof fetch;

    const { tmdbClient } = await import("./tmdb-client.js");

    await assert.doesNotReject(() => tmdbClient.validateConfiguration());
});

test("validateConfiguration rejects invalid TMDb API keys", async () => {
    createBaseEnvironment();
    global.fetch = (async () => new Response("{}", { status: 401 })) as typeof fetch;

    const { tmdbClient } = await import("./tmdb-client.js");

    await assert.rejects(() => tmdbClient.validateConfiguration(), /TMDB_API_KEY is invalid/);
});

test("validateConfiguration rejects when TMDb cannot be reached", async () => {
    createBaseEnvironment();
    global.fetch = (async () => {
        throw new Error("network down");
    }) as typeof fetch;

    const { tmdbClient } = await import("./tmdb-client.js");

    await assert.rejects(() => tmdbClient.validateConfiguration(), /unable to reach TMDb/);
});
