# Worklog — Collection Preview-to-First-Piece Activation v2026.09.14.60

Date: 2026-09-14
Scope: consumer acquisition/activation/retention/viral/SEO/monetization planning only

## Main and documents reviewed
- `main` at work start: `c02afe0d1d5cf53792a588772797e793bc24ab4e`.
- `PROJECT_PLAN.md` Living Project Plan.
- `PRODUCT_GROWTH_PLAN.md`.
- `COLLECTION_SHOWCASE_VIRAL_WEDGE_SPEC.md` v2026.09.14.59.
- Current retention, content, monetization/SEO and public-consumer planning stack through repository search.
- Existing security/privacy/economy boundaries in the Living Project Plan were preserved.

## Largest gap selected
The first viral artifact is now defined, but the recipient still lacks a narrow reason to move from `interesting showcase` to `signup + first meaningful collection action`. This can create vanity share traffic without activation or D7 value.

## Planning decision
Create `COLLECTION_PREVIEW_TO_FIRST_PIECE_ACTIVATION_SPEC.md` and Korean parity document.

Consumer loop:
`showcase → understand → preview → authored choice → contextual signup → first collection action → first-value proof → D1 → D7 → D30 → optional own showcase`.

## Runtime Product Reality Audit
Public service was reachable on 2026-09-14.

Verified:
- Home states WLD/rewards are game-only virtual data.
- Public shortcuts foreground wallet, games, exchange, shop and quests.
- Multiple sponsored-advertisement slots are visible.
- Monthly news is still preparing public operations news.
- Lobby can be visibly quiet/empty.
- Current getting-started guide is strongly economy-led, including compound deposits, bonds, loans, stock gains/dividends, passive-income framing and `representative capitalist` progression.
- No visible public collection-showcase → preview → first-piece activation path was verified.

Runtime code was not changed.

## External research checked
- Discord Profile Widgets FAQ — updated 2026-09-08.
- Discord game discovery/social play update — 2026-08-20.
- Xbox achievement/profile improvements — 2026-04-08.
- Pokémon TCG Pocket community/support guidance — updated 2026-05-12.
- Google Search Central UGC-spam prevention guidance and noindex guidance.
- Google Site Reputation Policy update — 2026-08-28.
- FTC Shutterstock subscription settlement — 2026-05-13.
- FTC Publishing.com final order — 2026-07.
- Korea PIPC international privacy trend note on COPPA 2.0 — 2026-04-01; treated only as a legal-review trigger, not current Korean law.

## Security/trust findings
High:
1. Public preview could leak inventory/account/economy/private-graph/security context.
2. `save/claim first piece` can be cloned for phishing/ATO.
3. Starter/referral value can drive multi-account farming.
4. Open captions/links can enable impersonation, doxxing, spam or malicious links.

Minimum planning constraints:
- public-safe allowlist and data minimization;
- private-by-default personalized state;
- no secrets/session/recovery values in URLs/analytics;
- no meaningful spendable reward for preview/raw signup;
- useful public context before auth and consistent official-domain branding;
- bounded/preset text for the first public pilot;
- separate development/security/fraud/privacy QA before implementation of public personalized previews, external deep links, economic incentives or open UGC.

## Experiments added
- Preview-before-auth vs auth-first.
- Authored choice vs passive lore.
- Contextual signup promise vs generic signup.
- First-piece proof vs balance-first onboarding.
- Value-first monetization vs early interruption.

Primary outcomes emphasize meaningful activation, time-to-first-value, D1/D7/D30 and retention-adjusted contribution rather than share opens or raw signup.

## SEO/monetization decision
- No mass indexable preview/draft/personal progression pages.
- Index only substantial guides/lore/archive/editorial or public-safe project content.
- Monetization follows value proof; no financial-game advantage, fake scarcity or hidden sponsored ranking.
- Subscription positioning retains clear terms, express consent and simple cancellation guardrails.

## Files intended for this version
- `docs/planning/COLLECTION_PREVIEW_TO_FIRST_PIECE_ACTIVATION_SPEC.md`
- `docs/planning/COLLECTION_PREVIEW_TO_FIRST_PIECE_ACTIVATION_SPEC.ko.md`
- `docs/changelog/2026-09-14-collection-preview-first-piece-activation-v2026.09.14.60.md`
- `docs/changelog/2026-09-14-collection-preview-first-piece-activation-v2026.09.14.60.ko.md`
- `docs/worklog/2026-09-14-collection-preview-first-piece-activation-v2026.09.14.60.md`
- `docs/worklog/2026-09-14-collection-preview-first-piece-activation-v2026.09.14.60.ko.md`

## Not changed
No runtime code, database, API, authentication, infrastructure, security code or deployment configuration changed. This work must not weaken existing auth/session/RBAC/ledger/privacy/ad boundaries.
