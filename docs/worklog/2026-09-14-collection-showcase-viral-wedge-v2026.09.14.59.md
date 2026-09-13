# Worklog — Collection Showcase Viral Wedge v2026.09.14.59

Date: 2026-09-14
Scope: documentation-only consumer growth planning
Korean counterpart: `docs/worklog/2026-09-14-collection-showcase-viral-wedge-v2026.09.14.59.ko.md`

## Inputs reviewed
- latest `main` before work: `7c2f8bc265ec17172532cc36ad586a3491913bc3`;
- `PROJECT_PLAN.md` Living Project Plan;
- `PRODUCT_GROWTH_PLAN.md`;
- latest viral/retention/identity/monetization planning, including `ARTIFACT_TO_RECIPIENT_VIRAL_GROWTH_SPEC.md`;
- recent auth/mobile OAuth changes on main so the growth plan does not weaken or bypass current authentication/session boundaries;
- current public runtime home, announcements and getting-started guide;
- current Google, Discord, Xbox, FTC and Korea PIPC references relevant to identity presentation, discovery, fake social proof, compensated sharing and youth privacy.

## Main re-check
Immediately before document construction, `main` was re-checked and remained `7c2f8bc265ec17172532cc36ad586a3491913bc3`. The prior `v2026.09.14.58` growth work and the newer mobile OAuth browser-handoff merge were both preserved. No concurrent change needed reconciliation at that checkpoint.

## Gap selected
The prior run established a broad artifact-to-recipient viral contract. The largest next gap was selection risk: multiple share-object types were proposed, but none had been chosen as the first narrow wedge to test from member pride through recipient activation and D7.

Decision: use **curated collection showcase** as the first candidate because it combines completion, taste, identity, long-term curation and safe public explanation while avoiding default exposure of wealth, portfolio returns, loans or casino outcomes.

## Product changes documented
- Narrow viral loop: `collection milestone → curated showcase → recipient understanding → starter exploration → signup if continuity requires → collection activation → D1/D7 → own showcase`.
- First 30-second, 3-minute and first-session recipient contract.
- D1/D3/D7/D14/D30 continuation for share-entry cohorts.
- SEO distinction between thin personal cards and substantial collection/lore/archive pages.
- Retention-safe, non-P2W monetization around presentation after value.
- Five controlled growth experiments with trust/abuse guardrails.
- KPI model from showcase creation to second-generation sharing and retention-adjusted contribution.

## Runtime findings
Public service was reachable.
- Home clearly states WLD/rewards are game-only virtual data.
- Home offers wallet, minigames, exchange, shop, quests, lobby and onboarding links.
- Multiple sponsored-advertisement placements already exist.
- Monthly public news remains in a preparing/empty state.
- Lobby can be visibly quiet.
- The getting-started guide still foregrounds compound deposits, bonds, loans, stock gains/dividends, passive income and a wealth-led “representative capitalist” progression.

This reinforced the need for a lower-risk identity artifact rather than a wealth/status artifact as the first viral wedge.

## Research notes
- **Discord Profile Widgets FAQ — 2026-09-08 — direct adoption.** User-controlled, rearrangeable and removable identity/progress presentation supports member-authored curation.
- **Xbox Achievement improvements — 2026-04-08 — direct adoption.** Hiding profile history and highlighting full completion supports completion celebration with user control.
- **Xbox X25 community designs — 2026-08-24 — reference.** Community identity artifacts can strengthen brand/community without wealth ranking.
- **Google Search profiles — 2026-06-04 — reference.** Curated, shareable source identity can connect discovery with repeat following.
- **Google Site Reputation Policy — 2026-08-28 — direct guardrail.** Do not create scaled thin user pages to exploit the host domain.
- **Spotify artist identity transparency — 2026-08-11 — reference.** Public identity surfaces benefit from provenance and clear trust cues.
- **FTC Publishing.com final order — 2026-07 — direct guardrail.** Earnings claims need substantiation; incentives/material relationships must not be hidden.
- **FTC Consumer Reviews/Testimonial Rule — current — direct guardrail.** Avoid fake influence and sentiment-conditioned incentives.
- **Korea PIPC COPPA 2.0 international trend note — 2026-04-01 — reference/legal-review trigger.** Not treated as current Korean law; used to keep youth personalization/ads conservative and trigger launch-time re-check.

## Safety review
High:
1. public/private leakage through showcases;
2. cloned showcase/reward phishing and ATO;
3. bot/multi-account view/share/prestige farming;
4. UGC impersonation, malicious links and doxxing.

Minimum conditions: public-safe allowlist, private-by-default, owner preview, no secret/session/recovery values in URL/analytics, no spendable rewards for raw views/shares/signups, consistent official-domain cues, report/remove path, bounded text/presets for an initial pilot.

Separate development/security/fraud/privacy QA is required before implementing personalized public showcases, open-ended captions, external deep links, economic referral rewards or broad public UGC discovery.

## Files prepared
- `docs/planning/COLLECTION_SHOWCASE_VIRAL_WEDGE_SPEC.md`
- `docs/planning/COLLECTION_SHOWCASE_VIRAL_WEDGE_SPEC.ko.md`
- `docs/changelog/2026-09-14-collection-showcase-viral-wedge-v2026.09.14.59.md`
- `docs/changelog/2026-09-14-collection-showcase-viral-wedge-v2026.09.14.59.ko.md`
- `docs/worklog/2026-09-14-collection-showcase-viral-wedge-v2026.09.14.59.md`
- `docs/worklog/2026-09-14-collection-showcase-viral-wedge-v2026.09.14.59.ko.md`

## Out of scope
No runtime, DB, API, auth, security-code, infrastructure or deployment changes were made.
