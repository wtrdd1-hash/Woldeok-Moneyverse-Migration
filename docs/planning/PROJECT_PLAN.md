# Woldeok Moneyverse — Living Project Plan

> Status: Living specification / current authoritative integrated plan
> Original baseline: 2026-08-26
> Current integrated version: v2026.09.15.106
> Implementation/evidence sync: 2026-09-15
> Korean counterpart: [PROJECT_PLAN.ko.md](PROJECT_PLAN.ko.md)

Historical detail remains recoverable from Git and the versioned changelog/worklog. This file is the current implementation-facing contract: another developer or agent should be able to derive scope, authority, data flow, failure states, security, SEO, business economics, QA and release gates from this plan without treating earlier drafts as current truth.

## 0. Maintenance and evidence rules

1. External/reference research precedes material product planning. Prefer current official product/platform documentation, OWASP/security bodies, government/regulator material and current primary operational evidence.
2. Read the latest `main`, this English canonical plan, the Korean counterpart, current QA/worklogs, CI/release automation, runtime evidence and relevant code/migrations before changing a contract.
3. Re-check `main` while working and immediately before integration. Preserve concurrent work; never force-push `main` for documentation automation.
4. Implementation evidence is classified as `IMPLEMENTED`, `PARTIAL`, `UNVERIFIED`, or `REDESIGN_REQUIRED`. A plan or old screenshot does not prove current runtime behavior.
5. CI/test/runtime evidence is explicit. Missing evidence is `verification unavailable`, not pass. High-risk promotion is fail-closed.
6. Applied database migrations are immutable. Corrections use a new migration. Economy history is append-only and is corrected through compensating entries, not historical rewrites.
7. Unknown commercial values are labeled hypothesis/test target. WLD activity is not real-currency revenue.
8. Runtime implementation is performed separately: branch → static/unit/integration/real-DB/security tests → immutable candidate → isolated exact-SHA test deployment → backend/API/DB/user-flow QA → main integration → exact-main-SHA release gate → Production promotion → Production smoke/monitoring → rollback if required.

## 1. Product and non-negotiable system boundaries

Woldeok Moneyverse is a community virtual-economy/game platform spanning web and Discord. Users authenticate, earn/spend WLD, progress through jobs/quests, collect/use items, operate virtual businesses, use a virtual bank/loans, use virtual stocks, community/social features and probability/game features.

WLD, WDX/virtual stocks, bank balances, loans, casino play, rewards and related values are game/simulation data only. The service does not promise cash redemption, real securities, deposits, guaranteed yield, external prizes, investment return or real gambling. Any future change toward real-money financial/gambling value is a separate product/legal redesign and cannot inherit this plan’s approval.

Current technical baseline is Next.js frontend, NestJS API, PostgreSQL authoritative state/economy/authorization, protected `SECURITY DEFINER` database functions for sensitive paths, least-privilege application DB roles, append-only double-entry ledger, idempotency for retryable value-changing operations, and outbox-style post-commit external delivery.

### 1.1 Economy invariants

Every value-changing operation validates actor/policy/eligibility/limits/idempotency and atomically writes ledger postings, derived balances, audit/outbox as required. Debits and credits reconcile; disallowed negative balances remain impossible at the transaction boundary. Money is transported/stored using integer-safe/string-safe contracts rather than unsafe JavaScript `Number` conversion. Corrections reference the original transaction and create compensating transactions.

### 1.2 Security baseline

Use OWASP ASVS 5.0.0 and OWASP API Security Top 10 as verification baselines, not certification claims. Required cross-cutting controls include OAuth/OIDC state/nonce/PKCE/exact redirect, secure session rotation/invalidation, recent reauthentication, CSRF, BOLA/IDOR negative authorization tests, XSS/output encoding, SQLi/SSRF/path traversal/command-injection defense, decoded file-type validation, rate/resource-abuse controls, least-privilege DB roles, CORS/CSP/security headers, secret management, dependency/supply-chain controls, container/Kubernetes hardening, encrypted recoverable backups, append-only audit, privacy minimization/retention/deletion and secret-safe logs.

### 1.3 Administrator boundary

Current model is a single `superadmin` with compensating controls, not mandatory two-person approval. `AdminSessionGuard`, recent `ReauthGuard`, TOTP/`SecondFactorGuard`, database-side actor checks, least privilege, impact preview, reason capture, idempotency where relevant and append-only audit are required for sensitive operations. The superadmin does not receive a bypass to directly rewrite protected economy/audit history. Read-only operational views may avoid unnecessary step-up but still require proper admin session/role authorization.

## 2. Current priority and release blocker register

Priority order: `P0 data loss/security/auth/authorization/asset duplication/economy abuse/outage/DB integrity/promotion evidence` → `P1 major user correctness/core completeness` → `P1 shop/payment/monetization` → `P1 SEO/acquisition` → `P2 retention/growth` → `P2 UX/accessibility` → `P3 long-term expansion`.

### BAK-106-01 — P0 — OPEN — independent backup + successful restore evidence unavailable

