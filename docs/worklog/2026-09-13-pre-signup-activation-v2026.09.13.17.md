# Product Growth Worklog — v2026.09.13.17

Date: 2026-09-13
Focus: pre-signup activation and first value
Change type: documentation only

## Starting state

- Re-read current `main` immediately before planning.
- Start-of-pass main SHA: `16b0385dafae809941b292e9f2bc992e4dcfacb3`.
- Re-read `PROJECT_PLAN.md` and `PRODUCT_GROWTH_PLAN.md` and checked current consumer-growth/security boundaries.
- The existing growth plan defines strong post-signup first-session, referral, share and retention ideas, but does not define a complete anonymous visitor → value proof → intent-matched signup path.
- Runtime fetch of `https://easy-scraping.com` failed during this pass, so runtime verification is unavailable.

## Research

Reviewed current sources on 2026-09-13:

1. Google Search Central, `Creating helpful, reliable, people-first content` — official documentation; directly adopted for useful public landing/content rules and anti-thin-content safeguards.
2. Google Search Central Blog, `Google's February 2026 Discover Core Update`, published 2026-02-05 — official update; used directionally for original, in-depth, timely, non-clickbait acquisition content.
3. TradingView, current 2026 `The Leap` / Paper Trading pages — current product example; used directionally for learn → practice → community/competition progression. Real-money prizes were explicitly not adopted.
4. U.S. FTC Consumer Reviews and Testimonials Rule Q&A plus 2026 enforcement — government guidance/enforcement; directly adopted for incentive/review disclosure safeguards.

## Gap analysis

The seven consumer-growth questions were reviewed. The largest unresolved gap was questions 1–3:

- why a first-time visitor arrives;
- what they understand or enjoy within 30 seconds / 3 minutes;
- why they continue into account creation.

The post-signup loop is more mature than this pre-signup bridge, so adding more authenticated systems would not address the current conversion risk.

## Decision and changes

Created bilingual `PRE_SIGNUP_ACTIVATION_GROWTH_SPEC` v2026.09.13.17.

Key product decisions:

- public visitors get one clear promise and one proof surface before authentication;
- anonymous users may choose Market / Build / Collect and complete one non-authoritative sample interaction;
- the signup CTA must preserve and continue the visitor's chosen intent;
- SEO content must solve a real question before asking for signup;
- share pages must make sense to non-members and never reveal private economy/account state;
- activation is defined as first verified meaningful value + an explicit next goal, not dashboard view or raw registration;
- acquisition cohorts are followed through D1/D3/D7/D14/D30 and monetization quality, not click/signup volume alone;
- first-value monetization stays light and non-disruptive.

## Experiment backlog added

1. Public sample vs immediate sign-up wall.
2. One promise + proof vs feature grid.
3. Intent-preserving post-auth return vs generic home return.
4. Educational `Try this concept` CTA vs generic signup CTA on learning-intent SEO pages.

Each experiment includes downstream activation/retention metrics and safety guardrails.

## Security and trust review

- High: public/private boundary leakage. Minimum protection: explicit public-data contract and auth+noindex for private account/portfolio/security/recovery/moderation data. Separate runtime QA required.
- High: open redirect/auth continuation abuse. Minimum protection: allowlisted internal destinations and validated continuation state. Separate security QA required if implemented.
- Medium: referral/fake-signup abuse. No reward for raw registration; verified milestones and non-economic-first rewards.
- Medium: public UGC/share abuse. Require visibility controls, report/block, safe-link handling and moderation coverage.
- Medium: analytics overcollection. Do not place tokens, private balances or security attributes in acquisition analytics; apply age/region/privacy controls.

## Legal / monetization / SEO impact

- WLD/WDX remain virtual/simulated/game-only; no cash redemption, guaranteed earnings or investment-return wording.
- Incentivized reviews/referrals must not condition rewards on positive sentiment; material connections need disclosure where required.
- SEO direction favors useful, original Moneyverse-specific pages over thin automated landing pages.
- Monetization is intentionally delayed until value is demonstrated; evaluate retention and churn alongside revenue.

## Git application

Current instruction required documentation-only planning changes to be written directly to current `main`; no documentation PR was created.

Files created in this pass:

- `docs/planning/PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.md`
- `docs/planning/PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-13-pre-signup-activation-v2026.09.13.17.md`
- `docs/changelog/2026-09-13-pre-signup-activation-v2026.09.13.17.ko.md`
- this English worklog
- Korean counterpart worklog

No runtime code, DB, API, authentication, infrastructure or Production configuration was changed. Test-server deployment is not required for these documentation changes.

## Next priority

1. Evaluate coherence of public learning pages + share landings + no-account sample as one acquisition funnel.
2. Once runtime is reachable, perform consumer-oriented Runtime Product Reality Audit starting from anonymous landing and signup continuation.
3. Measure `visit → engaged visit → signup → first value → D1/D3/D7/D14/D30` by source before expanding paid acquisition.
4. Use findings to refine first-session next-best-action and D1 comeback value.