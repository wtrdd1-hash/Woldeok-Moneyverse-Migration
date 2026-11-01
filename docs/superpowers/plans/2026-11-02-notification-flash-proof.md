# Notification Preference Flash Proof Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development, then verification-before-completion.

## Goal and scope
Eliminate URL-only success forgery on the member notification preference page without changing the existing authenticated NestJS PUT and PostgreSQL-backed readback contract. An HttpOnly short-lived server-issued nonce binds success to the saved boolean. The page must also confirm a fresh owner readback before showing success. A URL parameter by itself never certifies a write. No financial writes or DB migration.

## Tasks
- [x] Add failing tests to `frontend/src/app/account/notifications/preference-receipt.test.ts` for issuance only after receipt+readback, and no issuance on failure.
- [x] Add page evidence tests proving URL-only `saved=1` cannot display success and a nonce+expected value+readback match is required.
- [x] Implement minimal action/page changes, with a small pure helper in `notification-flash.ts` for testable parsing; preserve existing forms and error messages.
- [ ] Run focused tests, lint, typecheck, build, frontend/backend suites, app-api/DB/security checks, remote CI; record SHA and all blockers.
