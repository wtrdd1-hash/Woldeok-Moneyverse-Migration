# Moneyverse Strategy Direction Candidate C — v2026.10.14.602

> **Status: DRAFT / PROPOSAL_ONLY / NOT_ADOPTED.** English canonical proposal. [Korean counterpart](STRATEGY_DIRECTION_PROPOSAL_v2026.10.14.602.ko.md).
> The current authoritative product plan remains `PROJECT_PLAN.md` and `INTEGRATED_PLANNING_MASTER.md` at v2026.10.05.530. This document does not supersede them.
> Evidence: [deep strategy review](../findings/MONEYVERSE_STRATEGY_DEEP_DIVE_v2026.10.14.602.md), [SEO facts](../findings/MONEYVERSE_SEO_DEEP_EVIDENCE_v2026.10.14.602.md), [47 reviewed public references](../findings/MONEYVERSE_REFERENCE_REGISTER_v2026.10.14.602.csv).

## 1. Proposed decision
1. **Positioning:** a free, accurate personal finance problem solver is the acquisition layer; an engaging, meaningful and safe virtual-economic world is the long-term retention product.
2. **Separation of concerns:** publicly accessible calculators/finance literacy versus authenticated virtual WLD economy. Never condition actual calculator answers on signup or ad clicks.
3. **North Star candidate:** weekly economically engaged decision users (WEDU), defined through validated decisions and settlement receipts, excluding admins, bots and test accounts. Separate `tool_result_completed` as the actual organic acquisition value.
4. **SEO:** eligible URLs require independent intent, verified main content, jurisdiction, canonical/hreflang, provenance and effective date. No scaled low-value content, fake rankings/index percentages or fake rating schemas.
5. **Safety:** continue nonredeemable virtual WLD, economic invariants, controlled AI advisory only, current ad-only real-money monetization; no casino, leverage or paid item promotion before formal governance review.
6. **Release:** no code/production change in this proposal; any subsequent implementation requires dedicated fresh-main branches, source/test exact-SHA QA, backend/DB/role and responsive E2E, then zero-downtime controlled promotion.

## 2. User states and navigation
**Anonymous calculator visitor:** sees a correct full result with formula, source, assumptions, date, mobile access and accessible controls. A brief scenario extension is optional.
**Anonymous scenario participant:** sees an explicitly virtual result and the effect of one choice; may share non-sensitive aggregate outcome, without signup.
**First-time account:** consent → choose life goal/role → first job → one verified WLD income receipt → one spending/savings/investment decision → net worth and cash-flow effect.
**Day 1 return:** review money movement, a new economic event and optional plan; no manipulative notifications.
**Day 7 return:** progress in career, a fair public project and an invitation to collaborate; no paid advantage.
**Day 30 return:** understandable personal economic report with reversible learning choices and progress toward a long-term goal.

Recommended public information architecture: **Calculators / Finance glossary / Try economy / Guide**. Authenticated navigation: **My Economy (career, cash flow, wallet, goal) / Markets (bank, virtual equities, enterprise) / Society (treasury, policy, public projects, clubs) / Records (ledger, growth, notifications)**. Advanced trading and policy administration are contextual, not default beginner navigation.

## 3. Testable definitions
| Outcome | Numerator | Denominator | Guard |
|---|---|---|---|
| Organic impressions/visits | provider-observed impression/click events | provider query-date-device-country scope | never substitute sitemap counts |
| Tool completion | actual result successfully delivered/viewed | eligible non-bot tool sessions | loading/scroll not counted as completion |
| Second valuable action | another useful tool, scenario result or saved result | completed tools | CTA view/signup-button click not value |
| Activation | first verified settled WLD decision and receipt | opted-in signup cohort | login alone not active |
| D1/D7/D30 retention | meaningful economic decisions within defined day/window | source-specific signup cohort | exclude operator/test/bot and define time zone |
| Ad contribution | verified net ad earnings minus variable costs | eligible public ad pageviews | no private/gambling/game control ads |

## 4. Three initial no-login experiments
- **KO compound calculator → virtual 10-year scenario:** one optional CTA *after* a full independent answer, short deterministic budget-vs-risk result, accessible and cancellable. Primary `second_useful_action`, guard completion rate and CLS.
- **KO salary/paycheck → simulated monthly budget:** clarify official gross/net tax basis, then optional fictional lifestyle/tax/spending allocation. No raw payroll analytics or compelled account.
- **EN savings goals → economy scenario:** genuine English explanation/locale, no Korean salary tax translation for US/UK. First prove canonical and English title/body consistency.

Use randomized or stable cohort experiments with declared duration, event denominators, uncertainty, consent and anti-bot filters. No statistically unsupported success declarations or conversions inferred from signup CTA impressions.

