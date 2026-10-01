# Moneyverse App Core / Site Core / Economy Core Security Design

> Version: v2026.10.01.497
> Status: DRAFT / written-spec user review gate
> Branch: `docs/api-security-economy-core-v2026.10.01.497`
> Parent design: v2026.10.01.496 unified macroeconomic system
> Parent treasury direction: v2026.10.01.495 single treasury and tax recirculation
> Base design commit: `96620ea610e0a39841965010307797993f1566a2`
> Latest checked `origin/main`: `2bad12eb290cba6b98d08604cd6b1274243e1a4f`
> Research review: `docs/findings/MONEYVERSE_APP_SITE_ECONOMY_CORE_SECURITY_RESEARCH_REVIEW_v2026.10.01.497.md`
> Scope: architecture/planning only. No runtime, database, Test or Production completion is claimed.

## 1. Goal and adopted decision

Moneyverse adopts four explicit layers:

1. **App Core** — Android/native backend-for-frontend and mobile trust boundary.
2. **Site Core** — browser/web backend-for-frontend and web trust boundary.
3. **Economy Core** — the single authoritative economy domain and financial mutation boundary.
4. **Economy Intelligence Layer** — classical models, econometrics, ABM, LLM, RL and councils that observe, simulate and propose within registered limits.

App Core and Site Core are separate client-facing cores, but they do **not** own separate money, tax, banking or market rules.

There is one authoritative economy and one final financial ledger/database authority.

The security objective is stronger than feature separation:

> Complete compromise of App Core, Site Core or an AI model must not by itself grant unrestricted ledger, monetary-policy, treasury, admin or database-owner authority.

## 2. Architecture decision

### 2.1 Recommended topology

```text
 Android App                         Browser / Web
     |                                   |
     v                                   v
 /app-api/v2                         /site-api/v1
     |                                   |
  APP CORE                            SITE CORE
     \                                   /
      \                                 /
       +------ typed internal API ------+
                     |
                     v
               ECONOMY CORE
      +--------------------------------+
      | Ledger / Settlement            |
      | Wallet / Banking / Credit      |
      | Tax / Treasury / Fiscal        |
      | Jobs / Labour                  |
      | Firms / Production             |
      | Stocks / Markets / Property    |
      | Macro Accounting               |
      | Policy Registry                |
      | Scenario Lab                   |
      | Deterministic Validator        |
      | Policy Executor                |
      | Reconciliation                 |
      +--------------------------------+
                     |
                     v
            PostgreSQL authority

 ECONOMY INTELLIGENCE
 classical / econometrics / ABM / LLM / RL
                     |
                proposals only
                     |
                     v
               ECONOMY CORE
```

### 2.2 Logical boundary before physical microservice split

v497 requires a **logical authority boundary first**. Economy Core may initially remain inside the current private backend deployment as a strongly isolated module plus database role/function boundary.

Physical service separation is allowed later when scale, independent deployment or blast-radius evidence justifies it.

This avoids creating unnecessary network credentials, certificates, service discovery and failure modes before they provide measurable value.

### 2.3 BFF rule

App Core and Site Core may own:

- client-specific authentication orchestration;
- response aggregation;
- request/response adaptation;
- API-version compatibility;
- client-specific rate/resource policy;
- channel-specific caching;
- mobile integrity evidence or browser CSRF context.

They may not independently implement final:

- WLD balance arithmetic;
- tax calculation authority;
- bank-credit creation;
- treasury settlement;
- stock/property settlement;
- job reward funding;
- enterprise revenue creation;
- monetary issuance/retirement;
- AI policy execution.

## 3. Trust zones and compromise containment

| Zone | Publicly reachable | May hold member session context | May execute economic mutation | May write protected economic tables | May apply policy | May hold AI model |
|---|---:|---:|---:|---:|---:|---:|
| Android client | yes | client cookie/session material | no | no | no | no |
| Browser | yes | HttpOnly cookie indirectly | no | no | no | no |
| App Core | yes through gateway | yes | only through Economy Core | no | no | no |
| Site Core | yes through gateway | yes | only through Economy Core | no | no | no |
| Economy Core | no direct public route | validated actor context | yes | only through reviewed DB functions/roles | yes, bounded by registry | no |
| Economy Intelligence | no direct public route | no raw member session | no | no | no direct apply | yes |
| Policy Executor | internal only | automation/admin authority context | policy-limited | no direct table write | yes | no |
| PostgreSQL | internal only | server-authoritative session/actor data where required | final authority | yes by owner/functions | final invariant gate | no |

