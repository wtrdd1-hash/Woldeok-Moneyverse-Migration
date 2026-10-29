# Verified Gallery Submission Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Tasks follow RED → GREEN → verification.

**Goal:** A member photo submission must not claim acceptance until its backend receipt and owner-scoped persisted row agree.

**Architecture:** Reuse existing POST `/api/v1/photos` and GET `/api/v1/photos/mine` backed by migration 098 SECURITY DEFINER functions. Verify the receipt photo UUID equals the submitted idempotency UUID, the replay flag is boolean, and the owner's list contains that photo with matching image path and caption. On contradictory/absent evidence, show an uncertain-state message; never claim failure to persist or encourage blind resubmission.

**Tech Stack:** Next.js server actions, NestJS, PostgreSQL, Vitest.

**Spec:** Existing `backend/src/content/member-photo.controller.ts`, `member-photo.repository.ts`, and migration `098-member-photo-submissions.sql`.

## Tasks
- [x] Write Vitest regression for fake 2xx receipts, wrong UUID, absent readback, mismatched media/caption and verified success.
- [x] Run RED focused test on untouched main-based action.
- [x] Implement minimal fail-closed receipt validation in `frontend/src/app/gallery/submit/actions.ts`.
- [x] Run GREEN focused tests and existing backend photo contract/real PostgreSQL suite. (12 focused PASS, 14 real-PostgreSQL/backend PASS on intermediate SHA, 293 migrations applied)
- [ ] Run build/lint/typecheck/full tests, security, mobile contract, CI, isolated Test; record exact SHA and unresolved gates.
- [ ] Re-fetch main, review PR and integration/production gates; preserve unique branch if any gate is not green.
