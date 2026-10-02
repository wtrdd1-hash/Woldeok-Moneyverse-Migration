# Full-Site Runtime / SEO / Release Audit — v2026.10.02.505

> Status: AUDIT COMPLETE / READ-ONLY / NOT PROMOTED  
> Date: 2026-10-02 KST  
> Start / mid / final authority: `origin/main=5a7c658b38853f564983d19f961c689a494dc4b6`  
> Scope: production + Test HTTP surfaces, runtime identity, route inventory, SEO/indexability, locale behavior, advertising boundaries, security headers, recent service/access logs, source typecheck/tests, infrastructure health.  
> No application code, DB data, service configuration, Test runtime, or Production runtime was mutated.

## Executive result

The public site is broadly reachable, source tests are healthy, security headers are generally strong, and infrastructure capacity is not currently constrained. The primary risks are not “the whole site is down”; they are **release identity split, Production Next.js cache write failure, repeated authenticated chat gateway 500s, and multiple SEO indexability/canonical defects**.

Current source inventory: **112 Next.js page routes / 24 admin routes / 12 dynamic routes**. Inventory SHA-256: `6d7772e18e22d6370652aa645a8a135e33a397f941ba90b78ac7971e15c31259`.

## Release blockers / high-priority findings

### AUD505-01 / P0 — Production and Test are not running one exact candidate
- `production-current -> prod-v504`, `test-current -> test-v504`.
- Actual process CWD:
  - Production frontend: `prod-v504/frontend`.
  - Production backend: `prod-v495/backend`.
  - Test frontend: `test-v503/frontend`.
  - Test backend: `test-v495/backend`.
- Both backend `/api/version` endpoints report `7080738e656aca099d5c871278d178d69a984fcc`, while current main / v504 source is `5a7c658b...`.
- There are 6 commits after the backend-reported SHA; compared with main they include 14 backend files and 77 frontend files.
- Direct proof of Test/Production divergence: `/feed.xml` is 200 in Production but 404 in Test.
- This fails the exact-candidate/Test-first promotion contract.

**Acceptance:** Test frontend + backend must run the same exact candidate SHA intended for Production; Test must prove it before zero-downtime Production promotion. Runtime identity must be externally verifiable for both frontend and backend.

### AUD505-02 / P0 — Production Next.js runtime cannot write prerender/fetch cache
- Production frontend service runs as `debian`.
- `prod-v504/frontend/.next`, cache directories and generated files are `root:root` with non-writable modes for the runtime user.
- Observed **199 EACCES cache-write failures in the last 2 hours** during this audit.
- Failures include fetch-cache entries and attempts to update `sitemap.xml.body` / `robots.txt.body`.
- Test v503 cache directories are owned by `debian:debian`, so the defect is Production-specific.

**Acceptance:** runtime-writable cache paths must be owned/ACLed for the service user without making the immutable release tree broadly writable; restart/cutover must preserve rollback safety; logs must remain free of EACCES under crawl/load smoke.

### AUD505-03 / P0 — Global direct-chat polling is generating repeated 500s for signed-in traffic
- In the latest 20,000 Nginx access lines, **502 HTTP 500 responses** were observed for `/app-api/v1/chat/conversations`.
- Examples continue through 20:41 KST and appear with referrers such as home/account/stocks.
- The global floating support/chat widget polls conversations every **30 seconds while signed in even when closed**, and every 5 seconds when an active chat is open.
- Guest requests currently return the correct 401, so the failure is associated with signed-in/request state and is not reproduced by an anonymous probe.
- Backend journal had no matching Production backend errors in the sampled window, so the failure boundary still needs authenticated trace/request-id correlation.

**Acceptance:** reproduce with a non-privileged Test account, correlate request IDs across frontend gateway/backend/DB, fix root cause, and verify zero repeated 5xx during at least one polling window matrix.

### AUD505-04 / P0 — Current mandatory full-route QA evidence is missing for the 112-route source
- Current source has 112 pages versus the older planning snapshot of 86.
- A full-route QA plan exists, but the audited plan remains unchecked and no current 5-pass exact-candidate ledger was found.
- Static HTTP smoke is not a substitute for authenticated browser interaction, dynamic valid/not-found/permission fixtures, responsive clipping checks, admin actions, or 5 full passes.

