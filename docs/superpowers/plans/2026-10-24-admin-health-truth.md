# C v1007 — Truthful Administrator Health, 2026-10-24

## Goal and proof
The administrator API-health dashboard currently claims 100% domain success and invented latencies without endpoint probes, displays invented fallback 14 domains/8ms/99.9%, and polls backend-only URLs from the browser. The NestJS health endpoint currently lacks the admin role and elevated console guards. Replace those claims with measured DB/host telemetry, deny unauthorized readers, and route refresh through an authenticated same-origin Next handler.

## Boundaries
- No new SQL, ledger, privilege grant, backup trigger, or Production mutation.
- Backend read-only telemetry only. A successful database ping is **not** evidence of API endpoint success.
- No admin backup execution from this view; the old browser-only trigger has no supported same-origin backend route and is not verified.
- Use private no-store responses; 10s refresh is best effort and failures mark the view unavailable, never silently keep a green success indicator.

## Tasks / RED-GREEN
1. Add backend `backend/src/admin/api-health.controller.test.ts`: role + console guard, absent DB unavailable, successful measured ping, DB failure degraded; RED.
2. Add Next `frontend/src/app/api/admin/api-health/route.test.ts`: denies without elevated session, passes measured data with no-store, upstream errors 503; RED.
3. Add `frontend/src/app/admin/api-health/api-health-dashboard.test.tsx`: missing data no invented values, refresh via Next BFF, failed refresh unverified; RED.
4. Implement backend read-only telemetry without fabricated domain aggregates and add `AdminGuard`/`AdminSessionGuard`.
5. Implement same-origin Next BFF and replace dashboard with a compact verified-status client: DB ping, uptime, CPU load, memory, optional DB stats, stale/error labels; 320px, keyboard and screen-reader status. Update page copy to match measurements.
6. Run focused RED->GREEN; lint/typecheck/build/unit/contract/real PG/security/app-api/E2E where available, GitHub required CI; refresh main mid and pre-merge. All mandatory gates PASS or keep Draft/HOLD.
7. Record exact SHA, all skipped/failed gates, official Test/Production/rollback and branch preservation in English and Korean logs.

## Acceptance
- A non-admin or locked console cannot fetch health through NestJS or Next BFF.
- Only measured database/host signals appear; endpoint/domain success remains unverified.
- Poll failure visibly invalidates prior healthy state; private no-store.
- No backup or financial write and no unsupported release.
