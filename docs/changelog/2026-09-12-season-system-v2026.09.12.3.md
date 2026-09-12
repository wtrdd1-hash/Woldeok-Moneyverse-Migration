# Season System Planning — v2026.09.12.3

Date: 2026-09-12
Type: Documentation-only product planning update
Runtime impact: None
Test-server deployment: Not required for this documentation-only revision

## Summary

Added a dedicated implementation-oriented season system specification for Woldeok Moneyverse, with Korean parity.

## Added

- full season lifecycle/state machine;
- 8-week season cadence and preseason/closing/verification/off-season flow;
- Season 1 `First Capital` and Season 2 `Industrial Expansion` concepts;
- late-joiner and returning-user catch-up rules;
- 50-level season XP budget and anti-grind rules;
- reward-track philosophy and Pay-to-Win restrictions;
- Season Token/Legacy Token issuance, spend, expiry and carryover policy;
- seasonal quest/story structure;
- isolated competitive league balance and risk-aware scoring;
- reset/persistence matrix;
- D-14/D-7/D-3/D-1 close and next-season communication schedule;
- final snapshots, tie-breaks and abuse verification;
- idempotent reward delivery and re-settlement rules;
- next-season preview/reveal cadence and consecutive-season recognition;
- Hall of Fame and season archive;
- required season UX states;
- DB/API/scheduler/admin-console requirements;
- season economy budget, analytics/KPIs and A/B experiment boundaries;
- extension, emergency pause and cancellation policies;
- launch checklist and Definition of Done;
- initial four-season roadmap.

## Product guardrails

Season rewards emphasize collection, prestige, identity, convenience and content access. High ranking does not create compounding economic dominance in later seasons. Competitive league money is isolated from the main economy, and seasonal currencies cannot convert into main WLD.

## Follow-up priorities

1. Link the season specification from the main product design and planning indexes.
2. Define exact Season 1 mission catalog and reward table.
3. Define Season 2 issuer/business/job data sheets.
4. Simulate XP completion distribution and WLD/ST economy budget.
5. Draft accelerated staging test cases for season transitions before implementation.
