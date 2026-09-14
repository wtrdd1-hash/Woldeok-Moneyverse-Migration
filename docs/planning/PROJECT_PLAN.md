# Woldeok Moneyverse — Living Project Plan

> Status: Living specification / current authoritative integrated plan
> Original baseline: 2026-08-26
> Current integrated version: v2026.09.15.107
> Implementation/evidence sync: 2026-09-15
> Korean counterpart: [PROJECT_PLAN.ko.md](PROJECT_PLAN.ko.md)

Historical detail remains recoverable from Git and versioned changelog/worklog files. This document is the current implementation-facing contract. A developer or agent must be able to derive product scope, authority boundaries, data flow, failure states, security, SEO, business economics, QA, release evidence and rollback rules from this plan without treating older drafts as current truth.

## 0. Maintenance and evidence rules

1. Material planning starts with fresh external research. Prefer current official product/platform docs, regulators, OWASP/security bodies and primary runtime evidence. Important decisions compare more than one independent source when practical.
2. Before changing a contract, read latest `main`, this English canonical, `PROJECT_PLAN.ko.md`, recent QA/worklogs, CI/release automation, runtime evidence and relevant code/migrations. Re-check `main` mid-run and immediately before integration; never force-push documentation automation.
3. Implementation evidence is `IMPLEMENTED`, `PARTIAL`, `UNVERIFIED`, or `REDESIGN_REQUIRED`. A plan, old screenshot, issue body or historical test does not prove current runtime behavior.
4. Missing CI/test/runtime evidence is `verification unavailable`, never pass. CRITICAL/HIGH and P0 promotion gates fail closed.
5. Applied database migrations are immutable. Corrections use a new numbered migration. Economy history is append-only and corrections use compensating transactions.
6. Unknown commercial numbers are `HYPOTHESIS` or `TEST TARGET`. WLD/WDX activity is not real-currency revenue.
7. Runtime implementation is separate from this planning automation: `branch → static/unit/integration/real-DB/security tests → immutable candidate → isolated exact-SHA test → backend/API/DB/user-flow QA → main integration → exact-main-SHA release evidence → Production promotion → Production smoke/monitoring → rollback if needed`.

## 1. Product and non-negotiable system boundaries

Woldeok Moneyverse is a web+Discord community virtual-economy/game platform. Users authenticate, earn/spend WLD, progress through jobs/quests, collect/use items, operate virtual businesses, use a virtual bank/loans, virtual stocks, social/community and probability/game systems.

WLD, WDX/virtual stocks, bank balances, loans, casino play and rewards are game/simulation data only. The product does not promise cash redemption, real securities, real deposits, guaranteed yield, investment return, external prizes or real gambling. Any future real-money/financial/gambling linkage is a separate product/legal redesign and cannot inherit this plan’s approval.

Current technical baseline is Next.js frontend, NestJS API, PostgreSQL authoritative data/economy/authorization, protected `SECURITY DEFINER` functions for sensitive DB paths, least-privilege application DB roles, append-only double-entry ledger, idempotency for retryable value-changing operations and outbox-style post-commit external delivery.

### 1.1 Economy invariants

Every value-changing operation validates actor, policy, eligibility, limit and idempotency and atomically writes required ledger postings, derived balances, audit/outbox. Debits/credits reconcile. Disallowed negative balances are prevented at transaction boundaries. Money uses integer/string-safe contracts, not unsafe JavaScript `Number`. Corrections reference the original transaction and create compensating entries.

### 1.2 Security baseline

Use OWASP ASVS 5.0.0 and OWASP API Security Top 10 as verification baselines, not certification claims. Cross-cutting controls include OAuth/OIDC `state`/`nonce`/PKCE/exact redirect; secure session rotation/invalidation; recent reauthentication; CSRF; BOLA/IDOR negative tests; output encoding/XSS defense; SQLi/SSRF/path traversal/command injection controls; decoded file-type validation; rate/resource-abuse controls; least-privilege DB roles; CORS/CSP/security headers; secret management; dependency/supply-chain controls; container/Kubernetes hardening; encrypted independently restorable backups; append-only audit; privacy minimization/retention/deletion; and secret-safe logs.

### 1.3 Administrator boundary

Current model is a single `superadmin` plus compensating controls, not mandatory two-person approval. Sensitive operations require `AdminSessionGuard`, recent `ReauthGuard`, TOTP/`SecondFactorGuard`, DB-side actor checks, least privilege, impact preview, reason capture, idempotency where relevant and append-only audit. Superadmin receives no bypass to directly rewrite protected economy/audit history.

## 2. Current priority and release blocker register

Priority: `P0 data loss/security/auth/authorization/asset duplication/economy abuse/outage/DB integrity/promotion truth` → `P1 major user correctness/core completeness` → `P1 shop/payment/monetization` → `P1 SEO/acquisition` → `P2 retention/growth` → `P2 UX/accessibility` → `P3 long-term expansion`.

### BAK-106-01 — P0 — OPEN — independent backup + successful restore evidence unavailable

