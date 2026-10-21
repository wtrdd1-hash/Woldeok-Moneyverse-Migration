# Moneyverse Non-Intrusive Advertising — v2026.10.21.1073

**Status:** IMPLEMENTED in isolated source branch; Production deployment **BLOCKED** pending pre-existing financial, Test and CI gates. [한국어](AD_PLACEMENT_GUARDRAILS_v2026.10.21.1073.ko.md).

## Authority and intent
Under current `PROJECT_PLAN`, `INTEGRATED_PLANNING_MASTER`, v507 advertising-only business scope, admin-ad-exclusion and v530 UI release rules, increase content ad inventory without obstructing financial operations, private communication or user learning. Additional publisher-dashboard Auto ads, overlays or paid channels are **not** enabled by this code change.

## Inventory, routes and limits
- Eligible: root home, /en /ja /zh home, content-rich `/tools/**`, `/guide/**`, `/blog/**` and their locale prefixes, and standalone `/gallery`, `/announcements`, `/roadmap`.
- Excluded: /admin, /wallet, /bank, /bonds, /stocks, /casino, /arcade, /account, /login, /register, /chat, /privacy and all paths not allowlisted. A conservative block on existing trading/game ads is intentional.
- Blog rendered Markdown blocks: 0–2 no units; 3–7 bottom only; 8–11 top+bottom; 12–21 top+one body after block 7+bottom; 22+ top+two body slots after blocks 7 and 16+bottom. Maximum four separate display/in-article/multiplex placements in very long articles. Never inject between a calculator control and its result.
- Existing calculator page slots remain; no blanket injection across 34 tool routes. A tools layout renders one desktop rail pair; three duplicate child rails removed.
- Desktop rails have 300px containers and are shown only at viewport >=2200 CSS px outside 1440px content, replacing impossible 160px containers under the 250px AdSense minimum. Mobile has **no** fixed ads.
- Slot markup now reuses one AdSense component with 450px proximity lazy requests, resolved non-admin viewer eligibility and no-fill collapse; no synthetic first-party "official sponsor" masquerade.
- Root AdSense script is withheld on initial protected or admin route loads, with the caveat that once a third-party script runs on public content it can survive client-side navigation. **Google Auto ads page/section exclusions MUST also be configured in AdSense** for every sensitive route, especially if Auto ads is enabled; source code alone cannot verify provider-account settings.

## Measurement and operating controls
Keep density below content volume and ads distinguishable from navigation or actionable financial controls. For AdSense Auto ads, prefer in-page banner/multiplex; configure relevant page exclusions and generous minimum spacing. **Do not enable anchor/vignette/interstitial, ad intents, or additional event triggers by default**. AdSense experimentation, if approved, must compare real page RPM, revenue, viewability/coverage, CLS/LCP/INP, task completion, bounce, misclicks, complaints and invalid-traffic/policy status by route/device/locale and retain rollback.

## Verification record
- `origin/main=0d12f99bab2f4431cb04b19f7a279f86a7195099` start and midpoint (re-fetched).
- New tests: 37/37 PASS. Changed-file ESLint PASS. Frontend TypeScript noEmit PASS. Next.js 16.3.8 Webpack production build PASS (592 static pages generated).
- Full frontend suite: 4 existing blog-editorial tests FAIL identically in untouched `main` (same test paths/expectations), not introduced by this branch. Do not mark full CI green.
- Actual read-only Production financial readiness: BLOCKED on three direct app DML tables (`account_balances`, `accounts`, `system_treasury_vaults`); 40 balances, 0 unexplained projections at the snapshot; this zero does not certify opening provenance or wider treasury correctness.
- Exact-SHA official Test deployment, authenticated 5-pass admin/user/mobile QA, session persistence, database parity, rollback and Production zero-downtime promotion: **NOT PERFORMED / BLOCKED**.
- No SQL/data/ledger or live ad-platform configuration altered. No claimed revenue uplift.
