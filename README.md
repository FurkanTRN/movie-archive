# Movie Archive

![MIT License](https://img.shields.io/badge/license-MIT-green.svg)
![Node 22+](https://img.shields.io/badge/node-22%2B-339933?logo=node.js&logoColor=white)
![Docker Compose](https://img.shields.io/badge/docker-compose-2496ED?logo=docker&logoColor=white)
![React 19](https://img.shields.io/badge/react-19-20232a?logo=react&logoColor=61DAFB)
![Self-Hosted](https://img.shields.io/badge/deployment-self--hosted-4f46e5)

Movie Archive is a self-hosted app for building a private, searchable movie archive.
It gives you TMDb-powered metadata, personal notes and ratings, and a simple Docker deployment without turning a personal catalog into an overbuilt system.

Built for people who want:

- a private movie archive instead of a social app
- TMDb search and metadata without custom scraping
- same-origin production runtime with lightweight ops
- backups, health visibility, and straightforward local ownership

> `Movie Archive` is a temporary working name. If you have a stronger name or logo direction for the project, open an issue and share it.

## Why this project

- Personal-first: built for a private archive, not a bloated multi-tenant app
- Simple to run: source-based Docker deployment with persistent local data
- Operationally honest: health endpoint, backups, startup validation, and stdout logging
- Easy to understand: React frontend, Express backend, SQLite storage

## Stack

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

## Preview

Main UI surfaces:

- archive dashboard with search, filters, and pagination
- add-movie flow backed by TMDb search and detail lookup
- movie detail modal with archive notes
- responsive archive cards and modal flows for desktop and mobile

## Quick start

Recommended path for normal use:

```bash
cp .env.example .env
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

Set at least these values in `.env` before starting:

```env
SESSION_SECRET=replace-with-a-long-random-secret
TMDB_API_KEY=your-tmdb-key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
```

The app validates `TMDB_API_KEY` against TMDb before startup. If the key is invalid or TMDb cannot be reached, the server will not start.

## Local development

Local Node/Vite development is for contributors and app development, not the primary self-hosted runtime.

```bash
npm install
npm run dev:full
```

Default local URLs:

- frontend: `http://localhost:5173`
- backend: `http://localhost:3001`

## Reverse proxy

If you want to expose the app through a domain, put your reverse proxy in front of the `movie-archive` container and forward traffic to port `3001`.

Set this in `.env` when running behind a reverse proxy:

```env
TRUST_PROXY=true
```

### Nginx

```nginx
server {
    listen 80;
    server_name movie.example.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Caddy

```caddy
movie.example.com {
    reverse_proxy 127.0.0.1:3001
}
```

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Environment

Environment details now live in [docs/environment-variables.md](docs/environment-variables.md).

Use `.env.example` for the default setup path, and consult the environment variables document when you need deployment-specific overrides.

## Operational notes

- startup fails fast if `TMDB_API_KEY` is missing, invalid, or TMDb is unreachable
- production serves the frontend and `/api/*` from the same origin
- automated backups write into `./backups`
- health endpoint is available at `/api/health`
- backend logs go to stdout

## Health, backups, and logging

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

Backend logs go to stdout:

- development uses human-readable logs
- production uses structured JSON logs
- every request includes an `X-Request-Id` response header and matching request log metadata

Optional control:

- `LOG_LEVEL=debug|info|warn|error`

## Open source

- License: [MIT](LICENSE)
- Contribution guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Project status and direction: [docs/roadmap.md](docs/roadmap.md)

This repository is intended to be a practical self-hosted application, not a managed service or a generic starter kit.

## Additional docs

- [Environment variables](docs/environment-variables.md)
- [Operations runbook](docs/operations.md)
- [Backup and restore](docs/backup-and-restore.md)
- [Monitoring](docs/monitoring.md)
- [Roadmap](docs/roadmap.md)
- [Contributing](CONTRIBUTING.md)