- First evidence: GitHub issue #139 opened 2026-09-09 and remains open on 2026-09-15. Last recorded host inspection found `/mnt/backup` (`/dev/sda1`) read-only, newest observed separate-media files from 2026-09-07 and no current Kubernetes-era automated backup on that medium. A PostgreSQL custom-format emergency dump passed SHA-256 and `pg_restore -l` but remained on the same system disk.
- Impact: total host/storage loss can threaten identity/session/economy/ledger/audit/inventory/entitlement/object data and dispute recovery.
- Rule: destructive or schema/data-changing Production work is blocked without current independently recoverable backup plus successful restore evidence.
- Close: implement §9 architecture, full isolated restore drill, monitoring and machine-readable release evidence.

### OPS-107-01 — P0 — OPEN — stale service-status snapshots can be rendered as healthy

- First/recent reproduction: 2026-09-15 07:05 KST. Public `/status` stated `모든 서비스가 정상입니다.` while Web, economy API and ledger DB rows all showed observations from 04:06 KST. The same page states a 30-second collection period and says older records are shown as `확인 중`.
- Repository contract: `frontend/src/app/status/page.tsx` revalidates every 30 seconds but trusts API `state`; `frontend/src/lib/status.ts` converts only invalid/unrecognized state to `unknown`. Migration `013-content-and-status.sql` stores per-source `stale_after_seconds`, and `content_public_status()` is designed to return `unknown`, `detail=NULL`, `observed_at=NULL` when the latest snapshot exceeds that threshold. Initial source values in that migration use 180 seconds, so the UI’s literal 30-second freshness claim is itself a second contract mismatch.
- Confirmed impact: public operational truth can be stale while presented as healthy. Actual outage/degradation may be hidden, increasing MTTR, support load and trust/release risk. Do not use public `/status` as a Production-success gate until this closes.
- Root cause: **not yet confirmed**. Candidate hypotheses are Production DB function/config drift, migration parity drift, stale backend/image path, collector failure plus a non-authoritative read path, or cache behavior. Diagnosis must distinguish these instead of choosing one prematurely.
- Read-only reproduction/diagnosis order: (1) capture raw Production `/api/v1/status` body/headers and server clock; (2) inspect deployed backend/frontend exact SHA/digest and migration checksum; (3) inspect `pg_get_functiondef(content_public_status)` and `content_status_sources.stale_after_seconds`; (4) query latest source snapshot timestamps and DB `clock_timestamp()` without mutation; (5) inspect collector last attempt/last success/schedule/logs; (6) repeat on isolated exact-SHA test.
- Authority design: one server-side freshness contract per source. `collection interval` and `stale threshold` are distinct fields. Public UI must not hard-code 30 seconds as the stale threshold unless server configuration actually uses 30 seconds. Prefer API/public read model exposing public-safe `freshness`/`ageSeconds`/`staleAfterSeconds` derived server-side; never expose topology or internal credentials.
- Fail-closed behavior: stale/missing source becomes `unknown`; overall state must not be `operational` when any required public source is stale/unknown. Collector heartbeat stale is a distinct `monitoring delayed/checking` condition, not an outage claim and not healthy. If status API/DB fails, show `확인 중`/unavailable, never reuse an old green state past the approved threshold.
- Cache contract: HTML/API/cache TTL must not preserve a healthy status beyond its stale threshold. `stale-if-error` is forbidden for a green operational assertion after freshness expiration. Cache keys contain no private telemetry.
- Migration: applied migration 013 remains immutable. If Production function/config is wrong, correct with a new numbered migration or reviewed config path. If Production simply lacks an applied migration, restore parity through normal migration/release flow; do not edit historical migration in place.
- Required tests: DB exact threshold `-1/0/+1s`, source-specific thresholds, null/no-snapshot, future timestamps, stopped collector, stale latest row, DB clock/timezone, API caching, backend normalization, frontend SSR/state headline, API unavailable, restart, multiple mixed states, forged writer denial, app-role write denial and no sensitive detail leakage.
- Test acceptance: stop synthetic collector; by approved stale threshold public API and UI become `unknown/checking`, overall headline is not healthy, freshness alert fires, and only a fresh trusted snapshot restores healthy. Verify same on test exact SHA and Production smoke after rollout.
- Rollback: revert application/config to last-known-good immutable target while keeping public state fail-closed. DB corrections are forward corrective migrations; never rewrite status history solely to make green UI return.
- Metrics: `status_source_age_seconds`, `collector_last_success_age_seconds`, `public_status_unknown_count`, `status_api_errors`, `stale_operational_violation_count`; last metric must remain zero.
- Business: direct revenue 0. Value is avoided outage duration, support cost and trust loss. `SCALE` only when freshness is continuously truthful; `HOLD` status-dependent release automation while false-green remains possible.

### AUTH-105-01 — P0 — OPEN / PUBLIC LOCAL-AUTH ROLLOUT HOLD

Code/migrations/mobile contracts contain local email registration, verification and login with Argon2id/email-hash/token-hash processing while the public web login/guide/privacy evidence remains OAuth-centric. Do not newly market or generally expose local registration until privacy notice/policy version/consent, retention/deletion/credential removal, SMTP/processor facts, token-link privacy, exact-SHA security QA and rollback are aligned. Preserve existing legitimate identities if endpoint access already exists.

### QA-104-01 — P0 — OPEN — profession-work quota guidance contradicts authoritative quota behavior

