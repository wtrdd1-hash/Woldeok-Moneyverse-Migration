# Public Gallery Alt-Text Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use RED-GREEN-REFACTOR with isolated worktree and recorded evidence.

**Goal:** Search the newest 24 operator-approved public gallery photos by caption on web and Android without exposing drafts or claiming full-history search.

**Architecture:** Reuse existing PostgreSQL `content_list_published_photos(24)` SECURITY DEFINER read, then filter its already approved and bounded response in Nest. Both `/api/v1/photos` and `/api/v1/content/photos` share the same query parser and service. The public web page and Android gateway verify the filtered response; invalid and unverified results fail closed. No migrations, privileges, ledger writes, or schema changes.

**Tech Stack:** NestJS, PostgreSQL, Next.js, TypeScript, Vitest.

- [ ] Write failing backend tests for Unicode caption filtering, 24-row scope, invalid/duplicate query, app parity; run RED.
- [ ] Implement minimal shared Nest validation, service filtering and both controllers; run GREEN.
- [ ] Write failing frontend validation and Android gateway tests for filtered result proof, duplicate/invalid query and cache headers; run RED.
- [ ] Implement frontend page search and Android proof with no-store/noindex; run GREEN.
- [ ] Check latest main, policy, planning documents, PRs and collision; run lint/typecheck/unit/build/real PostgreSQL/security/app-api tests, record exact SHA and CI.
- [ ] Leave Draft/HOLD if exact-SHA Test E2E, independent restore, DB ACL or release gates unavailable; never deploy without proof.

**Scope ruling:** Filtering happens *after* the existing DB function's newest 24 rows, never presented as a full archive search. This avoids a conflicting forward migration and preserves publication visibility rules; full-history search requires separate SQL design.