A component is trusted only for its own responsibility. Network location alone never grants authority.

## 4. Public endpoint topology

### 4.1 App contract

New canonical native contract:

`/app-api/v2/**`

Existing `/app-api/v1/**` remains a compatibility surface during migration.

App Core owns native payload shape, minimum app version, capability negotiation, mobile OAuth handoff, Play Integrity handling, native synchronization and app-specific performance shaping.

### 4.2 Site contract

New browser/server-rendered contract:

`/site-api/v1/**`

Web pages, browser JavaScript and server actions stop depending on the native `/app-api/v1` compatibility contract.

Site Core owns browser session orchestration, CSRF, SSR/server-action composition, web realtime aggregation and administrator web presentation.

### 4.3 Private internal contract

Economy Core is not exposed as a public URL namespace.

No edge prefix such as `/economy-core/**` is forwarded from the public internet.

Internal calls use a private interface plus workload identity. If kept in-process initially, the boundary is a typed module interface plus database privilege boundary; if split physically later, the same contract becomes an authenticated internal service API.

### 4.4 No direct backend address in clients

Android and browser bundles never embed:

- private backend host/port;
- Economy Core address;
- database address;
- service credential;
- internal API signing key.

## 5. Identity model

v497 separates **user identity** from **service identity**.

Every high-value Economy Core command requires:

1. authenticated caller service identity;
2. validated end-user/admin/automation actor context;
3. authorization for the exact command and object;
4. command integrity and idempotency evidence.

A service credential alone never proves which member is acting.

A caller-supplied actor field such as `X-User-Id` is never sufficient identity.

### 5.1 Actor context

The authoritative auth/session layer produces a short-lived actor context for Economy Core containing only required claims:

- `actor_id`;
- `session_id_hash` or equivalent opaque session reference;
- `actor_type` = member/admin/automation;
- current role/permission claims;
- `auth_time`;
- `step_up_at` where relevant;
- `issued_at`;
- `expires_at`;
- audience = Economy Core;
- unique assertion id.

The BFF cannot arbitrarily mint a privileged actor context from an actor id.

### 5.2 Workload identity

Each internal caller receives a separate identity:

- `app-core`;
- `site-core`;
- `policy-executor`;
- `scheduler`;
- reconciliation worker;
- other explicitly registered workers.

Production and Test identities/keys are never interchangeable.

## 6. App Core security contract

App Core is the only public native-app BFF.

Requirements:

- configured HTTPS host is pinned by deployment configuration, not user input;
- redirects are not automatically followed for authenticated API calls;
- no server secret in APK;
- persistent secure cookie handling follows the canonical native contract;
- state-changing requests carry CSRF where the cookie session model requires it;
- deep links and OAuth handoff destinations are exact allowlists;
- one-time handoff codes are never logged;
- economic request schemas use exact decimal/integer strings;
- every value-changing request has an idempotency key;
- high-value writes can require Play Integrity request binding;
- dynamic/universal transport cannot bypass the generated method/path/scope inventory.

### 6.1 Universal transport restriction

The Android universal `@Url` transport is compatibility plumbing, not authority.

For economic/admin writes it must eventually resolve against a generated client route manifest containing:

- method;
- path template;
- auth requirement;
- command family;
- minimum app version;
- request schema version;
- integrity requirement;
- idempotency requirement.

A route absent from the manifest is unavailable to generic economic write helpers even if it shares the allowed host.

## 7. Site Core security contract

Site Core is the web/browser BFF.

Requirements:

- same-origin HttpOnly session;
- Secure/SameSite cookie policy compatible with approved auth flows;
- CSRF protection for state-changing browser actions;
- strict Host/public-origin handling;
- browser never receives internal service credentials;
- CSP and browser security headers remain centrally managed;
- Next server actions/route handlers do not reproduce Economy Core business rules;
- web realtime subscriptions authenticate and authorize room/topic access;
- administrator routes require independent server-side role/step-up checks;
- browser UI state is never treated as authorization.

Web code migrates away from native `/app-api/v1/**` calls to `/site-api/v1/**` or server-side Site Core interfaces.

## 8. Economy Core interface

Economy Core exposes typed domain commands and read models, not arbitrary SQL or table access.

Initial command families include:

- wallet transfer;
- bank movement;
- loan origination/repayment;
- job/work settlement;
- business purchase/investment/settlement;
- tax posting/reversal;
- treasury commitment/disbursement;
- marketplace settlement;
- stock order/settlement/corporate action;
- property/land settlement;
- public debt/bond operations;
- monetary-policy operation;
- registered policy-value application.

