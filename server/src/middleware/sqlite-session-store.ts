import session from "express-session";
import type Database from "better-sqlite3";

interface SqliteSessionStoreOptions {
    cleanupIntervalMs?: number;
    db: Database.Database;
    tableName?: string;
}

interface SessionRow {
    expires_at: number;
    sess: string;
}

export class SqliteSessionStore extends session.Store {
    private readonly cleanupIntervalMs: number;
    private readonly db: Database.Database;
    private readonly tableName: string;
    private cleanupTimer?: NodeJS.Timeout;

    constructor({ cleanupIntervalMs = 1000 * 60 * 15, db, tableName = "sessions" }: SqliteSessionStoreOptions) {
        super();
        this.cleanupIntervalMs = cleanupIntervalMs;
        this.db = db;
        this.tableName = tableName;

        this.ensureTable();
        this.startCleanupTimer();
    }

    override destroy(sid: string, callback?: (error?: unknown) => void) {
        try {
            this.db.prepare(`DELETE FROM ${this.tableName} WHERE sid = ?`).run(sid);
            callback?.();
        } catch (error) {
            callback?.(error);
        }
    }

    override get(sid: string, callback: (error: unknown, session?: session.SessionData | null) => void) {
        try {
            const row = this.db.prepare(`SELECT sess, expires_at FROM ${this.tableName} WHERE sid = ?`).get(sid) as SessionRow | undefined;

            if (!row) {
                callback(null, null);
                return;
            }

            if (row.expires_at <= Date.now()) {
                this.db.prepare(`DELETE FROM ${this.tableName} WHERE sid = ?`).run(sid);
                callback(null, null);
                return;
            }

            callback(null, JSON.parse(row.sess) as session.SessionData);
        } catch (error) {
            callback(error);
        }
    }

    override set(sid: string, sess: session.SessionData, callback?: (error?: unknown) => void) {
        try {
            const expiresAt = this.resolveExpiration(sess);

            this.db
                .prepare(
                    `
                        INSERT INTO ${this.tableName} (sid, sess, expires_at)
                        VALUES (?, ?, ?)
                        ON CONFLICT(sid) DO UPDATE SET
                            sess = excluded.sess,
                            expires_at = excluded.expires_at
                    `,
                )
                .run(sid, JSON.stringify(sess), expiresAt);

            callback?.();
        } catch (error) {
            callback?.(error);
        }
    }

    override touch(sid: string, sess: session.SessionData, callback?: () => void) {
        try {
            const expiresAt = this.resolveExpiration(sess);
            this.db.prepare(`UPDATE ${this.tableName} SET expires_at = ? WHERE sid = ?`).run(expiresAt, sid);
            callback?.();
        } catch {
            callback?.();
        }
    }

    private ensureTable() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS ${this.tableName} (
                sid TEXT PRIMARY KEY,
                sess TEXT NOT NULL,
                expires_at INTEGER NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_${this.tableName}_expires_at
            ON ${this.tableName} (expires_at);
        `);
    }

    private resolveExpiration(sess: session.SessionData) {
        const cookieExpiry = sess.cookie?.expires ? new Date(sess.cookie.expires).getTime() : null;
        const cookieMaxAge = typeof sess.cookie?.maxAge === "number" ? Date.now() + sess.cookie.maxAge : null;

        return cookieExpiry ?? cookieMaxAge ?? Date.now() + 1000 * 60 * 60 * 24 * 7;
    }

    private startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.db.prepare(`DELETE FROM ${this.tableName} WHERE expires_at <= ?`).run(Date.now());
        }, this.cleanupIntervalMs);

        this.cleanupTimer.unref?.();
    }
}