## 5. Economy settlement and monetary authority
`M[t+1] = M[t] + authorized_mint - authorized_burn`; transactions/treasury taxes redistribute existing WLD; sum of entries in a transaction equals zero; client retries return idempotent identical receipt. Central Bank controls proposed policy, Mint executes approved issuance, Treasury runs budget allocation of existing value, and Economy Core/DB ledger validates. AI recommendations are explainable and non-authoritative. Disallow negative balance, duplicate reward, unrecorded money creation, collusion and economic privilege bypass.

**Unresolved P0 planning ambiguity:** the v522 official plan lists “four” redistribution functions yet enumerates five allocations totalling 140% (40+40+30+10+20). These could be conditional/independent denominators; require explicit base, period, caps, order and accounting before authorizing automation. Similarly the 30% treasury reserve floor and 85% cash-liquidity normalization may operate on different scopes and must not be blindly substituted.

## 6. SEO source-of-truth design
Proposed records:

```ts
SeoEvidence {
  engine, property, source, fetchedAt, dateRange, sampleCount,
  status: 'VERIFIED'|'PARTIAL'|'STALE'|'NO_DATA'|'ERROR',
  submitted, crawled, indexed, impressions, clicks, ctr, position
}
SeoDocument {
  routeId, primaryIntent, locale, jurisdiction, canonical, alternates,
  title, description, contentChangedAt, sourceEffectiveAt,
  indexability, schemaEligibility, qualityOwner
}
```

Generated robots, sitemap, canonical, locale and JSON-LD must share one consistent URL authority. Remove obsolete Google ping and inaccurate `Google Indexing API` success messaging while retaining the **real** authenticated Search Console Sitemaps implementation. No missing GSC data should be converted into 100% success. Search engine receipt != indexing.

## 7. Korea and global segmentation
**Korea first:** salary/social insurance, loan/DSR, ISA/pension, stock cost basis, compound interest and tax; refresh formulas from Korean official sources and show effective date. Track Google GSC and Naver separately.

**English first:** compound, savings goal, DCA, FIRE and debt payoff, with explicit country handling and locally accurate income/mortgage/tax formulas. EN tool title/body/canonical must reflect actual English source; preserve own-language canonical when independently valuable and eligible.

**JA/ZH later:** native intent review, translation beyond site chrome, unit/currency/jurisdiction accuracy, reciprocal valid hreflang and real user-test evidence. The glossary's correct translation is not proof all tools are localized.

GeoIP may suggest locale but cannot override explicit locale URL, user preference, robots or main-content identity.

## 8. Workstream and no-conflict development rule
| Workstream | Example isolation | Prerequisite |
|---|---|---|
| SEO evidence truth | `fix/seo-evidence-truth-*` | Authenticated GSC and explicit missing data |
| SEO locale URL engine | `fix/seo-locale-authority-*` | Coordinate route contracts with SEO truth owner |
| Product optional simulator | `feat/economy-onramp-*` | Existing full UI re-audit gate and consent |
| Economy authority docs | `docs/treasury-allocations-*` | Explain 140% ambiguity and audit real ledger |
| Search analytics | `feat/funnel-cohorts-*` | Consent, schema governance and non-PII tracking |

GPT and Gemini must not edit overlapping surfaces without prior scoped ownership. Before and mid-work fetch `origin/main`; keep worklog, internal/GitHub EN/KO update notes; use sequential versions; every code change requires branch → Test exact SHA frontend/backend/DB/E2E/security → zero-downtime Production with rollback. Documentation-only review requires no Test or runtime release.

## 9. Stage gates and timeline (proposed, not promised)
**Week 1: Telemetry truth.** Remove fabricated SEO percentages and deprecated submission claims, validate admin mobile/UI/API failures, latest source/release identity, authenticated provider sources. Block any new pSEO expansion until verifiable monitoring.
**Weeks 2–3: Quality gate.** Examine highest-intent 20–40 routes and valid localized URLs, formulas, indexing and Core Web Vitals; avoid blind bulk noindex/redirect.
**Weeks 4–6: First-value funnels.** Ship measured optional onramp on three tools only after full Test/safety acceptance.
**Weeks 7–9: Engaged economy.** Fair roles, economic events, treasury public projects, club collaboration and explainable receipts; measure D1/D7 cohort.
**Weeks 10–12: Evidence-based scale.** Expand only what improves organic useful results, long-term active decisions and verified net ad contribution without user trust/retention harm.

**Stop gates:** monetary supply/accounting mismatch, unauthorized mint, privacy breach, SEO misreporting, illegal or unsafe monetization, operator/accessibility/security failure. **No approval** means v602 remains an unadopted proposal, with no live change.

## 10. Adoption dependency
An explicit user product-direction decision is required to incorporate these recommendations into a **new authoritative planning version**, and individual implementation stages still require their own exact-SHA Test/backend/real-DB acceptance and controlled zero-downtime Production promotion. This proposal is an auditable recommendation, not a completed release.
