# FX Administrator Boundary Implementation Plan

> For agentic workers: use Superpowers test-driven-development and verification-before-completion. Scope is bounded to the existing FX admin controller and Next administrator console.

**Goal:** Prevent member-role-only sessions and browser-origin requests from executing privileged FX operations, without asserting that the existing FX SQL ledger implementation is production-safe.

**Architecture:** Existing NestJS guards enforce console, CSRF and reauthentication at the API boundary. Next server actions carry HttpOnly member cookies and one-use CSRF to the internal API, unwrap the response envelope and reject incomplete receipts. The public FX portal remains separate. No DB schema or applied migration changes.

**Tech stack:** NestJS, class-validator, Next.js server actions, Vitest, pnpm.

## Task 1 — Backend authorization and DTO validation
- [x] Add failing tests for class and method guard metadata, public-route isolation.
- [x] Add failing tests for intervention/swap/forward/halt input DTOs.
- [x] Apply AdminSessionGuard to admin FX controller and CsrfGuard/ReauthGuard to four writes.
- [x] Add runtime class-validator DTOs for bounded integer amounts, UUIDs and boolean flags.
- [x] Re-run both focused suites; 9/9 passed.

## Task 2 — Browser to server-only API boundary
- [x] Add failing regression tests for direct privileged fetch, status envelope and mutation routes.
- [x] Create frontend/src/app/admin/fx/actions.ts, require admin console for each call, use mutate for one-use CSRF and validate backend result.
- [x] Change FX page and control tower to use actions and fail closed on malformed response.
- [x] Add behavioral mocked action tests for auth, input refusal, status unwrap, and receipt mismatch.
- [x] Run focused frontend suites; 8/8 passed.

## Task 3 — Release verification and integration
- [x] Run repository-wide lint, typecheck, build, test, API contract and security audit; frontend/audit gates fail.
- [x] Assess isolated PostgreSQL and exact-SHA Test gates: BLOCKED; Production-linked dev DB untouched.
- [x] Re-fetch main and planning; review PR conflicts, open QA/A/C PRs and required CI.
- [x] Open Draft PR #1128; hold merge/Production on incomplete gates.
- [x] Log code/contract, tests, blockers and cleanup decision; final SHA from final log commit.

**Known out-of-scope blocker:** FX repository has direct account balance UPDATE without posting through the authoritative ledger, and direct app-role table DML. This must be redesigned and validated in a separate audited DB migration before production enablement; this branch must not claim financial integrity or end-to-end completion.
