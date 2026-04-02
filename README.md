# Movie Archive

Movie Archive is a self-hosted app for tracking watched films in a private archive.

- Frontend: `React 19`, `Vite`, `Tailwind CSS v4`, `Untitled UI`
- Backend: `Express`, `TypeScript`
- Database: `SQLite`
- Auth: `server-side session`
- Metadata provider: `TMDb`
- Runtime: `Docker Compose` or local Node.js

## Features

- Search TMDb and add movies into a personal archive
- Track watched date, rating, and notes
- Browse archive entries with filtering, sorting, and pagination
- Serve frontend and API from the same origin in production
- Persist SQLite data and automated backups with Docker

## Requirements

- Node.js `22+`
- npm `10+`
- Docker and Docker Compose for the containerized production flow
- A valid and reachable `TMDB_API_KEY`

## Local development

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env
```

3. Fill in at least these values:

```env
SESSION_SECRET=replace-with-a-long-random-secret
TMDB_API_KEY=your-tmdb-key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
```

The rest of the settings already have runtime defaults. Uncomment advanced overrides in `.env.example` only if you need them.

The app validates `TMDB_API_KEY` against TMDb before startup. If the key is invalid or TMDb cannot be reached, the server will not start.

4. Start the app:

```bash
npm run dev:full
```

Default local URLs:

- frontend: `http://localhost:5173`
- backend: `http://localhost:3001`

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Docker production flow

The production container serves the built frontend and the API from the same origin.

1. Create `.env` from `.env.example`.
2. Set production-safe values:
   - `SESSION_SECRET=<long-random-secret>`
   - `TMDB_API_KEY=<your-tmdb-key>`
   - `ADMIN_EMAIL=<your-admin-email>`
   - `ADMIN_PASSWORD=<your-admin-password>`
   - uncomment `TRUST_PROXY=true` only when running behind a reverse proxy
   - uncomment `APP_BASE_URL=...` only for split-origin local development or special proxy setups
3. Build and start the stack:

```bash
docker compose up --build -d
```

Useful commands:

```bash
docker compose ps
docker compose logs --tail=200
docker compose logs --tail=200 movie-archive
docker compose logs --tail=200 movie-archive-backup
```

Persistent runtime paths:

- `./data` for SQLite files
- `./backups` for automated backups

## Environment

Minimal setup requires only:

- `SESSION_SECRET`
- `TMDB_API_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Optional advanced overrides are documented inline in [.env.example](/home/furkan/Projects/movie-archive-app/movie-archive/.env.example), including:

- local split-origin dev settings like `APP_BASE_URL` and `VITE_API_BASE_URL`
- runtime overrides like `PORT`, `LOG_LEVEL`, `SQLITE_DB_PATH`, and `BACKUP_DIR`
- reverse-proxy configuration via `TRUST_PROXY`

The server will fail fast at startup if `TMDB_API_KEY` is missing, invalid, or TMDb is unreachable.

Cookie behavior is automatic:

- cookies are not marked `secure` in local development and tests
- cookies are marked `secure` in production
- the cookie name and session lifetime use the built-in defaults

## Health and backups

Health endpoint:

```text
/api/health
```

Manual backup:

```bash
npm run backup:create
```

Automated backup behavior:

- handled by `movie-archive-backup`
- runs every `72` hours
- keeps the latest `3` backup files
- writes into `./backups`

## Logging

Backend logs go to stdout:

- development uses human-readable logs
- production uses structured JSON logs
- every request includes an `X-Request-Id` response header and matching request log metadata

Optional control:

- `LOG_LEVEL=debug|info|warn|error`

Additional docs:

- [Operations runbook](docs/operations.md)
- [Backup and restore](docs/backup-and-restore.md)
- [Monitoring](docs/monitoring.md)
- [Roadmap](docs/roadmap.md)
- [Contributing](CONTRIBUTING.md)