Each command maps to a reviewed database function or transaction contract.

App Core and Site Core receive domain results/receipts, not database ownership.

## 9. Economy command envelope

Every economic write is normalized to an immutable command envelope before execution.

Required fields:

```text
command_id
command_type
contract_version
channel                 APP | SITE | ADMIN | AUTOMATION
caller_service
actor_context_id
business_event_id
idempotency_key
request_hash
policy_version
expected_entity_version   where applicable
created_at
expires_at
payload
risk_evidence
```

### 9.1 Request hash

`request_hash` covers the canonical serialized fields that determine economic effect, including amount/quantity, target entity, operation type and client idempotency identity.

The hash is recomputed after BFF normalization.

For mobile operations protected by Play Integrity, the relevant request digest is also bound into the integrity request. The server compares the verified integrity value with the canonical Economy Core command digest.

### 9.2 Replay handling

Replay protection has multiple layers:

- business idempotency key;
- command id unique constraint;
- actor/session validity;
- short command expiry;
- workload-token `jti` handling for high-risk commands;
- expected policy/entity version;
- existing database advisory-lock/idempotency pattern.

A repeated valid idempotent request returns the original logical result rather than applying economic value twice.

## 10. Database roles and SQL boundary

### 10.1 Preserve the existing strong pattern

The ledger remains append-only and `economy_post_transaction` remains the canonical WLD mover.

Protected tables continue to reject direct mutation from ordinary runtime identities.

`SECURITY DEFINER` functions:

- set a trusted explicit `search_path`;
- exclude untrusted writable schemas;
- revoke default `PUBLIC EXECUTE`;
- grant `EXECUTE` only to required runtime roles;
- validate actor/service/policy context where applicable;
- avoid client-controlled dynamic SQL identifiers.

### 10.2 Target role separation

The long-term target separates responsibilities instead of expanding one `moneyverse_app` role:

- auth/session runtime role;
- Economy Core execution role;
- Economy read-model role;
- reconciler role;
- migration owner;
- special integration workers where required.

App Core and Site Core do not directly receive protected economy-table write privileges.

AI/model processes receive no protected economic database credentials.

### 10.3 No BFF database authority

BFFs may use scoped auth/session infrastructure only where required by the current architecture. Economic state reads/writes move behind Economy Core read/command functions instead of adding broad BFF grants.

## 11. Read models and data classification

Economy Core provides least-privilege read models.

Classes:

- **PUBLIC:** prices/public aggregate statistics/catalogs;
- **MEMBER:** caller-owned wallet, loans, portfolio, work/business state;
- **SENSITIVE FINANCIAL:** detailed history, credit/risk data, private counterparty information;
- **ADMIN/REGULATORY:** abuse, reconciliation, treasury controls, model/policy evidence;
- **SECRET:** credentials, raw tokens, keys — never an economy read model.

App/Site response adapters minimize fields for their channel.

Macro/AI snapshots use de-identified/aggregated data where individual identity is unnecessary.

## 12. API inventory and versioning

The generated API inventory is security authority for public routing.

Each endpoint entry contains:

- method/path;
- App/Site ownership;
- authentication;
- authorization scope;
- object-authorization rule;
- request/response schema;
- size/rate/resource limits;
- idempotency;
- Play Integrity requirement if any;
- CSRF requirement if any;
- Economy Core command mapping if mutating;
- version/deprecation status.

OWASP API inventory drift is treated as a security defect.

Compatibility adapters cannot create unregistered privileged routes.

### 12.1 Version transition

- `/app-api/v1`: compatibility, measured usage, explicit retirement.
- `/app-api/v2`: canonical App Core.
- `/site-api/v1`: canonical Site Core.
- private Nest/Economy interface: never a public compatibility surface.

No old API is deleted until supported native versions have migrated and usage evidence meets the retirement rule.

## 13. Authentication and session security

### 13.1 Web

Web keeps same-origin cookie sessions.

Session authority is durable across deployment and restart. CSRF, session expiry/revocation, recent reauthentication and privileged role checks remain server authoritative.

### 13.2 Native

Native keeps the public BFF pattern and persistent cookie/session contract unless a later approved auth redesign replaces it.

OAuth/browser handoff remains single-use. Future public-client OAuth changes follow current security BCP, including exact redirect handling and PKCE where applicable.

### 13.3 Session to Economy Core

Economy Core does not trust a BFF-provided member id by itself.

