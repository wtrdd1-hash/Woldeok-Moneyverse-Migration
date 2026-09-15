# 2026-09-15 — Status freshness / operational-truth audit v2026.09.15.107

## Scope and mandated sequence

1. External research first: current Kubernetes health/readiness guidance, Google Cloud Monitoring missing-data/metric-absence behavior, OWASP API Security resource-abuse guidance, plus carried PostgreSQL/CISA recovery, Google/Naver SEO, PIPC privacy and FTC subscription references.
2. Latest GitHub/main/runtime/QA comparison: starting `main` `2201b812716d78303388bb838258220a5033d694`; read current EN/KO integrated plans, open issues, status/frontend/backend/DB migration code and release workflow; fresh Production `/status`, `/guide`, `/privacy` were checked.
3. Detailed planning: added `OPS-107-01` P0 and concrete frontend/backend/API/DB/collector/cache/security/monitoring/SEO/business/QA/release/rollback contract; carried existing blockers and whole-feature contract matrix.
4. Mid-run `main` recheck: latest remained `2201b812716d78303388bb838258220a5033d694` before documentation writes; no concurrent external commit was observed.
5. Integrated EN canonical and KO second-language plan to v2026.09.15.107; created EN/KO changelog and worklog. Runtime code was not changed.

## Fresh external references and decisions

| Reference | Date/freshness checked | Decision | Moneyverse application | Difference/risk |
|---|---|---|---|---|
| Kubernetes — Liveness, Readiness and Startup Probes | checked 2026-09-15, current official docs | DIRECT OPERATING PRINCIPLE | Treat inability to prove service/monitor readiness as non-healthy; health signals are periodically re-evaluated. | Public status page is not Kubernetes readiness itself; only the fail-honest operational principle is adopted. |
| Google Cloud Monitoring — metric absence / missing data | checked 2026-09-15, current official docs | DIRECT MONITORING PRINCIPLE | Explicitly model missing/stale monitoring data and collector heartbeat rather than interpreting silence as green. | Moneyverse retains its own source-specific thresholds and public-safe copy. |
| OWASP API Security Top 10 2023 — API4 Unrestricted Resource Consumption | current official OWASP | DIRECT SECURITY BASELINE | Rate/resource budgets for auth/provider/status-monitor paths and expensive queries. | Does not prescribe Moneyverse numeric limits; measurements/config remain authoritative. |
| PostgreSQL backup/PITR docs | current official docs, carried | DIRECT where applicable | Continue manifest/checksum/WAL + full restore requirements for BAK-106-01. | Status-freshness work does not relax DR blocker. |
| CISA StopRansomware | current official guidance, carried | DIRECT RESILIENCE GUIDANCE | Independent encrypted backups + regular recovery testing. | General resilience guidance, not product-specific certification. |
| Google Search Central / Naver Search Advisor | current official guidance, carried | DIRECT | `/status` public access but noindex; public SEO remains canonical/sitemap/privacy-safe. | Status is transient operational content, not acquisition inventory. |
| Korea PIPC privacy-policy materials | current official regulator guidance, carried | DIRECT DISCLOSURE DESIGN | Preserve AUTH-105-01 until actual local-auth processing and public disclosure match. | Legal applicability details require implementation-specific review. |
| FTC 2026 subscription enforcement/rulemaking | 2026 official material, carried | REFERENCE + PRODUCT GUARDRAIL | Future recurring billing requires clear terms, affirmative consent, easy cancellation. | No claim of universal US jurisdiction; no real-money billing implementation approved this run. |

## GitHub / QA / runtime evidence

### Repository and CI

- Starting/mid-run main: `2201b812716d78303388bb838258220a5033d694` (v106 docs).
- Connected combined status for that SHA returned no individual statuses; workflow-run lookup returned no runs. Result: `verification unavailable`, not pass/fail.
- Branch-protection detail endpoint returned integration access denied; v107 therefore does not claim required checks are enforced and keeps `REL-104-03` open.
- `.github/workflows/deploy.yml` currently pins referenced GitHub Actions to immutable commit SHAs and enables production-image provenance/SBOM. The `test-gate` verifies test exact SHA, public shop catalog and root noindex before `production-ready`; it does not directly prove the complete normative migration/auth/economy/restore/rollback evidence, so `REL-104-02` remains P0.
- Open issues relevant to release/recovery remain: #139 backup SSD/read-only backup gate; #127 required CI checks; #126 historical Kubernetes deployment-contract issue; #129 supply-chain hardening. Issue state alone is not proof of runtime state.

### Fresh Production runtime

At 2026-09-15 07:05 KST `/status` rendered:

- overall: `모든 서비스가 정상입니다.`
- web: observed 04:06 KST, normal
- economy API: observed 04:06 KST, normal
- ledger DB: observed 04:06 KST, normal
- page copy: collection interval 30 seconds; older records should display `확인 중`

This is internally inconsistent by roughly three hours and triggered `OPS-107-01`.

Fresh `/guide` still contains:

- `일일 횟수 제한 없이 반복하고 매번 전액 WLD·EXP 보상 획득`
- later repeated unlimited full-reward wording
- Discord/Google-only login and `따로 비밀번호를 만들지 않아요`

