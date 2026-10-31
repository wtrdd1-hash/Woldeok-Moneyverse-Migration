# Development C v1235 — Calendar source evidence

## Before work — 2026-10-31 22:16 KST
- Base: `5bccda44d6db56aff05fa5623ef7f72b2ec0263c` (`origin/main` fetched).
- Isolated branch: `auto/hourly-c-calendar-evidence-v1235-20261031-2216`.
- MiniPC Debian 13.6: backend/frontend/bot/MCP/desktop-commander/nginx/docker active, dev PostgreSQL connected.
- Reviewed AGENTS, English/Korean README and canonical English/Korean PROJECT_PLAN, latest PRs (#2212/#2210/#2209/#2207/#2206), CI, and A/B/QA active work.
- P1: `/calendar` trusts generic API responses as typed objects. A malformed `events`/`catalogItems`/`goals` payload can crash server rendering or imply an empty calendar, while malformed date/price can be presented as authoritative. Current null-only fallback is insufficient. No competing PR covers calendar.
- Scope: validate all four existing authenticated read contracts, show unknown rather than empty for malformed sources, preserve legitimate empty, accessible reload, no new DB writes or fake data.
- Checklist: [ ] RED tests [ ] implementation [ ] focused tests [ ] full gates [ ] CI [ ] official Test [ ] release decision.

## In progress
- Waiting for TDD red regression evidence.

## Finished
- Pending validation; release HOLD until all gates pass.

- Midpoint: four authenticated API payload validators distinguish malformed/unavailable sources from verified empty; accessible retry and route-specific private/noindex headers. RED reproduced (missing parser and missing header), GREEN focused tests 8/8 PASS. Full gates pending.
