## Project Overview

This repository is a self-hosted movie archive application.

- Frontend: `React 19`, `TypeScript`, `Vite`, `Tailwind CSS v4`
- Backend: `Express`, `TypeScript`
- Database: `SQLite`
- Auth: `express-session`
- Metadata source: `TMDb`

This is not a generic component library. The current product is a full-stack app with a single primary user flow:

1. sign in
2. browse/search/filter the archive
3. add a movie from TMDb
4. edit/delete entries
5. inspect movie details

## Source Layout

```text
src/                      frontend app
src/components/base/      reusable UI primitives
src/components/application/ archive/auth/app-specific UI
src/pages/                route-level screens
server/src/               Express app, database, validation, scripts
docs/                     operations and project docs
data/                     local SQLite data directory
backups/                  local backup output directory
```

Important frontend areas:

- `src/pages/archive-page.tsx`: main app screen and modal orchestration
- `src/components/application/archive/`: archive cards, header, modals, image preview
- `src/pages/login-page.tsx`: sign-in screen

Important backend areas:

- `server/src/index.ts`: startup flow
- `server/src/app.ts`: Express app wiring
- `server/src/config/env.ts`: env parsing and defaults
- `server/src/routes/`: API routes
- `server/src/tmdb/`: TMDb client and normalization
- `server/src/backup/`: backup utilities and schedule helpers

## Development Commands

```bash
npm install
npm run dev:client
npm run dev:server
npm run dev:full
npm run lint
npm run typecheck
npm run test
npm run build
```

Useful maintenance commands:

```bash
npm run backup:create
npm run db:bootstrap
npm run admin:create
```

## Environment Model

Minimal local setup:

```env
SESSION_SECRET=replace-with-a-long-random-secret
TMDB_API_KEY=your-tmdb-key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
```

Notes:

- `TMDB_API_KEY` is fail-fast validated at startup
- production and local runtime defaults live in `server/src/config/env.ts`
- advanced env overrides are documented in `.env.example`
- `TRUST_PROXY` is the main deployment-specific override still expected in some setups

## Backend Conventions

- Keep user-facing and log-facing text in English
- Prefer central logging via `server/src/lib/logger.ts`
- Do not add new `console.*` logging in server code unless there is a very strong reason
- Request/response errors should flow through the existing Express error path
- Keep startup behavior fail-fast when configuration is invalid
- Favor code defaults over expanding env surface area unless the setting truly needs operator control

## Frontend Conventions

- Keep files in `kebab-case`
- All imports from `react-aria-components` must use `Aria*` aliases
- Prefer existing base/application components before introducing new UI patterns
- Preserve the current semantic color token system
  - prefer `text-primary`, `bg-primary`, `border-secondary`, etc.
  - avoid raw palette utilities like `text-gray-900` or `bg-blue-600`
- Keep mobile behavior intentional
  - desktop quality is already strong
  - when editing archive flows, check narrow viewport behavior and avoid horizontal overflow

## Responsive Priorities

When touching the UI, test these areas first:

- archive header controls
- archive cards and action buttons
- add/edit/detail/delete modals
- image preview modal
- login page on narrow screens

Default expectation:

- no page-level horizontal scroll
- primary actions remain easy to reach on phone widths
- desktop layouts should not regress while fixing mobile

## Testing Expectations

Before finishing meaningful changes, run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

If the change affects layout or interaction:

- verify the relevant flow manually in the browser
- check both desktop and mobile-sized viewports

Current automated tests are mainly server-focused. Frontend changes still need manual verification.

## Release Hygiene

- Keep runtime/generated files out of git
- Do not commit SQLite database files from `data/`
- Keep docs aligned with actual runtime behavior
- Prefer small focused commits after each stable milestone

## Practical Guidance For Contributors

- If you are changing archive UX, start from `src/pages/archive-page.tsx`
- If you are changing deployment or env behavior, start from `README.md`, `.env.example`, and `server/src/config/env.ts`
- If you are changing auth/session behavior, inspect both route code and middleware
- If you introduce a new operational behavior, update docs in `docs/`

When in doubt, optimize for:

1. simple local setup
2. predictable production behavior
3. clean mobile usability
4. minimal configuration surface
