# Public Board Replies Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let web and Android users find discussions with replies among the latest 50 public posts without confusing a filtered-empty result with an empty archive.

**Architecture:** Extend existing public stock-post listing with exact optional `replied=1`. Filter via parameterized SQL over the existing bounded `member_board_public_list_with_stock(50)` SECURITY DEFINER function, preserving its source ordering. Validate the result at Android gateway before returning HTTP 200; do not touch ledger or grants.

**Tech Stack:** NestJS, Next.js, TypeScript, Vitest, PostgreSQL 17.

**Spec:** `docs/worklog/2026-11-02-board-replies-a.md` (bounded design and release constraints).

## Global Constraints
- Never grant direct table privileges, alter applied migrations or change WLD ledger.
- Preserve public page's canonical URL and default behavior; filtered URLs noindex.
- `replied=1` is the only accepted value, duplicate parameters are invalid.
- Filter applies after latest 50 public posts, not across all historical posts.
- Fail closed on missing/malformed commentCount in filtered Android results.

## Review Focus
- Query arrays and unknown parameters: HTTP 400, no DB access.
- Zero-reply post in stale Android HTTP 200: 503, not verified result.
- Verified empty filtered list: valid 200 and honest copy.
- Combined title/stock filter: all conditions apply to the same 50-row source.
- Malformed count or non-JSON: 503; never infer zero.

---

### Task 1: Backend + PostgreSQL source
- [x] Add failing controller and service tests for exact `replied=1`, invalid duplicates, and parameterized SQL.
- [x] Run RED tests; implement validation and SQL predicate `($4::boolean = false OR comment_count > 0)` on the bounded function output.
- [x] Run GREEN tests and verify no migrations/grants.

### Task 2: Web public board
- [x] Add failing query parser tests and page regression assertions.
- [x] Add labelled checkbox, preserve stock/title search, noindex filtered URLs and truthful 50-row empty state.
- [x] Run GREEN tests and accessibility checks.

### Task 3: Android gateway and contract
- [x] Add failing app-api tests for duplicate/invalid `replied`, non-JSON and unfiltered 200.
- [x] Add validation and fail-closed response verification; update API contract description if needed.
- [x] Run GREEN tests, full gates and read-only PostgreSQL; record exact SHA and HOLD.
