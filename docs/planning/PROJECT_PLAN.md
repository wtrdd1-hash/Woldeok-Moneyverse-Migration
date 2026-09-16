# Woldeok Moneyverse — Living Project Plan

> Status: Living specification / current authoritative integrated plan
> Original baseline: 2026-08-26
> Current integrated version: v2026.09.16.155
> Implementation/evidence sync: 2026-09-16
> Korean counterpart: [PROJECT_PLAN.ko.md](PROJECT_PLAN.ko.md)

This is the current implementation-facing contract. Historical details remain recoverable from Git and versioned changelog/worklog files. A developer or agent must be able to derive scope, authority boundaries, user states, APIs, persistence, security, SEO, economics, QA, release gates and rollback from this document without treating an older draft as current truth.

## 0. Maintenance, evidence and priority rules

1. Material planning starts with fresh external research. Prefer current official product/platform documentation, regulators, OWASP/security bodies and primary runtime evidence. Important decisions compare independent sources when practical.
2. Before changing a contract, read latest `main`, both integrated plans, recent QA/worklogs, CI/release automation, open incidents/PRs, runtime evidence and relevant code/migrations. Re-check `main` mid-run and immediately before each docs integration. Documentation automation never force-pushes.
3. Evidence state is explicit: `IMPLEMENTED`, `PARTIAL`, `UNVERIFIED`, `REDESIGN_REQUIRED`. A plan, issue, screenshot, successful build or stale test does not prove current Production behavior.
4. Missing CI/test/runtime evidence means `verification unavailable`, never pass. P0/CRITICAL/HIGH gates fail closed.
5. Applied DB migrations are immutable. Corrections use a new migration. Economy history is append-only; corrections use compensating transactions.
6. Unknown business figures are `HYPOTHESIS` or `TEST TARGET`. WLD/WDX activity is game-economy activity, not real-currency revenue.
7. Priority order: `P0 data loss/security/auth/authorization/asset duplication/economy abuse/outage/DB integrity/release truth` → `P1 major correctness/core completeness` → `P1 shop/payment/monetization` → `P1 SEO/acquisition` → `P2 retention/growth` → `P2 UX/accessibility` → `P3 long-term expansion`.
8. Runtime development remains separate: `new branch → static/unit/integration/real-DB/security tests → immutable candidate → isolated exact-SHA test → backend/API/DB/user-flow QA → main integration → exact-main-SHA re-test → Production evidence → GitOps promotion → Production smoke/monitoring → rollback if required`.

## 1. Product and non-negotiable boundaries

Woldeok Moneyverse is a web+Discord community virtual-economy/game platform. Users authenticate, progress through jobs/quests, earn/spend WLD, collect and use items, operate virtual businesses, use a virtual bank/loans, virtual stocks, social/community and probability/game systems.

WLD, WDX/virtual stocks, bank balances, loans, casino play and rewards are simulated/game-only data. There is no cash redemption, real security/deposit, guaranteed yield, investment return, external prize or real gambling promise. Any future real-money/financial/gambling linkage is a separate legal/product redesign.

The baseline architecture is Next.js frontend, NestJS API and PostgreSQL authoritative data/economy/authorization, protected `SECURITY DEFINER` paths for sensitive DB operations, least-privilege application roles, append-only double-entry ledger, idempotency for retryable value changes and outbox-style post-commit external delivery.

### 1.1 Economy invariants

Every value-changing operation validates actor, permission, policy, eligibility, quota/limit and idempotency, then atomically writes required ledger postings, derived balances, audit/outbox. Debits and credits reconcile; prohibited negative balances fail at transaction boundaries. Money uses integer/string-safe contracts, not unsafe JavaScript `Number`. Duplicate/retry/concurrent requests cannot create duplicate value. Corrections reference the original transaction and use compensating entries.

### 1.2 Security baseline

Use OWASP ASVS 5.0.0 and OWASP API Security Top 10 as verification baselines, not certification claims. Cross-cutting controls include OAuth/OIDC `state`/`nonce`/PKCE/exact redirect, secure session rotation/revocation, recent reauthentication, CSRF, BOLA/IDOR negative tests, output encoding/XSS defense, SQLi/SSRF/path traversal/command-injection controls, decoded upload validation, rate/resource/business-flow abuse controls, least-privilege DB roles, CORS/CSP/security headers, secret management, dependency/supply-chain controls, container/Kubernetes hardening, independent encrypted restorable backups, append-only audit, privacy minimization/retention/deletion and secret-safe logs.

### 1.3 Administrator boundary

Current model is a single `superadmin` plus compensating controls, not mandatory two-person approval. Sensitive operations require `AdminSessionGuard`, recent `ReauthGuard`, TOTP/`SecondFactorGuard`, DB actor checks, least privilege, impact preview, reason capture, idempotency where relevant and append-only audit. Superadmin has no direct bypass for protected economy or audit history.

## 2. Current blocker and QA register

Every issue records severity, first found, latest reproduction, steps, affected users/functions, evidence, root-cause status, FE/BE/API/DB/infra target, concrete fix, migration impact, rollback, unit/integration/E2E/real-DB/security/regression tests, test acceptance, Production promotion condition, monitoring, state and owner sequence. Repeated `BLOCKED` becomes a root-cause-removal item.

### BAK-106-01 — P0 — OPEN/BLOCKED — independent backup + successful restore evidence unavailable

- First evidence: GitHub issue #139, 2026-09-09. It remains open on 2026-09-15. Last direct host evidence found `/mnt/backup` (`/dev/sda1`) read-only, newest observed separate-media files dated 2026-09-07 and no current Kubernetes-era automated backup there. A custom-format emergency PostgreSQL dump passed SHA-256 and `pg_restore -l`, but remained on the same host/system disk.
- Impact: total host/storage loss can affect identity, sessions, economy, ledger, audit, inventory, entitlement, content and dispute recovery.
- Root cause/evidence gap: filesystem/media health and current scheduled-backup path are unresolved because authorized remote cluster devices are currently offline; no fresh host claim is made.
- Fix targets: backup medium/storage, Kubernetes/GitOps backup job, least-privilege backup identity, encryption/key separation, retention, monitoring, isolated restore environment and release-evidence integration.
- Migration: none merely to repair backup infrastructure; schema/data-changing Production work is blocked until current independent recovery evidence exists.
- Tests: corrupt/missing archive, wrong key, full disk, WAL gap where PITR applies, wrong source/target, Production credential denial, full isolated DB/object restore, migration parity, ledger/balance and entitlement/provenance reconciliation.
- Close: one current independent backup reaches `VERIFIED_RESTORABLE`, measured RPO/RTO evidence exists, monitoring alerts work and release automation consumes the evidence.
- Rollback: backup-system rollout may revert to prior operational configuration only if a separately verified recovery path remains available.
- Business: direct revenue 0; value = expected data-loss/downtime/refund/support/fraud/dispute cost avoided.

### OPS-107-01 — P0 — OPEN — stale status remains false-green for hours

- First reproduction: 2026-09-15 07:05 KST. Latest reproduction this cycle: around 08:08 KST. Public `/status` still said all services normal while Web/economy API/ledger DB observations were all 04:06 KST. The page says collection interval is 30 seconds and older records should show checking, so the same stale snapshot remained green for more than four hours.
- Repository contract: frontend revalidates but trusts API state; migration 013 has source `stale_after_seconds` and `content_public_status()` designed to map stale rows to `unknown`. Initial migration values use 180 seconds, which also proves the UI’s literal 30-second statement is not the authoritative stale threshold.
- Impact: an outage/degradation or monitoring failure can be hidden, increasing MTTR, support burden, false release confidence and trust loss.
- Root cause: not confirmed. Candidates remain Production migration/function/config drift, stale deployed backend/image, collector failure plus non-authoritative read path, or caching.
- Read-only diagnosis order: capture raw `/api/v1/status` body/headers/server clock → deployed frontend/backend SHA+digest → migration checksum → `pg_get_functiondef(content_public_status)` and `stale_after_seconds` → latest snapshots vs `clock_timestamp()` → collector attempt/success/schedule/logs → reproduce on isolated exact-SHA test.
- Design: server-side source freshness is authoritative; collection interval and stale threshold are separate. Stale/missing required source becomes `unknown`; overall cannot remain `operational`. Collector failure is `monitoring delayed/checking`, not a fabricated target outage and never green. Healthy cache cannot outlive freshness. No `stale-if-error` green assertion after threshold.
- Migration: migration 013 remains immutable; Production drift is corrected through a new migration/reviewed configuration path.
- Required QA: threshold -1/0/+1 second, different source thresholds, no snapshot, future timestamp, stopped collector, API/DB/cache failure, restart, mixed states, timezone, forged writer denial, app-role write denial, no topology leakage.
- Test gate: stopping a synthetic collector must turn API+UI to checking within the configured threshold, lower overall health and alert; only a new trusted fresh snapshot restores green.
- Metrics: `status_source_age_seconds`, `collector_last_success_age_seconds`, `public_status_unknown_count`, `status_api_errors`, `stale_operational_violation_count=0`.
- Rollback: last-known-good immutable app/config while remaining fail-closed; never rewrite history simply to make the board green.

