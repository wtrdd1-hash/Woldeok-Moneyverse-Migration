# 2026-09-14 — Brand promise-to-first-value alignment v2026.09.14.65

## Summary

Added a new consumer-growth specification to align what Moneyverse promises during acquisition with what it actually asks users to do during activation and retention.

The selected gap is expectation mismatch: recent product-growth planning emphasizes authored choice, learning, collections, identity, seasons, community and durable history, while current public runtime surfaces can still foreground wallet/finance/casino/wealth-growth concepts. This can produce high-click but low-quality acquisition and finance-like misunderstanding.

## Added

- `docs/planning/BRAND_PROMISE_TO_FIRST_VALUE_ALIGNMENT_GROWTH_SPEC.md`
- `docs/planning/BRAND_PROMISE_TO_FIRST_VALUE_ALIGNMENT_GROWTH_SPEC.ko.md`
- English/Korean changelog and worklog for v2026.09.14.65.

## Consumer-planning changes

- Defined the canonical category as a persistent community simulation / virtual-economy game.
- Defined the core promise around authored choice, persistent progress and a world that remembers the user.
- Added a four-layer message hierarchy: human outcome → concrete product proof → trust boundary → one next action.
- Added first-30-second and first-3-minute comprehension goals.
- Connected the same promise to D1/D3/D7/D14/D30 retention.
- Added surface-specific message architecture for home, guide, SEO, share landings, auth continuation and comeback.
- Added restricted/context-sensitive finance-like acquisition language.
- Added message-cohort KPI covering comprehension, expectation alignment, activation, D7/D30, CAC/LTV and trust.
- Added five experiments: persistence/identity hero, one-proof vs feature-grid, goal-first guide, contextual game-only qualifiers and paid message-cohort gating.

## Security / abuse / privacy

Recorded high risks for:

- official-brand impersonation/phishing/ATO;
- finance-like deception or misunderstanding;
- public/private data leakage.

Recorded medium risks for bot/fake-signup/referral manipulation, analytics overcollection and UGC impersonation/doxxing.

No existing auth/session/RBAC/admin/ledger/privacy boundary is weakened or changed.

## Research notes

Research date: 2026-09-14.

Directly adopted/reference sources:

- Discord GDC 2026 social-layer/Instant Play work: reduce friction from discovery to first experience.
- Discord Official + 2026-08-20 discovery update: canonical trusted identity and discovery consistency.
- Meta 2026-03 original-creator update: originality and impersonation protection as durable discovery value.
- Instagram Instants 2026-05: low-friction sharing with private archive and user control.
- Google Search Central people-first content and 2026-08-28 site-reputation update.
- Naver Search Advisor current brand/title/content/spam guidance.
- Korea Fair Trade Commission advertising-law resources as an accuracy/deception guardrail.
- Korea PIPC 2026-04-01 COPPA 2.0 international-policy note as a youth/privacy review trigger, not Korean law.

## Runtime reality audit

Runtime verification was available on 2026-09-14.

Observed:

- homepage clearly states WLD is game-only;
- wallet/game/stock/shop/quest shortcuts and multiple sponsored placements appear before/deep around the brand story;
- monthly news remains unpopulated;
- the getting-started guide foregrounds compound deposits, bonds, loans, stock gains/dividends, business payouts, casino and a “representative capitalist” wealth ladder.

Conclusion: runtime disclosure is stronger than runtime brand hierarchy. The new document records this as a growth/trust hypothesis only; no runtime copy is changed in this documentation run.

## Release state

Documentation only. No runtime, DB, API, authentication, infrastructure, security-code, deployment or Production configuration change.
