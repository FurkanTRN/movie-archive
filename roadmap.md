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

This document is the living implementation roadmap for the project. It is intended to track what has been decided, what is in progress, what is blocked, and what remains to be built.

## Agreed Technical Architecture

- Application architecture: `React + Vite + Express + SQLite`
- Authentication model: `server-side session`
- Token strategy: `JWT` will not be used
- Metadata strategy: `TMDb` as primary source
- IMDb strategy: direct IMDb scraping will not be used
- Hosting model: self-hosted on a VDS
- User scope: single primary user
- Packaging target: Dockerized production deployment at the end

## Current Status

- Overall status: `active development`
- Current phase: `Phase 7: Dockerization`
- Completed phases: `6 / 8`
- Immediate next milestone: finish container packaging with compose, persistent volumes, and smoke testing

## Phases

### Phase 0: Foundation

- Status: `done`
- Progress: `100%`
- Goal: establish the initial project structure, runtime boundaries, and roadmap baseline
- Scope:
  - define frontend/backend split
  - define environment configuration approach
  - create and maintain the roadmap document
- Tasks:
  - [x] Define target folder structure for frontend and backend runtime separation
  - [x] Create `server/` application skeleton
  - [x] Define shared environment variable naming and loading strategy
  - [x] Create initial `roadmap.md` living document
  - [x] Define local development workflow for frontend and backend together
- Acceptance Criteria:
  - frontend/backend responsibilities are documented and unambiguous
  - `server/` exists and is ready for backend implementation
  - environment configuration approach is chosen and documented
  - roadmap is present and ready to be updated during delivery
- Notes:
  - Frontend runtime remains under `src/`.
  - Backend runtime now lives under `server/src/`.
  - Local workflow is split into `npm run dev:client`, `npm run dev:server`, and `npm run dev:full`.
  - Shared environment strategy is defined via `.env.example`.

### Phase 1: Backend Core

- Status: `done`
- Progress: `100%`
- Goal: create the backend foundation for API delivery
- Scope:
  - Express app bootstrap
  - SQLite connectivity
  - migrations or schema bootstrap
  - basic error handling
  - session infrastructure
- Tasks:
  - [x] Set up `Express + TypeScript`
  - [x] Add backend build and dev scripts
  - [x] Add SQLite access layer
  - [x] Choose migration or schema initialization strategy
  - [x] Add baseline error middleware
  - [x] Add session store integration
- Acceptance Criteria:
  - backend starts locally
  - database connection is working
  - schema bootstrap path is defined
  - session plumbing is available for auth work
- Notes:
  - Current database layer uses `better-sqlite3`.
  - Schema initialization currently uses startup SQL bootstrap, which is sufficient for early phases.
  - Session plumbing is currently backed by `memorystore` and will be revisited for production hardening if needed.
  - SQLite file path remains compatible with later Docker volume mounting.

### Phase 2: Authentication

- Status: `done`
- Progress: `100%`
- Goal: add a production-appropriate login flow for a self-hosted single-user app
- Scope:
  - login/logout/me endpoints
  - initial admin user creation
  - auth middleware
  - cookie security configuration
- Tasks:
  - [x] Implement `POST /api/auth/login`
  - [x] Implement `POST /api/auth/logout`
  - [x] Implement `GET /api/auth/me`
  - [x] Add password hashing with `bcrypt`
  - [x] Add authenticated route guard middleware
  - [x] Add first-user or admin seed flow
  - [x] Configure production cookie settings
- Acceptance Criteria:
  - valid login creates a working session
  - invalid credentials are rejected safely
  - protected endpoints reject unauthenticated requests
  - logout destroys session state correctly
- Notes:
  - Password hashing is implemented with `bcryptjs`.
  - Initial admin bootstrap is implemented via the `npm run admin:create` script.
  - Session cookie config already respects production secure mode.
  - Implementation remains compatible with a single-domain frontend/backend deployment.

### Phase 3: Movie Metadata Integration