**Acceptance:** generate source inventory from exact candidate, run all pages including 24 admin and 12 dynamic routes across the required viewport/role/state matrix for 5 full passes, and produce a passing ledger tied to the exact runtime SHA.

## SEO / search-discovery findings

### AUD505-05 / P1 — Sitemap is healthy at HTTP level but internally inconsistent
Live Production sitemap:
- 416 entries, **403 unique URLs**, 13 duplicate entries.
- All 403 unique URLs returned HTTP 200.
- **11 sitemap URLs are `noindex`** (10 stock detail pages + `/stocks/derivatives`).
- **12 sitemap URLs have a canonical mismatch**, including 10 stock detail pages, `/marketplace/auction`, and `/prediction`; these canonicalize to the site root.
- The 10 stock detail pages also share the same generic title.
- `robots.txt` prefix rules conflict with sitemap membership for at least `/account-deletion` (`Disallow: /account`) and `/businesses/ventures` (`Disallow: /businesses`).

**Acceptance:** sitemap must contain only canonical/indexable 200 URLs, duplicate entries removed, and robots/canonical/noindex signals made mutually consistent.

### AUD505-06 / P1 — Arbitrary parameter values can create indexable URL space
- Unknown stock preset without a recognized suffix returns 404, but arbitrary tickers with a recognized scenario do not.
- Examples such as `/tools/stock-calculator/zzzznotreal-minus-10`, `.../zzzznotreal-double-down`, and `/this-is-junk-minus-50` return **200 + index,follow + self-canonical**.
- Arbitrary invalid invite codes such as `/invite/not-real-code` also return **200 + index,follow** and a promotional title.
- This creates an effectively unbounded crawl/index surface and conflicts with the search spec prohibition on infinite/thin URL spaces.

**Acceptance:** validate against an authoritative slug/code universe; invalid values must return 404/410 or noindex without self-canonical indexability. Add regression tests for random-token cases.

### AUD505-07 / P1 — Public “20,000+ pSEO” claim is not aligned with the registered corpus
- Live `/api/indexnow` reports `totalPseoUrls: 355`.
- Source has 71 configured popular stocks × 5 scenarios = 355 generated popular slugs.
- Sitemap has 361 stock-calculator URLs and 403 unique URLs total.
- Dynamic arbitrary ticker generation can create more URLs, but that is not equivalent to a curated/indexable 20,000-page corpus.

**Acceptance:** either build and quality-gate the claimed corpus with canonical unique content and sitemap discoverability, or correct the public claim to the verifiable corpus size.

### AUD505-08 / P1 — Locale routes work, but translation/canonical parity is incomplete
Sampled KO/EN/JA/ZH:
- Home and `/stocks` have localized titles/canonicals.
- `/en|ja|zh/guide` return 200 but canonicalize to Korean `/guide`; metadata/body remain partly Korean/English.
- `/en|ja|zh/tools` have localized titles but sampled H1 remained Korean.
- `/privacy` and `/terms` locale variants remained Korean and canonicalized to the Korean base route.
- pSEO stock-calculator locale variants retain Korean titles and canonicalize to the Korean base URL.

**Acceptance:** every indexable locale page must have locale-specific body/meta/canonical/hreflang parity or be intentionally excluded from indexing until translation is complete.

### AUD505-09 / P1 — SEO automation has fail-open / abuse-prone surfaces
- `/api/indexnow` POST has no authentication gate and can cause outbound IndexNow submissions. Client-supplied URL arrays are accepted without same-origin URL validation before submission.
- `/api/seo/submit` returns a fabricated success payload when the backend call throws.
- `/api/seo/status` contains fabricated crawler metrics as a fallback when backend transport fails.
- Live GET `/api/seo/status` currently returns backend 401 rather than fallback, but the fail-open code remains present.

**Acceptance:** mutating SEO submission must require privileged authorization + CSRF/rate-limit/audit, validate host/path against the canonical registry, and transport failures must return explicit unavailable/unknown states rather than invented success/metrics.

## Revenue / advertising findings

### AUD505-10 / P1 — Sensitive-route ad exclusions are working, but SEO revenue inventory is sparse
Observed ad markers:
- Ads present on public surfaces such as home, `/tools`, `/board`, `/gallery`.
- No ad marker observed on account/security, bank, casino, chat, wallet, stock trading/detail, admin, work, quests, prediction, or auction samples. This matches the current ad-only safety boundary.
- However, the sampled high-intent pSEO detail `/tools/stock-calculator/samsung-minus-10` contains no ad unit. Source usage confirms ads are only inserted on a small set of pages (tools hub, tax/wealth calculators, gallery, announcements, board list, home).

