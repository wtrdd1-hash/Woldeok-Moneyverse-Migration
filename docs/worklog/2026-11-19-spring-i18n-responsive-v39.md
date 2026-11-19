# Spring 5-Locale Manual+Auto Picker & Responsive Contract — v2026.11.19.39.1

Date: 2026-11-19 KST
Status: STARTED in independent branch. NO TEST/PROD DEPLOYMENT.
Branch: feat/spring-responsive-five-locales-v20261119-39
Parent branch: feat/spring-violet-ui-clean-v20261119-38
Starting SHA: e4c26f5f2143ac2e740c8e0913c0960e23a51cd3
GitHub main at start: c131ef1039fddbba064e04a9c07bbba06e0a38a2

## START — before code
- User confirmed **entire PC+mobile responsive frontend**, auto-detected languages AND explicit manual selection, all 5 existing supported languages, Spring-only/runtime, and approved Production subject to real QA. User requested continued implementation, not just design images.
- Read master integrated plans and owner superseding Spring-only directive, AGENTS.md, frontend/locale.ts, frontend/language-switcher.tsx, v38 Spring-native shell and latest v38 source QA.
- Verified existing true locale enum: **en, ko, ja, zh, vi**. Old Next fallback is ko, but latest owner rule and concurrent Spring 8-page v38 plan require English default, Korean secondary; auto browser/Geo preference only in Auto mode, manual overrides saved in wdmv_locale.
- Concurrent independent owner branch feat/spring-responsive-i18n-ui-v2026.11.19.38 is actively writing `spring-backend/src/main/resources/static/index.html`, account/board/quests/shop/stocks/support/wallet/invest pages, scripts and its own 5-language dictionary. **Do not touch their owned files.**
- Scope in this stack: **Reusable Java Spring-native language picker** for actual Thymeleaf calculators/status/hub and Java admin renderer, in a standalone `/mv-spring/v39/` module and scoped stylesheet. Desktop/mobile accessible 44px controls, one chooser, cookie manual precedence, browser auto, English fallback, five choices and Auto.
- Native Spring calculator/admin business text currently only has EN/KO; cannot claim that JA/ZH/VI native business strings are fully translated. Explicitly show English fallback notice on these native pages; 8-page concurrent worker has separate full dictionary design.
- Write RED Node pure locale tests and RED JUnit markup/Spring HTTP/resource/CSP tests, then GREEN. No DB/ledger/financial values, session auth, Nginx, other workers' files, or public runtime changes.
- Need exact SHA Test/browser/real auth/security/rollbacks before any Production promotion; no false claims of full 180 page completion.

## MID — behavior, integration and TDD
- Rechecked public main c131ef1 and v38 stack SHA e4c26f5; peer eight-screen branch PR #3296 was active and has since committed its separate Home/Wallet/Invest/Quests/Shop/Board/Support/Account code. None of those static HTML or assets were edited here.
- Implemented pure core /mv-spring/v39/locale-core.mjs with supported en/ko/ja/zh/vi, browser language auto and English fallback, safe explicit/manual precedence and URL query/hash preservation. Node 7/7 GREEN after missing-module RED.
- Java native templates mv28 shared header, mv29 status, mv30 tools plus LiveAdminUsersPage HTML now link same-origin v39 CSS/JS and no-JS five-language fallback links. Admin CSP only script-src self; private auth/roles retained. Java initial four expected RED cases now GREEN.
- 390px popup originally overlapped the low mobile help-dock region; wrote failing CSS contract and moved the menu to mobile viewport top with safe-area constraints. GREEN.
- Found peer PR #3296 uses both wdmv_locale and wdmv_locale_preference localStorage; native component initially only used a cookie, which would revert manual selection. RED new test then GREEN after sharing the exact storage key and Auto reset policy.
- Isolated H2 random-port Spring HTTP 5/5 PASS (native EN/KO pages, JS actual MIME, CSS, guest admin 302). Independent localhost synthetic fixture real Chromium 10/10 PASS across 320/390/768/1440, manual/Auto/KO/JA/ZH/VI, Escape and no member API calls; this is UI control testing, not financial E2E.
- Final full Gradle clean test bootJar 262/262 PASS, 0 failure/skip. Jar SHA256 2f876f422d7b7ba97277a8b29634913857ec9b65dc36d0368b864dd2ebae7b0b.


## END — scoped implementation/release decision
- Source module, Java Spring shared templates/admin integration, Node/JUnit/Playwright synthetic QA, bilingual detailed planning/QA/changelog/public update and ignored local-only internal records ready for isolated stacked review PR.
- Historical 180-page design PNG matrix remains NOT CERTIFIED. Shared v39 module covers native Spring calculator, hub, status and admin shell; simultaneous PR #3296 covers eight member page families in separate sources. No double ownership or merge of unapproved historical local-main commits.
- 5 supported locales and explicit Auto/manual preference implemented in UI; native JA/ZH/VI body translations **not complete**. User original full-site target is only partially fulfilled.
- Real authenticated financial/ledger/quest/chat API E2E, current security baseline integration, public exact-SHA Test, global 180 route visual/browser parity, atomic rollback and Production promotion NOT RUN. No Nginx/DB/member/ledger/run process mutations; release HOLD.

## GitHub review handoff
- Isolated stacked DRAFT PR #3297: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3297 / based on Spring administrator PR #3295.
- Cross-member locale preferences with concurrent core-8-page PR #3296, zero overlapping owned static files.
- Changed 31 files, Node7/Java clean262/actual H2 HTTP5/fixture Chromium10 PASS; no main merge or Production deployment.
- Public current main and collaboration branches rechecked. Actual authenticated/ledger/all-180-browser/exact Test/rollback remain unverified, release HOLD.