- First evidence: GitHub issue #139 opened 2026-09-09, still open on 2026-09-15. Last recorded direct inspection found designated `/mnt/backup` (`/dev/sda1`) mounted read-only, newest observed separate-media files from 2026-09-07, and no current Kubernetes-era automated backup on that medium. An emergency PostgreSQL custom-format dump passed SHA-256 and `pg_restore -l` but lived on the same system disk.
- Repository recovery worklog explicitly says `moneyverse_recovery` is a recovery/inspection convenience and does not replace encrypted separate-media backup.
- Impact: complete host/storage loss can threaten identity/session/economy/ledger/audit/inventory/entitlement/object data and recovery/dispute capability.
- Rule: destructive or schema/data-changing Production work is blocked unless a current independently recoverable backup and successful restore evidence are proven. Docs-only work is unaffected.
- Close condition: section 9 recovery architecture + full restore drill + monitoring + release evidence are implemented and current.

### AUTH-105-01 — P0 — OPEN / PUBLIC LOCAL-AUTH ROLLOUT HOLD

Current code/migrations/mobile contracts contain local email registration, verification and login with Argon2id/email-hash/token-hash processing while current public web login/guide/privacy evidence remains OAuth-centric. Do not newly market or generally expose local registration until privacy notice/policy version/consent, retention/deletion/credential removal, SMTP/processor facts, security controls, token-link privacy, exact-SHA test evidence and rollback are aligned. Preserve existing legitimate identities if the endpoint already exists; do not perform destructive account disablement merely to make public copy match.

### QA-104-01 — P0 — OPEN — profession-work quota guidance contradicts authoritative quota behavior

Public guide evidence states unlimited repeated full WLD/EXP work while current server/DB contract uses task-specific `daily_limit`, `taken_today`, exact-limit acceptance, over-limit denial and member/task concurrency protection. Fix public/web/mobile/FAQ/schema examples; show reward eligibility separately from playability; test 0/partial/exact/+1 quota, profession/task isolation, double submit, idempotency, Seoul-day boundary and web/mobile/API parity. Copy correction does not justify reverting quota protection.

### REL-104-02 — P0 — OPEN — Production-ready automation proves less than normative release evidence

Current release workflow has exact-SHA/test/catalog/noindex evidence, while this plan requires migration parity/checksum, authenticated synthetic smoke, least-privilege DB connectivity, changed economy invariants/reconciliation, backup/restore evidence for destructive changes and rollback target. Add a fail-closed machine-readable `release-evidence` stage before `production-ready`; missing synthetic identity/evidence is `BLOCKED`, never skipped-pass.

### AUTH-105-02 — P1 — TODO — app-auth verification documentation stale

Current verify-email design is a one-time bearer-token cross-browser/no-cookie exchange rather than an originating prelogin-cookie/CSRF-dependent operation. Synchronize English/Korean app-auth guide, schema/catalog/examples and test same/cross-browser, invalid/expired/reused token, session rotation, arbitrary CSRF, old client behavior.

### REL-104-03 — P1 — TODO — runtime-code required checks not repository-enforced for every main update

Maintain protected/no-force main and add the narrowest possible ruleset requiring approved runtime-code integration and successful checks for `backend/`, `frontend/`, `packages/database/`, deploy manifests/security scripts. Preserve the explicit docs-only direct-main automation without allowing it to become a runtime-code bypass. Sandbox-test failing PR/direct push denial and validated automation success.

## 3. Mandatory specification template for every feature

Every feature/backlog item must contain all of the following, with implementation evidence linked: purpose/user problem; target actor/role; implementation status; user story; entry routes; screen components/CTA; state transitions; loading/empty/error/offline/timeout; first-use/return/comeback; mobile/tablet/desktop; keyboard/focus/label/contrast/reduced-motion; i18n; email/push/Discord needs; data model/ownership; read/write permissions; endpoint/method/request/response/error codes; idempotency/rate/resource limits; service/business rules; tables/indexes/constraints/transactions/concurrency; audit/metrics/admin operations; feature flag/fallback; backup/recovery impact; threats/privacy/abuse; SEO/indexing; analytics/KPI; latency/cache/performance; profitability/cost; completion criteria; unit/integration/E2E/real-DB/security/regression tests; isolated-test acceptance; Production promotion/monitoring/rollback.

## 4. Current all-feature implementation and product contract matrix