The actor context is derived from a currently valid server-authoritative session/automation identity and has a short validity window.

Revocation or account disable invalidates subsequent command authorization.

## 14. Mobile app integrity

Play Integrity is applied selectively to valuable or abuse-prone actions, for example:

- large wallet transfer;
- high-value purchase;
- loan origination above configured threshold;
- sensitive market order;
- reward/work pattern flagged by risk engine;
- account-security mutation where appropriate.

A verdict is evaluated close to the protected action.

Required checks include:

- request details and request hash;
- expected package/application identity;
- acceptable app-recognition state;
- server-side actor/session authorization;
- command freshness.

Integrity failure does not automatically become a permanent account judgment. The result feeds a tiered abuse policy: allow, additional verification, delay/review, or deny for concrete high-risk actions.

## 15. Service-to-service security

The existing shared static `INTERNAL_API_TOKEN` is a legacy boundary to be replaced for the multi-core architecture.

### 15.1 Target service credential

A workload credential is:

- short lived;
- audience bound;
- environment bound;
- scoped;
- uniquely identifiable;
- rotatable/revocable;
- not accepted from public clients.

A signed workload token contains at minimum:

`iss, sub, aud, scope, iat, exp, jti, kid`.

Initial target lifetime: **5 minutes or less** for privileged internal calls.

### 15.2 Proof of possession

If App/Site/Economy become separate network services, the highest-value internal path should use mTLS or another approved proof-of-possession mechanism in addition to normal TLS, so a stolen bearer token alone is insufficient.

### 15.3 Header hygiene

Public request headers that resemble internal identity/authorization headers are stripped at the edge/BFF.

Only the trusted server constructs internal caller and actor metadata.

## 16. Authorization model

Authorization is evaluated at three levels:

1. **service authorization** — may this workload call this Economy Core command family?
2. **actor authorization** — may this member/admin/automation actor perform the operation?
3. **object/business authorization** — may this actor act on this exact account, loan, business, order, budget or policy object in its current state?

No level substitutes for another.

BOLA/BFLA negative tests are required for App and Site routes and again at the Economy Core function boundary for high-value operations.

## 17. Administrator and policy approval security

Administrator UI access is not policy authority.

High-impact policy actions require:

- current privileged role;
- recent step-up authentication;
- exact proposal/config hash;
- reason;
- expected current policy version;
- immutable audit;
- rollback target.

Initial security defaults:

- P0 financial-policy step-up freshness: **10 minutes**;
- approval artifact lifetime: **15 minutes**;
- approval is bound to exact parameter set and cannot be reused after any value changes;
- widening AI automatic bounds is never itself an AI-automatic operation.

Currency issuance/retirement, emergency treasury exceptions, AI guardrail widening and production policy-mode changes use the strongest available approval policy. Where a true second approver exists, four-eyes approval is preferred; lack of a second approver does not justify AI automatic execution.

## 18. Economy Intelligence security boundary

Economy Intelligence receives immutable/versioned Economy Snapshots and returns typed proposals, forecasts, explanations or anomaly evidence.

It does **not** receive:

- Economy Core policy-executor credential;
- database owner/migrator credential;
- `economy_post_transaction` execute authority;
- administrator session cookie;
- unrestricted internal network access.

Model output is always untrusted data.

### 18.1 Prompt and context isolation

User/community/news/web content entering model context is labeled as untrusted content.

Retrieved content cannot redefine:

- tool permissions;
- policy bounds;
- actor identity;
- Economy Core instructions;
- approval state.

The model cannot produce executable SQL for direct execution.

### 18.2 Tool and egress allowlist

AI tools are read-only by default.

Allowed classes may include:

- macro snapshot query;
- scenario simulation;
- research retrieval through controlled outbound gateway;
- proposal storage.

Direct money movement, policy apply, admin role change, secret retrieval and arbitrary URL fetch are absent from the model tool set.

Outbound retrieval enforces scheme/domain policy, private-address rejection, redirect revalidation, byte/time limits and no forwarding of internal auth headers.

### 18.3 Model/provider compromise assumption

The system assumes any model/provider may hallucinate, be prompt-injected or become unavailable.

Therefore model compromise must not grant direct economic mutation.

The safe fallback is deterministic/classical operation, frozen automatic policy, or human review depending on the policy family.

## 19. Economy Policy Registry

Every tunable parameter has one canonical server-side registry entry.

Required fields:

