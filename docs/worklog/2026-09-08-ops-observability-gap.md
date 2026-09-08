# 2026-09-08 operations / observability remediation

## Context

The public navigation intentionally hides member/operator-only features when the
viewer is not authorized. That behavior is not a product gap and is left
unchanged.

The current repository audit instead identified operational gaps that can be
fixed without weakening authorization or changing economy rules.

## Changes in this branch

- Restored the documented Test -> Production deployment boundary.
  - arbitrary branches may deploy to `test` only;
  - `production` refuses every ref except `main`;
  - test and production keep separate stack names, directories, databases,
    ports, image tags, public origins, search indexing and GitHub environments;
  - every deployment runs CI first and a public `/` + `/status` smoke check
    after rollout.
- Added `deploy/backup-watchdog.sh`.
  - runs the existing cryptographic/dump verification rather than duplicating
    backup validation;
  - treats a backup older than one hour as failure;
  - can post to `BACKUP_ALERT_WEBHOOK_URL` without storing the URL in git;
  - alerts once when failure begins and once when verification recovers, rather
    than spamming every ten minutes.
- Extended `install-backup-cron.sh` so verification runs three minutes after
  each stack's staggered backup window.
- Kept authorization-driven menu visibility unchanged.
- Kept PostgreSQL economy functions, migrations and production data unchanged.

## Required test-server verification before main

1. Branch CI must pass: secret guard, lint, typecheck, build, migrations and all
   database/application tests.
2. Dispatch `deploy.yml` from this branch with `environment=test`.
3. Confirm the test stack reports healthy containers and the public `/` and
   `/status` smoke checks pass.
4. Confirm a non-authorized session still does not receive restricted menu
   entries; confirm an authorized test identity still receives its permitted
   entries.
5. Run the backup watchdog against the test stack with no webhook and confirm a
   healthy backup exits 0. Then point it at an intentionally stale isolated
   test backup directory and confirm it exits non-zero without touching data.
6. Only after those checks, update from current `main`, resolve any concurrent
   changes, rerun CI/test deployment, and make the PR eligible for merge.

## Production gate

Production is deliberately not deployed from this branch. After merge, deploy
the exact tested `main` commit only after the normal verified production backup
check. The production deployment remains protected by the `production` GitHub
environment.
