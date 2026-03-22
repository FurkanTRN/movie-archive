import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { env } from "../config/env.js";
import { baseSchema } from "./schema.js";

const resolvedDbPath = path.resolve(env.sqliteDbPath);
const dbDirectory = path.dirname(resolvedDbPath);

fs.mkdirSync(dbDirectory, { recursive: true });

export const db = new Database(resolvedDbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export const bootstrapDatabase = () => {
    db.exec(baseSchema);
};

bootstrapDatabase();

export const databaseInfo = {
    path: resolvedDbPath,
} as const;
