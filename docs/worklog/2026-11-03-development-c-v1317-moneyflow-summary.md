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
