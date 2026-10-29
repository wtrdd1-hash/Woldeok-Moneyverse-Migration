# B v632 — Warfare read-evidence safety recovery plan

## Scope and approval basis
The owner requested hourly P0/P1 backend/API integrity repairs in independent worktrees, preserving A/C/QA and release gates. Existing main fabricates guild owners, siege season and 1.25M/4.2M WLD tax state in authenticated read endpoints, while mutations already return 503. The public page separately presents sample guilds and local WLD dividend counters; SEO describes unverified payouts. Closed unmerged C PR #1250 contains a previously reviewed fail-closed approach; restore and revalidate rather than duplicate new business logic.

## Tasks (TDD, bounded)
1. In `backend/src/club/warfare.controller.test.ts` and `frontend/src/app/clubs/warfare/{warfare-truth.test.tsx,warfare-seo.test.ts}`, write the regression first. Observe RED on fresh `origin/main` for invented owner/tax/SEO, and no authenticated verified-club view.
2. Replace `backend/src/club/warfare.controller.ts` GET results with 503; retain existing 503 POST contract and authentication/consent guards. Add `Cache-Control: no-store` to all five endpoints. Extend `backend/src/club/warfare.http.test.ts` to prove actual Nest HTTP 503, no fictional amounts, no-store and denied unauthenticated requests; observe RED before adding headers.
3. Replace `frontend/src/app/clubs/warfare/page.tsx` with authenticated server-rendered verified club list (`GET /api/v1/clubs?limit=50`), strict response validation, separate empty/error states, and no WLD claim buttons. Replace `layout.tsx` SEO with truthful noindex/nofollow. Update `backend/src/openapi-endpoints.test.ts` to reject false read success.
4. Run focused RED/GREEN, typecheck, lint, full tests, build, API contracts, security audit and relevant isolated PostgreSQL/HTTP verification. Review exact main and EN/KO planning at midpoint and before merge. Keep Draft/hold and do not deploy unless all gates including exact-SHA official Test and GitOps pass.

## Non-goals and rollback
No DB migration, direct financial writes, treasury or wallet changes. This does not implement warfare ownership, deposits, shields or tax settlement. Rollback is reverting this PR on a later independently verified main; do not restore fabricated responses as authoritative data.
