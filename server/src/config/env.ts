import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    ADMIN_EMAIL: z.string().trim().email("ADMIN_EMAIL must be a valid email address").optional().or(z.literal("")),
    ADMIN_PASSWORD: z.string().optional().or(z.literal("")),
    APP_BASE_URL: z.string().trim().url("APP_BASE_URL must be a valid URL").default("http://localhost:5173"),
    BACKUP_DIR: z.string().trim().min(1, "BACKUP_DIR is required").default("./backups"),
    BACKUP_TIMEZONE: z.string().trim().min(1, "BACKUP_TIMEZONE is required").default("Europe/Istanbul"),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int("PORT must be a valid number").positive("PORT must be a valid number").default(3001),
    SESSION_SECRET: z.string().trim().min(1, "SESSION_SECRET is required"),
    SQLITE_DB_PATH: z.string().trim().min(1, "SQLITE_DB_PATH is required").default("./data/movie-archive.db"),
    TMDB_API_KEY: z.string().optional().or(z.literal("")),
    TRUST_PROXY: z
        .union([z.literal("true"), z.literal("false"), z.undefined()])
        .transform((value) => value === "true"),
});

const weakSessionSecrets = new Set([
    "change-me",
    "change-this-to-a-long-random-secret",
    "changeme",
    "default",
    "movie-archive",
    "secret",
]);

const validateProductionSecrets = (rawEnv: z.infer<typeof envSchema>) => {
    if (
        rawEnv.NODE_ENV === "production" &&
        (rawEnv.SESSION_SECRET.length < 16 || weakSessionSecrets.has(rawEnv.SESSION_SECRET.toLowerCase()))
    ) {
        throw new Error("A strong SESSION_SECRET is required in production");
    }
};

export const parseEnv = (rawEnv: NodeJS.ProcessEnv) => {
    const parsedEnv = envSchema.safeParse(rawEnv);

    if (!parsedEnv.success) {
        throw new Error(parsedEnv.error.issues[0]?.message ?? "Invalid server environment variables");
    }

    validateProductionSecrets(parsedEnv.data);

    return {
        adminEmail: parsedEnv.data.ADMIN_EMAIL ?? "",
        adminPassword: parsedEnv.data.ADMIN_PASSWORD ?? "",
        appBaseUrl: parsedEnv.data.APP_BASE_URL,
        backupDir: parsedEnv.data.BACKUP_DIR,
        backupTimezone: parsedEnv.data.BACKUP_TIMEZONE,
        logLevel: parsedEnv.data.LOG_LEVEL ?? (parsedEnv.data.NODE_ENV === "production" ? "info" : "debug"),
        nodeEnv: parsedEnv.data.NODE_ENV,
        port: parsedEnv.data.PORT,
        sessionSecret: parsedEnv.data.SESSION_SECRET,
        sqliteDbPath: parsedEnv.data.SQLITE_DB_PATH,
        tmdbApiKey: parsedEnv.data.TMDB_API_KEY ?? "",
        trustProxy: parsedEnv.data.TRUST_PROXY,
    } as const;
};

export const env = parseEnv(process.env);
