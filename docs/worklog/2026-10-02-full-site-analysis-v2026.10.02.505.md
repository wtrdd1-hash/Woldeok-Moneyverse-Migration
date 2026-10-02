# v2026.10.02.505 — Full-site analysis worklog

Status: COMPLETE / audit-only / no promotion
Start authority: origin/main `5a7c658b38853f564983d19f961c689a494dc4b6`
Mid authority recheck: `5a7c658b38853f564983d19f961c689a494dc4b6` — no drift
Final authority recheck: `5a7c658b38853f564983d19f961c689a494dc4b6` — no drift
Date: 2026-10-02
Scope: production/test runtime identity, full frontend route inventory, public HTTP smoke, SEO/indexability, i18n, security headers, monetization surfaces, performance indicators, source tests, recent logs, and infrastructure health.
Guardrails: no production mutation, no database mutation, no deployment, no privileged user action. Read-only runtime inspection only.

## Start record
- Debian 13 remote device online; device named `minipc` was offline.
- Repository working tree clean and aligned to origin/main.
- Current source inventory: 112 Next.js page routes, 24 admin routes, 12 dynamic routes.
- production-current/test-current symlinks both pointed to v504 at start of runtime inspection.

## Mid record
- Exact source route inventory generated: SHA-256 `6d7772e18e22d6370652aa645a8a135e33a397f941ba90b78ac7971e15c31259`.
- Static live smoke: Production 100 static routes = 88 HTTP 200 + 12 login-required 307, zero 4xx/5xx/transport errors; Test same.
- Runtime identity split proven:
  - Production frontend v504 / backend v495.
  - Test frontend v503 / backend v495.
  - Backend version endpoint `7080738e656aca099d5c871278d178d69a984fcc`, current main `5a7c658b...`.
- Production frontend cache EACCES reproduced; root-owned `.next` cache is not writable by service user `debian`.
- Nginx recent logs show repeated `/app-api/v1/chat/conversations` 500 responses consistent with global 30-second signed-in polling.
- Full sitemap audit: 416 entries / 403 unique / all 403 HTTP 200, but 11 noindex entries, 12 canonical mismatches, and 13 duplicate extras.
- Arbitrary pSEO ticker + valid scenario produces indexable 200/self-canonical; arbitrary invite code also indexable.
- Locale sampling confirmed incomplete translation/canonical parity outside home/stocks.
- Sensitive-route advertising blocks are working in sampled routes; high-intent stock-calculator pSEO detail lacks ads.

## End record
- Production `/feed.xml`: 200 RSS 2.0 with public cache; Test: 404, directly proving Test/Production frontend divergence.
- Production frontend emitted 199 EACCES cache-write failures in the audited two-hour window.
- Latest 20,000 Nginx lines contained 502 HTTP 500 responses for `/app-api/v1/chat/conversations`; anonymous probe currently returns correct 401, so authenticated trace correlation is still required.
- Test scheduler repeatedly fails:
  - `work.auto_tune_policy`: administrator authority missing.
  - `stock.ai_scenario_auto`: model API unreachable.
- Infrastructure is not capacity-constrained: load ~0.29/0.63/1.29, root disk ~51%, data disk ~33%, key services active, Nginx config syntax valid.
- Security header probe: HSTS/CSP/COOP/nosniff/frame DENY present; hostile Origin did not receive Access-Control-Allow-Origin.
- Source verification on exact main:
  - contract build PASS;
  - frontend typecheck PASS;
  - backend typecheck PASS;
  - frontend Vitest 169 files / 984 tests PASS;
  - backend Vitest 115 files / 1,050 tests PASS, 53 files / 391 DB-conditioned tests SKIPPED.
- Repository remained clean after verification.
- No graphical browser exists on the connected Debian device, so mandatory 5-pass visual/responsive/browser-interaction QA is **not claimed**.

Authoritative findings:
- `docs/findings/FULL_SITE_AUDIT_v2026.10.02.505.md`
- `docs/findings/FULL_SITE_AUDIT_v2026.10.02.505.ko.md`

No Test/Production promotion, service restart, permission change, application code change, or DB mutation was performed.
