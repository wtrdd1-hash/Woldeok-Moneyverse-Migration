# Consent Policy Publication Step-up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require recent reauthentication before a superadmin can publish a new legal consent version, and give operators a truthful recovery path in the existing UI.

**Architecture:** Keep existing AdminGuard/AdminSessionGuard/CSRF and DB superadmin/receipt logic unchanged. Add method-level ReauthGuard to the existing POST endpoint. In the UI, identify the 15-minute step-up requirement and link to the existing account security reauthentication route. Do not claim the confirmation phrase is a second authentication factor.

**Tech Stack:** NestJS, Reflect metadata, Next.js, Vitest.

**Spec:** `docs/planning/PROJECT_PLAN.md` / `.ko.md` (P0 security / least privilege, no finance writes).

## Global Constraints
- No DB changes, no financial ledger writes, no new endpoints or migrations.
- Preserve existing `PUBLISH_NEW_POLICY_VERSION` confirmation and superadmin restriction.
- Do not modify other worker branches, Test, or Production.

## Review Focus
- A superadmin with an expired reauth must receive `reauthentication_required` before publication.
- A current reauth may proceed through existing DB authorization and idempotency.
- The UI must point to a real reauth entry point, not invent a second factor.
- All GET controls and emergency feature-switch behavior must stay unchanged.
- No unverified success message should appear on an API rejection.

### Task 1: Backend authorization
- [x] Write a guard metadata test that fails before the fix.
- [x] Run RED and capture result.
- [x] Add ReauthGuard to `publishConsentVersion` only.
- [x] Run GREEN and existing guard regression.

### Task 2: Operator recovery UI
- [x] Write a test for the accurate 15-minute reauth notice and `/account/security` link.
- [x] Run RED and capture result.
- [x] Update policy publication dialog with actionable guidance.
- [x] Run GREEN and UI regressions.

### Task 3: Verification and review
- [x] Run lint, typecheck, build, focused tests and audit; record failures. Full CI and exact-SHA gates remain blocked.
- [ ] Re-fetch main and plans, inspect diff, commit to isolated branch, push Draft PR.
- [ ] Do not merge or deploy until full gates, isolated DB, and exact-SHA Test E2E pass.
