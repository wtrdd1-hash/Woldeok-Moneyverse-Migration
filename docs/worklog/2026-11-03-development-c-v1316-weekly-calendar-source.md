# Development C v1316 — Weekly calendar source integrity

## BEFORE WORK — 2026-11-03 02:31 KST
- Host: Debian 13.6 miniPC; 7 services active; DEV PostgreSQL connected.
- Authority: `origin/main` `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`; AGENTS, README English/Korean, canonical PROJECT_PLAN English/Korean reviewed. Main checkout has another agent's uncommitted security changes; do not touch.
- Active coordination: PR #2318 covers *season event* calendar (overlapping page file), #2559 progression stage, #2557 backend release ACL, #2561 announcements, #2560 planning support; avoid their feature scopes and preserve their branches. Current latest QA #2525 is IndexNow test isolation.
- P1 proof: `/calendar` trusts the TypeScript `EarlyGameBoard` assertion for GET `/api/v1/engagement/early-game`; `earlyGame?.goals ?? []` reports a legitimate empty schedule when a malformed HTTP 200 omits goals; inconsistent or stale week dates can yield a fabricated weekly reset timestamp. SQL migration 101 returns `week_start` KST Monday and canonical goal rows, already read through an authenticated SECURITY DEFINER function.
- Scope: validate only the member weekly reset calendar read, keep the season event and shop feeds untouched; no database writes or migration, no new endpoint. Fail closed with an accessible retry. KST current-week verification, exact counts, noindex/private behavior unchanged.
- Deployment: HOLD pending all required gates, exact-SHA official Test and authentication E2E.

## IN PROGRESS
- [ ] TDD RED for malformed, conflicting, stale and legitimate empty weekly goal source.
- [ ] Implement bounded fail-closed parser and SSR state, keyboard retry.
- [ ] Exact-SHA focused and repository gates; mid-main refresh and final provenance.

## FINISHED
Pending.

### MID — 2026-11-03 02:35 KST
- TDD RED confirmed: 3 behavioral failures (valid, verified empty, lifetime count), 1 SSR false-empty failure, 1 unbounded bigint failure; GREEN focused 12/12 tests including existing shop deadlines.
- Added strict bounded weekly-goal parser and accessible retry. Existing Nest owner-scoped `early_game_weekly_goals` migration 101 unchanged; no fake client data or WLD writes.
- Mid-run fetch: `origin/main` still `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`. Overlap warning: PR #2318 edits calendar page for separate season feed; do not merge until semantic integration.
