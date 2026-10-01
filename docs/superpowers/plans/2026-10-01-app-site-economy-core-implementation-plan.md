# App/Site/Economy Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved v497 architecture by separating App Core and Site Core public contracts, consolidating all financial mutation under one Economy Core, replacing coarse internal trust with scoped workload identity, and constraining AI/automation to one versioned policy registry.

**Architecture:** App Core (`/app-api/v2`) and Site Core (`/site-api/v1`) are channel BFFs only. They normalize authentication, compatibility and channel concerns, then invoke one typed Economy Core command/read boundary whose final value mutation still runs through existing PostgreSQL `SECURITY DEFINER` and append-only ledger functions. AI/classical automation reads versioned snapshots and emits proposals; only the Economy Policy Registry + Policy Executor may apply registered bounded changes.

**Tech Stack:** Debian 13, Next.js, NestJS, TypeScript, PostgreSQL, pnpm, Vitest, Node test runner, Kotlin/Android, Retrofit/OkHttp, JUnit, Git/GitHub.

**Spec:** `docs/superpowers/specs/2026-10-01-app-site-economy-core-security-design.md`

## Global Constraints

- Latest design commit at plan creation: `2bbe31a11ec27c2e31a44afdad502cd60a0fe4fc`.
- Latest checked `origin/main` at plan creation: `2bad12eb290cba6b98d08604cd6b1274243e1a4f`.
- English is canonical; every material planning/operations document change has a Korean counterpart.
- Re-fetch and re-read latest `origin/main`, Project Plan, Integrated Planning Master, Documentation Policy and affected specs at the start of every implementation task and again before integration.
- If another worker consumes a planned version or migration number, rebase/renumber to the next free contiguous value; never edit an applied migration.
- All code changes use a fresh branch/worktree; do not develop directly on `main`.
- Every task records start, midpoint and completion evidence plus exact main/base/candidate SHA.
- App Core and Site Core are BFFs, not economic authorities.
- Economy Core is the only domain authority for economic mutation.
- `economy_post_transaction` remains the canonical WLD mover.
- Ledger/audit history remains append-only; correction uses compensating transactions.
- App/Site/AI processes receive no direct protected financial table writes.
- Every value-changing path preserves exact integer/string money, idempotency and real-DB concurrency safety.
- AI cannot modify its own limits or obtain a policy-executor/ledger credential.
- Initial automatic policy cooldown is 24h per policy family; 7d/30d drift is measured from the last human-approved baseline.
- High-impact tax, policy-rate, macro-credit-buffer and WLD issuance/retirement changes remain human-approved.
- Tax remains 100% `TREASURY_MAIN` inflow net of explicit reversal.
- App API v1 stays compatible until supported native clients and measured usage meet retirement criteria.
- Production promotion is exact-SHA, zero-downtime, session-preserving and rollback-capable.
- No task may claim success without fresh verification evidence.

## Review Focus

1. **Concurrent main/migration drift:** before every DB task, prove the planned migration number is still free and re-number forward-only files if not.
2. **Cross-channel identity confusion:** tests must prove App credentials cannot call Site/admin-only operations and Site credentials cannot impersonate App/mobile or policy-executor identities.
3. **Replay/idempotency under retries/concurrency:** real-DB tests must prove duplicate App/Site requests cannot double-apply money even with different network request IDs.
4. **AI drift-by-small-steps:** tests must measure cumulative movement from the last human baseline so repeated legal daily steps cannot exceed 7d/30d budgets.
5. **Compatibility during rollout:** tests must prove `/app-api/v1` and pre-existing authenticated sessions continue to work while Site v1 and App v2 are introduced.

---

## File Structure and Responsibility Map

### Main repository

- `packages/contract/src/channel-api.ts` — canonical App/Site route manifest types and route registry.
- `packages/contract/src/channel-api.test.ts` — manifest uniqueness, ownership, method/path/scope tests.
- `packages/contract/src/index.ts` — exports channel contract.
- `scripts/check-channel-api-contract.mjs` — generated/repository drift guard.
- `frontend/src/lib/channel-gateway.ts` — shared safe proxy primitives without channel policy.
- `frontend/src/lib/site-gateway.ts` — Site Core route/auth/header policy.
- `frontend/src/app/site-api/v1/[...path]/route.ts` — Site Core public BFF.
- `frontend/src/app/site-api/v1/[...path]/route.test.ts` — Site contract, spoofing, CSRF/headers and allowlist tests.
- `frontend/src/app/app-api/v2/[...path]/route.ts` — App Core v2 BFF.
- `frontend/src/app/app-api/v2/[...path]/route.test.ts` — App v2 route manifest/version/integrity tests.
- `frontend/src/lib/app-gateway.ts` — v1 compatibility boundary only after v2 introduction.
- `backend/src/economy/economy-command.service.ts` — typed command normalization/execution adapter.
- `backend/src/economy/economy-command.types.ts` — Economy Command Envelope TypeScript contract.
- `backend/src/economy/economy-command.service.test.ts` — caller/actor/version/hash/replay validation.
- `backend/src/auth/guards/workload-identity.guard.ts` — short-lived workload token verification.
- `backend/src/auth/workload-identity.ts` — issuer/audience/scope/jti parsing and verification helpers.
- `backend/src/auth/guards/guards.test.ts` — App/Site/executor scope negative tests.
- `backend/src/economy/economy-policy-registry.ts` — policy registry types and guardrail math.
- `backend/src/economy/economy-policy-registry.test.ts` — step/cooldown/7d/30d/human-baseline tests.
- `backend/src/economy/economy-policy-executor.service.ts` — only runtime path that applies registered adaptive policy.
- `backend/src/economy/economy-policy-executor.service.test.ts` — approval/reconciliation/rollback/freeze tests.
- `backend/src/economy/economy-ai-review.ts` — proposal/evidence only; no apply authority.
- `backend/src/economy/multi-agent-council.service.ts` — simulated/model council output labeled as evidence only.
- `backend/src/admin/operations.repository.ts` — work auto-tune converted to proposal submission.
- `backend/src/admin/ai-news.service.ts` — stock scenario automatic publication removed/replaced with proposal.
- `backend/src/scheduler/scheduler.ts` — one policy proposal/evaluation/apply schedule; no independent mutation jobs.
- `backend/src/economy-auto-policy.db.test.ts` — real-DB policy registry and baseline-drift regression.
- `backend/src/stock/market-events.test.ts` — AI proposal cannot directly publish a real market event.
- `backend/src/admin/operations-read-models.db.test.ts` — work tuning proposal vs apply separation.
- `packages/database/migrations/242-economy-command-security-context.sql` — planned number; extend existing economic command envelope with channel/service/policy metadata.
- `packages/database/migrations/243-workload-identity-and-economy-role.sql` — planned number; DB/runtime role/grant containment only if role split is proven deployable.
- `packages/database/migrations/244-economy-policy-registry-v2.sql` — planned number; versioned registry, baseline, cooldown and drift budgets.
- `packages/database/migrations/245-economy-automation-consolidation.sql` — planned number; disable/supersede independent auto apply paths without rewriting history.
- `docs/api/channel-api-contract.md` + `.ko.md` — App v2/Site v1 contract and retirement policy.
- `docs/operations/economy-core-runtime.md` + `.ko.md` — runtime trust/command/policy executor runbook.

