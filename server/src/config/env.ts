import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    ADMIN_EMAIL: z.string().trim().email("ADMIN_EMAIL geçerli bir e-posta olmalıdır").optional().or(z.literal("")),
    ADMIN_PASSWORD: z.string().optional().or(z.literal("")),
    APP_BASE_URL: z.string().trim().url("APP_BASE_URL geçerli bir URL olmalıdır").default("http://localhost:5173"),
    BACKUP_DIR: z.string().trim().min(1, "BACKUP_DIR zorunludur").default("./backups"),
    BACKUP_TIMEZONE: z.string().trim().min(1, "BACKUP_TIMEZONE zorunludur").default("Europe/Istanbul"),
    COOKIE_SECURE_AUTO: z
        .union([z.literal("true"), z.literal("false"), z.undefined()])
        .transform((value) => value !== "false"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int("PORT geçerli bir sayı olmalıdır").positive("PORT geçerli bir sayı olmalıdır").default(3001),
    SESSION_COOKIE_NAME: z.string().trim().min(1, "SESSION_COOKIE_NAME boş olamaz").default("movie-archive.sid"),
    SESSION_MAX_AGE_MS: z.coerce.number().int("SESSION_MAX_AGE_MS geçerli bir sayı olmalıdır").positive("SESSION_MAX_AGE_MS geçerli bir sayı olmalıdır").default(1000 * 60 * 60 * 24 * 7),
    SESSION_SECRET: z.string().trim().min(1, "SESSION_SECRET zorunludur"),
    SQLITE_DB_PATH: z.string().trim().min(1, "SQLITE_DB_PATH zorunludur").default("./data/movie-archive.db"),
    TMDB_API_KEY: z.string().optional().or(z.literal("")),
    TRUST_PROXY: z
        .union([z.literal("true"), z.literal("false"), z.undefined()])
        .transform((value) => value === "true"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    throw new Error(parsedEnv.error.issues[0]?.message ?? "Geçersiz sunucu ortam değişkenleri");
}

const weakSessionSecrets = new Set([
    "change-me",
    "change-this-to-a-long-random-secret",
    "changeme",
    "default",
    "movie-archive",
    "secret",
]);

if (
    parsedEnv.data.NODE_ENV === "production" &&
    (parsedEnv.data.SESSION_SECRET.length < 16 || weakSessionSecrets.has(parsedEnv.data.SESSION_SECRET.toLowerCase()))
) {
    throw new Error("Production ortamında güçlü bir SESSION_SECRET kullanılmalıdır");
}

export const env = {
    adminEmail: parsedEnv.data.ADMIN_EMAIL ?? "",
    adminPassword: parsedEnv.data.ADMIN_PASSWORD ?? "",
    appBaseUrl: parsedEnv.data.APP_BASE_URL,
    backupDir: parsedEnv.data.BACKUP_DIR,
    backupTimezone: parsedEnv.data.BACKUP_TIMEZONE,
    cookieSecureAuto: parsedEnv.data.COOKIE_SECURE_AUTO,
    nodeEnv: parsedEnv.data.NODE_ENV,
    port: parsedEnv.data.PORT,
    sessionCookieName: parsedEnv.data.SESSION_COOKIE_NAME,
    sessionMaxAgeMs: parsedEnv.data.SESSION_MAX_AGE_MS,
    sessionSecret: parsedEnv.data.SESSION_SECRET,
    sqliteDbPath: parsedEnv.data.SQLITE_DB_PATH,
    tmdbApiKey: parsedEnv.data.TMDB_API_KEY ?? "",
    trustProxy: parsedEnv.data.TRUST_PROXY,
} as const;
