# Responsive Spring Frontend — Automatic and Manual Five-Language Selection v2026.11.19.39.1

**Status: SOURCE + H2 SPRING HTTP + ISOLATED CHROMIUM PICKER QA PASS / PRODUCTION HOLD**

[한국어 자세한 기획](SPRING_RESPONSIVE_FIVE_LOCALE_UI_v2026.11.19.39.1.ko.md) · [Actual QA EN](../qa/2026-11-19-spring-five-locale-browser-v39.md) / [한국어 QA](../qa/2026-11-19-spring-five-locale-browser-v39.ko.md).

## Owner-authorized complete goal / implemented slice

The owner explicitly approved building **the complete desktop and mobile responsive Moneyverse frontend directly under Java Spring Boot**, implementing the approved visual images and actual session-bound backend data, plus **automatic locale detection and manual locale choice**, and promotion to Production after actual tests. This v39 work is a **reusable native Spring component**, not a completed site-wide migration.

Two independent active workstreams:
1. [Spring core responsive member pages PR #3296](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3296) implements Home, Wallet, Investments, Quests, Shop, Community, Support, Account and nine static entrypoints (one extra path) with 87 full 5-language dictionary keys. Its own documented local Chromium 39/39 and simulated account 4/4 PASS are **not authenticated production QA**, and old /stocks Spring controller still takes precedence; new investment entry uses /invest.
2. This v39 component is stacked on [Spring-native administrator/Thymeleaf shell PR #3295](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3295) and installs the same five-language chooser on **actual Java admin pages and genuine Spring Thymeleaf calculators, tool hub and status**. It does **not** overwrite the nine static files owned by PR #3296, or any member finances, API methods, Nginx or running services.

**True supported locale contract** from `frontend/src/lib/locale.ts` and `frontend/src/components/language-switcher.tsx` is `en`, `ko`, `ja`, `zh`, `vi`. Older Next source fallback was Korean, but the latest owner policy requires English default for unsupported locales and Korean as the second selectable locale.

## Behavior / accessibility contract

| Mode | Browser / server behavior | Persistence |
| --- | --- | --- |
| Auto (default without stored override) | Detect first supported locale in `navigator.languages` or `navigator.language`; otherwise English | `wdmv_detected_locale` as a non-sensitive hint; `?lang=code&mv_auto=1` for Spring SSR |
| Manual EN/KO/JA/ZH/VI | User selection wins; explicit `?lang=` wins on its page; URL query preserves other search parameters and hash | `wdmv_locale` Lax cookie + shared `wdmv_locale_preference` localStorage key; ensures switching between v38 member HTML and v39 native Spring routes doesn't resurrect an old preference |
| Return to Auto | Removes manual cookie and writes shared preference `auto`, recomputes browser locale | Manual mode cannot silently override subsequent Auto selection |
| Storage disabled / cookie blocked | JS uses in-memory/browser default; navigation still works with `?lang=`; no account/session data or finance mutation | Graceful fallback; no unhandled browser error |
| No JavaScript | Server template includes accessible native `details/summary` links for all five languages and clearly marked English fallback Auto link | No fake browser auto claim without JS |
| Native Spring content fallback | Java admin/calculators/status currently translate **English + Korean only**. For JA/ZH/VI selection show a localized notice that page body remains English until full translation. The 8 other member pages have their own five-locale dictionary implementation | Never claim all legacy Spring legal/finance/error text is translated |

**Responsive contract:** desktop 1440px and tablet 768px regular anchored dropdown; small 390/320px fixed top language panel with 44px controls, safe area, bounded height above existing 56px help/bottom navigation, visible focus and Escape close; reduced-motion support. Native templates have CSS with no Node/Next browser runtime; the picker is a lightweight same-origin ES module. It does not fetch APIs or change balances/FX rates.

**Security:** `/admin/users` + other Java admin controllers still reject anonymous users. CSP extends only to `script-src 'self'` (no inline script, external script, evaluator or data URI), retaining `default-src 'none'` and the prior same-origin style policy. No client-provided identity header, CSRF token storage, transaction/ledger mutation, or private session access. Admin support dock remains read-only until authenticated ticket ownership is fixed.

## Exact implementation files

- `spring-backend/src/main/resources/static/mv-spring/v39/locale-core.mjs`: locale normalize, browser detection, precedence, safe query navigation and cookie parser.
- `.../v39/language-picker.mjs`: auto vs manual, cookie/localStorage interoperability, 5 language UI labels, translated fallback warnings, focus/Escape, strict DOM/textContent only.
- `.../v39/language-picker.css`: desktop/mobile positioning, 44px targets, 390/320px responsive contract, no help dock overlap and reduced motion.
- `spring-backend/src/main/resources/templates/mv28/layout.html` and `mv30/hub.html`, `mv29/status.html`: real Thymeleaf headers link CSS+module and native fallback controls.
- `LiveAdminUsersPage.java` and `LiveAdminOverviewPages.java`: Spring admin HTML switcher + same-origin script CSP; no changes to authentication or finance logic.
- Test-only `src/test/js/mv39-locale.test.mjs`, `mv39-browser.test.cjs`, `src/test/python/mv39_local_test_server.py`, Java test classes for HTML, resource contracts and real H2 random-port HTTP.

## Release acceptance and open work

On exact local v39 source before publishing: 7/7 Node locale tests, **262/262 clean Spring Java JUnit PASS**, embedded H2 random port `SpringFiveLocaleV39HttpTest` 5/5 HTTP PASS, and **10/10 real Chromium browser tests against synthetic locale-only fixture** (320/390/768/1440, menu/help collision, KO manual, JA/ZH/VI, Auto reset, keyboard, no account API requests). JAR SHA256 `2f876f422d7b7ba97277a8b29634913857ec9b65dc36d0368b864dd2ebae7b0b`. The browser tests use a synthetic isolated fixture, **not** logged-in actual Spring pages or production.

Remaining: integrate PR #3295 and #3296 with current security baseline; deliver full content translations for remaining native 180 routes; verify real accounts/permissions/ledger/quests/messages, multi-viewport live app/browser/SEO, official exact SHA Test, Nginx routing, rollback and staged zero-downtime Production promotion. **No global 180-page or Production completion certification**.

[180 design-to-route visual matrix](../qa/SPRING_DESIGN_ROUTE_MATRIX_v2026.11.19.38.1.md) from v38 remains authoritative for unverified routes. Recheck changing main/integrated design before each merge. Do not merge incompatible old source to public main or deploy a functional mock/preview as production.