### Android repository `wtrdd1-hash/woldeok-moneyverse-app`

- `app/src/main/java/com/example/woldeokmoneyverse/data/remote/ApiClient.kt` — App API v2 capability/version headers and integrity hook.
- `app/src/main/java/com/example/woldeokmoneyverse/data/remote/MoneyverseApi.kt` — canonical v2 typed routes; universal writes restricted by manifest.
- `app/src/main/java/com/example/woldeokmoneyverse/data/remote/ApiContractCompatibilityInterceptor.kt` — v1 compatibility only; v2 must not depend on legacy field mutation.
- `app/src/main/java/com/example/woldeokmoneyverse/data/remote/AppRouteManifest.kt` — generated/checked allowed method/path metadata for generic transport.
- `app/src/test/java/com/example/woldeokmoneyverse/MobileApiContractTest.kt` — v2 routing and money payload contract.
- `app/src/test/java/com/example/woldeokmoneyverse/AppRouteManifestTest.kt` — generic write deny-by-default.

## Task 1: Integrate v497 into the canonical planning authority

**Files:**
- Create: `scripts/docs/verify-v497-authority-integration.mjs`
- Modify: `docs/planning/PROJECT_PLAN.md`
- Modify: `docs/planning/PROJECT_PLAN.ko.md`
- Modify: `docs/planning/INTEGRATED_PLANNING_MASTER.md`
- Modify: `docs/planning/INTEGRATED_PLANNING_MASTER.ko.md`
- Modify: `docs/planning/SECURITY_MASTER_PLAN.md`
- Modify: `docs/planning/SECURITY_MASTER_PLAN.ko.md`
- Modify: `docs/planning/SECURITY_ASSURANCE_MASTER_PLAN.md`
- Modify: `docs/planning/SECURITY_ASSURANCE_MASTER_PLAN.ko.md`
- Modify: `docs/planning/AI_ECONOMY_CONTROLLER_SPEC.md`
- Modify: `docs/planning/AI_ECONOMY_CONTROLLER_SPEC.ko.md`
- Modify: `docs/mobile-api-runtime-contract.md`
- Modify: `docs/mobile-api-runtime-contract.ko.md`
- Modify: `docs/operations/security-model.md`
- Modify: `docs/operations/security-model.ko.md`
- Modify: `docs/architecture/database-security.md`
- Modify: `docs/architecture/database-security.ko.md`
- Modify: `docs/API_CATALOG_MASTER.md`
- Modify: `docs/API_CATALOG_MASTER.ko.md`

**Interfaces:**
- Consumes: approved v497 spec `2026-10-01-app-site-economy-core-security-design.md`.
- Produces: one canonical authority hierarchy in which App Core, Site Core, Economy Core and Economy Intelligence have no contradictory ownership statements.

- [ ] **Step 1: Re-fetch authority before editing**

Run:
```bash
git fetch origin main
git rev-parse origin/main
git log --oneline HEAD..origin/main -- docs/planning docs/architecture docs/operations docs/mobile-api-runtime-contract.md
```

Expected: record the current main SHA and inspect any changed authority file before continuing. If the planned v499 version is already used, allocate the next free version and update all paired records consistently.

- [ ] **Step 2: Write the failing authority verifier**

Create `scripts/docs/verify-v497-authority-integration.mjs` that exits non-zero until all canonical documents contain:
- App Core canonical path `/app-api/v2`;
- Site Core canonical path `/site-api/v1`;
- one authoritative Economy Core;
- tax 100% Treasury conservation;
- AI direct balance/absolute-price/history mutation prohibited;
- AI numeric bounds owned by one Policy Registry;
- workload identity distinct from user actor identity;
- v1 App API compatibility/retirement language;
- EN/KO paired files.

Run:
```bash
node scripts/docs/verify-v497-authority-integration.mjs
```

Expected: FAIL against the pre-integration authority docs.

- [ ] **Step 3: Update the authority documents**

Integrate v497 as the current design direction and explicitly mark conflicting older directions as superseded, including:
- web dependence on native App API as canonical behavior;
- shared static internal token as final multi-core identity design;
- independent AI/work/stock mutation authority;
- tax or property-tax hard-burn assumptions;
- generic system-faucet business/job revenue where v496 supersedes it.

Do not rewrite historical migrations/releases/changelogs.

- [ ] **Step 4: Run authority verifier and documentation checks**

Run:
```bash
node scripts/docs/verify-v497-authority-integration.mjs
git diff --check
grep -RniE 'T[B]D|TO[D]O|FIX[M]E|PLACE[H]OLDER'   docs/planning/PROJECT_PLAN*   docs/planning/INTEGRATED_PLANNING_MASTER*   docs/planning/SECURITY_MASTER_PLAN*   docs/planning/AI_ECONOMY_CONTROLLER_SPEC* || true
```

Expected: verifier PASS, `git diff --check` exit 0, no unfinished markers introduced.

- [ ] **Step 5: Record v499-equivalent work/update/changelog evidence and commit**

Commit message:
```bash
git commit -m "docs(core): integrate app site economy core authority"
```

Do not begin runtime work until this authority integration is reviewed against latest main.

---

## Task 2: Add the canonical App/Site channel route manifest

**Files:**
- Create: `packages/contract/src/channel-api.ts`
- Create: `packages/contract/src/channel-api.test.ts`
- Modify: `packages/contract/src/index.ts`
- Create: `scripts/check-channel-api-contract.mjs`
- Modify: root `package.json`

