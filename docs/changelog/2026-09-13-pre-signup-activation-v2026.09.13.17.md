# Pre-Signup Activation Growth Change — v2026.09.13.17

Date: 2026-09-13
Scope: acquisition, activation, retention bridge, SEO, sharing, monetization and trust/safety
Change type: documentation only
Main-direct policy: applied directly to latest `main` per current product-planning instruction
Test server: not required for this documentation-only change

## Why

The current Product Growth Plan is stronger after sign-up than before sign-up. Search, share and public-content visitors still lack a defined value-before-authentication path. This creates a conversion risk: visitors may be asked to register before they understand what is fun or useful.

## What changed

Added `docs/planning/PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.md` and Korean counterpart with:

- first-30-second public value proposition;
- first-3-minute no-account sample flow;
- Market / Build / Collect interest paths;
- search-to-play and share-to-play funnels;
- explicit Visit / Engaged Visit / First Value / Activated User definitions;
- acquisition-source KPI chain through D1/D3/D7/D14/D30 and revenue/margin;
- four reversible growth experiments;
- post-first-value retention bridge;
- monetization placement after demonstrated value;
- security/privacy review for public/private boundary, redirects, referral abuse, public UGC and analytics overcollection.

## Research reviewed

- 2026-09-13 review of Google Search Central helpful, reliable, people-first content guidance — directly adopted for public content quality and trust.
- Google Discover core update dated 2026-02-05 — directional support for original, in-depth, non-clickbait content.
- Current 2026 TradingView The Leap / Paper Trading product experience — directional evidence for learn/practice/community progression; real-money prize mechanics were not adopted.
- FTC Consumer Reviews/Testimonial guidance and 2026 enforcement — directly adopted for incentive/review disclosure safeguards.

## Growth decision

Prioritize pre-signup activation and first value before expanding paid acquisition. A public visitor should be able to understand the product, complete one safe sample interaction and receive an intent-matched sign-up reason without creating authoritative economy state.

## Security/privacy impact

No security boundary was weakened. The spec explicitly prohibits exposing private balances, portfolio data, tokens, recovery/security state or moderation data in public/share/SEO surfaces. Runtime implementation of auth continuation requires separate open-redirect/security QA.

## Runtime status

`easy-scraping.com` could not be fetched during this pass. Runtime verification unavailable; no claim is made that the proposed public sample flow exists in Production.

## Next priority

Validate whether public learning pages, share landings and no-account sample concepts form one coherent `visit → first value` funnel, then refine first-session/D1 retention using real cohort data.