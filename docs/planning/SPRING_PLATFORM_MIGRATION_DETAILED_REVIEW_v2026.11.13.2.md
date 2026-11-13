# Spring platform migration — section-by-section review and implementation blueprint

**Version:** v2026.11.13.2 · **Date:** 2026-11-13 KST · **Status:** DRAFT / REVIEW REQUIRED / NO RUNTIME AUTHORIZATION
**Parent:** [Spring architecture v2026.11.13.1](../superpowers/specs/2026-11-13-spring-platform-migration-design.md) (open PR #3142); this follow-up review is stacked on that unmerged draft.
**Language:** English canonical · [한국어](SPRING_PLATFORM_MIGRATION_DETAILED_REVIEW_v2026.11.13.2.ko.md) · [Artifact/Artifactory lifecycle](SPRING_PLATFORM_MIGRATION_ARTIFACT_POLICY_v2026.11.13.2.md) · [Worklog](../worklog/2026-11-13-spring-migration-detailed-review-v2026.11.13.2.md)

> **Authority and approval:** This is an expanded, falsifiable proposal, not an accepted product decision. PROJECT_PLAN then INTEGRATED_PLANNING_MASTER remain authoritative; accepted source-specific decisions outrank both these draft pages. Do not infer Java development, DB changes, actual Test acceptance, production switching or NestJS retirement from documentation merges.

## 0. What was reviewed and what is missing

Verified at the mini-PC through the owner-preferred MCP against the 2026-11-13 origin/main SHA 90965f1dd84e272e757041eb9afd8a477699eb7c and parent Spring draft SHA 3a65b5e35b841da556f1543e5b6759af9b65d4c3. Files reviewed: AGENTS, documentation governance, release guide, living/integrated plans, parent design and task record, finance/treasury architecture, shared route map, NestJS package, Next server-only API helper, GitHub Actions CI/Test/deploy workflows and running host status. This is a **sampled architecture review**, NOT a completed machine-generated API inventory, money audit or complete application security assessment.

**Verified gaps / corrections:**

| ID | Parent section | Finding and severity | Required correction / evidence |
| --- | --- | --- | --- |
| R01 | 1 Scope | P0: “all backend” cannot imply zero JavaScript in the retained Next.js UI/BFF; Node bot exceptions are not predetermined | Explicit execution-boundary ownership and signed exception register; zero unmanaged legacy command owners |
| R02 | 2 Evidence | P0: release guide mentions v1550 while running service inventory includes v1546; host units alone are not edge truth | Resolve public Nginx upstreams, process executable SHA, manifest and actual DB role per environment at G0 |
| R03 | 2 Evidence | P1: parent snapshot claimed 0.8 GiB available at an earlier time; new observation shows 2.96 GiB available, 6.7 GiB swap used | Timestamped repeated measurements under real load; isolated capacity test before any always-on JVM |
| R04 | 3 Architecture | P0: route-matching rule, ownership switch schema, session and streaming/WebSocket mechanism are underspecified | Complete route ownership inventory, protocol parity fixtures, atomic switch with rollback and closed default |
| R05 | 4 Finance/DB | P0: generic “single writer” does not alone close retries/scheduler races across two runtimes | DB-enforced fenced epoch or reviewed equivalent, same idempotency namespace, DB actor-scoped functions, zero concurrent active mutation |
| R06 | 5 Security | P0: common cookie/session wording is not a session wire-format/CSRF proof | Golden request/cookie/DB fixtures; old-session restart; OAuth, OTP, Discord signature and authenticated Android tests |
| R07 | 6 Waves | P1: broad module buckets do not map every endpoint, action, job, consumer and integration | Machine-generated inventory plus human exception decisions, slice owner and exact-SHA acceptance evidence |
| R08 | 7 QA/rollback | P0: “rollback artifact” is not guaranteed by a GitHub Actions retention duration, OCI tag or historical changelog | Digest-resolvable artifact, SBOM/provenance verification, compatible DB/session, same-hardware dry-run restoration |
| R09 | 8 Operations | P1: artifact creation, registry governance, secret separation, GitHub/Artifactory decision and retention are absent | Adopt separate artifact policy after approval, explicit supply-chain ownership and release manifest |
| R10 | 9 Review | P1: architecture acceptance and permission to start implementation are conflated | Separate sign-offs: architecture -> G0 evidence -> G1 code -> slice Test -> explicit Production release |

**Observed as of inspection (not a live Production attestation):** Debian 13, OpenJDK 21.0.12.1, Mem total 8066 MiB/available 2960 MiB, swap used about 6700 MiB; active legacy/backend, frontend, Discord bot, economy AI and Test backend/frontend units exist. Root volume approximately 67% used and data volume approximately 42% used. GitHub repository is PUBLIC. Existing workflows already use GHCR, OCI digests, provenance/SBOM generation for images and 30-/90-day GitHub Action evidence retention; DO NOT claim that no artifact infrastructure exists. G0 must inspect actual registry reachability, retention/immutability and official Test/Production deployment path.

## 1. Owner scope and technology boundary — caution for parent §1

**Intended:** Java 21 + supported Spring Boot as authoritative backend/API/administration/job platform; preserve React/Next.js presentation and Android app; retain PostgreSQL as the only canonical settlement authority. Spring **does not translate browser JavaScript**, and Next.js server actions/BFF will still execute Node unless separately redesigned. Retire *NestJS backend* and unapproved Node command workers, not every .ts file in the repo.

**Detailed precautions and tasks:**
1. Write a role-specific runtime graph for Next.js SSR/BFF, NestJS, Spring, DB stored functions, Discord/Telegram bots, Socket.IO, AI/scheduler, Android, edge, backup and monitoring. Name the true executing process (not just folder).
2. Classify each source surface as MOVE / RETAIN-AS-CLIENT / REPLACE-PROTOCOL / EXCEPTION-APPROVED / RETIRE-WITH-EVIDENCE; require a reviewer, acceptance link and retirement date for every exception.
3. Inventory public, private and signed webhooks separately. Distinguish “100% backend routes mapped” from “100% commands and timers retired”; no route count is a completeness proxy for an operational feature.
4. Maintain independent frontend SEO, UX, accessibility and E2E regression ownership. Never promise zero TypeScript if Next remains.

**STOP:** any member, admin, financial or scheduler command lacking a sole named owner. **Done:** owner-approved per-process inventory and migration exclusions; absent this, scope is unresolved.

## 2. Authority, baseline and factual verification — caution for parent §2

1. Fetch latest origin/main **before, mid-work and before PR integration**. Compare not only Git HEAD but public ingress, immutable backend/frontend manifest, running PID cwd/executable, JDK, PostgreSQL role/DB, exact Test and Production endpoint fingerprints. Attach non-secret evidence hashes and UTC timestamps.
2. Examine current authoritative PROJECT_PLAN and INTEGRATED_PLANNING_MASTER, finance and treasury docs, current release guide, API contract, real bot timers/units and Android repo at its actual commit. Treat dated incidents, unreleased specs and historical v1550 labels as inputs, NOT current working proof.
3. Generate inventories from controller decorators, Nest modules, Next route handlers, Socket.IO namespaces, bot handlers, DB functions, systemd timers/cron, inbound webhooks, Android Retrofit and external commands. Diff against observed edge logs and route-map; annotate “not discovered”, “no consumer” and “dynamic route”.
4. Stage a read-only G0 topology report: public DNS/TLS -> Nginx exact locations -> upstream ports -> systemd unit/PID -> release manifest/SHA -> DB host/schema/role, with a separate Test chain. Do not infer public route ownership solely from active services.
5. Measure memory/CPU/GC/swap/Pg pool/disk under different time windows and peak jobs; an 8 GiB host with substantial swap usage is *a capacity risk, not a fixed proof of insufficiency*. Specify RAM headroom and load budget from reproducible measurements.

**STOP:** unknown public runtime SHA, DB identity or unreachable isolated Test. **Evidence:** signed-by-reviewer G0 topology + data-provenance/backup checklist.

## 3. Architecture, modules and route strangler — caution for parent §3

**Proposed deployment:** one modular Spring Boot service initially, Spring MVC/Servlet, Spring Security, JDBC access to approved PostgreSQL functions, Actuator/Micrometer, tracing; modular domain boundaries with strict inter-module interfaces. Avoid immediate microservice fanout. **Framework selection gate:** Spring Boot 4.1.2 is the stable baseline shown by official documentation on 2026-11-13; Boot 4.x uses Spring Framework 7/Jakarta EE 11/Servlet 6.1. Verify compatibility, CVEs and Gradle/Maven support again when G1 begins. Java 21 remains the initial toolchain; do not pick a release candidate or invent fixed performance superiority. Lock every dependency and wrapper in the reviewed G1 PR.

### Proposed Spring modules (bounded contexts, not individual deployables)

| Spring boundary | Primary responsibilities | Key caveat and negative check |
| --- | --- | --- |
| identity-access | Sessions, oauth, actor/consent, CSRF, OTP, roles | Reject old-session forgery and privilege escalation; compare old/new cookie bytes and TTL |
| community-content | Blog, publishing, support, board, content, SEO API | Preserve published URLs, visibility/advertising owner decisions, media rights and scheduler safety |
| member-engagement | Profile, work, chat, collections, club, notifications | Cross-user read denial; unread/read ordering, pagination, Socket.IO parity |
| market-game | Shop, stock, casino, marketplace, crafting, game-clock | Identify monetary side effects even for endpoints labelled “read” or “game” |
| financial-control | Wallet, bank, treasury, mint, central bank, NPS, SWF, bonds | DB-owned double-entry, one writer, actor-scoped execute-only role, no balance reset |
| admin-operations | Admin views and commands, QA, feature flags, audits | Step-up freshness/one-use OTP; high-risk commands fail closed |
| realtime-integration | Socket.IO transport, Discord, Telegram, Minecraft | Raw-body signature, reconnect/ACK behavior, protocol compatibility or explicit gateway exception |
| jobs-and-outbox | Timers, retries, public publishing, event consumer, alerts | Lease/fence ownership; distinguish at-least-once delivery from exactly-once business effects |

**Proposed layout (subject to G1 review):** a single spring-backend directory, Gradle wrapper, Java modules under app/domain/infra/security/contracts, one executable bootJar and optionally OCI image. Do not alter existing pnpm workspace, applied SQL, route-map or Next build semantics in a documentation PR.

**Route owner registry** required for every method + version + host + path + content type: original handler, new handler, client consumers, auth/CSRF, DB function, side effects, serializer, error mapping, feature switch, cohort, fallback, test ID, winner, last verified SHA. Exact-method/host matching precedes fallback; ambiguous or unmapped writes return controlled fail-closed rather than implicitly selecting a second writer. Nginx and Next BFF changes must be reviewed together.

**Shadow reads warning:** even a GET can count views, refresh sessions, touch outbox, lock rows or disclose PII. Only proof-backed, side-effect-free reads may be shadowed. Redact member payloads; use test fixtures for differential analysis where production data access is not authorized.

**Streaming/realtime:** a Spring HTTP controller does not itself speak Socket.IO wire protocol. Require actual JS/Android Socket.IO handshakes, reconnect, namespaces, ACK ordering and rooms. Keep a tightly scoped existing gateway under an owner-approved exception if replacement parity fails; do not claim pure-Java completion until that exception is closed.

**STOP:** route ambiguity, unreviewed client protocol change, data leak from shadowing or excessive memory/connection pools.

## 4. Canonical finance and database — caution for parent §4

**Never:** JPA schema auto-create/update, direct financial table INSERT/UPDATE/DELETE from the Spring app, Java-side balance calculation as authority, dual posting, SQL checksum edits, blanket EXECUTE/SELECT grants, negative money by accident, production account reset, log raw financial secrets. Spring data source is application-scoped with explicit limited DB role; read-only actuator and migration roles are isolated.

**Command flow** (existing DB function signatures take precedence):

1. Validate authenticated actor, permissions, consent, rate/limits, step-up and input at public boundary.
2. Preserve canonical monetary JSON type and string shape; avoid JS Number, Java float/double, unbounded parsing and locale conversions. Capture PostgreSQL microsecond timestamps without truncation and policy-defined UTC/KST instants.
3. Acquire **one** canonical idempotency owner across Nest + Spring and transactional DB fence/owner epoch if needed. The fence must reject a late old-runtime retry even after routing changes. Do not invent a second ledger store or use an in-memory JVM lock as cross-process protection.
4. Execute the **existing reviewed DB-owned function** under a minimally privileged role within required transaction semantics; database owns atomic ledger, balances, audit, outbox and receipt. Distinguish SQLSTATE authorization from genuine function/role missing grants.
5. Return the same response/error/replay contract to Next and Android; publish only committed outbox events; replay cross-runtime retries without duplicate economic effect.
6. Test two runtimes contending, lock-order deadlocks, timeouts after commit, partial network failures, idempotency key collision/actor mismatch, wrong recipient, zero/negative/max values, timezone boundaries and concurrent admin/automated commands.

**Required invariants at each financial cutover:** debit/credit balanced, no new orphan or duplicate receipts, unchanged member assets unless authorized transactions explain deltas, one authoritative transaction owner, actor scoped DB EXECUTE, 100% migration-checksum history agreement, backup separately restored. Evidence must be source-SHA and database-snapshot bound. Historically unresolved finance provenance may block G5/Production without blocking an isolated no-write G1 experiment.

**STOP / revert route:** any unexplainable ledger imbalance, funds delta, idempotency duplication or broader app privilege. Never rollback by deleting or reinitializing a live database; use approved forward-only corrections.

## 5. Identity, admin, API, bots and clients — caution for parent §5

| Surface | Exact parity assertions | Special danger / stop condition |
| --- | --- | --- |
| Web sessions | Cookie name/domain/path/HttpOnly/SameSite/Secure; DB-backed session ID, clock skew, refresh, logout, revoked sessions, old-session continuity | Session fixation, unauthorized renewal, invalidation on traffic switch |
| CSRF/CORS/BFF | Same-origin forwarding, double-submit/token binding where current implementation uses it; origin checks, per-method 403; no secrets in client bundle | Cross-origin write success or server-side proxy bypass |
| OAuth and social login | Callback/state/nonce verifier, provider errors, account linking, multiple-tab and expired session cases | Account takeover or accidental relinking |
| Admin | Fresh step-up for page and material command; Discord/Telegram OTP issued/expired/used-once, rate-limited/audited | Bypass on backend-to-backend call; **do not reinstate retired two-approver workflow** |
| Android | Retrofit method/URL/code/body/nullability, mobile deep links, auth token/session and retry, test/prod base URL | Wrong environment, incompatible serializer or mobile sign-out |
| Webhooks | Exact raw request bytes and signature, timestamp/replay window, source-IP policy only where appropriate, secret rotation | Signature verified after body mutation |
| Socket/Discord/Telegram/Minecraft | Namespace, handshake, ACK, reconnect, bot intents, command dedupe, scheduler and retries | Duplicate payout/event or loss masked by HTTP health |
| Public web/SEO | SSR HTML, sitemap/robots/hreflang, redirects, English/Korean, noindex/private caching, accessibility | Indexing of private pages or publication regression |

**Contract format:** keep original TS contract and route-map as frozen legacy evidence, introduce language-neutral OpenAPI + fixtures for Java, generate TypeScript/Kotlin client adapters only if deterministic and reviewed. Validate behavioral equivalence, not just generated types. One code equals one business meaning for 400/401/403/404/409/410/429/503. Preserve header/cookie/cache/idempotency/ordering semantics.

**Acceptance:** real browsers and the actual Android commit with expired credentials, invalid signature, OTP replay, forged actor and aged sessions. Not merely a Spring MockMvc green suite.

## 6. Migration waves: small implementation tasks and STOP gates — caution for parent §6

These phases are **sequential approval gates**, not delivery dates. Each slice uses its own issue/branch, exact source SHA, reproducible Test result and explicit Production decision; unapproved waves stay blocked.

| Stage | Detailed deliverables / outputs | Exit proof and STOP gate |
| --- | --- | --- |
| **G0 Audit** | Topology and DB authority map; generated route/method/job/consumer inventory; signed exceptions; baseline p50/p95/p99/CPU/RAM/swap/DB connections, financial audit, current backups and successful independent restore, edge version identity | All unknowns classified, actual isolated Test origin and credentials/ACL paths verified, public runtime and rollback target checked; no public Spring JVM |
| **G1 Foundation** | Java21 + reviewed Boot baseline, wrapper/dependency locking, immutable build, artifact policy, modules, auth/error adapters, test-only DB function caller, CI with SBOM/provenance, internal health/metrics, nonpublic Spring test service | Unit + real-PG authz/DB negative tests, contract harness, correct resource budget, exact-source Test-only probe; no production command |
| **G2 Safe public GETs** | Inventory-assigned stable public/read APIs; BFF route switch with owner registry; static page and Android parity, safe shadow diff | Side-effect audit of every GET, error/redirect/cache parity, permission probes, rollback under load; fail if any unexpected write |
| **G3 Identity/community** | Session compatibility, OAuth, privacy/consent, publishing/blog, support/notification command migration, admin read parity | Existing logged-in sessions survive switch/restart; 401/403/CSRF/OTP negatives; publication/outbox dedupe; real browser/Android E2E |
| **G4 Market/realtime/jobs** | Nonmoney market/game views, chat/socket gateway, signed bot handlers, outbox and timer owner registry, protocol-level client probes | One active scheduled-job owner, external message idempotence/ordering, no duplicate settlement; approved gateway exception if Socket.IO parity fails |
| **G5 Finance slices** | One by one: wallet -> bank -> nonsettlement market -> stock settlement -> treasury/mint/central-bank/NPS/SWF/bonds -> financial admin, *order re-gated by risk audit* | Each domain: matched DB function, privilege/ledger/receipt/cross-runtime retry proof, signed owner fence, independent restore, session and financial admin OTP, Test/Prod explicit approval |
| **G6 Retirement** | Entire route/job/bot/admin/Android coverage with evidence; 24h+ owner-approved observation, old writer keys revoked only after cutover, runbooks/on-call/rollback drills | No legacy Nest owner executes after retirement, all users/clients verified, supported rollback path retained; independent operational sign-off |

**Work package split:** WP0 source/edge inventory; WP1 capacity/build and release; WP2 router/schema/contract; WP3 identity; WP4 content/community; WP5 realtime/bots/jobs; WP6 game/market; WP7 finance per domain; WP8 legacy retirement/ops. Every WP begins with red test evidence, has a responsible owner and affects no unrelated files. No blanket “convert all 900 TypeScript files” task.

**Each slice must contain:** ID, owner, legacy paths, Spring paths, schema/functions, route IDs, client consumers, side-effect classification, permissions, feature flag, shadow eligibility, load envelope, exact tests, evidence URL, fallback route, kill-switch, artifact digest, release/test observation and state.

## 7. Testing, performance, rollback — caution for parent §7

### Minimum layered suite

1. **Static/schema:** source inventory delta, OpenAPI/JSON schema, machine-checked route-map, public/private endpoint classification, lint/compilation, dependency licensing and CVE review.
2. **Contract:** golden method/path/status/headers/content-type/cookie/body order/decimal timestamp fixtures for every migrated route, including malformed and malicious inputs.
3. **Security:** real DB restricted-role denial tests, forged session/CSRF, expired/replayed step-up, broken horizontal and vertical object authorization, webhooks, SSRF and private endpoint exposure.
4. **Finance/consistency:** real isolated PostgreSQL clone; concurrent Nest/Spring command replay, kill/restart between commit and ACK, transactional outbox, ledger balance and actor scopes.
5. **Client:** Next SSR/SEO, English/Korean, Android debug and supported version(s), bot real protocol simulators, Socket.IO reconnect and browser multi-tab.
6. **Operations:** exact-SHA health through real Test ingress, DB role/migration checksum, session continuity before/after JVM restart, observed latency/error p95/p99, GC/RSS/swap/Pg pool, failed deployment and rollback drill.
7. **Production:** only after Test and owner release approval; additive safe cohorts for reads, single-writer fenced switch for commands; full public and authenticated route QA and scoped financial audit.

**Provisional performance acceptance:** on comparable load, candidate p95 <= 110% of verified legacy baseline AND existing product SLO, with no unauthorized/error-rate/financial regression. Set absolute budgets and sample size in G0, not by guesswork. Assess p99, cold start, GC, thread/pool starvation, socket connections, swap activity and Test-host effects. No JVM in Production without measurable headroom for Node+PostgreSQL+bots or an approved isolated host.

**Rollback matrix:**

| Failure | Immediate action | Recovery proof |
| --- | --- | --- |
| Read route error/latency | Disable Spring read cohort, route back to **verified** legacy digest | Same-origin status/body/session parity; public edge identity |
| Command auth or finance divergence | Fence new commands and stop affected function, freeze promotion, investigate receipts and ledger | Single-active-owner proof; reconciled DB; signed incident report |
| JVM start / pool exhaustion | Keep previous healthy upstream active; release candidate stop and resource reclaim | Host health and next Test capacity pass |
| Schema/contract drift | Hold traffic, run forward-compatible remediation after review; NEVER blindly down-migrate live ledger | Exact checksum and restored backup rehearsal |
| Registry/artifact missing | **Block release** even if tag appears to exist | Download/pull by digest + provenance/attestation check + restore |
| Sessions/jobs/realtime regress | Return to known-good compatible backend and retained gateway, fence timer ownership | Old-session and socket reconnect continuity, one active job runner |

**Unproven rollback is a hard stop.** Healthy /actuator/health or a 200 home page is not proof that member financial, admin or Android behaviors work.

## 8. Team, documentation and multi-agent coordination — caution for parent §8

- Use source of truth precedence PROJECT_PLAN -> INTEGRATED_PLANNING_MASTER -> explicitly adopted domain spec. Architecture v1 and this v2 remain REVIEW/DRAFT until accepted. Preserve historical records and existing feature owner overrides.
- Gemini and GPT work only in task-owned branches/worktrees. Make a shared route/SQL ownership table; lease ownership on active files or coordinate explicit handoff. Never overwrite another worktree, force push main or amend another agent's commits.
- Re-fetch origin/main at task start, midpoint and final integration; compare baseline and re-review changed files/contracts. Stacked review PR targets the still-open v1 design branch, not main; retarget safely if v1 merges.
- Each meaningful checkpoint commits the worklog with before/mid/finished, internal and GitHub update records, English canonical + Korean, version and evidence. Do not edit approved/landed SQL migration checksums.
- A docs-only change is not a release. Keep source-SHA, app-source-SHA, image digest, DB epoch, Test sign-off and Production promotion records **separate**. Never start an automatic PROD release based on planning documentation.

## 9. Design decisions and explicit authorization — caution for parent §9

**Proposed for decision, not presumed:** modular Spring backend + strangler routing; Java21 and supported Boot4.x only after G1 compatibility spike; Next.js/Android remain; PostgreSQL DB-owned canonical settlement; one active finance writer; G0 and Test/restore gates; artifact governance as below.

**Unresolved items (design questions, not reasons to skip planning):** actual public runtime/manifest vs unit discrepancies; whether Spring should own Socket.IO protocol or retain a constrained transport gateway temporarily; host capacity and whether separate small VM/host is required; exact Spring Boot patch/Gradle version after a security review; GitHub Packages/GHCR vs optional JFrog Artifactory; all current bot and scheduler owners; finance source provenance blockers; real Test environment independence.

**Approval sequence:** (A) architecture/detailed-risk acceptance -> (B) G0 inventory and resource/backup evidence -> (C) G1 implementation PR + isolated Test -> (D) per-domain write/finance sign-off -> (E) zero-downtime Production cohort and rollback evidence -> (F) retirement approval. No stage approval implicitly authorizes the next.

### Traceability / evidence ledger template

| Field | Required value (must not be fabricated) |
| --- | --- |
| Slice ID and state | e.g. SPR-G2-READ-001 / DRAFT -> TEST_VERIFIED |
| Git identity | Repo, branch, 40-character source SHA, merge SHA |
| Artifact identity | OCI repo@sha256:digest and/or bootJar SHA256; SBOM/provenance |
| DB identity | Environment/role, migration-set hash, compatibility epoch, independent restore receipt |
| Contract | Method/path/consumer IDs, Java vs Nest golden fixtures, Android commit |
| Security | Actor scope, CSRF/OTP checks, dependency audit |
| QA | CI run URL, exact Test live route, sample size, negative and load results |
| Release | Routing cohort, health/latency/error results, owner decision |
| Rollback | Resolvable last-known-good digest, session/ledger compatible, exercised result |
| Historical status | BLOCKED/PLANNING/TEST_VERIFIED/PRODUCTION_VERIFIED only with evidence |

### Deliverables following this review (no implementation implied)

1. G0 audit scripts and reviewed inventory tables for routes + commands + jobs + bots + clients, with authority/status.
2. G0 host/edge and finance readiness assessment, independent restored production backup, documented rollback candidate.
3. G1 Java module and CI skeleton RFC with exact dependency/contract/DB-role selection; no code until approved.
4. Separate migration implementation specs per domain; each must include ownership, caution, tests, rollback and acceptance evidence.
5. [Artifact and Artifactory policy](SPRING_PLATFORM_MIGRATION_ARTIFACT_POLICY_v2026.11.13.2.md) covering reproducible JAR/OCI builds, manifest/digest, attestations, retention, signing and deployment/recovery.

## Reference floor

- Current project: [Release guide](../RELEASING.md), [Documentation policy](../DOCUMENTATION_POLICY.md), [Finance integrity](../architecture/FINANCE_INTEGRITY_CORE.md), [Treasury core](../architecture/TREASURY_CORE.md), [Parent architecture](../superpowers/specs/2026-11-13-spring-platform-migration-design.md).
- Spring Boot requirements: https://docs.spring.io/spring-boot/system-requirements.html ; migration compatibility: https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide .
- Supply-chain guidance: https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations and https://docs.github.com/en/actions/concepts/security/artifact-attestations .

**Review status: DRAFT; no app tests, Java build, DB migration, Test service rollout or Production release performed in this documentation change.**
