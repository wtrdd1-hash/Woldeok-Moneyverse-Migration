# Public Board Most-Discussed Ordering Implementation Plan

> For agentic workers: use superpowers:executing-plans and TDD.

Goal: Let members sort the latest 50 publicly visible discussion posts by verified comment count.

Architecture: Existing PostgreSQL SECURITY DEFINER list function is the sole source of recent 50 posts. Nest applies parameterized SQL ordering to that bounded set and echoes applied sort. Next renders labelled select, Android rejects unverified ordering or duplicate rows.

Tech Stack: PostgreSQL 17, NestJS, Next.js, Vitest.
Spec: docs/worklog/2026-11-02-hourly-a-board-most-discussed.md

Global constraints: no migration/grant/ledger mutation/new endpoint; default recent; no success-shaped unverifiable results; English code and Korean product copy; noindex filtered requests.

Review focus: empty results missing proof -> 503; equal counts deterministic tie-break; invalid/duplicate sort -> 400; existing filters preserved; Android strict row validation.

### Task 1 Backend
- [x] Write failing controller/service tests; RED; implement parameterized SQL and proof; GREEN.
### Task 2 Web
- [x] Write failing parser tests; RED; implement accessible SSR select/noindex; GREEN.
### Task 3 Android
- [x] Write failing gateway tests; RED; implement fail-closed proof, no-store/noindex; GREEN.
### Task 4 Integration
- [ ] Fetch main again; full tests/build/lint/typecheck/contract/security/DB; audit branches/PR/CI; official exact-SHA Test if eligible; log HOLD/PASS and rollback; push draft PR.