| Feature family | Evidence/status | UX / authority / data / API-DB contract | Security/privacy/abuse | SEO/growth/business | Mandatory QA/release gate |
|---|---|---|---|---|---|
| Registration/login/OAuth/logout/session | `IMPLEMENTED/PARTIAL`; Nest auth/provider/local slices documented | Server owns provider linking, consent, session issue/rotation/revoke. Client shows loading/provider error/consent/session-expired/offline and never infers auth solely from local state. Local register/login use prelogin+CSRF; verify-email uses one-time bearer token. | Credential stuffing/resource limits; OAuth state/nonce/PKCE/exact redirect; secure cookie; fixation rotation; logout invalidation; no secret logs/URLs; no silent local/OAuth email merge. | Auth pages noindex. Funnel = verified session→meaningful activation→D1/D7/D30. Local auth value = incremental retained contribution minus SMTP/compute/CS/fraud/privacy cost. | Guard/DTO, state replay, fixation/logout, provider collision, local token expiry/replay/cross-browser, rate 429, secret scan, policy/privacy parity. AUTH-105-01 blocks general local-auth rollout. |
| Profile/account/security center | `PARTIAL` | Member profile/linked methods/session list are server authoritative; sensitive changes recent-reauth; other-session termination and recovery states explicit. | BOLA on account/session IDs, ATO alerts without secrets, privacy-minimal defaults, audit security changes. | Private/auth/noindex. Value = lower ATO/support loss/trust. | Other-user session denial, reauth expiry, terminate-other/all, provider-loss recovery, responsive/accessibility. |
| Inventory/collection/marketplace workbench | `PARTIAL`; holdings/curation slices exist; live P2P settlement not assumed | DB owns item, owner, provenance/entitlement/serial. Empty/error/offline never fabricate holdings. Future listing defines escrow, cancel, expiry, settlement, fee, reversal. | BOLA/serial leakage, duplicate grants, multi-account wash trade/collusion, replay. | Holdings private/noindex; public-safe opted-in collection only. WLD spend is sink, not revenue. Retention = acquire→use→curate→reuse. | Ownership concurrency, duplicate entitlement, unauthorized transfer, recovery, private URL leak, future wash-trade tests. |
| WLD shop/catalog | `IMPLEMENTED/PARTIAL` public catalog/store | Server authoritative item/effective price/eligibility/limit/sale window/entitlement. UX displays exact currency, ownership/duplicate behavior, deadline, receipt; retries idempotent. Each SKU records ID/name/category/description/audience/value, WLD-vs-real payment, consumable class, test price, promotion/stock/window/limit, binding/gift/refund/recovery, sink/source, P2W, KPI, admin lifecycle. | No client price authority, duplicate grant/replay, fake/resetting scarcity, hidden personalized pricing, P2W/wealth/casino pressure. | Substantial editorial collection pages may index; purchase history private. Unit economics for WLD are economy health/retention, not real revenue. | Price tamper, boundary time, insufficient balance, double click/concurrent purchase, entitlement repair/cache invalidation, catalog admin deactivate/reactivate. |
| Real-money cart/payment/subscription/ad removal | `UNVERIFIED`; never infer from WLD shop | Before implementation select provider and define order/cart authority, tax, receipt/webhook signature, entitlement source, cancel/refund/renewal/billing recovery/idempotency. Material recurring terms before charge and simple cancellation. | Receipt/webhook forgery/replay, order BOLA, PCI/provider boundary, refund/chargeback fraud, secret signature storage. | Checkout/order/account noindex. Unit economics = displayed price minus tax/platform/payment/refund/chargeback/content/CS/moderation/fraud/infra. | Provider sandbox; duplicate/out-of-order webhook; refund/regrant; renewal/cancel/grace/recovery; legal/policy gate; predeclared SCALE/ITERATE/HOLD/KILL. |
| Jobs/quests/profession/level/rewards | `PARTIAL + P0 content drift` | Server/DB owns catalog, min duration, cooldown, daily quota, reward/EXP, receipt, progression unlocks. UI shows remaining rewarded completions/next unlock and distinguishes playable vs reward-eligible. | Bot/macro, multi-account, replay, clock/reset abuse, concurrent duplicate completion, ledger reconciliation. | Corrected guide may index for game-system learning. KPI TTFV, first verified job, D1/D7 progression, reward inflation/fraud. | QA-104-01 exact-SHA real-DB matrix is release blocking. |
| Business | `UNVERIFIED/PARTIAL` | Define inventory, demand, sale price, costs, fees/tax, management state and settlement; no risk-free fixed compounding; all value through ledger/idempotency. | Circular/multi-account demand farming, refund/replay, admin manipulation, precision. | Public educational pages can index; private P&L noindex. KPI retention + sustainable sink/source, not nominal profit. | Real-DB settlement/reconciliation/concurrency and abuse simulations before expansion. |
| Bank/loans | `UNVERIFIED/PARTIAL` | Server owns eligibility/source-of-funds, principal, interest/accrual schedule, repayment/minimum/arrears, purpose restrictions, recovery. Loan source must not become uncontrolled mint. | Double repayment, clock abuse, BOLA, multi-account, loss-chasing; game-only wording, no real deposit/yield promise. | Public education must clearly say simulation/game; private balance/debt noindex. | Accrual boundaries, idempotent/concurrent repayment, insufficient balance, restart/recovery, ledger reconciliation. |
| Virtual stocks/WDX/watchlist/portfolio/alerts/comparison | `PARTIAL`; detail/watch/comparison/alert slices documented | Public market read model separated from private holdings. Issuance/pricing/trading/settlement/server market rules authoritative. URL may carry public symbol/compare state only. | Holdings BOLA, duplicate settlement, manipulation/collusion, alert spam/phishing, integer precision. | Public-safe substantial `/stocks/[symbol]` may index; portfolio/watchlist/orders/alerts private/noindex. KPI discovery→activation→D7, not trade volume alone. | Other-user holdings denial, symbol validation, large integer, settlement replay/concurrency, alert cooldown, manipulation cases. |
| Casino/probability | `PARTIAL/high-risk` | Server generates outcomes, publishes probability/payout/limits, settles atomically, same idempotency key returns same receipt/outcome. | RNG/result tamper, replay, limit bypass, bots/multi-account, loss chasing/youth risk. No cash redemption/external prize. | Gameplay/account history noindex; acquisition must not promise winnings. Real revenue = 0 absent separately approved paid model. | Distribution sanity, deterministic replay receipt, limit/max-loss boundary, concurrency, ledger reconciliation, legal/product review. |
| Seasons/live events | `PARTIAL/plan+calendar slices` | Server owns start/end/grace/reward eligibility; D-14/D-7/D-3/D-1 previews are content, not client authority. Catch-up and archives preserve history after end. | Bot/multi-account reward farming, collusion, deadline manipulation/fake FOMO. | Public season/archive pages can index when substantial, with truthful dates/lastModified. | Timezone boundaries, late entry/catch-up, reward duplicate, archive transition, notification cooldown. |
| Community/posts/comments/report/block | `PARTIAL` | Server owns authorship/edit/delete/moderation status; UI has loading/empty/deleted/locked/report/block feedback without leaking enforcement internals. | Spam/bot, harassment, impersonation/doxxing, malicious links, stored XSS, BOLA, moderator abuse. | Curated board index may index; individual UGC defaults noindex until documented quality/moderation rule. Ads remain off unreviewed detail. | Other-user edit/delete denial, XSS/link, report spam, block semantics, moderator audit, deletion→404/410/index removal. |
| Friends/clubs/referral | `UNVERIFIED/PARTIAL` | Define invite lifecycle, member/role/leave/kick/ban, visibility, attribution and reward maturity. | Invite spam, fake account/referral fraud, collusion, role escalation, private membership leakage. Rewards favor cosmetic/prestige/convenience after fraud-resistant milestones. | Public club only explicit visibility; private graph no search/share leak. | Multi-account/referral ring, invite replay, role escalation, privacy/block interaction. |
| Notifications/email/push/Discord | `PARTIAL` | Server owns source event, preference/consent, cooldown/dedupe, delivery state, canonical deep link. Text excludes sensitive balances/debt/security state. | Phishing/ATO imitation, webhook abuse, spam, token leakage. | Noindex. Business = incremental healthy return minus provider/opt-out/spam/privacy/support cost. | Dedupe/cooldown, revoked/stale link, opt-out, provider outage/retry/outbox, secret-safe logs. |
| Search | `UNVERIFIED` | Public search reads public-safe model; member/admin search explicitly authorized. Define parsing, pagination, empty/no-result, timeout. | Injection, expensive-query DoS, object enumeration, query-log PII. | Query result pages normally noindex; only curated stable intent landing may index. | Authorization, special chars, pagination stability, complexity/rate limits, relevance regression. |
| Upload/gallery/files | `PARTIAL/spec-level unless feature code linked` | Decode/type/magic-byte validation; size/dimensions; generated names; isolated storage; authorized delivery; strip private EXIF/metadata as applicable. | Malware/polyglot/path traversal/decompression bomb/remote-fetch SSRF/BOLA/metadata leakage. | Private media noindex; public media stable safe URL/alt/dimensions only after permission/moderation. | Malformed/polyglot, oversized dimensions, unauthorized read, EXIF strip, storage failure/restore. |
| Public home/guide/status/content | `IMPLEMENTED public slices` | Public read model must fail honestly; status shows measurement age; guide/help must match server behavior. | No secret/topology/stack traces/user state; XSS/phishing lookalike controls. | Canonical/indexable when original/substantial. `/guide` expansion HOLD while QA-104-01 and local-auth wording conflict remain. | HTTP/status/meta/canonical/structured data/accessibility/CWV/content-contract regression. |
| App API/mobile gateway | `PARTIAL/COVERAGE DOCUMENTED` | Versioned `/app-api/v1`, stable wrapper/shape; one-time server-verified handoff; breaking change requires compatibility or version bump. | Handoff/token replay, BOLA, rate/resource abuse, PII/log masking. | API noindex. Value = mobile activation/D30 minus support/infra/fraud. | Contract snapshots, old-client compatibility, auth expiry, handoff one-time, error-code parity, auth-doc parity AUTH-105-02. |
| Admin/audit | `PARTIAL/implemented controls` | Read and risky write separated. High-risk operation shows current/proposed/targets/impact/reason and uses reauth+TOTP+DB actor+idempotency/audit as relevant. | Privilege escalation/session theft/CSRF/BOLA/mass-action/audit tamper; single-superadmin residual risk. | Always private/noindex. Value = lower incident/operator/support cost. | Lower-role denial, stale reauth, invalid TOTP, impact preview, mass-action bounds, DB privilege/audit integrity, compensation. |
| Backup/recovery | `UNVERIFIED CURRENT EVIDENCE`; BAK-106-01 P0 | Section 9 is authoritative: explicit RPO/RTO, independent encrypted backup, source/version/checksum, isolated restore, app/ledger/object validation. | Key theft/plaintext, shared failure domain, wrong-env restore, corrupted/WAL-gap backup, retention shadow copies. | Private/noindex. Direct revenue 0; value = expected loss/downtime avoided. | Destructive DB change blocked until current independently restorable evidence. Full fault-injected restore drill. |
| Analytics/experiments | `PARTIAL/SPECIFIED` | Pseudonymous subject; analytics session ≠ auth secret; versioned event schema, retention, experiment assignment, guardrails. | PII/secret leak, reidentification, experiment abuse, sensitive finance/security profiling. | Safe campaign/content IDs can link to downstream cohorts; no private SEO payload. | Schema validation, consent/deletion, deterministic assignment, outbound secret/privacy scan. |
| Advertising/sponsorship | `IMPLEMENTED/PARTIAL reviewed public placements` | Only approved substantial public surfaces; Production default-reviewed enable; test forced off; sponsor/ads visibly distinguished from product action. | Invalid traffic/click encouragement/youth/privacy targeting/tracker leakage/sponsor confusion. | Ads do not justify thin indexing. `net ad contribution = revenue - churn/session/support/privacy/fraud cost`. | Route allowlist, test ads disabled, CLS/CWV, ad-induced exit, invalid traffic/policy/privacy review. |
| SEO backend | `PARTIAL` | Deterministic configured-origin canonical builder; public `SeoMetadataReadModel`; dynamic sitemap shards; robots; redirect map; structured-data serializer; authoritative updatedAt/lastModified; image metadata; crawler/GSC/Naver observation. | Private-route leakage, Host canonical injection, cache poisoning, PII in sitemap/JSON-LD, admin exposure. | KPI organic→signup→activation→D7/D30→net revenue/retained value and organic CAC savings. | Sitemap privacy scan, canonical injection, redirect loops, SSR content, GSC/Naver errors, representative CWV. |
| Incident/status/operations | `PARTIAL` | Public-safe status separated from internal telemetry; incident severity/start/update/resolution/customer impact/owner/rollback and postmortem. | Topology/secret over-disclosure, fake status, admin abuse, alert fatigue. | Trust/support/MTTR function, not acquisition bait. | Dependency outage, stale-status detection, alert routing, rollback/restore drill, public-safe copy. |

