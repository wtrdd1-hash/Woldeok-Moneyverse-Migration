# Worklog — Identity-Safe Merchandising & Transparent Rotation v2026.09.15.96

## Repository baseline
- Repository: `wtrdd1-hash/Woldeok-Moneyverse-Migration`
- Starting/latest `main` before write: `a194cc220c8d8d2c6c2bf38146c0c654515b22b8`
- Latest release integrated immediately before this planning pass: v2026.09.15.95.
- Relevant new runtime scope preserved: calendar shop deadlines, marketplace recent-acquisition discovery/filtering, first-party web local login, cosmetic/convenience sinks.

## Documents reviewed
- `PROJECT_PLAN.md`
- `PRODUCT_GROWTH_PLAN.md`
- `COLLECTION_OWNERSHIP_TO_CURATION_RETENTION_SPEC.md`
- retention-safe monetization, brand/trust, acquisition and recent collection growth direction by repository search.
- latest `main` commit/diff metadata.

## Gap selection
Existing specs already cover collection ownership-to-curation, pre-signup activation, comeback, retention ladders, brand positioning, trust, paid acquisition and acquisition portfolio allocation. The new v95 runtime makes a different gap immediately material: merchandising now has enough inventory and deadline data that **what the shop teaches users to aspire to** matters.

Production observation found a large expressive catalog but also wealth/profit/casino-status labels. The selected gap is therefore identity-safe merchandising plus transparent rotation, not another collection schema or purchase implementation plan.

## Runtime verification
Checked 2026-09-15:
- `https://easy-scraping.com/`
- `https://easy-scraping.com/shop`
- `https://easy-scraping.com/guide`

Findings:
- WLD/rewards are clearly disclosed as game-only/non-cash.
- Homepage still exposes several product systems and sponsored placements before/around the deeper brand narrative.
- Store 2.0 exposes 136 catalog entries across many cosmetic/convenience categories and explicitly presents WLD purchase sinks.
- Several visible labels frame prestige through wealth, profit, investing or casino outcomes.
- Authenticated `/calendar` and holdings behavior were not independently executed; latest `main` documentation confirms authoritative sale-ending deadlines and recent-acquisition filtering.

Runtime verification status: **partially available; public consumer surfaces verified, authenticated calendar/holdings not independently exercised.**

## External research
1. Epic Games current support — individual cosmetic item removal date/time is shown. Direct adoption: truthful exact deadline.
2. Supercell Clash of Clans, 2026-01-09 — explicit event start/end plus two-day reward-exchange grace. Direct adoption: testable end/grace pattern.
3. U.S. FTC, 2026-08 personalized-pricing enforcement-policy proposal — current policy signal against misleading undisclosed data-driven individualized pricing; not treated as a final rule.
4. Korea FTC, 2025-02-13 standing official Q&A on regulated online dark-pattern types — compliance reference.
5. Korea Consumer Agency, 2026 monitoring program — current monitoring includes consumer-deceptive dark patterns.
6. Google Search current ecommerce/product-data guidance — price/availability synchronization matters for public search presentation; reference only if Moneyverse public item pages become indexable/eligible.

## Consumer changes specified
- Expression-first merchandising hierarchy.
- Wealth/profit/casino prestige de-emphasis.
- Authoritative deadline and expiry semantics.
- Optional bounded redemption grace.
- Follow-intent notification strategy.
- D1/D3/D7/D14/D30 shop/identity return logic.
- Public-safe artifact sharing.
- Monetization after comprehension, not deadline pressure.
- SEO preference for curated season/collection content rather than timer-page farms.

## Experiment backlog
Five experiments were documented with hypothesis, target cohort, entry point, control/treatment, primary metric, guardrails, observation window and next action:
A. identity-first merchandising;
B. exact deadline vs generic urgency;
C. hard cutoff vs redemption grace;
D. follow-intent vs broadcast notification;
E. catalog SEO volume vs curated public content.

## Security/privacy/fraud findings
- HIGH: deadline phishing/ATO.
- HIGH: false scarcity/deceptive urgency.
- HIGH: wealth/casino/profit prestige causing finance-like misunderstanding or loss-chasing incentives.
- HIGH: inventory sniping/bot/multi-account abuse.
- HIGH: sensitive recommendation/share leakage.
- MEDIUM: undisclosed individualized pricing/profile overreach.

No security code was changed. Separate security/privacy/fraud/legal QA is explicitly required before relevant runtime expansion.

## Files added
- `docs/planning/IDENTITY_SAFE_MERCHANDISING_TRANSPARENT_ROTATION_GROWTH_SPEC.md`
- `docs/planning/IDENTITY_SAFE_MERCHANDISING_TRANSPARENT_ROTATION_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-15-identity-safe-merchandising-transparent-rotation-v2026.09.15.96.md`
- `docs/changelog/2026-09-15-identity-safe-merchandising-transparent-rotation-v2026.09.15.96.ko.md`
- `docs/worklog/2026-09-15-identity-safe-merchandising-transparent-rotation-v2026.09.15.96.md`
- `docs/worklog/2026-09-15-identity-safe-merchandising-transparent-rotation-v2026.09.15.96.ko.md`

## Merge policy
Documentation-only change is intended for direct, non-forced fast-forward update of `main` after final latest-main recheck. No documentation PR is created.
