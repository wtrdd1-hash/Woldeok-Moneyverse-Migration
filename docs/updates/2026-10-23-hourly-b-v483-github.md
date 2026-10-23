# Backend B v483 — crawler log ingestion internal-token enforcement

**Status: DRAFT / HOLD. No Test or Production deployment.**

## Problem
The crawler telemetry write endpoint `POST /api/v1/seo/log` bypassed the shared internal-token guard while accepting caller-supplied crawler/IP/User-Agent data. The Next proxy did not attach the internal token. An unauthorized network caller reaching Nest could forge metrics and receive raw log entries.

## Change
- Remove the internal-token bypass from the Nest crawler telemetry write only.
- Attach the server-only `INTERNAL_API_TOKEN` to the trusted Next proxy POST; suppress telemetry if the token is absent.
- Add TDD regression tests for write-guard metadata, authenticated proxy POST and fail-closed missing-token behavior.
- No SQL migration, ledger, balance, feature switch, administrator API or public SEO read contract change. Public crawler reads are separately addressed in draft PR #996.

## Evidence / gates
- RED reproduced: backend 1 failing; frontend 2 failing.
- GREEN: backend 1/1; frontend 2/2. Workspace typecheck/build PASS, changed-file ESLint PASS.
- Full lint FAIL on QA-owned CSV regex (`#991`); full frontend unit tests 2 unrelated homepage redesign assertions FAIL; backend 1304 PASS, 397 DB SKIPPED.
- Exact-SHA GitHub CI, real PostgreSQL, authenticated E2E, isolated Test and GitOps Production release gates remain BLOCKED. **Do not merge or deploy** until required checks pass.

- Draft PR #1002 created; merge and Production remain HOLD.
