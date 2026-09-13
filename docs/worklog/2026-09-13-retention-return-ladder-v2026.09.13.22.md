# Product Growth Worklog — v2026.09.13.22

Date: 2026-09-13
Focus: D1–D30 retention and return ladder
Change type: documentation-only

## Starting state

- Re-read current `main` immediately before planning.
- Start/mid-pass main SHA: `0b149a8c6cfef9cc17fb9e3af8f26a79b316162d`.
- Re-read `PRODUCT_GROWTH_PLAN.md`, the latest pre-signup activation growth spec, and current notification/reactivation, season, security/privacy and economy planning relevant to consumer growth.
- Runtime verification: unavailable. `https://easy-scraping.com` returned HTTP 530 during this pass.
- Current instruction explicitly pauses new implementation-detail planning; no DB/API/auth/backend architecture expansion was performed.

## Gap analysis

The seven growth questions were reviewed again. The previous pass materially improved questions 1–3: why visitors arrive, what they understand before signup, and why they proceed into signup.

The largest remaining gap is question 4/6: why an activated user returns at D1/D3/D7/D14/D30 and what durable identity/history makes them stay longer.

Existing plans contain daily/weekly/seasonal loops, weekly recaps, comeback missions, collections and social systems, but they do not yet form one lifecycle narrative with different return promises at each horizon.

## Research

Research date: 2026-09-13.

- Google Search Central, `Creating helpful, reliable, people-first content` — official documentation. Directly adopted for retention-oriented public content that must independently help visitors rather than act as thin registration funnels.
- TradingView, `Community trading contests: build your own competition` (2026-08-07) and current 2026 The Leap pages — recent product cases. Used as evidence that simulated practice can be connected with community participation and shareable experiences. Real-money prizes, profit-maximization and risk-seeking mechanics were explicitly not adopted.
- Discord Community Onboarding/current help content — durable product-pattern reference for reducing newcomer overload and directing users toward relevant community context. The old publication date means it is reference material, not treated as fresh market evidence by itself.

## Product decisions

Created English/Korean `RETENTION_RETURN_LADDER_GROWTH_SPEC` v2026.09.13.22.

Key decisions:
- D1 = continuity of the first-session intent;
- D3 = preference and identity formation;
- D7 = self-progress recap and next-week direction;
- D14 = world/community continuity;
- D30 = personal archive, history and unfinished aspirations;
- absence should be survivable; no punitive streak reset or “you lost rewards” comeback pressure;
- quick, meaningful and deep session modes coexist without penalizing short-session users;
- long-term aspiration shifts from raw WLD accumulation toward mastery, collection, expression, spaces, archives, community projects and prestige;
- monetization is strongest after repeated value, not before first value;
- public content is also a return surface, not only an acquisition surface.

## Experiment backlog added

1. D1 intent-matched continuation card vs generic home.
2. Personal self-progress weekly recap vs leaderboard-first recap.
3. Absence-safe neutral comeback briefing vs reward/FOMO-oriented copy.
4. Shareable weekly progress story vs generic invite link.
5. Delayed disruptive monetization until repeated value vs current eligible timing.

Every experiment includes downstream retention/revenue and trust guardrails rather than optimizing CTR/open rate alone.

## Security / privacy / abuse review

- High: public/private boundary leakage on share/SEO surfaces. User impact includes stalking, phishing and targeted account abuse. Minimum condition: public-safe allowlisted data only; private account/security/recovery/assets remain non-public and non-indexed. Separate runtime QA required before launch.
- High: comeback/referral phishing and impersonation. Minimum condition: no secrets or sensitive asset detail in messages, safe recognizable destinations, no account/asset-loss threats. Separate runtime QA required for real messaging/deep-link changes.
- Medium: fake-signup/referral multi-account abuse. Raw registration must not produce meaningful economic reward; retained activation milestones and non-P2W value are preferred.
- Medium: public social/UGC harassment and doxxing. Expansion requires privacy, block/report and moderation readiness.
- Medium: retention/ad analytics overcollection. Do not collect credentials, tokens, private asset data or unnecessary identifiers for segmentation.

No security code changes were performed.

## Legal / revenue / SEO

- WLD/WDX remain virtual/simulated/game-only; no cash value, guaranteed return, deposit or real-investment implication was introduced.
- Monetization timing is judged by D7/D30, ad-induced churn, cancellation, LTV/CAC and contribution margin together with ARPU/ARPDAU.
- SEO/content remains people-first; private account/portfolio/security/admin pages stay outside public search exposure.
- Referral/share/incentive programs retain privacy, minors, disclosure and anti-fraud review requirements.

## Git policy and completion

Per current instruction, this documentation-only pass is applied directly to the latest `main` after a mid-work recheck and without creating a documentation PR. Runtime code, DB, API, authentication, infrastructure and production configuration are untouched. Test-server deployment is not required for this documentation change.

## Next growth priority

Deepen the weekly/monthly retention artifact loop and validate whether a personal progress story can simultaneously increase D14/D30 attachment and produce higher-quality viral acquisition without privacy leakage or ranking/FOMO pressure.