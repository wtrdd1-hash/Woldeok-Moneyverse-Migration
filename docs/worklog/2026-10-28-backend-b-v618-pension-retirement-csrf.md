# Backend B v618 — Pension retirement state mutation boundary

## Before work
- [x] Read AGENTS, README, canonical English/Korean plan, QA v1351, open PRs and CI.
- [x] Verify latest main and independent worktree; live DB and other workers untouched.
- [x] Scope: only `POST /api/v1/pension/toggle-retire` and its Next BFF, not the already-held NPS financial settlement paths.
- [ ] TDD RED: prove missing Nest CSRF/consent and BFF same-origin checks.
- [ ] TDD GREEN: require session, authentication, current consent, CSRF, and same-origin browser request; forward fresh session CSRF server-side.
- [ ] Verify focus tests, workspace lint/typecheck/build/test, isolated DB, CI and Test exact-SHA as available.

## In progress
- Risk: the public NPS state toggle currently mutates user retirement status without explicit CSRF guard; its Next route forwards an unauthenticated browser POST through a session-bound backend API. Reject cross-origin at the browser edge before minting a server CSRF token.
- Preserve read-only pension views and existing successful same-origin user flow; do not change WLD balances, payout holds, or migrations.

## Finished
- Pending verification. Production HOLD.

## Implementation checkpoint
- [x] RED: Nest HTTP test missing/invalid CSRF returned 201 instead of 403; missing consent returned 201 instead of 428 (2 failures). Next BFF rejected neither cross-origin nor missing-origin requests (2 failures, upstream mock error returned 500).
- [x] GREEN: Nest real `CsrfGuard` + `ConsentGuard` HTTP 3/3 PASS. Next same-origin BFF 2/2 PASS, including missing/cross-site Origin denial and server-side CSRF mutation helper.
- [x] No database, migration, wallet or retirement business-logic changes. Other pension finance mutation paths remain separately held/unchanged.
- [ ] Full gate evidence and final SHA validation pending.