### REL-110-01 — P0 — BLOCKED — Test GitOps declaration advanced but public runtime serves the wrong candidate revision

- First/latest evidence: PR #332 candidate `b3f28185107a2f6f4a8bd389016de778df08b747`. CI passed and immutable backend/frontend `-test` images built successfully. Test infrastructure PR #67 reportedly rendered and merged, updating candidate labels, images, Test source SHA and redeploy tokens. The immediate public Test probe then returned `/api/version = 1789391457242`, not the expected candidate SHA. Application-main merge and Production promotion were correctly stopped.
- Impact: a successful build and GitOps declaration can diverge from the workload actually serving Test. If treated as equivalent, QA may validate the wrong code and promote untested runtime.
- Root cause: unconfirmed because cluster/Flux inspection requires an authorized device and all connected devices are offline. Candidate hypotheses: Flux source/reconcile lag or stall, Kustomization revision mismatch, Deployment/ReplicaSet rollout failure, old Pod/image digest, image pull/cache issue, Service/Ingress selecting old endpoints, version endpoint built from wrong source, or another routing/cache layer.
- Read-only diagnosis sequence when cluster access returns: Test GitRepository/OCI source revision → Flux Kustomization `Ready/Reconciling/Stalled`, `lastAppliedRevision`, `lastAttemptedRevision`, history and events → rendered Deployment desired image digest/env/labels → ReplicaSet/Pod owner+digest+restart/image-pull events → Service endpoints → Ingress/router/cache → pod-local `/api/version` → public `/api/version`.
- Evidence contract: `Git commit` ≠ `CI green` ≠ `image built` ≠ `GitOps desired state merged` ≠ `Flux applied` ≠ `workload rolled out` ≠ `Service routes candidate` ≠ `public exact-SHA`. Each is a separate state with timestamp, source and evidence ID.
- Fix targets: infrastructure/GitOps reconciliation, candidate metadata/version endpoint, workload rollout and public route. No application DB/schema change is required by the diagnosis itself.
- Rollback: because Production was untouched, no Production rollback. For Test, restore last-known-good immutable Test image/digest only if needed to recover the verification environment; preserve failure evidence.
- Required QA after repair: exact SHA from pod-local and public endpoint, backend+frontend image digest, DB migration checksum, least-privilege DB smoke, login/logout, Work quota UI/API, public catalog, noindex, logs/resources and rollback-readiness.
- Acceptance: the same candidate SHA/digest must be demonstrably connected from source commit → image provenance → GitOps applied revision → Deployment/Pod → public `/api/version`; repeated probe remains stable through rollout completion.
- Monitoring: reconcile age, last applied/attempted revision, rollout desired/available replicas, image digest mismatch, endpoint age, exact-SHA probe failures.
- State/sequence: `BLOCKED` on cluster-access/root-cause inspection. Owner order: infra/Flux evidence → routing/workload correction → exact-SHA Test QA → only then application merge consideration.

### AUTH-105-01 — P0 — OPEN / PUBLIC LOCAL-AUTH ROLLOUT HOLD

- Evidence: local email registration/verification/login, Argon2id, normalized email hash and token hash exist in code/contracts while current Production login/guide/privacy remains OAuth-centric and says users do not create a separate Moneyverse password.
- Impact: processing facts, user expectation and privacy disclosure can diverge; credentials may be exposed to a flow users were not told exists.
- Fix: before broad rollout, align privacy notice/version+consent, purpose/items/retention/deletion/credential removal, SMTP/provider facts, verification-link privacy, account recovery and support scripts.
- Security: credential stuffing/resource abuse, email enumeration, verifier/token logs, OAuth/local account collision and silent identity merge are release blockers. Unknown email/wrong password use the same public error class.
- SEO: signup/login/verification/recovery are noindex and sitemap-excluded; raw verification token never enters analytics/referrer/logs.
- QA: register/verify/login/logout, invalid/expired/reused token, same/cross-browser, session rotation, rate/resource limits, provider collision, deletion, policy-version mismatch and rollback.

### QA-104-01 — P0 — IN PROGRESS, NOT CLOSED — profession-work quota visibility/content contract

- Production runtime still says profession work can be repeated without a daily limit for full WLD/EXP every time; this contradicts authoritative `daily_limit`/`taken_today` quota behavior.
- Candidate progress: PR #332 adds authoritative `taken_today / daily_limit` Work visibility. Candidate `b3f28185107a2f6f4a8bd389016de778df08b747` passed CI and immutable Test-image build.
- Not closed because REL-110-01 prevents exact-SHA Test runtime proof, PR #332 remains open, and Production `/guide` still contains the incorrect unlimited-reward text.
- Fix scope: Work UI, `/guide`, mobile/App API guides, FAQ/schema examples and any SEO snippets. Distinguish `playable` from `reward eligible`; do not weaken server quota to match old copy.
- QA: 0/partial/exact/+1, profession/task isolation, double-submit, idempotency, concurrency, Seoul day boundary, API/web/mobile parity, guide copy, accessibility and SEO metadata.
- Promotion: close only after exact-SHA isolated Test passes, current-main integration is retested and Production copy/runtime smoke verifies authoritative quota messaging.

### REL-104-02 — P0 — OPEN — Production-ready workflow is narrower than normative release evidence

The current release path has useful exact-SHA/catalog/noindex checks, immutable images, SBOM/provenance, but Production readiness must also prove migration parity/checksum, least-privilege DB connectivity, authenticated synthetic flow, changed-feature abuse/reconciliation, current backup/restore evidence when destructive work is involved, rollback target and the REL-110-01 end-to-end candidate lineage. Missing, stale or wrong-revision evidence is `BLOCKED`, never skip-pass.

### AUTH-105-02 — P1 — TODO — verify-email app documentation stale

Current verify-email is one-time bearer-token, cross-browser/no-cookie exchange rather than an originating prelogin-cookie/CSRF dependency. Synchronize EN/KO app-auth guide, endpoint catalog, schema/examples and old-client behavior. Test invalid/expired/reused token, arbitrary CSRF, same/cross-browser and session rotation.

### REL-104-03 — P1 — OPEN/CONFIRMED — required status checks are not repository-enforced

Fresh `main` branch metadata shows protection enabled but required-status-check enforcement `off` with empty required contexts/checks. This is no longer merely unverified. GitHub documents that without required checks, protected-branch merges are not blocked by check results. Keep direct-main docs automation narrowly allowed if desired, but runtime paths (`backend/`, `frontend/`, database/migrations, deploy/security workflows) must require reviewed integration and selected checks from the expected GitHub App/source. Rules must not turn docs automation into a runtime bypass.

## 3. Candidate evidence state machine — normative release contract

A release candidate moves only through these states; later states do not imply missing earlier evidence:

1. `SOURCE_READY`: candidate SHA and base-main SHA captured; changed files/risk class known.
2. `CI_GREEN`: exact candidate passes required static/unit/integration/real-DB/security jobs.
3. `IMAGE_BUILT`: immutable backend/frontend image digests exist with provenance/SBOM where applicable.
4. `GITOPS_DECLARED`: Test GitOps desired-state commit references exact candidate/digests.
5. `TEST_APPLIED`: Flux source/Kustomization reports the expected applied revision and healthy reconciliation.
6. `TEST_WORKLOAD_EXACT`: Deployment/ReplicaSet/Pods run expected digest and candidate metadata.
7. `TEST_PUBLIC_EXACT`: public Test version endpoint returns expected candidate SHA without stale routing/cache.
8. `TEST_QA_GREEN`: DB/API/auth/changed-feature/security/noindex/log/resource/rollback tests pass against that exact runtime.
9. `MAIN_INTEGRATED`: reviewed candidate is integrated into current main; if main moved, compare/reconcile first.
10. `MAIN_EXACT_TEST_GREEN`: exact integrated main SHA receives immutable Test deployment and the same gates again.
11. `PRODUCTION_READY`: machine-readable release evidence includes all applicable gates, backup/restore and rollback target.
12. `PROD_DEPLOYED`: GitOps Production desired/applied/workload/public lineage matches exact approved main SHA/digests.
13. `PROD_SMOKE_GREEN`: HTTP/API/auth/changed user flow/log/resource/status-freshness smoke passes; monitor or rollback.

Minimum evidence object: `candidateSha`, `baseMainSha`, `riskClass`, `ciRunIds`, `imageDigests`, `provenanceIds`, `testGitOpsRevision`, `fluxAppliedRevision`, `testWorkloadDigests`, `testPublicVersion`, `migrationChecksum`, `dbSmoke`, `authSmoke`, `featureQa`, `securityQa`, `backupEvidenceId` when required, `rollbackTarget`, timestamps, operator/automation identity and expiry/freshness. A stage mismatch blocks advancement and creates an incident/QA item rather than being normalized away.

## 4. Mandatory feature specification template

