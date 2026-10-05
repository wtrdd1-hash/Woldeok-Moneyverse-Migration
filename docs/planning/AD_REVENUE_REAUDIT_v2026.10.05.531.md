# Advertising Revenue Re-audit — v2026.10.05.531

> Status: PLANNING / BLOCKED_FOR_SCALE
> Baseline: `origin/main=5c497639a919a5adf1ef648eba07f08bf7cd45a7`

## Decision
Advertising can monetize Moneyverse and the production surface already has AdSense configuration, ads.txt, CSP support, public ad components, and many calculator/guide placements. The current blocker is not ad capability; it is insufficient trustworthy evidence that qualified human traffic and observed ad economics are large enough to scale.

Do not increase ad density or manufacture pages first. Repair measurement truth and placement drift, then grow qualified search traffic into useful public tools/guides and optimize ads only on eligible surfaces.

## Confirmed problems
### P0 — crawler-inclusive hits are treated as pageviews
`totalHits24h` is derived from SEO logs. The admin AdMonetizationCard converts that value into estimated monthly KRW and goal achievement while labeling it as crawler-and-visitor hits. Google Page RPM uses actual pageviews, not crawler-inclusive server hits.

Decision: current estimated monthly ad revenue and target-achievement percentage are NON_AUTHORITATIVE. Replace them with provider-backed estimated/finalized earnings, Page RPM/ad RPM, eligible human pageviews, ad impressions/requests, invalid-traffic adjustments, policy state, and route/locale/device/source segmentation.

### P0 — placement conflicts with current route policy
Current planning blocks ads on casino/chance and transaction/decision-sensitive surfaces. Exact-main still renders `PublicAdvertisement` on `/casino` and `/stocks/[symbol]`.

Decision: this is AUTHORITY_DRIFT and an internal ad-policy release blocker. Runtime remediation must remove or fail-close these placements before ad expansion. This audit does not claim Google issued a violation.

### P1 — target math is not observed economics
`monthly revenue = pageviews / 1000 × observed Page RPM` is valid arithmetic. Scenario RPM values remain hypotheses until sourced from Moneyverse provider reports.

### P1 — qualified traffic is the acquisition bottleneck
Revenue funnel: eligible indexable page -> search impression -> qualified human click -> useful landing completion -> second useful action -> return/signup -> eligible pageviews -> valid ad impressions -> finalized revenue.

Bots, crawler fetches, thin pSEO, incentivized viewing, self-clicks, click encouragement, traffic exchanges and low-quality purchased traffic are excluded.

### P1 — pSEO must pass inventory-value gates
Programmatic pages become monetizable only after independent user value, unique intent, reviewed content, canonical/index eligibility and policy-safe placement are demonstrated.

## Revenue sensitivity
| Observed Page RPM | KRW 1M/mo PV | KRW 5M/mo PV | KRW 10M/mo PV |
|---:|---:|---:|---:|
| KRW 2,000 | 500,000 | 2,500,000 | 5,000,000 |
| KRW 5,000 | 200,000 | 1,000,000 | 2,000,000 |
| KRW 10,000 | 100,000 | 500,000 | 1,000,000 |
| KRW 20,000 | 50,000 | 250,000 | 500,000 |

Sensitivity only, not a forecast. Net contribution subtracts content, translation, moderation, infrastructure, privacy, support, fraud and measured ad-caused retention/session loss.

## Required order
1. Measurement truth: provider-backed ad metrics; synthetic scenarios clearly labeled.
2. Placement safety: central allow/block policy; remove casino and stock-decision ads; regression tests.
3. Qualified acquisition: original calculators, glossary/guides and public utilities backed by search demand.
4. SEO conversion: answer intent before signup and offer a relevant second action.
5. Ad optimization: controlled experiments only after clean traffic; CWV/retention/complaint guardrails.
6. International: locale-by-locale rollout after translation, consent/privacy, demand and ad-economics gates.

## Scale gate
SCALE only with a rolling 30-day provider-backed dataset: finalized revenue, stable Page RPM, valid traffic, no unresolved policy warning, acceptable LCP/INP/CLS, and no material retention/task-completion regression. Otherwise ITERATE/HOLD; KILL or ROLLBACK on invalid-traffic, policy, deceptive-placement, trust or retention failure.

## Evidence — 2026-10-05
- Exact-main has `frontend/public/ads.txt`; Production `/ads.txt` returned HTTP 200 with the same publisher declaration.
- Source scan found 36 page files referencing advertisement components.
- Exact-main `/casino` and `/stocks/[symbol]` contain `PublicAdvertisement`.
- `totalHits24h` is used to estimate monthly revenue despite including crawlers.
- No provider-backed 30-day finalized-revenue/Page-RPM dataset was found in reviewed repository evidence.

## Release statement
Documentation/research only. No runtime code, AdSense setting, Test deployment, Production promotion, revenue result, or policy-clearance result is claimed.
