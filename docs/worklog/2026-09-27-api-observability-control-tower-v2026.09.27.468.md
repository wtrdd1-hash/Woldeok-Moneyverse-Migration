# API observability control-tower planning worklog — v2026.09.27.468

**English canonical** | [한국어](2026-09-27-api-observability-control-tower-v2026.09.27.468.ko.md)

- Status: COMPLETE
- Scope: strengthen the administrator API health/telemetry plan into exhaustive source-derived coverage with real measurements, explicit security boundaries, alerting, drill-down evidence, and release gates.
- Runtime/Test/Production: planning/documentation cycle only. No runtime code, Test promotion, or Production deployment is claimed.
- Branch: `plan/api-observability-control-tower-v2026.09.27.468`
- Start `origin/main`: `8493d69e2283bf6526b52752ea2242b707160830`

## Pre-work record

- Read the documentation authority policy, catalog, index, authoritative project plan and integrated planning master before editing.
- Current UI source labels the page as “real-time” and “300+ REST APIs” but renders a local 14-domain constant totaling only 89 endpoints.
- The backend `admin/api-health/status` endpoint duplicates the same hard-coded domain counts, latencies, success rates and 100% health instead of measuring live traffic.
- A source scan of current backend controllers found 333 HTTP method decorators, 328 unique method/path pairs and 30 top-level prefixes; this is diagnostic evidence only and must be replaced by an authoritative generated inventory in implementation.
- Current source still contains casino routes even though the page copy says casino endpoints are completely decommissioned; deprecation/disabled/blocked routes therefore need explicit inventory state instead of disappearance from telemetry.
- The new plan must prohibit fabricated telemetry and must treat inventory mismatch, unclassified endpoints, stale samples, auth gaps and false-green status as release blockers.

## Planned sequence

1. `v468-01` inventory all API/control-plane sources and relevant maintained docs.
2. `v468-02` define exhaustive inventory, measurement, SLO/error-budget, security, drill-down and alert contracts.
3. `v468-03` integrate the P0 directive into PROJECT_PLAN and INTEGRATED_PLANNING_MASTER in EN/KO.
4. `v468-04` create detailed EN/KO specification, public update and internal update.
5. `v468-05` re-read latest `origin/main`, reconcile concurrent changes, validate links/parity/diff, then commit and publish the branch.

## Mid-work and final record

- Mid-work origin/main recheck: 8493d69e2283bf6526b52752ea2242b707160830; no concurrent drift.
- Final pre-commit origin/main recheck: 8493d69e2283bf6526b52752ea2242b707160830; no concurrent drift.
- Repository-wide targeted inventory found 119 source/document files matching API-health, catalog, 14-domain, telemetry or decommissioning terms; maintained authorities and directly relevant runtime source were reconciled in this cycle.
- Current API catalog was demoted from a false exhaustive/100%-verified claim to AUTHORITY_DRIFT pending generated-manifest reconciliation. Runtime baseline port/edge drift and source-present casino lifecycle drift are now explicit.
- Validation: git diff --check passed; changed-Markdown relative-link scan reported 0 broken links; all six newly maintained EN/KO document pairs exist.
- Scope guard: all changed paths are documentation. No runtime code, Test server, database, or Production process was modified.

## GitHub integration checkpoint

- Pull request #743 was opened from this branch and is mergeable at the Git level.
- CI classify passed. CI policy is blocked by a pre-existing secret-scanner hit in backend/src/seo/seo.service.test.ts on the base main SHA: a test fixture contains a literal PRIVATE KEY block marker.
- That backend test file is unchanged by v468; git diff against origin/main for it is empty. This planning PR does not bypass the failed required check or mutate unrelated runtime/test code.
- Main integration therefore remains BLOCKED until the base policy defect is repaired in its own correctly tested change, after which this branch must re-fetch main and rerun required checks before merge.