## 5. Local first-party authentication detailed contract

| Step | Endpoint/current authority | Required state/UX | Security/error/data contract |
|---|---|---|---|
| prelogin | `POST /app-api/v1/auth/prelogin-session` | resumable pre-auth state; retryable service failure | secure prelogin cookie + in-memory CSRF; no secret logging |
| policy | `GET /app-api/v1/auth/policy` | render current terms/privacy versions before local registration | server version authoritative; client never hard-codes |
| consent | `PUT /app-api/v1/auth/consent` | explicit current terms/privacy/age acknowledgement | SessionGuard+CSRF; stale version requires refresh/review; no silent consent |
| register | `POST /app-api/v1/auth/local/register` | email/password/display name, typo help, pending verification, recoverable SMTP failure | prelogin+CSRF/current consent; generic public semantics; common-password policy; normalized email/email hash/Argon2id verifier/display name/hashed one-time token; abuse budget |
| verify | `POST /app-api/v1/auth/local/verify-email` | link may open cross-browser; success becomes signed-in | one-time short-lived bearer token is authority; no SessionGuard/CSRF dependency; raw token never logged; consume then clean token-free navigation |
| login | `POST /app-api/v1/auth/local/login` | unknown email and wrong password same public class; distinguish offline/429/5xx | prelogin+CSRF, dummy password work for nonexistent account, rate/resource abuse control, session issue/rotation |
| viewer/session | `GET /app-api/v1/auth/viewer`, `GET /app-api/v1/auth/session` | client trusts only server signed-in state; stale consent routes to review | signed-in cookie authority; no client-only auth inference |
| logout | `POST /app-api/v1/auth/logout` | UI does not pretend server logout succeeded while offline | signed-in session+CSRF; revoke server session/cookie and audit as appropriate |

