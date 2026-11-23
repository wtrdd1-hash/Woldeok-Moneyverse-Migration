# Administrator member directory — unified UI regression evidence
Version: v2026.11.23.6 | **P0 / OPEN / SCREENSHOT-OBSERVED** | [Korean](2026-11-23-admin-users-design-regression-v2026.11.23.6.ko.md)
Tracking: [GitHub #3378](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3378). Owner-selected [official design](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/design/nov18-unified-all-180-20261123/docs/design/OWNER_SELECTED_UNIFIED_DESIGN_v2026.11.23.3.md) (separate draft PR #3376, not merged).

## Evidence scope
The owner provided an additional screenshot on 2026-11-23. The visible address bar contains `https://easy-scraping.com/admin/users`; server identity, actual runtime, session/permissions and backend APIs were **not independently tested**. The screenshot contains personal member display names and UUIDs; **NEVER upload the original screenshot or member identifiers to public GitHub**. This text-only safe evidence captures UI shape, not member records.

## Observed deviations
- Browser rendering uses plain `WOLDEOK / ADMIN` header and unstyled text links for dashboard/members/support/locale, not the selected W-brand unified header + administrator sidebar.
- Basic centered `Member directory` table with narrow search controls instead of approved administrator page shell, role/workflow navigation and coordinated action design. A purple button and navy background are insufficient to establish consistency.
- Timestamp column displays raw ISO-8601 date strings; localized dates and responsive table layouts require explicit design/QA.
- Search notice indicates searching only the first result-limit records; this is a declared limitation, **not** full-directory search. Data correctness, privacy, pagination and total-count semantics need source/API QA.
- Only a desktop screenshot was provided. Mobile 320/360/390/430, tablet, 200% zoom, keyboard/screen-reader, EN/KO/JA/ZH/VI and 403/empty/loading/error states are **NOT_TESTED**.

## Required thorough QA and release gates
1. Recreate the selected common admin shell (W brand, sidebar, header, search and language menu, single support/chat launcher), preserve RBAC and role-based link visibility, and make user list/filters/next-page/actions function-specific rather than generic.
2. Test table layout for many members, long multilingual names, anonymized IDs, source-reported pagination/sort/filter/search, time zone rendering, safe empty/error/timeout/403 and no horizontal overflow. Never expose arbitrary member identifiers through public pages.
3. Conduct Playwright/Spring MVC+Thymeleaf desktop/mobile visual regression with approved screenshot **after masking names/IDs/session and personal content**; compare with selected design and document exact source SHA, browser/viewport, role, API/test data provenance.
4. Independent isolated Test with functional and security verification, then only release via existing change-control and zero-downtime rollback gates. No test server or production change in this findings-only task.

## Status
**VISUAL FAIL (screenshot evidence); FUNCTIONAL QA NOT RUN; FIX NOT IMPLEMENTED; PRODUCTION NOT VERIFIED.** The user requested recording the page for design application and detailed QA, not a false implementation-complete claim.
