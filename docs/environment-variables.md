# Environment Variables

This document explains the runtime environment variables supported by Movie Archive.

## Minimal setup

For local development and most self-hosted installs, you only need:

```env
SESSION_SECRET=replace-with-a-long-random-secret
TMDB_API_KEY=your-tmdb-key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
```

These values are enough to:

- start the app locally
- pass TMDb startup validation
- bootstrap the first admin account when no users exist yet

## Required variables

### `SESSION_SECRET`

Used to sign and protect the server-side session cookie.

- Required in all environments
- Must be long and random in production
- Startup rejects weak secrets in production

### `TMDB_API_KEY`

Used for TMDb search and movie metadata lookups.

- Required in all environments
- Validated against TMDb before the server starts
- If missing, invalid, or TMDb is unreachable, startup fails

### `ADMIN_EMAIL`

Bootstrap email for the first admin user.

- Required for the default setup path
- Used only when the app creates the initial admin account
- Safe to keep unchanged later if the account already exists, but production deployments should set a real address

### `ADMIN_PASSWORD`

Bootstrap password for the first admin user.

- Required for the default setup path
- Used only when the app creates the initial admin account
- Must be changed to a real secret in production

## Optional runtime overrides

### `PORT`

Overrides the backend port.

- Default: `3001`
- Usually not needed unless your local or server runtime requires a different port

### `LOG_LEVEL`

Controls backend log verbosity.

- Allowed values: `debug`, `info`, `warn`, `error`
- Default: `debug` in development, `info` in production

### `SQLITE_DB_PATH`

Overrides the SQLite database file path.

- Default: `./data/movie-archive.db`
- Useful when you want the database somewhere else on disk

### `BACKUP_DIR`

Overrides the backup output directory.

- Default: `./backups`
- Used by the backup script and backup sidecar

## Network and deployment overrides

### `TRUST_PROXY`

Enables Express proxy trust.

- Allowed values: `true`, `false`
- Default: `false`
- Only enable this when the app is running behind a reverse proxy

This matters for correct secure-cookie behavior and deployment semantics behind proxies.

### `APP_BASE_URL`

Frontend origin used in split local development.

- Default: `http://localhost:5173`
- Mostly useful when frontend and backend run on different origins during development
- Same-origin production deployments usually do not need to set this

### `VITE_API_BASE_URL`

Frontend-only override for the API base URL.

- Usually leave this unset
- Useful only for split-origin local development or unusual proxy setups
- Same-origin production deployments should not need it

## Defaults and behavior notes

- Session cookie security is automatic:
  - not `secure` in development and test
  - `secure` in production
- Session cookie name and lifetime use built-in defaults in code
- Backup scheduling is interval-based and does not require timezone configuration
- `.env.example` shows the supported default setup path and optional overrides

## Recommended production values

At minimum:

```env
SESSION_SECRET=<long-random-secret>
TMDB_API_KEY=<your-tmdb-key>
ADMIN_EMAIL=<your-admin-email>
ADMIN_PASSWORD=<your-admin-password>
```

Only add overrides like `TRUST_PROXY`, `PORT`, `SQLITE_DB_PATH`, or `BACKUP_DIR` when your deployment actually needs them.
