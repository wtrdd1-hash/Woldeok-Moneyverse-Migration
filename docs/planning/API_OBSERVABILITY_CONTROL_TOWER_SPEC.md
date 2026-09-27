# API Observability Control Tower Specification

**English canonical** | [한국어](API_OBSERVABILITY_CONTROL_TOWER_SPEC.ko.md)

> Version: v2026.09.27.468
> Status: PLANNING / P0 release-gate authority
> Applies to: every release-candidate HTTP API surface, BFF/API gateway surface, privileged control-plane endpoint, external integration endpoint, infrastructure probe, and separately inventoried realtime transport
> Runtime/Test/Production claim: none in this planning cycle

## 1. Purpose and non-negotiable rule

The administrator API-health page must become an evidence-backed operational control tower, not a presentation of locally invented numbers. Every displayed count, health state, latency, success rate, availability statement and decommissioning statement must be derived from an exact-source inventory and fresh runtime evidence tied to the exact release SHA.

**No data is not healthy. Stale data is not real time. A hard-coded or random number is not telemetry. An endpoint omitted from a curated catalog is not thereby decommissioned.**

This specification supplements the existing API parity contract in PROJECT_PLAN v397, full-route QA in v442, administrator responsive gate in v440 and server-authoritative control-state rules in v441.

## 2. Current start-SHA findings that require remediation

The following are observations from origin/main 8493d69e2283bf6526b52752ea2242b707160830 at the start of v468. They are not claims about a future fixed runtime.

| ID | Severity | Observed condition | Required disposition |
|---|---|---|---|
| OBS-468-01 | P0 | frontend admin API-health page uses a local 14-domain constant. The listed endpoint counts total 89 while the copy claims 300+ APIs. | Remove local truth. Render a server-derived exact-SHA inventory and measured telemetry. |
| OBS-468-02 | P0 | backend admin API-health controller repeats fixed domain counts, fixed latency values, fixed 100% success and global HEALTHY. | Replace synthetic constants with measured data and explicit freshness/coverage states. |
| OBS-468-03 | P0 | A diagnostic controller scan found 333 HTTP decorators, 328 unique method/path pairs and 30 top-level prefixes. This differs materially from the curated 89-endpoint dashboard denominator. | Generate the authoritative manifest from source/build metadata; do not adopt the diagnostic regex count as a permanent constant. |
| OBS-468-04 | P0 | Current source still contains casino route decorators while the dashboard/catalog says casino endpoints are completely removed. | Reconcile source, feature/legal policy and lifecycle state. Source-present routes cannot be labelled decommissioned. |
| OBS-468-05 | P0 | The API-health controller shows session/auth/consent/CSRF guards but no explicit administrator guard in the observed source. | Restrict operational telemetry to an explicit administrator control-plane boundary; prove negative authorization tests. |
| OBS-468-06 | P0 | frontend telemetry-pulse contains fixed economic values and random 3-second latency changes described in-source as virtual telemetry. | Prohibit fabricated Production telemetry; use real observations or visibly labelled demo fixtures outside Production. |
| OBS-468-07 | P1 | API_CATALOG_MASTER and the mobile contract represent different subsets from backend source. | Keep each contract scope explicit and reconcile them to the generated manifest rather than treating any subset as all APIs. |
| OBS-468-08 | P0 | API_CATALOG_MASTER states an internal backend port of 3001 and generic /api/v1 proxy wording, while CURRENT_RUNTIME_BASELINE records Production backend/frontend as 3000/3001 and Test as 3100/3101. | Derive deployment identity/exposure from runtime configuration and generated edge/BFF inventory; never hard-code a stale port or imply an unverified public backend prefix. |

## 3. Exhaustive inventory contract

### 3.1 Source-derived manifest

Every exact release candidate must generate a machine-readable API manifest before Test deployment. At minimum it inventories:

1. NestJS controller routes with HTTP method, normalized route template, controller/method owner and source location.
2. Next.js route handlers and BFF/gateway routes, including app-api forwarding policy and server-only proxy boundaries.
3. External integration/webhook endpoints, including exact-match public integration paths.
4. Infrastructure health/readiness/liveness probes.
5. Realtime transports such as Socket.IO/WebSocket as a separate transport inventory with namespace/event contracts rather than pretending they are REST endpoints.
6. Redirect/alias routes that materially affect clients, including app-safe aliases.
7. Feature-disabled, deprecated, compatibility and source-present-but-blocked endpoints. They remain in the manifest until source removal is proven.

