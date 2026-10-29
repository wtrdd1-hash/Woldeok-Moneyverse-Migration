# Backend B v613 — P0 legacy backup safety guard (source candidate, HOLD)

## Incident and scope
- QA v1346 / #1718 confirmed a direct invocation of `AdminBackupController.triggerBackup()` launched the legacy backup script, created a plaintext compressed dump, and rotated away an older local snapshot. Restore/off-host recovery remain unproven. Do not re-run this script as a reproduction.
- C Draft PR #1717 independently disables the API trigger and handles admin UI evidence. This change does not modify its files.
- The authoritative encrypted systemd backup service and its timer are unchanged. This code does **not** restore any missing snapshot, prove recoverability, or modify deployed release scripts.

## Implementation
- `scripts/backup/backup-r2-free.sh` is now a fail-closed, side-effect-free retired entry point: explicit error and exit status 78. It no longer creates dumps, uploads plaintext, or performs retention deletion.
- `scripts/backup/legacy-backup-disabled.test.mjs` statically rejects backup/rotation commands **before** executing the script, avoiding the dangerous RED-test failure mode. It then verifies nonzero exit and zero filesystem writes with and without R2 configuration.
- Root `pnpm test` includes this guard, so it runs in the mandatory policy stage.

## Verification (local isolated branch)
- TDD RED: 1 failure from static source assertion, **no execution of the old script**.
- GREEN: 7/7 backup tests; policy stage 24/24 PASS; `bash -n` PASS.
- Lint: 0 errors, 1,099 pre-existing warnings; typecheck PASS; Backend tests 1,939 PASS / 440 SKIPPED; DB package tests 46 PASS / 4 SKIPPED; Backend build PASS.
- `pnpm audit --prod --audit-level=moderate`: FAIL, 1 moderate `qs` advisory GHSA-6pq8-jhm2-2vcw, outside this scoped change.
- Disk 97% used (~5.9 GiB free) on shared data filesystem; avoid heavy Next.js build/large fixture creation. No real DB mutation or Production backup execution.

## Release gate
- This source-only PR is Draft + HOLD. Full frontend build/test, real PostgreSQL E2E, exact-SHA official Test, independent restore and all release gates have **not** passed. Do not merge or deploy.
- Start/mid main: `35971c600f25869c96f1c666d4b9f58927202730`.
