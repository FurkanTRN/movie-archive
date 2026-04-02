import { env } from "../config/env.js";

type LogLevel = "debug" | "info" | "warn" | "error";
type MetadataValue = string | number | boolean | null | undefined;
type LogMetadata = Record<string, MetadataValue>;

const logLevelWeights: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};

const shouldLog = (level: LogLevel) => {
    return logLevelWeights[level] >= logLevelWeights[env.logLevel];
};

const normalizeMetadata = (metadata?: LogMetadata) => {
    if (!metadata) {
        return {};
    }

    return Object.fromEntries(Object.entries(metadata).filter(([, value]) => value !== undefined));
};

const formatMetadata = (metadata: LogMetadata) => {
    const entries = Object.entries(metadata);

    if (entries.length === 0) {
        return "";
    }

    return entries
        .map(([key, value]) => {
            if (typeof value === "string") {
                return `${key}=${JSON.stringify(value)}`;
            }

            return `${key}=${String(value)}`;
        })
        .join(" ");
};

const writeLog = (level: LogLevel, message: string, metadata?: LogMetadata, error?: unknown) => {
    if (!shouldLog(level)) {
        return;
    }

    const normalizedMetadata = normalizeMetadata(metadata);
    const consoleMethod = level === "debug" ? console.info : console[level];

    if (env.nodeEnv === "production") {
        const payload: Record<string, unknown> = {
            level,
            message,
            timestamp: new Date().toISOString(),
            ...normalizedMetadata,
        };

        if (error instanceof Error) {
            payload.errorMessage = error.message;
            payload.errorName = error.name;
            payload.stack = error.stack;
        }

        consoleMethod(JSON.stringify(payload));
        return;
    }

    const prettyLine = [`[${new Date().toISOString()}]`, level.toUpperCase(), message, formatMetadata(normalizedMetadata)].filter(Boolean).join(" ");

    if (error instanceof Error) {
        consoleMethod(`${prettyLine}\n${error.stack ?? error.message}`);
        return;
    }

    consoleMethod(prettyLine);
};

export const logger = {
    debug: (message: string, metadata?: LogMetadata) => {
        writeLog("debug", message, metadata);
    },
    info: (message: string, metadata?: LogMetadata) => {
        writeLog("info", message, metadata);
    },
    warn: (message: string, metadata?: LogMetadata, error?: unknown) => {
        writeLog("warn", message, metadata, error);
    },
    error: (message: string, metadata?: LogMetadata, error?: unknown) => {
        writeLog("error", message, metadata, error);
    },
};
