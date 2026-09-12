# Search Discovery Operations v2026.09.13.1

Date: 2026-09-13
Type: documentation-only planning update
Branch/PR: none; applied directly to current `main` under the current documentation workflow
Test deployment: not required for this documentation-only change
Runtime verification: unavailable; external fetch of `https://easy-scraping.com` returned status 530

## Why

The existing monetization/compliance/SEO specification established sound policy, but search operations still needed a buildable contract for route indexability, canonical/hreflang behavior, sitemap segmentation, JavaScript rendering, pagination/infinite scroll/faceted navigation, search dashboards and release validation.

## Changes

- Added `SEARCH_DISCOVERY_OPERATIONS_SPEC.md` as the English canonical specification.
- Added synchronized Korean counterpart.
- Defined route-level states: `INDEXABLE_PUBLIC`, `PUBLIC_NOINDEX`, `AUTH_REQUIRED`, `OPERATOR_ONLY`, `TEST_ONLY`.
- Added canonical consistency requirements across HTML, internal links and sitemaps.
- Added EN/KO self-canonical + reciprocal hreflang rules.
- Added sitemap-index architecture and exclusion rules for private/Test URLs.
- Clarified robots.txt vs noindex vs authentication responsibilities.
- Added Next.js/JavaScript rendering acceptance criteria.
- Added crawlable pagination and infinite-scroll fallback requirements.
- Added default noindex policy for faceted/filter combinations unless they have independent search value.
- Added structured-data policy and removed dependency on FAQ rich-result exposure.
- Added Google/Naver operational dashboard metrics and runtime release gates.

## Research reviewed 2026-09-13

Directly adopted:

- Google Search Central sitemap documentation, updated 2026-07.
- Google canonical documentation, updated 2026-07.
- Google Core Web Vitals guidance current through 2025-12.
- Naver Search Advisor sitemap, preferred URL/canonical, JavaScript/resource/link and structured-data guidance.
- Naver 2026-07 announcement ending FAQ structured-data exposure in search results.

Reference-only:

- Search result enhancements are not guaranteed by structured-data markup and may change independently of product releases.

## Legal / revenue / SEO impact

- Legal/privacy: reduces accidental indexing risk for private/account/security/operator/Test routes; no new data processing or user-facing legal promise is introduced.
- Revenue: protects public-content ad monetization from duplicate indexing and Core Web Vitals regressions; ad scripts remain subordinate to page experience.
- SEO: adds an operational model for Google + Naver, EN/KO parity, canonical/hreflang, sitemap and crawl control.

## Next priority

1. Implement first-party authentication/security P0 work in a separate runtime branch and Test environment.
2. When service health returns, execute the Runtime Product Reality Audit, including actual robots/sitemap/canonical/hreflang/HTTP-state verification.
3. Convert the search route registry into a machine-readable runtime config and automated SEO smoke checks before Production changes.
4. Continue economy sink expansion and 30/90/180-day economy simulation planning without reintroducing arbitrary hard caps.