Production `/guide` still says profession work can be repeated without daily limit for full WLD/EXP each time. Current server/DB contract uses task `daily_limit`, `taken_today`, exact-limit acceptance, over-limit denial and member/task concurrency protection. Fix public/web/mobile/FAQ/schema examples; distinguish `playable` from `reward eligible`; test 0/partial/exact/+1, profession/task isolation, double submit, idempotency, Seoul-day boundary and web/mobile/API parity. Do not revert quota protection to match copy.

### REL-104-02 — P0 — OPEN — Production-ready automation proves less than normative release evidence

Current release workflow verifies exact test SHA, public shop catalog and test `noindex`, then builds immutable images with provenance/SBOM and emits a `production-ready` deployment. It still does not prove all required migration parity/checksum, authenticated synthetic smoke, least-privilege DB connectivity, changed economy reconciliation, current backup/restore evidence for destructive work and rollback target. Add fail-closed machine-readable `release-evidence`; missing required evidence is `BLOCKED`, never skip-pass. OPS-107-01 also forbids treating stale-green public status as promotion proof.

### AUTH-105-02 — P1 — TODO — app-auth verification documentation stale

Current verify-email design is one-time bearer-token cross-browser/no-cookie exchange rather than originating prelogin-cookie/CSRF dependency. Synchronize EN/KO app-auth guide/schema/catalog/examples and test same/cross-browser, invalid/expired/reused token, session rotation, arbitrary CSRF and old client behavior.

### REL-104-03 — P1 — TODO — runtime-code required checks not repository-enforced for every main update

Keep protected/no-force main and establish the narrowest ruleset requiring reviewed runtime-code integration and successful checks for backend/frontend/database/deploy/security paths. Preserve docs-only direct-main automation without allowing it to become a runtime bypass. Current branch-protection details were not readable by the connected integration in v107, so do not claim this is already enforced.

## 3. Mandatory specification template for every feature

Every feature/backlog item must record: purpose/user problem; target actor/role; implementation status and code/doc evidence; user story; entry route; screen components/CTA; state transitions; loading/empty/error/offline/timeout; first-use/return/comeback; mobile/tablet/desktop; keyboard/focus/label/contrast/reduced-motion; i18n; email/push/Discord; data model/ownership; read/write permission; endpoint/method/request/response/error codes; idempotency/rate/resource limits; service/business rules; tables/indexes/constraints/transactions/concurrency; audit/metrics/admin operation; feature flag/fallback; backup/recovery impact; security/privacy/abuse; SEO/indexing; analytics/KPI; performance/cache; profitability/cost; completion criteria; unit/integration/E2E/real-DB/security/regression tests; isolated-test acceptance; Production promotion/monitoring/rollback.

## 4. Current all-feature implementation and product contract matrix

