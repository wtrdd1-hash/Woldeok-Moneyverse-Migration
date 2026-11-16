# Production/Test AdSense delivery audit — v2026.11.17.0657

**Status:** PARTIAL DELIVERY VERIFIED / TEST POLICY REGRESSION / AD FILL UNVERIFIED
**English canonical** | [한국어](2026-11-17-live-advertising-audit-v2026.11.17.0657.ko.md)
**Source:** `origin/main` `2c1ea4cd7734e67f6047c68eb4ec884940ac7a09` (start and mid verified 2026-11-17 KST).
**Issue:** [#3217 — Test AdSense isolation violation](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3217)

## Scope and safety

- Anonymous GET/HEAD checks, source/config inspection, public CSP, `ads.txt`, `/api/viewer`, `/api/version` and read-only Playwright in Chrome desktop 1366×900 and mobile 390×844.
- Playwright intercepted Google ad endpoints and served a no-op bootstrap queue to **avoid automated real impressions or clicks**. This proves client-side slot/bootstrap insertion, not network auction, Google fill, viewability or earnings.
- No authenticated admin sessions, AdSense console, payout records, or consenting human impression tests. No application changes, database writes, Test rebuild or Production cutover.

## Results from actual public endpoints (2026-11-17 KST)

| Verification | Production `easy-scraping.com` | Test `test.easy-scraping.com` |
| --- | --- | --- |
| `/ads.txt` | HTTP 200; exact `google.com, pub-5220225531544323, DIRECT, f08c47fec0942fa0` | HTTP 200; same record (file alone does not serve an ad) |
| AdSense JavaScript origin | Google loader HTTP 200 from mini-PC by curl; on public ad routes browser emitted script tag | Browser emitted script tag on some routes **despite expected ads-off** |
| `/api/viewer` anonymous | HTTP 200 `signedIn:false` | HTTP 200 `signedIn:false` |
| `/api/version` | HTTP 200, response advertised Java Spring Boot 3.3.5 / `v2026.11.14-spring`; **not frontend build proof** | HTTP 200, same advertised Spring API metadata; **not frontend build proof** |
| CSP `frame-src`/`script-src`/`connect-src` | Google ad origins allowed on the inspected public route | Google ad origins allowed when Test contract requires ads disabled |
| Browser check, 10 routes × 2 viewports | 20 cases: 8 `SLOT_AND_SCRIPT_READY`, 2 homepage no slot, 2 blog index no slot, 8 policy-blocked cases | 20 cases: 5 `SLOT_AND_SCRIPT_READY`, 5 other no-slot, 2 blog index no slot, 8 policy-blocked cases |

Production showed valid publisher/slot DOM on `/tools`, `/guide/glossary`, `/gallery`, `/tools/retirement-calculator` at desktop and mobile widths. Example slots: home/display `2118692561`, in-article `6000051656`, multiplex `9751074883`. No JavaScript runtime errors were observed in this bounded sampling. `ins` elements in CSS-hidden ultrawide rails had width 0, while content slots measured up to 970px desktop and 334px mobile; zero-width hidden rails do not constitute paid ad views.

Blocked-case results include `/board`, plus `/wallet` and `/admin` flows that redirected to `/login` for the anonymous browser. They do not prove authenticated admin behavior. Other protected routes were not comprehensively tested.

## Findings and severity

### P0 — Test-origin advertising off contract not enforced (confirmed)

Historical [v2026.09.13.42](../changelog/2026-09-13-ads-default-enabled-v2026.09.13.42.md) explicitly keeps isolated Test ad-free. Yet the public Test Chrome session rendered `ins.adsbygoogle` and AdSense `<script>` on multiple pages, and Test CSP still allowed Google ad destinations. The configured Nginx Test origin proxies application traffic to `127.0.0.1:3101`. That Next process showed both `ADS_ENABLED=false` and `NEXT_PUBLIC_ADS_ENABLED=false` in its environment. Because the repository defaults ads to enabled when not explicitly disabled and supports statically generated/serialized pages, **a build/pre-render/browser-bundle/edge cache mismatch is a plausible mechanism, not a verified root cause**. Check immutable Build ID, server/prerender traces, active edge asset hashes and runtime environment in a separate remediation branch.

**Acceptance:** Test has zero AdSense scripts, zero `ins.adsbygoogle` after hydration/navigation on approved content, `frame-src 'none'` and no AdSense script/connect CSP allowlist, with exact-SHA release proof. No synthetic Google impressions. Keep Production enabled only for reviewed content.

### P1 — Homepage eligible by source policy but has no current ad placement (confirmed implementation drift; placement approval required)

`isEligiblePublicAdPath('/')` returns true and the production browser loads the AdSense bootstrap script, but `/` renders zero ad slot elements in both viewports. The live home page in `frontend/src/app/page.tsx` has no `PublicAdvertisement`/`HomeAdvertisement` call; older `mobile-home-view.tsx` and `home-dual-surface.tsx` contain ad placements but are not the active route. **Do not insert a slot near balance, transfer or account controls**: first review page eligibility and designate an independent content-only section. This is not evidence of a Google delivery failure; there is no placement to fill.

### Informational — Blog index shows no AdSense placement

`/blog` returned HTTP 200 and loaded bootstrap but no slot on either viewport. Article placement is controlled separately by blog content length (`getBlogAdPlan`). This sample did **not** inspect a published long-form article, so the index's absence is not independently a defect.

### Unverified — real Google fill and revenue

No verified AdSense account policy/approval, fill status (`data-ad-status=filled`), genuine auction response, impressions, clicks, viewability, revenue/RPM, or AdSense payout evidence. Never claim delivery or earnings from `ads.txt`, a script HTTP 200, DOM slot or a test stub. Authentication/admin behavior also remains untested.

## Tests and follow-up

- Existing frontend targeted Vitest tests: **46 PASS / 3 files** with `NODE_ENV=test`; initial inherited `NODE_ENV=production` caused 4 React testing-library `React.act is not a function` harness failures, resolved by the test-mode rerun. No test file changed.
- Browser outputs retained on mini-PC: `/srv/moneyverse-data/reports/ads-live-v2026.11.17.0657/browser-ad-audit.json`, `browser-test-ad-audit.json`, `target-unit-tests-node-env-test.log` (not public artifacts).
- Required: fix #3217 by Test build/config/cache isolation and repeat Chrome + edge CSP acceptance; review homepage public-content placement separately; verify actual fill/revenue only in the authorized AdSense console/legitimate human sessions; run exact-SHA Test backend + frontend release gates and rollback before Production changes.
- **Runtime/Test/Production mutation: NONE. Production promotion: NOT PERFORMED.**
