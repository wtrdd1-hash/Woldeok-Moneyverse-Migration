# Native frontend production cutover implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for implementation; read-only independent audits may use superpowers:dispatching-parallel-agents. Steps use checkbox tracking.

**Goal:** Promote the reviewed November18 native frontend through a protected exact-source isolated Test to an immutable Production generation, preserving member sessions and rollback.
**Architecture:** One Spring artifact serves the native frontend and its explicitly inventoried API scope. Build identity comes from packaged CI build metadata; runtime environment cannot relabel a JAR. Existing Production stays healthy during candidate verification. Isolated Test retains anonymous denial with scoped operator authentication.
**Tech Stack:** Java17/Spring Boot/Thymeleaf, Gradle Kotlin DSL, Node release probes, Debian systemd/Nginx/PostgreSQL.
**Spec:** docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md; docs/RELEASING.md; user approval for Production promotion and frontend transition on2026-11-20.

## Global constraints
- Preserve canonical integer strings, SECURITY DEFINER economics, append-only ledger/audit, current sessions and original Korean copy.
- Do not edit applied migrations, falsify historical checksums, fabricate ledger corrections or relabel old release roots.
- No credentials, private connection details, cookies or member identifiers in repository/GitHub/log output.
- Source main may advance; fetch before integration and verify merged-source checks.
- Exact-source Test, readiness, session continuity, actual changed-flow/security checks, rollback and applicable financial gates precede traffic cutover.
- Source scope is the implemented native pages plus compatible owned APIs; legacy gaps remain explicit, not falsely certified.
- Compare-and-swap the current host configuration hash before each change; store private backups outside repository.
- Default existing scheduled jobs remain compatible; Test/canary must explicitly disable all scheduled tasks and bot activity and bind sockets/HTTP to loopback.

## Review focus
- Missing/malformed build identity must yield503, never a marketing version mistaken for source proof.
- A runtime BUILD_ID override must not supersede packaged source metadata.
- Disabled scheduling must actually remove the scheduling processor despite the old unconditional EnableScheduling.
- Test operator credentials must never reach Production, redirects, repository or browser URLs; anonymous private Test data remains blocked.
- Unknown account openings and manual migration records must stay BLOCKED until supported corrective evidence exists.

### Task 1: Build-bound identity and quiescent candidates
**Files:** spring-backend/build.gradle.kts; domain/health/controller/HealthController.java; new domain/health/NativeBuildIdentity.java; new domain/health/controller/NativeReleaseController.java; MoneyverseSpringApplication.java; new config/SchedulingConfig.java; focused tests.
**Interfaces:** packaged BuildProperties sourceRevision, runtimeKind; GET /api/version and /frontend-version return matching id/source SHA with no-store; moneyverse.scheduling.enabled=false removes scheduled-task registration.
- [ ] Add failing HTTP/pure tests: exact40hex packaged SHA, absent/invalid identity503, environment-style overrides ignored, matching frontend/backend identities, no-store/no cookie; keep health liveness contract.
- [ ] Add failing context test: disabled scheduling has no ScheduledAnnotationBeanPostProcessor; default scheduling remains present.
- [ ] Generate build info using explicit build source property or CI GITHUB_SHA (unverified otherwise); use optional packaged metadata without inventing dev source identity.
- [ ] Move EnableScheduling into conditional configuration, default true for compatibility. Candidate flags explicitly false.
- [ ] Run focused RED/GREEN, ordinary full tests/bootJar and native/release/security guards; independent source review; checkpoint source and evidence.

### Task 2: Protected immutable isolated Test
**Files:** reviewed host-only unit/env/manifest and scoped Nginx Test configuration; repository ops/release/native-spring candidate/verification scripts only if required; tests for any reusable release logic.
**Interfaces:** immutable candidate JAR/digest/source manifest, private Test operator auth, isolated DB identity, fixed Test origin source endpoints.
- [ ] Verify signed/exact CI artifact SHA/digest; create a new immutable Test generation and preserve old config/unit/DB identity.
- [ ] Confirm disposable isolated DB provenance/migrations and private storage; existing Test lacks current parity. Do not mutate another workstream's Test DB blindly.
- [ ] Keep loopback ACL and add scoped operator authentication for external Test; allow only non-sensitive identity/readiness evidence as needed by reviewed gate, retain noindex and method restrictions.
- [ ] Start new loopback candidate with bot/scheduling off and source/manifest/JAR identity checks. Test reload of pre-existing signed-in session and owner/CSRF negatives on isolated accounts.
- [ ] Verify public origin through authenticated access, actual changed UI/receipts and backend readiness; never substitute a local Host-header probe for public Test evidence.

### Task 3: Resolve observed financial/provenance hard stops
**Files:** existing migration349 and read-only financial/source checks; corrective work requires a separate reviewed forward-only decision, not edits to historical migrations.
**Interfaces:** exact current application DB and role; readiness verdict; canonical source evidence for the unexplained member cash.
- [ ] Record actual ledger DML, all accepted-existing-DML exceptions precisely, the unexplained1,000,000WLD USER_CASH opening and manual346/definition drift.
- [ ] Trace account creation/funding/audit/fixture evidence read-only with member identifiers redacted; no synthetic balancing journal or silent balance overwrite.
- [ ] Exercise any proposed existing349 security repair/corrective path on an isolated restore with receipts, positive wrapper tests and negative ACL checks; review before any Production mutation.
- [ ] If authoritative funding/history cannot be established, retain the hard stop and present the concrete unresolved decision. Generic frontend promotion approval is not a financial integrity waiver.

