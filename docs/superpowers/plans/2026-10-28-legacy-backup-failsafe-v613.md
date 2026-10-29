# Legacy backup fail-closed implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Follow RED/GREEN/verification before claiming success.

**Goal:** Prevent legacy plaintext backup execution and destructive retention from accidental admin/test invocation.

**Architecture:** Retire the obsolete legacy shell entry point with a fail-closed, non-mutating exit. Keep the separately configured authoritative encrypted systemd backup untouched. Add a regression guard to the root test suite that statically proves absence of dangerous commands before executing the retired entry point.

**Tech Stack:** Bash, Node.js built-in test runner, pnpm.

**Spec:** docs/operations/backup-and-recovery.md; QA P0 #1718.

## Global constraints
- Do not invoke the live legacy script in RED tests.
- Never delete or rotate existing backup artifacts.
- Do not change systemd timers, Production, DB, or any other automation.
- C PR #1717 owns the admin backup trigger and dashboard; do not edit those paths.

## Review focus
- Accidental execution with default environment must never touch PostgreSQL or disk.
- Explicit R2 variables must not cause plaintext upload.
- A custom BACKUP_DIR must not be created or rotated.
- Tests must not execute the old dangerous script before the static guard passes.
- Authoritative systemd encrypted backup remains unchanged.

### Task 1: Guard the legacy backup entry point
- [x] Write `scripts/backup/legacy-backup-disabled.test.mjs` static-first test.
- [x] Run test and capture RED without executing the old script.
- [x] Replace `scripts/backup/backup-r2-free.sh` with a clear non-mutating error exit.
- [x] Run GREEN and inspect side effects.

### Task 2: Integrate and verify
- [x] Add the regression test to root `pnpm test` policy stage.
- [x] Run focused tests, lint, typecheck, backend tests, build and security audit; CI and official Test pending.
- [x] Record exact-SHA gates and release holds; PR Draft + hold only.