**Interfaces:**
- Produces:
  - `type ApiChannel = 'APP' | 'SITE'`
  - `type ApiAuthMode = 'PUBLIC' | 'SESSION' | 'ADMIN'`
  - `interface ChannelRouteDefinition`
  - `CHANNEL_API_ROUTES: readonly ChannelRouteDefinition[]`
  - `matchChannelRoute(channel, method, path): ChannelRouteDefinition | null`
- Each route definition includes `channel, method, pathTemplate, authMode, scope, idempotencyRequired, csrfRequired, integrityPolicy, economyCommand`.

- [ ] **Step 1: Write failing manifest tests**

Test assertions:
- no duplicate `channel+method+pathTemplate`;
- no route belongs to both APP and SITE unless marked `sharedReadOnly: true`;
- every route with `economyCommand !== null` and non-GET method requires idempotency;
- App v2 high-value route definitions can require `integrityPolicy !== 'NONE'`;
- Site state-changing session routes require CSRF;
- no admin route is classified `PUBLIC`.

Run:
```bash
pnpm --filter @moneyverse/contract test -- channel-api.test.ts
```

Expected: FAIL because channel manifest does not exist.

- [ ] **Step 2: Implement the channel contract**

Create the types and manifest in `channel-api.ts`. Start with the existing routes actually used by web/native and classify every entry as APP, SITE or shared read-only. Do not invent backend business behavior.

- [ ] **Step 3: Add a repository drift checker**

`scripts/check-channel-api-contract.mjs` must scan:
- `frontend/src/app/app-api/**/route.ts`;
- `frontend/src/app/site-api/**/route.ts`;
- Android contract export when available;
- route definitions in `CHANNEL_API_ROUTES`.

It must fail when a public route/method has no manifest entry or an entry references a nonexistent channel endpoint.

Add root script:
```json
"api:channel:check": "pnpm --filter @moneyverse/contract build && node scripts/check-channel-api-contract.mjs"
```

- [ ] **Step 4: Run contract tests**

Run:
```bash
pnpm --filter @moneyverse/contract test
pnpm api:channel:check
pnpm --filter @moneyverse/contract typecheck
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/contract scripts/check-channel-api-contract.mjs package.json
git commit -m "feat(contract): add app site route manifest"
```

---

## Task 3: Introduce Site Core v1 and App Core v2 without breaking App v1

**Files:**
- Create: `frontend/src/lib/channel-gateway.ts`
- Create: `frontend/src/lib/site-gateway.ts`
- Create: `frontend/src/lib/site-gateway.test.ts`
- Create: `frontend/src/app/site-api/v1/[...path]/route.ts`
- Create: `frontend/src/app/site-api/v1/[...path]/route.test.ts`
- Create: `frontend/src/app/app-api/v2/[...path]/route.ts`
- Create: `frontend/src/app/app-api/v2/[...path]/route.test.ts`
- Modify: `frontend/src/lib/app-gateway.ts`
- Modify: `frontend/src/app/app-api/v1/[...path]/route.ts`
- Test: `frontend/src/app/app-api/v1/[...path]/route.test.ts`

**Interfaces:**
- Consumes: `matchChannelRoute()` from Task 2.
- Produces:
  - Site v1 BFF at `/site-api/v1/**`;
  - App v2 BFF at `/app-api/v2/**`;
  - App v1 compatibility path unchanged externally;
  - `proxyChannelRequest(channel, request, route, context)` shared primitive.

- [ ] **Step 1: Write failing Site/App-v2 route tests**

Site assertions:
- spoofed forwarded host is not reflected;
- state-changing session route without valid CSRF context is not silently downgraded;
- unknown route returns stable 404;
- Site route cannot resolve an APP-only/admin-incompatible definition.

App v2 assertions:
- exposes contract metadata with version `2`;
- obsolete client version gets stable 426 before proxying;
- route not in App manifest is 404;
- integrity-required route without forwarded verified evidence gets a stable fail-closed response once enforcement is enabled;
- binary bodies remain unmodified.

Run:
```bash
pnpm --filter frontend test --   src/app/site-api/v1/'[...path]'/route.test.ts   src/app/app-api/v2/'[...path]'/route.test.ts
```

Expected: FAIL because routes do not exist.

- [ ] **Step 2: Extract channel-neutral proxy code**

Move only transport-safe primitives from `app-gateway.ts` into `channel-gateway.ts`:
- origin validation;
- safe request-header forwarding;
- response-header allowlist;
- JSON/binary discrimination;
- upstream timeout/error normalization.

Do not move v1 camelCase/legacy compatibility transformation into the shared layer.

- [ ] **Step 3: Implement Site Core and App Core v2 routes**

Both route handlers:
- consult manifest before proxy;
- strip internal-looking public headers;
- attach server-created channel metadata;
- never expose private backend origin/token to client;
- preserve exact response status/body semantics.

App v1 remains compatibility only and continues existing field aliases.

- [ ] **Step 4: Prove v1 compatibility and new channels**

Run:
```bash
pnpm --filter frontend test --   src/lib/app-gateway.test.ts   src/lib/site-gateway.test.ts   src/app/app-api/v1/'[...path]'/route.test.ts   src/app/app-api/v2/'[...path]'/route.test.ts   src/app/site-api/v1/'[...path]'/route.test.ts
pnpm api:channel:check
pnpm --filter frontend typecheck
```

Expected: PASS, including Review Focus compatibility coverage.

- [ ] **Step 5: Commit**

```bash
git add frontend packages/contract
git commit -m "feat(api): split app v2 and site v1 cores"
```

---

## Task 4: Migrate canonical web calls off the native App API

**Files:**
- Modify: web files reported by `git grep '/app-api/v1' frontend/src -- ':!frontend/src/app/app-api/v1/**'`.
- Modify: `frontend/src/lib/api.ts` only where Site Core helper behavior is centralized.
- Modify: `scripts/check-channel-api-contract.mjs`
- Test: affected frontend route/page tests.

**Interfaces:**
- Consumes: Site Core `/site-api/v1/**` from Task 3.
- Produces: web canonical behavior with zero runtime dependence on native App API compatibility routes, except explicit compatibility tests/docs.

- [ ] **Step 1: Add a failing web/App-route leakage check**

Extend `scripts/check-channel-api-contract.mjs` to fail if production web code outside:
- `frontend/src/app/app-api/**`;
- explicit compatibility test fixtures;
references `/app-api/v1`.