| Feature family | Evidence/status | Authority / UX / API-DB contract | Security/privacy/abuse | SEO/growth/business | Mandatory QA/release gate |
|---|---|---|---|---|---|
| Registration/login/OAuth/logout/session | `IMPLEMENTED/PARTIAL` | Server owns provider linking, consent, session issue/rotate/revoke. Local register/login use prelogin+CSRF; verify-email uses one-time bearer token. Loading/provider-error/consent/session-expired/offline are distinct. | Credential stuffing/resource limits, OAuth state/nonce/PKCE/exact redirect, secure cookie, fixation rotation, logout invalidation, no silent local/OAuth email merge. | Auth pages noindex. Value measured verified session→activation→D1/D7/D30 minus SMTP/compute/CS/fraud/privacy cost. | Provider collision, replay/fixation/logout, token expiry/reuse/cross-browser, rate 429, policy/privacy parity. AUTH-105-01 blocks broad local rollout. |
| Profile/account/security center | `PARTIAL` | Server owns profile, linked methods and sessions; sensitive changes require recent reauth. | Account/session BOLA, ATO alerts without secrets, privacy-minimal defaults, audited changes. | Private/auth/noindex; value is lower ATO/support loss. | Other-user session denial, reauth expiry, terminate-other/all, provider-loss recovery, responsive/accessibility. |
| Inventory/collection/marketplace workbench | `PARTIAL`; live P2P settlement unproven | DB owns item/owner/provenance/entitlement/serial. Future listing must define escrow/cancel/expiry/settlement/fee/reversal. | BOLA/serial leakage, duplicate grant, wash trade/collusion, replay. | Holdings private/noindex; only explicit public-safe collections. WLD spend is sink, not revenue. | Ownership concurrency, duplicate entitlement, unauthorized transfer, recovery, private URL leak, future wash-trade simulation. |
| WLD shop/catalog | `IMPLEMENTED/PARTIAL` | Server authoritative item/effective price/eligibility/limit/sale window/entitlement. Every SKU records identity/category/value, currency, consumable class, test price, promotion/window/limit, binding/gift/refund/recovery, sink/source, P2W, KPI/admin lifecycle. | Client price untrusted, duplicate/replay, fake/reset scarcity, hidden personalized pricing, P2W/wealth/casino pressure prohibited. | Substantial editorial collection pages may index; purchase history private. WLD unit economics = economy/retention, not real revenue. | Price tamper, boundary time, insufficient balance, concurrent purchase, entitlement repair/cache, admin lifecycle. |
| Real-money cart/payment/subscription/ad removal | `UNVERIFIED` | Before implementation select provider; define order/cart authority, tax, signed receipt/webhook, entitlement, refund/cancel/renewal/grace, idempotency and material-term UX. | Receipt/webhook replay/forgery, BOLA, PCI/provider boundary, chargeback fraud, secret storage. | Checkout/order/account noindex. Unit economics deduct tax/platform/payment/refund/chargeback/content/CS/moderation/fraud/infra. | Provider sandbox; duplicate/out-of-order webhooks; refund/regrant; renewal/cancel; legal/privacy gate and SCALE/ITERATE/HOLD/KILL. |
| Jobs/quests/profession/level/rewards | `PARTIAL + P0 content drift` | Server/DB owns catalog, duration/cooldown/daily quota/reward/EXP/receipt/unlock. UI separates playable vs reward-eligible. | Bot/macro, multi-account, replay, clock/reset, concurrent duplicate, ledger reconciliation. | Corrected guide may index as game learning. KPI TTFV/first verified job/D1/D7/reward inflation. | QA-104-01 exact-SHA real-DB matrix blocks. |
| Business | `UNVERIFIED/PARTIAL` | Define inventory/demand/price/cost/fee/tax/management/settlement; no risk-free fixed compounding; all value via ledger/idempotency. | Circular demand farming, replay/refund, admin manipulation, precision. | Public education possible; private P&L noindex. Value = retention+sustainable economy. | Real-DB settlement/reconciliation/concurrency and abuse simulation. |
| Bank/loans | `UNVERIFIED/PARTIAL` | Server owns eligibility/source-of-funds/principal/interest/accrual/repayment/arrears/purpose/recovery. | Double repayment, clock/BOLA/multi-account/loss-chasing; no real deposit/yield claim. | Public content must say simulation; private balance/debt noindex. | Accrual boundary, concurrent/idempotent repayment, restart/recovery, ledger reconciliation. |
| Virtual stocks/WDX/watchlist/portfolio/alerts/comparison | `PARTIAL` | Public market read model separated from private holdings; server owns issuance/pricing/trading/settlement/rules. | Holdings BOLA, settlement replay, manipulation/collusion, phishing/spam alerts, integer precision. | Substantial public-safe symbol pages may index; portfolio/watch/orders/alerts private/noindex. | Other-user holdings denial, symbol validation, large integer, concurrency/replay, alert cooldown/manipulation. |
| Casino/probability | `PARTIAL/HIGH-RISK` | Server outcome/probability/payout/limit/atomic settlement; same idempotency key = same receipt/outcome. | RNG/result tamper, replay, limit bypass, bots/multi-account, loss chasing/youth risk. | Gameplay/account history noindex; no acquisition promise of winnings. Real revenue 0 absent separately approved paid model. | Distribution sanity, replay, limits, concurrency, ledger reconciliation, legal/product review. |
| Seasons/live events | `PARTIAL` | Server owns start/end/grace/reward eligibility; preview is content not time authority; catch-up/archive required. | Bot/multi-account reward farming, collusion, deadline manipulation/fake FOMO. | Substantial season/archive pages may index with truthful dates/lastModified. | Timezone boundaries, late entry/catch-up, duplicate reward, archive transition, notification cooldown. |
| Community/posts/comments/report/block | `PARTIAL` | Server owns authorship/edit/delete/mod state; explicit deleted/locked/report/block states. | Spam/bot, harassment, impersonation/doxxing, malicious links/stored XSS, BOLA, moderator abuse. | Curated board can index; individual UGC default noindex until quality/mod rule. | Other-user mutation denial, XSS/link, report spam, block semantics, moderator audit, 404/410/index removal. |
| Friends/clubs/referral | `UNVERIFIED/PARTIAL` | Define invite lifecycle, roles, leave/kick/ban, visibility, attribution/reward maturity. | Invite spam, fake-account/referral fraud, collusion, role escalation/private graph leakage. | Public club only explicit visibility; rewards favor cosmetic/prestige/convenience after mature fraud-resistant milestones. | Referral ring, invite replay, role escalation, privacy/block. |
| Notifications/email/push/Discord | `PARTIAL` | Server owns source event, preference/consent, cooldown/dedupe, delivery state and canonical deep link. | Phishing/ATO imitation, webhook abuse, spam/token leakage; no sensitive balance/debt/security content. | noindex; value = healthy return minus provider/opt-out/spam/privacy/support cost. | Dedupe/cooldown, revoked/stale link, opt-out, provider outage/outbox, secret-safe logs. |
| Search | `UNVERIFIED` | Public search only public-safe model; member/admin search explicitly authorized; define pagination/no-result/timeout. | Injection, expensive-query DoS, enumeration, query-log PII. | Result pages generally noindex; only intentional curated landing index. | Authz, special chars, pagination stability, complexity/rate, relevance regression. |
| Upload/gallery/files | `PARTIAL/spec-level unless linked code` | Decode/type/magic, size/dimension, generated names, isolated storage, authorized delivery, metadata strip as applicable. | Malware/polyglot/path traversal/decompression bomb/remote-fetch SSRF/BOLA/EXIF. | Private media noindex; public media only after permission/moderation. | Malformed/polyglot/oversize/unauthorized read/EXIF/storage failure/restore. |
| Public home/guide/status/content | `PARTIAL + OPS-107-01 P0` | Public read model fails honestly; guide/help matches server contract; status freshness is server-authoritative and stale data cannot remain green. | No secret/topology/stack/user state; XSS/phishing; status writer is trusted non-browser path. | `/status` is public but `noindex`; `/guide` acquisition HOLD until quota/local-auth copy fixed. | HTTP/meta/accessibility/CWV + guide contract + synthetic stale-status/fail-closed tests. |
| App API/mobile gateway | `PARTIAL/COVERAGE DOCUMENTED` | Versioned `/app-api/v1`; stable wrappers; breaking changes require compatibility/version bump. | Handoff/token replay, BOLA, rate/resource abuse, PII/log masking. | API noindex; value = mobile activation/D30 minus support/infra/fraud. | Contract snapshots, old-client, auth expiry, handoff one-time, error parity, AUTH-105-02. |
| Admin/audit | `PARTIAL` | Risky writes show current/proposed/target/impact/reason and use reauth+TOTP+DB actor+idempotency/audit as relevant. | Privilege escalation/session theft/CSRF/BOLA/mass action/audit tamper. | private/noindex; value = lower incident/operator/support cost. | Lower-role denial, stale reauth, invalid TOTP, mass bounds, DB privilege/audit, compensation. |
| Backup/recovery | `UNVERIFIED CURRENT EVIDENCE`; BAK-106-01 P0 | §9 authoritative: RPO/RTO, independent encrypted backup, source/version/checksum, isolated restore, app/ledger/object validation. | Key theft/plaintext/shared failure domain/wrong-env/corrupt-WAL-gap/retention shadow. | private/noindex; direct revenue 0, value expected-loss/downtime avoided. | Destructive DB work blocked until current independently restorable evidence; full fault-injected drill. |
| Analytics/experiments | `PARTIAL/SPECIFIED` | Pseudonymous subject; analytics session != auth secret; versioned event schema/retention/assignment/guardrails. | PII/secret leak, reidentification, experiment abuse, sensitive profiling. | Safe campaign/content IDs may link cohorts; no private SEO payload. | Schema/consent/deletion/deterministic assignment/outbound privacy scan. |
| Advertising/sponsorship | `IMPLEMENTED/PARTIAL reviewed public placements` | Approved substantial public surfaces only; test off; sponsor/ad visibly separate from product action. | Invalid traffic, click encouragement, youth/privacy targeting, tracker leakage/sponsor confusion. | Ads do not justify thin index pages. Net ad contribution subtracts churn/session/support/privacy/fraud cost. | Route allowlist, test ads off, CLS/CWV, ad exit, invalid traffic/policy/privacy. |
| SEO backend | `PARTIAL` | Configured-origin canonical, public metadata read model, sitemap shards, robots, redirect map, structured-data serializer, updatedAt, image metadata, crawler/GSC/Naver observation. | Private leakage, Host injection, cache poison, PII sitemap/JSON-LD. | KPI organic→signup→activation→D7/D30→retained net value/CAC saving. | Sitemap privacy, canonical injection, redirect loops, SSR, GSC/Naver, CWV. |
| Incident/status/operations | `PARTIAL + OPS-107-01 P0` | Public-safe status is separate from internal telemetry; server computes freshness; collector heartbeat, snapshot age, incident lifecycle, rollback/postmortem are explicit. | Fake/forged green state, stale monitor, topology leakage, admin abuse, alert fatigue. | Trust/support/MTTR feature, not acquisition bait; `/status` currently noindex. | Stop collector/source, cache/API/DB outage, mixed states, stale boundary, alert routing, exact-SHA smoke, rollback/restore drill. |

