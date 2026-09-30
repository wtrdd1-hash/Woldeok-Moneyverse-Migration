# Internal update — v2026.09.30.487 advertising-only monetization

Date: 2026-09-30  
Scope: planning/docs only  
Start/mid main: `85508db432cd525570e26bc1820b9e637a8140fa`

## Decision
- Cash monetization is advertising-only under the current business-registration constraint.
- Paid subscriptions, ad removal, paid cosmetics/digital goods, paid WLD/WDX, paid random/casino value, user-paid fees, donations/memberships, paid API/B2B, affiliate/direct sales are BLOCKED until a future authority change.
- Added `AD_ONLY_ADVERTISING_REVENUE_SPEC.md` / `.ko.md`.
- Updated PROJECT_PLAN, integrated planning master, monetization spec, KR compliance audit and docs entrypoint with v487 superseding gates.

## KRW 1,000,000/month ad model
Use observed Page RPM only: `PV = 1,000,000 / PageRPM × 1,000`.

Scenario inputs:
- KRW 2,000 RPM -> 500,000 PV
- KRW 5,000 RPM -> 200,000 PV
- KRW 10,000 RPM -> 100,000 PV
- KRW 20,000 RPM -> 50,000 PV

No RPM is forecast or guaranteed.

## Growth/quality gates
- Search Console/index/canonical truth before scaled pSEO.
- Audience-first calculators/guides and relevant internal links.
- Measured Auto Ads/ad-load/format experiments with CWV/task-completion/accidental-click guardrails.
- Self-clicks, click encouragement, incentivized ad views, traffic exchanges, bot impressions and low-quality purchased traffic are prohibited.
- Sensitive-route ad blocklist remains.

No runtime, AdSense setting, Test or Production change was performed.