Run:
```bash
pnpm api:channel:check
```

Expected: FAIL and list current web callers.

- [ ] **Step 2: Migrate callers by feature family**

For each caller:
- switch browser/server-side URL to Site v1;
- keep backend payload semantics unchanged;
- use Site route definition from the manifest;
- do not duplicate response-shape compatibility logic from App v1.

Do this in small commits by feature family if the diff exceeds one reviewer-sized unit.

- [ ] **Step 3: Run affected frontend tests after each family**

Minimum:
```bash
pnpm --filter frontend test
pnpm api:channel:check
pnpm --filter frontend typecheck
```

Expected: PASS and no production web reference to `/app-api/v1` outside compatibility surface.

- [ ] **Step 4: Verify session continuity behavior**

Run existing session/auth route tests and add a regression that a pre-existing session cookie accepted by Site Core still resolves the same backend actor without interactive login.

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git commit -am "refactor(site): move web traffic to site core"
```

---

## Task 5: Extend the existing economic command envelope into the Economy Core boundary

**Files:**
- Create: `backend/src/economy/economy-command.types.ts`
- Create: `backend/src/economy/economy-command.service.ts`
- Create: `backend/src/economy/economy-command.service.test.ts`
- Modify: `backend/src/economy/economy.module.ts`
- Create planned migration: `packages/database/migrations/242-economy-command-security-context.sql`
- Modify test: `backend/src/economy-idempotency-contract.test.ts`
- Modify/add real-DB test: `backend/src/economy-core-command.db.test.ts`

**Migration-number gate:** before creating migration 242, run `find packages/database/migrations -maxdepth 1 -name '*.sql' | sort -V | tail`. If 242 or any planned number has been consumed on latest main, rebase and use the next contiguous number. Never modify 206/207/211/218.

**Interfaces:**
- Extends existing `public.economic_commands` rather than creating a second command ledger.
- Produces TypeScript:
  - `type EconomyChannel = 'APP' | 'SITE' | 'ADMIN' | 'AUTOMATION'`;
  - `interface EconomyCommandEnvelope<T>`;
  - `EconomyCommandService.execute<TInput,TResult>(envelope, handler)`.
- Planned DB metadata on command identity: `channel`, `caller_service`, `policy_version`, `actor_context_id`, `expires_at`.
- Reuses existing immutable `request_hash`, `business idempotency key`, `ledger_transaction_id`, result snapshot and advisory-lock semantics.

- [ ] **Step 1: Write failing TypeScript command-boundary tests**

Assertions:
- rejects missing caller service;
- rejects missing actor context for member/admin commands;
- rejects expired command;
- rejects unsupported channel;
- rejects policy-version mismatch when command requires a policy version;
- computes the same canonical request digest for semantically identical payload key order;
- does not trust a caller-supplied actor id without validated actor context.

Run:
```bash
pnpm --filter backend test -- src/economy/economy-command.service.test.ts
```

Expected: FAIL because service/types do not exist.

- [ ] **Step 2: Write failing real-DB migration tests**

Create `backend/src/economy-core-command.db.test.ts` that proves:
- application role cannot `SELECT/INSERT/UPDATE/DELETE` `economic_commands` directly;
- completed command identity fields cannot be mutated;
- same actor/action/idempotency with different request hash is rejected;
- two concurrent first attempts serialize to one logical command;
- App and Site retries with the **same business idempotency identity** cannot double-settle;
- command metadata records channel/service/policy context without making it client-authoritative.

Run against isolated Test DB before migration.

Expected: FAIL for new metadata/function signatures.

- [ ] **Step 3: Implement forward-only DB extension**

Migration must:
- add nullable/backfillable metadata columns first;
- update immutability guard so new identity fields cannot change after claim;
- add a new versioned claim wrapper rather than breaking old callers in one deploy;
- keep existing claim/complete functions available for legacy paths during expand phase;
- revoke PUBLIC execute on any new function;
- grant only the current runtime role required for compatibility;
- set safe `search_path`.

Do not create a parallel command table.

- [ ] **Step 4: Implement the typed EconomyCommandService**

The service normalizes channel/service/actor context and canonical payload hash, then calls only typed repository/function adapters. It does not perform money arithmetic itself.

- [ ] **Step 5: Run unit + real-DB tests**

Run:
```bash
pnpm --filter backend test --   src/economy/economy-command.service.test.ts   src/economy-idempotency-contract.test.ts   src/economy-core-command.db.test.ts
pnpm --filter backend typecheck
```

Expected: PASS with real Test database configured; if DB env is unavailable, unit tests may pass but this task is **not accepted** until real-DB tests run.

- [ ] **Step 6: Commit**

```bash
git add backend/src/economy packages/database/migrations
git commit -m "feat(economy): extend command security envelope"
```

---

## Task 6: Introduce scoped workload identity without breaking the legacy token path

**Files:**
- Create: `backend/src/auth/workload-identity.ts`
- Create: `backend/src/auth/guards/workload-identity.guard.ts`
- Modify: `backend/src/auth/guards/guards.test.ts`
- Modify: `backend/src/auth/auth.module.ts`
- Modify: `backend/src/app.module.ts`
- Modify: `backend/src/core/config.ts`
- Modify: `backend/src/core/config.test.ts`
- Create: `frontend/src/lib/workload-identity.ts`
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/lib/channel-gateway.ts`
- Create planned migration only if DB role split is deployable: `packages/database/migrations/243-workload-identity-and-economy-role.sql`

**Interfaces:**
- Produces:
  - `verifyWorkloadToken(token, expectedAudience): WorkloadPrincipal`;
  - `WorkloadPrincipal { serviceId, environment, scopes, jti, issuedAt, expiresAt }`;
  - scopes such as `economy:read`, `economy:command`, `policy:apply`, `admin:read`.
- Legacy `x-internal-token` remains temporary compatibility during expand phase only.

- [ ] **Step 1: Write failing guard tests**

Add tests for:
- expired token denied;
- wrong `aud` denied;
- App Core token denied for Site/admin-only scope;
- Site Core token denied for `policy:apply`;
- AI/model identity denied for `economy:command` and `policy:apply`;
- Test token denied in Production audience/environment;
- 5-minute-or-shorter privileged token accepted when otherwise valid;
- spoofed public workload headers do not create a principal.

