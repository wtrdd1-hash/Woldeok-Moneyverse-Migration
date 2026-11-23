# Nov18 UI Functional Coverage — Owner Correction Order
Version: v2026.11.23.1 | State: PLANNING / VERIFIED_PARTIAL / REMEDIATION_REQUIRED
Korean: [한국어](NOV18_UI_FUNCTIONAL_COVERAGE_CORRECTION_v2026.11.23.1.ko.md)
Issue: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3374
Base and mid-work main: `9876c09888ec84034eec183cf1309c85df3d7447`. No code, source design PNG, Test, or Production change.

## Authority and evidence
Apply `PROJECT_PLAN.md` and `INTEGRATED_PLANNING_MASTER.md` first; then Nov18 approved visuals and `NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.md`. The 180 Nov18 PNGs are **route-level conceptual mockups**, NOT 180 fully specified product journeys. This order records mandatory corrective design work; it does not claim it has been executed. Reviewed actual PC+mobile composite PNGs for precisely 8 routes: `/`, `/dashboard`, `/work`, `/admin/work`, `/bank`, `/wallet`, `/quests`, `/shop`. Remaining 172 remain NOT_REVIEWED. Three remote desktop devices were offline; GitHub connector used.

## Element-level findings
| ID | Evidence | Observed in composite PNG | Required correction |
| --- | --- | --- | --- |
| P0-01 HOME/JOB | `previews/home.png`, `dashboard.png` | PC nav: Home/Dashboard/Wallet/Stocks/Quests/Shop/Community/Admin; no Work/Jobs. Mobile home cards omit Jobs. Quick Tasks says status/details/logs. | Add clear Work entry in desktop navigation and mobile All/Game, optional Home quick-action; show authorized current career, active task, claim state or correct empty/error. |
| P0-02 WORK | `previews/work.png` | Generic mission / reward / event cards; sample 3/5 goals and LV42; no visible job-select/qualification/accept/submit/receipt controls. | Design 8-career catalog, select/switch confirmation, task filters, duration/timer, accept, submit, WLD/EXP results, proof/receipts, quota, mastery 7 tiers, licenses/promotions and all states. |
| P0-03 ADMIN | `previews/admin-work.png` | Generic status/approval/log content without actual work-policy editing screens. | Design access-controlled job catalog and payroll/quota controls, qualification approval, audit/rollback/error states. |
| P1-04 BANK | `previews/bank.png` | Generic trends/asset widgets, teal accent; no visibly specified deposit/withdraw/savings/card management transactional flows. | Violet/navy base; deposit, withdrawal, savings open/close/maturity, card apply/manage only where authorized by latest master, validation/confirm/receipt/error. |
| P1-05 WALLET | `previews/wallet.png` | Generic trends/asset widgets and teal accent; detailed transfer flow absent in mockup. | Show balance source, send/receive, confirm, transaction ledger/receipt, permissions and fail-closed errors. |
| P1-06 QUEST/SHOP | `previews/quests.png`, `shop.png` | Same broad mission/reward/history card layout; detailed distinct workflow not shown. | Quest progress/claim and catalog/item/price/checkout/holdings must have separate domain-specific UI. |
| P1-07 GLOBAL | All 8 images | No function-specific common support/chat visible in the screenshot; only generic header + bottom nav. | Validate single global support/chat action, EN/KO/JA/ZH/VI locale control, accessibility and responsive flows; do not infer absence from one static image if overlays are not represented. |

## Corrective design orders and acceptance
1. Build a full feature-to-UI ledger for **all 180 route concepts plus every actual planned subfunction**, citing master plan sections and requirement IDs. Fields: `feature, requirement source, route, PC image element, mobile image element, navigation entry, form/CTA, pending, confirm, success, receipt, failure, empty, auth/role, 5 locales, real data source, evidence, status`. Values: `VERIFIED` only with element-level image proof, `PARTIAL`, `NOT_DESIGNED`, `NOT_REVIEWED`; filename existence never means verified.
2. Complete and approve actual PC and 390px mobile corrected visuals for the eight inspected routes first, then review the other 172. Provide image before/after URLs and numbered controls. Do not replace all routes with generic templates.
3. Ensure every required action is reachable from home, clear navigation, context links, and mobile All menu; include disabled/pending/403/503, error, confirmations, receipt, log-out and account-switch handling.
4. Preserve Nov18 navy `#0C1020`, cards `#151D32`, primary violet `#9C83FF`, blue `#64B7FF`, text `#E9F1FF`; status colors only for status semantics. No teal/green brand themes. Use live authorized data; visibly mark only true design sample data.
5. Default EN, second KO, plus JA/ZH/VI with auto detection and persistent manual override. One global support/chat launcher on every public/member/admin screen with strict RBAC and actor ownership.
6. After design signoff, implement final web frontend with Spring MVC + Thymeleaf, real integration with API/database and role security. Keep Gemini work ownership separate. Isolated Test exact-SHA browser/API/security regression and independent rollback are gates to zero-downtime production promotion.
7. Deliver an acceptance record that explicitly lists changed image hashes, planned/implemented separation, and any unresolved gaps. Do not claim completed design or production without evidence.

## Execution boundary
This version **only documents** the visual findings and mandatory corrections; the 180 original previews and application code are unchanged. Baseline and mid-work main `9876c09888ec84034eec183cf1309c85df3d7447`; recheck at PR merge. No staging, QA runtime, or production deployment was performed.
