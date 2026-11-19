# Native Spring Five-Language Responsive UI QA — v2026.11.19.39.1

Date: 2026-11-19 KST. Worktree: feat/spring-responsive-five-locales-v20261119-39. Parent PR #3295; peer Spring core responsive member pages PR #3296. **No public Test/Production deployment**.

| Gate | Command / source evidence | Actual result |
| --- | --- | --- |
| Site locale inventory | `frontend/src/lib/locale.ts`, `language-switcher.tsx` | **en/ko/ja/zh/vi exactly 5**, browser auto + manual specification |
| JS TDD initial RED | `node --test src/test/js/mv39-locale.test.mjs` before module existed | Failing module import observed |
| JS pure core GREEN | same command after implementation | **7 PASS / 0 FAIL**, manual URL vs cookie precedence, browser/English fallback, query/hash preserve |
| Java TDD RED | `./gradlew test --tests ...SpringAdminFiveLocaleV39Test --tests ...SpringFiveLocaleResourcesV39Test` | **4 expected failures of 5** before real picker wired |
| Java TDD GREEN | same focused tests | **5 initial PASS**, real admin HTML+Thymeleaf and static CSS/JS contract |
| Mobile anti-collision RED→GREEN | Java scoped CSS assertion requiring mobile popup at top, not over bottom help | 1 expected fail, fixed; 320/390 mobile contract PASS |
| Cross-screen preference RED→GREEN | Detect peer PR #3296's `wdmv_locale_preference` localStorage vs manual cookie. Test failed until v39 synced this key and Auto reset | 1 expected fail, then PASS; no stale manual mode between member and native Spring pages |
| Spring real HTTP/H2 random port | `SpringFiveLocaleV39HttpTest` | **5 PASS**, actual calculator EN/KO page+picker, JS MIME text/javascript, CSS 200, anonymous /admin/users→302 |
| Final Java full clean build | `./gradlew clean test bootJar --offline --no-daemon -Dorg.gradle.workers.max=2` | **262/262 JUnit PASS, 0 FAILED, 0 SKIPPED**, JAR SHA256 `2f876f422d7b7ba97277a8b29634913857ec9b65dc36d0368b864dd2ebae7b0b` |
| Real Chromium locale/mobile harness | isolated localhost `src/test/python/mv39_local_test_server.py` + `src/test/js/mv39-browser.test.cjs`, Playwright 1.63 Chromium | **10/10 PASS**, 320/390/768/1440, no document overflow, no help collision, KO manual cookie+storage persisted across pages, JA/ZH/VI honest EN fallback, Auto reset, Escape, browser KO auto, no API requests/errors |
| Actual Production server | No production changes made | **NOT DEPLOYED**; build JAR only |
| Real authenticated member/admin/wallet/stock/ledger/chat | Not used in isolated fixture; peer PR #3296 used guest read-only Test only | **NOT CERTIFIED** |
| Full 180 screen new UI and full JA/ZH/VI translations | 8 member screen PR #3296 and native shared v38/v39 are subsets; legacy native text EN/KO | **NOT COMPLETE** |
| Official end-to-end exact SHA, SSL edge, Nginx, rollback | Not executed | **RELEASE HOLD** |

**Browser scope distinction:** The 10 Chromium tests are on a static synthetic test fixture loading the **actual v39** same-origin CSS/JS files and a simulated native HTML header. They establish real browser behavior/layout of the language control, NOT financial/authenticated functionality or deployed Java page pixel parity. Independently, the five random-port H2 checks exercise **real Spring HTTP/Thymeleaf**. These are separate layers; they must not be blended into false Production pass.

**Conflict/ownership:** PR #3296 owns `spring-backend/src/main/resources/static/index.html` and Home/Wallet/Invest/Quests/Shop/Board/Support/Account HTML and `assets/mv38`; v39 touches **none** of those. It shares only `wdmv_locale` and `wdmv_locale_preference` contracts, explicitly verified. Root and /stocks routing remain a separate parity problem.

**Decision:** Hold full Production promotion until current Spring security baseline, real authenticated sessions/finance/support/quest positive and negative tests, complete route QA, actual Chromium screenshot visual comparison and zero-downtime immutable rollback are checked. Existing running service, DB, ledger and Nginx were not modified.
