# Woldeok Moneyverse — Living Project Plan

> Status: Living specification / current authoritative integrated plan
> Original baseline: 2026-08-26
> Current integrated version: v2026.09.17.165
> Implementation/evidence sync: 2026-09-17
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


## v2026.09.16.156 — casino runtime incident and release-host hygiene refresh

### CASINO-RUNTIME-156-01 — HIGH — FIX MERGED / PRODUCTION REVERIFY REQUIRED
- Production evidence on 2026-09-16: casino interaction could enter the global error boundary; digest `3286936712@E352` mapped to `A "use server" file can only export async functions, found object.` The merged root-cause fix is `main` `23ae36082b8a4875797314682efef8e99b8b9484` (#383). `CasinoPlayState`/`CASINO_IDLE` moved to a client-safe module, synchronous re-export was removed from the `use server` file, and a static regression test now rejects non-async runtime exports.
- Impact: casino browser play/recovery UX. Settlement authority, ledger, balance and DB schema were not changed. Error recovery must not encourage duplicate submission: after an ambiguous browser failure, refresh/read recent server-authoritative play history and wallet before another bet; replay remains protected by idempotency.
- QA: merged evidence is focused casino 14/14, typecheck pass, ESLint 0 errors with 11 unrelated warnings, production build pass. Current-main Build Test Candidate #749 is still running; therefore this is not exact-main Test or Production verification. Acceptance requires exact SHA Test, API/user-flow regression, duplicate-submit/idempotency negative cases, public runtime SHA, then Production smoke and absence of the recorded server-action error.

### OPS-CACHE-156-01 — HIGH — MITIGATED RUNTIME / PERMANENT FIX TODO
- The active Debian frontend runs as `debian` while `.next/cache/fetch-cache` had root-owned files, causing repeated `EACCES`. Ownership was repaired live to `debian:debian`; no member/ledger/settlement data changed.
- Root-cause-removal design: release assembly and service startup must never create writable runtime paths as root. Pre-start verifies uid/gid and writable cache/temp/upload paths; immutable release files remain read-only, mutable cache is an explicitly owned runtime directory. A mismatch fails deployment before traffic.
- Test/monitoring: clean-host install, upgrade, rollback, restart and cache-rebuild tests; assert zero `EACCES` for runtime paths; alert on permission-denied rate and cache write failures. Rollback restores the last verified release plus its ownership manifest, never `chmod -R 777`.

### External-reference and business decision refresh
- Google Search Central posts dated 2026-09-08 and 2026-09-14 remain event announcements, not crawl/index policy changes. The 2026-08-28 site-reputation policy remains applicable to sponsor/affiliate/UGC governance. Current favicon requirements remain crawlable homepage/favicon, stable URL and square asset.
- OWASP API Security Top 10 remains the general API baseline; the planned economy-AI lane additionally uses the OWASP GenAI 2026 controls already specified in v155.
- Google Play fee modeling remains market/cohort/program/effective-date aware. For markets not yet migrated to the announced new schedule, do not prematurely apply the EEA/UK/US new-install rates. Unmeasured commercial metrics remain hypotheses/test targets.

### v156 worklog
- Sources checked: Google Search Central September posts and August site-reputation update; Google favicon guidance; OWASP API/GenAI current guidance; Google Play current fee documentation; current GitHub main, merged #383, open #382/#381 and exact-main Actions.
- Planning automation changed documentation only. Runtime code/DB/Flux/Production promotion were not performed here. Priority remains release truth/restore/status P0, then cache/recovery/migration/authorization HIGH before feature expansion.

## v2026.09.16.157 — casino contract correctness and release-truth refresh

### CASINO-CONTRACT-157-01 — HIGH — FIX MERGED / EXACT-SHA REVERIFY REQUIRED
- First/latest evidence: merged PR #384 on 2026-09-16, current `main` `f6fd312025dcb9c517edfa2ad4986de0db1df54d`. A formatted stake reached `wholeAmount()` as a string while casino DTOs intentionally accept JSON integers; valid bets such as 10 WLD therefore returned HTTP 400. The merged fix converts bounded stakes to JSON numbers and adds dice parity/number server-result visual stages. PR evidence reports frontend 609 tests, backend casino E2E 29 tests, typecheck and production build passed, lint 0 errors with 11 pre-existing image warnings.
- User/UX contract: casino entry → game selection → stake input → explicit play CTA → pending state with duplicate CTA disabled → authoritative server result → wallet/recent-play reconciliation. Empty stake, non-integer, below/above server limits, insufficient balance, timeout, 4xx validation, 401/403 auth, 409/idempotency conflict and 5xx all render distinct recoverable states. On ambiguous timeout/5xx the client MUST NOT suggest a second bet until recent authoritative play and wallet are reconciled.
- API contract: request numeric JSON is an adapter concern only; the server remains authoritative for integer/range/balance/eligibility/session/rate-limit/idempotency validation. Numeric strings remain rejected unless the API contract is intentionally versioned. Monetary values outside JavaScript safe-integer bounds must never be coerced through `Number`; endpoint bounds must prove the accepted casino stake is safe or use a string-safe versioned money DTO consistently end-to-end.
- DB/concurrency: settlement remains one transaction with actor/idempotency uniqueness, balance/ledger invariants and append-only audit. Concurrent duplicate requests with the same idempotency key return/recover the same authoritative result; distinct concurrent requests still pass server balance/limit checks serializably enough to prevent negative balance or duplicate payout.
- Security/abuse: treat casino play as an OWASP sensitive business flow. Prevent BOLA/BFLA, replay, automation/resource abuse, forged result/payout, client-side odds/stake authority and log leakage. Detect abnormal request velocity, duplicate-key conflicts, validation-failure spikes and payout/ledger reconciliation mismatch. No real-money/redemption/gambling-return representation is introduced.
- Migration/rollback: no schema migration is required by this adapter fix. Rollback is the last verified immutable frontend/backend pair; if contract mismatch returns after rollback, casino play is feature-flagged unavailable rather than weakening server DTO validation.
- QA: boundary min-1/min/min+1/max-1/max/max+1, formatted input, decimals, negatives, zero, huge integer, numeric string direct API negative test, insufficient funds, expired session, duplicate click, retry after timeout, concurrent bets, all dice result variants, keyboard/screen-reader pending/result announcements, mobile/tablet/desktop, wallet/recent-play reconciliation and real PostgreSQL ledger invariants.
- Promotion: current-main CI alone is insufficient. `Build Production Release #888` was `in_progress` at capture. DONE requires exact `f6fd312...` isolated Test lineage, backend/API/DB/casino QA, public exact SHA, then Production smoke with casino HTTP-400 contract failures and settlement reconciliation alerts at zero unexpected events.
- KPI/business: direct revenue is not assumed. Track play-start→accepted-play conversion, validation-error rate, ambiguous-result support contacts, D1/D7 casino return, fraud/reconciliation loss and support cost. Any monetization remains separate legal/product review; correctness must not be traded for higher play frequency.

### REL-EVIDENCE-157-01 — P0 — IN PROGRESS
- `Build Production Release #888` for exact current main was running at capture. Evidence states remain distinct: source commit → CI → immutable image digest → GitOps desired → applied revision → workload digest → pod-local version → public Test version → backend readiness → authoritative DB/schema → changed-feature QA → main exact retest → Production promotion/smoke.
- Success and failure bundles record expected/observed SHA/digest/revision, workload generation, first mismatch layer, timestamps/latencies and rollback target. Secrets, cookies, Authorization headers, DSNs and private keys are forbidden. Any missing/wrong/stale P0 evidence is `BLOCKED`, not pass.
- Repository protection is still insufficient: current `main` metadata reports protection enabled but required-status-check enforcement `off` with no required contexts/checks. Runtime paths must gain repository-enforced reviewed integration and selected trusted checks without turning docs automation into a runtime bypass.

### SEO/security/economics reference decisions
- Google Search Central posts dated 2026-09-08 and 2026-09-14 are event announcements, so they do not change crawl/index contracts. The 2026-09-08 documentation update on regional Search experiences is informational; Moneyverse virtual stocks/WDX must not be presented as an authoritative real-finance provider to chase EEA finance carousels. The 2026-08-28 site-reputation policy remains directly applicable to sponsored/affiliate/UGC governance.
- Favicon QA follows current Google requirements: crawlable homepage and favicon, stable URL, square asset, with >48×48 recommended. Public SEO read-model/canonical/robots/sitemap/lastModified/structured-data/hreflang/SSR-or-equivalent/CWV and private/account/admin/transaction noindex contracts remain mandatory.
- Security baseline remains OWASP ASVS 5.0.0 plus API Security Top 10. Casino receives explicit sensitive-business-flow/replay/resource-abuse controls; authentication/session/admin/economy/upload/SSRF/BOLA/BFLA/least-privilege/audit/backup gates remain fail-closed.
- Google Play service fees are not one universal rate. Unit economics use `market × effective-date/install-cohort × transaction-type × billing-path × programme`. For EEA/UK/US from 2026-06-30, current standard examples are 10% auto-renewing subscription, 20% other new-install and 25% other existing-install service fees, with a 5% billing fee where Play Billing applies. Markets not yet on the announced rollout use their currently applicable program rules. All unmeasured conversion/ARPU/ARPDAU/ARPPU/churn/refund/CAC/LTV values remain `HYPOTHESIS`/`TEST TARGET`.

### v157 worklog and implementation backlog
- External research: Google Search Central September updates/site-reputation/favicon/regional Search documentation; OWASP baseline retained; Google Play current service-fee guidance. Runtime/code evidence: current main, PR #384, Actions #888 and branch protection.
- Development order: P0 exact-SHA/runtime/DB evidence → independent restorable backup → false-green status → HIGH casino contract exact-runtime verification → runtime writable-path ownership → privileged recovery → migration/Work-clock integrity → repository enforcement → economy/admin/casino authorization → core completeness → monetization → SEO/growth/accessibility.
- Planning automation changed documentation only. Implementation remains `new branch → tests/CI → isolated exact-SHA Test → backend/API/DB/user-flow QA → main → exact-main retest → Production promotion → smoke/monitoring/rollback`.


## v2026.09.16.157 — casino contract correctness and release-truth refresh

### CASINO-CONTRACT-157-01 — HIGH — FIX MERGED / EXACT-SHA REVERIFY REQUIRED
- First/latest evidence: merged PR #384 on 2026-09-16, current `main` `f6fd312025dcb9c517edfa2ad4986de0db1df54d`. A formatted stake reached `wholeAmount()` as a string while casino DTOs intentionally accept JSON integers; valid bets such as 10 WLD therefore returned HTTP 400. The merged fix converts bounded stakes to JSON numbers and adds dice parity/number server-result visual stages. PR evidence reports frontend 609 tests, backend casino E2E 29 tests, typecheck and production build passed, lint 0 errors with 11 pre-existing image warnings.
- User/UX contract: casino entry → game selection → stake input → explicit play CTA → pending state with duplicate CTA disabled → authoritative server result → wallet/recent-play reconciliation. Empty stake, non-integer, below/above server limits, insufficient balance, timeout, 4xx validation, 401/403 auth, 409/idempotency conflict and 5xx all render distinct recoverable states. On ambiguous timeout/5xx the client MUST NOT suggest a second bet until recent authoritative play and wallet are reconciled.
- API contract: request numeric JSON is an adapter concern only; the server remains authoritative for integer/range/balance/eligibility/session/rate-limit/idempotency validation. Numeric strings remain rejected unless the API contract is intentionally versioned. Monetary values outside JavaScript safe-integer bounds must never be coerced through `Number`; endpoint bounds must prove the accepted casino stake is safe or use a string-safe versioned money DTO consistently end-to-end.
- DB/concurrency: settlement remains one transaction with actor/idempotency uniqueness, balance/ledger invariants and append-only audit. Concurrent duplicate requests with the same idempotency key return/recover the same authoritative result; distinct concurrent requests still pass server balance/limit checks serializably enough to prevent negative balance or duplicate payout.
- Security/abuse: treat casino play as an OWASP sensitive business flow. Prevent BOLA/BFLA, replay, automation/resource abuse, forged result/payout, client-side odds/stake authority and log leakage. Detect abnormal request velocity, duplicate-key conflicts, validation-failure spikes and payout/ledger reconciliation mismatch. No real-money/redemption/gambling-return representation is introduced.
- Migration/rollback: no schema migration is required by this adapter fix. Rollback is the last verified immutable frontend/backend pair; if contract mismatch returns after rollback, casino play is feature-flagged unavailable rather than weakening server DTO validation.
- QA: boundary min-1/min/min+1/max-1/max/max+1, formatted input, decimals, negatives, zero, huge integer, numeric string direct API negative test, insufficient funds, expired session, duplicate click, retry after timeout, concurrent bets, all dice result variants, keyboard/screen-reader pending/result announcements, mobile/tablet/desktop, wallet/recent-play reconciliation and real PostgreSQL ledger invariants.
- Promotion: current-main CI alone is insufficient. `Build Production Release #888` was `in_progress` at capture. DONE requires exact `f6fd312...` isolated Test lineage, backend/API/DB/casino QA, public exact SHA, then Production smoke with casino HTTP-400 contract failures and settlement reconciliation alerts at zero unexpected events.
- KPI/business: direct revenue is not assumed. Track play-start→accepted-play conversion, validation-error rate, ambiguous-result support contacts, D1/D7 casino return, fraud/reconciliation loss and support cost. Any monetization remains separate legal/product review; correctness must not be traded for higher play frequency.

### REL-EVIDENCE-157-01 — P0 — IN PROGRESS
- `Build Production Release #888` for exact current main was running at capture. Evidence states remain distinct: source commit → CI → immutable image digest → GitOps desired → applied revision → workload digest → pod-local version → public Test version → backend readiness → authoritative DB/schema → changed-feature QA → main exact retest → Production promotion/smoke.
- Success and failure bundles record expected/observed SHA/digest/revision, workload generation, first mismatch layer, timestamps/latencies and rollback target. Secrets, cookies, Authorization headers, DSNs and private keys are forbidden. Any missing/wrong/stale P0 evidence is `BLOCKED`, not pass.
- Repository protection is still insufficient: current `main` metadata reports protection enabled but required-status-check enforcement `off` with no required contexts/checks. Runtime paths must gain repository-enforced reviewed integration and selected trusted checks without turning docs automation into a runtime bypass.

### SEO/security/economics reference decisions
- Google Search Central posts dated 2026-09-08 and 2026-09-14 are event announcements, so they do not change crawl/index contracts. The 2026-09-08 documentation update on regional Search experiences is informational; Moneyverse virtual stocks/WDX must not be presented as an authoritative real-finance provider to chase EEA finance carousels. The 2026-08-28 site-reputation policy remains directly applicable to sponsored/affiliate/UGC governance.
- Favicon QA follows current Google requirements: crawlable homepage and favicon, stable URL, square asset, with >48×48 recommended. Public SEO read-model/canonical/robots/sitemap/lastModified/structured-data/hreflang/SSR-or-equivalent/CWV and private/account/admin/transaction noindex contracts remain mandatory.
- Security baseline remains OWASP ASVS 5.0.0 plus API Security Top 10. Casino receives explicit sensitive-business-flow/replay/resource-abuse controls; authentication/session/admin/economy/upload/SSRF/BOLA/BFLA/least-privilege/audit/backup gates remain fail-closed.
- Google Play service fees are not one universal rate. Unit economics use `market × effective-date/install-cohort × transaction-type × billing-path × programme`. For EEA/UK/US from 2026-06-30, current standard examples are 10% auto-renewing subscription, 20% other new-install and 25% other existing-install service fees, with a 5% billing fee where Play Billing applies. Markets not yet on the announced rollout use their currently applicable program rules. All unmeasured conversion/ARPU/ARPDAU/ARPPU/churn/refund/CAC/LTV values remain `HYPOTHESIS`/`TEST TARGET`.

### v157 worklog and implementation backlog
- External research: Google Search Central September updates/site-reputation/favicon/regional Search documentation; OWASP baseline retained; Google Play current service-fee guidance. Runtime/code evidence: current main, PR #384, Actions #888 and branch protection.
- Development order: P0 exact-SHA/runtime/DB evidence → independent restorable backup → false-green status → HIGH casino contract exact-runtime verification → runtime writable-path ownership → privileged recovery → migration/Work-clock integrity → repository enforcement → economy/admin/casino authorization → core completeness → monetization → SEO/growth/accessibility.
- Planning automation changed documentation only. Implementation remains `new branch → tests/CI → isolated exact-SHA Test → backend/API/DB/user-flow QA → main → exact-main retest → Production promotion → smoke/monitoring/rollback`.


## v2026.09.16.158 — repeated release-gate failure, crawler identity, and Korea fee-date truth

### REL-EVIDENCE-158-01 — P0 — BLOCKED / ROOT-CAUSE ELIMINATION REQUIRED
- First/latest reproduction: the same isolated-Test exact-SHA gate has failed repeatedly; the latest confirmed reproduction is Production Release #888 for runtime candidate `f6fd312025dcb9c517edfa2ad4986de0db1df54d` on 2026-09-16. The immutable SHA resolver succeeded, but the gate polled `https://test.easy-scraping.com/api/version` every 15 seconds for 60 attempts and ended at 13:10:08Z with `isolated test never served exact SHA ...`; the Production build job was skipped. This is no longer a generic timeout: repeated BLOCKED status is promoted to a root-cause removal backlog.
- Impact/severity: P0 release blocker for every changed feature, including the casino contract fix. A green source/PR test cannot prove the Test Service is routing the candidate, and promotion without resolving this would permit stale-code, wrong-image, wrong-DB or false-green releases.
- Evidence design: every attempt must persist a machine-readable tuple `{release_sha, candidate_backend_digest, candidate_frontend_digest, gitops_desired_revision, flux_applied_revision, deployment_generation, replicaset_uid, pod_uid, pod_image_digest, pod_local_version, service_endpoint_set, ingress_target, public_test_version, backend_ready, db_identity_hash, schema_migration_head, probe_at, latency_ms, first_mismatch_layer}`. Secrets, cookies, Authorization values, DSNs and private keys are prohibited.
- Root-cause decision tree: (1) candidate digest missing => candidate build/publish defect; (2) desired revision stale => GitOps writer defect; (3) desired != applied => Flux reconciliation/auth/source defect; (4) applied correct but workload digest stale => rollout/imagePull/deployment defect; (5) Pods correct but Service endpoints stale => selector/readiness defect; (6) Service correct but public version stale => ingress/CDN/cache/routing defect; (7) public SHA correct but catalog/readiness/DB check fails => backend/DB authority defect. The gate must report the first failing layer instead of only the final timeout.
- Fix backlog: Infra adds pre/post reconciliation probes and immutable-digest assertions; API exposes a non-secret version/readiness response tied to build SHA and DB identity hash; DB exposes a least-privilege schema/migration-head assertion rather than credentials; observability emits per-layer convergence latency and mismatch counters; release workflow uploads the evidence bundle even on failure. No schema migration is required for the evidence format itself unless an operational evidence table is chosen; prefer immutable workflow artifact/object storage first.
- Rollback/fallback: do not weaken the SHA comparison or extend timeout as the primary fix. Keep Production on the last verified immutable frontend/backend pair. If changed functionality is unsafe while Test cannot converge, close it with a server-authoritative feature flag; never relax authorization, DTO validation, ledger constraints or DB identity checks to make the gate pass.
- Tests: unit-test evidence serializer/redaction; workflow tests for each synthetic mismatch layer; integration test GitOps desired→applied; isolated cluster/service/ingress routing test; real-PostgreSQL DB identity/schema-head test; stale-cache and wrong-selector negative tests; security test that evidence cannot contain secrets; regression test that timeout/failure always produces a bundle and never invokes Production build.
- Test acceptance: exact candidate digest is running, pod-local and public Test SHA equal the requested release, backend readiness/catalog succeed against the authoritative Test DB, Test remains `noindex`, and evidence identifies every layer with fresh timestamps. Production promotion requires the same candidate lineage, current-main exact re-test, changed-feature QA, and no P0/HIGH unresolved gate. Monitoring alerts on convergence timeout, desired/applied mismatch, pod/public mismatch, DB identity mismatch and evidence-upload failure.

### CI-158-02 — HIGH — IN PROGRESS / NOT RELEASE EVIDENCE
- Current exact main is documentation commit `88452f14ca344ee1d060b58b84953599bf657538`. Build Test Candidate #755 has completed `verify/check` successfully: secret rejection, lint, raw-control-byte rejection, typecheck, application build, DB migration application, tests, Prisma-schema-mutation rejection and production dependency audit passed. Candidate build remains in progress: backend image push succeeded while frontend candidate image build is still running at capture time.
- State semantics are strict: `VERIFY_GREEN`, `BACKEND_IMAGE_BUILT`, `FRONTEND_IMAGE_PENDING` are separate states. None implies `TEST_APPLIED`, `TEST_PUBLIC_EXACT`, `DB_VERIFIED`, `CHANGED_FLOW_QA_GREEN` or `PRODUCTION_VERIFIED`. Dashboard/status APIs must not collapse them into a single green state.
- Acceptance/monitoring: expose timestamps and SHA/digest for each state, mark stale collectors unknown rather than green, and prevent release automation from consuming an aggregate green when a required downstream state is absent.

### SEO-CRAWLER-158-03 — P1 — DESIGN UPDATE / IMPLEMENTATION UNVERIFIED
- External reference decision (2026-09-16): Google Search Central's documentation update log records an HTTP user-agent-string update for `GoogleProducer`. Adopt this as an operational lesson: crawler classification must not depend on a frozen full User-Agent string. Continue to use Google's documented crawler verification method where crawler identity matters; SEO behavior itself must be correct for ordinary anonymous HTTP clients rather than granting privileged content to a crawler.
- SEO backend: crawler observations store normalized bot family, raw UA only under bounded retention/redaction, verification result, requested canonical URL, response status, robots directives, canonical, render mode, cache status and latency. Do not use UA matching to bypass authentication/noindex or serve materially different indexable content. Alert when known crawler verification fails systematically or rendering-critical assets are blocked.
- Public-page QA remains page-contract based: canonical/robots/sitemap/lastModified/hreflang/structured data/server-rendered primary content/rendering resources/CWV. Account, admin, payment callback, private transaction and private casino history remain sitemap-excluded and `noindex`.

### MONETIZATION-158-04 — P1 — KOREA DATE-GATED UNIT ECONOMICS
- External reference decision: Google Play's current official fee documentation says the new install-cohort fee structure rolls out in Korea on 2026-12-31. Until that date, Korea remains under the pre-rollout rules; for example, auto-renewing subscriptions are 15%, and eligible 15% tier developers pay 15% on the first USD 1M then 30% above it. South-Korea alternative billing transactions use the otherwise applicable Play service fee reduced by 4%, subject to the programme terms. Do not apply the future KR 10%/20%/25% cohort table to September 2026 forecasts as if already effective.
- Unit-economics engine therefore keys every paid SKU by `market + transaction_at + install_cohort_if_applicable + recurring/nonrecurring + billing_path + enrolled_programme + tax/refund/fraud assumptions`. Store the fee-policy version/effective date used by each forecast. Unknown attach rate, paid conversion, ARPU/ARPDAU/ARPPU, refund, churn, CAC and LTV remain `HYPOTHESIS`/`TEST TARGET`.
- Guardrail: pricing experiments cannot ship if contribution margin is calculated with a fee regime not yet effective for that market. Recompute optimistic/base/conservative scenarios at KR rollout and compare revenue uplift against churn, refund, support and trust costs.

### v158 worklog
- Fresh research: Google Search Central September 2026 updates/blog, current favicon/site-reputation guidance, current Google Play service-fee and rollout documentation, OWASP/ASVS baseline cross-check. Adopted the 2026-09-16 crawler-identity operational implication and Korea fee effective-date guardrail; event announcements were reference-only, not SEO algorithm changes.
- Runtime/QA/CI: confirmed main `88452f14...`; confirmed #888 failed specifically because isolated Test never served exact `f6fd312...`; confirmed Production build was skipped; confirmed #755 verify/check green while frontend candidate build remained in progress. No Production success is inferred.
- Development linkage: P0 release-evidence/root-cause work precedes casino Production reverification and all feature expansion. This planning run changes documentation only; it does not deploy runtime code, alter DB/Flux, or promote Production.

## v2026.09.16.159 — Work day/week reset authority convergence

### WORK-CLOCK-149-01 — HIGH — IMPLEMENTED / EXACT-SHA TEST REQUIRED
- Forward migration `203-work-reset-convergence.sql` fixes the remaining read-model split without editing or renumbering any applied migration. Migration 202 remains immutable.
- Work settlement, task board, reward preview and dashboard now share `server_game_day_*` / `server_game_week_*` authority. One game day is 600 real seconds and one seven-day game week is 70 real minutes.
- `GET /api/v1/work` adds the authoritative `game_day_key`, `game_week_key`, `day_ends_at` and `week_ends_at`. `/work` renders daily/weekly paid WLD, remaining quota and exact next reset from those server values.
- Task actions fail closed at task-daily, member-daily or member-weekly exhaustion. Reward preview uses the same current game windows and caps as settlement instead of advertising an amount that settlement would refuse or clamp.
- Mobile API contract advances to `v2026.09.16.159`. Contract generation now excludes TypeScript compiler-internal `__@...` symbol properties so unrelated type graph changes cannot rewrite public JSON response schemas.
- Isolated PostgreSQL validation passed migration 203 plus 15 Work/clock tests covering 10-minute day rollover, 70-minute week rollover, timezone invariance, task/global caps, career switching, idempotency/integrity and preview/payout/dashboard parity. Local DB package 7/7, backend 871, frontend 612, lint 0 errors, typecheck and production build passed.
- Production remains fail-closed pending GitHub CI, exact-head Test convergence, authoritative DB backup/migration and Production smoke. The current P0 release-evidence rules from v158 are not weakened for this fix.


## v2026.09.16.160 — local dual-model economy-AI production activation

### ECON-AI-160-01 — IMPLEMENTED / RUNTIME-CONFIG ACTIVATION
- Runtime authority remains the approved Debian 13 systemd/PostgreSQL path. This operation did not deploy newer application `main`; public Production continued to serve application SHA `be218f0403372689dbdf8af9bf8700264f39348f`, which already contains the dual economy-AI reviewer. Documentation was rebased on application main `03a8ae9c5313d0915589691afc6fff022323c305` only for record integration.
- `economy_ai_policy_review` is enabled in Production through the audited `admin_set_feature_switch` path. A provisional v159 activation label was reconciled to v160 after concurrent main used v159; reconciliation kept the state `enabled -> enabled` and added a separate receipt/audit reason rather than rewriting history.
- Local inference is localhost-only at `127.0.0.1:11434`, with runtime/models on `/srv/moneyverse-data/ai`. Seat A is `llama3.2:3b`; seat B is `gemma3:1b`. `qwen2.5:3b` was rejected from the production profile after violating the confidence `0..1` output contract.
- Resource bounds are explicit: one parallel request, at most two resident models, 2-minute keep-alive, `MemoryHigh=6G`, `MemoryMax=7G`, no Ollama cloud, and model weights excluded from the constrained system disk.
- Backend configuration uses the OpenAI-compatible local endpoint, 180-second per-call timeout, concurrency 1, 300-second exact-result cache and 120-minute review TTL. Secrets are not committed; repository files include only the non-secret service/config template.

### Test/Production evidence and safety contract
- Existing economy reviewer unit tests passed 10/10. Both selected models returned the required `decision`, confidence in `0..1`, rationale and risks contract.
- Validation ran against the deployed `test-be218f040337` application release plus the authoritative Test PostgreSQL. The public Test route also returns `be218f...`; this operation does not claim current-main exact-SHA Test convergence and does not close `REL-EVIDENCE-158-01`.
- Isolated Test exercised real model calls and Test PostgreSQL: four routed domains/eight seat calls, append-only review storage, scoreboard evidence, exact-hash `dual_agree`, exact-only `ai_veto`, changed-proposal `ai_missing_classical_fallback`, and missing-model `unconfigured_classical_fallback`. Application-role direct table reads remained denied.
- The first enabled Production reviewer check returned `no_eligible_classical_proposal` in about 40 ms, so no model council ran, no review row was created, and no policy value changed. Production backend and AI services remained active; public home returned HTTP 200.
- The deterministic/classical engine remains accounting/policy authority. AI may only append a review and veto the exact matching proposal. Missing, expired, mismatched, unavailable or abstaining AI evidence cannot invent replacement values and falls back to the classical lane.
- Rollback is fail-safe: audited switch to `disabled`, restore/remove backend AI runtime variables if required, restart backend, then stop/disable local inference when unused. Never weaken deterministic validation, ledger reconciliation or exact-proposal matching to preserve AI availability.
- Monitoring: feature switch, reviewer outcome, council decision mix, confidence, latency/token usage, service memory/restarts, backend errors and economy reconciliation. Model-quality regression is an operations incident, not authority to bypass deterministic gates.


## v2026.09.16.161 — administrator navigation completeness and current release evidence

### ADMIN-NAV-161-01 — HIGH — IMPLEMENTED ON MAIN / EXACT-SHA TEST REQUIRED
- Evidence: current main `7acc3c02e4fc015d6800f2d5a7e51180f2dc02a5` integrates PR #390. The root cause was two independently maintained administrator inventories drifting: `AdminSubNav` omitted Security, Business/Season, Work/Jobs and Discord, while `ADMIN_AREAS` omitted Support and Shop. Production had served the same incomplete top-level navigation, so this is a frontend discoverability/inventory defect, not evidence of missing backend endpoints.
- User/permission contract: authenticated administrators keep the existing authorization boundary; navigation visibility never grants capability. Every destination must independently enforce administrator actor/session policy, recent reauthentication/second factor where required, server-side function/object authorization and append-only audit for privileged/economic mutations. A hidden route is not an access-control mechanism.
- UX contract: `/admin` dashboard and top-level sub-navigation share one canonical area registry. Required top-level areas are Dashboard, Users, Security, Economy, Business/Season, Work/Jobs, Shop, Support, Discord and other currently registered first-class areas; nested activity/delivery/integrity/AI-news/scenario pages remain under parents. Mobile uses an accessible overflow/menu without dropping destinations; desktop may render tabs. Current route, keyboard focus, screen-reader name/state, loading/error/403/404 and stale-session reauth states are explicit.
- Frontend/backend/API/DB: the registry contains stable route id, localized label, route, required capability and optional badge source. Badge APIs are read-only and failure-isolated: badge timeout must not hide navigation. No DB migration is required for the navigation fix. Backend remains authoritative for capability checks; client registry must not duplicate economic authorization logic.
- Security/abuse: test direct URL access for non-admin, stale admin session, insufficient admin capability, CSRF on mutations, BOLA/BFLA negatives and audit actor integrity. Navigation telemetry must not log secrets, session tokens or private user payloads. Privileged routes remain `noindex`, excluded from sitemap and inaccessible to crawler-only privilege.
- QA evidence: merged update reports local typecheck/build/lint 0 errors (11 pre-existing image warnings), frontend 68 files/611 tests, backend 871 non-DB tests with 351 DB tests skipped locally. Therefore local success is insufficient for promotion. Add registry-completeness regression, route→capability contract test, keyboard/mobile navigation E2E, 403/reauth tests, DB-backed admin mutation regression and Test HTML checks for every top-level destination.
- Acceptance/promotion: exact `7acc3c02...` candidate must pass DB-backed CI, isolated Test must serve the same SHA/digests, backend/database public-catalog/readiness probe must pass, and an authorized Test admin must reach every registered top-level area without widening permissions. Production smoke repeats route inventory plus authorization negatives. Roll back to the last verified immutable frontend/backend pair or disable only the affected admin surface; never relax authorization.
- Observability/business: emit `admin_nav_view`, `admin_area_open`, `admin_area_403`, `admin_reauth_required`, route-not-found and badge-failure counts with bounded actor pseudonymization. This is an operations-efficiency feature, not direct revenue: measure median time-to-area, failed navigation rate, admin task completion, support burden and incident-response time. `SCALE` when completeness is 100% and error/support burden falls without auth regressions; `ITERATE` on discoverability/accessibility friction; `KILL/ROLLBACK` any change that widens privilege or creates false access cues.

### REL-EVIDENCE-161-02 — P0 — IN PROGRESS
- At capture, `Build Production Release #904` targets exact main `7acc3c02e4fc015d6800f2d5a7e51180f2dc02a5`. Immutable SHA resolution passed; `Wait for exact SHA on isolated test and verify backend/database path` is still in progress. No Test/Production success is inferred.
- The v158 evidence contract remains authoritative: candidate digests → GitOps desired/applied → workload generation/digests → Service endpoints/ingress → pod-local/public Test SHA → backend readiness → DB identity/schema head → changed-flow QA. A missing layer is BLOCKED, and failure must persist first-mismatch evidence. Repository protection still reports required-status-check enforcement `off` with no required contexts/checks, so repository enforcement remains HIGH backlog.

### SEO/security/economics decisions — 2026-09-16 refresh
- Google Search Central's newest 2026-09-14 blog entry is an event announcement, not a crawl/index algorithm contract. The September documentation log still records regional Search-experience documentation and the 2026-09-16 `GoogleProducer` HTTP User-Agent update. Keep crawler classification resilient to full-UA changes and never use crawler identity to bypass auth/noindex. The 2026-08-28 site-reputation policy remains applicable to sponsor/affiliate/UGC governance; favicon remains crawlable homepage/file, stable URL and square asset.
- OWASP API Security Top 10 remains version 2023; ASVS remains the implementation-verification baseline. Admin navigation is specifically covered by BFLA/BOLA, authentication/session, CSRF and audit controls. Planned/active economy AI additionally keeps the OWASP GenAI 2026/Agent Control safety lane without replacing deterministic economic authority.
- Google Play still documents market/program/cohort-dependent fees rather than one universal rate. Unit economics remain keyed by market/effective date/install cohort when applicable/transaction type/billing path/programme, with conversion, ARPU/ARPDAU/ARPPU, churn, refund, CAC and LTV marked `HYPOTHESIS`/`TEST TARGET` unless measured.

### v161 worklog
- Fresh references: Google Search Central September 2026 blog/update log/site-reputation/favicon; OWASP API Security/ASVS guidance and GenAI 2026 update; Google Play current service-fee guidance. Event announcements were not misclassified as ranking changes.
- Runtime/code/QA: re-read latest main and both v160 plans; inspected main commit #390 and its local verification evidence; checked current main branch protection and Production Release #904. Rechecked main before integration.
- Development order remains P0 release truth/evidence → independent restore proof → false-green elimination → HIGH admin exact-SHA/authorization QA → casino/runtime/cache/privileged recovery → migration integrity → repository enforcement → core correctness → monetization → SEO/growth/accessibility. Planning changes documentation only.


## Integrated evidence — v2026.09.17.162 Production exact-SHA convergence

- Release authority: application `main`, isolated Test, Production and GitOps Production desired state must converge on the same immutable SHA before completion.
- Verified release: `18c7a1324013099e47b2d6e22c5108c4d378139c`. Production release workflow `35113806254` and infrastructure reconcile `35117875121` completed successfully.
- Database gate: a Production backup was created before `203-work-reset-convergence.sql`; the migration is recorded with its immutable checksum.
- Current public-edge constraint: Nginx still reaches host systemd services (`3000/3001` Production, `3100/3101` Test). GitOps manifest success alone is insufficient; the host runtime and public `/api/version`, catalog/status and SEO probes must converge too.
- Economy controls after promotion: `economy_ai_policy_review` and `economy_auto_policy` remain enabled; the local A/B inference service remains an advisory/veto lane and does not replace deterministic accounting authority.


## v2026.09.17.163 — docs-only main release eligibility and gate correctness

### REL-DOCS-163-01 — P0 — OPEN / ROOT-CAUSE REMOVAL REQUIRED
- First/latest reproduction: 2026-09-17. After documentation-only PR #393 advanced `main` from verified application SHA `18c7a1324013099e47b2d6e22c5108c4d378139c` to docs commit `f3014e67a7cff37eb5c5eb4c92672a93609fbac4`, Build Production Release #907 resolved `f3014e67...` as the immutable release SHA, then spent about 15 minutes waiting for isolated Test to serve that docs commit. The exact-SHA Test gate failed and the Production build job was skipped. This is a fresh CI/release-orchestration defect; it does not invalidate the previously evidenced `18c7a132...` Production application runtime.
- Impact/severity: P0 because release automation can become permanently blocked by non-runtime commits and can falsely model documentation SHA as an application artifact identity. A future operator might respond by weakening exact-SHA checks, which is prohibited. Affected domains are CI/CD, Test convergence, Production promotion, release evidence and incident response; user runtime is not shown degraded by this failure.
- Confirmed cause boundary: release eligibility currently binds workflow target identity to repository `main` head without first proving that the head changes an application/runtime build input. For docs-only commits there is no legitimate requirement that already-running Test application `/api/version` mutate to the documentation commit SHA. The gate is therefore comparing two different identity domains: repository-history SHA versus deployable application-source SHA.
- Fix design: introduce an explicit `release_source_sha`/`application_source_sha`. Compute it from the newest commit at or before current main that changes declared runtime build inputs (frontend/backend/shared runtime packages, lockfiles, migrations, container/build configuration or release-relevant infrastructure). Documentation-only, planning-only and changelog-only commits remain traceable as `repository_head_sha` but do not create a new application candidate. Prefer path-aware workflow triggering plus a deterministic eligibility job; never rely on trigger filtering alone. The eligibility output is one of `RUNTIME_RELEASE_REQUIRED`, `DOCS_ONLY_NO_RUNTIME_RELEASE`, or `RELEASE_INPUT_CLASSIFICATION_ERROR` (fail closed).
- Evidence/API/observability: release evidence records `repository_head_sha`, `application_source_sha`, changed-path classification, candidate frontend/backend digests, GitOps desired/applied SHA, host-systemd mirrored SHA while dual runtime exists, public `/api/version`, DB migration head/checksum and workflow/run IDs. `/api/version` remains application-build identity, never documentation identity. Dashboard must render docs-head advancement separately from runtime freshness. Metrics: `release_docs_only_skip_total`, `release_input_classification_error_total`, `release_source_head_distance`, `test_exact_sha_wait_seconds`, `release_identity_mismatch_total`.
- Security/supply chain: the path classifier is repository-controlled code and must itself be reviewed/tested. Any ambiguous path, lockfile/build-tool change, migration, secret-reference/config template, container or deployment-input change is runtime-relevant and fails closed. An attacker must not be able to label executable/build input as docs to bypass CI. Required checks and provenance bind candidate digest to `application_source_sha`; branch protection remains a separate HIGH backlog.
- Migration/rollback: no DB migration is required for this workflow fix. Roll back workflow code to the last verified version only if it does not reintroduce docs-head deadlock; Production stays on the last verified immutable application pair. Never deploy a synthetic rebuild merely to make `/api/version` equal a docs-only SHA, and never weaken the equality check for true runtime releases.
- Tests: unit matrix for docs/changelog/planning-only, frontend-only, backend-only, shared package, lockfile, migration, Docker/build config, workflow/release config, GitOps config and mixed commits; merge-commit and multi-commit range classification; renamed/deleted files; shallow-history fallback; classifier-error fail closed; integration test that docs-only main returns successful no-runtime-release evidence without polling Test; runtime commit still requires exact candidate SHA/digests and authoritative Test DB; regression that build/promotion is skipped after failed Test gate.
- Acceptance: exact-main docs-only run completes quickly as `DOCS_ONLY_NO_RUNTIME_RELEASE`, preserves public application SHA `18c7a132...` until a runtime release is approved, emits complete evidence, and does not mark Production stale merely because docs advanced. A subsequent synthetic/runtime PR must still prove exact `application_source_sha` through Test → backend/API/DB/user-flow QA → GitOps/host mirror → Production smoke.
- Business/UX: direct revenue is zero; benefit is avoided release blockage, operator time, accidental rebuild/deploy cost and false incident/support cost. `SCALE` when classification accuracy is 100% over the test corpus and docs-only p95 completion is <2 minutes with zero runtime mutations; `ITERATE` on ambiguous classifications; `KILL/ROLLBACK` if any runtime-relevant path can bypass candidate/QA gates.

### SEO/security/monetization refresh — 2026-09-17
- Google Search Central's latest September material remains documentation/event updates rather than a new ranking contract; the 2026-08-28 site-reputation change remains directly applicable to sponsor/affiliate/UGC governance. Public SEO contracts therefore remain server-readable primary content, stable canonical URLs, sitemap/robots consistency, crawlable pagination for indexable lists, structured-data validation, hreflang where localized, CWV monitoring and private/admin/transaction pages excluded from sitemap and forced `noindex`.
- OWASP ASVS 5.0 remains the implementation-verification baseline and API Security Top 10 remains the API threat-discovery baseline. The new release classifier is supply-chain/security-sensitive: ambiguous executable inputs fail closed and provenance must bind digests to application source identity.
- Google Play's current fee documentation still varies by market/programme/install cohort/transaction type/billing path. SKU unit economics retain versioned fee policy and `HYPOTHESIS`/`TEST TARGET` labels for unmeasured conversion, ARPU/ARPDAU/ARPPU, churn, refund, CAC and LTV. No pricing assumption changed this cycle.

### v163 worklog
- Fresh references: Google Search Central current September updates/site-reputation guidance; OWASP ASVS/API-security cross-check; Google Play current service-fee documentation. No unsupported ranking, security-certification or revenue claim was introduced.
- Runtime/QA/CI: start and mid-run main were `f3014e67...`. Build Production Release #907 on that exact docs-only head failed in `Wait for exact SHA on isolated test and verify backend/database path`; build was skipped. This creates REL-DOCS-163-01 and does not erase the prior `18c7a132...` Production exact-SHA evidence.
- Development order: independent restore evidence → false-green elimination → release identity/classifier fix and dual-runtime authority removal → HIGH auth/admin/casino/Work/DB integrity QA → repository required-check enforcement → core correctness → monetization → SEO/acquisition → retention/accessibility. This planning change does not deploy runtime code, alter DB/Flux or promote Production.


## v2026.09.17.164 — repeated docs-head release execution and crawler/runtime evidence hardening

### REL-DOCS-164-01 — P0 — IN PROGRESS / REPEAT REPRODUCTION ON EXACT MAIN
- First found: 2026-09-17 under REL-DOCS-163-01. Latest reproduction: exact main `4f568afbce37d59612f483ed2c5bf60c6217bf68` at this planning cycle. `Build Test Candidate #806` (`35131802624`) completed successfully even though the head is the documentation-only v163 integration; `Build Production Release #909` (`35132313855`) then entered `test-gate` and was still waiting for exact Test SHA at the evidence cut. CI #1160 (`35131803817`) succeeded. This is independent repeat evidence that the classifier/eligibility fix is not yet implemented in the current workflow.
- Reproduction: merge a commit whose changed paths are limited to `docs/planning/**` → observe Test candidate workflow build runtime candidates → observe Production Release resolve repository head as candidate and enter exact-SHA Test polling although application build identity has not legitimately changed.
- Affected scope: release throughput, runner/registry consumption, operator alert fatigue, Test environment churn, false incident classification and the integrity of release evidence. No current evidence says the previously verified Production application runtime itself is degraded.
- Root cause: confirmed architectural identity conflation remains `repository_head_sha == application_source_sha` in orchestration behavior. The workflow has no authoritative, tested changed-input classifier before candidate construction and exact-SHA gating.
- Concrete implementation backlog: (1) create a versioned `release-inputs.yml` inventory containing frontend/backend/shared/lockfile/migration/container/build/deploy/security-config inputs; (2) add a deterministic classifier job that diffs merge-base→head including rename/delete and emits `repository_head_sha`, `application_source_sha`, `classification`, `matched_runtime_paths`, `classifier_version`; (3) make candidate build, Test GitOps mutation and Production Release depend on `RUNTIME_RELEASE_REQUIRED`; (4) for `DOCS_ONLY_NO_RUNTIME_RELEASE`, emit signed/machine-readable evidence and exit without image build, Test mutation or Production promotion; (5) fail closed on missing history, unknown path class or classifier error; (6) expose repository-doc freshness separately from runtime application freshness in operator UI/evidence.
- API/evidence schema: `releaseEvidence={repositoryHeadSha,applicationSourceSha,classification,classifierVersion,changedPathsHash,backendDigest?,frontendDigest?,testAppliedRevision?,testPublicSha?,productionPublicSha?,dbMigrationHead?,createdAt,workflowRunIds}`. Nullable runtime fields are allowed only for `DOCS_ONLY_NO_RUNTIME_RELEASE`; the reason is explicit, never inferred from absence.
- Security: classifier and inventory are supply-chain controls. CODEOWNERS/review protects classifier, build/deploy workflow and inventory changes; any `.github/workflows/**`, lockfile, Dockerfile/container, migration, runtime config/secret reference, generated runtime artifact or unknown executable extension is runtime-relevant. A docs filename cannot override executable semantics. Provenance binds digests to `application_source_sha`, not mutable branch name.
- Migration/rollback: no application DB migration. Workflow rollback is permitted only to a revision that still fails closed for runtime inputs. Do not rebuild/deploy synthetic images merely to make `/api/version` equal a docs SHA. Production remains on last verified application pair until a real runtime candidate clears all gates.
- Required tests: table-driven classifier tests for docs-only, FE, BE, shared, lockfile, SQL migration, Docker, CI workflow, GitOps, config, mixed, rename/delete, symlink, generated file, merge commit, multi-commit and shallow clone; integration fixture proving docs-only performs zero registry push/zero GitOps write/zero Test polling; runtime fixture proving exact SHA/digest/DB/user-flow gates still execute; security negative fixture attempting a runtime payload under a documentation-looking path.
- Test acceptance: docs-only p95 workflow completion <2 minutes, `candidate_images_built=0`, `test_gitops_mutations=0`, `production_mutations=0`, classification evidence present and CI remains required. Runtime changes preserve exact-SHA and real-DB gates. Production promotion is blocked on any classifier ambiguity.
- Monitoring: `release_classification_total{class}`, `release_classifier_error_total`, `docs_only_candidate_build_violation_total=0`, `docs_only_test_poll_violation_total=0`, `release_source_head_distance`, runner minutes and registry bytes by classification. Alert immediately on any docs-only runtime mutation.
- Status/owner order: `P0 IN PROGRESS`; release/platform owner → security review of input inventory → unit/integration classifier QA → isolated workflow dry run → current-main docs-only proof → synthetic runtime proof → then close REL-DOCS-163/164 together. Repeated BLOCKED behavior remains above feature work.
- Business effect: direct revenue 0. Measure avoided CI runner minutes, registry/storage/network cost, operator time and release delay. `SCALE` only at 100% classifier corpus accuracy and zero bypass; `ITERATE` on false positives; `KILL/ROLLBACK` on any false negative/runtime bypass.

### SEO/SEO-backend delta — crawlable infinite-scroll and crawler-family observability
- Fresh official Google Search documentation update dated 2026-09-17 migrated infinite-scroll guidance without changing the underlying recommendation. Indexable Moneyverse community, market, collection and public-search lists therefore must not require user scrolling/clicking for discovery. Each chunk has a persistent stable URL (for example bounded absolute `?page=N`), deterministic content, sequential crawlable `<a href>` links and History API URL updates when scroll changes the primary visible chunk. Filters with no standalone search value canonicalize/noindex according to the route policy; private/account/admin/transaction views remain sitemap-excluded and forced `noindex`.
- SEO backend owns a pagination read-model `{canonicalUrl,page,pageSize,totalPages,prevUrl,nextUrl,updatedAt,indexPolicy}` and emits canonical/robots/breadcrumb/structured-data consistently in SSR HTML before hydration. Page overflow returns canonical 404 rather than a soft-404 empty 200. Sitemap includes only canonical indexable pages and `lastModified` derives from meaningful public-content updates, not request time.
- Google also documented a 2026-09-16 `GoogleProducer` user-agent-string update and crawler content-encoding information. Crawler analytics must classify by verified crawler/fetcher family and documented token/IP verification where applicable, not brittle full-UA string equality. User-agent classification never bypasses authentication, authorization, rate safety, `noindex`, or changes primary content for ranking.
- SEO QA: rendered-HTML inspection with JS disabled and Search Console URL Inspection for representative paginated routes; no orphan page >1; stable canonical across hydration; no duplicate page-1 aliases; 404 for impossible page; crawler log captures family/status/canonical/robots/render/cache/latency. KPI chain remains organic impression → CTR → landing → signup → activation → D7/D30 → revenue, with crawl-error/index-exclusion/CWV guardrails.

### Security and economics refresh — 2026-09-17
- OWASP ASVS latest stable remains 5.0.0 and is the testable verification baseline; OWASP API Security latest project edition remains 2023. API6 sensitive-business-flow abuse remains directly relevant to casino, rewards, referral, market and release-control endpoints. The 2026 GenAI LLM Top 10/Agent Control Standard remains applicable to Economy-AI: model output is advisory/bounded and cannot become ledger/balance/entitlement authority.
- Google Play still has no single universal fee. Current official tables distinguish market rollout, recurring/non-recurring transaction, new/existing install, programme and billing path. Shop/payment/subscription unit economics therefore keep versioned fee policy by `market × transaction_at × install cohort(if applicable) × transaction type × billing path × programme`; unmeasured conversion, attach, ARPU/ARPDAU/ARPPU, refund, churn, CAC and LTV remain `HYPOTHESIS`/`TEST TARGET`.

### v164 worklog
- External research first: Google Search Central 2026-09-17 infinite-scroll migration and 2026-09-16 crawler updates; OWASP ASVS 5.0.0, API Security 2023 and GenAI 2026; Google Play current service-fee tables. Event announcements were not treated as ranking changes.
- Repository/runtime/QA: read exact main `4f568afb...`, both v163 plans and current workflows. CI #1160 and Test Candidate #806 succeeded; Production Release #909 on the docs-only head entered exact-SHA test-gate, reproducing the release-identity defect while no evidence indicated Production application degradation.
- Mid-run main was rechecked before integration. Priority remains independent restore → stale-status false-green → release classifier/dual-runtime authority → HIGH auth/admin/casino/Work/DB integrity → required-check enforcement → core correctness → monetization → SEO/acquisition → retention/accessibility. This planning cycle changes documentation only and does not deploy runtime code, mutate DB/Flux or promote Production.


## 19. v2026.09.17.165 evidence sync — docs-only release mutation remains active

### 19.1 Fresh evidence and disposition

- **Repository/runtime evidence (2026-09-17 04:02–04:06 KST):** `main=62c65827b76f6e7d57c66f5954194276aee16d2e`, a planning-only commit. Main CI run `1163` completed successfully, while `Build Test Candidate #788` and `Auto Integrate and Promote` were still `in_progress`. This is a new independent reproduction of `REL-DOCS-164-01`: a docs-only commit still enters candidate/promotion automation. State remains **P0 / OPEN / REDESIGN_REQUIRED**; no Test or Production success is inferred from CI green.
- **Google Search Central (2026-09-17):** the infinite-scroll JavaScript guidance was migrated into current documentation with no policy change. **DIRECT ADOPTION:** every indexable Moneyverse list must expose stable chunk/page URLs and crawlable sequential links; scroll-only discovery is prohibited. The 2026-09-14 Search Central Live India post is an event announcement and is **EXCLUDED** as a ranking/indexing policy change. The 2026-08-28 site-reputation update remains **DIRECT ADOPTION** for sponsored/affiliate/UGC governance.
- **OWASP (checked 2026-09-17):** ASVS latest stable remains 5.0.0; API Security Project latest API-specific Top 10 remains 2023. **DIRECT ADOPTION:** ASVS is the verifiable control baseline and API1/BOLA, API2/authentication, API5/BFLA, API6/sensitive-business-flow abuse, API7/SSRF and API9/inventory are mandatory negative-test families for affected APIs.
- **Google Play fees (checked 2026-09-17):** Google explicitly states there is no single service fee; EEA/UK/US transactions from 2026-06-30 distinguish new/existing installs and transaction type, while remaining markets use the pre-rollout schedule. South Korea alternative billing remains the applicable Play fee minus four percentage points. **DIRECT ADOPTION:** SKU economics must be policy-versioned by market/effective date/install cohort/transaction type/billing path/programme; unknown conversion, ARPU/ARPDAU/ARPPU, refund, churn, CAC and LTV remain `HYPOTHESIS`/`TEST TARGET`.

### 19.2 REL-DOCS-165-01 — P0 — OPEN — candidate/promotion side effects begin before release eligibility is proven

- **First found:** 2026-09-16 (`REL-DOCS-163-01`). **Latest reproduction:** 2026-09-17 04:02 KST on docs-only `62c65827...`.
- **Reproduction:** merge a commit whose changed paths are only `docs/planning/PROJECT_PLAN.md` and `.ko.md`; observe normal CI; then observe `Build Test Candidate` and promotion orchestration start for the same repository head.
- **Affected:** release engineering, Test capacity, registry/storage, GitOps truth, Production promotion confidence, incident triage and developer cycle time. User-visible runtime should not change for a planning-only commit.
- **Evidence/root cause:** runtime eligibility is not an authoritative prerequisite to candidate/promotion workflow creation. The current trigger topology can schedule expensive or stateful release work before proving that deployable application inputs changed. This is a control-plane correctness defect, not an application-runtime defect.
- **Fix design:** introduce a required `classify-release-inputs` job before any image/GitOps/poll/promotion job. It consumes merge-base→head changes, rename/delete metadata and a versioned `release-inputs.yml`; emits signed/immutable evidence `{repositoryHeadSha, applicationSourceSha, classification, matchedRuntimePaths, classifierVersion, generatedAt}`. Only `RUNTIME_RELEASE_REQUIRED` may unlock candidate jobs. `DOCS_ONLY_NO_RUNTIME_RELEASE` must terminate successfully with zero registry push, zero Test GitOps write, zero exact-SHA poll and zero Production mutation. `RELEASE_INPUT_CLASSIFICATION_ERROR` fails closed and pages release engineering if repeated.
- **Classification safety:** frontend/backend/shared runtime code, lockfiles, migrations, Docker/container/build files, CI reusable workflows that influence artifacts, GitOps/deploy manifests, runtime configuration/schema, secret references, generated runtime artifacts and unknown executable inputs are runtime-relevant. Path rename/delete, symlink/path tricks, case changes, merge commits, shallow-history fallback and mixed docs+runtime commits are explicit tests. A docs path containing executable payload must not bypass classification.
- **Migration/data:** no business-data migration. Classifier schema/evidence format is versioned; old release evidence remains immutable. No Production DB write is allowed from this planning task.
- **Rollback:** revert classifier/workflow wiring to the last-known-good release orchestration only if doing so does not re-enable automatic Production mutation for unclassified commits; otherwise freeze promotion and require manual reviewed release selection.
- **Tests:** unit corpus for path classes; property tests for rename/delete and mixed changes; workflow integration for docs-only/frontend-only/backend-only/shared/lockfile/migration/Docker/GitOps; negative supply-chain bypass; concurrent main advances; rerun/cancel; missing merge-base; malformed manifest; artifact provenance verification. Docs-only acceptance: p95 classification <2 minutes and all runtime side-effect counters remain zero. Runtime acceptance: exact application SHA/digests still traverse isolated Test → authoritative backend/API/DB/user-flow QA → Production smoke/rollback gates.
- **Monitoring:** `release_classifier_total{classification}`, `release_classifier_errors_total`, `docs_only_candidate_started_total` (**must be 0**), `docs_only_registry_push_total` (**0**), `docs_only_gitops_mutation_total` (**0**), `release_application_source_mismatch_total` (**0**), queue minutes and compute minutes avoided. Alert immediately on any docs-only side effect.
- **Business:** direct revenue 0. Cost value = avoided CI/registry/Test compute plus lower false-release/incident probability and engineer waiting time. **SCALE** after 30 days with zero false negatives and zero docs-only side effects; **ITERATE** on false positives; **KILL/ROLLBACK** any classifier version that misses a runtime-relevant input.

### 19.3 Cross-functional implementation contracts added this cycle

1. **SEO backend/list UX:** public community, market, collection and search lists expose `{canonicalUrl,page,pageSize,totalPages,prevUrl,nextUrl,updatedAt,indexPolicy}` from the server read model. SSR HTML contains canonical/robots/breadcrumb/structured-data and crawlable `<a href>` pagination before hydration. Out-of-range pages return 404, not empty soft-404 200. Filter/sort/query variants default to canonical parent or `noindex,follow` unless independently valuable. Sitemap contains only canonical indexable URLs and semantic `lastModified`; private/account/admin/transaction/casino-history pages are hard `noindex` and sitemap-excluded. Cache keys include locale, canonical page and index policy; cached metadata cannot outlive the content/version it describes. QA covers JS disabled, bot fetch, mobile/desktop, hreflang reciprocity, 301/308 slug changes, 404/410 deletion, UGC moderation/index delay and CWV guardrails.
2. **Security/API inventory:** every user/admin/economy endpoint registry row records owner, authn method, authorization capability, object ownership rule, request/response schema, idempotency, rate/resource limit, PII class, audit event, data store, feature flag and deprecation state. CI fails on an implemented route absent from inventory. Casino/reward/referral/shop/payment/admin flows require API6 abuse cases in addition to ordinary rate limiting; object-ID APIs require BOLA tests; admin functions require BFLA + recent reauth/2FA; remote-fetch/upload flows require SSRF/content/path tests. Residual risk and deployment-blocking status are recorded per control.
3. **Economics/analytics:** every monetized SKU stores `feePolicyVersion`, market, currency, gross price, tax assumption, platform/payment fee assumption, refund/fraud assumption, variable infra/support/content cost and net/contribution-margin formula. Dashboards distinguish revenue, net revenue, gross margin, contribution margin, ARPU/ARPDAU/ARPPU, conversion/attach/repeat, renewal/churn/refund, CAC/LTV/payback, fraud loss, infra/support cost and D1/D7/D30. Values without production measurement are labelled hypothesis/test target. Ad experiments use net effect `ad revenue - incremental churn/session loss/support cost`; kill if retention/trust guardrails regress beyond the pre-registered threshold even when gross ad revenue rises.
4. **Release/operations:** P0 `BAK-106-01`, `OPS-107-01`, release classifier and dual-runtime authority remain ahead of new features. A green CI run is never equivalent to restorable backup, fresh status telemetry, exact Test runtime, authoritative DB verification or Production smoke. Promotion evidence must preserve each transition separately and rollback must identify the exact immutable application source SHA/digests and DB compatibility boundary.

### 19.4 Worklog / changelog v165

- External sources checked first: Google Search Central documentation updates/infinite-scroll + site-reputation policy; OWASP ASVS/API Security; Google Play service-fee policy.
- Repository evidence checked second: latest main, both integrated plans, current main CI and release workflows. New fact: docs-only `62c65827...` still launched Test candidate/promotion automation while CI was green.
- Planning change: strengthened P0 release classifier from path taxonomy into a prerequisite control-plane gate with side-effect-zero acceptance metrics; added implementation contracts for SEO list read-model, API inventory/security, monetization measurement and release evidence.
- Mid-run main re-check: required before integration; if main advances, rebase/re-read both plans and preserve newer evidence rather than overwriting it.
- Runtime deployment: **not performed by planning automation**. Implementation remains a separate branch→tests/CI→exact-SHA Test→backend/API/DB/user-flow QA→main→Production promotion→smoke/rollback process.
