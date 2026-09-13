# v2026.09.13.30 — Content-to-Habit Growth Loop

## Why
The existing growth stack covered pre-signup value, D1–D30 return reasons, retention-to-viral sharing, and recurring brand/content. The largest remaining gap was converting a useful content visit into a durable personal thread that survives through D7 rather than ending as a one-off read or click.

## Added
- English canonical + Korean companion `CONTENT_TO_HABIT_GROWTH_LOOP_SPEC`.
- Core loop: `useful content → understood idea → relevant action → saved personal thread → visible next step → D1 → D3 → D7`.
- One-primary-continuation rule for high-intent public pages.
- 30–90 second value-before-registration sample patterns.
- Signup framing as preservation/continuation of demonstrated value rather than generic gating.
- Intent-preserving first-session rules and lifecycle promises for D1 continuity, D3 identity formation, and D7 self-progress review.
- Content-entry cohort, saved-thread continuation, D7 review, fraud-adjusted acquisition, trust, and contribution-margin KPIs.
- Five experiments covering intent preservation, contextual signup copy, cognitive load, self-progress review, and value-first sponsorship.

## Security / privacy / abuse
- High: deep-link/phishing risk; public/private personalization leakage; referral/bot reward farming.
- Medium: analytics/ad overcollection; UGC/community abuse.
- Existing authentication/session/RBAC/ledger/admin/privacy/Account Security Center boundaries remain unchanged.
- No meaningful WLD/WDX reward for page views, shares, or raw signup.
- Separate runtime security/QA is required before new authenticated deep-link behavior, personalized public surfaces, or economic referral rewards.

## Research reviewed — 2026-09-13
Directly adopted / directional:
- Discord, 2026-08-20, game discovery/social play update: downstream gameplay and retention matter more than acquisition clicks alone.
- Discord, 2026-03-09, game growth update: social context can deepen engagement; treated as directional evidence, not a Moneyverse forecast.
- Google Search Central, 2026-02-05 Discover core update: less sensational, more original/in-depth/timely content.
- Google Search Central current people-first content guidance: satisfy reader intent and preserve trust, especially for finance-adjacent topics.
- Naver Search Advisor current content/spam guidance: user value first; reject thin mass generation, manipulation, misleading pages, and artificial traffic.
Reference only:
- Duolingo Friend Streak evidence; social reinforcement is noted, but punitive daily shared-streak loss is not adopted.

## SEO / viral / revenue impact
- SEO success path is now measured through `organic visit → understanding → relevant sample → activation → D7/D30 → contribution margin`.
- Viral success is `shared context → engaged visit → first value → activation → D7`, not raw invite volume.
- Monetization is placed after promised value; treatments that lift short-term revenue but harm retention/trust are rejected.

## Legal / policy
- WLD/WDX remain virtual/simulated/game-only.
- No real investment advice, guaranteed returns, deposits, cash redemption, or real-securities implication.
- Sponsor/creator disclosures must be clear in Korea/U.S. contexts.
- Personalized ads, new tracking vendors, minor targeting, economic referral rewards, and expanded public UGC require separate privacy/legal/trust review.

## Runtime verification
`https://easy-scraping.com` returned HTTP 530. `runtime verification unavailable`.

## Change type
Documentation-only. No runtime, DB, API, authentication, infrastructure, or production configuration changes. Test-server deployment is not required for this documentation change.

## Main policy
Per current user instruction, documentation was written directly to latest `main`; no documentation PR was created.