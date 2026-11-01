# C v1276b — Admin API-health source-evidence validation (English canonical)

## Start — 2026-11-01 23:20 KST
- Base: origin/main `3d5e321c3d1221febff677469fecdfcb3cf42e7d`; isolated `auto/hourly-c-api-health-evidence-v1276b-20261101-2320` worktree.
- Read AGENTS.md, README + Korean guide, English/Korean planning, 135 open PRs, A/B/QA records and CI. No open PR covers admin API-health telemetry response verification.
- P1: admin API-health SSR and 10-second browser refresh trust `apiOrNull<ApiHealthResponse>` / `res.json()` TypeScript assertions. `domains.map`, `sampleEndpoints.map`, `successRate.toFixed` can throw on malformed upstream, and `isLiveTelemetry=true` / fabricated success-rate may be shown as measured despite Backend contract explicitly returning unmeasured route metrics. Backup inventory likewise bypasses existing `parseBackupInventory`.
- Scope: strict runtime source parser for current unmeasured route contract, both SSR and refresh, reject inconsistent count/metrics/duplicate domains/nonfinite telemetry; validate backup inventory with existing parser. Fail closed to unmeasured and distinct unavailable status; retain admin guard, noindex, responsive layout and keyboard refresh.
- No new API/DB grants or writes. Backend `/api/v1/admin/api-health/status` is existing measured DB-only contract. Validate with TDD and full gates; hold PR and release until all PASS.

## Checklist
- [x] Start/PR/CI/source review, isolated worktree
- [ ] RED regression
- [ ] GREEN runtime validation
- [ ] Intermediate main/plan check
- [ ] Exact-SHA gates and PR
- [ ] Final release decision
