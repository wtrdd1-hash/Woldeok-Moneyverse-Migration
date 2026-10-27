# Development B v576 — Stock league owner participation truth (Draft / RELEASE HOLD)

Date: 2026-10-27 KST. Start/mid authoritative main: `133c73b40d51b151523b8374508099f3d349415e`. Branch: `auto/hourly-b-stock-league-owner-participation-v576-20261027-0905`. Final candidate SHA and CI run URLs are recorded on the Draft PR.

## P1 reproduced defect

`GET /api/v1/stocks/league/current` used `leaderboard.find(userId)` on the public top-20 only. A valid enrolled member ranked 37th appeared to have no participation and was offered the paid join button. More fundamentally, the public GET had no session-resolution guard, so `req.session` was not populated for authenticated callers by the normal Nest guard path. The frontend displayed a join CTA even when the enrollment request failed.

## Implementation and contract

- Add an **optional session guard** to public league GET: no cookie stays public; valid cookie is resolved by the existing session repository; stale cookie is rejected with 401 instead of silently becoming an unjoined guest. No client-supplied member ID is trusted.
- Query the member's season participation separately using parameterized `season_id=$1::uuid AND user_id=$2::uuid LIMIT 1`. Preserve the public top-20 list and response shape. No new routes, tables, grants or migrations.
- If member asset values exceed JavaScript safe numeric precision, reject the owner read with a stable 503 error rather than return rounded WLD. A missing stored rank is `0` (pending), rendered as `집계 중`, not a fictitious position.
- Frontend enables paid join only after a successful current-season enrollment read; failures, guests without a season, pending reads and already-enrolled members cannot see the join CTA. No financial mutation code changed.
- Existing join/ledger settlement, authentication, consent/CSRF on POST, feature switches, balances, outbox and audit tables remain unchanged.

## Evidence and gate status

- TDD RED: backend owner lookup 4 failures; optional-session guard 4 failures; UI join gate 2 failures; unsafe WLD numeric 1 failure. All focused suites GREEN after implementation.
- Isolated disposable PostgreSQL 17.11 synthetic fixture: owner rank 37, non-owner and cross-season negatives, app-role UPDATE denied (SQLSTATE 42501), **3/3 PASS**. This is not a full production migration/role integration test.
- Full `pnpm typecheck` exit 0; full `pnpm lint` exit 0 (1,140 warnings, zero errors); full `pnpm test` exit 0: Backend 1,336 PASS/401 SKIPPED, Frontend 1,427 PASS, Contract 38 PASS, DB 15 PASS/3 SKIPPED; default `pnpm build` exit 0 after isolated offline frozen-lockfile install. Never count skipped DB tests as passing.
- Final candidate SHA GitHub CI: see Draft PR verification comment; GitOps release gate not run.
- Security audit baseline: pnpm full **FAIL** (24 advisories: 2 Critical, 8 High, 11 Moderate, 3 Low); bot **FAIL** (1 Critical, 5 High); pnpm prod-only PASS; bot tests 8 PASS.
- Official Test `/api/version` at inspection: `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production: `6a989b5ac0c6155587d43426d64f6def6b62c917`. Candidate not deployed. Authenticated exact-SHA Test app-api/core-user-flow and approved GitOps gates **BLOCKED**.
- miniPC Debian 13.6: services active, root 100% (~676 MiB free), data 96% (~9 GiB free). No shared data or other worker files cleaned.

## Collaboration and release controls

Read AGENTS.md, README, English primary and Korean supporting project plans, open PRs, QA reports, latest CI and main before work. Draft C PR #1168 changes different league page/proxy files, not these source files; integration contract must still be checked with C. Preserve all Gemini/A/C/QA worktrees and open PRs. No merge, deployment, DB write, feature switch, reservation change or branch deletion. Release remains HOLD until complete security audits, real PostgreSQL app-role/full migrations, exact candidate SHA authenticated Test E2E and GitOps gates pass.