Run:
```bash
pnpm --filter backend test -- src/auth/guards/guards.test.ts src/core/config.test.ts
```

Expected: FAIL before implementation.

- [ ] **Step 2: Implement workload verification and dual-read migration mode**

During expand phase:
1. validate scoped workload token when present;
2. allow legacy internal token only for explicitly marked compatibility callers;
3. record which mechanism authenticated each internal request;
4. reject ambiguous/conflicting dual credentials.

Do not remove legacy token in this task.

- [ ] **Step 3: Update frontend server-to-server callers**

`frontend/src/lib/api.ts` and channel gateway obtain a service credential through the server-only workload helper. No credential enters browser output.

Add tests proving:
- browser response/contract metadata contains no workload token;
- App/Site use distinct service IDs/audiences.

- [ ] **Step 4: Gate the DB role split**

Only create planned migration 243 if Test deployment can provision the new runtime role/credential without granting LOGIN passwords in migration.

DB acceptance:
- Economy execution role can execute only intended functions;
- it cannot mutate protected tables;
- App/Site web roles cannot execute policy apply functions;
- migrator ownership remains unchanged.

If deployment plumbing is not ready, leave DB role split for a later forward migration and keep function-level containment; do **not** fake the role change in documentation.

- [ ] **Step 5: Run security tests**

Run:
```bash
pnpm --filter backend test -- src/auth/guards/guards.test.ts src/core/config.test.ts
pnpm --filter frontend test -- src/lib/app-gateway.test.ts src/lib/site-gateway.test.ts
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git commit -am "feat(security): add scoped workload identity"
```

---

## Task 7: Create Economy Policy Registry v2 with explicit AI bounds

**Files:**
- Create: `backend/src/economy/economy-policy-registry.ts`
- Create: `backend/src/economy/economy-policy-registry.test.ts`
- Create: `backend/src/economy/economy-policy-executor.service.ts`
- Create: `backend/src/economy/economy-policy-executor.service.test.ts`
- Modify: `backend/src/economy/economy.module.ts`
- Create planned migration: `packages/database/migrations/244-economy-policy-registry-v2.sql`
- Modify: `backend/src/economy-auto-policy.db.test.ts`
- Modify: `backend/src/admin/economy.repository.ts`
- Modify: `backend/src/admin/economy.controller.ts`

**Interfaces:**
- Produces `PolicyRegistryEntry` with exact fields from v497:
  `policyKey, domain, unit, currentValue, humanBaseline, hardMin, hardMax, autoMin, autoMax, maxAutoStep, maxAutoDrift7d, maxAutoDrift30d, cooldown, riskTier, ownershipMode, requiredEvidence, requiredApproval, policyVersion`.
- Produces:
  - `computeEffectivePolicyDelta(entry, history, requested): PolicyDecision`;
  - `EconomyPolicyExecutor.apply(command): Promise<PolicyApplyReceipt>`.
- DB is the authoritative persisted registry/read history; TypeScript mirrors validation, not a competing source.

- [ ] **Step 1: Write failing unit tests for every initial v497 numeric envelope**

At minimum assert:
- cosmetic multiplier: ±1% step, ±3% 7d, ±5% 30d;
- non-essential service fee: ±0.5%, ±1.5%, ±3%;
- firm cost: ±0.5%, ±1.5%, ±3%;
- job reward: ±0.5%, ±1.5%, ±3%;
- shop restock: ±2%, ±5%, ±10%;
- NPC demand: ±0.5%, ±2%, ±5%;
- new contract spread: ±5bp, ±15bp, ±25bp;
- discretionary treasury weight: ±1pp, ±2pp, ±3pp;
- TRR center: ±2pp, ±3pp, ±5pp;
- tax/rate/credit-buffer are proposal-only;
- WLD issuance/retirement is strong-human-approval only;
- direct member balance, absolute stock price, history mutation and self-limit widening are prohibited.

Run:
```bash
pnpm --filter backend test -- src/economy/economy-policy-registry.test.ts
```

Expected: FAIL.

- [ ] **Step 2: Add Review Focus drift tests**

Test this exact failure mode:
- human baseline = 100;
- daily model asks for +0.5% repeatedly;
- per-step stays legal;
- once the 7d or 30d budget is exhausted, effective delta becomes 0 even if current value is used as previous-day input.

Also test:
- 24h cooldown;
- reconciliation fail => no apply;
- active security incident => no apply;
- stale policy version => no apply;
- concurrent apply conflict => one winner;
- missing rollback target => no apply.

- [ ] **Step 3: Write migration 244 as an expand migration**

Create/extend versioned registry/history tables without deleting old `economy_policy_knobs` yet.

Seed v497 entries exactly from the approved table. Human baseline is explicit and immutable except through a privileged baseline-reset function.

Add DB functions:
- read current registry;
- submit proposal;
- validate/apply bounded automatic change;
- human approve high-impact proposal;
- freeze/unfreeze by privileged actor.

Every function:
- `SECURITY DEFINER`;
- safe `search_path`;
- PUBLIC execute revoked;
- actor/service checks;
- append-only policy history.

- [ ] **Step 4: Implement executor service**

The executor:
- loads persisted registry/version;
- validates evidence/reconciliation/cooldown;
- clamps requested delta against all remaining budgets;
- submits exact value to the DB apply function;
- returns applied/proposal-only/frozen receipt;
- never lets model text choose a policy key outside registry.

- [ ] **Step 5: Update admin read/control surface APIs**

Admin controller/read model must show separately:
- current value;
- human baseline;
- proposed value;
- max step;
- 7d/30d remaining drift;
- ownership mode;
- evidence status;
- approval requirement;
- policy version.

No “average AI trust” scalar may replace these fields.

- [ ] **Step 6: Run unit + DB tests**

Run:
```bash
pnpm --filter backend test --   src/economy/economy-policy-registry.test.ts   src/economy/economy-policy-executor.service.test.ts   src/economy-auto-policy.db.test.ts   src/admin/economy-controller-guards.test.ts
pnpm --filter backend typecheck
```

Expected: PASS with real DB evidence for DB tests.

- [ ] **Step 7: Commit**

```bash
git commit -am "feat(economy): add bounded policy registry v2"
```

---

## Task 8: Convert the existing economy AI/council into proposal-only evidence

