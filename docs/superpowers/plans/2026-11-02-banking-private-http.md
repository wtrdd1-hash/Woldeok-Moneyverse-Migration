# Banking App API Private Response Boundary — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans, test-driven-development and verification-before-completion in an isolated worktree.

## Scope and dependency

Android App API `/bank` and `/banking` responses already force `Cache-Control: private, no-store`, but do not force `X-Robots-Tag: noindex` or `Referrer-Policy: no-referrer` on stale upstream success/refusal/HEAD responses. Existing Backend bank/pocket guard-level protection is independently implemented in **Draft PR #2273** and must not be duplicated. No database, finance, or Backend changes are authorized here.

## Task 1 — RED

Write `frontend/src/app/app-api/v1/[...path]/banking-private.test.ts`, mock upstream `public, max-age=3600`, `index, follow`, `unsafe-url`, and assert fail-closed response headers for pocket GET 200, bank standing GET 401, pocket POST 403 and HEAD 200. Confirm failure before changing the route. Record output in task logs.

## Task 2 — GREEN

Update `frontend/src/app/app-api/v1/[...path]/route.ts` to force `noindex` and `no-referrer` for both `/bank` and `/banking` alongside the existing no-store rule. Preserve status, body, authentication forwarding, CSRF and financial authority. Confirm new and neighboring tests pass.

## Task 3 — Verification / HOLD

Run full lint/typecheck/build, frontend/backend and contract/database/security tests, real disposable PostgreSQL where available, mobile API contract, CI and exact-SHA Test checks. Document known unrelated failures. Draft/HOLD; no merge or production promotion without all gates PASS.
