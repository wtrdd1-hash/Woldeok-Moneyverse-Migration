# C v1321 — Hot-time evidence freshness across admin and public UI

## Before work — 2026-11-03 05:22 KST
- Source: `origin/main` f5c3fbedae1c3b3ec2374882b049aac43a655eb4; isolated `auto/hourly-c-v1321-hot-time-freshness-20261103-0515` worktree.
- Debian 13 miniPC services seven active, development PostgreSQL connected. Primary checkout has unrelated dirty OWASP work; do not touch.
- Reviewed AGENTS.md, README.md, README/README.ko.md, English/Korean living project plans, active PRs, QA and A/B worktrees, recent CI. PR #2445 covers hot-time administrator write authentication, not source freshness. No open hot-time freshness PR found.
- P1 reproduced in source: `parseHotTimeEvidence` accepts arbitrarily old `serverTime` and active items relative to that time; administrator `HotTimeManagementCard` labels these as verified, while the public banner can show a future-ending stale buff. A live HTTP fetch is not proof that the response snapshot is current.
- Backend GET `/api/v1/economy/hot-time/active` supplies `serverTime`, `hasActiveHotTime`, `activeBuffs`, and `Cache-Control: no-store`. Its repository query references `economic_hot_time_events`, which does not occur in tracked SQL migrations: source availability requires independent DB verification; do not claim hot-time operational or fabricate events.
- Design: add bounded client-side freshness verification (server time within 120s past / 30s future) layered on the existing backend envelope, reject stale/future and expired events; apply to administrator and public consumers; periodic refresh and fail-closed behavior. Keep backend source, writes and DB schema unchanged. Ensure admin controls HTTP noindex/private/no-referrer. Add RED/GREEN regression tests, isolated HTTP and DB verification.
- Release hold until all exact-SHA gates and official Test authenticated E2E pass. No main, shared DB, financial or production changes.

## In progress
- [x] RED freshness parser, UI and header tests (7 newly failing cases; 1 public banner failure; original 6 passes)
- [x] GREEN implementation and source/contract verification (18/18 focused tests; typecheck PASS; focused lint 0 errors/4 existing warnings)
- [x] Mid-run fetch: main unchanged f5c3fbedae; active PRs #2573/#2574 and B #2575 do not overlap hot-time freshness
- [ ] Full build/lint/typecheck/tests/PG/security/app-api/E2E gates

## Finished
- Pending full gates and release disposition.
