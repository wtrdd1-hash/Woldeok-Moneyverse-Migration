# FE-C support/chat locale contract regression — v2026.11.24.4

Status: **SOURCE TEST REPAIRED / TEST DEPLOYMENT HOLD / PRODUCTION UNCHANGED**. Korean: [한국어](2026-11-24-fe-c-locale-regression-v2026.11.24.4.ko.md). Date: 2026-11-24 (Asia/Seoul).

## Authority / isolation
- Verified current Migration main `9876c09888ec84034eec183cf1309c85df3d7447` (rechecked before and after work), Android app main `b6e9dda322ab7440567c0306295f3baf45067aeb`, AGENTS.md, integrated planning master, Nov18 five-language design authority, Nov23 v10 180-preview reference and latest FE/Gemini PRs.
- Branch `fix/fe-c-chat-locale-contract-v2026.11.24.0826`, isolated worktree, stacked on FE-C PR #3413 exact SHA `e6206a46df28c2da0c503f9b19cfe9f98e3be29e`. Only own test contract and these bilingual QA reports; FE-C source remains owned by #3413.
- Domain rules: support/chat manual `?lang=` request overrides persisted `wdmv_locale` cookie, which takes precedence over `Accept-Language` when no explicit choice is present. No authentication, finance, API, or source access policy is relaxed.

## Investigation and TDD evidence
1. Reproduced original failure (RED) on immutable FE-C commit: `./gradlew test --tests 'com.moneyverse.api.domain.web.NativeMessagingWebTest.nativeMessagingHasFiveLocalesPrivateHeadersAndSingularChrome' --offline` resulted in five cases, **four failed** at `NativeMessagingWebTest.java:63`: each request supplied a cookie for en/ko/ja/zh **and** contradictory explicit `lang=vi`, but incorrectly asserted that the cookie language won.
2. Corrected the existing cookie-only acceptance test to omit conflicting explicit `lang=vi`, preserving all its locale, alias, no-cache, CSP, renderer, and singular-launcher checks. Existing `SupportChatLocaleAliasTest` separately checks explicit user language precedence, including route aliases. Changes confined to `NativeMessagingWebTest.java`.
3. Targeted language and alias tests GREEN. Fresh `./gradlew clean test bootJar --offline --console=plain` = **PASS, 670 tests, 0 failed, 0 errors, 0 skipped** (105 result XML files), bootJar generated. Source candidate JAR SHA256 `bf4c2a978735e0ff8a5fd2b073f3d81ca73eeb8ebd686602e223148196b79c56`.
4. Started Test-only ephemeral Spring frontend-presentation canary on loopback :55446 pointing to Test source :55438. Actual GET: `/` 200, `/wallet` 302, `/support` 302, `/chat` 302; **/bank and /stocks 403**, plus /terms /privacy and jobs/quests/shop/blog 403. Canary was terminated. This **fails full Test deployment regression gates** and cannot replace :55440.
5. External existing Test HTTPS read-only smoke unchanged: root/terms/privacy 200, bank/stocks 302 to login; jobs/quests/shop/blog 403. Nginx config SHA256 `72c70184e2eca00f25f0f12c4e21dccb0c0f14d08f5c663374facbb3f1576c59`, unchanged. Test existing scoped frontend :55444 remains active.

## Root cause beyond the focused fix
- Current main removed bank/stocks routes from `UnifiedFrontendApplication` READS and `MemberPresentationPageController`; old live :55440 commit `6ed285862` still has their guest login redirects. Therefore replacing full frontend with a newer Jar would regress 302→403. No banking/stock capability was restored or exposed by this test-only patch.
- jobs/quests/shop/blog currently return empty-body 403 from existing frontend itself: they are **not validated functioning pages**. An upstream HTTP 200 from :55438 is not proof of feature implementation. Do not bypass auth, source truth, or scanner safety to force 200.

## Start / midpoint / finish + release controls
- **Start:** checked master, roles, current PR ownership, server split and exact source revisions; recorded original failure in server-local `/srv/moneyverse-data/tasks/test-fe-c-locale-20261124-0826/AUDIT.md`.
- **Mid:** saw RED 4 failures then GREEN; full 670 tests PASS; isolated loopback canary **caught** protected financial-route regression; checked remote main again.
- **Finish:** committed to new stacked PR for FE-C integration. No Nginx, shared Test, prod, DB, session or financial ledger mutation. Release: **HOLD** until FE-A/FE-B restore real page/controller contracts with positive/negative authenticated E2E, QA-1 finance audit, QA-2 real browser 180/240 acceptance and rollback. No overall frontend completion claim.

Internal update v2026.11.24.4: stale test assertion corrected, staged source candidate passes Java suite; full Test not promoted.
GitHub update v2026.11.24.4: bilingual QA evidence and isolated stacked PR; no automatic merge or deployment.
