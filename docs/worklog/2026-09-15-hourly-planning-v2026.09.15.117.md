# v2026.09.15.117 — Hourly integrated planning evidence

## Baseline and evidence truth
- Start and mid-run `main`: `6e5fe4aa51364c96da5ef47cc427e7719ec6d1ff`; no newer application/runtime commit was present during this cycle.
- `PROJECT_PLAN.md` and `PROJECT_PLAN.ko.md` still declare integrated version `v2026.09.15.110`; v116 security/App-API/telemetry deltas therefore remain unreconciled in the two authoritative plans.
- Current-main combined status list and PR-triggered workflow-run list are empty. This is `verification unavailable`, never CI green.
- Branch-protection read returned 403 to the connected GitHub App, so this cycle makes no new claim about current required-check enforcement beyond previously captured evidence.
- Runtime/cluster access is unavailable through the connected surface; Test/Production behavior remains `UNVERIFIED` unless supported by prior evidence.

## Fresh external references reviewed (2026-09-15)
1. Google Search Central canonicalization: redirects, sitemap membership, `rel=canonical`, internal links and hreflang are canonical signals; duplicate/filter/device variants need coherent representative URLs. **DIRECT ADOPT** for the SEO read model and release QA.
2. Google Search Central structured-data guidance: validate markup, deploy a small set, inspect live URLs, ensure crawlability and monitor Search Console after template changes. **DIRECT ADOPT**; structured data never overrides privacy/index policy.
3. OWASP Top 10:2025 A07 Authentication Failures: improper authentication and session fixation remain core risks. **DIRECT ADOPT** for local auth, OAuth, admin step-up, session rotation/revocation and mobile-admin gates.
4. Google Play current service-fee guidance (effective 2026 changes): recurring and non-recurring digital transactions can have different fee schedules; new/existing-install and program eligibility can matter, and billing fees may be additive. **DIRECT ADOPT AS COST INPUT**, not a fixed universal percentage.
5. Apple auto-renewable subscription guidance: recurring products require ongoing value; upgrades/downgrades/crossgrades and win-back offers have platform semantics; developer proceeds can change after paid-service thresholds or Small Business eligibility. **REFERENCE/DIRECT ADOPT FOR UNIT-ECONOMICS MODEL**, subject to storefront/tax/provider validation at implementation time.

## Highest-priority delta
### DOC-117-01 — P1 — BLOCKED — authoritative integrated plans lag current main/security contracts
**First confirmed:** 2026-09-15. **Latest reproduced:** this cycle.

**Evidence:** both authoritative plans still identify v110 while current main includes v114/v115 runtime code plus v116 planning evidence. The v110 feature matrix therefore cannot by itself prove the current abuse-security console, permanent suspension/session revocation, IP/CIDR block/lift, Android/admin App API gates or request-telemetry behavior.

**Impact:** developers/agents can implement, QA or promote against stale authority boundaries; destructive admin/security functionality is particularly sensitive. This is a release-governance correctness risk, not merely editorial debt.

**Root cause:** the connected GitHub file-content surface can read the large plans by blob, but safe partial in-place editing is unavailable; whole-file replacement requires resending the complete large UTF-8 file and risks destructive truncation or accidental loss if the payload is incomplete. No destructive rewrite is attempted.

**Required reconciliation design:** when a safe full-file writer is available, advance EN canonical and KO counterpart in one reviewed change; preserve every v110 section; merge v111–v117 deltas; update feature statuses/evidence; add SEC-116-01, OBS-116-01, API-116-01 and this DOC-117-01; update current-main evidence; record fresh reference decisions; ensure EN/KO semantic parity. Do not mark synchronized until both blobs are read back and contain the same version and policy set.

**QA:** pre/post blob SHA capture; line/section count sanity; diff review proving no unrelated section deletion; EN/KO heading/key parity; links valid; current version identical; search for stale claims such as PR #332 still open; verify v116 admin/telemetry contracts are present; final main re-read after write.

