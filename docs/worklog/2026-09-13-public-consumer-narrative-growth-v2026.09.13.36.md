# Worklog — Public Consumer Narrative Growth v2026.09.13.36

Date: 2026-09-13
Scope: consumer growth planning only
Deployment: documentation-only; no Test/Production deployment required

## Inputs reviewed

- latest `main` before writing;
- `docs/planning/PROJECT_PLAN.md`;
- `docs/planning/PRODUCT_GROWTH_PLAN.md`;
- `docs/planning/MY_MONEYVERSE_IDENTITY_HOME_GROWTH_SPEC.md`;
- current public home, `/guide`, `/announcements`, casino entry;
- recent official Discord identity-expression guidance;
- recent FTC subscription/negative-option enforcement and rulemaking material.

## Latest-main synchronization

The run started from the latest observed `main` at `697e9ceb5c81a7511040bc66e81c0a925407399a` (`ops: prune fully merged branches on main updates v2026.09.13.35`). Open PR search returned no open PRs at the check point. The latest main was rechecked immediately before the documentation writes.

Because v2026.09.13.35 was already used by repository operations work, this planning update uses the next available sequential version: **v2026.09.13.36**.

## Largest growth gap found

The live home and live getting-started guide communicate incompatible newcomer stories.

The home says users can inspect activities before signing in and then start one thing at a time. The guide rapidly expands into compound deposits, bonds, loans, eight professions, businesses, stocks, shop and casino, and frames growth around capital gains, dividends, passive income and becoming a representative capitalist.

This creates activation friction and brand ambiguity. It also increases the chance that fictional/game-only financial systems are interpreted as the product’s core promise rather than one set of game mechanics inside a broader identity/progression/community experience.

## Planning decision

Create one canonical consumer narrative:

`one meaningful thread → make it yours → see it grow → return to continue`

The user should not need to understand the whole economy to experience first value.

## Consumer funnel updated

`public promise → one preview → one interest → contextual signup → first meaningful action → continuity proof → D1 continue → D3 preference → D7 progress story → D14 living-world change → D30 aspiration`

Activation is defined by a meaningful action plus visible continuity, not login alone.

## Experiments added

1. identity/history promise vs wealth/finance-heavy promise;
2. one preview vs full feature overview;
3. contextual signup CTA vs generic signup CTA;
4. D7 progress story vs balance/activity dashboard;
5. repeat-value-first monetization vs early monetization.

Each experiment includes retention and trust guardrails rather than optimizing click-through alone.

## Security / abuse / privacy findings

### High — public/private leakage
User impact: exposure of balances, holdings, debt, security/recovery state or hidden social graph through public preview/share/archive surfaces.

Minimum protection: public-safe fields only, private-by-default personalized history, reversible public scope, authenticated/noindex account-security surfaces.

Separate development/security QA: required for any new public personalized surface.

### High — share/referral phishing
User impact: account/session theft through imitation Moneyverse links.

Minimum protection: no secret/session/private-asset values in URLs/messages; clear official-domain branding; no asset-loss pressure language.

Separate QA: required for runtime deep-link changes.

### High — finance-like claim drift
User impact: mistaken belief that WLD/WDX deposits, stocks or businesses promise real returns or represent real financial competence.

Minimum protection: game-only disclosure near claims, no guaranteed-return/passive-income promise, no real-security/deposit wording without legal review.

### Medium — fake activation/referral farming
Do not attach meaningful WLD/WDX rewards to raw signup/view/share. Use fraud-adjusted retained milestones and non-P2W/cosmetic/prestige rewards where referrals are tested.

## Research record

### 2026-09-13 — Discord Profile Widgets FAQ (official, updated 2026-09-08)
Type: official product help.
Key insight: identity surfaces are customizable, reorderable and user-controlled.
Decision: **directly adopted** as evidence for editable user-controlled Moneyverse identity rather than opaque permanent persona assignment.

### 2026-09-13 — FTC Shutterstock subscription settlement (official, 2026-05)
Type: US regulator enforcement.
Key insight: material subscription terms must be clear, charges require express informed consent, cancellation must be straightforward.
Decision: **directly adopted** as subscription trust guardrail.

### 2026-09-13 — FTC negative-option rulemaking notice (official, 2026-03)
Type: US regulator policy/rulemaking.
Key insight: inadequate disclosure, non-consensual enrollment and cancellation friction remain active concerns.
Decision: **reference** for monetization/legal review.

### 2026-09-13 — Moneyverse live home/guide/announcements
Type: runtime product evidence.
Key insight: home supports gradual onboarding, guide remains wealth/finance-heavy, announcements do not yet provide a recurring public content reason to return.
Decision: **directly adopted** as the basis of this planning gap.

## Files changed

- `docs/planning/PUBLIC_CONSUMER_NARRATIVE_GROWTH_SPEC.md`
- `docs/planning/PUBLIC_CONSUMER_NARRATIVE_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-13-public-consumer-narrative-growth-v2026.09.13.36.md`
- `docs/changelog/2026-09-13-public-consumer-narrative-growth-v2026.09.13.36.ko.md`
- `docs/worklog/2026-09-13-public-consumer-narrative-growth-v2026.09.13.36.md`
- `docs/worklog/2026-09-13-public-consumer-narrative-growth-v2026.09.13.36.ko.md`

## Runtime / test status

Runtime verification: available and performed on public non-destructive surfaces.
Runtime code changes: none.
DB/API/auth/infra changes: none.
Test server required for this documentation-only change: no.

## Next priority

Focus the next consumer-growth pass on validating the narrow path:

`Home promise → one public preview → contextual signup → first meaningful action → D1 continue → D7 progress story`

Do not expand backend implementation detail in this growth automation. Any runtime copy or experience change should be handled separately with product, security and QA validation.