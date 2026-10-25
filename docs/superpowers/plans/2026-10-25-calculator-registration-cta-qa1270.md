# Calculator Registration CTA Regression Repair Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. All changes isolated in qa/v1270-calculator-registration-cta-20261025.

**Goal:** Restore optional, accurate Moneyverse registration navigation on ISA and Youth Leap calculator pages without implying signup is required to calculate or open a real bank product.

**Architecture:** Preserve existing calculators and calculations; add one clearly labeled, localized Next.js Link to the existing `/register` route on each page. Reuse `localeLabel` with ko/en/ja/zh/vi copy and accessible 44px+ touch target. No backend, database, authentication, or financial ledger changes.

**Tech Stack:** Next.js, React, TypeScript, Vitest.

**Spec:** `frontend/src/app/tools/registration-link-regression.test.ts`; adjacent salary/pension calculators; project AGENTS.md.

## Global Constraints
- Do not alter shared worktrees, other contributors' branches, DB, Test, Production or release switches.
- Treat the existing regression as RED; implement minimal CTA to turn GREEN.
- Do not claim all frontend tests pass when unrelated failures remain.
- Never merge or promote without exact-SHA CI/security and isolated Test finance E2E.

## Review Focus
- CTA must navigate to `/register`, not `/auth/register`.
- The calculator must remain fully usable without signing up.
- CTA must not imply a real ISA/Youth Leap account is opened by Moneyverse.
- Five locales must have explicit label copy.
- Mobile link target at least 44px tall and keyboard focus visible.

### Task 1: Reproduce regression
- [x] Run `pnpm --filter @moneyverse/frontend exec vitest run src/app/tools/registration-link-regression.test.ts` and record failing slug. (RED ISA; RED Youth after ISA-only patch)

### Task 2: Restore two optional CTAs
- [x] Modify `frontend/src/app/tools/isa-calculator/page.tsx` and `frontend/src/app/tools/youth-leap-calculator/page.tsx` only, using localized `Link` to `/register`.
- [x] Run targeted regression and verify GREEN. (1/1 PASS)

### Task 3: Verify and hold
- [x] Run typecheck, lint, build, full frontend tests; document unrelated failures. (typecheck/lint/build PASS; full frontend 1398 PASS/5 FAIL, down from 1397 PASS/6 FAIL; remaining failures outside CTA scope; app-api 179 PASS)
- [ ] Commit to isolated branch and open Draft PR; require exact-head CI, isolated Test and GitOps approval before merge or Production.
