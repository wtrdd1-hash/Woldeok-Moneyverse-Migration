# Consolidated Screenshot UI Regression & Detailed QA Order — 2026-11-23
Version: v2026.11.23.8 | Status: P0 OPEN / SCREENSHOT-EVIDENCED / DESIGN + QA REQUIRED | [한국어](2026-11-23-consolidated-ui-regression-and-qa-v2026.11.23.8.ko.md)

## 1. Scope, sources and authority
**Exactly three distinct owner-provided screenshots**, in the order presented on 2026-11-23:
1. `https://easy-scraping.com/admin/users` — Administrator Member directory.
2. `https://easy-scraping.com/admin/logs` — Administrator Audit Logs; **a separate route from /admin/users**, not another member-directory screenshot.
3. `https://easy-scraping.com/bank` — Bank deposit/withdrawal and interest area.

The owner-approved future unified design is [v2026.11.23.3 EN](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/design/nov18-unified-all-180-20261123/docs/design/OWNER_SELECTED_UNIFIED_DESIGN_v2026.11.23.3.md) / [KO](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/design/nov18-unified-all-180-20261123/docs/design/OWNER_SELECTED_UNIFIED_DESIGN_v2026.11.23.3.ko.md). Main at documentation start/mid: `9876c09888ec84034eec183cf1309c85df3d7447`. Refer to authoritative `PROJECT_PLAN`, `INTEGRATED_PLANNING_MASTER` and `DOCUMENTATION_POLICY`. The selected design lives in draft PR #3376 and is not yet merged or deployed.

**Evidence limitation:** screenshots visually examined, but no authenticated browser session, server fetch, source code patch, API calls, financial transaction or backend runtime QA performed. Cropped/scrolled screenshots prove only the visible portion, not absence of offscreen items. Sensitive member names/UUIDs are not reproduced or uploaded publicly.

## 2. Unified discrepancy matrix
| ID | URL | Screenshot-observed problem | Priority | Required correction |
|---|---|---|---|---|
| UI-01 | `/admin/users` | Plain `WOLDEOK / ADMIN` top strip with text-only Dashboard/Members/Support/Korean links; standalone `Member directory` table rather than selected W-brand admin shell and sidebar | P0 | Adopt global admin header/sidebar, consistent route and role-specific navigation, single support/chat, selected component tokens |
| UI-02 | `/admin/users` | ISO-8601 joined date strings; search notice says only the first source records are searched | P1 / QA | Locale-aware timestamps, truthful search scope, safe total counts/sorting/filter/pagination, RBAC/privacy and source completeness QA |
| UI-03 | `/admin/logs` | Vast full-viewport bright-violet decorative shape/graphic dominates; only '본문으로 건너뛰기' skip-to-content link is visible at the top of captured viewport | P0 | Restore legible, bounded and functional audit-log page above/beside visual decoration; common admin shell; navigation, filters, list, states; investigate CSS/logo sizing or loading/layout failure |
| UI-04 | `/admin/logs` | Actual log list/filter/actions **not visible in captured viewport** and layout visually far from chosen dark navy/violet UI | P0 / QA | Confirm whether log UI appears after scrolling/loading; do NOT infer backend lacks logs from screenshot. PC/mobile browser and CSS/asset QA, log permissions/redaction/export |
| UI-05 | `/bank` | Sidebar and browser tab display literal **Translation unavailable**, with otherwise mostly Korean labels | P0 | Fix message-key/fallback and title rendering; EN default, KO second, JA/ZH/VI, manual and auto selection |
| UI-06 | `/bank` | Legacy nav differs from unified Jobs/Career and W-brand shell. In screenshot Jobs entry is not visible | P1 | Unified route-aware desktop/mobile nav; no claim about offscreen header |
| UI-07 | `/bank` | Deposit/withdraw fields grey and visually incongruent; amount shortcut chips and form buttons have inconsistent spacing and size | P1 | Consistent design tokens, input contrast, column alignment, responsive controls, validation and transactional confirmations |
| QA-08 | `/bank` | Interest rates and claim controls shown but accuracy **not determined visually** | P0 financial QA | Verify policy/API/ledger accrual and WLD amounts, safe mutations, CSRF/idempotency, confirmations/receipts, authorization |

### Audit logs screenshot — specific caution
The route is **`/admin/logs`**, not `/admin/users`. Oversized violet graphics and lack of visible log content are screenshot observations, **not proof of broken backend or missing records**. The skip link may be intentional accessibility UI; the defect is the unexpectedly dominant graphic and inaccessible-looking content in the screenshot. Inspect actual DOM/CSS and scroll/zoom before root-cause claims.

## 3. End-to-end correction order
1. Use only selected v2026.11.23.3 dark navy `#0C1020`, surfaces `#151D32`, violet `#9C83FF`, blue `#64B7FF`, readable `#E9F1FF`, with meaningful status colors, consistent fonts/navigation, mobile support/chat.
2. Explicit functional UI, not page-title-generic concepts: admin user-list search/pagination and user role actions; admin audit timestamp/actor/action/filter/export with redaction and RBAC; banking deposit/withdrawal, interest claim and receipts with safe authorization.
3. Test 320/360/390/430/768/1024/1440/1920px, 200% zoom, keyboard/skip link focus order, screen reader, long text and zero horizontal overflow, EN/KO/JA/ZH/VI and RTL only if actually supported.
4. Capture **redacted** before/after evidence with exact Git SHA, role/locale/browser/viewport, real input/output & errors from isolated Test. Never publish unmasked member identity, bank/account/wallet details, session tokens or live screenshots.
5. Test Spring MVC/Thymeleaf components against authorized APIs and true user role data; complete functional regression, errors/403/503/empty/loading, database isolation and rollback. Promote only after independent verified exact-SHA Test and no-downtime release gates. Keep changes on isolated branch to avoid Gemini edits.

## 4. Tracking and actual status
- Member directory: [issue #3378](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3378), [documentation PR #3379](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3379).
- Audit logs: **new observation** recorded here; create/follow up dedicated actionable tracking issue for owner QA.
- Bank/i18n: [issue #3380](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3380), [documentation PR #3381](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3381).
- Overall visual standard: [issue #3374](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3374), [design draft PR #3376](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3376).

**This consolidation is a documentation deliverable only.** No screenshots were uploaded to GitHub, no issue declared fixed, no backend/browser QA, no design binaries uploaded to GitHub, no source changes and no Test/Production deployment.