The manifest records releaseSha, generatedAt, generator version, manifest schema version and a deterministic manifest hash. Method + normalized route template + transport is the stable route identity. Dynamic IDs, query values and user data never create new route identities.

### 3.2 Required classification

Every discovered route has exactly one access class and one lifecycle state.

Access classes: PUBLIC, MEMBER, ADMIN, INTEGRATION, INTERNAL, PROBE.

Lifecycle states: ACTIVE, FEATURE_DISABLED, DEPRECATED, SOURCE_PRESENT_BLOCKED, DECOMMISSIONED.

DECOMMISSIONED is valid only when the exact candidate contains no executable route for that identity and compatibility/edge rules cannot reach it. A feature flag returning a refusal is FEATURE_DISABLED or SOURCE_PRESENT_BLOCKED, not decommissioned.

### 3.3 One-to-one coverage invariant

For the exact candidate:

**discovered manifest routes = classified routes = telemetry-registry routes = QA-ledger routes**

Any unexplained count difference, duplicate route identity, unclassified route, uninstrumented active route or undocumented edge alias is a P0 coverage defect. Curated product-domain counts may be shown as a view over the full manifest, never as the denominator of all APIs.

## 4. Telemetry truth model

### 4.1 Passive runtime measurements

For every active route collect request/response count, response-class counts, timeout/cancellation/abort count, a duration histogram sufficient for p50/p95/p99/max, in-flight concurrency where supported, rate-limit/rejection counts, dependency-failure attribution where identifiable, last observed/last success/last server failure timestamps, exact release SHA/service instance/environment, and sanitized sampled correlation identity.

Business validation failures and authorization denials are reported separately from server availability. Expected 4xx traffic must not be converted into a fake backend outage, while 5xx and timeouts cannot be hidden inside an overall request-success percentage.

### 4.2 Active probes

Synthetic probes are a second evidence channel and must not be blended invisibly into passive traffic metrics.

- Production probes are read-only or explicitly side-effect-free.
- Financial, account, moderation, treasury, inventory, market-order and other mutations are never periodically executed against real Production users or money merely to make a green health light.
- Mutation coverage runs in isolated Test using deterministic fixtures, idempotency keys and cleanup/reconciliation evidence.
- Public/member/admin/integration paths use the correct authentication boundary; a public probe cannot prove an authenticated route works.

### 4.3 Dependency health

API status separately reports the state of PostgreSQL, required caches/queues, external identity providers, media/object storage, outbound integrations and other critical dependencies actually used by each route. One healthy route cannot mask a dependency failure affecting another route.

## 5. Freshness and false-green prevention

Every aggregate and endpoint row exposes the observation window and lastUpdatedAt. Data quality is exactly one of FRESH, STALE, NO_DATA, PARTIAL, UNKNOWN.

Only complete FRESH data can contribute to an unqualified healthy aggregate. STALE, NO_DATA, PARTIAL or inventory mismatch must be visible and must never be converted to 100%, 0 ms or OPERATIONAL by a frontend fallback.

The dashboard displays at least: discovered routes, active routes, instrumented routes, routes with fresh observations, disabled/deprecated/source-present-blocked routes, unknown/uninstrumented routes and manifest/telemetry coverage percentage.

A 100% healthy label is permitted only when the denominator is the complete exact-candidate active inventory and every member has fresh evidence for the displayed window.

## 6. SLO and error-budget contract

Every active route is assigned to a versioned service tier with an explicit availability SLO, latency objective and measurement window. Numeric thresholds are configuration/policy, not UI constants.

Before a threshold becomes a Production release criterion it advances through **TEST_TARGET -> BASELINED -> APPROVED_SLO**.

The implementation must support at least 5-minute, 1-hour, 6-hour, 24-hour and rolling multi-day views. Burn-rate alerting uses a fast and a slow window so isolated noise does not page unnecessarily while severe outages are detected quickly.

Authentication, ledger, wallet, security, administrator-control and other release-critical routes cannot be Production-eligible with an undefined service tier.

## 7. Security, privacy and audit boundary

Operational telemetry is privileged data.

- Admin API-health routes require explicit administrator authorization in addition to normal session/authentication/consent, plus the administrator console-session boundary where the project uses it.
- Sensitive security drill-downs may require recent reauthentication/step-up under existing administrator policy.
- Negative tests cover guest, ordinary member, expired admin session, insufficient role and CSRF where a mutation exists.
- Metrics/logs/traces never record passwords, session cookies, CSRF tokens, OAuth secrets, internal API tokens, authorization headers or full request bodies.
- Route templates are logged instead of raw dynamic identifiers. User IDs, IPs and arbitrary query strings are excluded from metric labels.
- Error exemplars are sanitized and access follows retention/audit policy.
- The observability path gains no direct economic-table write authority.

