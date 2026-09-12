# Analytics & Experimentation Governance v2026.09.13.7

Date: 2026-09-13

## Why

The current Growth Plan defines KPI families and an experiment backlog, but the repository did not yet have one implementation-grade contract for event schemas, consent state, authoritative event sources, experiment assignment, metric versioning, guardrails, data-quality checks, retention and operator governance.

## Changes

- Added `ANALYTICS_EXPERIMENTATION_GOVERNANCE_SPEC.md` as the English canonical specification and a maintained Korean counterpart.
- Defined purpose limitation, data minimization, consent-aware destinations and prohibited analytics fields.
- Defined a versioned event envelope with unique `event_id`, release/config context, experiment assignments and consent snapshot.
- Separated client UI observations from authoritative server/database events for accounts, economy, orders, billing and season rewards.
- Added KPI contracts for activation, D1/D3/D7/D30 retention, economy health, revenue and SEO.
- Added a production experiment registry, stable server-side assignment, real exposure events, mutual exclusion, immutable metric versions and auditable decisions.
- Added guardrails for reliability, accessibility, abuse, economy integrity, virtual-market safety, billing, notification pressure and under-age policy.
- Added data-quality checks including deduplication, timestamp skew, assignment balance and sample-ratio mismatch.
- Added storage/retention layers and external analytics/experimentation vendor governance.
- Preserved unlimited-by-default gameplay policy: rollout/allocation controls are not user progression caps.
- Added P0 event catalog and initial experiments for onboarding, dashboard recommendations, comeback missions and market-risk learning.
- Runtime verification remained unavailable; no implementation is inferred from this documentation.

## Research references reviewed

- Google Tag Platform Consent Mode, official developer documentation, updated 2026-04-17 — direct adoption for consent-state-aware measurement/destination gating.
- LaunchDarkly Metrics and Experimentation documentation, current 2026 documentation — direct adoption for metric-version stability and explicit metric contracts; provider selection not implied.
- LaunchDarkly Holdouts documentation, current 2026 documentation — reference adoption for later-scale stable 1–5% holdout over roughly 1–3 months.
- Korea Personal Information Protection Commission 2026 behavioral-advertising enforcement — direct adoption for meaningful choice, transparency and destination/vendor governance.

## Revenue / legal / SEO impact

- Revenue: improves attribution for subscription, cosmetic and advertising decisions without mixing cash revenue with WLD economy metrics.
- Legal/privacy: adds consent-purpose separation, data minimization, retention and vendor governance; final vendor/cross-border/age-specific applicability remains `legal review required`.
- SEO: public acquisition metrics may use aggregate search/landing data; private account/balance/billing/portfolio data remains non-indexable and excluded from SEO attribution joins by default.

## Change management

- Version: `v2026.09.13.7`
- Branch: `docs/analytics-experimentation-governance-v2026.09.13.7`
- Change type: documentation-only
- Test deployment: not required for this documentation change
- Runtime implementation: separate development branch -> isolated Test exact-SHA -> event/schema/backend/DB/API/UI/consent validation -> Production

## Next priority

1. reconcile the Account Security Center runtime PR with current main and complete Test evidence before runtime merge;
2. implement first-party authentication P0 security work;
3. create first-party event/schema registry and authoritative economy metric read model before running product experiments;
4. perform Runtime Product Reality Audit immediately when service access returns;
5. keep personalized advertising and real-money experimentation behind privacy/legal gates.
