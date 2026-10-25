# Loan Repayment Preview Implementation Plan
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide authenticated virtual-bank members with an accurate, read-only loan repayment preview before they submit an actual repayment.

**Architecture:** Reuse `bank_get_my_standing(p_actor)` through `BankRepository.getStanding`, validate snapshot data and calculate preview via BigInt in a pure backend function. Expose a guarded Nest GET endpoint, private Next page, and existing Android app-api passthrough. Never mutate PostgreSQL or trust caller-provided actor.

**Tech Stack:** NestJS, Next.js, TypeScript, PostgreSQL 17, pnpm, node:test, Vitest.

**Spec:** docs/worklog/2026-10-25-hourly-a-loan-repayment-preview-0925.md

## Tasks
- [ ] 1. Write failing pure preview contract tests; observe RED.
- [ ] 2. Implement minimal pure calculation; observe GREEN.
- [ ] 3. Write and implement guarded backend controller route; verify owner scope, null/error and validation.
- [ ] 4. Write and implement private Next UI and link; verify noindex/no-store and large integer strings.
- [ ] 5. Add Android gateway contract regression and generated contract docs.
- [ ] 6. Recheck main and integrated EN/KO plans; run all available gates and isolated PostgreSQL ACL; record exact SHA.
- [ ] 7. Publish EN/KO QA release notes and Draft PR; merge/deploy only on complete independent gate PASS.

## 09:35 KST plan revision — Loan Maturity Deadline & Minimum Cash Readiness
PR #1197 already implements the original repayment preview. Do **not** duplicate it. The previous tasks are superseded by these new, unique tasks:
- [x] 1. RED deterministic clock/validation/precision tests for `loan-deadline.ts`; GREEN pure calculation.
- [x] 2. RED/GREEN guarded `GET banking/loan-deadline` tests, using only owner-scoped bank standing.
- [x] 3. RED/GREEN private `/bank/loan-deadline` page and bank navigation, noindex/no-store, no misleading reminder/payout.
- [x] 4. Android app-api forwarding, contract generation, exact SHA, isolated real PostgreSQL ACL.
- [ ] 5. Mid/final main+plans+PR audit; full gates, QA release notes, Draft PR and HOLD until all PASS.