**Release gate:** runtime implementation may continue only under its normal reviewed flow, but any release decision that depends on changed admin/App-API/telemetry policy must consult the newer evidence delta until the authoritative plans are reconciled. Planning automation must not claim plan synchronization while blocked.

## Cross-feature planning delta
### Admin / abuse security
Maintain `SEC-116-01` as P0 runtime-unverified. Permanent suspension and network block/lift require execution-time recent reauth + second factor, independent DB actor authorization, self/last-admin/control-plane lockout protection, canonical `inet/cidr`, impact preview, idempotency, immutable audit and immediate multi-session revocation. Admin-mobile remains feature-flagged/off by default until parity/security QA passes. Client platform/version headers are never authorization.

### Request telemetry
Maintain `OBS-116-01`: allowlisted bounded fields only; reject/control CRLF and oversized values; no Authorization/cookie/CSRF/body/query token capture; raw request/trace IDs stay out of metric labels; retention/access roles are explicit; telemetry failure cannot roll back or corrupt the business transaction.

### Authentication/session
Local and OAuth identity flows retain generic invalid-credential errors, rate/resource budgets, session rotation, logout revocation, exact OAuth redirect/state/nonce/PKCE, no silent email-based account merge, and recent reauth for sensitive actions. Verification/recovery URLs remain noindex/sitemap-excluded and secret-free in analytics/referrers/logs.

### SEO / public content
- One server-owned SEO read model determines public visibility, configured-origin canonical, robots directive, sitemap membership, `lastModified`, hreflang and structured-data allowlist.
- Filter/sort/query duplicates either canonicalize to the durable representative URL or are noindex; doorway/thin variants are prohibited.
- Public structured data is validated after template changes and cannot contain private account/economy/security fields.
- Auth/account/security/wallet/holdings/loans/orders/admin/moderation/backup/recovery/App API remain private/noindex/sitemap-excluded.
- SEO business KPI remains organic visit → signup → activation → D7/D30 → retained contribution/CAC saving; impressions/CTR alone never justify scale.

### Monetization / unit economics
No fixed `15%` or `30%` platform-fee assumption is allowed. Each real-money SKU/subscription scenario records storefront/market, new-vs-existing install classification where applicable, recurring vs non-recurring, program eligibility, billing/payment fee, tax, refund/chargeback, net proceeds, content/CS/moderation/fraud/infra cost and sensitivity. Apple subscription scenarios separately model first-year vs later paid-service proceeds and Small Business eligibility when applicable. Unknown eligibility or traffic mix remains `HYPOTHESIS`/`TEST TARGET`.

Subscription SCALE requires incremental retained contribution after churn/refunds/support, not gross receipts. Win-back/promotion tests target previously eligible subscribers without hidden renewal, misleading scarcity or casino/wealth pressure. Guardrails: D1/D7/D30, cancellation/renewal/refund, support tickets, payment failure, fraud/chargeback and trust/privacy complaints.

## QA / priority carry-forward
P0 remains: `BAK-106-01` independent restorable backup evidence; `OPS-107-01` false-green status; `REL-110-01` exact-SHA Test lineage; `AUTH-105-01` local-auth disclosure/rollout; `QA-104-01` quota contract until current exact runtime proves parity; `REL-104-02` release-evidence completeness; `SEC-116-01` destructive abuse-security authority. P1 includes `AUTH-105-02`, `REL-104-03`, `OBS-116-01`, `API-116-01`, SEO backend, monetization provider economics and `DOC-117-01` reconciliation.

## Integration status
Required sequence was followed: fresh external research → latest main/plans/QA evidence comparison → detailed security/SEO/economics/QA planning → mid-run main re-check. The two large authoritative plans were read and confirmed stale. Safe direct replacement remains blocked by the connected write surface, so this run records a non-destructive v117 delta rather than falsely claiming `PROJECT_PLAN` synchronization. No runtime code/API/DB/migration/infrastructure/secret/branch-rule change is made by this planning cycle.