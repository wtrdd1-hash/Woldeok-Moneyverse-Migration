# Database Migrations

Database migrations are ordered SQL files under `packages/database/migrations/`.

## Rules

1. Never edit a migration that has already been applied to Test or Production.
2. Add a new ordered migration for new behavior.
3. Keep the migration idempotent only where the operation semantics genuinely allow it; do not hide drift.
4. Revoke/grant function privileges explicitly when a new security-definer function is introduced.
5. Validate fresh-install behavior as well as upgrade behavior.

## Checksum enforcement

The deployment runner records the migration filename and a SHA-256 checksum. A historical checksum mismatch stops deployment.

That failure is a safety feature. It says the schema history can no longer be reconstructed deterministically.

## Fresh database testing

A high-value migration test is:

```text
empty PostgreSQL 17.11
  ↓
run every migration in order
  ↓
run backend DB tests
  ↓
verify grants/invariants/policy values
```

This catches drift that an already-upgraded Production database can hide.

## Security-definer checklist

For a new mutation/read-model function:

- set a safe `search_path` where appropriate;
- validate actor/roles inside the function;
- revoke default PUBLIC execution;
- grant only the intended runtime role;
- return canonical money types as text/strings;
- test both authorized and unauthorized callers.
