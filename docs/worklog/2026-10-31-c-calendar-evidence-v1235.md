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

## Finished — 2026-10-31 22:30 KST
- Source changes: four authenticated calendar payload validators reject malformed/duplicate identifiers, impossible dates, unsafe amounts, false status; verified empty remains distinct from unavailable. SSR has a keyboard-operable 44px reload and screen-reader alert. Calendar HTTP headers override global indexing with `private, no-store`, `noindex, nofollow`, `no-referrer`. No DB/API schema or financial write.
- TDD: missing validator RED, missing privacy header RED, invalid February 30 instant RED; then focused tests **8 PASS** including SSR error/empty states.
- Initial gates on implementation commit `745e8b8a5`: lint **PASS** (0 errors, 1,049 pre-existing warnings), typecheck **PASS**, frontend/backend/contract/database build **PASS**, app-api **PASS** (184 endpoints), root `pnpm test` **PASS** (contract 41, database 62 PASS/4 SKIP, backend 2,786 PASS/501 SKIP, frontend 2,784 PASS, release/security checks PASS).
- Isolated PostgreSQL 17.11: first setup used the wrong migration owner and failed at 029; container destroyed. Corrected to run migrations under the dedicated migrator role: **312/312 PASS**, `moneyverse_app` can EXECUTE `season_active_events()`, ledger rows 0; isolated container destroyed. No shared DEV/Test/Production DB changed.
- Security audit: `pnpm audit --prod --audit-level high` PASS (0 known vulnerabilities); full `pnpm audit` FAIL (13: 3 low, 10 moderate). Full route QA certification BLOCKED: canonical inventory generated (173 pages) but no complete five-pass execution ledger exists; fixtures alone are not evidence.
- Isolated built Next HTTP `/calendar` responds 500 with intentionally unavailable auth backend, so authenticated E2E is NOT certified. Actual response headers **PASS** `x-robots-tag: noindex, nofollow`, `cache-control: private, no-store`, `referrer-policy: no-referrer`. Official Test and Production `/api/version` and `/frontend-version` both show `bc8cd8a6c654af0336f550643f23049a58ee1d16`, not this candidate.
- The final date-boundary test change will be committed with this worklog; exact-final-SHA gates and GitHub CI must be rechecked before any release decision. Official Test exact-SHA authenticated E2E, restore, GitOps release gate, and full audit remain BLOCKED/FAIL. Do not merge/deploy. No rollback required.
- Start/mid/end `origin/main` fetched; remained `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`. Existing A/B/Gemini/QA and all unmerged branches preserved; core five automations unchanged. No branch deletion.


- Midpoint: four authenticated API payload validators distinguish malformed/unavailable sources from verified empty; accessible retry and route-specific private/noindex headers. RED reproduced (missing parser and missing header), GREEN focused tests 8/8 PASS. Full gates pending.
