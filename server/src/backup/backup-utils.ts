import fs from "node:fs";
import path from "node:path";
import { db } from "../database/db.js";
import { env } from "../config/env.js";

const MAX_BACKUP_COUNT = 3;

const BACKUP_FILE_PATTERN = /^movie-archive-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.db$/;

export interface BackupFileInfo {
    path: string;
    filename: string;
    modifiedAt: Date;
    modifiedAtMs: number;
}

const formatTimestamp = (date: Date) =>
    [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-") +
    "_" +
    [
        String(date.getHours()).padStart(2, "0"),
        String(date.getMinutes()).padStart(2, "0"),
        String(date.getSeconds()).padStart(2, "0"),
    ].join("-");

const ensureBackupDirectory = () => {
    fs.mkdirSync(env.backupDir, { recursive: true });
};

export const getBackupFiles = (): BackupFileInfo[] => {
    if (!fs.existsSync(env.backupDir)) {
        return [];
    }

    return fs
        .readdirSync(env.backupDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && BACKUP_FILE_PATTERN.test(entry.name))
        .map((entry) => {
            const backupPath = path.join(env.backupDir, entry.name);
            const stats = fs.statSync(backupPath);

            return {
                filename: entry.name,
                modifiedAt: stats.mtime,
                modifiedAtMs: stats.mtimeMs,
                path: backupPath,
            };
        })
        .sort((left, right) => right.modifiedAtMs - left.modifiedAtMs);
};

export const getLatestBackup = () => getBackupFiles()[0] ?? null;

export const createBackup = async () => {
    ensureBackupDirectory();

    const backupFilename = `movie-archive-${formatTimestamp(new Date())}.db`;
    const backupPath = path.join(env.backupDir, backupFilename);

    await db.backup(backupPath);

    return backupPath;
};

export const pruneBackupRetention = () => {
    const backupFiles = getBackupFiles();
    const keepPaths = new Set(backupFiles.slice(0, MAX_BACKUP_COUNT).map((backupFile) => backupFile.path));

    const removedPaths: string[] = [];

    for (const backupFile of backupFiles) {
        if (keepPaths.has(backupFile.path)) {
            continue;
        }

        fs.unlinkSync(backupFile.path);
        removedPaths.push(backupFile.path);
    }

    return {
        keptCount: keepPaths.size,
        removedCount: removedPaths.length,
        removedPaths,
    };
};