## 5. Local first-party authentication detailed contract

| Step | Endpoint/current authority | Required state/UX | Security/error/data contract |
|---|---|---|---|
| prelogin | `POST /app-api/v1/auth/prelogin-session` | resumable pre-auth; retryable failure | secure prelogin cookie + memory CSRF; no secret logs |
| policy | `GET /app-api/v1/auth/policy` | current terms/privacy before registration | server version authoritative |
| consent | `PUT /app-api/v1/auth/consent` | explicit current terms/privacy/age acknowledgement | SessionGuard+CSRF; stale version requires review |
| register | `POST /app-api/v1/auth/local/register` | email/password/display name, pending verification, recoverable SMTP failure | prelogin+CSRF+current consent; common-password policy; normalized email/hash/Argon2id/hashed one-time token; abuse budget |
| verify | `POST /app-api/v1/auth/local/verify-email` | cross-browser allowed; success signs in | short-lived one-time bearer token; no SessionGuard/CSRF dependency; raw token never logged; clean URL after consume |
| login | `POST /app-api/v1/auth/local/login` | unknown email/wrong password same public class; offline/429/5xx distinct | prelogin+CSRF, dummy work for nonexistent account, rate/resource control, session rotation |
| viewer/session | `GET /app-api/v1/auth/viewer`, `GET /app-api/v1/auth/session` | client trusts server signed-in result only | signed-in cookie authoritative |
| logout | `POST /app-api/v1/auth/logout` | UI must not pretend remote logout succeeded offline | signed-in session+CSRF; revoke server session/cookie |