### Task 4: Main integration and zero-downtime frontend transition
**Files:** current task worklog/QA receipt; approved runtime release manifest/unit/Nginx route scope; current runtime baseline only after observed cutover.
**Interfaces:** all prior gates PASS, exact merged source artifact, rollback healthy old generation and session continuity.
- [ ] Refresh main, merge reviewed changes without concurrent-work loss, run exact merged-source checks and build attested artifact.
- [ ] Prepare new immutable prod-vVERSION-SHA directory and loopback service; verify artifact/process/DB/config identity and duplicate-job suppression.
- [ ] Take current private backup/config receipt, prove rollback executable/target exists, preserve existing sessions.
- [ ] Compare current Nginx hash, nginx -t, graceful switch only inventoried approved native routes to the healthy candidate; preserve unrelated holds/upstreams.
- [ ] Public browser/API/assets/locale/owner/security/session checks and monitoring; rollback immediately if required checks fail.
- [ ] Record finished state with exact source/JAR/config/gates and open feature gaps; clean only proven integrated owned branches.

## Pre-flight / current facts
- Existing isolated task worktree retained; parent branch c7baa12070, main9635262fb2 at start. Previous functional173e7255c7 passed479Spring/270Node/9actualPostgreSQL cases and independent source reviews.
- Test403 is deliberate Nginx loopback ACL, verified by correlated access-forbidden log; no DNS/Cloudflare fault.
- Existing Production JAR has no git build metadata; frontend-version does not attest source.
- Actual Production financial gate BLOCKED (unwaived ledger DML, member cash projection without postings); migration346 manual checksum and salary definition drift. No production changes performed.
- Task1 identity feeds Task2/4 manifest/probes; Task2 Test and Task3 financial proof both feed Task4. No gate may silently substitute another task's result.

## Task3 refinement — confirmed repeat-issuance root cause
Source UserAuthService.register directly creates users/profile/credential/cash and writes1,000,000 into account_balances with no ledger. Observed owner/account/balance timestamps match this mechanism. Before candidate activation, add UserAuthRegistrationSafetyTest proving register fails closed503 before any JDBC or cookie interaction until a verified consent/age and canonical ledger-funded registration path exists (native UI already advertises registration unavailable). Remove the direct-write prototype method body rather than retaining a bypass. This prevents new unexplained openings; it does not authorize deleting/zeroing the existing member balance or certify financial readiness. Review source/runtime evidence and remaining historical decision separately.

## Task2 refinement — scoped Test CORS authority
Current hardcoded CORS list omits Test but includes Production regardless of configured origin. Configure the exact trusted app-base-url origin per process (plus existing www alias only for canonical Production), rejecting invalid/userinfo/query/path and nonloopback HTTP values. Test must accept Test origin without expanding Production cross-origin credential access. Pin both directions with NativeTestOriginCorsTest and Production negative regression; no wildcard expansion.

## Task3 immediate containment refinement
The active production JAR confirms the unjournaled signup seed. Independently review ops/nginx/native-registration-hold.conf; protect exactly both canonical local registration API aliases with503/private-no-store while keeping login/session/OAuth pages unchanged. Baseline safe empty-body registration requests (controller validates before database access) should fail the hold assertion with400; after reviewed CAS/nginx-t/graceful reload they must return503/code. This is reversible prevention, not financial acceptance, balance modification or final frontend promotion.

## CORS compatibility ruling after full regression
Retain the exact pre-existing Production CORS origins (canonical/www plus five prior localhost/loopback development origins), while a configured Test process accepts only its Test origin. Do not add Test to Production. The existing45 session/CSRF regressions intentionally exercise CORS-allowed localhost and still require the same-origin session guard to deny raw proof with structured403. This preserves the baseline rather than broadening authority or deleting the security regression; arbitrary configured origins remain canonical/validated.

## Task2 operator probe interface
Extend verify-isolated-test-public.mjs with optional --operator-auth-file /absolute/private.json; retain existing evidence criteria. Private file must be no-follow regular Unix file with no group/world access and purpose native-test-operator, exact Test origin and username native-qa. Credentials may be sent only to fixed Test GET/HEAD evidence paths, redirects forbidden; never send to Production or log header/file values. Existing anonymous mode remains unchanged/fail-closed. Add six red/green requester/credential boundary tests; no weakening of treasury/source/noindex checks.

## Owner scope change — public presentation first
Owner explicitly requested backend issues later and the implemented frontend first. Add a narrowly isolated presentation runtime selected only by a host JVM property. Import only UiLocale, pure home/tool/calculator/auth-markup controllers, packaged build identity and classpath resources; no component scan, datasource/JPA/JDBC, sessions, economic APIs, schedulers, sockets or bots. A real context regression must prove absent backend infrastructure and denied API/mutation routes before this runtime is used. Default backend startup remains unchanged.
Route only the reviewed public home/tool hubs/two calculators after Test; auth markup remains unpromoted until legacy login compatibility is verified. Use exact content-version routing for the3 changed shared assets; old/unknown versions retain legacy origins. Preserve all APIs/financial/admin HTML and two signup holds. Test identity for this phase is frontend-only; no claim of matching backend SHA, full financial readiness or entire native application promotion. Verify current API/hold fingerprints unchanged and retain scoped rollback. Financial repair,349,346 provenance and whole-application promotion are deferred.