- Status: `done`
- Progress: `100%`
- Goal: support movie search and metadata retrieval from TMDb
- Scope:
  - TMDb client
  - movie search endpoint
  - movie detail endpoint
  - response normalization
  - IMDb id and link mapping when available
- Tasks:
  - [x] Add TMDb API client module
  - [x] Implement `GET /api/movies/search`
  - [x] Implement `GET /api/movies/tmdb/:tmdbId`
  - [x] Normalize TMDb responses for frontend use
  - [x] Persist `imdb_id` and IMDb link when available
  - [x] Add backend validation for empty or invalid search input
- Acceptance Criteria:
  - movie search returns usable results
  - movie detail returns normalized application data
  - TMDb API key is server-only
  - IMDb reference data is stored when available
- Notes:
  - Frontend should never call TMDb directly.
  - TMDb responses are normalized in the backend before reaching the UI.
  - IMDb reference fields are persisted when a movie is written into the local catalog during archive creation.

### Phase 4: Archive Domain

- Status: `done`
- Progress: `100%`
- Goal: support storing and managing archived watched movies
- Scope:
  - movie persistence
  - archive entry persistence
  - add/update/delete flows
  - duplicate rules
- Tasks:
  - [x] Create `movies` table
  - [x] Create `movie_genres` table
  - [x] Create `archive_entries` table
  - [x] Implement `GET /api/archive`
  - [x] Implement `POST /api/archive`
  - [x] Implement `PATCH /api/archive/:id`
  - [x] Implement `DELETE /api/archive/:id`
  - [x] Enforce duplicate rule for user + movie
- Acceptance Criteria:
  - a searched movie can be added to the archive
  - archived records can be updated and deleted
  - duplicate handling is deterministic
  - list endpoint supports archive rendering needs
- Notes:
  - Current default rule is one archive record per user per movie in v1.
  - Archive creation fetches the latest TMDb detail and upserts the local movie catalog before writing the archive entry.

### Phase 5: Frontend Application

- Status: `done`
- Progress: `100%`
- Goal: replace starter content with the actual movie archive application UI
- Scope:
  - login page
  - protected app shell
  - archive list
  - search/filter/sort
  - add movie flow
  - edit archive flow
- Tasks:
  - [x] Build login screen
  - [x] Add protected routing/auth bootstrap
  - [x] Build archive list screen
  - [x] Add archive search
  - [x] Add filtering controls
  - [x] Add sorting controls
  - [x] Build add-movie search and selection flow
  - [x] Build archive entry edit flow
  - [x] Replace starter home page content
- Acceptance Criteria:
  - users can log in and reach the archive UI
  - archive records can be viewed, filtered, and sorted
  - movie search to archive flow is usable end to end
  - UI is functional on desktop and mobile
- Notes:
  - Existing Untitled UI components are reused for inputs, buttons, textarea, and select controls.
  - Frontend now talks only to the local backend API via a shared API client with credentials enabled.

### Phase 6: Hardening

- Status: `in progress`
- Progress: `90%`
- Goal: improve reliability, UX edge handling, and production readiness
- Scope:
  - validation
  - loading/empty/error states
  - responsive polish
  - basic logging
  - production env review
- Tasks:
  - [x] Add request validation across backend endpoints
  - [x] Add frontend loading states
  - [x] Add frontend empty states
  - [x] Add frontend error states
  - [x] Review mobile layout and interaction issues
  - [x] Add basic server logging
  - [x] Review production environment defaults and secrets handling
  - [x] Add archive pagination
  - [x] Add modal overlay dismiss behavior
  - [x] Add archive-specific custom scrollbar styling
  - [x] Add TMDb request caching and lazy-loaded archive UI
  - [x] Add `zod` validation for backend routes, frontend forms, env parsing, and pagination limits
  - [x] Add production-safe session persistence and auth session regeneration
- Acceptance Criteria:
  - invalid input is handled predictably
  - empty and error scenarios are understandable in the UI
  - production configuration is documented and sane
  - core flows are resilient enough for self-hosted daily use
