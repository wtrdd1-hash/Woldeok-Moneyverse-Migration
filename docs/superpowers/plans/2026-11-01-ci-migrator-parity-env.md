# CI Migration Target Parity Environment Repair Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task with TDD.

**Goal:** Fix PR #2266 GitHub runtime-check failure without weakening its fail-closed migration target parity guard.

**Architecture:** Keep the existing pre-SQL `verifyDatabaseTargetParity` guard. Supply the existing ephemeral CI app and migrator URLs to the `Apply database migrations` workflow step, scoped to that step only. Do not change Production/Test env, DB, migration files, or B collaborator branch.

**Tech Stack:** GitHub Actions YAML, Node 24 `node:test`, PostgreSQL 17 CI service.

**Spec:** PR #2266 and issue #2260; `packages/database/ci-apply.mjs`.

## Global Constraints
- No Production/Test database mutation; no bypass of target/role checks.
- Test credentials are ephemeral CI-only values already present in the workflow's Test step.
- Changes on QA-owned branch based on PR #2266 head; Draft/HOLD until exact-SHA Test and CI gates.

## Review Focus
- App URL missing; migrator URL missing; wrong port; wrong database; same app/migrator role: each must fail closed.

### Task 1: Pin CI migration env wiring
1. Add failing `node:test` assertion in `packages/database/ci-apply.test.mjs` requiring both URLs in the migration step, aligned with existing Test step.
2. Run test, confirm RED for missing URLs.
3. Add both URLs to the migration step only; preserve `PG*` variables and parity guard.
4. Run test, confirm GREEN; run existing CI apply and target parity tests, lint, typecheck and diff check.
5. Record evidence and open Draft PR against the B candidate branch; do not merge or deploy.
