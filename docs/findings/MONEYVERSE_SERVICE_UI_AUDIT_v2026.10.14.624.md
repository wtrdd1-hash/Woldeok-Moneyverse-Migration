# Moneyverse Service, UI and Growth Integrity Audit — v2026.10.14.624

**English canonical** | [한국어](MONEYVERSE_SERVICE_UI_AUDIT_v2026.10.14.624.ko.md)
**Status:** FINDINGS / NOT TEST_VERIFIED / NOT PRODUCTION_VERIFIED
**Date:** 2026-10-14 KST. **Task branch:** `audit/service-ui-review-v2026.10.14.624`.
**Source basis:** fetched `origin/main=77e27063059555c97249a63bcd58a3451671150d`, compared with current `/srv/moneyverse-data/releases/prod-v600`.
**Documentation authority:** `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md` and v530 UI remediation gate. This evidence-only audit does not supersede product authority or authorize deployment.

## 1. Read-only observation boundary

- `$pc` system status reported active frontend, backend, nginx, Discord bot and MCP; **development DB** connectivity returned connected. These are process health, not feature acceptance.
- Both `/srv/moneyverse` and `production-current` resolved to `prod-v600`; `test-current` resolved to `test-v618-7fa3f245bbc3`. Systemd WorkingDirectory for frontend/backend points to `production-current`.
- Current `origin/main` contained **164** Next `page.tsx` files, **34** admin pages; deployed `prod-v600` contained **163** pages, **34** admin pages. These are route *templates*, not successfully tested routes.
- Public read-only GET sample: `/`, `/tools`, `/tools/compound-calculator`, `/tools/salary-calculator`, `/stocks`, `/treasury`, `/blog`, `/guide`, `/roadmap`, `/login`, `/register`, `/marketplace`, `/robots.txt`, `/sitemap.xml`, `/en`, `/ja`, `/zh` and EN/JA compound-calculator URLs responded HTTP 200. `/news` responded HTTP 404; no active navigation reference was verified. `/api/health` responded 200. An anonymous GET of `/admin/seo` returned final HTTP 200, which does **not** establish authorization bypass or valid authenticated functionality.
- The home HTML had zero server-rendered `<h1>` tags; sampled `/tools`, `/stocks`, `/blog`, `/guide`, and both calculator pages each had an H1. Sampled homepage response durations varied: one read was 6.42s, others around 1s; not Core Web Vitals evidence.
- No real transactions, account authentication, privileged admin mutations, write APIs, feature switches, production migration, browser screenshots, browser pixel-geometry measurements, or release promotion were executed. Remote graphical browser was unavailable; actual visual clipping remains **not reproduced** in this audit.

## 2. Risk register