```text
policy_key
domain
unit
current_value
human_baseline
hard_min
hard_max
auto_min
auto_max
max_auto_step
max_auto_drift_7d
max_auto_drift_30d
cooldown
risk_tier
ownership_mode
required_evidence
required_approval
policy_version
updated_at
```

Clients never invent min/max/step values.

AI cannot modify its own registry entry, bounds, cooldown or risk tier.

### 19.1 Ownership modes

- `OBSERVE_ONLY`
- `PROPOSE_ONLY`
- `BOUNDED_AUTO`
- `MANUAL_OVERRIDE`
- `FROZEN`

A model recommendation may lower effective authority from `BOUNDED_AUTO` to review/frozen when risk is detected.

A model recommendation may **not** raise authority from proposal-only to automatic.

## 20. Initial AI numeric guardrails

These values are **v497 initial planning defaults**. They are deliberately conservative seeds, not claims of universal economic optimality. Production adoption still requires simulation, historical replay and exact-SHA Test evidence.

| Policy family | Max one automatic/proposed step | Max 7-day drift from human baseline | Max 30-day drift | Execution mode |
|---|---:|---:|---:|---|
| UI/discoverability/optional sink rotation weight | ±5% | ±10% | ±20% | BOUNDED_AUTO |
| optional cosmetic/prestige price multiplier | ±1% | ±3% | ±5% | BOUNDED_AUTO |
| non-essential service-fee multiplier | ±0.5% | ±1.5% | ±3% | BOUNDED_AUTO |
| firm logistics/maintenance/input-cost multiplier | ±0.5% | ±1.5% | ±3% | BOUNDED_AUTO |
| job reward multiplier | ±0.5% | ±1.5% | ±3% | BOUNDED_AUTO after shadow qualification |
| job availability/cap | smaller of ±1 slot or ±5% | ±10% | ±15% | BOUNDED_AUTO |
| shop restock quantity | ±2% | ±5% | ±10% | BOUNDED_AUTO |
| external/NPC demand multiplier | ±0.5% | ±2% | ±5% | BOUNDED_AUTO plus net-injection budget |
| new-loan/new-deposit spread | ±5 bp | ±15 bp | ±25 bp | BOUNDED_AUTO for new contracts only |
| discretionary treasury envelope weight | ±1 percentage point | ±2 pp | ±3 pp | BOUNDED_AUTO, total budget unchanged |
| TRR target-center observability parameter | ±2 pp | ±3 pp | ±5 pp | BOUNDED_AUTO; never a forced spending rule |
| tax rate | ±10 bp proposal | n/a | ±25 bp proposal budget | HUMAN APPROVAL |
| central policy/reference rate | ±25 bp proposal | n/a | separate policy review | HUMAN APPROVAL |
| macro credit/capital buffer | ±25 bp proposal | n/a | separate risk review | HUMAN APPROVAL |
| protected treasury reserve ratio | n/a | n/a | ±1 pp | HUMAN APPROVAL |
| explicit base-WLD issuance/retirement | <=0.10% of measured private M1 per operation | n/a | <=0.25% of private M1 | STRONG HUMAN APPROVAL |
| AI-sourced stock-event impact proposal | <=±2% bounded event effect | event aggregation limits apply | n/a | HUMAN/CORE APPROVAL |
| direct absolute stock-price write | 0 | 0 | 0 | PROHIBITED |
| direct member balance write | 0 | 0 | 0 | PROHIBITED |
| historical ledger mutation | 0 | 0 | 0 | PROHIBITED |
| change existing fixed contract terms against issued contract | 0 | 0 | 0 | PROHIBITED |
| self-widen AI limits / risk tier | 0 | 0 | 0 | PROHIBITED |
| activate new leverage/derivatives authority | 0 automatic | 0 automatic | 0 automatic | SEPARATE HIGH-RISK APPROVAL |

A basis point (bp) is 0.01 percentage point.

### 20.1 Additional exclusions

Automatic treasury envelope movement excludes:

- protected reserve;
- already-incurred refund/recovery liabilities;
- statutory/constitutional tax conservation;
- emergency incident obligations;
- committed contractual payouts.

Automatic loan/deposit spread changes apply only to newly originated contracts and do not rewrite existing fixed terms.

Automatic NPC demand is subject to an explicit net-injection budget so it cannot become an unlimited hidden faucet.

## 21. Guardrail arithmetic, cooldown and baseline

The effective applied delta is:

```text
effective_delta =
min_by_magnitude(
  requested_delta,
  remaining_per_step_limit,
  remaining_7d_drift_budget,
  remaining_30d_drift_budget,
  hard_range_remaining,
  risk_budget_remaining
)
```

