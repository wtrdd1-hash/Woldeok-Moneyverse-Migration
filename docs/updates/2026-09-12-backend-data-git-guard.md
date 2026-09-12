# Backend Data Git Guard

Version: v2026.09.12.1

## Change

- Added `.gitignore` rules for backend runtime data, database dumps, backups, local database files, exports, and runtime logs.
- Extended `scripts/check-secrets.sh` so CI rejects tracked backend data or database backup artifacts even if `.gitignore` is bypassed with `git add -f`.
- SQL migrations and backup/restore source scripts remain trackable.

## Validation

- `sh -n scripts/check-secrets.sh`: PASS
- `scripts/check-secrets.sh`: PASS
- Ignore checks for `.dump`, backend CSV data, and backup files: PASS
- Migration SQL remains trackable: PASS
- `git diff --check`: PASS
