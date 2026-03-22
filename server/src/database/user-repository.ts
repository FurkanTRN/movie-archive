import { db } from "./db.js";
import type { SessionUser, UserRecord } from "../types/auth.js";

const selectUserByEmail = db.prepare(`
    SELECT
        id,
        email,
        password_hash,
        created_at
    FROM users
    WHERE email = ?
`);

const selectUserById = db.prepare(`
    SELECT
        id,
        email,
        password_hash,
        created_at
    FROM users
    WHERE id = ?
`);

const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash)
    VALUES (?, ?)
`);

const countUsers = db.prepare(`
    SELECT COUNT(*) AS count
    FROM users
`);

const toUserRecord = (row: Record<string, unknown> | undefined): UserRecord | null => {
    if (!row) {
        return null;
    }

    return {
        createdAt: String(row.created_at),
        email: String(row.email),
        id: Number(row.id),
        passwordHash: String(row.password_hash),
    };
};

export const userRepository = {
    countUsers: () => {
        const row = countUsers.get() as { count: number };
        return Number(row.count);
    },
    createUser: (email: string, passwordHash: string): SessionUser => {
        const result = insertUser.run(email, passwordHash);

        return {
            email,
            id: Number(result.lastInsertRowid),
        };
    },
    findUserByEmail: (email: string) => {
        return toUserRecord(selectUserByEmail.get(email) as Record<string, unknown> | undefined);
    },
    findUserById: (id: number) => {
        return toUserRecord(selectUserById.get(id) as Record<string, unknown> | undefined);
    },
};