The cumulative drift is measured from the **last human-approved baseline**, not from yesterday's already-auto-adjusted value. This prevents repeated small changes from walking indefinitely away from operator intent.

Initial routine automatic cooldown:

- no more than one apply per policy family per **24 hours**;
- observation may run hourly;
- post-change checkpoints at approximately **6h**, **24h** and **7d**.

Automatic apply requires all of:

- fresh required metrics;
- ledger/economy reconciliation PASS;
- no active integrity/security incident affecting the domain;
- sample sufficiency;
- acceptable uncertainty/calibration;
- matching policy/config version;
- cooldown complete;
- rollback target present;
- no concurrent policy apply.

If any required condition fails, the result is proposal-only or frozen, never “best guess apply”.

## 22. Market and stock AI

The current concept of model-generated scenario -> automatic publish -> economic market event is superseded as a general authority path.

New path:

```text
model scenario
 -> MarketEventProposal
 -> registered-stock validation
 -> manipulation/integrity tests
 -> deterministic effect clamp
 -> approval/eligibility gate
 -> signed MarketEventCommand
 -> deterministic stock engine
```

The model never writes absolute price.

Model text cannot choose arbitrary symbols that do not exist in the authoritative registry.

AI-sourced events carry source/model/proposal id, snapshot id, approved maximum effect, expiry and approval evidence.

## 23. Jobs and work AI

Work auto-tuning is absorbed into the Economy Policy Registry.

Path:

```text
labour telemetry
 -> Economy Snapshot
 -> labour analyzer/model
 -> PolicyProposal
 -> Scenario Lab
 -> deterministic guardrail
 -> registered Work Policy Command
```

The work module does not maintain an independent hidden economy policy.

Job reward tuning is disabled until its funding source and macro issuance classification are compatible with v496.

## 24. Treasury and fiscal AI

AI may forecast:

- tax receipts;
- obligations;
- output/employment gap;
- programme demand;
- reserve stress;
- distribution effect.

AI may automatically move only **discretionary envelope weights** inside the registered small bounds while total approved budget, protected reserve and existing obligations remain unchanged.

AI cannot:

- burn tax;
- create a new tax;
- change tax rate automatically;
- spend beyond available treasury;
- bypass commitment approval;
- mint to cover a treasury deficit.

## 25. Banking and credit AI

AI may estimate default risk, credit demand and stress scenarios.

Bounded automation is initially limited to small **new-contract spread** movement inside registered ranges.

Human approval is required for:

- credit-eligibility model changes;
- macro capital/credit buffer changes;
- collateral-rule changes;
- systemic resolution support;
- emergency liquidity terms.

Existing fixed contracts are not repriced by routine AI.

## 26. Abuse, bot and Sybil containment

Economic realism fails if automated or related accounts can fabricate labour, demand, business revenue, creditworthiness or market activity.

Economy Core consumes abuse-risk evidence but does not erase legitimate ledger history.

Controls include:

- account/device/network relationship graph signals;
- related-account transfer and circular-flow detection;
- wash-trade and self-dealing detection;
- job/reward automation patterns;
- synthetic business revenue patterns;
- loan farming and rapid-default patterns;
- referral/welfare multi-account farming;
- stock/market manipulation;
- inventory/crafting duplication patterns.

Enforcement is tiered and explainable:

- exclude suspicious flows from clean macro indices;
- require additional verification;
- slow/review high-value mutations;
- restrict an abused flow;
- freeze only where concrete integrity risk justifies it.

Device integrity or one anomaly score alone is not conclusive guilt.

## 27. Network, egress and SSRF boundaries

App Core, Site Core, Economy Core and AI have different outbound-network policies.

### 27.1 App/Site Core

Outbound calls are restricted to registered internal dependencies and explicitly approved external identity/integrity providers.

### 27.2 Economy Core

Economy Core should have the narrowest practical egress. Economic settlement does not require arbitrary internet access.

### 27.3 Economy Intelligence

Research/model tools use a dedicated controlled egress path.

For any URL-fetch capability:

- allow approved schemes;
- block localhost, link-local, private and metadata ranges unless explicitly required;
- re-resolve/revalidate redirects;
- bound response bytes/time/redirect count;
- strip internal credentials;
- log policy decision without sensitive URL data.

Prompt content cannot authorize a new network destination.

## 28. Secrets, key management and environment separation

Secrets are never committed to repository, screenshots, model prompts or client bundles.

Required separation:

- Production != Test service credentials;
- App Core != Site Core workload identity;
- policy executor != AI/model identity;
- DB migrator != runtime role;
- admin/session encryption keys != workload-signing keys.

Keys/tokens support:

- rotation;
- overlap where continuity requires it;
- revocation;
- `kid`/version identification;
- audit of rotation without secret values.

No one static secret should unlock every internal service.

## 29. Audit and observability

Every Economy Core command produces a privacy-safe trace linking:

- public request id;
- caller service;
- actor/automation identity;
- command id;
- business event;
- idempotency key hash;
- policy version;
- approval/proposal id if applicable;
- ledger transaction/receipt;
- result/error class.

AI policy evidence additionally records:

- model/provider/version;
- prompt/template version;
- snapshot id;
- input-data window;
- validation/calibration evidence;
- proposed/current/applied values;
- deterministic clamp result;
- human approval where required;
- rollback evaluation.

Raw cookies, passwords, API keys, Play Integrity tokens and model-provider secrets are never audit payloads.

## 30. Availability and resource-exhaustion security

Separate App and Site Cores allow channel-specific rate limits and failure containment, but both depend on Economy Core for critical writes.

Controls:

- per-IP, per-account, per-device where available, per-service and per-command-family quotas;
- body/response-size limits;
- expensive-query caps;
- bounded retries with idempotency;
- queue/backpressure for noninteractive work;
- circuit breakers around model/provider calls;
- AI budget and concurrency limits;
- Economy Core remains functional when AI is unavailable.

AI outage must not block ordinary deterministic wallet, tax, settlement or banking operations.

Economy Core overload must fail closed for new high-value mutation rather than bypassing invariants through a fallback writer.

## 31. Zero-downtime migration path

This is a later implementation direction, not performed by this design commit.

### Phase 1 — contract inventory and shadow boundaries

- generate current web/app endpoint inventory;
- classify each route App, Site, shared-read or internal;
- define Economy Core command/read contracts;
- add observability showing which legacy route maps to which command.

No user-visible route is removed.

### Phase 2 — create Site Core namespace

- introduce `/site-api/v1`;
- migrate browser/server-action calls from `/app-api/v1`;
- keep native `/app-api/v1` unchanged;
- prove auth/session/CSRF parity.

### Phase 3 — introduce App Core v2

- publish `/app-api/v2`;
- retain v1 compatibility;
- add generated route manifest/capability negotiation;
- add request-integrity policy metadata.

### Phase 4 — Economy Core command boundary

- route value-changing App/Site calls through one typed Economy Core adapter;
- preserve existing SQL function/ledger authority;
- shadow compare legacy and new calculated outcomes before switching.

### Phase 5 — workload identity split

- replace shared internal bearer boundary incrementally;
- issue distinct App/Site/executor identities;
- verify audience/scope/expiry/revocation;
- optionally add mTLS/proof-of-possession when physically separated.

### Phase 6 — AI/automation consolidation

- convert economy auto-policy, work tuning and stock scenario paths to proposals/registered commands;
- remove direct/independent policy-apply paths after shadow parity;
- enable only initial low-risk bounded-auto families.

### Phase 7 — compatibility retirement

- retire legacy web use of App API first;
- retire App API v1 only after supported native clients and measured usage permit;
- contract legacy internal token after all callers have moved.

Every phase is expand -> observe/shadow -> switch -> reconcile -> contract, with rollback.

## 32. Security test matrix

### App Core

- wrong host/redirect refusal;
- malformed/deprecated app version;
- missing/invalid session;
- CSRF failure;
- replayed economic request;
- mismatched Play Integrity `requestHash`;
- unregistered dynamic route;
- BOLA/BFLA;
- oversized request;
- rate-limit exhaustion;
- deep-link/OAuth handoff replay.

### Site Core

- CSRF;
- Host/origin confusion;
- session continuity;
- cross-user BOLA;
- admin BFLA;
- stale step-up;
- browser cannot receive service token;
- App-only route cannot gain Site authority;
- WebSocket room authorization.

### Economy Core

- forged actor context;
- wrong service audience/scope;
- expired/revoked service credential;
- replayed `jti`/command/idempotency;
- direct protected-table mutation denied;
- concurrent double-spend;
- policy version conflict;
- insufficient funds/available treasury;
- ledger imbalance rejection;
- negative/overflow/rounding input;
- fail-closed on reconciliation failure.

### Economy Intelligence