Verification-token URL/page: noindex/X-Robots, sitemap excluded, `Referrer-Policy: no-referrer` or validated equivalent, no ads/third-party analytics/social widgets/marketing pixels before exchange, query strings redacted from logs, GET preview/scanner does not consume token, token removed from address bar/history after exchange. Product analytics records only pseudonymous coarse states and never email/email-hash/password/verifier/token/cookie/CSRF/OAuth code/recovery secrets.

## 6. SEO implementation contract

### 6.1 Route policy

- `/`: `PUBLIC_INDEXABLE`, configured-origin canonical `/`, unique title/H1/meta, truthful Organization/WebSite markup when factual, OG/social metadata, stable image dimensions, internal links to substantial content.
- `/guide`: `PUBLIC_INDEXABLE_BUT_ACQUISITION_HOLD` until QA-104-01 and local-auth password wording are accurate. Target game-system beginner intent, not real-investment return queries.
- `/status`: public canonical only as truthful service-status information; public safety outranks acquisition.
- Public news/season/collection/world guides: index when original, substantial, maintained, with stable slug, author/review/update context, breadcrumb and meaningful `lastModified`.
- `/stocks/[symbol]`: only public-safe stock/world read model indexable. Holdings/watch/orders/alerts/portfolio never enter anonymous HTML/JSON-LD/shared cache.
- Community: board index only when moderated/substantial; individual UGC default noindex until documented quality/moderation rule. Removed content returns appropriate 404/410 and leaves sitemap.
- Search/filter/sort/pagination/query variants: canonical/noindex unless intentionally curated stable landing; no doorway page generation.
- Login/signup/verify/recovery/account/security/wallet/transfer/private business/bank/loan/portfolio/watchlist/alerts/checkout/orders/subscription/admin/moderation/backup/recovery: `AUTH_REQUIRED` or `PUBLIC_NOINDEX`, excluded from sitemap.
- Test/recovery origins: global noindex, no real ads, no sitemap submission/indexable data.

