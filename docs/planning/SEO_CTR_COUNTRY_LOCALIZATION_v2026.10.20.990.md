# SEO CTR and Country-Aware Localization — v2026.10.20.990

Status: IMPLEMENTATION CANDIDATE / Production HOLD. English canonical; Korean counterpart: SEO_CTR_COUNTRY_LOCALIZATION_v2026.10.20.990.ko.md.
Authority: PROJECT_PLAN -> INTEGRATED_PLANNING_MASTER; reuse v688 Search Console evidence, v860 acquisition, v920 locale routing, and v976 editorial safeguards. Do not waive economy ledger, authenticated UI or release gates.

## Measured evidence
Google Search Console domain property sc-domain:easy-scraping.com, final Web data 2026-09-19 through 2026-10-17: **1,383 impressions, 15 clicks, 1.08% CTR, average position 22.4**. Search pages JA loan /ja/tools/loan-interest-calculator: 91 impressions / 0 clicks; ZH loan /zh/tools/loan-interest-calculator: 86 / 0; nested /ja/en/guide/glossary/ex-dividend-date: 102 / 0. Search position and small samples prevent attributing all CTR weakness to metadata.

Observed live HTML of JA and ZH loan URLs had Korean title, Korean H1 and Korean canonical. Nested locale paths served HTTP 200. The separate compound calculation module used stale hardcoded exchange multipliers, initially USD on Japanese and Chinese pages, and described Japanese presets with fixed USD-to-JPY assumptions. Blog country articles linked to Korean-only interactive widgets.

## Implemented scope (isolated feature branch only)
1. Nested locale prefixes permanently normalize (308) to last explicit locale while preserving query parameters.
2. Dedicated, fluently translated US-English, Japanese and Chinese loan calculators, matching HTML language, visible copy, country context and self-canonical. Four-country currency selector KRW/USD/JPY/CNY, with independent example amounts. Same mathematical repayment formulas, no unsupported regional APR, fee or tax assumptions.
3. Canonical and reciprocal hreflang on actual translated loan/compound routes only, and corresponding sitemap entries. No claims of translations for Korean-only calculators.
4. Translated glossary summaries and regional source descriptions; omit unreviewed Hangul formulas and localized-page links to untranslated calculators. Keep reviewed symbolic formulas.
5. Loan/tool metadata trimmed to clear benefits without unsupported instant calculation or rate-completeness claims; duplicate site names removed.
6. Country-aware compound calculator and long-tail presets use local currency (EN/USD, JA/JPY, ZH/CNY), Intl.NumberFormat and independently chosen illustrative money amounts. Removed static FX multiplier and unsupported Japanese yen equivalence. Additional selectable EUR/GBP/KRW/CNY examples reset amounts; they DO NOT convert at a live rate.
7. Existing country-specific editorial blogs retain separate local institution/tax explanations and editorial indexing gate. Country articles point to translated calculator or localized tools hub. Compound blog guide uses correctly denominated native-language mini calculation; other finance topics do not show unrelated Korean compound widgets. No unverified AI post is newly published.
8. No DB, financial transaction, credential, SEO submission, external indexing operation or operating environment write.

## Country matrix
- KO Korea: Korean, KRW, Korean authorities and tax year when confirmed.
- EN United States: US English, USD; verify CFPB/IRS/SEC references.
- JA Japan: native Japanese, JPY; terms 元利均等返済, 元金均等返済, 新NISA, reference FSA/JPX/国税庁.
- ZH-CN China: Simplified Chinese, CNY; terms 等额本息, 等额本金, reference PBOC/国家税务总局.
Language alone does NOT establish tax jurisdiction or physical location. Currencies are input denominations, not current foreign-exchange quotes; yields and fees are hypothetical.

## Acceptance and release rules
- Tested source and SSR: canonical, hreflang, H1/lang/title, default currency, local terminology, 320px/390px mobile, functional result parity, blog locale links, editorial fail-closed and no mixed locale routes.
- PR exact-source CI must pass; isolated Test must actually run matching frontend/backend SHA, noindex and live backend/database tests, authenticated mobile UI, session continuity, backup/recovery and rollback readiness.
- Production only after existing economic ledger/DB grants/UI acceptance blockers are independently cleared and immutable zero-downtime generation is verified. This feature branch itself is not a Production release.
- Recheck Google finalized query×page×country×device impressions/clicks/CTR/position in 7/14/28 days with rank controls, avoid small-sample improvement claims. Exclude historic 410 /entry/ URLs from current finance page attribution.
- Other Korean-only calculators need their own translated UI, legal rule versions and independent user tests before they can be indexed as genuine localized pages.

## Official references
Google localized pages https://developers.google.com/search/docs/specialty/international/localized-versions
Google canonicals https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
Google performance https://support.google.com/webmasters/answer/7576553
Microsoft localization style guides https://learn.microsoft.com/en-us/globalization/reference/microsoft-style-guides
MDN Intl.NumberFormat https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
Google people-first content https://developers.google.com/search/docs/fundamentals/creating-helpful-content
