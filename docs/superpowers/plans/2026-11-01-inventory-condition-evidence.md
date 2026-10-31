# Member Inventory Condition Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans; use test-driven-development and verification-before-completion for each step.

**Goal:** Let authenticated members inspect sourced holding/effect expiry and weekly upkeep/arrears without implying payment or perpetual ownership.

**Architecture:** Reuse existing owner-scoped `shop_my_items_v2` SQL and Nest GET `/api/v1/shop/holdings`, adding strict optional evidence validation. Render read-only accessible details on `/inventory`; Android gateway validates the same evidence and forces private headers. No DB write or new migration.

**Tech Stack:** NestJS, Next.js, PostgreSQL 17, Vitest, TypeScript.

**Spec:** `docs/planning/PROJECT_PLAN.md` v1516/v1518 and Korean parity.

## Global Constraints
- No changes to applied SQL migrations, ledger, grants, idempotency or live data.
- Missing/null evidence means UNKNOWN, never paid, permanent or zero.
- WLD values remain canonical integer strings, not floating point numbers.
- Private response on both success and errors; no raw actor identifiers in logs.
- Other A/B/C/QA worktrees and unmerged PRs must remain untouched.

## Review Focus
- Large WLD amounts above MAX_SAFE_INTEGER remain exact.
- Malformed SQL evidence returns unavailable, not fabricated values.
- Empty verified holdings and upstream failure are distinct.
- Android upstream public cache headers cannot leak owner data.
- Effect expiry and held-item expiry must not be conflated.

### Task 1: Backend evidence validation
- [ ] Add failing test for invalid `weekly_cost`, `arrears_due`, `arrears_cap`, `unpaid_weeks`, expiry and boolean fields.
- [ ] Add validator and call it in authenticated controller after SQL read, returning 503 on invalid data.
- [ ] Verify existing holdings controller regressions and new tests.

### Task 2: Inventory disclosure
- [ ] Add failing tests for null/unknown vs true/false, exact WLD and separate effect expiry.
- [ ] Add a read-only accessible `<details>` section on each item; no payment CTA or invented current status.
- [ ] Verify view and server page tests.

### Task 3: Android API privacy and parity
- [ ] Add failing gateway test for invalid 200, cacheable upstream, 401/503 and valid exact values.
- [ ] Add owner holdings response verification and forced no-store/noindex/no-referrer on all statuses.
- [ ] Verify app-api contract tests.

### Task 4: Verification and release gate
- [ ] Recheck main and current plan, run build/lint/typecheck/unit/integration/DB/security/a11y/SEO/app-api/E2E gates.
- [ ] Commit/push Draft PR with exact SHA evidence; merge only on all required gates PASS.
- [ ] Never deploy without official Test exact-SHA auth E2E, DB ACL and rollback proof.
