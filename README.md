# Movie Archive

Self-hosted personal movie archive application.

- Frontend: `React 19 + Vite + Untitled UI`
- Backend: `Express + TypeScript`
- Database: `SQLite`
- Auth: `server-side session`
- Metadata: `TMDb`
- Deployment: `Docker Compose + Woodpecker`

## What It Does

- Search movies from TMDb
- Add watched movies into a personal archive
- Edit watched date, personal rating, and notes
- View movie details in a modal
- Filter, sort, and paginate archive entries
- Run same-origin production deployment behind a reverse proxy
- Create automatic SQLite backups with a backup sidecar container

## Stack

### Frontend

- `React`
- `TypeScript`
- `Vite`
- `Tailwind CSS v4`
- `react-aria-components`
- `Untitled UI`

### Backend

- `Express`
- `TypeScript`
- `better-sqlite3`
- `express-session`
- `zod`

## Project Structure

```text
src/                 frontend app
server/src/          backend app
docs/                roadmap and operations docs
docker-compose.yml   production runtime
Dockerfile           production image
```

## Local Development

### 1. Install

```bash
npm install
```

### 2. Create env file

Copy `.env.example` to `.env` and fill in at least:

```env
SESSION_SECRET=your-dev-secret
TMDB_API_KEY=your-tmdb-key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
```

### 3. Run the app

Frontend only:

```bash
npm run dev:client
```

Backend only:

```bash
npm run dev:server
```

Frontend + backend together:

```bash
npm run dev:full
```

Default local URLs:

- frontend: `http://localhost:5173`
- backend: `http://localhost:3001`

## Build

Build everything:

```bash
npm run build
```

Build frontend only:

```bash
npm run build:client
```

Build backend only:

```bash
npm run build:server
```

## Environment

Important env variables:

- `PORT`
- `APP_BASE_URL`
- `NODE_ENV`
- `SQLITE_DB_PATH`
- `BACKUP_DIR`
- `BACKUP_TIMEZONE`
- `SESSION_SECRET`
- `SESSION_COOKIE_NAME`
- `SESSION_MAX_AGE_MS`
- `TRUST_PROXY`
- `COOKIE_SECURE_AUTO`
- `TMDB_API_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

See [.env.example](/D:/movie-archive-app/movie-archive/.env.example) for the full template.

## Production

The production image serves the built frontend and the API from the same origin.

Main files:

- [Dockerfile](/D:/movie-archive-app/movie-archive/Dockerfile)
- [docker-compose.yml](/D:/movie-archive-app/movie-archive/docker-compose.yml)

Run locally with Docker:

```bash
docker compose up -d
```

Useful commands:

```bash
docker compose ps
docker compose logs --tail=200
docker compose logs --tail=200 movie-archive-backup
```

## Backups

There are two backup paths:

Manual backup:

```bash
npm run backup:create
```

Production automated backup:

- handled by `movie-archive-backup`
- runs every `72` hours
- keeps the latest `3` backup files
- writes into `./backups`

Details:

- [backup-and-restore.md](/D:/movie-archive-app/movie-archive/docs/backup-and-restore.md)
- [monitoring.md](/D:/movie-archive-app/movie-archive/docs/monitoring.md)

## Deployment

Production deploys are image-based and use Woodpecker.

- registry: `rg.furkantrn.com/movie-archive`
- deploy model: immutable commit SHA
- deploy target: same VDS runtime with Docker socket access

Operational details:

- [operations.md](/D:/movie-archive-app/movie-archive/docs/operations.md)

## Health Check

The app exposes:

```text
/api/health
```

It includes:

- database path and existence checks
- session runtime info
- backup directory and latest backup freshness
- uptime and timestamp

## Docs

- [roadmap.md](/D:/movie-archive-app/movie-archive/docs/roadmap.md)
- [operations.md](/D:/movie-archive-app/movie-archive/docs/operations.md)
- [backup-and-restore.md](/D:/movie-archive-app/movie-archive/docs/backup-and-restore.md)
- [monitoring.md](/D:/movie-archive-app/movie-archive/docs/monitoring.md)
