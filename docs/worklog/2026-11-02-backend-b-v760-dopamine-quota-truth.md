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
