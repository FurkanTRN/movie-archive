export const logger = {
    error: (message: string, metadata?: Record<string, string | number | boolean | undefined>) => {
        console.error(message, metadata ?? {});
    },
    info: (message: string, metadata?: Record<string, string | number | boolean | undefined>) => {
        console.info(message, metadata ?? {});
    },
    warn: (message: string, metadata?: Record<string, string | number | boolean | undefined>) => {
        console.warn(message, metadata ?? {});
    },
};
