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
- [ ] Show RED before changing production source; replace non-CSRF `api` writes with the existing server-only `mutate` and finance-origin guard, no bypass.
- [ ] Run focused GREEN tests, typecheck, lint and review code/test diff.
- [ ] Re-fetch `origin/main`, resolve conflicts without touching concurrent agents' trees, document status and evidence.
- [ ] Push task branch and open PR; isolated Test and production release only if all financial/idempotency gates pass.

## IN PROGRESS
- Isolated worktree created from fresh main; 20/20 regression assertions RED against the original handlers (expected 200/403/409 became 500), using isolated frontend dependency links; no runtime code changed.

## FINISHED
- Pending verification and exact release-state record.
