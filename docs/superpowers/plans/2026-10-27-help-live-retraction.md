# Live Verified Help Retraction Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development, with a spec-compliance and code-quality review before completion.

**Goal:** Stop an already-open verified help article from continuing to present withdrawn evidence as verified.

**Architecture:** Add a narrow, read-only PostgreSQL SECURITY DEFINER publication status function to the existing *unapplied* migration 280; expose it via a feature-gated NestJS public GET and same-origin Next route, with Android public read parity. The client hides the article until revalidated, rechecks at most every 30 seconds and on focus/visibility, and fails closed on outages. Revocation is eventually observed (<=30s in active tabs), not a push guarantee. No monetary or admin-write changes.

**Tech Stack:** PostgreSQL 17, NestJS, Next.js 16, React, Vitest, pnpm.

**Spec:** Existing verified-help EN/KO plans; PR #1551; independent review and expiration remain mandatory.

## Constraints
- Main is c2a9306ddc0424438bc0ab297ea9543bb167aee6 at start; re-fetch before commit/PR.
- Existing 280 is unapplied in main; other unmerged 280 migrations collide. Do not alter applied migrations or production DB.
- `VERIFIED_HELP_CENTER_V1` remains OFF. All status responses no-store; no admin routes on Android.
- Never claim exact-SHA official Test/Production approval from local tests or CI.

## Steps
- [ ] RED: add DB positive/negative function contract, backend controller/repository, Next route, Android allowlist and React revalidation tests; run focused tests and retain failure evidence.
- [ ] GREEN: implement narrow DB status function, NestJS status endpoint, Next route and React 30s/focus fail-closed verification; ensure previous evidence clock remains.
- [ ] Verify: focused tests, full pnpm typecheck/test/lint/build, isolated PG 17 real ACL/fixtures, Android contract, security audits, and CI. Record failures as blockers.
- [ ] Re-fetch main and current integrated EN/KO plan at middle/precommit; PR Draft/HOLD only. No merge/production release without all gates.
