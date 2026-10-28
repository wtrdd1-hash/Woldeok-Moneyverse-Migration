# Member Work Task Maximum Duration Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development.

**Goal:** Let members filter authoritative available work tasks by server-provided minimum duration, on web and Android app-api.

**Architecture:** Existing `work_task_board(actor)` remains the sole owner-scoped PostgreSQL read; the Nest repository adds a parameterized SQL predicate after the SECURITY DEFINER function, preserving member identity and preview semantics. The controller rejects malformed durations before query. Next's server component reads an optional allowlisted URL selection and forwards the parameter to the internal API. Android consumes the same documented optional query parameter. No database schema, ledger, reward, grants or migration changes.

**Tech Stack:** NestJS, Next.js App Router, PostgreSQL 17, Vitest, mobile API contract.

**Spec:** Existing `docs/features/jobs-and-progression.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, user standing P1 feature directive.

## Global Constraints
- English source of truth; Korean documentation second language.
- No direct app-role table reads/writes, no finance mutation.
- Reject negative, fractional, repeated, overflow or malformed maxDurationSeconds; optional valid integer 1–86400.
- Web presets 1/2/3/5/10/15 minutes; unchanged default behavior.
- Full gates and official Test exact SHA before merge or release; hold on unresolved P0 finance, backup, disk or security blockers.

## Tasks
- [x] RED: backend parser, repository SQL predicate and frontend URL allowlist tests; record failure.
- [x] GREEN: parameterized PostgreSQL filter, guarded Nest query, Next GET form and API forwarding.
- [x] Update mobile API contract and EN/KO reference, verify app-api parity.
- [x] Real isolated PostgreSQL owner-scoped/ACL checks and frontend/backend regression tests.
- [ ] Build/lint/typecheck/security/CI, record SHA and release HOLD; no merge without exact Test.