Verification-token pages are noindex/sitemap-excluded, use `Referrer-Policy: no-referrer` or verified equivalent, contain no ads/third-party analytics/social pixels before exchange, redact query strings, do not consume token on GET preview/scanner and remove token from address/history after exchange. Product analytics never contain email/email-hash/password/verifier/token/cookie/CSRF/OAuth/recovery secrets.

## 6. SEO implementation contract

### 6.1 Route policy

- `/`: `PUBLIC_INDEXABLE`, configured-origin canonical, unique title/H1/meta, truthful structured data, OG/social, stable image dimensions and substantial internal links.
- `/guide`: `PUBLIC_INDEXABLE_BUT_ACQUISITION_HOLD` until QA-104-01 and local-auth password wording are accurate; target game-system beginner intent, not real investment-return queries.
- `/status`: `PUBLIC_NOINDEX`. It may be publicly accessible for trust/support, but transient operations are not durable search content. `robots`/headers must remain noindex, sitemap-excluded. Truthful freshness outranks appearance.
- Public news/season/collection/world guides: index only when original, substantial, maintained and public-safe, with stable slug, meaningful `lastModified`, breadcrumb and reviewed metadata.
- `/stocks/[symbol]`: only public-safe market/world read model indexable; holdings/watch/orders/alerts/portfolio excluded from anonymous HTML/JSON-LD/shared cache.
- Community individual UGC default noindex until quality/moderation rule; deleted content returns 404/410 and leaves sitemap.
- Search/filter/sort/query variants: canonical/noindex unless intentionally curated stable landing; no doorway generation.
- Login/signup/verify/recovery/account/security/wallet/transfer/private bank/business/loan/portfolio/watchlist/alerts/checkout/orders/subscription/admin/moderation/backup/recovery: auth-required or public-noindex and sitemap excluded.
- Test/recovery origins: global noindex, real ads off, no sitemap submission/indexable user data.

### 6.2 SEO backend backlog

Implement/test `SeoMetadataReadModel`, configured-origin canonical builder resistant to Host injection, dynamic sitemap index/shards with URL/byte limits and authoritative `lastModified`, robots generator, JSON-LD allowlist serializer, permanent 301/308 redirect map with loop/conflict detection, image metadata/alt/dimension service, locale/hreflang policy, crawler-log classification, Search Console/Naver verification/status ingestion, crawl/index/canonical/sitemap reporting and SEO operator read dashboard/API. Keep HTML/meta/sitemap/redirect caches coherent; private identity/economy/security state never enters public cache keys or structured data.

### 6.3 SEO KPI/performance

Impressions/clicks/CTR are diagnostic. Business funnel is `organic visit → qualified interest → signup → activation → D1/D7/D30 → retained contribution/real net revenue`; organic CAC includes content/SEO/tooling cost per incremental organic D30 retained user. Representative public templates target good CWV (LCP ≤2.5s, INP <200ms, CLS <0.1) with mobile/desktop regression tests.

## 7. Security threat and verification register

| Risk | Severity | Prevention/detection | Mandatory test/release behavior |
|---|---|---|---|
| BOLA/IDOR | HIGH | actor-scoped service/DB authz; client owner ID untrusted; safe denial metrics | other-user ID negative test on every object API; failure blocks |
| Credential stuffing/session fixation | HIGH | generic auth errors, rate/abuse signals, rotation, secure cookies, reauth, logout, OAuth uniqueness | distributed invalid auth, fixation/logout/state/nonce/PKCE; unexplained bypass blocks |
| Economy replay/duplicate/concurrency | HIGH | idempotency unique constraints, DB transaction/locking, append-only ledger/reconciliation | parallel/retry/replay/precision/ledger test; mismatch blocks |
| Admin abuse | HIGH | session+reauth+TOTP+DB actor+least privilege+impact preview+audit | lower-role/stale reauth/TOTP/CSRF/mass action/DB privilege; failure blocks |
| Upload/UGC | HIGH | decoded type, isolated storage, output encoding/CSP, metadata minimization, moderation | polyglot/malformed/XSS/link/unauthorized delivery |
| Analytics/ad/SEO leakage | MEDIUM/HIGH | outbound allowlist/minimization; no token/balance/debt/security in URL/structured data | payload/schema/sitemap/JSON-LD scan; HIGH leak blocks |
| Supply chain | MEDIUM/HIGH | immutable reviewed action pins where feasible, dependency audit, SBOM/provenance | workflow/dependency policy regression; unresolved HIGH follows release policy |
| Release-evidence bypass | HIGH | immutable SHA, machine-readable fail-closed evidence, no skip-pass | intentionally break each prerequisite; `production-ready` must not emit |
| Backup/key compromise | HIGH | encryption, key separation, independent medium, least-privilege identity, access audit | unauthorized key/plaintext tests; HIGH leak blocks |
| Wrong-environment restore | CRITICAL/HIGH | source/target identity, isolated DB/namespace, separate credentials/outbound sinks | wrong target/Production credential simulation; possible prod write blocks |
| Backup corruption/WAL gap | HIGH | checksum/manifest, tool/version checks, full restores, WAL monitoring, reconciliation | corrupt/missing WAL/wrong checksum fails closed+alerts |
| Multi-account/referral/market manipulation | HIGH where economy affected | maturity/caps, provenance, anomaly/graph review | referral ring/wash trade/collusion/duplicate/replay |
| Stale/forged operational health | HIGH | trusted status-writer path; server-side snapshot freshness; collector heartbeat; deployment/migration parity; no browser authority | stale boundary, stopped collector, stale cache/API/DB, forged writer; any false-green state blocks status-dependent release |

