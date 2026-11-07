# Member Shop Catalogue Source Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Never present a malformed catalogue or holdings response as verified purchasable inventory, and keep malformed search parameters from crashing member pages.

**Architecture:** Pure TypeScript parsers validate the exact NestJS shop read-model response at the Next.js boundary, retaining bigint WLD as strings. Server page maps null or invalid responses to accessible unavailable states, while existing authenticated NestJS SQL-backed purchase/settlement routes remain authoritative.

**Tech Stack:** Next.js, TypeScript, Vitest, NestJS, PostgreSQL 17.

**Spec:** `docs/worklog/2026-11-02-shop-catalog-source-proof-v1289.md`.

## Global Constraints

- Separate worktree from fresh main; never edit shared checkout or others' PRs.
- No financial mutation, DB grants or schema changes.
- RED-GREEN-REFACTOR and exact-SHA gates; preserve invalid/empty distinction.
- English canonical record and Korean supporting record.

## Tasks

- [ ] Write `frontend/src/app/shop/catalog/catalog-source.test.ts` for malformed arrays, duplicate IDs, unsafe WLD, bad quantities, valid owner/catalog data, and `q[]` query. Run RED.
- [ ] Implement `frontend/src/app/shop/catalog/catalog-source.ts` pure validators; run GREEN.
- [ ] Wire page to validation with accessible source-unavailable state and bounded search; add regression tests.
- [ ] Execute focused/full gates, isolated PostgreSQL, app-api, HTTP/E2E and security; record exact exit statuses.
- [ ] Fetch main and planning before PR and potential merge, retain Draft/HOLD unless all gates PASS; update bilingual worklog.
