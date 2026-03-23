# Backup and Restore

## Summary

The application currently runs on `SQLite`, so backup quality matters more than infrastructure complexity. The goal is simple:

- take regular database backups
- keep them outside the live container path
- make restore steps predictable

## Backup Command

Create a fresh SQLite backup from the project root:

```bash
npm run backup:create
```

This writes a timestamped `.db` file into the local `backups/` directory.

Example output:

```text
backups/movie-archive-2026-03-23_21-15-04.db
```

## Automated Production Routine

Production backup is handled by the `movie-archive-backup` sidecar service in `docker-compose.yml`.

- It uses the same app image.
- It reads the live database from `/app/data`.
- It writes backups into `/app/backups`.
- It runs every `72` hours in `Europe/Istanbul`.
- It applies retention automatically.

Current retention policy:

- keep at most the latest `3` backup files
- remove older files from the end automatically

## Restore Procedure

Restore should be done with the app stopped.

1. Stop the running app container.
2. Take one more copy of the current database before replacing anything.
3. Replace the live SQLite database file with the chosen backup file.
4. Start the container again.
5. Verify `/api/health` and log in to confirm archive data is present.

## Useful Commands

Create a manual backup from the running container:

```bash
docker exec movie-archive node dist-server/src/scripts/backup-sqlite.js
```

Check backup service logs:

```bash
docker compose logs --tail=200 movie-archive-backup
```

## Notes

- The app uses SQLite `WAL` mode, so backups should be created through the application backup command instead of raw file copying while the app is live.
- If a backup needs to be tested, do it on a separate environment first.
