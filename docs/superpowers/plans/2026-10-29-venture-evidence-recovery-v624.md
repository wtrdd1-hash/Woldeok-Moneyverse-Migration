# Venture Finance Evidence Recovery v624 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox tracking.

**Goal:** Restore the unique, unmerged financial-truth protection from closed PR #1374, with additional real HTTP regression evidence.

**Architecture:** Keep authenticated NestJS routes and existing blocked write methods. Return an explicit no-store HTTP 503 for unverified venture funding and member equity reads; preserve the client-only demo while removing live-ledger and guaranteed-payout claims. No database, ledger, or authorization changes.

**Tech Stack:** NestJS 11, Vitest 3, Next.js 16, TypeScript.

**Spec:** docs/planning/PROJECT_PLAN.md (v543 financial truth), closed PR #1374, docs/worklog/2026-10-29-hourly-b-v624-venture-evidence-recovery.md.

## Global Constraints
- Do not change applied migrations, app-role grants, financial balances, or Production/Test state.
- Preserve SessionGuard, AuthenticatedGuard, ConsentGuard and existing 503 write endpoints.
- Do not imply that example WLD, shares, dividends, or funding represent authoritative ledger receipts.
- No merge or Production promotion unless all required exact-SHA release gates PASS.

## Review Focus
- Authenticated member read must not invent their holdings.
- Public venture funding list must not invent totals or market activity.
- Error response must be 503, stable code, and no-store at the HTTP layer.
- Existing mutations must remain unavailable; no accidental balance write.
- Preview wallet must not be labeled as a real-time ledger.

## Task 1 — RED evidence
- [x] Add failing real HTTP tests for unverified venture reads.
- [x] Add failing frontend test for live-ledger claim.
- [x] Run both RED suites and record expected failures.

## Task 2 — GREEN implementation
- [x] Replace fabricated backend venture GET payloads with 503 evidence boundary.
- [x] Update the API-contract test to assert the new response.
- [x] Relabel frontend sample WLD and dividend claims.
- [x] Run focused tests and review code diff.

## Task 3 — Release gates and handoff
- [ ] Run typecheck, backend build, lint, unit/integration/security/API and available CI.
- [ ] Re-fetch origin/main and English/Korean planning; record exact candidate SHA.
- [ ] Push isolated branch and open Draft/HOLD PR only; no merge/deploy/cleanup without gates.
