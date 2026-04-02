# Movie Archive Roadmap

## Project Summary

Personal movie archive application for self-hosted use.

- Frontend: `React + Vite`
- Backend: `Express + TypeScript`
- Database: `SQLite`
- Auth: `server-side session`
- Metadata provider: `TMDb`
- Deployment target: `self-hosted`
- Final packaging: `Docker`

Related operations documents:

- `docs/backup-and-restore.md`
- `docs/operations.md`
- `docs/monitoring.md`

## Current Status

- Overall status: `release preparation`
- Current phase: `Phase 8: Open-source baseline`
- Completed phases: `7 / 8`
- Immediate next milestone: keep the self-hosted release reproducible and easy to contribute to

## Agreed Technical Architecture

- Application architecture: `React + Vite + Express + SQLite`
- Authentication model: `server-side session`
- Metadata strategy: `TMDb` as primary source
- Hosting model: self-hosted on a VDS or personal server
- User scope: single primary user
- Packaging target: Dockerized production deployment

## Phase Summary

### Phase 0 to Phase 7

- Foundation, backend core, authentication, TMDb integration, archive domain, frontend application, hardening, and Dockerization are complete.
- Production runtime serves the built frontend from Express and keeps `/api/*` on the same origin.
- Automated backup rotation and health visibility are already in place.

### Phase 8: Open-source baseline

- Status: `in progress`
- Progress: `90%`
- Goal: make the repository safe and approachable for public release
- Tasks:
  - [x] stop tracking runtime SQLite files
  - [x] add MIT license and contribution guidance
  - [x] replace private deploy assumptions with a local Docker build flow
  - [x] add lint, typecheck, test, and build commands
  - [x] add GitHub Actions validation checks
  - [ ] publish the repository and gather first external feedback

## Open Risks

- Poster images are still fetched remotely and are not cached locally.
- Production monitoring remains intentionally lightweight for a self-hosted app.

## Change Log

- `2026-03-22`: Built the initial backend, auth, TMDb integration, archive domain, and frontend application.
- `2026-03-22`: Added same-origin production serving, Docker packaging, health checks, and startup admin bootstrap.
- `2026-03-23`: Added backup automation, retention, and backup freshness reporting.
- `2026-04-02`: Added the open-source baseline: MIT license, contribution guidance, GitHub Actions CI, lint/typecheck/test commands, Docker-first local production flow, and runtime artifact cleanup.