**Files:**
- Modify: `backend/src/economy/economy-ai-review.ts`
- Modify: `backend/src/economy/economy-ai-review.test.ts`
- Modify: `backend/src/economy/multi-agent-council.service.ts`
- Modify: `backend/src/economy/multi-agent-council.service.test.ts`
- Modify: `backend/src/admin/economy.controller.ts`
- Modify: `backend/src/admin/economy.repository.ts`
- Modify: `backend/src/scheduler/scheduler.ts`
- Modify: `backend/src/scheduler/scheduler.test.ts`

**Interfaces:**
- Consumes Task 7 registry/proposal API.
- Produces only `PolicyProposalEvidence` and `PolicyProposal`.
- Council labels:
  - `RULE_ENGINE`;
  - `MODEL_COUNCIL`;
  - `SIMULATED_COUNCIL`.
- No AI component exposes `apply()` or direct DB policy mutation.

- [ ] **Step 1: Write failing tests that AI cannot elevate authority**

Tests:
- aggregate `agree` cannot convert `PROPOSE_ONLY` to `BOUNDED_AUTO`;
- AI can return risk that causes `BOUNDED_AUTO -> FROZEN/REVIEW_REQUIRED`;
- malformed/out-of-range policy key/value is rejected before proposal persistence;
- model timeout/absence leaves deterministic Economy Core functional;
- simulated 14-agent council response is labeled `SIMULATED_COUNCIL`, not presented as independent live model approval.

Run:
```bash
pnpm --filter backend test --   src/economy/economy-ai-review.test.ts   src/economy/multi-agent-council.service.test.ts
```

Expected: at least one FAIL against current behavior/shape.

- [ ] **Step 2: Refactor AI review output to typed proposals**

Model output schema references only registered `policyKey`, requested delta/value, confidence, uncertainty, rationale, risks and evidence metadata.

Do not pass function names, SQL, account IDs, credentials or raw admin session into the model.

- [ ] **Step 3: Replace scheduler authority sequence**

New sequence:
```text
snapshot/reconciliation
 -> deterministic/classical proposal
 -> AI/model review or simulation evidence
 -> registry eligibility/clamp
 -> proposal persistence
 -> bounded executor only for BOUNDED_AUTO
 -> human queue for PROPOSE_ONLY/high-risk
```

Remove the assumption that AI review absence means the old independent classical mutation path may apply outside Registry v2.

- [ ] **Step 4: Run scheduler + AI tests**

Run:
```bash
pnpm --filter backend test --   src/economy/economy-ai-review.test.ts   src/economy/multi-agent-council.service.test.ts   src/scheduler/scheduler.test.ts
pnpm --filter backend typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git commit -am "refactor(ai): make economy intelligence proposal only"
```

---

## Task 9: Consolidate Stock AI and Work auto-tuning under the Policy Registry

**Files:**
- Modify: `backend/src/admin/ai-news.service.ts`
- Modify: `backend/src/admin/ai-news.repository.ts`
- Modify: `backend/src/admin/ai-news-controller-guards.test.ts`
- Modify: `backend/src/stock/market-events.test.ts`
- Modify: `backend/src/stock/stock-price-formation.engine.ts`
- Modify: `backend/src/stock/stock-price-formation.engine.test.ts`
- Modify: `backend/src/admin/operations.repository.ts`
- Modify: `backend/src/admin/operations.controller.ts`
- Modify: `backend/src/admin/operations-read-models.db.test.ts`
- Modify: `backend/src/scheduler/scheduler.ts`
- Modify: `backend/src/scheduler/scheduler.test.ts`
- Create planned migration: `packages/database/migrations/245-economy-automation-consolidation.sql`

**Interfaces:**
- Stock produces `MarketEventProposal`, never a published event directly from model output.
- Work produces `PolicyProposal` for registered work policy keys, never direct `admin_update_work_reward_policy` from auto-tune.
- Consumes Task 7 Policy Registry + Task 8 proposal/evidence API.

- [ ] **Step 1: Write failing stock safety tests**

Add tests proving:
- `autoGenerateAndPublish()` no longer publishes a market event from raw model output;
- model scenario with unknown/inactive symbol is rejected;
- AI requested event impact above ±2% is clamped/rejected according to registry mode;
- no model output can set absolute stock price;
- publication requires a signed/approved `MarketEventCommand` created after deterministic validation;
- AI/provider outage does not stop deterministic stock trading/price formation.

Run:
```bash
pnpm --filter backend test --   src/stock/market-events.test.ts   src/stock/stock-price-formation.engine.test.ts   src/admin/ai-news-controller-guards.test.ts
```

Expected: FAIL on direct-auto-publication behavior.

- [ ] **Step 2: Convert AI news auto path to proposal generation**

Rename/refactor the service path so the scheduler generates/stores a proposal and evidence only.

Keep legacy DB publish functions for historical/manual compatibility until the new approved command path is proven; do not edit migration 153.

- [ ] **Step 3: Write failing Work auto-tune tests**

Tests prove:
- `autoTuneWorkPolicy()` cannot directly call `admin_update_work_reward_policy`;
- work recommendation maps only to registered work policy keys;
- job reward change is capped at ±0.5% step, ±1.5% 7d, ±3% 30d;
- unavailable funding-source classification blocks reward auto-apply;
- manual admin update remains available through privileged path.

Run:
```bash
pnpm --filter backend test --   src/admin/operations-read-models.db.test.ts   src/admin/operations-controller-guards.test.ts
```

Expected: FAIL until auto-tune is proposal-only.

- [ ] **Step 4: Implement migration 245 as contract migration**

After shadow parity evidence exists:
- disable new calls to old independent auto-policy/direct auto-work/auto-stock apply paths;
- preserve historical tables/functions for audit/rollback as needed;
- add compatibility wrappers that either submit to Registry v2 or fail closed with an explicit superseded status;
- do not drop old functions in the same release unless zero callers are proven.

- [ ] **Step 5: Update scheduler jobs**

Replace:
- `stock.ai_scenario_auto` direct publication with proposal job;
- independent work auto apply with registry proposal;
- legacy economy auto apply with one registry executor schedule.

Keep reconciliation before policy apply.

- [ ] **Step 6: Run integration tests**

Run:
```bash
pnpm --filter backend test --   src/admin/ai-news-controller-guards.test.ts   src/stock/market-events.test.ts   src/stock/stock-price-formation.engine.test.ts   src/admin/operations-read-models.db.test.ts   src/admin/operations-controller-guards.test.ts   src/scheduler/scheduler.test.ts   src/economy-auto-policy.db.test.ts
pnpm --filter backend typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git commit -am "refactor(economy): consolidate stock and work automation"
```

