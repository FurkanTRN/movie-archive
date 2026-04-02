import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import request from "supertest";

const createTestEnvironment = () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "movie-archive-test-"));
    const sqliteDbPath = path.join(tempRoot, "movie-archive.db");
    const backupDir = path.join(tempRoot, "backups");

    process.env.ADMIN_EMAIL = "admin@example.com";
    process.env.ADMIN_PASSWORD = "change-me-now";
    process.env.APP_BASE_URL = "http://localhost:5173";
    process.env.BACKUP_DIR = backupDir;
    process.env.BACKUP_TIMEZONE = "Europe/Istanbul";
    process.env.NODE_ENV = "test";
    process.env.PORT = "3001";
    process.env.SESSION_SECRET = "a-very-long-session-secret";
    process.env.SQLITE_DB_PATH = sqliteDbPath;
    process.env.TMDB_API_KEY = "";
    process.env.TRUST_PROXY = "false";
};

test("createApp serves API and health endpoints", async () => {
    createTestEnvironment();

    const { createApp } = await import("./app.js");
    const app = createApp();

    const apiResponse = await request(app).get("/api");
    assert.equal(apiResponse.status, 200);
    assert.deepEqual(apiResponse.body, {
        message: "Movie Archive API",
        status: "ok",
    });
    assert.match(apiResponse.headers["x-request-id"], /^[0-9a-f-]{36}$/i);

    const healthResponse = await request(app).get("/api/health");
    assert.equal(healthResponse.status, 200);
    assert.equal(healthResponse.body.status, "ok");
    assert.equal(healthResponse.body.checks.databaseFileExists, true);
    assert.equal(healthResponse.body.session.cookieName, "movie-archive.sid");
    assert.equal(healthResponse.body.session.secureCookies, false);
    assert.match(healthResponse.headers["x-request-id"], /^[0-9a-f-]{36}$/i);
});
