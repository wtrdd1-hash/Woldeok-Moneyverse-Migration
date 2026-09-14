# Changelog — v2026.09.14.75 Zero-State Continuity & Quiet-Surface Growth

Date: 2026-09-14
Change type: documentation only
Runtime/code change: none

## Added
- Added `ZERO_STATE_CONTINUITY_QUIET_SURFACE_GROWTH_SPEC.md` and its Korean counterpart.
- Defined five distinct consumer states: true zero, quiet community, content-not-published, filtered zero, and failure/unavailable.
- Added the `State → Reason → Continuity → Next` consumer contract for legitimate zero/quiet states without turning it into a new frontend/backend implementation specification.
- Added D0/D1/D3/D7/D14/D30 and comeback behavior so empty moments create an authored state and a reason to return instead of a dead end.
- Added experiment backlog and cohort KPIs covering zero-state comprehension, time-to-first-value, first authored state, D1 recognition, D7 durable thread, D30 meaningful-history coverage, organic quality, ad-induced churn and trust/safety guardrails.
- Added SEO rules against indexing personalized empty states, empty search/filter results, private economy/account states and thin coming-soon pages.
- Added monetization guardrails so a quiet/empty surface is not treated as spare ad inventory and ordinary ad views/clicks do not receive WLD/WDX rewards.

## Security / privacy / abuse
- Recorded HIGH risk when an API/auth/service failure is incorrectly shown as a legitimate empty state.
- Recorded HIGH risk for private economy/social/security leakage through personalized zero-state recommendations.
- Recorded HIGH phishing/ATO risk from fake wallet/season/account-recovery empty-state messages.
- Recorded HIGH bot/fake-activity risk when artificial posts/reactions are used to hide a quiet community or farm referral/economic rewards.
- Preserved existing OAuth/session/RBAC/ledger/privacy/community boundaries. No security code was changed.

## Runtime evidence
- Production home currently contains a Monthly Notes section where reviewed public news is still being prepared.
- The community lobby can display a no-conversation-yet state.
- The announcements page currently has no published announcement while a sponsored advertisement is present.
- The getting-started guide explicitly explains that a new account can legitimately have a zero WLD balance and empty ledger history.

## External evidence
- Threads, 2026-06-16: community progress and user-controlled topic preferences.
- Discord current Community Onboarding guidance: prioritized newcomer channels and user-selected relevant roles/channels.
- Google Search current people-first guidance and noindex/private-content guidance.
- Naver Search Advisor current user-helpful content/SEO guidance.
- Google AdSense current publisher-content and deceptive-placement policy guidance.
- FTC, May 2026 Shutterstock settlement: clear subscription terms, informed consent and simple cancellation.

## Integration
- Start and mid-work `main`: `25844d21c862e06eed1018fb9ba897e4746c4ddd` (v2026.09.14.74).
- Final `main` is rechecked immediately before direct integration.
- No pull request is created for this documentation-only change.