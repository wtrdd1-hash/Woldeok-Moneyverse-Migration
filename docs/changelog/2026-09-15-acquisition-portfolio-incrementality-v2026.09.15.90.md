# Changelog — Acquisition Portfolio & Incremental Growth Allocation v2026.09.15.90

## Added
- `docs/planning/ACQUISITION_PORTFOLIO_INCREMENTAL_GROWTH_ALLOCATION_SPEC.md`.
- Korean counterpart.

## Largest gap
Channel-specific SEO/content, creator/community, referral/viral and paid plans existed, but there was no single rule for deciding where the next unit of spend/editorial/creator capacity should go when multiple channels claim the same user.

## Consumer planning
- Added `market/brand signal → qualified discovery → public value → authored interest → activation → D1/D7/D30 quality → incremental retained contribution → marginal allocation` loop.
- Separated demand creation from demand capture.
- Added one cross-channel consumer contract for truthful promise, public value, authored interest, contextual signup and same-intent activation.
- Preserved D1/D3/D7/D14/D30 continuity and game-only boundaries.

## KPI/economics
- Primary portfolio outcome: incremental fraud-adjusted D30 retained users and retained contribution.
- Added marginal CAC per incremental D30 user, marginal retained contribution, branded/non-branded demand, content shelf life, support/moderation/fraud costs and saturation evidence where available.
- Kept platform attribution, first-party retained cohorts and incrementality evidence as separate views.

## Experiments
- Branded-search credit test.
- Evergreen organic vs paid matched-intent acquisition.
- Creator/community vs referral-code push.
- Marginal paid-spend step test.
- Social/video search-discovery feedback loop.

## SEO/viral/monetization
- Use 2026 Search Console branded-query, AI-visibility and social/video platform-property data as discovery diagnostics, not retention success by themselves.
- No near-duplicate channel landing farms or raw referral/signup WLD/WDX incentives.
- Acquisition source does not justify higher first-session ad load or finance-like monetization pressure.

## Security/privacy
- HIGH: cross-channel private-state leakage.
- HIGH: referral/creator/paid arbitrage.
- HIGH: real-finance/gambling claim drift.
- HIGH: phishing/impersonation across acquisition surfaces.
- MEDIUM: measurement overcollection.
- Existing OAuth/session/RBAC/admin/ledger/market-integrity/privacy/community boundaries remain intact.

## Research
Direct adoption:
- Google Search Console branded queries filter, broad availability 2026-03-11.
- Google Search Generative AI reports, worldwide rollout completed 2026-08-31.
- Google Search platform properties for social/video, globally available 2026-07-29.
- Google Meridian v2.0/GeoX and full-funnel MMM, current September 2026 documentation.
- PIPC 2026-07-27 TikTok/Apple enforcement as a behavioral-tracking privacy guardrail.

Reference only:
- Vendor uplift claims are not Moneyverse forecasts.
- MMM implementation is not required by this documentation-only pass.

## Runtime
Production public pages were reachable on 2026-09-15. Homepage still presents wallet/mini-games/multi-feature shortcuts and sponsored placements before/around the main product explanation; the getting-started guide remains finance/wealth heavy. Game-only disclosures remain strong.

## Scope
Documentation only. No runtime, DB, API, auth, migration, scheduler, infrastructure or security-code change.
