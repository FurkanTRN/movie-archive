const BACKUP_INTERVAL_MS = 72 * 60 * 60 * 1000;

export const getNextBackupRunAt = (fromDate = new Date()) => {
    const nextRunAt = new Date(fromDate.getTime() + BACKUP_INTERVAL_MS);

    return nextRunAt;
};

export const getMillisecondsUntilNextBackup = () => {
    return Math.max(BACKUP_INTERVAL_MS, 0);
};