- Notes:
  - This phase should happen before final Docker packaging.
  - Archive UX refinements are in progress: Turkish localization, archive search narrowing, year sort, and unknown watched date flow.
  - Pagination is now server-side.
  - Current optimization focus is reducing repeated TMDb requests and shrinking the initial frontend bundle.
  - Pagination page size is now capped at `12` in the frontend, backend validation, and repository fallback.
  - Production auth now uses SQLite-backed sessions, aligned cookie clearing, session regeneration on login, and proxy-aware runtime config.

### Phase 7: Dockerization

- Status: `in progress`
- Progress: `85%`
- Goal: package the application for repeatable self-hosted deployment
- Scope:
  - production build flow
  - Dockerfile
  - docker ignore rules
  - compose definition
  - persistent SQLite volume
  - startup and seed strategy
  - smoke test
- Tasks:
  - [x] Create production `Dockerfile`
  - [x] Create `.dockerignore`
  - [x] Create `docker-compose.yml`
  - [x] Mount persistent volume for SQLite data
  - [x] Define production startup command
  - [x] Define seed or admin bootstrap strategy
  - [x] Add CI/CD deploy gate for manual production deploys
  - [ ] Run deployment smoke test with compose
- Acceptance Criteria:
  - app can be started with `docker compose up`
  - frontend and backend work correctly in containerized production mode
  - SQLite data survives container restart
  - required environment variables are documented
- Notes:
  - Dockerization is the final packaging phase, not an afterthought.
  - Production runtime now serves the built frontend from Express and keeps `/api/*` on the same origin, so CORS stays dev-only.

## Risks / Open Decisions

- Need to choose whether frontend static files are served by Express in production or by a separate proxy/container.
- Need to define whether poster images are stored remotely only or cached locally later.

## Change Log

- `2026-03-22`: Created initial living roadmap document with phased plan, progress tracking, architecture decisions, and open risks.
- `2026-03-22`: Completed Phase 0 by adding the `server/` skeleton, server TypeScript config, shared environment template, and split frontend/backend dev-build scripts.
- `2026-03-22`: Completed Phase 1 by adding the SQLite core with schema bootstrap, session middleware, baseline backend error handling, and database bootstrap tooling.
- `2026-03-22`: Completed Phase 2 by adding login/logout/me auth routes, session-backed auth middleware, password hashing, and the initial admin creation script.
- `2026-03-22`: Completed Phase 3 by adding TMDb-backed movie search and detail endpoints with normalized backend responses.
- `2026-03-22`: Completed Phase 4 by adding local movie persistence, genre sync, archive CRUD endpoints, and duplicate archive protection.
- `2026-03-22`: Completed Phase 5 by replacing the starter frontend with a protected movie archive UI, login page, archive list, search and filter controls, and add/edit archive modals.
- `2026-03-22`: Started Phase 6 hardening by refining archive UX, tightening Turkish localization, and updating search and sort behavior.
- `2026-03-22`: Added server-side archive pagination, archive modal overlay dismiss behavior, custom modal scrollbars, and the first optimization pass for TMDb caching and lazy-loaded UI boundaries.
- `2026-03-22`: Added `zod`-based backend route validation, frontend form validation, env parsing, and a strict archive page size limit of `12`.
- `2026-03-22`: Hardened production auth with SQLite-backed sessions, proxy-aware cookie config, login session regeneration, aligned logout cookie clearing, and startup session logging.
- `2026-03-22`: Switched production to same-origin frontend serving with dev-only CORS, added a multi-stage `Dockerfile`, and started the Dockerization phase.
- `2026-03-22`: Added a production `docker-compose.yml` that pulls from the private registry, mounts persistent SQLite data, and includes a container healthcheck.
- `2026-03-22`: Added idempotent startup admin bootstrap so the first user can be created automatically from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- `2026-03-22`: Added a manual Woodpecker deploy step that connects to the VDS over SSH, deploys by immutable image SHA, and blocks on a container health gate plus `/api/health`.
