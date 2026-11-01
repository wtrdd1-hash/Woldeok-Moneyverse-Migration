# Development C v1260 — Verified season-event calendar (DRAFT / RELEASE HOLD)

## Start — 2026-11-01 13:17 KST
- MCP Debian 13 miniPC confirmed: seven services active, development PostgreSQL connected. Canonical origin/main `f13bbce273ffc65e8576170992d82ea00c27a1c9` fetched. Main checkout contains another worker's modified `implementation_plan.md`: leave untouched.
- Reviewed AGENTS, README and README/README.ko.md, canonical English/Korean PROJECT_PLAN, open PRs through #2316, A/B/QA/Planning and recent C v1259, CI. No active PR dedicated to the season-event calendar read path; A season event budget filtering #2259 is separate.
- **Verified P1:** `/calendar` trusts `GET /api/v1/seasons/events` response without runtime validation. A successful malformed JSON payload can crash rendering (`seasonEvents.map`), display unverified costs/dates, or masquerade as a verified empty list. Android app-api forwards the same success-shaped payload without checking its provenance and inherits upstream cache policy. The real backend already uses `public.season_active_events()` and guarded `GET /api/v1/seasons/events`.
- Bounded design under the standing development mandate: preserve the existing authenticated SQL-backed read path, add strict bounded event payload verification, distinguish verified empty/unavailable, render an accessible retry, and apply equivalent Android gateway fail-closed behavior and private/noindex/no-referrer headers. No new DB, money, mutation or transaction API. Other calendar sections are out of scope.
- Branch `auto/hourly-c-calendar-season-v1260-20261101-1316` and independent worktree `/srv/moneyverse-data/tasks/mv-c-v1260-calendar-season/repo`, from exact origin/main. Never edit main or shared workers.

## Implementation checklist
- [x] RED regression tests: valid empty/invalid event payload, duplicate IDs, invalid WLD/date and Android HTTP boundary.
- [x] GREEN: bounded pure parser, web fail-closed/error/verified-empty state and accessible retry, Android gateway.
- [x] Midpoint fetch main, review overlaps and change diff.
- [ ] Exact HEAD focused/full lint, typecheck, build, frontend/backend/unit/contract/security/app-api, real isolated PostgreSQL, E2E, CI, Test; record each PASS/FAIL/BLOCKED.
- [ ] Final SHA, origin/main recheck, PR and preserved backups; no merge/deploy unless all release gates PASS.

## Midpoint — 2026-11-01 13:20 KST
- RED reproduced: 7 failures across missing parser, unvalidated web page, Android 200 malformed payload and public cache inheritance. Focused test log: /tmp/mv-c-v1260-red.log.
- GREEN: strict 200-event maximum, UUID/dedup, bounded text, exact WLD, integer points, real ISO date; web verified-empty vs invalid; 44px keyboard retry; Android GET 200 sanitization, 503 on malformed, safe 401, private no-store/noindex/no-referrer incl HEAD.
- 16 focused tests PASS after correcting one test fixture that called HEAD handler with GET request. SSR rendered invalid/empty/verified paths. Targeted ESLint and frontend typecheck PASS.
- Midpoint fetch: origin/main remains f13bbce273ffc65e8576170992d82ea00c27a1c9; no overlapping active season-calendar PR. A/B/QA work untouched.
- No DB schema, ledger, WLD, migration, existing main, Test or Production changes.

## Final
- Pending. Release HOLD until all required gates and official exact-SHA Test pass.