| ID | Priority | Evidence and impact | Required action and acceptance |
| --- | --- | --- | --- |
| UI624-01 | **P1, escalate P0 if clipped** | Production `frontend/src/app/admin/seo/page.tsx:110-128` uses non-wrapping `flex` for two verbose SEO tabs; the older v530 P0 involved another inner action group. `seo-client-view.tsx:294` now uses mobile grid, suggesting partial repair, **not** a full 320px pass. | Reflow/scroll-label treatment, keyboard focus and text wrapping; browser tests at 320/360/375/390/430px, landscape, 200% zoom, all 34 authenticated admin templates. |
| UI624-02 | **P1** | `frontend/src/app/mobile-responsive-regression.test.ts:9-65` relies largely on `source().toContain(...)` CSS string assertions, not computed geometry/screenshot/interaction. 163 production page templates cannot be certified by those assertions. | Exact-SHA Playwright visual+interaction sweep, each route/state, overflow dimensions and modal/focus/touch checks; failures retain before/after screenshots. |
| UI624-03 | **P1** | `mobile-bottom-nav.tsx:71` combines `min-w-[44px]` and `min-w-0` on the same clickable element, with mobile label and small typography. Potential touch-target shrinkage; no measured violation claimed. | Remove contradictory utilities; computed click rectangle >=44×44px; tested at 320px with five tabs and accessible labels. |
| SEO624-01 | **P1** | Deployed homepage GET HTML has no `<h1>`; source `frontend/src/app/page.tsx` headings are H2/H3. | One meaningful localized SSR H1, no keyword stuffing; verify DOM/accessibility heading outline in each locale. |
| SEO624-02 | **P1** | `frontend/src/lib/json-ld.ts:46-49`, `lib/seo.ts:88-90,135-137`, and multiple calculators hardcode `AggregateRating` values (e.g. 4.9) and review counts with no evidence-linked rating source in this review. | Remove fabricated/unsupported ratings or bind verified eligible visible review data; run Google Rich Results Test. Google structured data quality rules prohibit misleading reviews. |
| SEO624-03 | **P1** | `frontend/src/app/api/admin/seo-audit/route.ts:8-53` was previously source-confirmed by v603 as emitting static crawl/indexing success metrics. This audit did not authenticate an admin session to measure live GSC or Naver outcomes. | Mark MOCK/UNVERIFIED or connect first-party source with timestamp, property, sample period and error states; distinguish URL submission from indexing. |
| SEO624-04 | **P2** | UI/docs still present `FAQPage` as a Google SERP accordion opportunity, including `frontend/src/lib/json-ld.ts:60-64`. Google Search Central retired FAQ rich results in May 2026 (Google Search documentation changelog). | Correct SEO strategy copy and KPIs; retain FAQ structured data only if semantically valuable and truthful, not for a discontinued rich-result promise. |
| ECON624-01 | **P1** | Prior current-source v603 audit documented `frontend/src/app/api/treasury/claim/route.ts:7-58` returning payment success without settlement/ledger receipt. No real money movement or live exploit asserted. | Fail closed or explicitly label simulation; settlement through Economy Core, idempotency and transaction receipt; audit duplicate/concurrent requests. |
| TRUST624-01 | **P1** | Production homepage `frontend/src/app/page.tsx` metadata advertises immediate 10,000 WLD and a 10,000,000 WLD jackpot lottery. Planning authority v542/v523 blocks unverified WLD lotteries; source cannot prove current eligibility or reward fulfillment. | Align copy with currently authorized and actually operating rewards, age/jurisdiction controls and receipts; remove unsupported guarantee language. |
| SEC624-01 | **P0 conditional / P1** | v603 source audit records conditional shared fallback authentication secret, missing admin backup role guard, repeatable DAO votes, non-atomic file stores, unauthenticated IndexNow, and grant applicant identity issues. None was penetration-tested here. | Separate fail-closed security remediation and negative/economy integration tests; independent Test and release verification. See `MONEYVERSE_FULL_CODE_SECURITY_AUDIT_v2026.10.14.603.md`. |
| OPS624-01 | **P1** | Project v530 explicitly retains **BLOCKED** full-UI gate; release names currently differ between origin/main, Test and Production. The root `.moneyverse-release.json` was not present in the checked production release directory. | Capture immutable SHA/CI provenance, Test backend/database/session identity, full route acceptance before any documented promotion; keep planning and runtime state separate. |
| NAV624-01 | **P2 / unclassified** | Anonymous GET `/news` returned 404. No claim of broken UX until a live menu/internal link points to it. | Search link graph; fix link, provide route, or leave legitimate 404. |
| PERF624-01 | **P2 / insufficient sample** | One homepage GET took 6.42s while several others were ~1s. No LCP/INP/CLS field or synthetic percentiles established. | Capture p50/p95/p99 server latency and Web Vitals by mobile region, cache state and signed-in state before claiming slowness regression. |

## 3. Sequenced remediation plan

1. **P0 safety gate:** reconcile conditional authentication/role flaws and any actual out-of-ledger success or unauthorized reward; no production financial mutation for diagnosis.
2. **Mobile UI:** correct SEO tab reflow and contradictory navigation sizing; cover keyboard, screen readers, onboarding overlays, 200% zoom, fixed bottom safe-area, narrow admin menus; browser-measure all templates.
3. **Truthful UX and analytics:** stop phantom payment/success/indexing states, reconcile signup/lottery claims, require timestamps and provenance for all KPIs.
4. **SEO quality:** SSR localized H1, rating evidence, remove FAQ rich-result promise, per-URL canonical/hreflang/sitemap integrity, calculator jurisdiction/effective-date disclaimers and useful internal links. Do not publish more thin programmatic URLs as a workaround for low traffic.
5. **Release quality:** CI → isolated exact SHA Test with backend + DB + session + all admin UI → immutable production candidate → zero-downtime promotion evidence. No gate is passed by this audit.

## 4. External standards and scope

- Google structured data general guidelines: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google Search Central Search documentation updates (FAQ rich results removed 2026): https://developers.google.com/search/updates
- Google scaled content policy: https://developers.google.com/search/docs/essentials/spam-policies
- Moneyverse authoritative `docs/planning/PROJECT_PLAN.md`, `INTEGRATED_PLANNING_MASTER.md`, `EMERGENCY_FULL_UI_REAUDIT_SPEC.md`; historic v603 security finding register.
- **Acceptance:** THIS DOCUMENT = evidence-only review. Browser all-route pass: **NOT RUN**. Authenticated admin E2E: **NOT RUN**. Production DB/economy negative tests: **NOT RUN**. CI/Test/Production promotion: **NOT RUN**.