### 6.2 SEO backend backlog

Implement and test: safe public `SeoMetadataReadModel`; configured-origin canonical builder immune to Host-header injection; sitemap index/shards with URL/byte limits and meaningful lastModified; robots generator; JSON-LD schema allowlist serializer; permanent 301/308 redirect map with loop/conflict detection; image metadata/alt/dimension service; locale/hreflang policy; crawler-log classification; Search Console/Naver verification/status ingestion; crawl/index/canonical/sitemap issue reporting; SEO operator read dashboard/API. Keep HTML/meta/sitemap/redirect cache invalidation coherent. Private identity/economy/security state never enters cache keys or public structured data.

### 6.3 SEO KPI and performance

Track impressions/click/CTR only as upstream diagnostics. Business funnel is organic visit → qualified interest → signup → activation → D1/D7/D30 → retained contribution/real net revenue. Measure organic CAC as attributable content+SEO/tooling cost divided by incremental organic D30 retained users. Representative public templates target good Core Web Vitals (LCP ≤2.5s, INP <200ms, CLS <0.1) and are regression-tested on mobile/desktop.

## 7. Security threat and verification register

| Risk | Severity | Required prevention/detection | Mandatory test / release behavior |
|---|---|---|---|
| BOLA/IDOR | HIGH | actor-scoped authorization at service/DB for every object read/write; never trust owner ID from client; denial metrics without sensitive payload | other-user ID negative test on every object API; failure blocks |
| Credential stuffing/session fixation | HIGH | generic auth errors, rate/abuse signals, session rotation, secure cookies, recent reauth, logout invalidation, OAuth uniqueness | sequential/distributed invalid auth, fixation/logout/reauth/state/nonce/PKCE; unexplained bypass blocks |
| Economy replay/duplicate/concurrency | HIGH | idempotency unique constraints, DB transaction/locking, append-only ledger/reconciliation | parallel/retry/replay, precision and ledger balance; unexplained mismatch blocks |
| Admin abuse | HIGH | session+reauth+TOTP+DB actor+least privilege+impact preview+append-only audit | lower-role, stale reauth, invalid TOTP, CSRF, mass-action, DB privilege; failure blocks |
| Upload/UGC | HIGH | decoded file type, isolated storage, output encoding/CSP, metadata minimization, moderation/report/block | polyglot/malformed/XSS/link/unauthorized delivery |
| Analytics/ad/SEO leakage | MEDIUM/HIGH by data | outbound allowlist, minimization, no token/balance/debt/security state in URLs/structured data | payload/schema/sitemap/JSON-LD scan; HIGH leakage blocks |
| Supply chain | MEDIUM/HIGH | pin critical actions/dependencies to reviewed immutable versions where feasible, dependency audit/SBOM/provenance | workflow/dependency policy regression; critical/high unresolved issue follows release policy |
| Release-evidence bypass | HIGH | immutable SHA, machine-readable fail-closed evidence, no skip-pass | intentionally break each release prerequisite; `production-ready` must not emit |
| Backup/key compromise | HIGH | encryption, key separation, independent medium, least-privilege backup identity, access audit | unauthorized identity/key/plaintext tests; HIGH leak blocks |
| Wrong-environment restore | CRITICAL/HIGH | explicit source/target, isolated namespace/DB, separate credentials/outbound sinks | simulate wrong target/Production credential; any unintended Production write possibility blocks |
| Backup corruption/WAL gap | HIGH | checksums/manifests, tool/version checks, regular full restores, WAL monitoring, ledger/data reconciliation | corrupt/missing WAL/wrong checksum must fail closed and alert |
| Multi-account/referral/market manipulation | HIGH where economy affected | maturity/caps, graph/anomaly review, transaction provenance, separation of raw acquisition signal from economic reward | referral ring, wash trade/collusion, duplicate reward, replay scenarios |

Secrets/passwords/verifiers/session cookies/OAuth codes/client secrets/bot tokens/DB passwords/backup keys/raw verification/recovery tokens and unrestricted request bodies are never written to general logs. Security events use pseudonymous IDs and safe classifications.

## 8. Profitability and business contract

No feature is approved from gross revenue alone. For real-money or ad monetization record: model (subscription/one-time/consumable/non-consumable/ad/sponsor/B2B2C/indirect retention/acquisition), user conversion path, displayed/test price, attach/paid conversion/repeat/renewal hypothesis, refund/churn/cancellation, ARPU/ARPDAU/ARPPU only when real revenue exists, eCPM/fill/CTR for ads, platform/payment/tax/refund/chargeback, infra/storage/CDN/notification/LLM, content/CS/moderation/fraud/security cost, gross/contribution margin, CAC, LTV, LTV/CAC, payback, optimistic/base/conservative sensitivity, D1/D7/D30 impact, trust/regulatory cost and predeclared `SCALE/ITERATE/HOLD/KILL`.

