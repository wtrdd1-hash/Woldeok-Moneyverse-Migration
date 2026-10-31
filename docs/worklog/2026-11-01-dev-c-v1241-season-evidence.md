# C v1241 — Season Event and Ranking Source Evidence

## BEFORE — 2026-11-01 01:10 KST
- Source main: f13bbce273ffc65e8576170992d82ea00c27a1c9. Debian 13.6 miniPC services 7/7 active; dev DB connected. Existing root `implementation_plan.md` dirty; do not touch it.
- Reviewed AGENTS, README and README/README.ko.md, canonical English and Korean project plans, PRs #2229/#2228/#2227/#2225/#2224/#2222, CI and QA #2220, recent A/B/C changes.
- **Verified defect:** GET /api/v1/seasons/current returns `{currentSeason: ...}` in SeasonController, but /seasons treats the entire wrapper as CurrentSeasonStatus, so its reward banner receives undefined fields. Event and leaderboard responses are typed but never runtime validated; malformed/duplicate event IDs or ranks can appear as real data, including fee and points. No competing open PR targets /seasons.
- Bounded design: parse and verify owner season summary, event list and leaderboard against existing authenticated Nest API; only show valid data, distinguish empty from unavailable, never fabricate rewards. Keep financial writes/DB schema unchanged, existing server action and access controls unchanged. Responsive/keyboard/screenreader/error-state regression.
- Alternative rejected: adding new DB queries or bypassing the existing Nest authenticated API. These add unnecessary ACL/financial risk.

## PLAN
- [ ] Write failing contract tests for wrapper, malformed/duplicate events, rank validation, empty vs unavailable.
- [ ] Implement strict runtime parser and connect to /seasons without changing the backend contract.
- [ ] Add accessible retry and ensure no invalid reward/entry is displayed.
- [ ] Verify exact HEAD lint/typecheck/build/unit/integration/PG/security/app-api/E2E/CI and document blockers without overstating.
- [ ] Re-fetch main/plans at middle and before merge; preserve Draft if any required gate fails.

## IN PROGRESS
Pending TDD RED baseline.

## FINISHED
Pending.

### MID — 2026-11-01 01:13 KST
- origin/main fetched again: f13bbce273ffc65e8576170992d82ea00c27a1c9 (unchanged); English/Korean project plan heads still v1518, independent planning Draft #2224 v1576.
- TDD RED: 3 expected behavior failures / 1 pass with parser stubs; GREEN: 4 parser tests pass. Added two SSR integration cases (verified envelope, malformed event fail-closed); after fixing test harness to ignore non-string mock calls, 6/6 pass.
- Frontend Typecheck PASS; touched-file ESLint PASS. Actual API contract: SeasonController.current returns `{currentSeason: ...}`; SeasonRepository returns PG read data via `season_active_events()` and `season_event_leaderboard()`. No DB migration or grant needed.
- Replaced unsupported "final reward" banner with verified read-only current season/rank; unjournaled season reward claim remains blocked by existing Backend and server action. Invalid paid event/leaderboard responses do not render; retry links are keyboard accessible.