**Acceptance:** add ads only to policy-allowed, substantial public content after UX/viewability experiments; do not weaken existing sensitive-route blocks. Measure Page RPM by route family before scaling.

## Performance / runtime observations

### AUD505-11 / P1 — Public content is origin-dynamic and some pSEO responses are slow
- Sampled public HTML routes return `Cache-Control: private, no-cache, no-store` and Cloudflare `DYNAMIC`.
- Warm root requests were roughly 0.8–0.9s total; `/guide` ~0.95s.
- A stock calculator sample ranged ~2.5–4.8s.
- During the full 403-URL sitemap audit, worst observed single requests were ~9–12s for several pSEO pages.
- These are point-in-time server/network observations, not Core Web Vitals.
- Combined with AUD505-02, origin rendering/caching needs correction before traffic growth.

### AUD505-12 / P2 — Home semantic heading and duplicate response headers need cleanup
- The rendered/source home hero has no semantic `<h1>`; its primary heading is a paragraph referenced by `aria-labelledby`.
- Response headers duplicate `x-frame-options`, `referrer-policy`, and `permissions-policy`.
- CSP is materially restrictive but still permits `unsafe-inline` for scripts/styles; this is a hardening limitation rather than proof of an exploit.

## Test / source health

Positive evidence on exact current main:
- Contract build: PASS.
- Frontend TypeScript typecheck: PASS.
- Backend TypeScript typecheck: PASS.
- Frontend Vitest: **169 files / 984 tests passed**.
- Backend Vitest: **115 files / 1,050 tests passed**; **53 files / 391 DB-conditioned tests skipped** in this environment.
- Frontend suite emits many React `act(...)` warnings and a deprecated Vitest configuration warning; these are test-quality debt.
- Because 391 DB-conditioned tests were skipped, these source-test results do not prove live DB behavior.

## Test-environment scheduler findings

### AUD505-13 / P1 — Test scheduled automation is failing repeatedly
Test backend journal:
- `work.auto_tune_policy` fails hourly: “the work console requires an administrator”.
- `stock.ai_scenario_auto` fails hourly: “the model API could not be reached”.
- `economy.anomaly_sweep` succeeds in the same period.

**Acceptance:** scheduled jobs in Test must use intended service authority and model dependency configuration, or be explicitly disabled with a truthful disabled state. No repeated scheduler errors before release acceptance.

## Infrastructure / security positives

- Debian host uptime ~7 days 10 hours; load during audit ~0.29 / 0.63 / 1.29.
- Root filesystem ~51% used; Moneyverse data disk ~33% used.
- Nginx, Production/Test frontend/backend, and economy-AI services active.
- Nginx configuration syntax passes.
- TLS certificate for `easy-scraping.com` valid through 2026-11-13.
- Production security headers include HSTS preload, CSP, COOP, nosniff, DENY framing and strict-origin referrer policy.
- A hostile Origin probe did not receive an `Access-Control-Allow-Origin` response.
- Test pages sampled return `X-Robots-Tag: noindex, nofollow`.
- Production RSS `/feed.xml` is valid RSS 2.0, 200, with public cache headers.

## Scope limitation

No graphical browser was available on the connected Debian 13 device. Therefore this audit does **not** claim the mandatory 5-pass visual/responsive/browser-interaction QA has been completed. HTTP/source/test evidence cannot prove clipping, touch interaction, focus behavior, authenticated mutations, or full dynamic fixture behavior.

## Recommended remediation order

1. Fix release identity / Test-first promotion discipline and restart exact candidate processes.
2. Fix Production Next.js cache ownership/write path.
3. Reproduce and repair authenticated `chat/conversations` 500 loop.
4. Close arbitrary indexable dynamic URL generation and sitemap/canonical/noindex conflicts.
5. Repair locale translation/canonical parity.
6. Make SEO submission/status fail closed and privileged.
7. Re-run exact-candidate Test, DB-conditioned tests, and mandatory 5-pass full-route browser QA.
8. Only then optimize public pSEO caching and policy-allowed advertising coverage.
