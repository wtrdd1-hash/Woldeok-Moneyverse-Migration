# v2026.11.18.24 — First Real Spring Frontend Browser Cutover

**2026-11-18 KST · PRODUCTION_VERIFIED / LIMITED PUBLIC ROUTES ONLY.**
- **Fix:** New trusted immutable Spring frontend root with legacy fallback; missing JS/CSS authentic 404, not SPA200. TDD and Spring195 JUnit PASS, bootJar PASS.
- **Build:** Reproducible 18 anonymous public Next HTML captures, hashed 1005 static assets from previously tested source Next BUILD_ID1794990553432; temporary Node preview stopped.
- **Release:** Official internal Test v24 Spring and Production v24 read-only Spring, 13 static-safe public paths routed on Nginx via zero-downtime reload; new versioned Nginx snippets preserve old SEO and login assets. Production external HTTPS homepage/tools 200, v24 header, byte-exact HTML/JS/CSS. Older Spring/preview versions retained as rollback.
- **HOLD:** React-dependent dynamic routes and private/auth/financial transactions not migrated, browser hydration/navigation and 320px QA unverified, external Test403, other full-platform P0 gates. No all-site claim.
