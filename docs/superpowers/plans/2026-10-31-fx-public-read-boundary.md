# FX Public Read Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

## Scope and acceptance
QA v1420 reproduced a Test HTTP 500 because the application role cannot SELECT the raw FX source tables. This task fixes only the public aggregate read boundary, not market provenance or financial settlement. Publication remains on HOLD until the separate unverified-source guard (#2114), exact-SHA Test, and release gates pass. No direct raw-table grants, member balances, trades, or applied-migration edits.

## Tasks
- [x] Inspect canonical main, both plans, QA v1420, open FX PRs (#2114/#2193), and role boundary.
- [x] Create independent worktree and before-work log.
- [x] Add failing repository and migration-policy tests; confirm RED.
- [x] Add forward-only migration 314 with four `SECURITY DEFINER` read-only DTO projections, fixed search path, bounded history, owner, revokes, and app EXECUTE only.
- [x] Replace four raw-table FX reads and spot read with the scoped projections; preserve 503 on absent/invalid source.
- [x] Confirm focused GREEN and fresh isolated PostgreSQL migration + app-role ACL denials.
- [x] Add app-role integration regression test.
- [x] Verify lint/typecheck/build, API contract, backend/frontend/database, security, and dependency audit (full audit FAIL: 13 known advisories; root aggregate `pnpm test` PASS).
- [x] Preserve Draft/HOLD PR candidate with source-provenance and Test exact-SHA blockers; preserve all other work (PR creation follows code commit).

## Integration constraints
Merge after resolving overlap with Draft #2193 and #2114; run a fresh complete suite and exact-SHA official Test proof. Never use Production to test this migration. Public FX figures remain unverified/seeded and must not be presented as live market facts.