Every current or planned feature records all of: purpose/user problem; target actor/role; implementation status and code/doc evidence; user stories; entry route; screen components and CTA; state transitions; loading/empty/error/offline/timeout; first-use/return/comeback; mobile/tablet/desktop differences; keyboard/focus/label/contrast/reduced-motion accessibility; i18n; email/push/Discord integration; data model/ownership; read/write permission; endpoint/method/request/response/error codes; idempotency/rate/resource/business-flow limits; service/business rules; tables/indexes/constraints/transactions/concurrency; audit/metrics/admin operations; feature flag/fallback; backup/recovery impact; security/privacy/abuse; SEO/indexing; analytics/KPI; performance/cache; profitability/cost; completion criteria; unit/integration/E2E/real-DB/security/regression tests; isolated-test acceptance; Production promotion/monitoring/rollback.

## 5. All-feature implementation and product contract matrix

| Feature family | Evidence/status | Authority, UX, API/DB contract | Security/privacy/abuse | SEO/growth/business | Mandatory QA/release gate |
|---|---|---|---|---|---|
| Registration/login/OAuth/logout/session | `IMPLEMENTED/PARTIAL` | Server owns identity linking, consent and session issue/rotate/revoke. Local register/login use prelogin+CSRF; verify-email uses one-time bearer token. Loading/provider-error/consent/session-expired/offline are distinct. | Credential stuffing/resource budgets, OAuth state/nonce/PKCE/exact redirect, secure cookie, fixation rotation, logout invalidation, no silent local/OAuth email merge. | Auth pages noindex. Value = verified session→activation→D1/D7/D30 minus SMTP/compute/CS/fraud/privacy cost. | Provider collision, replay/fixation/logout, token expiry/reuse/cross-browser, 429, policy/privacy parity. AUTH-105-01 blocks broad local rollout. |
| Profile/account/security center | `PARTIAL` | Server owns profile, linked methods and sessions; sensitive changes require recent reauth. | Account/session BOLA, ATO alerts without secrets, privacy-minimal defaults, audited changes. | Private/auth/noindex; value = lower ATO/support loss. | Other-user session denial, reauth expiry, terminate-other/all, provider-loss recovery, responsive/accessibility. |
| Inventory/collection/marketplace workbench | `PARTIAL`; live P2P settlement unproven | DB owns item/owner/provenance/entitlement/serial. Future listing defines escrow/cancel/expiry/settlement/fee/reversal. | BOLA/serial leakage, duplicate grant, wash trade/collusion, replay. | Holdings private/noindex; only explicit public-safe collections. WLD spend is sink, not revenue. | Ownership concurrency, duplicate entitlement, unauthorized transfer, recovery, private URL leak, future wash-trade simulation. |
| WLD shop/catalog | `IMPLEMENTED/PARTIAL` | Server owns SKU/effective price/eligibility/limit/window/entitlement. Each SKU records identity/category/value, currency, consumability, test price, promo/window/limit, binding/gift/refund/recovery, sink/source, P2W, KPI/admin lifecycle. | Client price untrusted, replay/duplicate, fake/reset scarcity, hidden individualized pricing and P2W/wealth/casino pressure prohibited. | Substantial editorial collection pages may index; purchase history private. WLD is retention/economy, not real revenue. | Price tamper, boundary time, insufficient balance, concurrent purchase, entitlement repair/cache, admin lifecycle. |
| Real-money cart/payment/subscription/ad removal | `UNVERIFIED` | Before build select provider; server owns order, displayed amount, tax, receipt/webhook verification, entitlement, refund/cancel/renewal/grace and idempotency. | Receipt/webhook replay/forgery, BOLA, chargeback fraud, secret/PCI/provider boundary. | Checkout/order/account noindex. Net economics subtract tax/platform/payment/refund/chargeback/content/CS/moderation/fraud/infra. | Provider sandbox, duplicate/out-of-order webhook, refund/regrant, renewal/cancel, legal/privacy gate; predeclared SCALE/ITERATE/HOLD/KILL. |
| Jobs/quests/profession/level/rewards | `PARTIAL + P0 IN PROGRESS` | Server/DB owns catalog, duration/cooldown/daily quota/reward/EXP/receipt/unlock. UI must show authoritative `taken_today/daily_limit`; playable != reward eligible. | Bot/macro/multi-account/replay/clock-reset/concurrent duplicate; ledger reconciliation. | Correct guide may index as game learning. KPI TTFV, first verified job, D1/D7 and inflation. | QA-104-01 + REL-110-01 exact-SHA matrix. |
| Business | `UNVERIFIED/PARTIAL` | Define inventory/demand/price/cost/fee/tax/management/settlement; no risk-free fixed compounding; all value via ledger/idempotency. | Circular farming, replay/refund, admin manipulation, precision. | Public education possible; private P&L noindex. | Real-DB settlement/reconciliation/concurrency/abuse simulation. |
| Bank/loans | `UNVERIFIED/PARTIAL` | Server owns eligibility, source of funds, principal/interest/accrual/repayment/arrears/purpose/recovery. | Double repayment, clock abuse, BOLA, multi-account/loss-chasing; no real deposit/yield claim. | Public simulation education only; private balance/debt noindex. | Accrual boundaries, concurrent/idempotent repayment, restart/recovery, ledger reconciliation. |
| Virtual stocks/WDX/watchlist/portfolio/alerts/compare/search | `PARTIAL` | Public market read model separate from private holdings. Server owns issuance/pricing/trading/settlement/rules. | Holdings BOLA, settlement replay, manipulation/collusion, phishing/spam alerts, integer precision. | Substantial public-safe symbol pages may index; portfolio/watch/orders/alerts private. | Other-user denial, symbol validation, large integer, concurrency/replay, alert cooldown/manipulation. |
| Casino/probability | `PARTIAL/HIGH-RISK` | Server owns outcome/probability/payout/limit/atomic settlement; same idempotency key gives same receipt/outcome. | RNG/result tamper, replay, limit bypass, bot/multi-account, loss chasing/youth risk. | Gameplay/account history noindex; never acquisition-promote winnings. Real revenue 0 absent separate paid approval. | Distribution sanity, replay, limits, concurrency, ledger reconciliation, legal/product review. |
| Seasons/live events | `PARTIAL` | Server owns start/end/grace/reward eligibility; preview is not time authority; catch-up/archive required. | Reward farming/collusion, deadline manipulation/fake FOMO. | Substantial season/archive pages may index with truthful dates/lastModified. | Timezone boundary, late entry/catch-up, duplicate reward, archive transition, notification cooldown. |
| Community/posts/comments/report/block | `PARTIAL` | Server owns authorship/edit/delete/mod state; explicit deleted/locked/report/block states. | Spam/bot, harassment, impersonation/doxxing, malicious links/stored XSS, BOLA, moderator abuse. | Curated board may index; individual UGC default noindex until quality/moderation policy. | Other-user mutation denial, XSS/link, report spam, block semantics, moderator audit, 404/410/index removal. |
| Friends/clubs/referral | `UNVERIFIED/PARTIAL` | Define invite lifecycle, roles, leave/kick/ban, visibility, attribution and reward maturity. | Invite spam, fake account/referral fraud, collusion, role escalation/private graph leakage. | Public club only explicit visibility; rewards prefer cosmetic/prestige/convenience. | Referral ring, invite replay, role escalation, privacy/block. |
| Notifications/email/push/Discord | `PARTIAL` | Server owns source event, preference/consent, cooldown/dedupe, delivery state and canonical deep link. | Phishing imitation, webhook abuse, spam/token leakage; no sensitive balance/debt/security in notification. | noindex; value = healthy return minus provider/opt-out/spam/privacy/support cost. | Dedupe/cooldown, stale/revoked link, opt-out, provider outage/outbox, secret-safe logs. |
| Search | `UNVERIFIED` | Public search reads only public-safe model; member/admin search separately authorized; define pagination/no-result/timeout. | Injection, expensive-query DoS, enumeration, query-log PII. | Result pages normally noindex; only intentional curated landing indexes. | Authz, special chars, pagination stability, complexity/rate, relevance regression. |
| Upload/gallery/files | `PARTIAL/spec-level unless linked code` | Decode/type/magic, size/dimensions, generated names, isolated storage, authorized delivery, metadata strip. | Malware/polyglot/path traversal/decompression bomb/remote-fetch SSRF/BOLA/EXIF. | Private media noindex; public only after permission/moderation. | malformed/polyglot/oversize/unauthorized read/EXIF/storage failure/restore. |
| Public home/guide/status/content | `PARTIAL + P0` | Public read model fails honestly; guide matches server contract; status freshness server-authoritative. | No secret/topology/private user state; XSS/phishing; status writer trusted non-browser path. | `/status` noindex; `/guide` acquisition HOLD until quota/local-auth copy is correct. | HTTP/meta/a11y/CWV, guide contract, stale-status fail-closed. |
| App API/mobile gateway | `PARTIAL/COVERAGE DOCUMENTED` | Versioned `/app-api/v1`; stable wrappers; breaking contract requires compatibility/version decision. | Handoff/token replay, BOLA, rate/resource abuse, PII/log masking. | API noindex; value = mobile activation/D30 minus support/infra/fraud. | Contract snapshots, old client, auth expiry, handoff one-time, error parity, AUTH-105-02. |
| Admin/audit | `PARTIAL` | Risky writes show current/proposed/target/impact/reason; use reauth+TOTP+DB actor+idempotency/audit as relevant. | Privilege escalation/session theft/CSRF/BOLA/mass action/audit tamper. | private/noindex; value = lower incident/operator/support cost. | Lower-role denial, stale reauth, invalid TOTP, mass bounds, DB privilege/audit, compensation. |
| Backup/recovery | `UNVERIFIED CURRENT EVIDENCE` | Independent encrypted backup, source/version/checksum, isolated restore, app/ledger/object validation, measured RPO/RTO. | Key theft/plaintext/shared failure domain/wrong-env/corruption/WAL gap/shadow retention. | private/noindex; direct revenue 0. | BAK-106-01 blocks destructive work; full fault-injected drill. |
| Analytics/experiments | `PARTIAL/SPECIFIED` | Pseudonymous subject; analytics session != auth secret; versioned event schema/retention/assignment/guardrails. | PII/secret leak, reidentification, experiment abuse, sensitive profiling. | Safe campaign/content IDs only; no private SEO payload. | Schema/consent/deletion/deterministic assignment/outbound privacy scan. |
| Advertising/sponsorship | `IMPLEMENTED/PARTIAL reviewed placements` | Approved substantial public surfaces only; Test ads off; ad/sponsor visually separate from product action. | Invalid traffic/click encouragement/youth/privacy targeting/tracker leak/sponsor confusion. | Ads never justify thin pages. Net ad contribution subtracts churn/session/support/privacy/fraud cost. | Route allowlist, Test ads off, CLS/CWV, ad exit, invalid traffic/policy/privacy. |
| SEO backend | `PARTIAL` | Configured-origin canonical, public metadata read model, sitemap shards, robots, redirect map, structured-data serializer, updatedAt, images, crawler/GSC/Naver observation. | Private leakage, Host injection, cache poison, PII in sitemap/JSON-LD. | KPI organic→signup→activation→D7/D30→retained net value/CAC saving. | sitemap privacy, canonical injection, redirect loops, SSR, GSC/Naver, CWV. |
| Incident/status/operations | `PARTIAL + OPS-107-01 P0` | Public-safe status separated from internal telemetry; server freshness, collector heartbeat, snapshot age, incident lifecycle and rollback/postmortem explicit. | false green, forged writer, stale monitoring, topology leak, admin abuse, alert fatigue. | Trust/support/MTTR feature, not acquisition bait; `/status` noindex. | stopped collector/source, cache/API/DB outage, mixed states, stale threshold, alerting, exact-SHA smoke. |
| CI/Test/GitOps/Production promotion | `PARTIAL + REL-110-01 P0` | §3 state machine is authoritative; desired-state merge never equals applied/runtime proof. | stale candidate, supply-chain substitution, wrong image/routing, evidence replay. | indirect value through lower failure/rollback/support cost. | source→CI→image→Flux→Pod→public version lineage must be exact and fresh. |

