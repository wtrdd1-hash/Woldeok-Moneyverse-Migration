# Worklog — Acquisition Portfolio & Incremental Growth Allocation v2026.09.15.90

Date: 2026-09-15
Repository: `wtrdd1-hash/Woldeok-Moneyverse-Migration`
Change type: documentation-only consumer growth planning

## Starting state
- Starting `main`: `b24788ca82d2a25d83c23ad44153357a2068fad9`.
- Latest planning version at start: v2026.09.14.89 paid acquisition quality.
- `main` was rechecked mid-work before writing and remained unchanged.

## Inputs reviewed
- `PROJECT_PLAN.md` Living Project Plan.
- `PRODUCT_GROWTH_PLAN.md`.
- latest paid-acquisition quality planning.
- repository search for creator/community acquisition, referral/viral, SEO/content, monetization, comeback and privacy/security boundaries.
- current production `/`, `/guide`, `/announcements`, `/privacy`.

## Largest gap selected
Channel-level plans existed, but allocation remained fragmented. Paid, organic, creator, referral and branded/direct demand could each claim conversions without proving which activity created incremental D30 retained users.

## Product decision
Created `ACQUISITION_PORTFOLIO_INCREMENTAL_GROWTH_ALLOCATION_SPEC` v2026.09.15.90.

Key decisions:
- one unified acquisition portfolio outcome: incremental fraud-adjusted D30 retained users + retained contribution;
- distinguish demand creation from demand capture;
- triangulate operational attribution, first-party retained cohorts and proportional incrementality evidence;
- use marginal allocation rather than historical average ROI alone;
- evaluate organic/content/creator work as compounding assets that can create later branded/direct demand;
- preserve the same first-value and monetization contract for every acquisition source.

## Research
Direct adoption:
1. Google Search Console branded queries filter, published 2025-11-20 and broadly available 2026-03-11.
2. Google Search Generative AI performance reports, published 2026-06-03 and worldwide by 2026-08-31.
3. Google Search platform properties for social/video, launched 2026-07-07 and globally available 2026-07-29.
4. Google Meridian v2.0/GeoX current September 2026 documentation: experiments can calibrate cross-channel measurement.
5. Google Meridian full-funnel MMM: lower-funnel channels may harvest brand equity/demand and receive too much credit.
6. PIPC 2026-07-27 TikTok/Apple enforcement: do not expand third-party behavioral tracking solely for attribution.

Reference only:
- vendor case-study uplift figures are not Moneyverse forecasts;
- no MMM/tracking implementation was added;
- FTC review/endorsement guidance remains a marketing-integrity guardrail.

## Runtime audit
Verified production on 2026-09-15.
- Homepage: game-only disclosure is clear, but wallet/mini-games and broad quick links plus sponsored placements appear before/around the main positioning message.
- Guide: still finance/wealth heavy, including compound deposits, bonds, loans, virtual-stock gains/dividends, business dividends, casino and a beginner-to-capitalist roadmap.
- Announcements: no published notices; sponsored placement present.
- Privacy: states a minimal-purpose posture for login, virtual-economy ledger and security data.

Conclusion: current acquisition channels converge on a broad public experience. Channel success must therefore be judged by downstream retained quality, not visits to the generic homepage.

## Security/privacy findings
- HIGH cross-channel private-state leakage.
- HIGH referral/creator/paid arbitrage.
- HIGH finance/gambling claim drift.
- HIGH acquisition phishing/impersonation.
- MEDIUM measurement overcollection.

No security code was changed. Existing OAuth/session/RBAC/admin/ledger/market-integrity/privacy/community boundaries were preserved.

## Files added
- `docs/planning/ACQUISITION_PORTFOLIO_INCREMENTAL_GROWTH_ALLOCATION_SPEC.md`
- `docs/planning/ACQUISITION_PORTFOLIO_INCREMENTAL_GROWTH_ALLOCATION_SPEC.ko.md`
- English/Korean changelog.
- English/Korean worklog.

## Runtime/code scope
No runtime, DB, API, authentication, migration, scheduler, infrastructure or security-code change.
