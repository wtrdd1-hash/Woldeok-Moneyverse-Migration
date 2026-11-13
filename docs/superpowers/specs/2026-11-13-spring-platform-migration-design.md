# Platform-wide Spring Boot migration — architectural design (DRAFT)

**Planning version:** v2026.11.13.1 · **Date:** 2026-11-13 KST · **Status:** DRAFT / REVIEW REQUIRED / NO RUNTIME AUTHORIZATION

[한국어 설계](2026-11-13-spring-platform-migration-design.ko.md) · [Task worklog](../../worklog/2026-11-13-spring-platform-migration-v2026.11.13.1.md)

## 1. Owner direction, success, and scope

The owner requests a **systematic platform-wide transition from TypeScript/NestJS to Java/Spring Boot**. This design covers **every current backend/API, background worker, integration, administrator function, and scheduled subsystem**, including the exit of NestJS. It does not silently reinterpret "Spring migration" as "move the treasury only."

**Target:** Spring Boot is the authoritative application backend; existing browser pages remain Next.js/React/TypeScript initially, the Android/Compose client stays an independent app, and PostgreSQL continues to own canonical financial writes. Any separate initiative to replace React pages with Spring MVC/Thymeleaf requires a distinct product/SEO/UX decision; browser JavaScript itself cannot simply be replaced by Java bytecode. Existing JavaScript bots and build/ops scripts are included in the inventory and either moved to Java or retained through an explicit, owner-reviewed exception.

**Exit evidence:** every existing endpoint, operation, scheduled job, socket event, webhook, bot command, Android contract, and administrative action has a recorded outcome (parity-verified/explicitly retired); all authoritative writes have exactly one live owner; the Next/Android consumers work without NestJS; finance/security/rollback gates pass on actual Test and Production; NestJS and obsolete Node worker services can be stopped only after these checks.

This is **an architectural draft only**. No Spring service is scaffolded, no DB privileges/migrations are changed, no test service or production traffic is switched, and no feature is asserted working merely because it is specified.

## 2. Evidence and source-of-truth hierarchy

