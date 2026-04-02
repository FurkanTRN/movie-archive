# Contributing

Thanks for contributing to Movie Archive.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Fill in the required values, especially `SESSION_SECRET` and `TMDB_API_KEY`.
4. Start development with `npm run dev:full`.

## Quality checks

Run these before opening a pull request:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Pull requests

- Keep changes focused and easy to review.
- Update docs when behavior, setup, or operations change.
- Do not commit `.env`, runtime SQLite files, backups, or build output.
