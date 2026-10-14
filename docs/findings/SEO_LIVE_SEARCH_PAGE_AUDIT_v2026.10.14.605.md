# Live SEO and Search Landing Audit — v2026.10.14.605

> FINDINGS / PLANNING PROPOSAL; 2026-10-14 KST; read-only audit, no deployment. Authority remains PROJECT_PLAN and INTEGRATED_PLANNING_MASTER, plus v527 SEO admission. v604 feature-SEO proposal is isolated and unmerged.

## Verified observations
The dedicated Moneyverse MCP reports frontend/backend/nginx active and development database connected; this is not search health. Host curl returned HTTP 200 for / (206603 bytes HTML), /robots.txt (486 bytes text), /sitemap.xml (1282085 bytes XML), compound tool (202601 bytes HTML), salary tool (173761 bytes HTML), and /blog (433476 bytes HTML). HTTP response alone does not establish valid indexation.
Public search rendering reveals /en/tools with largely Korean headings/body, and /ja/tools/compound-calculator with Korean H1/body. /tools labels itself '5 Calculators' while enumerating more. Virtual WLD stock/calculator content is adjacent to real-world FX/tax and 'live' indicators without a demonstrated source/as-of label. The guide uses strong '100% lossless' language despite open security/economy QA gates. Search visibility of select URLs does not prove sitewide indexation or traffic.
Detailed HTML metadata, sitemap XML and actual GSC/Naver data could not be exhaustively inspected; multiple extended host commands were blocked by safety controls.

## Corrective backlog
- SEO605-01 P0: verify server-rendered language, title/H1/body and reciprocal hreflang on EN/JA; do not index incomplete translations.
- SEO605-02 P0: separate live market/FX data from static examples with verified source, fetchedAt/asOf, stale and missing data states.
- SEO605-03 P1: synchronize tool hub count and metadata with real inventory.
- SEO605-04 P1: separate game WLD from real-world finance/tax calculation, units, assumptions and jurisdictions.
- SEO605-05 P1: parse large sitemap, audit duplicate locs, indexability, canonical, lastmod and segmentation; size alone is not a failure.
- SEO605-06 P1: reconcile candidate pages with v527 measured-demand and independent-value gates; prevent cannibalization and low-value scaled pages.
- SEO605-07 P1: instrument search→tool completion→guest scenario→signup→first action and privacy-safe cohort retention.
- SEO605-08 P1: validate or qualify '100% Verified', 'IndexNow Active', 'lossless' and live promotional claims.
- SEO605-09 P1: audit redirects, SSR metadata, robots/noindex, canonical, hreflang, JSON-LD, structured data, 404 and accessibility.
- SEO605-10 P1: preserve v530 5-pass all-route UI and v603 security blockers before any production change.

## Acceptance
For each public candidate URL gather exact HTTP/redirect, SSR title/description/html lang/H1, canonical, hreflang reciprocity, structured data, sitemap membership, source and effective date, freshness, content uniqueness, locale correctness, internal links, CTA, mobile viewport/keyboard and LCP/CLS/INP. Measure GSC/Naver organic query/page/country/device and indexed/excluded states; numbers stay unspecified until evidence. Preserve v523 funded Economy Core and separate virtual WLD simulation from real financial advice. This audit is not adoption into the authoritative plan.

## Provenance
GitHub main c56af867ad8f7556e53f895b0bb294c4bfc8a02d, rechecked unchanged. Moneyverse MCP used for live diagnostics; no Test/Production modification.
