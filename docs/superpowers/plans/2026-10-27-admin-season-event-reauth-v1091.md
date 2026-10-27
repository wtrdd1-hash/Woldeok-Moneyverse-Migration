# Admin Season Event Privileged Writes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use Superpowers test-driven-development and verification-before-completion for each implementation step.

## Evidence and design

At canonical `main` 584f01a9c8df3f9005a7e5aa6d13e4719914ae0c, `GameCatalogController.createSeasonEvent` and `updateSeasonEvent` require CSRF but not the `ReauthGuard` already used for market-moving and reward-policy writes. Season-event entry fees and availability affect member WLD behavior. The admin catalog forms offer no recovery when the existing server returns `reauthentication_required`. This is a P1 authorization-hardening gap, not evidence of a Production exploit. Existing admin/session/consent checks and database authorization must remain intact.

## Scope and alternatives

Use the existing 15-minute recent reauthentication mechanism, never invent OTP, and link to `/account/security` only after the server explicitly returns `reauthentication_required`. No new identity endpoint, DB migration, ledger mutation, or new session state. Keep business/stock catalogue writes outside this focused change. Reuse the existing `failure` error-code propagation and client-side form state. Mobile 44px link, keyboard focus, screen-reader note, admin noindex and actual API guards are required. Preserve original Korean product copy outside the new recovery text.

## Tasks

- [x] RED: extend `backend/src/admin/game-catalog-controller-guards.test.ts` to assert CSRF + recent reauthentication for season creation and updates; run and record failing result.
- [x] RED: add `frontend/src/app/admin/catalog/season-event-reauth-help.test.tsx` to assert recovery only for coded recent-auth errors, not expired login or generic errors; run and record failing result.
- [x] GREEN: add `ReauthGuard` to two existing controller mutations; create focused `SeasonEventReauthenticationHelp` and render it in `NewSeasonEventForm` and season `ToggleActive`; preserve form state and no unauthorized retries.
- [ ] Verify targeted tests, complete frontend suite, backend suite with isolated real PostgreSQL in CI, lint, typecheck, builds, API contract, security audits, and browser/API regression evidence at the final exact HEAD SHA.
- [ ] Re-fetch `main` and canonical EN/KO planning, inspect all active PRs and QA/A/B collisions, then publish independent Draft PR and bilingual worklogs. Merge and Production are blocked unless *all* exact-SHA release gates pass.
