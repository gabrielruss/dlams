#!/usr/bin/env bash
# Back up the production PostgreSQL database.
#
# Runs pg_dump inside the db container (so the client version always matches
# the server), writes a compressed custom-format dump, checks that it is
# readable, prunes old dumps, and optionally copies the new dump off the host.
#
# Settings (environment variables, all optional):
#   DLAMS_DB_CONTAINER   db container name            (default: dlams-db)
#   DLAMS_BACKUP_DIR     where dumps are kept         (default: ~/dlams-backups)
#   DLAMS_BACKUP_KEEP_DAYS  delete dumps older than   (default: 14)
#   DLAMS_BACKUP_REMOTE  rsync destination for an off-device copy, such as
#                        user@host:/path/ (default: unset, no copy)
#
# Dumps contain password hashes and personal data. Keep them private; never
# commit them or the destination of the off-device copy.

set -euo pipefail
umask 077

container="${DLAMS_DB_CONTAINER:-dlams-db}"
backup_dir="${DLAMS_BACKUP_DIR:-$HOME/dlams-backups}"
keep_days="${DLAMS_BACKUP_KEEP_DAYS:-14}"
remote="${DLAMS_BACKUP_REMOTE:-}"

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
final="$backup_dir/dlams-$timestamp.dump"
partial="$final.partial"

mkdir -p "$backup_dir"
trap 'rm -f "$partial"' EXIT

# The container's own environment supplies the user and database name, so no
# credentials appear here. The local socket inside the container needs no
# password.
docker exec "$container" sh -c \
  'pg_dump --format=custom --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  > "$partial"

if [ ! -s "$partial" ]; then
  echo "backup failed: dump is empty" >&2
  exit 1
fi

# An unreadable archive is not a backup. List its contents as a sanity check.
if ! docker exec -i "$container" pg_restore --list < "$partial" > /dev/null; then
  echo "backup failed: dump is not a readable archive" >&2
  exit 1
fi

mv "$partial" "$final"
echo "$(date -u +%FT%TZ) wrote $final ($(wc -c < "$final") bytes)"

find "$backup_dir" -maxdepth 1 -name 'dlams-*.dump' -mtime "+$keep_days" -print -delete \
  | sed 's/^/pruned /'

if [ -n "$remote" ]; then
  rsync -a "$final" "$remote"
  echo "$(date -u +%FT%TZ) copied to off-device destination"
fi
