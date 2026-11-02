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
- [x] Initial full gates and isolated PostgreSQL; final exact-HEAD rerun scheduled after last commit

## Finished / release decision — 2026-11-03 05:33 KST
- TDD follow-up RED: a pending public refresh retained an old LIVE badge; a stale 200 from Android app-api was forwarded as 200, public-cacheable, and a backend 503 leaked its response body. All reproduced before the respective changes. GREEN: 22/22 targeted web/admin/app-api tests, frontend Typecheck PASS.
- Fix: source age 120s past / 30s future, actual event-window check, fail-closed while refresh pending, 60s polling and visibility resume, Android app-api source verification and sanitized 503, private/noindex/no-referrer on the gateway and admin controls.
- Independent PostgreSQL 17.11: base init + 327 numbered migrations = 328 SQL files PASS; `public.economic_hot_time_events` missing in clean schema, app-role SELECT fails `relation does not exist`. Backend/DB focused 24 PASS. **Do not advertise hot-time operational.** Issue #1531 updated.
- Read-only Production `/admin/controls` HEAD returned HTTP 200 with `X-Robots-Tag: index, follow` and `Referrer-Policy: strict-origin-when-cross-origin`; Test had noindex. Candidate isolated Next HTTP: 6 routes 200 with noindex/nofollow, private/no-store, no-referrer. Candidate HTML content/auth E2E not verified (isolated server lacked internal token). Issue #2012 updated.
- First full gates on initial commit 9859c9dd8f: lint/typecheck/build PASS, frontend 2,955 PASS / 1 FAIL (test runner mistakenly exported `MONEYVERSE_NEXT_BUILD_CPUS=1`, conflicting with worker-budget test), backend 2,983 PASS / 2 FAIL / 518 SKIP (profile privacy expected 200 got 401), database 72 PASS / 5 SKIP, app-api 184 endpoints PASS, prod high audit PASS, full audit 9 moderate/low vulnerabilities, full route QA missing ledger. Bot first attempt missing worktree dependency link; rerun 11 PASS. Final exact-HEAD gates must rerun with build-only CPU override.
- Test/Production versions observed: 2dd507030dc1e461cbcf18f060260959f4c26a8f / 305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b, neither candidate. Official Test authenticated E2E, GitOps release gates and exact merged SHA are BLOCKED.
- Draft PR #2577; no main merge, no shared DB/financial writes, no Test/Production deployment or rollback. Keep all unique A/B/QA/Gemini worktrees and reservations intact.
