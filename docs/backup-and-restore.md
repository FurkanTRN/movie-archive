# Backup and Restore

Movie Archive uses `SQLite`, so backup and restore should stay simple and predictable.

## Manual backup

Create a fresh backup from the project root:

```bash
npm run backup:create
```

This writes a timestamped `.db` file into `./backups`.

## Automated backup routine

The `movie-archive-backup` sidecar in [docker-compose.yml](../docker-compose.yml) handles automated backups.

- Reads the live database from `/app/data`
- Writes backups into `/app/backups`
- Runs every `72` hours
- Keeps the latest `3` backup files

## Restore flow

1. Stop the compose stack.
2. Copy the current database somewhere safe before replacing it.
3. Replace `./data/movie-archive.db` with the selected backup file.
4. Start the stack again with `docker compose up --build -d`.
5. Verify `/api/health` and log in to confirm the archive is intact.

## Useful commands

Create a backup from the running app container:

```bash
docker exec movie-archive node dist-server/src/scripts/backup-sqlite.js
```

Check backup service logs:

```bash
docker compose logs --tail=200 movie-archive-backup
```

## Notes

- The app uses SQLite `WAL` mode, so backups should be created through the application backup command instead of raw file copying while the app is live.
- Test restores on a separate environment before relying on them.
