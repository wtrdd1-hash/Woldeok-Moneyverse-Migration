# C v1093 — Verified Emergency Control Evidence (bounded plan)

## Problem and boundary
`/admin/controls` advertised four operational emergency circuit breakers, simulated their toggles entirely in React state, and fabricated an in-memory audit log. No authenticated API or database write existed for those operations. Treating the displayed `OPERATIONAL`/`FROZEN` state as evidence can mislead operators during an incident. The existing NestJS `GET /api/v1/admin/controls` is an authenticated real control-plane read; its feature switches are *not* equivalent to stock/treasury/signup/bot circuit breakers.

## Design
- Fail closed on malformed control-plane data rather than treating it as empty/normal. Validate feature-switch, policy and role arrays and reject duplicates/inconsistent active policies.
- Replace the simulated emergency panel with a read-only, screenreader-accessible view of verified feature switches. State explicitly that dedicated emergency freezes are unavailable; link to the real switch controls rather than pretending to perform a freeze.
- Guard policy and role writes when their read evidence is unavailable; derive superadmin UI permissions from `/api/v1/admin/security` rather than a hardcoded `true`. Never substitute fictional published policy versions.
- Preserve existing NestJS auth/CSRF/reason and PostgreSQL function boundary; no DB migration, financial write or public route. Keep noindex and responsive UI.

## Execution & verification
1. Write regression tests for invalid payload, duplicate state, verified switches, unavailable evidence, no fake freeze controls, legal policy fallback and role gating. Confirm RED.
2. Implement pure parser, read-only evidence panel, page gating and accessible link. Confirm focused GREEN.
3. Verify full lint, typecheck, unit, backend, real PostgreSQL CI, security audit, app-api, candidate build and official exact-SHA Test E2E. Record every failure/skip.
4. Re-fetch main and plan, create independent Draft PR, retain branch and hold merge/Production unless all mandatory gates pass.
