# X Publisher Receipt and CSRF Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent unverified X publication success and cross-site admin test-tweet requests.

**Architecture:** Require the existing CSRF guard on the privileged POST. Accept X publication only after an HTTP success and a nonempty valid `data.id` receipt; do not treat arbitrary successful HTTP responses as posted tweets. No schema or ledger changes.

**Tech Stack:** NestJS, TypeScript, Vitest.

## Task 1 — RED
- [ ] Add a guard metadata test for `sendTestTweet` in `backend/src/seo/seo-controller-guards.test.ts`.
- [ ] Add HTTP response-shape tests in `backend/src/seo/twitter-publisher.service.test.ts` for no `data.id`, malformed JSON, and valid receipt; run focused tests and observe failures.

## Task 2 — GREEN
- [ ] Add `CsrfGuard` to the controller's `@UseGuards` chain.
- [ ] Validate publication receipt and return `success:false` without claiming publication if missing; avoid sensitive response leakage.
- [ ] Run focused tests, backend tests, lint, typecheck, builds, security checks.

## Task 3 — review and hold
- [ ] Compare latest main, QA and concurrent PRs, run required gates, commit code and log on branch, push Draft PR.
- [ ] Never merge or deploy unless every mandated exact-SHA gate passes.
