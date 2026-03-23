# Monitoring

## Health Endpoint

The application exposes:

```text
/api/health
```

Current response includes:

- `status`
- `nodeEnv`
- `appBaseUrl`
- `backup.directory`
- `backup.latestBackupAt`
- `backup.latestBackupAgeHours`
- `backup.hasRecentBackup`
- `databasePath`
- `checks.backupDirectoryExists`
- `checks.databaseFileExists`
- `session`
- `timestamp`
- `uptimeSeconds`

This is enough for lightweight uptime and deploy validation.

`backup.hasRecentBackup` alanı, son backup yaşı `84 saat` veya daha az ise `true` olur.

## What to Watch

Minimum production checks:

- `/api/health` returns `200`
- container health remains `healthy`
- `backup.hasRecentBackup` stays `true`
- login works
- archive page loads

Useful host-level checks:

- disk usage
- Docker container restart frequency
- backup directory growth

## Recommended Alerts

Even for a small self-hosted app, these are worth having:

- app health endpoint down
- backup freshness too old
- disk usage too high
- repeated container restarts
- backup job not producing fresh files

## Practical Cadence

- after every deploy: check `/api/health`
- daily: confirm backup files are being created
- weekly: review disk usage and container logs
