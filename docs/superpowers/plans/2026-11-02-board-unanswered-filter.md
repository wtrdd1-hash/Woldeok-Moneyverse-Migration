# Recent Unanswered Public Board Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let public visitors discover zero-reply discussions among the latest 50 public board posts across web and Android.

**Architecture:** Reuse the existing immutable SECURITY DEFINER read function and its bounded result, filter by exact `comment_count=0` in parameterized SQL. Nest validates query and web uses a labelled GET checkbox. Android gateway validates parameters and checks each response row before returning HTTP 200.

**Tech Stack:** NestJS, Next.js, TypeScript, Vitest, PostgreSQL 17.

## Task 1 — Backend
- [ ] Add RED tests in `backend/src/board/stock-community.service.test.ts` and `.http.test.ts` for `unanswered=1`, invalid and duplicate values, bounded SQL.
- [ ] Run targeted tests, record RED.
- [ ] Add SQL filter and HTTP parameter validation, rerun GREEN.

## Task 2 — Web
- [ ] Add RED tests in `frontend/src/app/board/board-unanswered-filter.test.ts` for parser, accessible form, query and noindex.
- [ ] Run RED; add parser and page UI; run GREEN.

## Task 3 — Android API
- [ ] Add RED tests in `frontend/src/app/app-api/v1/[...path]/board-unanswered-app-api.test.ts` for invalid/duplicate, forged 200, valid 200, no-store/noindex.
- [ ] Run RED; implement request and response fail-closed validation; run GREEN.

## Task 4 — Evidence
- [ ] Update mobile API contract, English/Korean QA, release HOLD and worklogs.
- [ ] Re-fetch main, test build/lint/typecheck/whole suites, disposable/read-only PostgreSQL, security/SEO/a11y/contract, CI exact SHA.
- [ ] Merge only on all PASS + exact Test SHA authenticated E2E + rollback proof; otherwise Draft/HOLD and preserve all unique branches.
