# Monitoring

## Health endpoint

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

`backup.hasRecentBackup` becomes `true` when the latest backup is at most `84` hours old.

## What to watch

Minimum production checks:

- `/api/health` returns `200`
- container health remains `healthy`
- `backup.hasRecentBackup` stays `true`
- login works
- archive page loads

Startup note:

- the app will not become healthy unless TMDb configuration validation succeeds during startup

## Logging

Operational logs include:

- startup events such as TMDb validation and admin bootstrap outcomes
- one access log per HTTP request with method, path, status, duration, request ID, and authenticated user ID when available
- centralized error logs for both expected application errors and unexpected exceptions

For request troubleshooting, match the `X-Request-Id` response header with the `requestId` field in the server logs.

Useful host-level checks:

- disk usage
- Docker container restart frequency
- backup directory growth

## Recommended alerts

Even for a small self-hosted app, these are worth having:

- app health endpoint down
- backup freshness too old
- disk usage too high
- repeated container restarts
- backup job not producing fresh files

## Practical cadence

- after every deploy: check `/api/health`
- daily: confirm fresh files appear in `./backups`
- weekly: review disk usage and container logs