## 6. Local first-party authentication detailed contract

| Step | Endpoint | Required UX/state | Security/error/data contract |
|---|---|---|---|
| prelogin | `POST /app-api/v1/auth/prelogin-session` | resumable pre-auth; retryable failure | secure prelogin cookie + in-memory CSRF; no secret logs |
| policy | `GET /app-api/v1/auth/policy` | current terms/privacy before registration | server version authoritative |
| consent | `PUT /app-api/v1/auth/consent` | explicit current policy/age acknowledgement | SessionGuard+CSRF; stale version requires review |
| register | `POST /app-api/v1/auth/local/register` | email/password/display name → pending verification; SMTP failure recoverable | prelogin+CSRF+current consent; password policy; normalized email/hash/Argon2id/hashed one-time token; abuse budget |
| verify | `POST /app-api/v1/auth/local/verify-email` | cross-browser allowed; success signs in | short-lived one-time bearer token; no originating cookie dependency; raw token never logged; clean URL after exchange |
| login | `POST /app-api/v1/auth/local/login` | unknown email/wrong password same public class; offline/429/5xx distinct | prelogin+CSRF, dummy work for nonexistent account, resource/rate control, session rotation |
| viewer/session | `GET /app-api/v1/auth/viewer`, `GET /app-api/v1/auth/session` | client trusts server signed-in result | signed-in cookie authoritative |
| logout | `POST /app-api/v1/auth/logout` | UI cannot claim server logout succeeded while offline | session+CSRF, revoke server session/cookie |

Verification-token surfaces are noindex/sitemap-excluded; use `Referrer-Policy: no-referrer` or equivalent; no ads/third-party analytics/social pixels before token exchange; redact query strings; GET/link preview must not consume the token; after exchange redirect to a token-free clean URL. Product analytics never contains email/hash/password/verifier/token/cookie/CSRF/OAuth/recovery secrets.

## 7. SEO and SEO-backend contract

### 7.1 Route policy

- `/`: `PUBLIC_INDEXABLE`, configured-origin self-canonical, unique title/meta/H1, truthful structured data, OG/Twitter, stable image dimensions, substantial internal links.
- `/guide`: `PUBLIC_INDEXABLE_BUT_ACQUISITION_HOLD` until QA-104-01 and AUTH-105-01 wording is corrected. Target game-system beginner intent, not real investment-return intent.
- `/status`: `PUBLIC_NOINDEX`, sitemap excluded. It is transient operational content and truth/freshness outranks search acquisition.
- Public news/season/collection/world guides: index only if original, substantial, maintained and public-safe, with stable slug and meaningful `lastModified`.
- `/stocks/[symbol]`: only public-safe fictional-market/world read model may index. Holdings/watch/orders/alerts/portfolio never enter anonymous HTML, JSON-LD or shared cache.
- Community UGC defaults noindex until quality/moderation criteria; deleted public content uses 404/410 and leaves sitemap.
- Search/filter/sort/query variants canonicalize or noindex unless deliberately curated; never create doorway pages.
- login/signup/verify/recovery/account/security/wallet/transfer/private bank/business/loan/portfolio/watchlist/alerts/checkout/orders/subscription/admin/moderation/backup/recovery are auth-required or public-noindex and sitemap-excluded.
- Test/recovery origins are globally noindex, real ads off, no sitemap submission and no indexable user data.

### 7.2 SEO backend

Implement and QA a configured-origin `SeoMetadataReadModel`, Host-injection-resistant canonical builder, dynamic sitemap index/shards respecting URL/byte limits, authoritative `lastModified`, robots generator, structured-data allowlist serializer, permanent 301/308 redirect map with loop/conflict checks, image metadata/alt/dimensions, locale/hreflang, crawler-log classification, Search Console/Naver verification/status ingestion, crawl/index/canonical/sitemap reporting and operator read dashboard/API. HTML/meta/sitemap/redirect caches stay coherent; private identity/economy/security state never enters public cache keys or structured data.

`noindex` must be delivered in page meta or HTTP header on a crawlable response; robots blocking is not a substitute for noindex. Canonical signals must be consistent across redirect, sitemap, `rel=canonical`, internal link and hreflang.

### 7.3 SEO performance and economics

Impressions/clicks/CTR are diagnostic. Business funnel is `organic visit → qualified interest → signup → activation → D1/D7/D30 → retained contribution/real net revenue`. Organic CAC includes content, tooling and SEO operations per incremental organic D30 retained user. Representative public templates target good CWV: LCP ≤2.5s, INP <200ms, CLS <0.1, tested on mobile and desktop.

## 8. Security threat and verification register

| Risk | Severity | Prevention/detection | Mandatory release behavior |
|---|---|---|---|
| BOLA/IDOR | HIGH | actor-scoped service/DB authz; client owner ID untrusted; denial metrics | other-user ID negative test on every object API; failure blocks |
| Credential stuffing/session fixation | HIGH | generic errors, rate/resource budgets, rotation, secure cookies, reauth/logout, OAuth uniqueness | distributed invalid auth, fixation/logout/state/nonce/PKCE; unexplained bypass blocks |
| Resource/business-flow exhaustion | HIGH where costly | per-operation limits, timeouts, pagination, third-party spend alerts, bot signals | burst/concurrency/large-input/provider-cost tests; no unbounded email/upload/search/reward flow |
| Economy replay/duplicate/concurrency | HIGH | idempotency unique constraints, transaction/locking, append-only ledger/reconciliation | parallel/retry/replay/precision/ledger mismatch blocks |
| Admin abuse | HIGH | session+reauth+TOTP+DB actor+least privilege+impact preview+audit | lower-role/stale reauth/TOTP/CSRF/mass/DB privilege failure blocks |
| Upload/UGC | HIGH | decoded type, isolated storage, output encoding/CSP, metadata minimization/moderation | polyglot/malformed/XSS/link/unauthorized delivery |
| Analytics/ad/SEO leakage | MEDIUM/HIGH | outbound allowlist/minimization; no token/balance/debt/security in URL/structured data | payload/schema/sitemap/JSON-LD scan; HIGH leak blocks |
| Supply chain | MEDIUM/HIGH | immutable action/image refs, dependency audit, SBOM/provenance | workflow/dependency/provenance regression follows severity gate |
| Candidate lineage mismatch | HIGH | §3 evidence chain, image digest, Flux revision, Pod/public version probes | any desired/applied/workload/public mismatch blocks merge/promotion |
| Release-evidence bypass | HIGH | immutable SHA, signed/machine-readable fail-closed evidence, no skip-pass | break each prerequisite intentionally; Production-ready must not emit |
| Backup/key compromise | HIGH | encryption, key separation, independent medium, least privilege, access audit | unauthorized key/plaintext test; HIGH leak blocks |
| Wrong-environment restore | CRITICAL/HIGH | source/target identity, isolated DB/namespace, separate credentials/outbound sinks | wrong target/Production credential simulation; possible prod write blocks |
| Backup corruption/WAL gap | HIGH | checksum/manifest, full restore, WAL monitoring, reconciliation | corrupt/missing/wrong checksum fails closed+alerts |
| Multi-account/referral/market manipulation | HIGH where economy affected | maturity/caps/provenance/anomaly/graph review | referral ring/wash trade/collusion/duplicate/replay |
| Stale/forged operational health | HIGH | trusted status writer, server freshness, collector heartbeat, parity | false-green stale boundary/stopped collector/cache/API/DB/forged writer blocks status-dependent release |