---

## Task 10: Move the Android app to App Core v2 with deny-by-default generic writes

**Repository:** `wtrdd1-hash/woldeok-moneyverse-app`

**Files:**
- Create: `app/src/main/java/com/example/woldeokmoneyverse/data/remote/AppRouteManifest.kt`
- Modify: `app/src/main/java/com/example/woldeokmoneyverse/data/remote/ApiClient.kt`
- Modify: `app/src/main/java/com/example/woldeokmoneyverse/data/remote/MoneyverseApi.kt`
- Modify: `app/src/main/java/com/example/woldeokmoneyverse/data/remote/ApiContractCompatibilityInterceptor.kt`
- Modify: `app/src/test/java/com/example/woldeokmoneyverse/MobileApiContractTest.kt`
- Create: `app/src/test/java/com/example/woldeokmoneyverse/AppRouteManifestTest.kt`

**Interfaces:**
- App v2 base paths are `app-api/v2/**`.
- v1 compatibility interceptor remains only for explicit v1 fallback paths.
- `AppRouteManifest.isAllowed(method, path, isWrite): Boolean`.
- High-value request helper may attach integrity evidence but never treats it as user identity.

- [ ] **Step 1: Re-fetch Android main and create a fresh app branch**

Run on the app repo:
```bash
git fetch origin main
git checkout -b feat/app-core-v2-<next-version> origin/main
```

If local app checkout/worktree metadata is unhealthy, use a fresh clone/worktree from GitHub rather than repairing history in place.

- [ ] **Step 2: Write failing v2 contract tests**

Update `MobileApiContractTest` to assert:
- canonical auth/viewer/wallet/bank/work/stock/business routes use `app-api/v2`;
- v1 appears only in explicitly declared compatibility fallback;
- money amounts remain exact strings;
- money writes still include idempotency keys.

Add `AppRouteManifestTest`:
- unknown generic write denied;
- GET may be allowed only when manifest says so;
- APP-only route cannot point to `site-api`;
- admin route requires explicit admin classification;
- redirect/host checks remain enforced.

Run:
```bash
./gradlew testDebugUnitTest --tests '*MobileApiContractTest' --tests '*AppRouteManifestTest'
```

Expected: FAIL before implementation.

- [ ] **Step 3: Implement AppRouteManifest and v2 routing**

Use the main repo's generated channel contract as the source of truth. If code generation is used, generated Kotlin is checked for deterministic diff.

Do not leave universal POST/PUT/PATCH/DELETE as an unrestricted escape hatch: the helper must reject a method/path pair not present in AppRouteManifest.

- [ ] **Step 4: Restrict compatibility interceptor**

`ApiContractCompatibilityInterceptor` only transforms explicit v1 fallback calls.

A v2 response must already satisfy v2 contract; do not silently invent missing financial fields in v2.

- [ ] **Step 5: Add Play Integrity request-binding hook for selected writes**

The app builds the request digest using the server-documented canonical fields and sends integrity evidence only on routes whose manifest policy requires it.

Do not log tokens/digests that disclose sensitive payloads.

- [ ] **Step 6: Run Android tests**

Run:
```bash
./gradlew testDebugUnitTest
./gradlew lintDebug
```

Expected: PASS.

- [ ] **Step 7: Push the app branch and record exact SHA**

Do not promote/release the app yet. The Test backend must first support v2 and v1 compatibility simultaneously.

---

## Task 11: Security, real-DB, compatibility and failure-mode test campaign

**Main repository test scope:**
- `backend/src/economy-core-command.db.test.ts`
- `backend/src/economy-auto-policy.db.test.ts`
- `backend/src/auth/guards/guards.test.ts`
- `backend/src/scheduler/scheduler.test.ts`
- `backend/src/stock/market-events.test.ts`
- `backend/src/admin/operations-read-models.db.test.ts`
- `frontend/src/app/app-api/v1/[...path]/route.test.ts`
- `frontend/src/app/app-api/v2/[...path]/route.test.ts`
- `frontend/src/app/site-api/v1/[...path]/route.test.ts`
- `frontend/src/lib/session.test.ts`
- `scripts/check-channel-api-contract.mjs`

**Interfaces:**
- Produces exact-SHA acceptance evidence for Test promotion.
- No Production promotion occurs in this task.

- [ ] **Step 1: Run full repository static/unit gates**

