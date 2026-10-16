# v2026.10.16.735 — Exact-source browser QA follow-up

**Scope:** isolated dcef7520 Test canary, **NOT PUBLIC Test/Production promotion**. [한국어](2026-10-16-five-pass-ui-followup-v735.ko.md)

- Source SHA dcef75208f0e74702c7c5426f06d3ee38726a094 built with identical Next frontend and Nest backend. Local ports 3364/3363, health and versions HTTP 200. Official Test v721.2 and Production v717 pointers unchanged.
- Real Playwright Chromium runs: 5 passes x 166 page templates = 830 visits at mixed 320,360,375,390,412,430,768,1024,1280,1440 CSS widths, using Test-only temporary operator role for admin rendering. All 675 static page visits HTTP 200, 170 admin visits HTTP 200, 0 detected document overflow, 0 pageerror exceptions. 130 HTTP 404 were generated invalid dynamic placeholders across 26 route templates, not positive-route failures.
- All authenticated admin rendering visits use a **synthetic Test operator with admin timestamps injected for rendering**. The fixture does not test real second factor or rotation. The QA fixture must be revoked and deleted after testing.
- Measured static missing H1 on `/admin/fx`, `/admin/kdic`, `/stocks/community`; redirect-only `/casino` and `/profile/settings` also naturally render no H1. Three displayed primary headings corrected in candidate source (subsequent SHA; pre-fix evidence cannot verify post-fix).
- Browser counting surfaced 7,135 small-control *instances over 830 visits*, including unclassified inline links and repeated components; not 7,135 unique touch-target failures. Additional valid dynamic, keyboard/zoom/long label, interactions and measured admin guard gates are incomplete. v530 remains BLOCKED.
- Live Production financial DML P0 unaffected; app role direct writes still granted on 237 Production tables. Isolated schema-only ACL experiment 237->224->221, still high risk. Do not cut over without actual reviewed finance DB permission/ledger tests.