Secrets/passwords/verifiers/session cookies/OAuth codes/client secrets/bot tokens/DB passwords/backup keys/raw verification or recovery tokens and unrestricted request bodies never enter general logs. Security events use pseudonymous IDs and safe classifications.

## 9. Profitability and business contract

No feature is approved from gross revenue alone. For every real-money/ad feature record: model, conversion path, displayed/test price, attach/paid conversion/repeat/renewal hypotheses, refund/churn/cancel, real ARPU/ARPDAU/ARPPU only where real revenue exists, eCPM/fill/CTR, platform/payment/tax/refund/chargeback cost, infra/storage/CDN/notification/LLM, content/CS/moderation/fraud/security cost, gross/contribution margin, CAC, LTV, LTV/CAC, payback, optimistic/base/conservative sensitivity, D1/D7/D30, trust/regulatory cost and predefined `SCALE/ITERATE/HOLD/KILL`.

- WLD-only shop/casino/bank/stock activity is not real revenue.
- Ads: `net contribution = ad revenue - estimated LTV loss from ad-induced churn/session reduction - ad infra/privacy/support/fraud cost`.
- SEO: measure incremental organic D30 retained users and CAC saving, not impressions alone.
- Security/QA/release/backup/status/GitOps: model avoided expected incident/data-loss/downtime/refund/fraud/support cost; do not invent currency amounts without measurements.
- Local auth: incremental D30 retained contribution minus SMTP/Argon2/DB/support/fraud/privacy/security cost.
- Status: false-green is a HOLD/KILL signal; `stale_operational_violation_count` target is zero.
- Release lineage: repeated Test convergence failures increase engineering/queue cost and reduce release throughput; measure candidate lead time, failed promotion attempts, rerun compute, operator time and escaped-defect avoidance.
- Future recurring billing must disclose material terms before charge, obtain affirmative consent and offer straightforward cancellation. Provider fees remain hypotheses until provider selection and current official-term review.

## 10. Backup and disaster recovery

Approve explicit RPO/RTO from acceptable identity/ledger/content loss and recovery cost; planning does not invent numbers. Measure RPO from the newest actually restorable point and RTO from a timed full drill. Back up authoritative PostgreSQL identity/economy/ledger/audit, migrations/schema/version/checksums, inventory/entitlement/content metadata, required object/photo storage and application/GitOps versions. Secret/key recovery uses a separate encrypted control plane.

A read replica, recovery DB, snapshot or dump sharing primary host/storage/failure domain or online credential is convenience, not independent DR. `VERIFIED_RESTORABLE` requires: clean isolated target → source identity → decrypt/key/checksum/manifest → full DB restore/PITR proof → migration parity → least-privilege app smoke with Production outbound disabled → referential integrity → ledger/balance reconciliation → inventory/entitlement/provenance → representative object restore → email/Discord/webhook/ads/indexing off → measured recoverable point and RTO → evidence/audit → controlled disposal/retention.

Destructive/schema-changing work requires current evidence: candidate SHA, backup ID/source/failure-domain, encryption/key result, checksum/manifest, restore drill/time, RPO/RTO status, migration parity, reconciliation, object sample, rollback target, operator identity and freshness. Missing/stale/corrupt/wrong-key/wrong-env/WAL-gap/reconciliation-failed/untested means `BLOCKED`.

## 11. QA, test, release, monitoring and rollback

### 11.1 Candidate sequence

Use §3 exactly. Test uses isolated namespace/DB, indexing off and real ads off. Test/recovery cannot send Production email/Discord/webhooks or mutate Production data. A successful CI or image build never substitutes for applied/runtime proof.

### 11.2 Monitoring

Observe API 4xx/5xx, auth/ATO, DB pool/transactions, migration parity, ledger reconciliation, duplicate reward/quota denials, entitlement failures, outbox/provider failures, ad-induced exits/CWV, crawl/index errors, backup freshness/restore, release evidence/rollback, Flux source/Kustomization applied revision, rollout replicas/digests, public exact-SHA probes, collector heartbeat, status-source snapshot age and stale-green violations. Missing monitoring data is not healthy by default.

### 11.3 Rollback rule

Rollback uses a known immutable application/image/GitOps target and a compatible DB contract. Applied migrations are not edited backward in place. If DB rollback is unsafe, application rollback must use backward-compatible schema or a forward corrective migration. Preserve incident evidence before cleanup.

## 12. UX, accessibility, growth and operations

First visit explains one clear product promise and game-only boundary before the whole economy. Activation is `visit → understand → sample/value → contextual signup → first meaningful verified action → result/reward → next goal`. D1 restores the chosen thread; D3 shows real change or honest no-change; D7 completes a coherent progression/collection/project/learning loop; D14 supports optional breadth; D30 leaves durable history/identity/collection.

Avoid punitive streaks, loss-threat FOMO, fake scarcity and excessive notifications; provide catch-up/comeback. Sharing favors public-safe achievements, collections, projects, seasons and learning results. Shared URLs contain no session token, private holdings, balances, debt, casino, recovery/security state or PII. Referral rewards prefer cosmetics/prestige/convenience after fraud-resistant maturity.

All flows cover loading/empty/error/offline/timeout, keyboard and focus, labels, contrast, reduced motion, mobile/tablet/desktop and EN/KO copy parity. High-risk account/economy/admin actions use explicit confirmation and anti-phishing UX. Admin/CS owns dispute/refund/report/abuse queues, feature flags, incident messaging and audit.

## 13. External-reference decisions — v2026.09.15.110

- Flux Kustomization current docs: **DIRECT ADOPT** for Test/Production evidence. `Ready`, reconciliation conditions/history, `lastAppliedRevision`, `lastAttemptedRevision` and applied origin revision are deployment evidence distinct from a Git commit or desired-state merge.
- GitHub protected-branch/status-check docs: **DIRECT ADOPT**. Required checks can enforce merge blocking and strict mode can require up-to-date branches. Current repository metadata shows required checks disabled, so REL-104-03 remains open.
- GitHub artifact attestation docs: **DIRECT SUPPLY-CHAIN EVIDENCE**. Provenance/SBOM strengthens evidence of how artifacts were built but does not prove that the cluster is actually serving that artifact.
- OWASP API Security Top 10 API4/API5/API6: **DIRECT SECURITY BASELINE** for resource/cost exhaustion, function authorization and automated abuse of sensitive business flows.
- Google Search Central canonical/noindex: **DIRECT SEO ADOPT**. Use crawlable `noindex` meta/header to exclude pages; do not treat robots blocking as a noindex or canonical mechanism. Keep canonical signals consistent.
- CISA ransomware/backup guidance and PostgreSQL backup/PITR documentation: **DIRECT RESILIENCE GUIDANCE** with full restore evidence still mandatory.
- Korea PIPC current privacy-policy guidance: **DIRECT DISCLOSURE DESIGN** so local-auth/analytics processing facts match public notices.
- FTC 2026 negative-option/subscription enforcement: **REFERENCE + PRODUCT GUARDRAIL** for clear recurring-payment terms, affirmative consent and straightforward cancellation; do not overstate jurisdiction.

## 14. Current evidence snapshot — v2026.09.15.110

- Start and mid-run application `main`: `a0b4d656f7bad17ff9ee0acb976358df9466a750`; no concurrent main movement was observed before the first v110 docs write.
- Branch metadata directly shows `main` protection enabled but required status-check enforcement `off`, with empty contexts/checks. REL-104-03 is confirmed open.
- Production `/status` around 08:08 KST still reported all services normal using 04:06 KST snapshots, extending OPS-107-01 false-green to more than four hours.
- Production `/guide` still contains unlimited profession-work/full-reward language and Discord/Google-only/no-separate-password wording. QA-104-01 and AUTH-105-01 remain open.
- Production privacy notice remains OAuth-centric and does not describe local credential processing, so broad local-auth rollout remains on hold.
- Issue #139 remains open; authorized Remote Desktop devices are offline, so no newer backup-medium or cluster evidence is claimed.
- PR #332 remains open and mergeable. Its head `b3f28185107a2f6f4a8bd389016de778df08b747` passed CI and Test Candidate image build. Infrastructure desired-state update reportedly merged, but public Test `/api/version` returned `1789391457242`, so exact-SHA staging failed and REL-110-01 is P0/BLOCKED.
- Production was not mutated by that candidate, so no Production rollback is required.
- v110 is planning/docs only: no runtime code, API, DB schema/data, migration, infrastructure, collector, backup medium, secret or branch-rule mutation is performed by this planning run.

