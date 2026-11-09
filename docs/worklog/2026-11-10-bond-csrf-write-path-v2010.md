# v2026.11.10.2010 — Bond write gateway CSRF and origin enforcement

## BEFORE WORK — 2026-11-10 KST
- User incident: authenticated mobile `/bonds` purchase confirmation reports `csrf token required`.
- Base: freshly fetched `origin/main` `edd709bcbe96f6f5ceca8372f244b632e8211242`; isolated worktree, no modification to active main or other agents' QA/funding branches.
- Read `AGENTS.md`, `GEMINI.md`, `DOCS_INDEX.md`, integrated planning master, development master, `docs/RELEASING.md`, current v1949 bond QA worklog, bond Nest controller, CSRF guard, Next `mutate` and finance-origin helper.
- Evidence: production-current and main `frontend/src/app/api/bonds/subscribe/route.ts` are identical and call `api(POST)` without `csrfToken`. The Nest subscription route requires `CsrfGuard`; three related bonds BFF writes also call the non-CSRF `api` helper.
- Security requirement: keep Nest `CsrfGuard`; require same-origin request at the Next BFF before minting a fresh session CSRF token. No user ledger, DB, SQL migration or live monetary transaction changes.
- P0 separate blockers: v1949 independent bond QA found incomplete idempotent receipts, incomplete coupon/maturity verification, intentionally held repo-loan routes, and unverified rollover DB privileges. No assertion that fixing CSRF alone certifies all bond transactions.

## PLAN
- [x] Add regression tests for all four bond mutation BFFs (valid same-origin request, CSRF-wrapped write, forged/missing origin rejection, error-status preservation).
- [x] Show RED before changing production source; replace non-CSRF `api` writes with the existing server-only `mutate` and finance-origin guard, no bypass.
- [x] Run focused GREEN tests, typecheck, lint and review code/test diff.
- [x] Re-fetch `origin/main`, resolve conflicts without touching concurrent agents' trees, document status and evidence.
- [x] Push task branch and prepare PR; official Test and Production held due unresolved finance/idempotency gates.

## IN PROGRESS
- Isolated worktree created from fresh main; 20/20 regression assertions RED against original handlers. Initial test invocation found an empty new worktree node_modules; linked existing project dependencies without changing the original workspace, and reran to reproduce real test failures.
- Changed four BFF gateway handlers only: server-side mutate for token retrieval and write forwarding; same-origin gating; no-store/noindex on success/denial/error.
- TDD GREEN 20/20; expanded security/bond regression 43/43; contract build PASS, frontend TypeScript PASS, ESLint 0 errors (four pre-existing any warnings), full Next production build PASS.
- Launched built frontend on isolated loopback port 4399: forged-origin requests for all four BFF operations returned 403. Preview stopped and listener verified absent.
- Mid-work main fetch still edd709bcbe96f6f5ceca8372f244b632e8211242; separate v1949 QA and Treasury funding worktrees preserved.
- No DB migration, SQL execution, balance mutation, user session or Production configuration changed.

## FINISHED — SOURCE VERIFIED, OFFICIAL TEST/PRODUCTION HOLD
- The visible CSRF omission is corrected in source, and source/proxy security regressions pass. These do NOT prove a funded authenticated purchase settles correctly.
- Official authenticated Test and exact-SHA Production were not promoted: independent bond QA v1949 (#3008) still reports missing safe retry/idempotency settlement evidence, coupon/maturity ledger integrity and rollover privilege uncertainty; Repo borrowing/repayment intentionally return 503.
- Production member money, ledger, database, security settings, live application and test instance remain unchanged.
- Internal/GitHub bilingual updates and release hold report filed under version 2010. Draft PR [#3009](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3009) opened against main for financial-gate review.

## POST-PR RELEASE STATE — 2026-11-10 KST
- GitHub PR #3009 DRAFT, source implementation pushed. GitHub CI run 6001 (ID 42653275648) is in progress, not counted as passing.
- The existing official Test backend/frontend are systemd active; public Test /api/version and /frontend-version both 200, reporting prior source SHA a13a18cd70709a6f4df320d4d76ea834baae2331, **not this v2010 candidate**.
- The actual Production and official Test release generation have not been switched. Further public finance E2E and ledger certification remain blocked; no claim of live incident resolution.
