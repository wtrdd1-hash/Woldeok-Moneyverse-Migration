# Spring responsive frontend v2026.11.19.38 — Test evidence

**Date:** 2026-11-19 KST. **Source branch:** `feat/spring-responsive-i18n-ui-v2026.11.19.38`. **Status:** isolated local Spring read-only Test PASS; full user-feature/production gate HOLD.

## Authoritative locale inventory
Previous `frontend/src/lib/locale.ts` exports `SUPPORTED_LOCALES: ['ko','en','ja','zh','vi']` and the old switcher lists Korean, English, Japanese, Simplified Chinese, Vietnamese. The replacement UI has **EN first**, KO second, JA/ZH/VI, and Auto browser detection, with durable manual selection via `wdmv_locale` + localStorage. Auto resets the manual override; WLD amounts are never currency-converted merely from a language change. Browser/Node tests cover every selector option and 87 nonempty five-language translation keys.

## Code/Test evidence
- Python static/DOM/API-safety contract **8/8 PASS**; source `scripts/test_mv38_frontend.py`.
- Node locale behavior test **PASS**; source `scripts/test_mv38_locale.js`.
- JavaScript syntax for both runtime assets **PASS**; `node --check`.
- Isolated Spring Test instance: systemd transient `moneyverse-ui-v38-r6-test.service`, loopback `127.0.0.1:4672`, Spring backend read-only Test environment. Candidate root `/srv/moneyverse-data/releases/mv38-spring-frontend-candidate-r6-20261119/frontend-static`. Immutable candidate SHA256 file inventory stored at `/srv/moneyverse-data/tasks/pc-mobile-full-frontend-v2026.11.19.38/CANDIDATE_R6_SHA256.txt` (not public).
- Spring Test GET `/`, `/wallet`, `/invest`, `/quests`, `/shop`, `/board`, `/support`, `/account`, CSS+JavaScript and public auth/market/shop/board APIs returned HTTP 200; JS is served as text/javascript. Legacy `/stocks` HTTP 200 is **a different Java controller page** (8,620 bytes), not the new 6,140-byte Spring static investment UI. New user-facing navigation uses `/invest`, preserving native `/stocks` until consolidated.
- Additional Playwright **5/5 test-only simulated member/mobile flow PASS**: exact large decimal WLD formatted without Number rounding, simulated A→B session identity switch clears old balances, session expiry strips balances/admin nav, manually selected Korean persists across page navigation. **Not real authenticated DB E2E.**
- Headless Chromium Playwright in local Spring Test: **39/39 PASS**. Verified 320/390/768/1440 viewport page rendering and 0 document horizontal overflow on seven member pages plus `/invest`; hamburger open and Escape close; KO manual persistence after reload; JA, VI, ZH manual choices; Auto resets to browser English; 760px stock table horizontally scrollable inside container; signed-out guest money remains hidden; no fake Treasury amount or public runtime versions; zero JavaScript page errors.
- [PC screenshot at 1440 EN](../design/mv38/desktop-home-1440-en.png); [mobile screenshot at 390 KO](../design/mv38/mobile-home-390-ko.png). Screenshots show the guest state in a local Test server, not Production.

## Security/data limitations and blocking conditions
- Financial browser testing used **guest context only**. An existing authenticated session across release, user A/B identity isolation, actual ledger vs rendered value, trade write receipts, payment and backend error handling **are NOT certified**.
- Legacy wallet `/overview` may fall back to an unrelated default actor on session expiry; new UI **does not call** this endpoint. Legacy quest/progression and private support endpoints do not provide verified session-owned responses in the inspected code; these views intentionally do not render personal fake data and are not completed business features.
- Only eight core page features in nine static entrypoints are implemented. Most historical Next-export routes (~180 source components) are still unmigrated or fallback. Existing `/stocks` Spring Java controller remains separately styled. The same-routes 180-page parity requirement is **NOT satisfied**.
- Local mini-PC developer `main` has concurrent Gemini/owner unmerged commits and changes; GitHub remote main and active Production JAR/static source are not exact identical SHAs. This local read-only Test is **not** the official public exact-main Test release. No approved immutable main SHA, session continuity or zero-downtime cutover. Production promotion must remain BLOCKED until reconciliation, full QA and official release gates.

**CI history:** push-triggered GitHub `runtime-check` previously failed ESLint (two `no-empty` cases) and 1,076 preexisting warning messages. The two errors are corrected in a subsequent branch commit; current CI status must be verified on that exact commit. The failed run is not represented as a pass.

**Mobile authenticated header regression:** Test-only verified member and long Korean ADMIN display name at 320px originally produced a 27px-wide logout target (RED). New responsive two-row header and 84x44px minimum logout button pass browser tests, with zero document overflow. Simulated identity tests are now 5/5; real authenticated browser E2E still pending.