### v2026.09.16.1 delta — composable stock discovery
`/stocks` discovery composes URL-backed `q` search with `sort=change|price|available|name`. Either control must preserve the other when changed, keeping the resulting view bookmarkable/shareable. Integer-string precision remains mandatory for economy values and invalid sort values fall back to API order.

## 2026-09-16 — v2026.09.16.138 adaptive profession/daily-limit integration

- Moneyverse Economy AI may jointly analyze and tune primary-profession slots, concurrently active professions, profession repeat-reward curves, and daily assignment/full-reward protection limits through the policy registry.
- Ordinary daily limits remain `null = unlimited` by default. A finite cap is a temporary protection action only after multi-window evidence, simulation, causal evaluation and deterministic guardrails pass; automatic relaxation and return-to-unlimited are mandatory.
- AI cannot silently replace or revoke an existing primary profession or erase mastery. Slot reductions require grandfathering or a separately human-approved migration.
- As with stock pricing, shop pricing and low-risk SKU generation, multi-agent models may generate profession-policy candidates, but a versioned deterministic policy gate retains final enforcement authority.

## 2026-09-16 — v2026.09.16.139 dual classical + AI economy control integration

- Economy automation now requires two continuously available analytical lanes: a classical/deterministic baseline and an AI/learned exploratory lane using the same immutable snapshot.
- The classical lane remains the operational fallback and authority for accounting, reconciliation, market matching/price bounds, policy constraints and safety. AI adds behavioral agents, counterfactuals, RL/MARL simulation, demand/product hypotheses and adversarial analysis.
- Strong cross-lane disagreement cannot be averaged into a live action. It falls back to `SHADOW`, `NO_OP` or human review; agreement only makes a candidate eligible for deterministic validation.
- The research pass created a deduplicated **11,749-record** OpenAlex+Crossref candidate corpus and committed a machine-readable manifest plus English/Korean review under `docs/findings/`. The corpus supports discovery breadth; production decisions still require primary evidence, current runtime data and causal post-rollout evaluation.
### v2026.09.16.6 — trade-history summary
Read-only filtered-history summary added to /stocks/history; no economy mutation or schema change. Exact-SHA runtime verification remains required before promotion.

## 2026-09-16 — v2026.09.16.141 paired specialist economy AI runtime

- Implement the economy AI lane as six specialist domains with two independently configurable A/B seats per domain, independent-pass + rebuttal-pass debate, domain disagreement abstention and safety-critical paired vetoes.
- Preserve the existing deterministic economy engine as the continuously available classical lane; AI unavailability never becomes an economy-service outage.
- Store exact proposal hashes, expiry, aggregate decision and all 12 final seat artifacts before deterministic arbitration.
- Place local AI model/cache/dataset artifacts on the 100GB `/srv/moneyverse-data` disk rather than the 32GB system disk.


## 2026-09-16 — v2026.09.16.152 runtime-authority, release, Work-clock and cross-cutting integration

### Evidence snapshot and release authority

- **Observed application main:** `d6cf13d4236bd1298010ae5f165b15899356a59d` at this planning integration point; re-check immediately before merge because the repository remains active.
- `v2026.09.16.151` runtime evidence supersedes the older assumption that Kubernetes/Flux is the current public authority. Public Test and Production are currently served by the approved Debian 13 host through separate systemd release directories and a local PostgreSQL authority path. The NixOS/Kubernetes node is a **recovery target, not current Production authority**.
- Public Test, public Production, application/GitOps desired references were recorded as converged on application SHA `3d87165f83bcb60903e85d4f3600fdf40074ef40`; Production Flux `apps` remains suspended until cluster-admin access and DB reconciliation are independently proven.
- `REL-110-01 / P0` therefore changes from generic exact-SHA divergence to **RECOVERY_IN_PROGRESS / AUTHORITY_SPLIT_CONTAINED**. It is not DONE while Kubernetes access, DB reconciliation and controlled return-to-Flux are incomplete.
- Current-main `Build Production Release #878` was still `in_progress` when checked. A docs commit, candidate build, GitOps declaration or prior runtime convergence is not evidence that this newer main SHA is live. Promotion remains fail-closed until exact-main Test evidence, backend/API/DB/user-flow QA and Production smoke exist for the promoted SHA.

### OPS-RUNTIME-152-01 — dual control-plane / authority ambiguity

- **Priority/severity/status:** P0 / CRITICAL operational integrity / IN PROGRESS.
- **First observed:** 2026-09-16 incident recovery; **latest reproduction:** v151 runtime-authority record on current main.
- **Impact:** deploy/rollback, DB writes, backup/restore, incident response, version truth and operator decisions can target the wrong control plane if Debian systemd and suspended Kubernetes are treated as co-authoritative.
- **Confirmed cause:** the intended Flux/Kubernetes control plane lost usable administrator access while public service was recovered on the Debian host. Documentation previously described Kubernetes as authoritative after runtime authority had moved.
- **Implementation design:** introduce one machine-readable `runtime-authority.json` owned by operations with `environment`, `authority_generation`, `runtime_type`, `host/workload identity`, `application_sha`, `db_authority_id`, `desired_gitops_sha`, `flux_suspended`, `verified_at`, `evidence_run`, and `rollback_target`. Release automation must read this contract and refuse an authority-changing action if its generation changed after the run began.
- **DB migration/data:** no product-data migration merely to record authority. Before Kubernetes reactivation, compare schema migration set/checksums, ledger invariants, critical row counts and a bounded reconciliation snapshot between the current Debian PostgreSQL authority and candidate cluster DB. Never merge two writable DB authorities. Select one source of truth and perform a rehearsed one-way migration/cutover.
- **Rollback:** while Debian remains authority, rollback means last verified Debian release + its compatible DB state; do not unsuspend Flux as a rollback shortcut. Kubernetes return requires a separately approved cutover plan.
- **Tests/gates:** exact-SHA Test; DB connectivity/schema; read/write canary on non-economic probe data; ledger reconciliation; backup restore rehearsal; DNS/tunnel routing; process restart; stale GitOps negative test; authority-generation race test. Production promotion is blocked on any ambiguous authority, dual writer, stale schema or missing rollback evidence.
- **Monitoring:** public `/api/version`, service working directory/release SHA, DB authority fingerprint, GitOps desired SHA, Flux suspend state, schema version, backup freshness and reconciliation drift. Alert when any two authority signals disagree for >5 minutes.

### OPS-FLUX-150-01 — privileged recovery cleanup

- Jump-host/SSH recovery is incident tooling, not a permanent deployment backdoor. Private keys, kubeconfig, DB credentials and bearer/session secrets must never enter repository content, artifacts or ordinary logs.
- Recovery completion requires removal of temporary authorized keys/capabilities, immutable operator/run audit, pinned host-key evidence, explicit Flux suspend/resume decision, and post-incident verification that the workflow cannot mutate Production without the normal approval boundary.
- Controller restart is a privileged incident action. Capture source revision, last-applied/attempted revision, readiness/events before and after restart; a successful restart does not establish root cause.
- Apply OWASP ASVS 5.0 verification principles and API Security 2023 access-control/resource-consumption boundaries to operational APIs and automation: least privilege, bounded execution, explicit authorization, tamper-evident audit and fail-closed secret handling.

### WORK-CLOCK-149-01 — dashboard/write-clock convergence

- **Priority/severity/status:** P1 correctness with economy-integrity implications / HIGH / FIX PENDING in PR #370.
- Settlement already uses the accelerated Moneyverse server clock, while the legacy `work_my_dashboard` read model can use real Asia/Seoul day/week windows. This can display a different `daily_paid`/`weekly_paid` quota window from the one the settlement path enforces.
- Migration 202 must make dashboard day/week keys use the same authoritative `server_game_day_key()` / `server_game_week_key()` contract as settlement. Applied migrations remain immutable; migration-number uniqueness and checksum immutability become hard CI gates.
- QA: boundary -1/0/+1 second, accelerated day rollover, accelerated week rollover, concurrent completions, idempotent retry, restart, timezone configuration, stale dashboard cache, API/UI parity and real-PostgreSQL regression. Acceptance requires settlement and dashboard to resolve identical keys for every tested instant.
- UX: show the next reset using server-authoritative time; loading/error/offline states must not invent remaining quota. Accessibility must expose reset time and quota text without relying on color alone. Mobile/desktop semantics are identical.
- Analytics/business: this is not revenue. Measure work-flow completion, quota-confusion support contacts, retry/error rate and D1/D7/D30 job retention. Scale only if correctness is preserved; no retention gain can justify inconsistent reward authority.

### Cross-cutting current feature contracts

