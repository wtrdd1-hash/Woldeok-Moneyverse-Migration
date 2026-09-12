# Woldeok Moneyverse — Search Discovery Operations Specification

> Version: v2026.09.13.1
> Status: Living implementation-oriented SEO/search operations specification
> Date: 2026-09-13
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`
> Korean counterpart: [SEARCH_DISCOVERY_OPERATIONS_SPEC.ko.md](SEARCH_DISCOVERY_OPERATIONS_SPEC.ko.md)

## 1. Purpose

This specification converts Moneyverse search-growth policy into an implementable operating contract for Google and Naver. It covers URL ownership, crawl/index rules, canonicalization, localization, sitemaps, JavaScript rendering, pagination/faceted navigation, structured data, Core Web Vitals, Search Console/Search Advisor operations, monitoring and release gates.

Search acquisition must never expose private account, balance, portfolio, moderation, security, admin, checkout or test-environment data.

## 2. Search surface registry

Every route family must be registered with one of these states:

- `INDEXABLE_PUBLIC`: intended for search discovery.
- `PUBLIC_NOINDEX`: public but not useful as a search result.
- `AUTH_REQUIRED`: protected by authentication and excluded from indexing.
- `OPERATOR_ONLY`: admin/moderation/operations only.
- `TEST_ONLY`: staging/Test; always excluded from indexing.

Initial route policy:

| Route family | State | Canonical policy |
|---|---|---|
| `/en/`, `/ko/` | INDEXABLE_PUBLIC | self-canonical |
| `/en/guide/*`, `/ko/guide/*` | INDEXABLE_PUBLIC | locale self-canonical + reciprocal hreflang |
| fictional company/lore pages | INDEXABLE_PUBLIC | stable ticker slug |
| public season/archive pages | INDEXABLE_PUBLIC | stable season slug |
| glossary/help/safety public pages | INDEXABLE_PUBLIC | stable content slug |
| public community index | conditional INDEXABLE_PUBLIC | only if moderation/quality gate passes |
| search/filter result pages | PUBLIC_NOINDEX by default | canonical to appropriate hub if duplicate |
| account/wallet/private portfolio | AUTH_REQUIRED | no public canonical |
| login/security/consent/checkout | PUBLIC_NOINDEX or AUTH_REQUIRED | noindex where crawlable |
| admin/moderation/operator queues | OPERATOR_ONLY | auth + noindex defense-in-depth |
| `test.easy-scraping.com` | TEST_ONLY | noindex; never emit Production canonical accidentally |

## 3. Canonical URL contract

For every indexable page:

1. emit exactly one deterministic absolute canonical URL;
2. canonicalize to the same locale where an equivalent localized page exists;
3. use server-side redirects for obsolete/moved URL variants;
4. never use `robots.txt` as a canonicalization mechanism;
5. sitemap URLs, internal links and canonical links must agree;
6. query parameters used only for sort/filter/tracking must not create competing canonical pages;
7. JavaScript must not rewrite a correct server-rendered canonical to another value after hydration.

Canonical conflicts are a release-blocking SEO defect when they can create duplicate or cross-environment indexing.

## 4. EN/KO localization and hreflang

For paired English/Korean pages:

- `/en/...` canonicalizes to itself;
- `/ko/...` canonicalizes to itself;
- each page emits reciprocal `hreflang="en"` and `hreflang="ko"` links;
- optional `x-default` points to the neutral language selector/home only when that route is genuinely useful;
- title, description, H1 and visible body language must match the locale;
- untranslated placeholder pages must not be indexed merely to create keyword coverage.

Translation parity is product quality, not only SEO. A materially incomplete Korean page should remain noindex until useful.

## 5. Sitemap architecture

Generate sitemaps from the search-surface registry, not by crawling every application route.

Recommended files:

- `/sitemap.xml` as index;
- `/sitemaps/pages-en.xml`;
- `/sitemaps/pages-ko.xml`;
- `/sitemaps/guides-en.xml`;
- `/sitemaps/guides-ko.xml`;
- `/sitemaps/companies.xml`;
- `/sitemaps/seasons.xml`.

Rules:

- include only canonical, indexable 200 URLs;
- use absolute Production HTTPS URLs;
- do not include auth/private/noindex/Test URLs;
- update `lastmod` only when meaningful indexed content changes;
- split before protocol limits are reached;
- submit the sitemap index to Google Search Console and Naver Search Advisor;
- expose sitemap generation status and last successful generation in operator tooling.

## 6. robots.txt and noindex

`robots.txt` controls crawling, not privacy and not reliable de-indexing.

- sensitive data is protected by authentication/authorization first;
- crawlable pages that must stay out of results use `noindex` meta or `X-Robots-Tag`;
- do not block a URL in robots.txt when a crawler must read its `noindex` directive;
- allow critical JS/CSS needed to render indexable pages;
- advertise the Production sitemap location in Production robots.txt;
- Test robots.txt and headers must prevent accidental indexing without referencing Production canonicals incorrectly.

## 7. JavaScript/Next.js rendering contract

Indexable pages must provide useful HTML before client-only interaction.

Required:

- primary title/H1/body/links available in initial rendered HTML where practical;
- canonical/hreflang/meta generated deterministically server-side;
- crawlable links use real `<a href>` URLs rather than JavaScript-only navigation handlers;
- critical JS/CSS resources required for rendering are crawlable;
- error/loading shells must not be emitted as permanent 200 indexable content;
- client hydration must not erase public content required for indexing.

CSR-only content that contains the page's primary searchable value is a design smell and requires explicit review.

## 8. Pagination, infinite scroll and faceted navigation

Large catalogs/community archives must remain crawlable without generating unbounded duplicate URLs.

### Pagination

- every logical page has a stable URL such as `?page=2` or path equivalent;
- paginated pages use self-canonical when they contain distinct list content;
- internal links expose next/previous page URLs;
- page 2+ must not all canonicalize to page 1 solely to suppress duplicates.

### Infinite scroll

Infinite-scroll UI must have an underlying paginated URL model that works without scroll events. Browser history should update as appropriate, and direct loading of a paginated URL must return the expected slice.

### Facets/filters

Default: filter/sort combinations are `PUBLIC_NOINDEX` unless a specific combination has independent search intent and unique maintained content. Do not mass-index combinations of sector, sort, price, tag and date that create thin doorway-like pages.

## 9. Structured data

Structured data must describe visible content accurately and must not promise rich-result eligibility.

Candidate types:

- `WebSite` / organization identity where valid;
- `BreadcrumbList` for hierarchical public content;
- `Article` for maintained editorial/guide content when requirements are met;
- other schema only after checking current Google/Naver support.

Do not build SEO plans around FAQ rich-result exposure. Naver announced the end of FAQ structured-data exposure in July 2026, and Google had already reduced/removed FAQ rich-result support for most sites. Visible FAQ content can still exist for users.

## 10. Public content quality contract

Every indexable page must provide independent user value.

Required attributes:

- clear intent and descriptive title/H1;
- unique maintained body content;
- author/source/date context where relevant;
- internal links to useful related pages;
- explicit virtual/simulated disclaimers on WDX/WLD finance-like pages;
- no keyword stuffing, doorway pages, cloaking or mass low-value AI pages;
- no fabricated reviews, testimonials, credentials or financial claims.

Programmatic pages are permitted only when the underlying entity/data has real user value and the page is more than a template with substituted keywords.

## 11. Performance and Core Web Vitals

Search pages share the same performance budget as monetization.

Targets at the 75th percentile:

- LCP <= 2.5s;
- INP < 200ms;
- CLS < 0.1.

Ad slots reserve dimensions. Search landing pages should prioritize primary content before optional ad/analytics scripts. A monetization experiment that materially degrades page experience requires rollback or redesign.

## 12. Search operations dashboard

Minimum operator metrics:

- indexed valid pages by locale/content family;
- submitted vs indexed sitemap URLs;
- excluded/noindex/duplicate/canonical issue counts;
- crawl errors and 404/soft-404 trends;
- Core Web Vitals pass rate;
- organic impressions, clicks, CTR and average position;
- non-brand organic sessions;
- EN/KO organic split;
- organic landing -> signup -> activation conversion;
- top landing pages and query clusters;
- canonical mismatch rate;
- hreflang parity errors;
- sitemap generation failures;
- accidental Test/private URL discovery count.

Google and Naver metrics must remain separately identifiable.

## 13. Release gate

For any change affecting public routing, rendering or metadata, validate in Test before Production runtime deployment:

1. representative public URLs return intended HTTP status;
2. canonical is absolute, correct locale and correct environment;
3. paired EN/KO hreflang is reciprocal;
4. private/admin/auth routes are absent from sitemap;
5. Test remains noindex;
6. sitemap XML validates and contains only allowed URLs;
7. robots.txt does not block critical public rendering resources;
8. title/H1/body are present in rendered HTML;
9. structured data matches visible content;
10. mobile layout and Core Web Vitals are checked;
11. 404/removed content does not return misleading 200 soft-404 pages.

Documentation-only edits do not require Test deployment. Runtime SEO changes do.

## 14. Analytics events

Suggested events:

- `search_landing_view`;
- `search_landing_primary_cta`;
- `search_signup_start`;
- `search_signup_complete`;
- `search_activation_complete`;
- `public_content_internal_link_click`;
- `locale_switch_from_search`;
- `search_zero_result_internal`;
- `sitemap_generation_success` / `failure`;
- `canonical_validation_failure`;
- `hreflang_validation_failure`.

Do not send private wallet/portfolio/order contents to advertising systems for search attribution.

## 15. Research note — 2026-09-13

Directly adopted:

- Google Search Central sitemap guidance updated 2026-07: canonical/indexable absolute URLs, sitemap limits and sitemap-index use.
- Google canonical guidance updated 2026-07: robots.txt is not canonicalization; canonical signals should agree; same-language canonical is preferred for hreflang clusters; JavaScript should not create conflicting canonical values.
- Google Core Web Vitals guidance current through 2025-12: LCP 2.5s, INP 200ms, CLS 0.1 targets.
- Naver Search Advisor current guidance: submit sitemaps as discovery feeds, use canonical/preferred URLs, keep render-critical resources crawlable, use real href links and structured data where supported.
- Naver 2026-07 notice: FAQ structured-data search-result exposure ended; Moneyverse must not depend on FAQ rich-result visibility.

Reference only:

- structured-data eligibility may change without notice; markup is not a guarantee of special result presentation.

## 16. Runtime verification

At this planning pass, `https://easy-scraping.com` returned HTTP/fetch status 530 from the available external check. Production UI/search reality therefore remains `runtime verification unavailable` for this version. No healthy Production state is inferred from documentation.

## 17. Definition of Done

Search discovery is not complete until:

- every route family has an indexability state;
- canonical/hreflang/sitemap/robots rules agree;
- EN/KO public content parity is verified;
- Test/private/admin/account routes are excluded safely;
- pagination/facets cannot create an unbounded index;
- public pages remain usable on mobile and meet accessibility/performance acceptance criteria;
- Google Search Console and Naver Search Advisor operating checks are assigned;
- analytics connect search landing traffic to signup and activation without leaking private economy data;
- English/Korean specifications remain synchronized.