- WLD-only shop/casino/bank/stock activity is game-economy activity, not real revenue.
- Advertising uses `net ad contribution = ad revenue - estimated LTV loss from ad-induced churn/session reduction - ad infra/privacy/support/fraud cost`.
- SEO uses incremental organic D30 retained users and organic CAC savings rather than impression growth alone.
- Security/QA/release/backup uses avoided expected incident/data-loss/downtime/refund/fraud/support cost; do not fabricate currency values without data.
- Local auth uses incremental D30 retained-user contribution minus SMTP/Argon2/DB/support/fraud/privacy/security operations cost.
- Future recurring billing must disclose material terms before charge, obtain affirmative consent, and provide straightforward cancellation. Provider/platform-specific fees are not assumed until a provider is selected and current official terms are verified.

## 9. Backup and disaster-recovery contract — v106 normative addition

### 9.1 Recovery objectives and data scope

Approve explicit RPO and RTO based on acceptable identity/ledger/content loss and recovery cost; this plan does not invent numeric targets. Measure RPO from the newest actually restorable point and RTO from a timed full drill. Back up at least authoritative PostgreSQL identity/economy/ledger/audit, migration/schema/version manifests/checksums, inventory/entitlement/content metadata, required object/photo store and the application/GitOps version needed to interpret the data. Keys/secrets use a separate encrypted recovery control plane.

A recovery DB/read replica/snapshot/local dump sharing the primary host/storage/failure domain or credentials is recovery convenience, not sufficient independent disaster recovery.

### 9.2 Backup architecture

Use an independent/off-host failure domain; encryption in transit/at rest; key separation and tested key recovery; least-privilege backup identity; separate restore credentials; source env/DB/app/migration/tool/timestamp/backup ID/checksum/retention metadata; monitored capacity; controlled deletion/retention/tamper protection. Choose logical dump, physical base backup, continuous archiving/PITR or combination according to approved RPO/RTO. Logical structure checks do not replace full restore. If PITR is selected, prove required WAL coverage and recovery target behavior.

### 9.3 `VERIFIED_RESTORABLE` drill

A backup is verified only after: clean isolated target → source/backup identity verification → decrypt/key/checksum/manifest → full DB restore (and target/WAL proof if PITR) → migration/checksum parity → least-privilege application smoke with Production outbound disabled → DB referential checks → ledger debit/credit and derived-balance reconciliation → inventory/entitlement/provenance checks → representative object/photo restore → proof that notification/webhook/Discord/email/ads/index are non-Production/off → measured recoverable point and restore duration → evidence/operator/audit record → controlled disposal/retention of recovery copy.

File existence, checksum alone, `pg_restore -l` alone or a recovery replica alone is not a successful DR drill.

### 9.4 Machine-readable release evidence for destructive/schema-changing work

Required fields: candidate SHA, backup ID, source stack/DB ID, createdAt, independent failure-domain classification, encryption/key result, checksum/manifest result, restore drill ID/time/result, achieved RPO/RTO status, migration checksum parity, ledger/derived-balance reconciliation, relevant object-store sample, rollback application/GitOps target, operator/audit ID, evidence freshness/expiry. Missing/stale/corrupt/wrong-key/wrong-env/WAL-gap/reconciliation-failed/untested evidence = `BLOCKED`, never skip-pass.

### 9.5 Backup security/privacy/SEO

Backup/restore/admin artifacts are private/authenticated/noindex and sitemap-excluded. Public status may expose only a truthful safe high-level recovery-health category/timestamp if desired; never paths, provider IDs, DB names, keys, checksums, WAL locations or internal topology. Restore environments remain noindex/ad-free and never use Production side-effect credentials. Retention/disposal of restore copies is audited.

### 9.6 Backup QA and monitoring

Alert on stale/failed backup, checksum/manifest mismatch, decrypt/key failure, insufficient storage, restore-drill failure, recovery-refresh failure, reconciliation failure and PITR/WAL gap when applicable; deduplicate alerts and exclude user/economy payloads. Fault-inject stale/missing/corrupt archive, wrong key, storage-full, wrong target, Production credential and WAL-gap scenarios. Rehearse last-known-good immutable application/GitOps rollback and record actual recovery duration.

Business KPI: backup success/freshness, independent-copy coverage, verified-restore success, achieved RPO/measured RTO, drill failures, storage/key/compute/operator cost, expected-loss avoided. Direct revenue is zero. `SCALE` when approved recovery objectives are reliably met at acceptable cost; `ITERATE` when copies exist but proof/automation/cost is weak; `HOLD` destructive changes while proof is missing; `KILL` a path that is not independently restorable or creates unacceptable secret/privacy risk.

## 10. QA, test environment, release, monitoring and rollback

Every material issue records severity, first found, last reproduced, exact reproduction, affected user/function, evidence, root-cause hypothesis/confirmation, frontend/backend/API/DB/infra target, concrete design, migration need, rollback, unit/integration/E2E/real-DB/security/regression tests, test acceptance, Production promotion, monitoring, status and owner sequence. Repeated `BLOCKED` becomes a root-cause-removal item. CRITICAL/HIGH beats feature work.