- **Auth/session/security center:** session actor remains the authority; OAuth/OIDC uses state/nonce/PKCE where applicable, session rotation/revocation and recent reauthentication protect sensitive changes. BOLA/BFLA negative tests are mandatory for profile, admin, stock, bank, business, community and telemetry objects.
- **Economy/inventory/shop/payment/subscription:** all value changes are server-authoritative, integer-safe, transactional and idempotent. Product price shown by the client is never settlement authority. Real-money SKUs require receipt/webhook verification, account entitlement reconciliation, refund/revoke/restore state machines and append-only audit. Unknown conversion/ARPU/ARPPU/refund/churn/CAC/LTV values remain `HYPOTHESIS`/`TEST TARGET`.
- **Jobs/quests/levels/rewards:** reward grant and quota windows use the server game clock, durable receipt/idempotency keys and append-only ledger. Client timers are display-only.
- **Bank/loan/business/virtual stocks:** simulated/game-only labeling is mandatory. Interest, loan eligibility, stock execution, business settlement and portfolio history remain DB/server authoritative; no real-security/deposit/yield claim is allowed.
- **Casino/probability systems:** themed UI action contracts must map to one typed server action schema. Client RNG/animation never decides payout. Eligibility, bet debit, server RNG, payout, ledger, audit and idempotency execute atomically; retries return the same receipt.
- **Community/friends/clubs/referral:** moderation, block/report, invite/referral anti-replay and rate limits are required. Referral reward issuance is server-side, idempotent and fraud-observable; multi-account signals trigger review/risk controls rather than an undocumented single-signal ban.
- **Notifications/Discord/email/push:** external delivery is post-commit/outbox based. Delivery failure cannot roll back an already committed economy transaction; retries are bounded and deduplicated.
- **Search/gallery/upload/public content:** uploads require content-type/signature validation, size/dimension limits, generated storage names, malware/content checks where appropriate, private-by-default ownership and safe download headers. Public UGC has moderation/index-policy state separate from publication state.
- **Admin/audit/analytics:** raw telemetry and aggregate analytics permissions are separate. Sensitive raw IP/session/user-agent access requires recent reauth, purpose capture and audit; retention/minimization apply. Admin mutations require explicit function-level authorization and reason/idempotency where value or policy changes.
- **Backup/restore/operations:** backup existence is not recovery evidence. Maintain independent restore rehearsal, RPO/RTO evidence, encrypted/off-host copies, schema/application compatibility and a documented authority cutover. A restore that has not been rehearsed is `UNVERIFIED`.

### SEO and SEO backend

- Latest Google Search material checked this round did not change Moneyverse's core indexing contract; the 2026-08-28 site-reputation update remains relevant to third-party/sponsored/UGC governance. Do not create third-party sections primarily to borrow host reputation.
- Public SEO read models carry stable canonical identity, slug/redirect history, `updatedAt/lastModified`, language, ownership/editorial/sponsor/index-policy state, image metadata and structured-data inputs. Private/account/admin/transaction/casino-history/payment-callback surfaces are forced `noindex` and excluded from sitemaps.
- Dynamic sitemap/robots generation must be deterministic from publish/index state, split before search-engine limits, expose stable `lastmod`, and never leak private object IDs. Naver robots validation and sitemap discovery are part of Korean-market smoke; Google/Naver representative URL inspection follows deploys that change rendering/index policy.
- Public pages use SSR/ISR or equivalent crawlable server output, stable canonical, hreflang for genuinely translated equivalents, descriptive title/H1, breadcrumbs/internal links where useful, OG metadata, image dimensions/alt, and JSON-LD only when the visible content actually satisfies the schema. Filter/query permutations are canonicalized or noindexed; deleted content uses 404/410 and moved permanent content uses one-hop permanent redirects.
- Performance guardrails: monitor LCP/INP/CLS by public template and device class; SEO release is blocked on accidental robots/noindex/canonical regressions, sitemap/private leakage or structured-data mismatch. Organic KPI chain is impressions → CTR → visit → signup → activation → D7/D30 → payer/ad contribution, not impressions alone.

### Monetization and unit-economics gate

- Google Play's current fee policy is market/cohort/transaction dependent; never model one universal store rate. For EEA/UK/US transactions under the June 30 2026 structure, standard auto-renewing subscriptions are 10% service fee, other new-install transactions 20% and other existing-install transactions 25%, with a 5% billing fee when Play Billing applies. Remaining markets use the applicable pre-rollout/program rules until their announced rollout.
- Every real-money SKU therefore stores/model-tests `market`, effective-date/install cohort, recurring/non-recurring type, billing path/program, gross price, platform/billing fee, tax assumption, refund/fraud loss, entitlement/support/infra cost and contribution margin. Discounts are rejected when contribution margin or fairness guardrails fail.
- Shop/payment/subscription scale criteria require positive contribution margin under the base scenario, bounded refund/fraud/support cost and no material D7/D30 or trust regression. Iterate when conversion exists but margin/retention guardrails miss; kill when negative contribution persists or monetization creates P2W/dark-pattern/regulatory risk.
- Ads are evaluated as incremental ad net revenue minus ad-induced session/retention loss and support/privacy cost. SEO is evaluated as CAC reduction and downstream activation/LTV, while security/QA/operations are evaluated as avoided incident, fraud, refund, downtime and operator cost.

### Release and backlog order

`P0 runtime authority / exact-SHA truth → P0 independent backup+restore evidence → P0 false-green/status truth → HIGH privileged recovery cleanup → HIGH migration sequence + Work clock convergence → HIGH repository required-check enforcement → HIGH economy/admin/casino authorization and integrity → P1 core feature correctness → payment/shop unit economics → SEO acquisition → retention/growth → accessibility/long-term expansion`.

This v152 planning integration changes documentation only. It does not deploy runtime code, mutate product data/DB schema, unsuspend Flux, rotate credentials or promote Production. Runtime implementation continues through a new branch, tests/CI, exact-SHA Test, backend/API/DB/user-flow QA, main integration, Production promotion, smoke and rollback evidence.


## 18. Hourly integration delta — v2026.09.16.153

### 18.1 Evidence snapshot and release truth

- Evidence date: 2026-09-16. Planning base at the start and mid-run remained `main` `9ca10bed71bf0175c146324ee9e6eca111f35ad8`; no source drift was observed before this documentation branch was cut.
- `Build Production Release #880` for that exact `main` SHA was still `in_progress` when inspected. Therefore current-main Production verification is `UNVERIFIED`; a documentation merge, skipped auto-promotion, or an in-progress release is not release evidence.
- `REL-110/REL-133` remains P0 until exact Test workload SHA, public Test SHA, backend readiness, authoritative DB path/schema, then Production SHA and smoke evidence all agree. A timeout/rerun alone does not close the incident.
- Open PR #370 (`WORK-CLOCK-149-01`) is currently non-mergeable against the newer main and remains `HIGH / FIX_PENDING`. Rebase/update must preserve immutable migration numbering and rerun real-PostgreSQL accelerated day/week boundary tests before merge.

### 18.2 Implementable backlog delta

1. `REL-EVIDENCE-153-01 / P0 / IN_PROGRESS`: every release attempt emits an `always()` evidence bundle containing release SHA, desired/applied revision, workload generation, image digest, pod-local/public version SHA, backend readiness, DB authority/schema checksum, first failing layer, timestamps/latencies and rollback target. Secrets, cookies, Authorization headers, DSNs and private keys are forbidden. Acceptance: failed releases with missing evidence = 0; Production promotion when any exact-SHA/DB assertion differs = 0.
2. `WORK-CLOCK-149-01 / HIGH / FIX_PENDING`: the dashboard and settlement must use the same authoritative `server_game_day_key()`/`server_game_week_key()`. Test `boundary -1/0/+1s`, 10-real-minute game-day rollover, 70-real-minute game-week rollover, concurrent completion, retry/idempotency, process restart and DB timezone changes. Migration rollback is forward-only correction; applied migrations are never edited or renumbered.
3. `SEO-153-01 / P1 / ADOPT`: Google Search Central's current September 8 update adds regional Search-experience documentation, while the August 28 site-reputation-policy update remains material. Moneyverse must not present WDX/game stocks as real financial-provider content to qualify for finance surfaces. Public SEO read models retain content owner/editorial control/sponsor/index policy; account, transaction, casino-history, payment-callback and admin surfaces remain `noindex` and sitemap-excluded. Favicon QA keeps a stable square URL, crawlable home page and crawlable favicon asset.
4. `MONETIZATION-153-01 / P1 / ADOPT`: Google Play has no single universal fee. Unit economics must key on market, effective-date/install cohort, recurring vs non-recurring transaction, billing path and enrolled program. For EEA/UK/US from 2026-06-30, standard auto-renewing subscriptions are 10%, other new-install transactions 20%, existing-install transactions 25%, plus the 5% billing fee when applicable. Remaining markets keep their currently applicable program rules until rollout. All conversion, ARPU/ARPDAU/ARPPU, churn, refund, CAC and LTV figures remain `HYPOTHESIS/TEST TARGET` until measured.

### 18.3 Cross-functional completion gates

No P0/HIGH item is `DONE` from documentation alone. Required flow remains branch → static/unit/integration/real-DB/security tests → immutable candidate → isolated exact-SHA Test → backend/API/DB/user-flow QA → main → exact-main re-test → Production promotion → smoke/monitoring → rollback if required. Revenue or growth work cannot bypass data-loss, authorization, economy-integrity, DB-integrity, backup/restore or release-truth gates.

