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
