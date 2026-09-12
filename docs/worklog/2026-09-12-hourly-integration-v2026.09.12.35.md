# Hourly integration/development audit — v2026.09.12.35

## Current baseline
- Application main observed at audit start: `a89e97b818fe4e12060aef9855b8a6df52721756`.
- Infrastructure main: `fcfc899ffe7edc6397ed3f52b33f07499f802e4c`.
- Living Project Plan was read before work and re-read mid-work; P1 Economy/event calendar remains explicitly listed.

## Development completed this run
- Created `integrate/event-calendar-v2026.09.12.35` from current main.
- Restored authenticated `/calendar` using existing season, daily-event, and weekly-goal read APIs.
- Added `/calendar` to member navigation and grouped Activity navigation.
- Opened replacement PR #195. No DB or economy mutation was added.

## Runtime branch classification
- Active/replacement validation: PR #189 Economy Scenario Lab, PR #195 Event Calendar, PR #164 Business Settlement Boost, PR #165 Trusted Client IP, PR #160 Admin edit-state refresh.
- Active documentation/planning: PR #190 authentication-security priorities and PR #192 casino-system spec; preserved because they are not yet proven redundant.
- Superseded: PR #169 original Economy Scenario Lab closed in favor of #189; PR #162 original Event Calendar closed in favor of #195.
- Integrated/superseded refs confirmed safe to delete when a deletion-capable host returns: `feat/economy-scenario-lab-v2026.09.12.14`, `test-candidate/economy-scenario-lab-v2026.09.12.14`, `integrate/economy-scenario-lab-sync-v2026.09.12.30`, `integrate/economy-scenario-lab-v2026.09.12.28`, `feat/event-calendar-v2026.09.12.8`, plus the duplicate `docs/integrate-auth-*` refs at `10d8782f4bfd21bfcbd70c447cbcf28342487f74` after confirming that commit is an ancestor of current main.
- Other old documentation branches are preserved until their unique content/squash-merge equivalence is proven; no destructive cleanup is claimed without that proof.

## Infrastructure
- `kuber-infrastructure` has only `main` and active draft branch `feat/v2026.09.12.1-auto-db-backup` (PR #22).
- PR #22 remains useful active work, blocked from merge by missing non-production evidence for dump + checksum publication, persisted-backup restore, and backend health.

## Cleanup blocker
The GitHub connector in this session does not expose remote-ref deletion. All authorized Remote Desktop devices (`debian13`, `minipc`, `weoldog`) were offline during this audit, so the confirmed superseded refs above were not deleted. This is a cleanup blocker, not a reported deletion success.

## Validation/deployment evidence
- Replacement Economy Scenario Lab PR #189 exact head `06fa168597f45833b7a966a9bd6014418b669cb2`: CI run #576 completed successfully.
- Event Calendar PR #195 exact head before this audit-note commit was `37ac9f873a073c775b81e37ac561f99d12dc8fb4`; its CI run #606 was queued at last check and therefore not counted as PASS.
- Latest observed main Production-release workflow for `a89e97b8...` was skipped; no Production deployment is claimed.
- Exact-SHA isolated Test runtime verification was unavailable from the offline authorized hosts. No runtime PR was merged or promoted.

## Next priority
1. Complete #195 CI and exact-SHA Test gate.
2. Re-home #164 Business Settlement Boost onto current main because it fixes a confirmed PostgreSQL runtime defect.
3. Re-home #165 Trusted Client IP hardening.
4. Re-home #160 Admin edit-state refresh.
5. Then continue missing P1/P2 runtime work: Stock-tagged Community, Stock Comparison, Conditional Alerts, Account Security Center, Personal Dashboard, Portfolio Analysis.