Secrets/passwords/verifiers/session cookies/OAuth codes/client secrets/bot tokens/DB passwords/backup keys/raw verification/recovery tokens and unrestricted request bodies are never general logs. Security events use pseudonymous IDs and safe classifications.

## 8. Profitability and business contract

No feature is approved from gross revenue alone. For real-money/ad monetization record model, user path, displayed/test price, attach/paid conversion/repeat/renewal hypotheses, refund/churn/cancel, ARPU/ARPDAU/ARPPU only when real revenue exists, eCPM/fill/CTR, platform/payment/tax/refund/chargeback, infra/storage/CDN/notification/LLM, content/CS/moderation/fraud/security cost, gross/contribution margin, CAC, LTV, LTV/CAC, payback, optimistic/base/conservative sensitivity, D1/D7/D30, trust/regulatory cost and `SCALE/ITERATE/HOLD/KILL`.

- WLD-only shop/casino/bank/stock activity is game-economy activity, not real revenue.
- Ads use `net contribution = ad revenue - estimated LTV loss from ad-induced churn/session reduction - ad infra/privacy/support/fraud cost`.
- SEO uses incremental organic D30 retained users and CAC savings, not impressions alone.
- Security/QA/release/backup/status use avoided expected incident/data-loss/downtime/refund/fraud/support cost; do not fabricate currency values without measurements.
- Local auth uses incremental D30 retained contribution minus SMTP/Argon2/DB/support/fraud/privacy/security cost.
- Operational-status value is reduced MTTR/support/trust loss. A false-green board can be worse than no board, so `stale_operational_violation_count > 0` is a HOLD/KILL signal until fixed.
- Future recurring billing must disclose material terms before charge, obtain affirmative consent and offer straightforward cancellation. Provider fees remain hypotheses until provider selection and current official-term review.

## 9. Backup and disaster-recovery contract

### 9.1 Recovery objectives/scope

Approve explicit RPO/RTO from acceptable identity/ledger/content loss and recovery cost; automation does not invent numeric targets. Measure RPO from newest actually restorable point and RTO from timed full drill. Back up authoritative PostgreSQL identity/economy/ledger/audit, migration/schema/version manifests/checksums, inventory/entitlement/content metadata, required object/photo store and application/GitOps version. Key/secret recovery uses a separate encrypted control plane.

A recovery DB/read replica/snapshot/local dump sharing primary host/storage/failure domain or online credential is convenience, not independent DR.

### 9.2 Architecture and `VERIFIED_RESTORABLE`

Require independent/off-host failure domain, encryption in transit/at rest, key separation+recovery test, least-privilege backup identity, separate restore credentials, source env/DB/app/migration/tool/time/backup-ID/checksum/retention metadata, capacity monitoring and controlled deletion/tamper resistance. Use logical dump, physical base backup, PITR or combination according to approved objectives.

A backup is verified only after `clean isolated target → identity → decrypt/key/checksum/manifest → full DB restore/PITR target proof → migration parity → least-privilege app smoke with Production outbound off → referential checks → ledger/balance reconciliation → inventory/entitlement/provenance → representative object restore → email/Discord/webhook/ads/indexing off → measured recoverable point/RTO → evidence/audit → controlled disposal/retention`. File existence, checksum, `pg_restore -l`, or recovery replica alone is insufficient.

### 9.3 Release evidence/security/QA

Destructive/schema-changing work requires candidate SHA, backup ID/source, failure-domain class, encryption/key result, checksum/manifest, restore-drill result/time, RPO/RTO status, migration parity, ledger/balance reconciliation, object sample, rollback target, operator/audit ID and evidence freshness. Missing/stale/corrupt/wrong-key/wrong-env/WAL-gap/reconciliation-failed/untested = `BLOCKED`.

Backup/recovery artifacts remain private/auth/noindex/sitemap-excluded. Alert stale/failed backup, checksum/decrypt/capacity/restore/reconciliation/WAL failures. Fault-inject missing/corrupt archive, wrong key, storage full, wrong target and Production credential. Direct revenue is 0; KPI is backup freshness, independent-copy coverage, verified restore, measured RPO/RTO, drill failure and expected loss avoided.

## 10. QA, test environment, release, monitoring and rollback

Every material issue records severity, first found, last reproduced, reproduction, affected user/function, evidence, root-cause hypothesis/confirmation, FE/BE/API/DB/infra target, concrete design, migration need, rollback, unit/integration/E2E/real-DB/security/regression tests, test acceptance, Production promotion, monitoring, state and owner sequence. Repeated `BLOCKED` becomes root-cause removal. CRITICAL/HIGH precedes features.

### 10.1 Candidate/release sequence

`new branch → lint/type/unit/integration/real-DB/security → immutable candidate + SBOM/provenance where applicable → isolated exact-SHA → migration checksum/parity → backend/DB least-privilege smoke → authenticated synthetic flow → changed-feature E2E/abuse → release evidence incl. restore/rollback when required → main integration → exact-main-SHA test → Production-ready → GitOps Production → HTTP/API/auth/user-flow/log/resource/status-freshness smoke → monitor/rollback`.

