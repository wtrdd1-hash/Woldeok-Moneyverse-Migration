# P2P Recipient Search End-to-End Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Preserve both privacy-safe recipient discovery and race-safe UI selection in one reviewable P2P flow.

**Architecture:** Reuse the existing Nest wallet owner-scoped SQL query and Next BFF; integrate the privacy/LIKE escaping tests and the wallet component's abort/sequence guard from two existing unmerged A branches. Keep PostgreSQL immutable and app-api cookie/private-cache parity.

**Tech Stack:** NestJS, Next.js, TypeScript, Vitest, PostgreSQL.

**Spec:** Existing PR #1034 and #1040 implementation plans; `docs/planning/INTEGRATED_PLANNING_MASTER.md` and `PROJECT_PLAN.md`.

## Global Constraints
- No new migration, broad GRANT, ledger writes, false WLD precision, credential exposure or unauthorized production promotion.
- Keep English canonical project docs and Korean translation separate.

## Tasks
- [ ] Run privacy/race focused tests on clean main and record failures.
- [ ] Cherry-pick PR #1034 and PR #1040 code onto isolated current main; inspect conflicts.
- [ ] Run focused backend, frontend, Android app-api tests and `git diff --check`.
- [ ] Run full lint/typecheck/build/test/audit and PostgreSQL app-role negative verification.
- [ ] Re-check main, commit final evidence, push Draft PR only; do not merge on any failure.
