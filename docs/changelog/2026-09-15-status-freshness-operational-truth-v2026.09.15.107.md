# v2026.09.15.107 — Status freshness & fail-closed operational truth

## Research decisions

- Kubernetes current liveness/readiness/startup probe docs — **DIRECT OPERATING PRINCIPLE**: readiness is continuously evaluated; inability to prove readiness must not be represented as ready/healthy. https://kubernetes.io/docs/concepts/workloads/pods/probes/
- Google Cloud Monitoring missing-data / metric-absence docs — **DIRECT MONITORING PRINCIPLE**: absence of fresh telemetry is a distinct monitoring condition, not implicit health. https://docs.cloud.google.com/monitoring/alerts/policies-in-json
- OWASP API Security Top 10 / API4 — **DIRECT SECURITY BASELINE** for resource-abuse and external-service budgets. https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/
- PostgreSQL backup/PITR and CISA backup guidance — **CARRIED DIRECT ADOPTION** for BAK-106-01; no relaxation.
- Google Search Central/Naver Search Advisor — **CARRIED DIRECT ADOPTION**; transient `/status` remains public but noindex.
- FTC 2026 subscription enforcement/rulemaking — **CARRIED PRODUCT GUARDRAIL** for future recurring billing; no new payment implementation was approved.

## New P0 — OPS-107-01

Fresh Production `/status` at 2026-09-15 07:05 KST displayed `모든 서비스가 정상입니다.` while Web, economy API and ledger DB were all observed at 04:06 KST. The page also states a 30-second collection interval and promises older records are shown as checking.

Repository comparison found a stronger contradiction: migration `013-content-and-status.sql` contains per-source `stale_after_seconds` and `content_public_status()` converts stale snapshots to `unknown`. Frontend, however, trusts the API state and hard-codes the 30-second explanatory copy. Runtime therefore violates the repository freshness contract. Root cause is not guessed; Production DB function/config, migration parity, deployed SHA, raw API/cache and collector heartbeat must be read-only inspected.

## Required development/QA backlog

1. Capture raw Production/test `/api/v1/status`, exact backend/frontend SHA/digest, DB clock, latest source snapshot and source freshness config.
2. Compare Production `pg_get_functiondef(content_public_status)` and migration checksum against `main`.
3. Inspect collector last-attempt/last-success/schedule/logs and separate collector failure from monitored-service failure.
4. Make one server-side per-source freshness contract authoritative. Collection interval and stale threshold are separate values; public UI may not hard-code a conflicting threshold.
5. Stale/missing required sources fail to `unknown/checking`; overall cannot remain operational. Collector absence becomes `monitoring delayed/checking`, not a fabricated outage or healthy state.
6. Do not allow healthy cache/stale-if-error to outlive the approved stale threshold.
7. Add DB boundary tests (`-1/0/+1s`), source-specific threshold, no snapshot, future timestamp, stopped collector, API/DB/cache outage, restart, mixed states, forged-writer denial and exact-SHA E2E.
8. Promotion acceptance: stopping synthetic collection must make public API/UI unknown within threshold, trigger monitoring and recover only after a fresh trusted snapshot.

Applied migration history remains immutable; any authoritative DB-function/config correction uses a new migration/config change and normal release evidence.

## Carried blockers

- `BAK-106-01` P0: issue #139 remains open; current independent restore proof unavailable.
- `AUTH-105-01` P0: fresh privacy/guide remain OAuth-centric while local-auth code exists.
- `QA-104-01` P0: fresh guide still claims unlimited full profession-work rewards.
- `REL-104-02` P0: current Production-ready workflow proves exact SHA/catalog/noindex but not all migration/auth/economy/restore/rollback evidence.
- `AUTH-105-02`, `REL-104-03` P1 remain open/TODO.

## SEO / security / business

- `/status` is explicitly `PUBLIC_NOINDEX`, sitemap-excluded and public-safe; transient operational truth is not acquisition content.
- New HIGH threat: stale/forged operational health. Trusted status writer, server freshness, collector heartbeat, cache expiry and deployment/migration parity are mandatory controls. Any false-green state blocks status-dependent release automation.
- Status direct revenue is zero. Business value is lower MTTR/support/trust loss; `stale_operational_violation_count` must be zero.

## Integration

English and Korean `PROJECT_PLAN` were synchronized to v2026.09.15.107. This change is documentation/planning only; no runtime code, DB, collector, infrastructure, secrets, branch rules or backup medium were changed.
