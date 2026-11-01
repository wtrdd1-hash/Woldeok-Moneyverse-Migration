# Pension Source Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development. Verify each stage before reporting success.

**Goal:** Prevent malformed or unavailable pension data from appearing as genuine member balances or empty receipt histories.

**Architecture:** Parse existing NestJS owner-scoped pension account/receipt responses and public aggregate at the Next server boundary. Keep explicit unavailable states and a retry link in the responsive client; no new endpoints, DB migration or settlement mutations.

**Tech Stack:** Next.js, TypeScript, Vitest, existing NestJS/PostgreSQL read functions.

**Spec:** `docs/worklog/2026-11-01-c-v1259-pension-source.md`.

## Tasks
- [ ] 1. Write parser tests for canonical WLD/count/date/UUID, duplicate receipts and malformed payloads; run RED.
- [ ] 2. Implement fail-closed parser and run GREEN.
- [ ] 3. Write/render tests for unavailable receipt history distinct from verified empty; run RED then implement and run GREEN.
- [ ] 4. Wire server-only API reads, preserve 401 vs 503, retry and private robots metadata.
- [ ] 5. Run exact-SHA checks, isolated PostgreSQL, HTTP/E2E where possible, required CI, re-fetch main, document all BLOCKED/FAIL.