### 18.4 v153 worklog

External references rechecked: Google Search Central September 2026 updates and August 28 site-reputation policy; OWASP API Security Top 10/ASVS baseline; Google Play current service-fee documentation. Repository evidence rechecked: main SHA, both v152 integrated plans, current Actions state and open PR #370. Decision: no speculative runtime promotion; preserve P0 release truth, add exact release-evidence acceptance, keep Work-clock fix blocked until mergeability/exact-SHA real-DB QA, and retain market/cohort-aware monetization math. Runtime code, DB, Flux and Production were not changed by this planning run.


## v2026.09.16.154 — hourly evidence refresh

### Release/CI evidence — REL-EVIDENCE-154-01 — P0 — IN PROGRESS
- Evidence captured 2026-09-16: current `main` is `83f00a978e8e1bed0c5b94a7b4cda81893f4c669` (`docs: integrate Moneyverse plan v2026.09.16.153 (#379)`). Mid-run re-check returned the same SHA; no planning-time main drift was observed.
- The exact-main `Build Test Candidate #740` verification job passed lint, typecheck, build, migrations, tests, Prisma-mutation rejection and production dependency audit. At observation time its image build job was still in progress after the backend candidate image completed while the frontend candidate image was building. This is `CI verification green / candidate image build pending`, not isolated-Test or Production evidence.
- Branch metadata still reports protection enabled but required-status-check enforcement `off` with no required contexts/checks. `REL-104-03` therefore remains confirmed and HIGH/P1 until runtime-sensitive paths are repository-enforced.
- Acceptance remains fail-closed: candidate image completion alone cannot advance beyond `IMAGE_BUILT`; isolated Test must prove exact SHA/digests, backend/API/DB path, least-privilege DB access, changed-feature QA and noindex before main/Production promotion. Every failed or timed-out attempt must retain machine-readable expected/observed evidence without secrets.

### Work clock integrity — WORK-CLOCK-149-01 — HIGH — FIX PENDING / REBASE REQUIRED
- PR #370 remains open with head `8ff8314a4425f874508b3d8d966e95ae40450b2a` while its recorded base SHA is `3d87165f83bcb60903e85d4f3600fdf40074ef40`; current main has advanced. The fix aligns `work_my_dashboard.daily_paid/weekly_paid` with `server_game_day_key()` / `server_game_week_key()` and adds real-PostgreSQL regression coverage.
- Before merge, rebase/reconcile against current main, re-run duplicate/immutable migration checks and real-DB tests, then require exact-head isolated Test evidence. Do not edit or rename an already-applied migration; conflicts are resolved by a new forward migration.
- QA: game-day/week boundary -1/0/+1 second, 10-real-minute day and 70-real-minute week rollover, concurrent completion, duplicate/retry idempotency, process restart, DB timezone, stale read-model/cache, and equality between settlement authority and dashboard counters.

### SEO/SEO backend refresh
- Fresh Google Search Central posts dated 2026-09-08 and 2026-09-14 are event announcements, not a crawl/index contract change. The 2026-08-28 site-reputation-policy update remains applicable: third-party sponsor/affiliate/UGC must not exploit Moneyverse host reputation.
- Public SEO read models continue to own canonical URL, slug/redirect history, title/description/H1, index policy, content owner/editorial control/sponsor type, locale/hreflang, updatedAt/lastModified, image metadata and structured-data inputs. Account/admin/payment callback/private transaction/casino-history surfaces remain sitemap-excluded and `noindex`.
- Naver official guidance confirms robots.txt sitemap discovery, per-page robots meta, and crawlability of rendering-critical JS/resources. Release QA therefore verifies robots → sitemap → canonical → server-rendered content/resources → representative Google/Naver URL inspection.

### Security and business/economics refresh
- OWASP API Security Top 10 remains the API threat baseline and ASVS remains the verification baseline. No P0/HIGH control is relaxed: actor-scoped authorization, recent reauth for sensitive admin operations, DB least privilege, BOLA/BFLA negative tests, CSRF/XSS/SQLi/SSRF/upload controls, bounded resource/business-flow limits, idempotency/replay prevention, append-only audit and secret-safe logs remain release gates.
- Google Play's current fee documentation states there is no single universal fee. For EEA/UK/US from 2026-06-30, standard auto-renewing subscriptions are 10%, other new-install transactions 20%, other existing-install transactions 25%, with a 5% billing fee where Play Billing applies. AU/JP rollout is 2026-09-30 and KR 2026-12-31, so Korean unit economics must not prematurely apply the future regional schedule.
- SKU models therefore key assumptions by market × effective date/install cohort × transaction type × billing path × programme and calculate gross → platform/billing fee → tax/refund/fraud → entitlement/infra/support → contribution margin. Conversion, ARPU/ARPDAU/ARPPU, churn, refund, CAC and LTV remain `HYPOTHESIS`/`TEST TARGET` until measured.

### v154 worklog
- Sources checked: Google Search Central current September posts and 2026-08 site-reputation update; Naver Search Advisor robots/meta/resource guidance; OWASP API/ASVS baseline; Google Play current service-fee/timeline guidance; GitHub main/branch protection, Actions and PR #370.
- Adopted: exact-main CI state separation, repository-enforcement finding, PR #370 rebase+real-DB gate, SEO crawler/resource contract, market/effective-date-aware fee model.
- Deferred: no runtime, DB, Flux or Production mutation from planning automation. `Build Test Candidate #740` was still running when captured, so no Test/Production pass is claimed.


## v2026.09.16.155 — hourly release-truth and external-reference refresh

### REL-EVIDENCE-155-01 — P0 — IN PROGRESS
- Planning start/mid-run authority is `main` `a4455ad342fbf66a128c1221c25b45ff4d20d6bf`. `Build Production Release #882` for this exact SHA is currently `in_progress`; its immutable-SHA resolution passed and `Wait for exact SHA on isolated test and verify backend/database path` is still running. This is not Test or Production success.
- Repeated release-gate failures remain a root-cause-removal item. The test-gate must emit expected/observed `release_sha`, GitOps desired/applied revision, Deployment generation, ReplicaSet/Pod image digest, pod-local/public version, backend readiness, DB authority/schema checksum, first mismatch layer, probe timestamps/latencies and rollback target on both success and failure. Secret-bearing headers, cookies, DSNs, keys and tokens are forbidden from evidence.
- Acceptance: no promotion when any exact-SHA/DB assertion differs; failed/timeout attempts retain complete non-secret evidence; after repair the same candidate proves source→image→desired→applied→workload→public→DB lineage, then exact-main retest and Production smoke.

### SEO/SEO-backend decision refresh
- Google Search Central posts dated 2026-09-08 and 2026-09-14 are event announcements, so they do not change crawl/index contracts. The 2026-08-28 site-reputation-policy update remains directly applicable to sponsor/affiliate/UGC governance.
- Favicon QA follows current Google guidance: crawlable homepage and favicon for Googlebot/Googlebot-Image, stable URL, square asset, preferably >48×48. Public metadata/canonical/sitemap/structured-data/private-noindex contracts remain unchanged.
- Google's European Search Dataset Licensing Program is not an SEO ranking shortcut and is excluded from product scope unless Moneyverse separately qualifies and accepts its independent assurance/privacy obligations.

### Security and AI boundary refresh
- OWASP API Security Top 10 remains the general API baseline and ASVS remains the verification baseline. OWASP GenAI Security Project's 2026 LLM Top 10/Agent Control Standard is additionally adopted only for the planned economy-AI/agent lane: model/tool authorization, prompt/data provenance, bounded tool permissions, output validation, model/dataset supply-chain controls, secret isolation, auditability and deterministic economy arbitration are mandatory. AI cannot directly mutate ledger/balance/entitlement or bypass the classical safety lane.
- AI disagreement, unavailable model, malformed output, expired proposal or missing provenance yields `NO_OP`/shadow/human review, never a silent live economy action.

### Monetization/business refresh
- Google Play current service-fee documentation remains market/cohort/program dependent. EEA/UK/US updated fees are already effective; remaining markets use their applicable pre-rollout/program terms until rollout. SKU models therefore retain market × effective-date/install-cohort × transaction-type × billing-path × programme keys.
- No unmeasured conversion, ARPU/ARPDAU/ARPPU, churn, refund, CAC or LTV is promoted from hypothesis to fact. Release-control/backup/status work is valued through avoided downtime, fraud, refund, support and operator cost rather than invented revenue.

### v155 worklog
- Sources checked: current Google Search Central September posts and August site-reputation update, Google favicon guidance, Google European Search Dataset Licensing Program, OWASP API/ASVS baseline and OWASP GenAI 2026 guidance, Google Play current fee documentation, current GitHub main and Actions.
- Runtime code, DB, Flux and Production are not changed by this planning integration. Priority remains P0 release truth → independent restore evidence → false-green status → privileged recovery cleanup → migration/Work-clock integrity → repository enforcement → economy/admin/casino authorization → core correctness → monetization → SEO/growth/accessibility.
