# v2026.11.18.2 — Complete Spring web migration and Production readiness attempt

**Status:** IN PROGRESS / NOT RELEASED · English canonical | [한국어](2026-11-18-spring-web-readiness-v2026.11.18.2.ko.md)

## BEFORE (recorded before running tests or changing code)
- Owner requests all frontend pages and backend on Spring and zero-downtime Production promotion. This is authorization to work; it is **not** evidence that security, finance, or release gates have passed.
- Source authority: latest origin/main `e96e8f81f4d6b99b221392a2b6fe46356361b145`, Living Project Plan and Integrated Planning Master (both v2026.11.17.5 RELEASE HOLD), AGENTS.md, documentation policy and Spring G0–G6 plans. Current candidate stacked on PR #3213 and #3253; independent worktree `feat/spring-web-readiness-v2026.11.18.2` HEAD `e569ba10aa5e50faa61e538673258c758a11cf7e`.
- Host evidence 2026-11-18 07:29 KST: dedicated mini-PC MCP works; Spring Java21 listens on :4550 and socket :9092; P0 Next admin recovery :4524 is running; public home/account-deletion/health returned 200 and admin returned 302; official test version returned 200. This proves availability only, not UI/API parity.
- Concurrent work observed: `feat/spring-web-frontend-v2026.11.18.0718` independently implements home/guide preview in its own clean worktree; PR #3252 owns P0 admin recovery. Do not edit their worktrees, restart services, change Nginx, move release symlinks or reuse their branches.
- Expected existing full migration inventory: 178 Next canonical pages and 124 Next route handlers; only optional noncanonical Spring previews from PR #3213/#3253. Spring security config permits all and disables CSRF in main; financial single-writer and authenticated negative E2E are not yet certified.
- Next: compile/test the isolated Spring frontend candidate, diagnose failures, add a narrowly scoped safe correction and tests if possible, re-read main SHA at midpoint, evaluate official Test gates. No live member financial writes. Promote only if exact source/frontend/backend/security/finance and independent restore gates pass.

## MIDPOINT
Pending measurement.

## CLOSEOUT
Pending measurement.

### 2026-11-18 07:33 KST — actual baseline run
- Actual isolated Java21 Gradle command: `./gradlew --offline --no-daemon --max-workers=2 -Dorg.gradle.jvmargs="-Xmx1024m -XX:MaxMetaspaceSize=384m" clean test bootJar`.
- **FAILED:** 116 tests / 1 failed (`Phase7IntegrationTest` line 40, ServletException/IllegalStateException) and 115 not reported failed; `compileJava`, `compileTestJava`, `bootJar` completed but the overall release gate failed. Parent is based on pre-fix main `2c1ea4cd77`, latest main incorporates engagement repair. This failure blocks a release; reconcile with latest main and rerun.
- Source counts remeasured 178 canonical Next page components and 124 Next API handler components, with no verified full SSR/BFF parity. Production Next recovery remains active.

### 2026-11-18 07:35 KST — reconciliation and second RED
- Merged latest authoritative main `e96e8f81f4...` into the isolated branch, resolving **two English planning-document conflicts** by preserving BOTH the latest main v2026.11.17.5 finance/security RELEASE HOLD and the owner-directed v2026.11.17.2 full-web scope; Korean current main planning unchanged. Merge commit `65cd987b78`.
- Reran full Java21 Spring `clean test bootJar`: **141 tests / 1 FAILED**, specifically `SpringWebPreviewDisabledTest` expected HTTP 404 but got **200**, with the legacy SPA resource fallback serving index for inactive `/spring-web` route. The earlier Phase7 failure was cleared by latest main.
- TDD GREEN candidate now adds conditional explicit 404 controller for OFF/missing Spring preview flag at `/spring-web` and `/spring-web/status`, with privacy/noindex headers; expanded the failing test to assert headers. This is preview-only and does not change canonical `/`, `/status`, Next, or Production edge.
- Independent route inventory test ran **4/4 PASS**, parity check PASS (178 Next pages, 124 BFF, 0 fully certified, 2 original Spring previews). Do not call full migration complete.

## CLOSEOUT — 2026-11-18 07:43 KST
- **Spring source GREEN:** latest-main integrated Java21 `clean test bootJar` succeeded. Parsed Gradle XML: **36 suites, 141 tests, 0 failures, 0 errors, 0 skipped**. Build JAR 94 MB; SHA256 at test source HEAD `0b83f52f6e42764ad6890289e077e8651141815c`: `268ce25a3eb37d6bc836f19497277abbf818c1ff90c34067a595f19cc4e7130b`. Later changes were documentation and route-inventory only.
- **Inventory GREEN:** RED test exposed an untracked third preview; fixed by additive `v2026.11.18.2` manifest and unit test. Python inventory `--check` and 4/4 tests pass; 178 canonical Next pages, 124 BFF, 3 preview-only Spring paths, **0 certified fully migrated**. Previous v2026.11.17.2 manifest retained.
- **Actual official edge probes 07:42 KST:** public Test `/api/version` HTTP 200 but reports generic `v2026.11.14-spring`, **not candidate SHA**; public Test `/frontend-version` **HTTP 502**. Production `/api/version` HTTP 200 with same generic v2026.11.14 Spring string; Production `/frontend-version` returned **HTTP 200 text/html with static `__next` loading-screen placeholder**, not JSON/version attestation. This fails full source-identity/frontend Test gate. `/health` at loopback Spring :4550 was 200; Spring and P0 Next admin recovery services remain active.
- **No official Test deployment or Production promotion**: 0 canonical UI or BFF routes certified; Spring global permitAll/disabled CSRF and finance/OTP/sessions/unverified WLD writes remain P0; no independent restore/rollback or full browser/Android QA. An all-Spring zero-downtime switch cannot be justified by these tests.
- GitHub isolated branch `feat/spring-web-readiness-v2026.11.18.2` pushed; draft stacked [PR #3255](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3255) targets #3253 (which targets #3213). Concurrent P0 admin recovery PR #3252 and home/guide worktree untouched.
- Scope rollback: branch-only code changes, preview flags remain OFF; no active binary, database or Nginx changes, so production rollback not required. Do not copy the candidate JAR to :4550 or stop the Next process before full G0–G6 gates.