### 10.1 Candidate/release sequence

`new branch → lint/type/unit/integration/real-DB/security → immutable candidate/SBOM/provenance as applicable → isolated exact-SHA deployment → migration checksum/parity → backend/DB least-privilege smoke → authenticated synthetic flow → changed feature E2E/abuse tests → release evidence including restore/rollback for DB-changing work → main integration → exact-main-SHA test gate → Production-ready → GitOps Production → HTTP/API/auth/user-flow/log/resource smoke → monitor/rollback`.

The test environment uses isolated namespace/database, indexing off and real ads off. Missing test evidence is not converted into a pass. Test/recovery stacks must not send Production email/Discord/webhook or mutate Production data.

### 10.2 Monitoring guardrails

Observe API 4xx/5xx classes, auth failures/ATO signals, DB pool/transaction errors, migration parity, ledger reconciliation, suspicious duplicate reward, quota denials, shop entitlement failures, alert/outbox/provider failures, ad-induced exit/CWV, crawler/index errors, backup freshness/restore status, deployment evidence and rollback availability. Logs contain IDs/classes, not raw secrets/private payloads.

## 11. UX, activation, retention and operations

First visit explains one clear product promise and game-only boundary before presenting the whole economy. Activation is visit → understand → sample/value → contextual signup → first meaningful verified action → first result/reward → next goal. New users are not required to learn market/business/bank/casino simultaneously.

D1 restores the exact thread the user selected; D3 shows real change or honest no-change; D7 resolves a coherent progression/collection/project/learning loop; D14 encourages optional breadth; D30 should leave durable history/identity/collection rather than attendance punishment. Support 1–3 minute quick checks, 5–15 minute meaningful sessions and optional deep sessions. Avoid punitive streaks, loss-threat FOMO and excessive notifications; provide catch-up/comeback.

Social sharing prefers public-safe achievements/collections/projects/season records/learning results. Shared URLs contain no session token, private holdings, balances, debt, casino history, recovery/security state or PII. Referral rewards favor cosmetics/prestige/convenience and require fraud-resistant maturity rather than raw signup.

Admin/CS operations define dispute/refund/report/abuse queues, feature flags, rollback/fallback, safe incident messaging and audit. High-risk account/economy actions use clear confirmation and anti-phishing UX rather than ambiguous notices.

## 12. External reference decisions — 2026-09-15

- PostgreSQL current `pg_verifybackup`: **DIRECT ADOPT** for compatible backup manifest/checksum verification; PostgreSQL itself notes this cannot prove every property of a running restored server, so full restore testing remains mandatory.
- PostgreSQL current continuous archiving/PITR: **DIRECT ADOPT IF PITR SELECTED**; WAL availability and recovery targets are part of recovery evidence.
- CISA StopRansomware: **DIRECT ADOPT as resilience guidance** for independent/offline encrypted backup and regular recovery availability/integrity testing.
- NIST SP 1339 (2026-06-17): **REFERENCE/DIRECT OPERATING PRINCIPLE** for integrating backup management with change management, regular backup/testing/recovery exercises; this does not characterize Moneyverse as an OT deployment.
- OWASP ASVS 5.0.0 / API Security Top 10: **DIRECT ADOPT as verification baseline** for authentication/session/BOLA/resource/business-flow controls.
- Google Search Central and Naver Search Advisor current guidance: **DIRECT ADOPT** for canonical/indexing/sitemap/crawl/public-content quality and explicit noindex/auth boundaries.
- Korea PIPC current privacy-policy material: **DIRECT ADOPT as disclosure design guidance** so purpose/items/retention/rights match actual authentication/analytics processing.
- FTC 2026 subscription/negative-option enforcement/rulemaking: **REFERENCE/DIRECT PRODUCT GUARDRAIL** for any future real recurring billing: clear material terms, affirmative consent and straightforward cancellation; do not claim automatic universal jurisdiction.

## 13. Current evidence snapshot and integration record — v2026.09.15.106

- Starting and mid-run pre-documentation `main`: `e1dce34cf3e7544d3bb3fe53a80caf992945a213`; no concurrent external commit was observed before v106 documentation commits began.
- GitHub issue #139 remained OPEN; its last direct inspection evidence is the read-only designated backup SSD and same-host emergency dump.
- Recovery worklog says `moneyverse_recovery` does not replace encrypted separate-media backup.
- Connected GitHub combined status for the starting SHA had no individual status entries; the available PR-triggered workflow lookup returned no runs. This run does not claim CI/test-server pass.
- Fresh direct Production `/status` verification was unavailable in this run and no older runtime snapshot is reused as current truth. Authorized remote device access was also unavailable, so no new host/Kubernetes/mount inspection is claimed.
- New P0: `BAK-106-01`. Carried P0: `AUTH-105-01`, `QA-104-01`, `REL-104-02`. Carried P1: `AUTH-105-02`, `REL-104-03`.
- v106 changes planning/docs only; it does not change runtime code, DB schema/data, backup devices, infrastructure, secrets, branch settings or security implementation.
