# 2026-09-14 — Product planning worklog v2026.09.14.65

## Starting state

- Repository: `wtrdd1-hash/Woldeok-Moneyverse-Migration`
- Starting `main`: `690208e713b86743a7cd72a3d280ede307e16b6c`
- Latest starting planning version reviewed: v2026.09.14.64 retention-safe monetization entry.
- Scope: documentation-only consumer growth planning. No runtime code, DB, API, auth, infrastructure or security-code changes.

## Inputs reviewed

Repository planning:
- `docs/planning/PROJECT_PLAN.md`
- `docs/planning/PRODUCT_GROWTH_PLAN.md`
- `docs/planning/PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.md`
- `docs/planning/BRAND_CONTENT_GROWTH_ENGINE_SPEC.md`
- `docs/planning/RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`
- current product/security/privacy/economy/season references surfaced from the repository search and Living Project Plan.

Runtime:
- `https://easy-scraping.com/`
- `https://easy-scraping.com/guide`
- `https://easy-scraping.com/privacy`
- `https://easy-scraping.com/terms`

Current external sources reviewed:
- Discord GDC 2026 social-layer/Instant Play article.
- Discord Official game identity article, 2026-03-12.
- Discord game discovery/social-play update, 2026-08-20.
- Meta original creators update, 2026-03-13.
- Instagram Instants, 2026-05-13.
- Google Search Central people-first guidance and 2026-08-28 Site Reputation Policy update.
- Naver Search Advisor current content-basic/title/spam guidance.
- Korea Fair Trade Commission advertising-law resources.
- Korea PIPC COPPA 2.0 international-policy note dated 2026-04-01.

## Main reconciliation

`main` was checked at the start and again mid-work. It remained at:

`690208e713b86743a7cd72a3d280ede307e16b6c`

No concurrent commit needed to be reconciled before the documentation write.

## Largest gap selected

**Promise inconsistency between acquisition-facing brand surfaces and the newer retention/identity strategy.**

The runtime correctly labels WLD as game-only, but the getting-started narrative still foregrounds compound savings, bonds, loans, stock gains/dividends, business payouts, casino and a wealth progression toward becoming a “representative capitalist.” Recent growth planning instead increasingly depends on authored choice, learning, collection, identity, season continuity, community and durable personal history.

This mismatch can attract the wrong expectation even when top-of-funnel metrics look healthy.

## Decision

Create `BRAND_PROMISE_TO_FIRST_VALUE_ALIGNMENT_GROWTH_SPEC` with the canonical loop:

`clear promise → concrete proof → authored choice → contextual signup → meaningful activation → D1 recognition → D7 continuation → branded/direct return`

Canonical positioning:
- persistent community simulation / virtual-economy game;
- choose a path, build a record, return to a world that remembers;
- WLD/WDX remain virtual/simulated/game-only with no cash redemption or guaranteed return.

## Consumer changes documented

- Brand message hierarchy from human outcome to trust qualifier and next action.
- First-30-second comprehension targets.
- First-3-minute Build / Collect / Explore paths.
- D1/D3/D7/D14/D30 promise continuity.
- Surface rules for home, getting-started guide, SEO, share landings, auth continuation and comeback.
- Restricted/context-sensitive finance-like acquisition language.
- Message-cohort KPI chain from qualified impression through D30 and retained contribution.
- Five controlled experiment designs.

## Security / abuse / privacy review

High:
1. brand impersonation / phishing / account takeover;
2. finance-like deception or misunderstanding;
3. public/private data leakage.

Medium:
4. bot/fake-signup/referral manipulation;
5. tracking/analytics overcollection;
6. UGC impersonation/doxxing.

Minimum conditions documented include canonical-domain consistency, public-safe allowlists, private-by-default personal history, no secret/session/recovery data in URLs or analytics, no meaningful WLD/WDX for raw clicks/views/signups/shares, clear virtual/game-only claims and separate QA for future personalized public/deep-link/campaign flows.

## Legal / policy notes

- Korea fair-advertising rules remain a deception/accuracy guardrail.
- Sponsored/material relationships require appropriate disclosure.
- PIPC’s 2026-04-01 COPPA 2.0 note is recorded only as an international-policy/youth review signal, not current Korean law.
- WLD/WDX remain game-only; real redemption/securities/deposits/external-value prizes would require separate legal/product review.

## Runtime findings

Homepage:
- game-only disclosure present;
- wallet/minigame/stock/shop/quest shortcuts appear before the main brand hero;
- multiple sponsored advertisement placements already exist;
- hero message: community virtual economy and “small, solid economy we build together”;
- monthly news not yet populated;
- lobby can appear quiet.

Getting-started guide:
- finance-heavy pillars and wealth ladder remain prominent;
- uses compound deposits, bonds, smart loans, stock price gains, dividends, passive-income-like language, casino and “representative capitalist” framing;
- also contains correct game-only/no-cash disclosure.

Interpretation: disclosure is stronger than the overall brand hierarchy; this is a consumer expectation issue rather than a security-code defect in this planning run.

## Files prepared

- `docs/planning/BRAND_PROMISE_TO_FIRST_VALUE_ALIGNMENT_GROWTH_SPEC.md`
- `docs/planning/BRAND_PROMISE_TO_FIRST_VALUE_ALIGNMENT_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-14-brand-promise-first-value-v2026.09.14.65.md`
- `docs/changelog/2026-09-14-brand-promise-first-value-v2026.09.14.65.ko.md`
- `docs/worklog/2026-09-14-product-planning-v2026.09.14.65.md`
- `docs/worklog/2026-09-14-product-planning-v2026.09.14.65.ko.md`

## Validation / deployment

- Documentation pair maintained in English canonical + Korean counterpart.
- No runtime tests are required for the documentation content itself.
- No Test/Production deployment should be triggered by this documentation-only update.
- Runtime verification was available separately and recorded above.
- Final `main` SHA is recorded after atomic tree/commit/ref update.
