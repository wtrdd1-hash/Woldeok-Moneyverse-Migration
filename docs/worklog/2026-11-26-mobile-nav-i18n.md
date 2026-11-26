# Mobile full menu and five-locale shell (NAV-01 / I18N-01 / I18N-02) — v2026.11.26.1700.1
**English canonical** | [한국어](2026-11-26-mobile-nav-i18n.ko.md)

Branch `fe/mobile-nav-i18n-20261126`, stacked on `perf/backend-capacity-20261126` (#3462). Source of the defects: PR #3453 (documentation only, other agent; read, not modified). Base main 1df1150e97.

## Before work
- Owner orders v1606.1 and follow-up: implement NAV-01/I18N-01/I18N-02 after an ownership check; memory constraint — builds/tests and browser QA run sequentially after measuring free RAM.

## Done (code)
- I18N-02: `DEFAULT_LOCALE` is English; supported/locale-switcher order EN, KO, JA, ZH, VI. Detection precedence unchanged (explicit choice, then GeoIP/browser; Korean GeoIP or browser preference still selects Korean). Crawlers now receive English on unprefixed URLs (was Korean).
- I18N-01: navigation, dock, sidebar, top bar (search, notifications, brand), shell (skip link, policy footer) and the home page body read from catalog keys with all five languages; Korean values are the existing product copy. Page titles follow the selected language.
- NAV-01: a persistent "All menus" button in the mobile top bar opens the same role-filtered menu as the desktop sidebar (administrator entries only for verified administrators; the API still enforces RBAC). The five quick tabs remain; search stays separate.
- Tests: new navigation localisation tests (catalog completeness for every nav/shell/home key in five languages, dock labels, page titles, switcher order); tests that asserted Korean copy now declare the Korean locale explicitly (`renderKo`), tests that encoded the Korean default now encode the English default, home source tests check the catalog keys and the unchanged Korean values. Frontend 623 files / 3,247 tests; typecheck clean; ESLint on changed files: 0 errors (1 pre-existing warning).

## Not done / blockers
- Browser QA (320/390 px and desktop, five locales, guest/member/admin, hydration, switching) — next, run sequentially when memory allows; official Test publication HOLD (no designated publisher/common lease).
- Remaining Korean literals outside the shell and home (other pages) are not covered by this change; the full route × locale matrix in #3453 remains open.
- Proposed translations for JA/ZH/VI are reasonable but not reviewed by a native reviewer; product copy review is owner-controlled.
- Checkpoint v2026.11.26.1730.1 (SSR QA, isolated sandbox): production build (`next build --webpack`, the project script, 1.5 GiB heap; 1 GiB ran out of memory) served by `next start` against the synthetic sandbox API. First server render of `/` and `/quests` in EN/KO/JA/ZH/VI: `html lang` matches; dock, full-menu button label, bottom-navigation label and home headings are in the selected language. Two remaining header strings (PlayerHud sign-in, wallet/character labels) and the shared loading announcement were localised after this check; rebuilt: header and dock contain 0 Hangul characters in EN/JA/ZH/VI, EN home main body 0 Hangul lines. Recorded for later scope: the shop page is still predominantly Korean in EN (958 lines). Frontend 623 files / 3,247 tests; typecheck clean.
- Browser hydration/viewport QA (320/390 px, desktop, roles) still not run: no browser binary on the host. Official Test HOLD.
