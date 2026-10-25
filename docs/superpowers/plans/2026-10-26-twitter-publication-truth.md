# X Publisher Receipt and CSRF Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent unverified X publication success and cross-site admin test-tweet requests.

**Architecture:** Require the existing CSRF guard on the privileged POST. Accept X publication only after an HTTP success and a nonempty valid `data.id` receipt; do not treat arbitrary successful HTTP responses as posted tweets. Also enforce same-origin browser requests and elevated operator authority at the Next.js BFF before the backend CSRF token is minted. No schema or ledger changes.

**Tech Stack:** NestJS, TypeScript, Vitest.

## Task 1 — RED
- [x] Add a guard metadata test for `sendTestTweet` in `backend/src/seo/seo-controller-guards.test.ts`.
- [x] Add HTTP response-shape tests in `backend/src/seo/twitter-publisher.service.test.ts` for no `data.id`, malformed JSON, and valid receipt; run focused tests and observe failures.

## Task 2 — GREEN
- [x] Add `CsrfGuard` to the controller's `@UseGuards` chain.
- [x] Validate publication receipt and return `success:false` without claiming publication if missing; avoid sensitive response leakage.
- [x] Run focused tests, backend tests, lint, typecheck, builds, security checks (block on failed gates).

## Task 3 — Next.js BFF RED/GREEN
- [x] Reproduce cross-site/missing-Origin and locked-console BFF calls, plus false success without post ID (RED 3/4).
- [x] Reuse `verifySeoWriteOrigin` and `verifySeoOperator` and require verified `tweetId` before success (GREEN 4/4).
- [x] Run complete frontend tests, typecheck, and builds; compare existing failures (6 frontend test failures, default build failure, Webpack OOM).

## Task 4 — review and hold
- [x] Compare latest main, QA and concurrent PRs, run required gates, commit code and log on branch, push Draft PR (release HOLD).
- [x] Never merge or deploy unless every mandated exact-SHA gate passes (not passed; no merge/deploy).