Run:
```bash
pnpm api:contract:check
pnpm api:channel:check
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Expected: all exit 0.

- [ ] **Step 2: Run real-DB security/invariant tests on isolated Test database**

Required cases:
- direct protected table writes denied;
- forged actor context denied;
- wrong workload audience/scope denied;
- Test credential denied in Production-configured verifier;
- concurrent duplicate App/Site economic command settles once;
- different payload with same idempotency key denied;
- ledger debit=credit invariant;
- no unauthorized negative balance;
- tax goes 100% Treasury net reversal;
- policy apply blocked on reconciliation failure;
- AI cannot exceed registry bounds or widen them;
- legacy v1 and v2 produce equivalent economic settlement for selected shadow cases.

Expected: all PASS.

- [ ] **Step 3: Run prompt-injection/excessive-agency tests**

Inject model input that requests:
- tool permission escalation;
- direct balance mutation;
- SQL execution;
- policy-bound widening;
- arbitrary stock symbol/price;
- internal URL/metadata fetch.

Expected: model output can be stored as rejected evidence but no privileged action is executed.

- [ ] **Step 4: Verify session continuity across Test restart/cutover**

Before restart capture privacy-safe references for:
- browser session;
- native-compatible session;
- privileged reauth session.

After restart/candidate switch, use the same sessions without interactive login to verify:
- viewer/read;
- one safe state-changing CSRF flow;
- role/step-up continuity where applicable.

Expected: no deployment-caused logout.

- [ ] **Step 5: Test App v1 + App v2 + Site v1 concurrently**

Verify:
- old supported Android v1 calls still work;
- new Android branch v2 calls work;
- Site v1 works;
- web no longer relies on App v1;
- contract headers/capability metadata are correct;
- v1 usage telemetry is measurable for retirement.

- [ ] **Step 6: Test failure containment**

Prove:
- AI provider unavailable => ordinary wallet/tax/bank/settlement still works;
- App Core unavailable => Site Core cannot bypass it to impersonate App;
- Site Core unavailable => App Core remains isolated;
- Economy Core overload => high-value writes fail closed, no fallback writer;
- workload signing key rotation accepts intended overlap then rejects retired key;
- policy executor credential is absent from AI process/runtime.

- [ ] **Step 7: Record exact Test evidence**

Record:
- main/base/candidate SHAs;
- migration checksums;
- Test backend/frontend/app versions;
- DB role/grant snapshot;
- workload key IDs, never secret values;
- passed test commands;
- session-continuity results;
- reconciliation output;
- rollback target.

Commit evidence/docs only after all required gates pass.

---

## Task 12: Zero-downtime rollout, contract old paths, and finish documentation

**Files:**
- Modify after runtime proof:
  - `docs/api/channel-api-contract.md` + `.ko.md`;
  - `docs/operations/economy-core-runtime.md` + `.ko.md`;
  - `docs/mobile-api-runtime-contract.md` + `.ko.md`;
  - `docs/API_CATALOG_MASTER.md` + `.ko.md`;
  - current release/update/worklog/changelog files.
- Runtime contract migrations: only new forward migrations if a legacy function/role can now be safely retired.

**Interfaces:**
- Consumes accepted exact-SHA Test evidence from Task 11.
- Produces Production rollout with App v1 compatibility still present unless retirement criteria are explicitly met.

- [ ] **Step 1: Re-read latest authority and main immediately before promotion**

Run:
```bash
git fetch origin main
git rev-parse origin/main
git log --oneline <tested-base>..origin/main
```

If relevant code/planning changed, rebase/rebuild and repeat affected Test gates. Do not promote stale evidence.

- [ ] **Step 2: Expand Production first**

Deploy code/schema that supports:
- App v1;
- App v2;
- Site v1;
- legacy internal token compatibility where still needed;
- new workload identity;
- old policy data read compatibility;
- Registry v2 shadow/evaluation.

No destructive contract step yet.

- [ ] **Step 3: Switch traffic/ownership gradually**

Switch in this order:
1. Site web callers to Site v1;
2. new Android build to App v2;
3. Economy Core typed command adapter;
4. scoped workload identity for each internal caller;
5. low-risk Registry v2 BOUNDED_AUTO families;
6. proposal-only Stock/Work AI.

At every switch verify auth errors, reconciliation, latency, idempotency replays and rollback threshold.

- [ ] **Step 4: Verify Production after each switch**

Minimum:
- health/version endpoint exact SHA;
- existing sessions still valid;
- one safe App v1 write;
- one safe App v2 write;
- one safe Site v1 write;
- economy reconciliation PASS;
- no unexplained WLD delta;
- no P0/P1 security alert increase.

- [ ] **Step 5: Contract only proven-unused legacy paths**

Contract criteria:
- zero or explicitly accepted residual web App-v1 traffic;
- supported Android v1 population below approved retirement threshold;
- all internal callers on workload identity before legacy token removal;
- no scheduler/direct code caller for superseded auto-policy/stock/work mutation functions;
- rollback window expired with stable telemetry.

Use new migrations for revokes/drops; never edit applied migrations.

- [ ] **Step 6: Final full-site and mobile QA**

Run repository full-page QA inventory/ledger gates and Android test suite. Include every admin page and responsive checks required by Project Plan.

- [ ] **Step 7: Final reconciliation and release evidence**

Record:
- final Production SHA;
- database migration set/checksums;
- App release SHA/version;
- session continuity;
- WLD/ledger reconciliation;
- policy registry state;
- active workload identities;
- legacy compatibility state;
- rollback target and decision.

- [ ] **Step 8: Commit/push release documentation**

Create internal and GitHub update notes, bilingual changelog and worklog for the actual final implementation version(s).

Do not claim App v1/internal-token retirement unless measured criteria were actually satisfied.

---

## Program Execution Order

The execution order is strict:

```text
Task 1  Authority integration
  -> Task 2  Channel contract
  -> Task 3  App v2 + Site v1 BFF
  -> Task 4  Web migration
  -> Task 5  Economy command boundary
  -> Task 6  Workload identity
  -> Task 7  Policy Registry v2
  -> Task 8  AI proposal-only conversion
  -> Task 9  Stock/Work consolidation
  -> Task 10 Android App v2
  -> Task 11 Exact-SHA Test campaign
  -> Task 12 Zero-downtime Production rollout
```

Tasks 2-4 may be reviewed as one API-core program, but Task 5 must not begin until the public channel contract is stable enough to identify caller/channel metadata.

Tasks 7-9 must not enable automatic apply until Task 5 command identity, Task 6 service identity and reconciliation are proven.

## Branch and Version Strategy

At each task boundary:

1. fetch latest `origin/main`;
2. inspect relevant changed files;
3. allocate the next free project version;
4. create a fresh branch/worktree;
5. re-read current canonical plan/spec;
6. implement TDD red -> green;
7. create internal/GitHub update, changelog and worklog;
8. push branch and review;
9. merge only accepted work;
10. delete merged branch/worktree when safe.

The labels v499+ are a **planned order, not reserved numbers**. If another worker/Gemini uses a number first, choose the next free number and update records consistently.

## Plan Self-Review Result

- **Spec coverage:** all 37 v497 sections map to Tasks 1-12: API split, trust zones, identity, command envelope, DB roles, read/data classification, versioning, mobile integrity, service identity, authorization, admin approval, AI isolation, Policy Registry, numeric bounds, cooldown, stock/work/treasury/bank restrictions, abuse/SSRF/secrets/audit/availability, migration, security tests, release gates and P0 criteria.
- **Type consistency:** Channel route definitions feed both BFFs and Android manifest; Economy Command Envelope metadata feeds DB command identity; Policy Registry entries feed the single executor; AI/work/stock emit proposals into that registry.
- **Review Focus coverage:** main/migration drift Task 1/5/7/9; identity confusion Task 6/11; replay Task 5/11; AI cumulative drift Task 7; v1/session compatibility Task 3/4/10/11/12.
- **YAGNI:** Economy Core starts as a logical/internal boundary; no mandatory physical microservice split is scheduled until scale/blast-radius evidence justifies it.
- **Safety:** no direct AI money/price/history mutation, no protected BFF writes, no applied migration edits, no destructive contract step before shadow/Test/usage evidence.