Therefore `QA-104-01` and `AUTH-105-01` remain open.

Fresh `/privacy` remains public version 2026-09-02 and describes OAuth login/provider identifiers but does not disclose local email/password/verifier processing; `AUTH-105-01` remains a public-rollout blocker.

### Status implementation evidence

- `frontend/src/app/status/page.tsx`: 30-second page revalidation, fetches `/api/v1/status`, trusts returned state, and hard-codes a 30-second user-facing collection/freshness explanation.
- `frontend/src/lib/status.ts`: invalid/unrecognized status falls back to `unknown`; it does not calculate age.
- migration `013-content-and-status.sql`: `content_status_sources.stale_after_seconds`, initial sample 180 seconds, trusted snapshot writer, and `content_public_status()` converting stale rows to `unknown`/null detail/null observed_at.
- backend content service validates consistency but does not independently recompute freshness; repository delegates public status to the DB function.

Conclusion: the runtime result violates the repository’s intended stale-state contract. Root cause is not proven by repository inspection alone.

## OPS-107-01 detailed QA → development handoff

**Severity/Priority:** HIGH operational-truth risk / P0 release blocker for status-dependent promotion.

**First/recent reproduction:** 2026-09-15 07:05 KST in this run.

**Affected users/functions:** all visitors relying on `/status`, support/operations, any future deployment automation or incident workflow using public status as health proof.

**Root-cause status:** UNKNOWN. Required evidence collection precedes mutation.

**Frontend target:** remove conflicting hard-coded freshness semantics; render server-derived freshness; fail closed on stale/missing/API error; ensure overall headline cannot stay healthy with required unknown source; preserve accessible labels and time semantics on mobile/desktop.

**Backend/API target:** define a public-safe freshness contract (`freshness` and/or `ageSeconds`/`staleAfterSeconds`) from server authority; errors must not serve expired-green semantics; cache directives must respect freshness.

**DB target:** read-only inspect Production function/config/checksum first. If correction is needed, add a new immutable migration/config change; do not edit migration 013. Validate DB clock, source configuration, latest snapshot and writer permissions.

**Collector/infra target:** expose safe heartbeat metrics for last attempt/success; alert on missed collection; separate collector failure from target outage; no Production topology/secrets in public response.

**Migration need:** unknown until Production parity inspection. A historical applied migration is never rewritten.

**Rollback:** last-known-good immutable app/config target; forward-only DB corrective migration if DB behavior changes; rollback must leave status unknown rather than falsely green when freshness cannot be proven.

**Mandatory tests:** unit status ordering/freshness; DB threshold -1/0/+1 sec; source-specific thresholds; no snapshot; future timestamp rejection; collector-stop; cache expiry; API/DB outage; restart; mixed operational/degraded/outage/maintenance/unknown; forged writer/app-role write denial; public-detail leak; frontend SSR and accessibility; exact-SHA isolated E2E.

**Test-server acceptance:** exact candidate SHA; synthetic source initially fresh; stop collector; within approved threshold API/UI become unknown/checking and alert triggers; resume trusted collector; only fresh snapshot restores healthy; test remains noindex/ads-off.

**Production promotion:** CI/release evidence available; migration parity proven; collector heartbeat observable; Production smoke repeats freshness test non-destructively or via approved synthetic source; no stale-green violation during observation window.

**Monitoring:** source age, collector last success age, unknown source count, status API errors, stale-operational violations. Any stale-green violation pages operator and invalidates status-dependent release success.

**State:** TODO/OPEN. **Owner sequence:** read-only runtime/DB/collector diagnosis → backend/DB contract decision → frontend copy/render contract → tests → isolated exact-SHA → release evidence → Production smoke.

## SEO / security / business / growth impact

- SEO: `/status` is public-noindex and excluded from sitemap. Do not create thin incident/status SEO pages. Other public content keeps canonical/structured-data/privacy constraints from the integrated plan.
- Security: status writer remains non-browser trusted path; app role cannot declare health. Avoid topology, DB names, internal endpoints, credentials and private user/economy state in public status or alerts.
- Abuse: forged healthy snapshots, replayed timestamps and stale cache are security/operational abuse cases; writer authorization and timestamp bounds remain mandatory.
- Business: status direct revenue = 0. Evaluate avoided expected downtime/support/trust loss. False green is a negative-value failure mode.
- Growth/UX: trust and comeback are harmed if public operational promises are visibly inconsistent. No acquisition campaign should cite current health while OPS-107-01 is unresolved.

## Carried priority order after v107

1. `BAK-106-01` P0 — independent restore proof.
2. `OPS-107-01` P0 — stale/false-green status truth.
3. `AUTH-105-01` P0 — local-auth privacy/public-contract parity.
4. `QA-104-01` P0 — profession-work quota public/server parity.
5. `REL-104-02` P0 — complete machine-readable release evidence.
6. `AUTH-105-02` P1 — app-auth documentation parity.
7. `REL-104-03` P1 — repository-enforced runtime checks evidence/ruleset.
8. BOLA/auth matrix, backup drill automation, SEO backend, then payment/monetization/growth work subject to P0 gates.

No runtime code, DB data/schema, status collector, infrastructure, backup device, secret or branch rule was modified in this planning run.
