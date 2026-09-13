# Changelog — Retention & Return Ladder v2026.09.13.22

Date: 2026-09-13
Type: documentation-only consumer growth planning

## Why

The repository already had strong pre-signup activation, notifications, seasons and progression concepts, but D1/D3/D7/D14/D30 return reasons were not yet connected as one lifecycle ladder. This version focuses on staged retention, comeback quality, long-term identity and monetization timing rather than implementation architecture.

## Changed

- Added `RETENTION_RETURN_LADDER_GROWTH_SPEC.md` and Korean counterpart.
- Defined distinct D1, D3, D7, D14 and D30 return promises.
- Added 1–3 minute, 5–15 minute and 30+ minute session modes.
- Added lifecycle-specific home priorities and absence-safe comeback journeys.
- Added aspiration ladder from newcomer to prestige/legacy user.
- Connected social sharing, season anticipation, public content/SEO and monetization to retention quality.
- Added five experiments with primary metrics and trust/revenue guardrails.
- Added consumer-level security, privacy, phishing, referral-fraud and UGC risk review without expanding backend/API architecture.

## References reviewed

Research date: 2026-09-13.

- Google Search Central — `Creating helpful, reliable, people-first content`; official documentation; directly adopted for useful standalone public content and against thin SEO funnels.
- TradingView — `Community trading contests: build your own competition` (2026-08-07) and current 2026 The Leap product pages; current product case; referenced for simulated practice + community + shareable participation. Real-money prizes and profit-maximization mechanics are not adopted.
- Discord Community Onboarding/current help material; product-pattern reference for reducing newcomer overload and helping users find relevant community context. Used as a durable pattern, not as fresh market evidence by itself.

## Security/trust findings

- High: public/private data boundary leakage on share/SEO surfaces. Minimum condition: only explicit public-safe fields; private asset/account/security/recovery data remains non-public and non-indexed. Separate runtime QA required before launch.
- High: comeback/referral phishing and impersonation. Minimum condition: no secrets/sensitive asset detail in messages, recognizable brand destinations, no loss-threat copy. Separate runtime QA required for messaging/deep-link changes.
- Medium: referral multi-account/fake-signup abuse. No economically meaningful raw-signup reward; use retained activation milestones and non-P2W rewards.
- Medium: UGC harassment/doxxing and analytics/ad overcollection. Require privacy/report/block readiness and data minimization.

## Legal / monetization / SEO impact

- WLD/WDX remain virtual/simulated/game-only. No cash-out, guaranteed return or real-investment implication.
- Monetization is intentionally placed after repeated value; evaluate D7/D30, ad-induced churn, cancellation and margin with revenue.
- Public content must be independently useful and people-first; private account/portfolio/security/admin content remains outside search exposure.
- Incentivized/referral mechanics remain subject to disclosure, minors/privacy and anti-fraud review where applicable.

## Git policy

Per current instruction, documentation-only planning is applied directly to the latest `main` after rechecking it. No documentation PR is created. No runtime code, database, API, authentication, infrastructure or production configuration is changed.

## Next priority

Validate and deepen the weekly/monthly retention artifact loop: personal recap → optional share → recipient understanding → qualified activation → D7, while preserving privacy and avoiding leaderboard/FOMO pressure.