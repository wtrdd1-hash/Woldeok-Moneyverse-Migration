# v2026.10.28.1413 — Verified blog release acceptance QA

Before: User ordered implementation. Read latest master, v1405 policy and concurrent v1412 writer/publisher already merged into main. Created conflict-free separate branch.

Midpoint: Implemented read-only Test/localhost-only exact-SHA verification, anonymous admin deny, visible publication status, locale/topic, primary source in body, minimum article size, unique receipts and detail consistency. Explicit BLOG_QA_REQUIRE_POST=true requires nonempty published results.

Tests: Local mock HTTP service checks empty and single-post flows and rejects Production as a test target. No Test or Production promotion, DB or scheduler change. Official E2E, finance safety and live publishing evidence remain necessary.

## v1413.1 — live source connectivity and fixed CN economy evidence
- Probed all 12 allowlisted HTTPS primary-source endpoints on the miniPC with manual redirects and strict content-type/size criteria. Eleven passed HTTP 200; the Chinese economics source formerly at /en/3688110/index.html returned HTTP 404 (146 bytes). Replaced **only that source URL** with the People's Bank of China official Monetary Policy Department native-language page at https://www.pbc.gov.cn/zhengcehuobisi/125207/index.html, independently verified HTTP 200, text/html, 43,987 bytes. Added 2 registry coverage tests, PASS.
- Both public Test and Production `/api/v1/blog/verified` currently return HTTP 404 `app_gateway_path` (Nginx does not route this backend path). Source is merged to main, but this is not proof of real publishing. Production/Test unchanged.
