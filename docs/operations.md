# Operations Runbook

## Production Basics

- Runtime: `Docker Compose`
- Registry: `rg.furkantrn.com/movie-archive`
- Deploy model: immutable image SHA via Woodpecker
- Reverse proxy: external to this repository

## Deploy

Production deploy is triggered from Woodpecker with:

- target: `production`
- task: `deploy`

The deploy step:

1. logs in to the private registry
2. pulls the image for the current commit SHA
3. runs `docker compose up -d`
4. waits for the container health status
5. checks `/api/health`

## Manual Runtime Commands

Run these from the production deploy directory.

Show service status:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs --tail=200
```

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

Pull and apply a specific image tag:

```bash
IMAGE_TAG=<tag> docker compose pull
IMAGE_TAG=<tag> docker compose up -d
```

## Rollback

Rollback uses a previously pushed immutable image tag.

```bash
IMAGE_TAG=<previous-commit-sha> docker compose pull
IMAGE_TAG=<previous-commit-sha> docker compose up -d
```

After rollback:

- check `docker compose ps`
- check `docker compose logs --tail=200`
- verify `/api/health`
- verify login and archive list manually

## Troubleshooting

If deploy fails:

- inspect Woodpecker step logs
- confirm `deploy_path` points to the correct compose directory
- confirm the runner still has Docker socket access
- confirm `.env` exists in the deploy directory

If the app is up but unhealthy:

- inspect container logs
- inspect `movie-archive-backup` logs if backup freshness is stale
- verify `SESSION_SECRET`, `TMDB_API_KEY`, and `APP_BASE_URL`
- verify the SQLite path is writable
- check free disk space on the server
