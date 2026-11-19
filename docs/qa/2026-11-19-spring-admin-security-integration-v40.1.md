# v2026.11.19.40.1 — Isolated Spring Admin + Member + Finance Security Integration (QA-ONLY)

**Source pair (pinned):** [Frontend/admin PR #3303](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3303) `23c6f43675fdebfe9afed6a6897f00f26fe91298` (includes member home #3301) and separate [security/finance PR #3302](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3302) `a04f3228f76166ce20c89a4bee69170a098e7919`. Neither is merged into main. **This is not an official release candidate SHA.**

## Integration procedure and observed results

1. Created detached mini-PC Test worktree `/srv/moneyverse-data/tasks/admin-member-ui-v2026.11.19.40/integration-qa` at security source SHA. No existing worker branch edited; no runtime/DB/Production write.
2. Ran `git merge --no-commit --no-ff origin/feat/spring-admin-member-unified-ui-v2026.11.19.40`. Exactly one **documentation** merge conflict in `DOCS_INDEX.md` due to both branches adding latest-version sections at the top; preserved **both** sections in the detached Test worktree and staged the resolution. **No Java, CSS, JS, or finance source merge conflicts**. No merge commit created or pushed.
3. Executed `spring-backend/./gradlew --offline clean test bootJar --no-daemon` on the combined source: **BUILD SUCCESSFUL; 253 tests executed, 0 failures, 0 skipped across 66 XML test suites**. Built JAR local SHA256 `934348fbea92665b03dac217663e2a1f13d96590508612a6ed65be7cc144a182`. The JAR was **not installed** on Test or Production.
4. Previous single-branch failures were preserved in the original v40 QA report: frontend-alone 247 tests/38 fail; security-alone PR #3302 reports 243/243 pass. The combined 253/253 pass is source-compatibility evidence only, not a user functionality attestation.

## Remaining release gates: BLOCKED

- Official public HTTPS Test `https://test.easy-scraping.com/api/version` returned **HTTP 403**: exact candidate source attestation and independent Test traffic fail. Never weaken access control for QA.
- Positive signed-in administrator with real DB role, CSRF/MFA, normal-user negative and cross-account 2-member financial real source/receipt comparison not verified for the combined source.
- Roughly 180 web routes and full admin workflow parity remain unverified; v39 security backend explicitly fails closed with HTTP 503 for missing authoritative functions, which is **not** implementation of those functions.
- Production source identity, Android gateway contract (where applicable but **no app work requested**), private/public cache proof, independent restore and monitored zero-downtime rollback not performed. Main and live Production stay unchanged.

**Decision:** integration unit/in-process Spring QA PASS; **full website functionality, real data financial E2E, official Test and Production RELEASE HOLD** until G0–G6/G442 evidence is collected. [Main v40 implementation QA](2026-11-19-spring-admin-member-web-v40.md) / [한국어 통합 검증](2026-11-19-spring-admin-security-integration-v40.1.ko.md).
