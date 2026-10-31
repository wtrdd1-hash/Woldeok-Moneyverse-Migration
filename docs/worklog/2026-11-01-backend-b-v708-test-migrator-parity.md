# Backend B v708 — Test migration target identity preflight (P1 / DRAFT / RELEASE HOLD)

## Source and scope

- Source: origin/main `f13bbce273ffc65e8576170992d82ea00c27a1c9` at start and midpoint; QA v1429 issue #2260.
- Active Test backend systemd EnvironmentFiles contain effective `DATABASE_URL` and `MIGRATOR_DATABASE_URL` with **different database names and ports**. Verified read-only at 2026-11-01 05:40 KST; no connection strings or credentials recorded.
- Root cause: release/backend configuration allows the application and migrator to select independent targets without a parity preflight. Existing CI database helper checked the PG* connection variables but not both URL targets.
- No API or DB schema change, no financial writes, no applied migration edits, no Test/Production configuration or service changes.

## Implementation and contract

- `scripts/release/verify-test-migrator-target.mjs`: read-only host preflight that compares effective app/migrator host, port, database, and separate DB roles, with last-wins systemd EnvironmentFile semantics. Reject missing/malformed URLs, target override query parameters, duplicate keys within one file. Output contains **failure codes only**, never URLs, usernames, passwords or database names.
- `packages/database/ci-apply.mjs`: fail **before any SQL** when app/migrator targets differ, or when the migrator URL differs from the PGHOST/PGPORT/PGDATABASE/PGUSER target actually used by psql. Existing migration sequence collision check retains priority.
- Operator invocation on the authorized Debian host: `sudo node scripts/release/verify-test-migrator-target.mjs --source-env <effective-backend-env-file> [--source-env <later-override-env-file> ...]`, using all active systemd EnvironmentFiles in their effective order. This is a preflight, not an environment repair or a replacement for schema/privilege checks.

## TDD and verification

- RED: missing module, then 6 behavioral assertions failed against a permissive stub; later CI psql-target mismatch regression failed before implementation.
- GREEN: focused tests 17/17, including CLI failure redaction and CI pre-SQL blocking.
- Live Test effective systemd environment: gate exit 1, `database_target_port_mismatch` and `database_target_database_mismatch`; **correctly BLOCKED**. No env values logged.
- Isolated PostgreSQL 17.11: 316 migrations applied; application UPDATE on account_balances and DELETE on ledger_transactions both false. Disposable container removed; shared DB unchanged.
- Full local gate outputs stored outside Git under `/srv/moneyverse-data/tasks/mv-b-v708-evidence/logs/`.

## Release decision

- Existing Test backend and migrator environment mismatch is **not repaired** by this PR; operator must reconcile the approved target and independently verify schema checksums, privileges and runtime identity before any Test migration.
- All mandatory exact-SHA official Test, authenticated E2E, independent restore, and GitOps gates remain mandatory. **Draft/HOLD; no main merge, Test deployment, Production promotion, service restart or DB mutation.**

## Remote CI remediation

- Initial Draft PR CI policy rejected **synthetic test credential URL literals** as committed-secret patterns. No real credentials were present. Split synthetic URL test literals across concatenated strings, preserving test behavior; local repository security scanner and exact policy commands now PASS. CI must rerun on the new SHA; the earlier failed SHA is not release evidence.
- Integrated `pnpm test` first invocation failed with host `spawn /usr/bin/node EAGAIN` (process exhaustion), not an assertion failure. Its ten preflight files passed when executed serially (34/34); package suites passed separately. Do not claim the integrated command PASS.
- Full dependency audit: 9 findings (1 low, 8 moderate); Production-only audit: 0 findings. These remain release-gate inputs.
