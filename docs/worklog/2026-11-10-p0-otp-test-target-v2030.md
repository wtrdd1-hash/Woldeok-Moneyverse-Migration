# v2026.11.10.2030 — P0 administrator OTP Test database target and release gate

## Before work — 2026-11-10 16:15 KST

**Owner approval:** user explicitly ordered to continue and approved advancement. Controlled MiniPC access through `@미니pc홍`; use exact-sha candidate, backup+restore validation, dedicated development branch, read-only baseline before any Test DB operation. Never infer Production approval if safety gates remain red.

**Git provenance:** isolated branch `fix/p0-otp-test-target-v2026.11.10.2030` forked from fully CI-green `fix/p0-casino-trigger-ledger-acl-v2026.11.10.2028` SHA `9abb606bad038c7c48ec9055b28a36de5bc259e8`; other Gemini worktrees and integration untouched. Remote `origin/main 3a7c34507a`, integration `a2db091644`, checked again immediately before this task. Main planning and security priority spec checked alongside `AGENTS.md`, `docs/RELEASING.md` and `docs/operations/production-deployment.md`.

**Problem reproduced:** public Test (not Production) NestJS connects as moneyverse_app to `wdmv_v761_test_acl_v1544_restore` via loopback :5585, app schema version ends `345-funded-treasury-mint.sql`; however effective `MIGRATOR_DATABASE_URL` targets a different old `woldeok_moneyverse_v506_test` schema 247 via :5580. Issue #2260 tracks mismatch. Candidate requires immutable 346 + forward-only 347 before functional Test rollout. CI and a privilege-preserving clone of real Test DB passed 346+347 with 0 PUBLIC SECURITY DEFINER and 0 unsafe casino tax triggers, no treasury changes.

**Plan:** (1) read-only compare all applied migration filenames/digests and source DB identity; (2) cryptographically attested Test DB backup and restore to separately named throwaway DB; (3) apply only missing, reviewed 346 and 347 to actual Test **only** if lineage, rollback and fiscal gates pass; (4) repair Test-only migrator target without changing Production, verify endpoint identity; (5) build/retest exact SHA, upgrade actual public Test with safe rollback; (6) real authenticator delivery and financial/ledger checks; (7) only then consider non-disruptive Production. Record intermediate/final state EN+KO; never label public deployment complete on mock-only or skipped QA.

**Release hold by default:** do not edit Production DB, Production release symlink, existing main/integration, historical journal, signed-in sessions, or secrets. Never bypass GitHub required checks or hide failure by resetting database.
