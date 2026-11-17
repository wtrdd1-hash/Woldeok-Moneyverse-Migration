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