- At review start: `origin/main` commit `90965f1dd84e272e757041eb9afd8a477699eb7c` (2026-11-13). Files: `AGENTS.md`, `docs/planning/PROJECT_PLAN(.ko).md`, `docs/planning/INTEGRATED_PLANNING_MASTER(.ko).md`, `docs/RELEASING.md`, `docs/INFRASTRUCTURE.md`, `docs/architecture/FINANCE_INTEGRITY_CORE(.ko).md`, `docs/architecture/TREASURY_CORE(.ko).md`, `packages/contract/src/route-map.ts`.
- Tracked scope snapshot: `frontend/` 764 TS + 898 TSX; `backend/` 900 TS, with 89 controller and 52 service files; `packages/database/migrations` 345 tracked files. These are file counts, **not** endpoint coverage or proof of correctness. Backend folders include account/activity/admin/auth/bank/blog/board/business/casino/central-bank/chat/club/collection/content/crafting/discord/economy/engagement/game-clock/health/help/lobby/marketplace/mint/notification/privacy/profile/scheduler/security/seo/shop/stock/support/telegram/wallet/work and other modules.
- Existing architecture: browser -> Next.js BFF (`frontend/src/lib/api.ts` is server-only) -> NestJS -> PostgreSQL `SECURITY DEFINER` functions; important externally reachable exceptions are Socket.IO and signed Discord interactions. Canonical DB function ownership/append-only ledger must remain intact. `packages/contract` supplies shared TS types, but **runtime** validation and independent Java contract generation are necessary.
- Android repository `wtrdd1-hash/woldeok-moneyverse-app` has an Android Compose application with Retrofit/OkHttp and Socket.IO client dependencies (verified from current `app/build.gradle.kts`). The mobile repository/contract and debug/release endpoints must be tested separately; a stale local Android checkout is not authoritative.
- Deployment descriptions conflict: `AGENTS.md` describes Kubernetes/Flux, while `docs/RELEASING.md` describes immutable Debian systemd/Nginx Test/Production generations. A mini-PC systemd listing confirms services exist but does **not** establish which stack is publicly authoritative. Gate G0 must map actual ingress, DNS, certificates, test origin, service PIDs, immutable artifacts, namespaces, access permissions and rollback targets before choosing a deploy path.
- Mini-PC observed roughly 7.9 GiB total RAM, 0.8 GiB available and 6.5 GiB used swap; Java 21 is installed. **No new persistent JVM in Production until memory budget and isolation are established.**
- Historical planning records report failing QA and finance/treasury identity/provenance gaps; these are investigation blockers, **not a fresh certification** or proof of loss. Current main may have progressed after these records. Re-run all affected checks at the exact candidate SHA.
- External reference floor (verify versions and dependencies again at implementation): [Spring Boot requirements](https://docs.spring.io/spring-boot/system-requirements.html), [Spring Security CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html), [Spring transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html), [Micrometer observability](https://docs.spring.io/spring-boot/reference/actuator/observability.html), [Spring Modulith modules](https://docs.spring.io/spring-modulith/reference/fundamentals.html).

## 3. Options and architectural decision

| Option | Advantages | Key risk | Decision |
| --- | --- | --- | --- |
| Big-bang full rewrite including web UI and DB | One eventual language/server | Breaks member sessions, SEO, finance, support and recovery together | **Rejected** |
| Dozens of Spring microservices immediately | Independent scalability | 8 GiB host, cross-service transactions, operational/observability overhead | **Rejected as default** |
| **Spring Boot modular backend with strangler routing** | One deployable boundary initially, contract-level migration, reversible slices, eventual NestJS retirement | Temporary dual stacks and route ownership management | **Recommended for review** |

Start Java 21 plus a supported stable Spring Boot release selected by a dependency/security audit, Spring MVC as default request model, Spring Security, JDBC for approved stored-function calls, Flyway/Liquibase **not** allowed to take ownership of existing applied migrations, Actuator/Micrometer and OpenTelemetry-compatible tracing. Spring Modulith is a **candidate** module-boundary checker, not required until proven useful. Build with Gradle or Maven only after matching host/CI capacity and current repo conventions. Keep one Spring deployable initially, not an unbounded microservice fleet.

### Target request/command flow

```text
Browser / Android / approved integrations
     |             |
 Next.js BFF       Android app gateway contract
     |             |
 Allowed private routing / ingress (not an open public Nest/Spring prefix)
     |-------------|-----------------------|
 NestJS (legacy route owner)      Spring Boot (migrated route owner)
     |                             |
     |-----------------------------|
                 |
       PostgreSQL restricted function API
       append-only double-entry ledger + audit + outbox
```

A route is owned by exactly one backend at a time. Shadow traffic is **read-only** and must not execute commands, touch counters, dispatch notifications or leak member data. A BFF routing feature switch is keyed to endpoint/domain and includes rollback without browser-visible URL changes. The same-origin HttpOnly session and internal-only API token boundaries remain; Android/gateway authentication contracts are explicitly versioned.

### Module and source mapping

| Target Spring module | Current boundaries (non-exhaustive) | Migration mode |
| --- | --- | --- |
| identity-access | `backend/src/auth`, `account`, `security`, `privacy` | Contract/session parity first; admin step-up later |
| community-content | `board`, `blog-editorial`, `content`, `seo`, `support`, `help` | Public reads, then authenticated writes and publishing |
| member-engagement | `profile`, `activity`, `work`, `engagement`, `progression`, `collection`, `club`, `chat` | Low-risk read -> guarded command |
| market-game | `shop`, `stock`, `marketplace`, `business`, `casino`, `crafting`, `game-clock` | Nonfinancial views first, ledger-sensitive operations last |
| financial-control | `economy`, `wallet`, `bank`, `mint`, `central-bank`, treasury, sovereign funds, pension, bonds | Last; one DB-ledger authority |
| admin-operations | `admin`, `notification`, feature switches, QA, telemetry | Full permission matrices, OTP/reauth and audit parity |
| realtime-integrations | `lobby`, `discord`, `telegram`, current `bot/`, Minecraft links | Signature/Socket.IO/event-protocol compatibility |
| batch-schedulers | `scheduler`, Discord outbox worker, blog publication, economy AI and host timers | One active leader/lease; migration by job, not by all jobs at once |

Each module's implementation spec must enumerate imports, endpoints, SQL function names, authorization guards, event consumers, timer owners, feature switches, failure modes, expected payloads, Android consumers and acceptance tests. No undocumented "automatic conversion."

## 4. Financial and DB invariants (hard stops)

1. **Preserve PostgreSQL as the financial source of truth.** Never move ledger mutation into JPA entity `save()`; only approved migration-owned `SECURITY DEFINER` wrapper functions may post canonical transactions. No direct table write grants, no disabling auditing, no DB initialization by Spring/Hibernate. Application role is narrowly EXECUTE-scoped; measure actual grants in each environment instead of assuming AGENTS' historical snapshot is live.
2. Preserve double-entry debit=credit, per-account nonnegative restrictions, account lock ordering, single-transaction outbox, append-only ledger/audit, and compensating entries for correction. **Never delete or reset members' balances.**
3. Every financial command must preserve existing idempotency-key acquisition/locking/replay/actor ownership ordering, including concurrent retries across the NestJS and Spring transition. **No dual writes, no split ledger master.** Use a domain-level fenced single-command owner for cutover; record evidence of stale owner rejection.
4. Monetary values round-trip as signed canonical base-10 integer strings through JSON and DTOs. In Java use `BigInteger` (or appropriately constrained precise integer representation) and explicit serializers, never floating-point money or silent BigDecimal rounding. Preserve PostgreSQL microsecond timestamps/UTC and KST boundary policy.
5. Preserve SQLSTATE -> HTTP/JSON contract from `backend/src/core/pg-error.ts`, including intentional `42501` denials versus actual missing grants; preserve 400/401/403/404/409/410/429/503 behavior and fail-closed handling. Require real PostgreSQL concurrency, privileges, negative tests and replay reconciliation.
6. Database changes are exclusively forward-only, checksum-verified, reviewed migrations in the canonical `packages/database` sequence. Coordinate with Gemini/other branches, never reserve conflicting numbers or rewrite applied SQL. Spring schema generation remains disabled.

## 5. Auth, admin, integration and client parity

- Session validation must honor existing cookie name/domain/path/SameSite/Secure/HttpOnly, server-side session schema, expiry, renewal, logout, consent, actor binding, CSRF and internal token. No session invalidation during route cutover. Validate OAuth callback, reauthentication, admin roles and **Discord/Telegram one-time/second-factor flows as actually implemented**, not merely planned. Do not revive retired two-person approval.
- Authentication/authorization and audit checks are mandatory at the Spring boundary **and** in DB permission-aware functions. Financial admin writes need fresh step-up and anti-replay; preserve failure behavior for missing OTP and spent codes.
- Signed Discord webhook verification must use unchanged raw bytes and timely validation; public ingress stays exact-match, rate-limited and signature-validated. Telegram command/callback, bot process state, Minecraft hooks and outbound alert secrets are separate compatibility tests.
- Socket.IO wire protocol, namespaces, reconnect/acks, auth/session cookie and room semantics need protocol-level tests against browser/Android before retiring the old Node endpoint. If Java cannot meet parity at reasonable cost, an explicit exception must preserve the current gateway until an approved successor exists.
- The same route-map and OpenAPI/API contract must drive Nest+Spring+Next+Android parity fixtures. Run tests on existing clients before any server cutover. No accidental exposure of internal credentials to browser bundles.
- SEO public SSR/ISR HTML, Korean copy, noindex/no-store for member/admin pages, i18n English canonical + Korean, keyboard/mobile behavior and published blog URLs are unchanged without separate product approval.

## 6. Sequenced migration waves and stop gates

The dates below are **order**, not a delivery promise. Each wave requires its own reviewed spec, user approval, small tasks, TDD, Git branch/PR, CI, exact-SHA isolated Test, backend/DB runtime checks, and zero-downtime Production promotion only after the evidence gate. Re-fetch `origin/main` at kickoff and halfway through each wave.

| Wave | Scope and deliverable | Exit gate |
| --- | --- | --- |
| **G0 — Audit & recovery prerequisite** | Full API/route/worker/bot/Android matrix; database ACL + migration checksum + ledger reconciliation; actual deployed SHA/topology; backups, independent restore; baseline latency/RSS/CPU/disk; Test ownership and budget | All finance/source/identity unknowns inventoried; unresolved financial provenance or identity blocks G5 and Production, while isolated no-write G1 testing can proceed if its own security/Test prerequisites pass; reproducible baseline and real Test route |
| **G1 — Java foundation** | Approved Java/Spring baseline, module boundaries, constrained DB role, exception and contract mappers, build/CI, secrets, health/readiness, metrics, feature switch, test-only deployment | Isolated health+PostgreSQL function integration and request/auth contract tests; no public write or production JVM |
| **G2 — Public/nonfinancial reads** | Move static public API reads/help/content/status and selected safe member GETs behind BFF strangler routing | Snapshot/contract parity including 401/404/503, caching/SEO, Android probes, rollback switch |
| **G3 — Auth & community commands** | Account/session/consent and community/blog/help/support writes, publishing, privacy; admin read and audit probes | CSRF/OAuth/session continuity, permission negatives, no duplicated publication/outbox; E2E client parity |
| **G4 — Games, realtime, jobs and integrations** | Shop/game/marketplace nonfinancial flows, sockets/chat, Discord/Telegram/Minecraft, notifications; scheduler/outbox/job leaders | Signed webhooks, socket/mobile parity, at-most-one active scheduler owner, no lost/duplicate delivery or settlement |
| **G5 — Finance commands, domain by domain** | Wallet, bank, stock settlement, treasury, mint, SWF, pensions, bonds and financial admin commands through same canonical SQL functions | 0 divergent ledger postings and orphan/duplicate receipts under concurrent retries, privilege and nonnegative invariants, source/treasury provenance certified |
| **G6 — Full cutover & legacy retirement** | 100% endpoint/job inventory covered, terminate NestJS ownership and obsolete Node services, update runbooks/docs, final QA and recovery drill | 24h+ approved observation with stable KPIs, rollback artifact, exact SHA/cookie/DB attestation; signed owner approval for retirement |

Subproject/spec split after owner accepts this architecture: (A) inventory+platform/security+deployment; (B) public/community/auth; (C) realtime/bots/schedulers; (D) game/market; (E) finance/treasury/admin; (F) final cutover and operations. Each yields its own versioned design -> implementation plan -> scoped PR; none is silently authorized by this high-level draft.

## 7. Verification, SLOs and rollback protocol

**Before switch:** current source of truth in DB, exact backend & frontend hashes, real Test web URL and isolated DB snapshot, production backup restored independently, SQL function privileges, webhook secrets, session parity and reverse proxy route ownership verified. Existing failing tests are triaged; no blind "known failure" waiver. Document 5 full end-to-end routes sweeps per current full-route QA policy, including admin.

**Contract suite:** route/method/status/header/body parity fixtures for all inventoried endpoints and Android clients; 401/403/404/409/429/503, wrong actor, forged/missing CSRF, invalid signatures and expired/consumed OTP. Compare valid business results under identical DB snapshots; simulate partial network failures/restarts. Database integration uses real PostgreSQL (not mocks only), tests concurrent writes, read-after-write, retry, transaction rollback, idempotency and ledger immutability.

**Performance:** measure legacy p50/p95/p99, SQL and JVM time, GC pauses, RSS, startup, event-loop/scheduler lag and connection pools on the same hardware and traffic envelope. Proposed provisional gate: Spring candidate p95 ≤ 110% of verified legacy baseline **and** product SLO; zero error-rate regression for financial commands. Set final request budgets from G0 data, not fabricated numbers. Hard capacity limit: no additional always-on heap/pool that drives host into swap exhaustion; run load in isolated Test and right-size the host or reject the wave.

**Traffic:** shadow reads -> guarded Test -> internal preview -> small production read cohort -> progressively larger cohorts. Writes switch only after legacy owner is fenced and new owner proven, with idempotency key continuity; **never simultaneous active writers**. Start each cohort with immutable artifact IDs and rollback endpoints. Hold during dependency/schema inconsistency.

**Stop immediately** on any finance ledger divergence, extra privileges, unauthorized data visibility, session loss, admin bypass, duplicate job ownership, failed restore, missing runtime identity or unknown deployed artifact. For nonfinancial routes, set quantitative error/latency thresholds in G0 based on observed SLOs and stop/rollback if exceeded. No data reset as a rollback tactic. Rollback switches route back to a retained **verified** NestJS artifact; database changes remain backward-compatible; ledger corrections require forward compensating entries.

## 8. Change management and cross-agent protocol

- English is canonical; Korean is the second maintained language. Living authority: `docs/planning/PROJECT_PLAN.md` -> `INTEGRATED_PLANNING_MASTER.md` -> accepted detail designs. This document is **a candidate detail design** until reviewed.
- All tasks have `docs/worklog/` before/in-progress/finished states, planning version, internal and GitHub-facing changelogs, isolated branches/worktrees, minimal PRs and reviewers. Check Gemini/current PR/branch ownership before editing shared files. No concurrent modification of the same SQL migrations or route ownership.
- For runtime work, maintain exact-SHA test and production attestation, auth/browser/Android E2E, DB negative tests, independent backups/restores, Nginx/edge canary, 0-downtime switch and rollback verification. Repository documentation-only PRs **do not** deploy application candidates.
- Existing `AGENTS.md` vs `docs/RELEASING.md` topology conflicts are explicitly **UNRESOLVED**. Confirm the true authoritative live path instead of choosing either source by assumption.
- Stage-specific planning versions increment when designs change; runtime release version is distinct and minted only after its actual candidate and verification. No fabricated test/deploy status or GitHub Release.

## 9. Acceptance decisions / review gate

**Recommended:** adopt a Spring Boot *modular backend* as the eventual single application API platform, without converting the Next.js presentation layer or the PostgreSQL financial engine. Preserve optional native Java integrations only when compatible; no direct in-place production replacement.

**User review required before implementation-plan work:**
1. Confirm that "full Spring transition" means complete backend, batch, admin, bots/integrations while **Next.js UI and PostgreSQL ledger remain**.
2. Accept the staged Spring-modular/strangler path rather than a big-bang rewrite or dozens of microservices.
3. Accept strict **finance last**, single active writer, no production DB reset, real Test/restore gates and explicit stop/rollback.

Once approved, create **separate** detailed implementation plans for G0 and G1 first using `skills/writing-plans/SKILL.md`; all later waves require separately approved domain designs and no implied deploy approval.
