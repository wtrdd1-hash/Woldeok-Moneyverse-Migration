# Support Admin Write Step-Up — Implementation Plan

> **For agentic workers:** Execute the following isolated test-first tasks; keep this draft HOLD until all release gates pass.

## Objective
Require a recently reauthenticated administrator session for member-visible support replies and ticket state mutations. Retain existing AdminGuard, AdminSessionGuard, CSRF and the existing request/response shape. Display a link to the actual account-security reauthentication flow, not a fake confirmation button.

## Task 1 — Backend write boundary
1. Extend `backend/src/support/support-controller-guards.test.ts` with two metadata assertions for `ReauthGuard` on `AdminSupportController.reply` and `.status`.
2. Run focused vitest and capture RED failures.
3. Add `ReauthGuard` import and method guards in `backend/src/support/support.controller.ts`.
4. Rerun focused test and existing authentication guard suite. No database migration.

## Task 2 — Administrator user flow
1. Add a failing `frontend/src/app/admin/support/admin-support-view.test.tsx` assertion that a visible link to `/account/security` explains the 15-minute reauthentication requirement.
2. Run focused test to capture RED.
3. Add an accessible notice and link in `admin-support-view.tsx`; do not create a local-only success state or modify the member support surface.
4. Rerun focused test, frontend typecheck and relevant UI tests.

## Task 3 — Verification and release
1. Run changed-file lint, workspace typecheck, build, tests, security audit and available isolated PostgreSQL checks. Report exact PASS/FAIL/SKIP; no shared DB fixtures.
2. Fetch `origin/main`, compare current English/Korean plan and open PRs; rebase only if necessary and safe.
3. Commit the actual code and tests on this branch; push and open a Draft PR. Do not merge until mandatory CI, authenticated exact-SHA Test and release gates pass.
4. Update GitHub worklog and internal final record with exact SHA and blocked stages.
