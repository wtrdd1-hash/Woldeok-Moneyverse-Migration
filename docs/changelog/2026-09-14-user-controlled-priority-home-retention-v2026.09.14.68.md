# Changelog — v2026.09.14.68 User-Controlled Priority Home & Retention

Date: 2026-09-14
Change type: documentation only
Runtime/code change: none

## Added
- Added `USER_CONTROLLED_PRIORITY_HOME_RETENTION_GROWTH_SPEC.md` and Korean counterpart.
- Defined the next retained-quality loop as `meaningful choice → pin 1–3 priorities → D1 recognition → D3 progress → D7 outcome → revise → D30 durable record`.
- Added explicit pin/unpin/reorder/pause controls as the preferred personalization model.
- Added lifecycle, quick/meaningful/deep-session behavior, channel-to-priority activation continuity, season handling, SEO boundaries and retention-safe monetization boundaries.
- Added experiments and KPI set centered on D1 exact-priority continuation, D7 priority outcome and D30 durable record.
- Added security/privacy review covering sensitive inference, phishing/ATO, finance-like manipulation, multi-account farming and personalization-data overcollection.

## Research adopted
- Meta/Threads `Your Algo` (2026-06-16/17): private user control over topic preferences and duration.
- Xbox April Update (2026-04-30): up to three pinned favorites on Home.
- Discord Profile Widgets (updated 2026-09-08): add/reorder/remove user-controlled interest modules.
- PIPC TikTok/Apple enforcement summary (2026-07-27): privacy/lawful-basis guardrail for behavioral data.
- FTC proposed personalized-pricing policy statement (2026-08-19): product guardrail; explicitly recorded as proposed/public-comment policy, not final universal prohibition.

## Runtime audit
- Production remains accessible.
- Home still foregrounds wallet/minigames/exchange/shop/quests and contains multiple sponsored placements.
- Public/monthly notices remain empty/preparing.
- Getting-started guide remains finance/wealth-forward.
- User-controlled persistent priority behavior was not observed; marked as a planning hypothesis.

## Repository policy
- Latest `main` rechecked immediately before the documentation tree was created.
- No DB/API/auth/security architecture/migration/state-machine/scheduler/admin-API expansion.
- No runtime, infrastructure or security-code changes.