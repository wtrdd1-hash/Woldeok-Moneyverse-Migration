# Backend B v760 — Dopamine quota source integrity

## Before work — 2026-11-02 21:05 KST

- Source: main `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b` (fetched), AGENTS.md, README.md, EN/KO project plans, QA v1471, open A/C/QA/B PRs and CI.
- P1: `GET /api/v1/engagement/dopamine/status` returns a successful member-specific quota response with fixed 10 showdowns and 3 Star Drops, and an unverified `bullBearVotedToday: false`, without reading an owner receipt. This is not a valid current quota proof.
- Existing separate PRs #2316, #2306, #2313 address claim/attendance behavior, not this status response. Avoid touching their methods.
- Contract: fail closed with HTTP 503 `DOPAMINE_QUOTA_UNVERIFIED` until owner-scoped durable evidence exists. Preserve authenticated session/consent guard and private/no-store; no false success-shaped zeros. Browser `fetchDopamineStatus` already maps non-OK to `null`; no new frontend reward path.
- No database migration, WLD, ledger, session, production or external calls.

## Plan
- [ ] RED: test status for a real session and a repository fixture; both must refuse invented quotas.
- [ ] GREEN: implement minimal fail-closed status with stable error code.
- [ ] Validate focused HTTP/unit, broader backend/frontend, lint/typecheck/build, security and isolated PostgreSQL where possible.
- [ ] Refresh main and plans; Draft/HOLD PR and log exact SHA, CI and release gates.

## In progress

Pending.

## Finished

Pending.

## In progress — 2026-11-02 21:12 KST

- TDD RED: two controller tests rejected the prior successful fabricated quota payload (`dailyShowdownsRemaining=10`, `starDropRemaining=3`, `bullBearVotedToday=false`). Initial direct vitest attempt could not fork inside MCP service's 1027 PID limit; retried inside bounded `systemd-run --user --scope` without touching other processes.
- GREEN: `GET /engagement/dopamine/status` now requires the session actor and responds 503 with `DOPAMINE_QUOTA_UNVERIFIED`; private/no-store/noindex, no source or wallet writes.
- Focused controller 6/6 PASS (including existing Golden Duck), new real Nest HTTP 2/2 PASS (authorized 503/private and unauthenticated 401).
- Mid-work origin/main remains `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`. Next: broad gates and exact-SHA proof.

## In progress — 2026-11-02 21:25 KST

- Workspace typecheck PASS. Full lint PASS after renaming a new HTTP test local variable flagged by the Next ESLint rule: 0 errors, 1,027 pre-existing warnings.
- Backend full test initially run with inherited `NODE_ENV=production`: 2,984 PASS / 3 FAIL / 518 SKIP. One failure was an existing Pet Fortune test expecting a successful fixed status; updated to assert 503. Other two are known profile HTTP token-fixture failures tracked by Draft #2265. Rerun under explicit `NODE_ENV=test` required.
- Contract 41 PASS; database package 62 PASS / 5 SKIP. Initial frontend run inherited `NODE_ENV=production` and produced widespread React DOM test failures; stopped only this task's test process and started corrected isolated `NODE_ENV=test` run. These initial failures are not counted as passing gates.
- Official Test `/api/version` = `abfbb8aee63393c9f58e72159bd5bcab06f99412`; Production = `6fe94aeeebbd30c996f7a9f8ddeb02f8c538505e`; neither is candidate SHA. No deployment allowed.
