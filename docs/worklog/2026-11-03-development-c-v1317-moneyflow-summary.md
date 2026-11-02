# Development C v1317 — Administrator money-flow summary provenance

## START — 2026-11-03 03:15 KST
- Independent worktree `auto/hourly-c-moneyflow-summary-proof-v1317-20261103-0315` from `origin/main` `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`; root checkout has unrelated uncommitted security work and must remain untouched.
- Debian 13.6 miniPC verified; backend, frontend, bot, MCP, desktop commander, Nginx, Docker active; development PostgreSQL reachable. Reviewed AGENTS.md, README.md, README/README.ko.md, English/Korean PROJECT_PLAN.md, active PRs, CI, A/B/C/QA records. No active PR targeting `/admin/money-flow` summary integrity.
- P1 source-proven gap: the NestJS treasury repository computes 24-hour total volume as debit+credit postings and returns lifetime counters, but Next's `validateMoneyFlowResponse` accepts contradictory totals, impossible activity counts and inconsistent last transaction dates. A malformed HTTP 200 can be displayed as certified money-flow metrics. Preserve BigInt exactness, avoid invented zeros, distinguish source failure from empty data.
- Scope: strict read-only summary provenance, accessible retry, safe private admin HTTP policy, focused SSR tests. Existing authenticated Nest endpoint and ledger query remain the source; no financial writes, no DB schema changes. Mobile/SEO impact evaluated; avoid overlap with A/B and unrelated PRs.
- Plan: (1) RED tests for contradictory summary and false activity; (2) minimal validator fix and SSR regression; (3) actual HTTP/private header and DB-backed evidence; (4) exact HEAD full gates, CI, PR; (5) release HOLD unless all gates PASS.
- Status: IN PROGRESS. Test/Production changes prohibited pending release gates.

## MID — 2026-11-03 03:16 KST
- TDD RED: 3 tests failed for contradictory totals/activity/SSR, 6 private-header route tests failed; confirmed source and HTTP configuration gaps. GREEN: 17/17 focused tests after BigInt consistency validation and exact private header rules for `/admin/money-flow` and five locale routes.
- Preserved original semantics: Nest's `SUM(post.amount)` equals debit+credit subtotals; counts from the same PostgreSQL owner posting set. No new API, DB migration, grants, financial write or synthetic data. Existing Next admin session guard retained.
- Mobile: horizontally scrollable admin ledger region now keyboard focusable with accessible label. Admin pages retain responsive layout. SEO: private/noindex/no-referrer on six routes.
- Midpoint `origin/main` fetched and unchanged at `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`. Final gates pending.

## MID-2 — 2026-11-03 03:18 KST
- Isolated network-disabled PostgreSQL 17.11 applied all 328 numbered SQL steps. `moneyverse_app` can SELECT ledger_transactions, ledger_postings and accounts but **cannot SELECT member_profiles**; the actual Nest money-flow query fails `42501 permission denied for table member_profiles`. This is a pre-existing P0 source availability blocker; never claim the API works or release this branch.
- Added targeted Nest HTTP boundary: map PostgreSQL `42501` to sanitized 503 `ADMIN_MONEY_FLOW_SOURCE_UNAVAILABLE` (without altering 400 validation) and private/noindex endpoint headers. TDD RED 1; GREEN 28/28 backend money-flow focused tests. A proper operator-scoped `SECURITY DEFINER` read function, not direct table grants, is required in a separate coordinated DB migration.
- The database container was removed. No shared DEV/Production DB or balances changed. All final gates and official Test remain pending.

## FINISHED CHECKPOINT — 2026-11-03 03:26 KST — PARTIAL / RELEASE BLOCKED
- First code candidate `64d2ff91bf4781c0fbe8e707a3af4fa0660b451c`: full lint PASS (0 errors/1,028 warnings); typecheck PASS; frontend 2,956 PASS; backend 2,986 PASS / 2 FAIL / 518 SKIP (profile private HTTP expects 200 but receives 401, known from preceding C runs); database package 72 PASS / 5 SKIP; app-api contract PASS; security scripts PASS; backend and frontend production build PASS. Dependency audit FAIL (8 moderate, 1 low); full-route QA FAIL (required ledger evidence missing).
- Local Next.js HTTP: `/admin/money-flow`, `/ko`, `/en`, `/ja`, `/vi` localized paths HTTP 200 with noindex/no-store/no-referrer; `zh-CN` 404 because supported locale is `zh`. Corrected route policy and regression test to `zh`; final HEAD requires new complete gates. Local server lacks INTERNAL_API_TOKEN and authenticated backend, so HTTP 200 is **not** evidence of functional admin user flow. Build ID was timestamp, not Git SHA.
- Official read-only Test frontend version `2dd507030dc1e461cbcf18f060260959f4c26a8f`, Production `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`; neither matches candidate. No official exact-SHA Test or authenticated browser/Android E2E, independent restore, or release approval. The isolated DB 42501 blocker is recorded in issue #993.
- Draft PR #2567; final SHA validation, CI and backup evidence are appended to the PR, not inferred from earlier SHA. No main merge, Test/Production deployment, GitOps change, rollback or branch deletion. A/B/QA/Gemini and five core schedules untouched.
