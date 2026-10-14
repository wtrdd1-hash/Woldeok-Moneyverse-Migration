# GeoIP first-render locale restoration — v2026.10.14.631

**Status:** isolated candidate validated; Production promotion not claimed.
**Start base:** `b2e5e67517e628bc593aa80a13da950a741c15fb` (origin/main, 2026-10-14 21:53 KST).
**Mid-work upstream:** `28bd1e85` (new monetary change, no overlapping locale paths at inspection).
**Authority:** `AGENTS.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/planning/GLOBAL_GROWTH_EXECUTION_SPEC.md`, `docs/RELEASING.md`.

## Investigation / evidence
- Production Nginx forwards incoming `CF-IPCountry` to the frontend. The repository proxy already parses country codes and sets an inferred, short-lived cookie. Therefore the GeoIP mapping was **not deleted**.
- The old source never intentionally forwarded the derived locale as a request header to Server Components; root `LocaleProvider` started from a default rather than SSR locale, risking a hydration discrepancy.
- Controlled `KR/JP/CN/US` requests against existing Production runtime `prod-v600` produced matching `<html lang>`; **a complete live outage or deleted detector is not substantiated**. A real visitor's Cloudflare country signal and existing browser cookies have not been inspected.
- A legacy `wdmv_locale` cookie may reflect either manual choice or older inferred preference: do not silently override it. Provide an explicit reset-to-auto action.
- Product fallback is Korean; anonymous crawler public URLs must not IP-redirect. Explicit locale URL and saved user choice take priority. Locale is never a legal-jurisdiction authority.

## Implementation
1. Proxy sends validated, server-resolved `x-moneyverse-locale` on the **internal request** for same-request SSR and rewrites. It overwrites any inbound spoofed value; response signal remains diagnostic.
2. `getServerLocale` reads manual preference, then forwarded locale, then inferred cookie, then `ko`. Layout metadata, `<html lang>`, SSR content and `LocaleProvider initialLocale` share this resolver.
3. Unsupported/anonymized country + unsupported browser language fall back to `ko`; well-known overseas markets default to the supported `en` translation.
4. The language chooser can clear legacy manual/inferred cookies through **Automatic (country & browser)**. Manual choice remains authoritative until user resets.
5. The proxy stabilizes unprefixed crawler locale to `ko` rather than location-specific rendering. Localized explicit URLs remain routable.

## Verification evidence
- New regression test was RED on original source: **7 failures**. After repair: **23/23 targeted tests passed**, including automatic-reset UI.
- `pnpm --dir packages/contract build` and `pnpm --dir frontend typecheck`: PASS.
- `pnpm --dir frontend build`: PASS on initial candidate.
- Independent canary `127.0.0.1:3251` with `SEO_INDEXING_ENABLED=false`, API target `127.0.0.1:3100`: `KR=ko`, `JP=ja`, `CN=zh`, `US=en` on first HTML request. Isolated Test backend `/health`: HTTP 200.
- Legacy SEO tests for `/bank` indexability failed due to pre-existing route-contract drift, separate from locale changes. Run React component tests with `NODE_ENV=test` to avoid production-mode React `act` failure.
- No real authenticated pre-existing-cookie Test continuity proof, no exact merged-main Test proof and no Production rollout evidence. **Promotion blocked** until normal release gates pass.

## Change safety
Dedicated branch `fix/geo-locale-first-render-v2026.10.14.631`; concurrent agent branches untouched; no DB writes, migrations, authentication/session key changes, Nginx changes or Production pointer changes. Re-fetch `origin/main` and rebuild exact candidate before merge/deploy.

## Mid-work checkpoint and validation (2026-10-14 KST)
- New remote main: `28bd1e85` (monetary feature only; no overlapping locale files at inspection).
- The existing `prod-v600` instance returned first HTML `ko/ja/zh/en` for manually supplied `CF-IPCountry: KR/JP/CN/US`. **Country recognition is not globally removed; real-client cookie/header behavior remains a separate diagnostic concern.**
- Added request-scoped locale propagation and `LocaleProvider initialLocale` for SSR/client consistency; retained the manual cookie as authoritative.
- Added manual `Automatic (country & browser)` reset so legacy persisted locale does not permanently block automatic country detection.
- Original 7 first-request checks failed before patch. After patch, 23 targeted locale and language-menu tests pass with `NODE_ENV=test`.
- Contract build, frontend typecheck and isolated Next build PASS. Independent frontend on port 3251 served first HTML `KR=ko`, `JP=ja`, `CN=zh`, `US=en`; isolated Test backend port 3100 returned HTTP 200 `/health`.
- Legacy SEO route assumptions on `/bank` are unrelated failing assertions; do not misreport as this patch's regression.
- No evidence of authenticated Test session continuity, merge-main exact SHA or Production rollout. Keep promotion blocked until required gates.

## Mid-work correctness review
- Explicit URL must outrank a previously saved manual cookie in BOTH proxy and SSR. Fixed SSR resolver precedence: validated proxy request header first, then cookies only as a fallback.
- Added spoofed header, explicit URL-over-cookie and crawler stability regression tests; targeted checks now **23/23 passing**.