Test uses isolated namespace/DB, indexing off and real ads off. Missing evidence never becomes pass. Test/recovery cannot send Production email/Discord/webhooks or mutate Production data.

### 10.2 Monitoring guardrails

Observe API 4xx/5xx, auth/ATO, DB pool/transaction, migration parity, ledger reconciliation, duplicate reward/quota denials, entitlement failures, outbox/provider failures, ad-induced exit/CWV, crawl/index errors, backup freshness/restore, deployment evidence/rollback, **collector heartbeat, source snapshot age and stale-green violations**. Missing monitoring data is not healthy by default.

## 11. UX, activation, retention and operations

First visit explains one clear product promise and game-only boundary before the whole economy. Activation = visit → understand → sample/value → contextual signup → first meaningful verified action → result/reward → next goal. D1 restores chosen thread; D3 shows real change or honest no-change; D7 completes a coherent progression/collection/project/learning loop; D14 supports optional breadth; D30 leaves durable history/identity/collection. Avoid punitive streaks, loss-threat FOMO and excessive notifications; provide catch-up/comeback.

Sharing favors public-safe achievements/collections/projects/season/learning results. URLs contain no session token, private holdings, balances, debt, casino, recovery/security state or PII. Referral rewards favor cosmetics/prestige/convenience after fraud-resistant maturity.

Admin/CS defines dispute/refund/report/abuse queues, feature flags, fallback/rollback, safe incident messaging and audit. High-risk account/economy actions use explicit confirmation and anti-phishing UX. Status/incident UX never converts absence of evidence into green health.

## 12. External reference decisions — 2026-09-15 v107 refresh

- Kubernetes current liveness/readiness/startup probe documentation: **DIRECT OPERATING PRINCIPLE**. Readiness is a continuously evaluated ability-to-serve signal; unavailable/unready is not equivalent to healthy. Moneyverse public status remains a separate user-facing product, but its freshness semantics follow the same fail-honest principle.
- Google Cloud Monitoring metric-absence/missing-data documentation: **DIRECT MONITORING PRINCIPLE**. Absence of fresh monitoring data is explicitly modeled; Moneyverse must treat collector/source absence as a distinct condition, not silently healthy.
- OWASP API Security Top 10, including API4 Unrestricted Resource Consumption: **DIRECT SECURITY BASELINE** for auth, external provider/resource budgets, expensive queries and status/monitor abuse.
- PostgreSQL current `pg_verifybackup` and continuous archiving/PITR docs: **DIRECT ADOPT where applicable** for manifests/checksums/WAL evidence, with full restore still mandatory.
- CISA StopRansomware: **DIRECT RESILIENCE GUIDANCE** for independent/offline-capable encrypted backups and regular recovery tests.
- Google Search Central/Naver Search Advisor: **DIRECT ADOPT** for canonical/index/sitemap/noindex/public-content quality. `/status` remains public-noindex because it is transient operational content.
- Korea PIPC current privacy-policy materials: **DIRECT DISCLOSURE DESIGN GUIDANCE** so authentication/analytics processing facts match public policy.
- FTC 2026 subscription enforcement/rulemaking: **REFERENCE + PRODUCT GUARDRAIL** for future recurring billing: clear material terms, affirmative consent and straightforward cancellation; do not claim universal jurisdiction.

## 13. Current evidence snapshot and integration record — v2026.09.15.107

- Starting and mid-run `main`: `2201b812716d78303388bb838258220a5033d694`; no concurrent external commit was observed before v107 writes.
- Fresh Production runtime was available. At 2026-09-15 07:05 KST, `/status` publicly said all services normal while all three displayed source snapshots were from 04:06 KST; the page also said collection interval is 30 seconds and older records should display as checking. This creates OPS-107-01.
- Repository code confirms frontend trusts API state, while migration 013’s `content_public_status()` is designed to convert source snapshots older than `stale_after_seconds` to `unknown`. Runtime behavior therefore violates the repository freshness contract; root cause remains unconfirmed pending Production DB/deployment/collector inspection.
- Fresh `/guide` still contains both unlimited full profession-work reward claims and `Discord 또는 Google`/no-separate-password local-auth wording, so QA-104-01 and AUTH-105-01 remain open.
- Fresh `/privacy` remains OAuth-centric (public version 2026-09-02) and does not describe local email/password credential processing, so AUTH-105-01 remains rollout-blocking.
- Issue #139 remains OPEN with no newer direct backup-host evidence; BAK-106-01 remains P0.
- Connected combined commit-status and available PR-triggered workflow-run lookup for starting SHA returned no entries; CI/test-server pass is not claimed. Branch-protection endpoint was inaccessible to this integration, so REL-104-03 remains unresolved rather than assumed fixed.
- `deploy.yml` currently uses immutable action SHAs and builds SBOM/provenance, but its test gate still proves only exact SHA + public catalog + test noindex before `production-ready`, so REL-104-02 remains open.
- New P0: `OPS-107-01`. Carried P0: `BAK-106-01`, `AUTH-105-01`, `QA-104-01`, `REL-104-02`. Carried P1: `AUTH-105-02`, `REL-104-03`.
- v107 is planning/docs only. It changes no runtime code, DB schema/data, collector, backup medium, infrastructure, secrets, branch rules or security controls.
