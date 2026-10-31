# QA v1430 — CI migration parity wiring repair

**Baseline:** PR #2266 head `fccc59a350874f9916183362d8c1253fec56f967` (Draft/HOLD). **Scope:** CI-only migration-step environment and regression assertion. **Owner:** QA isolated worktree.

## Reproduced failure and root cause

GitHub `runtime-check` job `124654508405` and `verify / runtime-check` job `124654533479` fail before migration SQL with `CI database target parity BLOCKED: app_database_url_missing_or_invalid,migrator_database_url_missing_or_invalid`. The new fail-closed `ci-apply.mjs` checks both URL variables, but the `Apply database migrations` step in `.github/workflows/ci.yml` only sets `PG*` values. Both matching URLs already exist in the subsequent `Test` step, not in the migration step.

## Minimal correction

Supply both matching ephemeral CI database URLs to the migration step, scoped to that step, while preserving the existing role/host/port/database parity guard and migration collision checks. Do not modify the Test or Production runtime environment, PostgreSQL permissions, or migrations.

## TDD and evidence

- RED on unmodified PR #2266: `node --test packages/database/ci-apply.test.mjs` — 7 PASS / 1 FAIL, expected `migration step missing DATABASE_URL`.
- GREEN after adding URLs: same command — 8 PASS / 0 FAIL.
- Combined target-parity tests: `node --test packages/database/ci-apply.test.mjs scripts/release/verify-test-migrator-target.test.mjs` — 18 PASS / 0 FAIL.
- Additional isolated PostgreSQL replay and full gates recorded in `/srv/moneyverse-data/qa-reports/qa1430-evidence/` as available.

## Release policy

This is a follow-up to Draft PR #2266 and is not an independent Production candidate. Exact-SHA official Test, authenticated E2E, finance/backup/GitOps gates remain mandatory. **DRAFT/HOLD; no merge, shared database change, or Production deployment.**
- Fresh candidate lint exit 0 (0 errors; existing warnings). Typecheck and remote CI reported separately.
- Isolated PostgreSQL 17.11 CI apply path (wrapper only to provide psql binary in disposable container): 316/316 migrations applied; app direct `account_balances.UPDATE` denied; `ledger_transactions.DELETE` denied; container removed. No shared database writes.
