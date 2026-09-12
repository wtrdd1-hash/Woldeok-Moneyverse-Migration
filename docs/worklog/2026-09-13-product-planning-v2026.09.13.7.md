# Product Planning Worklog — v2026.09.13.7

Date: 2026-09-13

## Starting state

- Re-read current `main` and the Living Project Plan, Product Growth Plan, Detailed Product Design Spec, Season System Spec, Default Limit Policy and Economy Sinks Spec.
- Start-of-pass main SHA: `1b03e3f6e2e66780225d47e6446e73ecec5a4da3`.
- Rechecked open runtime work; Account Security Center PR #201 remained separate from this documentation-only planning pass.
- Rechecked `main` during the pass; SHA remained unchanged.
- External `easy-scraping.com` verification was unavailable, so runtime status remains `runtime verification unavailable`.

## Gap selected

The Growth Plan already defined activation/retention/economy KPIs and seven experiment ideas, but there was no dedicated implementation contract for analytics event schemas, consent-purpose separation, authoritative event sources, experiment assignment/exposure, metric versioning, statistical/guardrail discipline, retention or vendor governance.

This was selected over adding another gameplay subsystem because it is a prerequisite for safely measuring onboarding, retention, economy, revenue and SEO work already planned.

## Research reviewed

- Google Tag Platform Consent Mode official developer documentation, updated 2026-04-17: consent-state-aware measurement. Direct design input; no provider lock-in.
- LaunchDarkly Metrics/Experimentation current official documentation: metric definitions attached to running experiments remain version-stable. Direct design input; no provider selection.
- LaunchDarkly Holdouts current official documentation: later-scale stable 1–5% holdout over roughly 1–3 months. Reference/default only.
- Korea PIPC 2026 behavioral-advertising enforcement: transparency, meaningful choice and advertising-partner governance remain active concerns. Direct privacy design input.

## Changes

- Added English canonical and Korean `ANALYTICS_EXPERIMENTATION_GOVERNANCE_SPEC`.
- Added purpose/data classification, consent snapshots and prohibited event fields.
- Added common event envelope and server-authoritative event rules.
- Added KPI contracts covering activation, D1/D3/D7/D30 retention, economy health, revenue and SEO.
- Added experiment registry, stable assignment, exposure semantics, mutual exclusion, metric versioning, guardrails, sample/runtime discipline and optional holdouts.
- Added prohibited/review-required experiment categories for auth, privacy, billing, age assurance, loans and financial-game UX.
- Added event quality checks, data-retention layers and vendor destination register.
- Added initial P0 event catalog and four concrete experiments with guardrails.
- Updated English/Korean documentation indexes and changelogs.

## Policy checks

- No arbitrary gameplay caps were introduced.
- Experiment traffic allocation is explicitly a release/measurement control, not a gameplay cap.
- Economy metrics preserve `hard_sink`, `transfer`, faucet and revenue separation; P2P volume is not counted as burn.
- Market-learning experiments may not optimize raw trade count alone.
- Personalized advertising remains behind explicit consent/privacy/legal gates.

## Deployment/test

Documentation-only change. No Test deployment is required for this planning update.

Any runtime implementation must use a separate development branch and the normal isolated Test exact-SHA validation before Production.

## Branch / PR

- Version: `v2026.09.13.7`
- Branch: `docs/analytics-experimentation-governance-v2026.09.13.7`
- PR: to be created after final main reconciliation in this workstream.

## Next priority

1. reconcile and validate Account Security Center runtime work;
2. implement first-party authentication P0 security;
3. build first-party event/schema registry and authoritative economy metric read model;
4. run Runtime Product Reality Audit as soon as Production/Test access is restored;
5. only then begin controlled onboarding/retention experiments.
