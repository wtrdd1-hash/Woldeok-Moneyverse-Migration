# P1 Admin Money-Flow Posting Cursor Integrity — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent silent loss of money-flow ledger postings when several postings share a transaction timestamp.

**Architecture:** Keep the existing admin-only GET route and response fields. Introduce versioned, filter-bound, opaque posting-level keyset cursors ordered by `(t.created_at, t.id, post.id)` descending. Preserve PostgreSQL microseconds in cursor metadata, not JS Date. No schema or financial write.

**Tech Stack:** NestJS, PostgreSQL 17, Vitest, pnpm, Node Buffer/crypto.

**Spec:** Source query `backend/src/admin/treasury/treasury.repository.ts:getUserMoneyFlows`; immutable ledger principles in `AGENTS.md`; canonical English `docs/planning/PROJECT_PLAN.md` and Korean counterpart.

## Constraints
- Never mutate Production or shared development PostgreSQL; only synthetic isolated fixture.
- No edits to applied migrations, ledger balances, authentication or other workers' worktrees.
- Preserve API route and item fields; new `next_cursor` format `mf1.<base64url>` is opaque and legacy timestamp cursors are rejected with 400 rather than silently skipping postings.
- Keep query parameters bound, enforce cursor/filter equality, preserve exact numeric strings.

## Steps and evidence
- [x] Inspect main, planning, open PRs, QA and CI; identify timestamp-only cursor omission and cross-worker overlap.
- [x] Write failing Vitest regression tests (4 RED on unmodified main).
- [x] Add cursor codec and deterministic PostgreSQL row comparison; focused tests 4 GREEN.
- [x] Build synthetic PostgreSQL fixture with same-timestamp multi-posting and microsecond boundary; isolated PostgreSQL tests 2 PASS; reader DML denied.
- [x] Run local project typecheck/lint/tests/build, security audits, bot and API contract; full security audits FAIL; final-SHA CI pending.
- [x] Re-fetch latest main and planning mid-run (unchanged); record release blockers; draft PR only, no merge/Production.
