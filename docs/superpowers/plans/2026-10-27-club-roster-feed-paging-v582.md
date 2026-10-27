# Club Roster and Feed Paging Integrity — Bounded Implementation Plan

> For agentic workers: use test-driven-development and verification-before-completion; independent worktree already created.

**Goal:** Reject malformed club roster/feed paging inputs rather than silently reinterpret or clamp them.

**Architecture:** Preserve existing Nest routes, authentication and repository SQL. Validate query strings before calling the service; reject invalid direct repository arguments before database access. Use a bounded canonical decimal parser with HTTP 400 and ClubInputError respectively.

**Tech Stack:** NestJS, TypeScript, Vitest, PostgreSQL.

**Spec:** `docs/worklog/2026-10-27-hourly-b-v582-club-paging.md`.

## Global constraints
- No schema migrations, grants, money changes or Production/Test writes.
- Roster limit 1–100, offset 0–10000, feed limit 1–100; existing defaults remain 50 and 0.
- Reject arrays, objects, decimals, signs, exponents, suffixes, unsafe integers, leading zeros, and out-of-range inputs before database access.
- Existing valid routes and JSON shapes unchanged; all code and tests in English.

## Review focus
- Missing query values retain defaults; explicit empty query values reject.
- Duplicate query keys (arrays) must reject.
- Very large numeric strings must reject without precision loss.
- Direct repository calls with NaN/Infinity/fractions must reject.
- Existing member page requesting `limit=100` remains valid.

## Tasks
- [ ] Add controller and repository failing tests; execute RED.
- [ ] Implement strict input validation; execute GREEN.
- [ ] Execute full gates and record exact results, CI and Test limitations.
- [ ] Re-fetch latest main/plans; commit, push and open Draft/HOLD PR without merging.
