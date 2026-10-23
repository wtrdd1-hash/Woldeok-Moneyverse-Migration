# Public Status Freshness Fail-Closed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans; TDD RED-GREEN and verification evidence are mandatory.

## Scope and root cause
The public status page ignores `freshnessState` in overall status calculation and uses the original healthy badge variant for stale observations. Server freshness is authoritative. Do not fabricate outages from missing measurements, and do not alter the source/collector or database in this frontend fix.

## Task 1 — Failing regression
- [ ] Add unit tests for the server-owned freshness + reported state effective status (fresh, stale, unknown, mixed).
- [ ] Add page-level contract test for summary and badge using effective status and for removal of the unsupported fixed stale threshold.
- [ ] Run focused Vitest and capture RED.

## Task 2 — Minimal implementation
- [ ] Add a pure effective-status function to `frontend/src/lib/status.ts` using the freshness signal.
- [ ] Apply effective status to `frontend/src/app/status/page.tsx` summary and badge variant, preserving visible stale wording and noindex.
- [ ] Run focused tests GREEN and changed-file lint.

## Task 3 — Release gates and report
- [ ] Fetch main/planning mid-work; verify HEAD SHA, full lint/typecheck/build/tests/security/app-api, real PostgreSQL and browser E2E when possible.
- [ ] Record exact failed/skipped gates and open a Draft PR; do not merge or deploy if any required gate is missing.