## 8. Administrator control-tower UX

The overview must answer four questions without opening source code: what exists, what is actually observed, what is failing/degrading, and what changed between releases.

Required drill-down fields include method, route template, access class, lifecycle state, owning module, SLO tier, request volume, p50/p95/p99, server error rate, timeout rate, last success/failure, freshness, dependency state, current release SHA and sanitized trace/error exemplars where available.

Filters cover domain/module, method, access class, lifecycle, health/data-quality state and release. Sorting exposes worst error budget, highest p99, highest 5xx/timeout rate and unknown coverage.

The v440/v442 responsive contract applies: no page clipping, critical values readable at mobile widths, intentional local scrolling or card reflow for wide data, and accessible controls.

## 9. Alerting and incident workflow

Alerts cover critical-route error-budget burn, sustained p95/p99 regression, 5xx/timeout surge, dependency failure, telemetry ingestion outage/stale/no-data, exact-source manifest versus telemetry-registry drift, unexpected route addition/removal/access-class change, source-present routes labelled decommissioned, and administrator/integration authorization regression.

Each alert records environment, release SHA, route/group, first/last occurrence, window, current value, threshold/policy version, evidence links and acknowledgement/resolution state. Duplicate symptoms should be grouped by incident/correlation identity where possible.

## 10. Retention, cardinality and cost controls

Metrics use bounded labels such as route template, method, service, environment, release and coarse result class. User IDs, raw URLs, free-form errors and request payloads are forbidden metric dimensions.

High-volume traces may be sampled, but error/security failures retain policy-defined evidence sufficient for incident analysis. Sampling, aggregation and retention configuration are versioned and visible so operators can distinguish healthy from sampled-away evidence.

## 11. Test and release acceptance

A candidate cannot be promoted merely because health returns 200 or the overview looks green. Test acceptance requires:

1. generate and hash the exact-candidate route manifest;
2. classify 100% of discovered routes by access and lifecycle;
3. reconcile active routes 1:1 with the telemetry registry;
4. prove fresh passive telemetry and safe active probes;
5. run route-class authorization negatives, especially admin and integration;
6. exercise deterministic mutation APIs in isolated Test, including relevant idempotency/concurrency/error paths;
7. inject dependency failure, telemetry staleness/no-data and a controlled 5xx to prove degraded/unknown instead of false green;
8. prove deploy SHA, manifest SHA and runtime identity agreement;
9. run required administrator responsive/full-route QA under v440/v442;
10. re-read latest planning authority and origin/main before merge/promotion.

Production promotion, when implementation exists, uses the project zero-downtime release procedure and exact merged SHA. Post-promotion verification confirms old authenticated sessions still work, critical reads work, metrics flow for the new SHA, coverage does not regress and no new fatal/5xx spike exists. Failure triggers rollback under normal release policy.

## 12. Ordered implementation sequence

- v468-01 — build exact-source API/realtime/BFF manifest generator and drift report; classify every discovered route.
- v468-02 — implement bounded-label request metrics, histograms, freshness/data-quality and dependency attribution; remove synthetic/random Production telemetry.
- v468-03 — harden administrator authorization for telemetry and add negative security tests.
- v468-04 — implement server-derived overview, endpoint drill-down, filters, release comparison and alert evidence.
- v468-05 — reconcile API_CATALOG_MASTER, mobile contract, BFF allowlist and decommissioned/disabled claims against the generated exact-SHA manifest.
- v468-06 — deploy exact candidate to isolated Test and execute coverage, failure-injection, authorization, mutation and responsive/full-route QA gates.
- v468-07 — re-fetch/re-read latest origin/main and planning authority; reconcile concurrent work and repeat affected verification.
- v468-08 — after merge, zero-downtime promote the exact merged SHA only if all blockers are closed; run post-promotion session, identity, health, error-rate and telemetry-flow checks.

## 13. Acceptance evidence schema

Every release record retains exact source/merged/runtime SHA, manifest schema/generator version/count/hash, counts by access/lifecycle/coverage/data-quality state, SLO policy and windows, Test identity and fixture IDs, authorization-negative results, failure-injection/staleness/no-data results, responsive/full-route QA evidence, pre/post promotion session-continuity evidence, and alert/rollback decision with unresolved exceptions.

No status advances to TEST_VERIFIED or PRODUCTION_VERIFIED without corresponding exact-SHA evidence.
