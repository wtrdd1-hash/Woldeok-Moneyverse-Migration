# Owner account App API privacy boundary implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent Android account identity and deletion responses from inheriting public cache/index/referrer policies from upstream or error middleware.

**Architecture:** Keep existing backend SessionGuard, AuthenticatedGuard, ConsentGuard, CSRF and Reauth enforcement unchanged. Apply response privacy headers at the Next App API edge for the `account` group, including success, errors, HEAD and empty responses. Do not alter public contract metadata.

**Tech Stack:** Next.js App Router, TypeScript, Vitest.

**Spec:** `backend/src/account/account.controller.ts` and `docs/planning/PROJECT_PLAN.md` (owner privacy / fail-closed requirements).

## Global constraints
- No financial writes, schema migration, direct database grants or production mutations.
- Work on a branch based on current `origin/main`; keep other automation worktrees untouched.
- Only verified evidence can authorize merge or deployment.

## Task 1 — regression and minimal fix
- [x] Add `frontend/src/app/app-api/v1/[...path]/account-identity-private.test.ts` covering owner GET/DELETE, 200/401/503/204, HEAD and public contract control.
- [x] Run targeted Vitest; capture RED on unsafe inherited response headers.
- [x] Add a narrow account-group response privacy guard in the App API route `handle()`.
- [x] Run targeted Vitest again and record GREEN.
- [x] Run repository lint/typecheck/test/build and security/API contract gates; record actual skipped or failed gates.
- [ ] Re-fetch main/plans, inspect diff, commit and open HOLD draft PR only if tests support it.
