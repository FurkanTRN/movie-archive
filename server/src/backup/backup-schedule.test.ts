import assert from "node:assert/strict";
import { test } from "node:test";
import { getMillisecondsUntilNextBackup, getNextBackupRunAt } from "./backup-schedule.js";

test("getNextBackupRunAt schedules the next run 72 hours later", () => {
    const fromDate = new Date("2026-04-02T12:00:00.000Z");
    const nextRunAt = getNextBackupRunAt(fromDate);

    assert.equal(nextRunAt.toISOString(), "2026-04-05T12:00:00.000Z");
});

test("getMillisecondsUntilNextBackup returns the fixed backup interval", () => {
    assert.equal(getMillisecondsUntilNextBackup(), 72 * 60 * 60 * 1000);
});
