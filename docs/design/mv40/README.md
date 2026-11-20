# v2026.11.19.40 — Admin Responsive Web Browser Evidence

- [Desktop 1440px English — local browser fixture](admin-browser-fixture-1440-en.png)
- [Mobile 390px Korean — local browser fixture](admin-browser-fixture-390-ko.png)

These screenshots show real HTML/CSS rendered in Chromium from an isolated **mock-source fixture**, **not** the Production website, an authenticated admin account or real DB balances. The synthetic member/stock/feature numbers in the screenshot are only test inputs to inspect the layout and must never be used in Production. Source `AdminDashboardPage.java` reads authenticated live API/DB services when deployed, displays `Unavailable` on missing sources and never invents totals.

Approved family references: [admin desktop concept](../admin-chat-v2026.11.18.13/references/admin-console-desktop.png) and [member home concept](../all-pages-v2026.11.18.12/previews/home.png). Existing user home source evidence: [v39.1 real Chromium fixture](../mv39/README.md).

[Specification EN](../../planning/SPRING_ADMIN_MEMBER_WEB_UI_v2026.11.19.40.md) · [한국어](../../planning/SPRING_ADMIN_MEMBER_WEB_UI_v2026.11.19.40.ko.md) · [QA](../../qa/2026-11-19-spring-admin-member-web-v40.md).
