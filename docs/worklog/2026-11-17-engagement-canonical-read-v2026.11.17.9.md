# Engagement authenticated canonical read-only edge recovery v2026.11.17.9

## BEFORE
- Owner approved completing missing features and Production promotion 2026-11-17 ~09:03 KST.
- Based on source of truth: docs/planning/PROJECT_PLAN.md, INTEGRATED_PLANNING_MASTER.md, AGENTS.md, docs/RELEASING.md. New origin/main c5e433bf35 merged OAuth cookie correction after last user turn.
- Concurrent PRs #3221 (Spring finance), #3223 (edge hold), #3225 (public KDIC portal) and active SEC1/log branch protected. Live Nginx SHA 5993467abb935d12385810a1d3bb62827dc1b9592312c49ec31e1ce7478ff95b at ~09:03 KST, incorporates KDIC v8 read bridge.
- Actual public engagement authenticated Nest backend 127.0.0.1:4500 returns 401 for anonymous GET /api/v1/engagement, /api/v1/engagement/early-game, /api/v1/engagement/dopamine/attendance/status and /api/v1/engagement/dopamine/daily-quest/status; Spring :4550 returns 200 fake engagement or 404 missing. Official Test Nest all four paths returned 401, showing auth enforcement.
- Existing Nginx v6 holds known unsafe engagement root/status aliases to 503; preserve hold on fake WLD reward endpoints and actual money writes.
- Scope only change known safe GET/HEAD read-only Nest handlers via exact edge mapping, retaining cookies/CSRF/consent. No data/schema/transaction or systemd application restarts. No claim of signed-in positive E2E before verified.
## MIDPOINT — 2026-11-17 09:06 KST
- Current main c5e433bf35 and parallel Gemini/SEC1/KDIC/log branches rechecked, no overlapping files edited.
- Versioned deterministic Nginx renderer unit tests 5/5 PASS, protected site original and candidate saved under /srv/moneyverse-data/reports/engagement-canonical-read-v2026.11.17.9/.
- Shadow Nginx :4489 real HTTP 401 for canonical authenticated member GET; unrelated routes and held commands unaffected.
- Official Test anonymous read paths 401, previous Production member reads returned 404/503.

## FINISHED — 2026-11-17 09:08 KST
- Exact baseline site SHA 5993467abb935d12385810a1d3bb62827dc1b9592312c49ec31e1ce7478ff95b; candidate syntax PASS, two gateway markers, zero-downtime graceful reload with 4s settle.
- Public and internal unauthenticated requests return canonical 401 for eight read aliases; sampled public HTTPS direct paths independently 401. KDIC admin and fake WLD/streak paths still 503, version 200.
- New live site SHA 2ff3ad42a87ef11162b106e14640e6945370e52034831272cffca3908e692c28. Protected rollback original preserved.
- No DB/ledger/WLD mutation or app server restart. Full signed-in positive E2E and Spring platform promotion remain unverified and held.
