# Member Bank Snapshot CSV Proof Repair — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use TDD and verification evidence.

**Goal:** Make authenticated owner bank CSV downloads usable, spreadsheet-compatible, and fail closed on forged upstream snapshots on web and Android app-api.

**Architecture:** Reuse the existing Nest bank standing snapshot, actor-scoped PostgreSQL `bank_get_my_standing`, and session/consent guards. Validate exact canonical WLD strings, UTC timestamp, and readOnly metadata in one pure shared frontend parser; export UTF-8 BOM + real CRLF CSV and reject malformed upstream JSON on the Android gateway. No new DB privileges, writes, migrations, or finance calculations.

**Tech Stack:** TypeScript, Vitest, Next.js, NestJS, PostgreSQL 17.

**Spec:** Existing bank statement route and bank snapshot contract; English canonical docs/planning/PROJECT_PLAN.md and Korean parity docs/planning/PROJECT_PLAN.ko.md reviewed; no change to living plans.

## Global Constraints
- Owner-only authenticated session, consent and least privilege; never return unverified HTTP 200 or fabricated WLD balances.
- Private no-store, noindex and no-referrer on success/error; Android gateway must not inherit public cache headers.
- No applied SQL edits, no direct table grants, no production DB changes; read-only isolated DB verification where possible.
- Do not merge or deploy without full gates, exact-SHA official Test and GitOps approval.

## Review Focus
- Valid UTC observedAt must be accepted; reject malformed calendar dates without changing the correct timestamp regex.
- UTF-8 BOM and actual CRLF lines, not printable escape sequences; huge WLD strings stay exact.
- Formula-injection and malformed amount/date/status must fail closed.
- Android upstream 200 with malformed snapshot or non-JSON must become private 503.
- Unauthenticated or failed backend must never export CSV; owner-only SQL function and negative grants remain unchanged.

### Task 1: Red/green CSV parser and encoding
- [x] Add failing tests for canonical UTC, BOM, CRLF, spreadsheet cell safety and invalid fields.
- [x] Run focused tests and capture RED failure.
- [x] Implement strict shared snapshot validator and CSV writer.
- [x] Re-run focused tests and capture GREEN.

### Task 2: Android API verification
- [x] Add failing gateway tests for valid/malformed/non-JSON snapshot and private response headers.
- [x] Run RED, implement fail-closed gateway check and header hardening, run GREEN.

### Task 3: End-to-end and release evidence
- [x] Re-run Nest bank snapshot, frontend CSV and Android tests, contract, typecheck, build, lint, DB ACL checks.
- [x] Compare current origin/main, branch/PR/CI and previous QA; log blockers.
- [x] Commit only to isolated auto/hourly-* branch, open Draft PR, no merge/deploy without all gates.
