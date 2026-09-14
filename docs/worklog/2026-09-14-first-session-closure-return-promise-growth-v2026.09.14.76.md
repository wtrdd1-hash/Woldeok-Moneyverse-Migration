# Worklog — v2026.09.14.76 First-Session Closure & Return-Promise Growth

Date: 2026-09-14
Change type: documentation only

## Inputs reviewed
- latest `main` at start and mid-work: `00d4468b4ea499f9e273a70d431bae1ca0c3d026`;
- `PROJECT_PLAN.md` Living Project Plan;
- `PRODUCT_GROWTH_PLAN.md`;
- recent consumer growth specs including user-controlled priority, world-pulse freshness, first social bond, zero-state continuity and retention-safe monetization;
- existing auth/session/RBAC/ledger/privacy/community boundaries and recent security-sensitive changes;
- current Production home, getting-started guide and announcements surfaces;
- fresh official/reference material from Supercell, Xbox, Google Search and FTC.

## Gap selected
The first session can deliver a real action and result but still end without a deliberate user-authored reason to return. Current Production guide ends the first-day checklist with depositing remaining WLD, not with choosing a persistent continuation.

## Product decision
Added a consumer contract:

`first meaningful result → choose one continuation → clean session end → D1 exact-thread recognition → D3 progress/true unchanged state → D7 resolve/renew → D30 durable history`

No new implementation contract for DB/API/auth/scheduler/backend/admin systems was created.

## Research decisions
- Directly adopted user-control and next-goal clarity principles from Xbox and Supercell.
- Used the current Clash Royale season only as a live-service anticipation reference, not as a reward/FOMO template.
- Preserved Google people-first SEO constraints; no thin personalized return pages should be indexed.
- Preserved FTC-derived subscription clarity/consent/cancellation guardrails.
- Treated the September 2026 FTC personalized-pricing item as a proposed-policy signal, not settled law.

## Security / privacy / abuse findings
- HIGH phishing/ATO risk from fake saved-goal/pending-reward messages.
- HIGH sensitive-state leakage risk through home/share/notification/analytics continuation surfaces.
- HIGH multi-account/reward-farming risk if raw return-promise events receive WLD/WDX.
- HIGH finance-like manipulation risk from loss/debt/casino comeback nudges.
- MEDIUM analytics-overcollection risk.

Minimum conditions: canonical-domain consistency, no credential/auth/recovery requests in growth content, public-safe allowlist, private-by-default personalized continuation, no secrets/session/recovery in URLs, no meaningful WLD/WDX for raw save/open/return events, and separate security/privacy/fraud QA before external deep-link or economic-reward implementation.

## Runtime verification
Available on 2026-09-14.
- Home: explicit game-only WLD/reward disclosure; wallet/games/exchange/shop/quest shortcuts; Monthly Notes still preparing public updates.
- Guide: four-step quick start and seven-item first-day checklist; current ending is compound-deposit use, without an explicit user-authored return promise.
- Announcements: no published notice yet; sponsored advertisement present.
- Lobby: legitimate quiet state plus privacy/account-information warning.

## Files prepared
- `docs/planning/FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.md`
- `docs/planning/FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-14-first-session-closure-return-promise-growth-v2026.09.14.76.md`
- `docs/changelog/2026-09-14-first-session-closure-return-promise-growth-v2026.09.14.76.ko.md`
- `docs/worklog/2026-09-14-first-session-closure-return-promise-growth-v2026.09.14.76.md`
- `docs/worklog/2026-09-14-first-session-closure-return-promise-growth-v2026.09.14.76.ko.md`

## Integration rule
Recheck `main` immediately before writing. Integrate only as a non-forced fast-forward on the latest tree, preserving concurrent changes. No PR for this documentation-only pass.

## Next priority
Validate one narrow cohort loop:

`first result → user-chosen continuation → D1 exact-thread recognition → D7 resolve/renew → D30 durable history`

Do not use streak punishment, fake pending rewards, finance-loss urgency, raw WLD/WDX comeback rewards, opaque auto-goals or earlier ad pressure.