- direct prompt injection;
- indirect prompt injection from community/web content;
- model produces out-of-range value;
- model tries to widen its bounds;
- model asks for forbidden tool;
- compromised provider returns malformed output;
- model outage/timeout;
- poisoned/stale snapshot;
- no policy-executor credential present;
- AI cannot publish stock event directly.

### Policy executor

- proposal hash changed after approval;
- stale approval;
- wrong baseline;
- cumulative drift exceeded;
- cooldown violation;
- security incident active;
- low sample/high uncertainty;
- rollback trigger;
- concurrent apply conflict.

## 33. Release gates

No runtime implementation of this design reaches Production until:

1. latest authority documents and user instructions are re-read;
2. exact candidate SHA is recorded;
3. App/Site/API inventory diff is generated;
4. threat model and abuse cases are updated;
5. service identity/audience/scope negative tests pass;
6. database grant/function/`search_path` review passes;
7. all money commands pass real-DB idempotency/concurrency tests;
8. App mobile-integrity positive/negative tests pass for enabled actions;
9. Site session/CSRF/step-up continuity passes;
10. AI prompt-injection/excessive-agency tests prove no direct mutation;
11. policy-registry bounds/cooldown/drift tests pass;
12. exact-SHA isolated Test proves backend/API/database behavior;
13. existing authenticated sessions survive restart/cutover;
14. rollback target is verified;
15. zero-downtime promotion is used;
16. post-promotion auth/API/ledger/admin/AI telemetry shows no new P0/P1 signal.

Documentation completion does not satisfy these runtime gates.

## 34. P0 acceptance criteria

The future architecture is accepted only when all are true:

1. App Core and Site Core have distinct public contracts.
2. Web no longer depends on App compatibility routes for canonical behavior.
3. Economy Core is the only domain authority for economic mutation.
4. Public clients cannot route directly to Economy Core.
5. App/Site compromise does not grant DB owner/migrator or policy-executor authority.
6. Workload and actor identity are independently validated.
7. No protected financial command trusts caller-authored actor id alone.
8. All money writes remain balanced, append-only, idempotent and ledger-backed.
9. App/Site have no direct protected-table write grant.
10. AI/model runtime has no ledger or policy-executor credential.
11. AI cannot modify its own limits.
12. Automatic numeric changes cannot exceed per-step, 7-day, 30-day or hard bounds.
13. High-impact tax/rate/credit/issuance changes require human approval.
14. Existing contracts are not silently repriced.
15. Tax remains 100% Treasury inflow net of explicit reversals.
16. Mobile integrity, when required, is bound to the economic request and verified server-side.
17. API method/path/scope inventory is generated and release-gated.
18. Legacy compatibility has usage measurement and retirement criteria.
19. Real-DB concurrency/replay/security tests pass.
20. Zero-downtime Test/Production evidence exists for the exact release SHA.

## 35. Existing authority disposition

v497 keeps and strengthens:

- v496 unified macroeconomic ledger/sector design;
- v495 one treasury and no tax burn;
- existing append-only Economy Core ledger;
- actor-checking `SECURITY DEFINER` pattern;
- same-origin web session/CSRF;
- native App BFF pattern;
- AI scenario/shadow evaluation as analysis.

v497 supersedes as future direction:

- web canonical dependence on native `/app-api/v1`;
- a shared static internal bearer token as the final multi-core service identity design;
- independent economy/work/stock automation policy authority;
- AI automatic stock-scenario publication as a general economic authority path;
- client-invented economy control bounds;
- generic dynamic economic write routing without method/path/scope inventory.

Applied migrations and historical release documents remain immutable evidence.

## 36. Evidence and numeric-policy interpretation

The 149,691-record discovery corpus is used to broaden candidate evidence and identify relevant literature families.

Numeric AI bounds are selected conservatively from:

- safe/constrained-control principles;
- small trust-region style policy movement;
- existing Moneyverse guardrail history;
- operational reversibility;
- real-world policy-change granularity as contextual evidence;
- the requirement that Moneyverse remains a game economy, not a claim to reproduce a national economy exactly.

The values are initial simulation/security seeds. They are changed only through a versioned human policy update supported by replay/simulation/Test evidence.

## 37. Next gate

This document is the written v497 architecture produced from the user-approved design direction.

Before canonical planning integration or runtime implementation:

1. user reviews/approves this written specification;
2. write an implementation/integration plan using the approved spec;
3. user reviews that plan and selects execution method;
4. only then modify canonical authority documents and later runtime code according to the approved plan.

Conversational approval of the architecture direction does not skip the written-spec review or implementation-plan gate.
