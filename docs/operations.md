# Operations Runbook

Movie Archive is intended to run as a self-hosted Docker Compose application.

## Runtime model

- Runtime: `Docker Compose`
- App image source: local `Dockerfile` build
- Reverse proxy: external to this repository
- Persistence: host-mounted `./data` and `./backups`

## Start or update the stack

From the project root:

```bash
docker compose up --build -d
```

This rebuilds the local image and starts:

- `movie-archive`
- `movie-archive-backup`

## Useful commands

Show service status:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs --tail=200
```

Show app logs only:

```bash
docker compose logs --tail=200 movie-archive
```

The app writes structured JSON logs in production and human-readable logs in development. Each request log includes a request ID that also appears in the `X-Request-Id` response header.

Restart app:

```bash
docker compose restart movie-archive
```

Show backup service logs:

```bash
docker compose logs --tail=200 movie-archive-backup
```

Run a manual backup inside the app container:

```bash
docker exec movie-archive node dist-server/src/scripts/backup-sqlite.js
```

Rebuild after local changes:

```bash
docker compose build
docker compose up -d
```

## Rollback

Rollback uses a previously known-good source revision plus the persisted runtime data.

```bash
git checkout <known-good-commit-or-tag>
docker compose up --build -d
```

After rollback:

- check `docker compose ps`
- check `docker compose logs --tail=200`
- verify `/api/health`
- verify login and archive list manually

## Troubleshooting

If the app is up but unhealthy:

- inspect container logs
- inspect `movie-archive-backup` logs if backup freshness is stale
- verify `SESSION_SECRET` and `TMDB_API_KEY`
- verify `TRUST_PROXY=true` only if you are behind a reverse proxy
- verify `LOG_LEVEL` only if logs are unexpectedly too quiet
- verify the SQLite path is writable
- check free disk space on the server

If the app does not start at all:

- verify `TMDB_API_KEY` is valid
- verify the host can reach `api.themoviedb.org`
- inspect startup logs for TMDb configuration validation failures
- verify `SESSION_SECRET` is set and production-safe
