# Worklog — AI Economy Controller — v2026.09.13.24

Date: 2026-09-13
Branch: `docs/ai-economy-controller-v2026.09.13.24`
Scope: Documentation/planning only

## Request

Add a detailed plan for allowing AI to automatically help stabilize and tune the Moneyverse economy after researching practical methods and current reference patterns.

## Repository review

Before drafting, the latest `main` planning state, open integration work and existing economy specifications were reviewed. The existing `ECONOMY_SIMULATION_TUNING_SPEC.md` already defines read-only simulation, economy accounting taxonomy, 30/90/180 scenarios, health bands, sink-first tuning and rollback-oriented operations. The active Economy Scenario Lab work is therefore treated as a foundation rather than duplicated.

The repository was checked again during the work. At that checkpoint, `main` was at `22f8b7a18cd778ddf6a754cc6d28dd0206847885` with planning/worklog version `v2026.09.13.23`; no `v2026.09.13.24` or AI Economy Controller specification existed. This work was therefore assigned `v2026.09.13.24` and performed on a new documentation branch.

## Research review

Current official/reference patterns were reviewed for:

- environment-scoped remote/live configuration and staged/percentage rollout;
- idempotent economy transactions and optimistic concurrency/stale-write protection;
- time-series anomaly detection with confidence/expected ranges;
- seasonal behavior in a large persistent virtual economy.

These patterns were adapted rather than copied as product behavior.

## Planning decisions

The new controller is a bounded closed loop:

`telemetry -> quality/reconciliation -> anomaly/state -> seasonal baseline -> candidate -> Scenario Lab -> deterministic validator -> approval/mode -> versioned rollout -> observe -> rollback`

Important decisions:

- no direct AI balance, inventory or ledger mutation;
- deterministic guardrails remain authoritative over AI output;
- start with `RECOMMEND`, validate in `SHADOW`, then permit only low-risk `BOUNDED_AUTO` policies;
- use multiple observation windows and event/season labels;
- fail closed on stale data, reconciliation failure, high uncertainty, incidents or policy-version conflict;
- rollback configuration, never ledger history;
- preserve unlimited-by-default participation and sink-first tuning;
- route exploit-driven spikes to security/integrity response instead of repricing normal users;
- use a policy registry with min/max/step/drift/cooldown/sample/approval/rollback metadata;
- define DB, API, admin UX, model governance, KPIs and QA failure scenarios before runtime work.

## Initial planning defaults

For a future low-risk `BOUNDED_AUTO` phase, the planning spec proposes configurable starting values such as hourly observation, policy-family cooldown, approximately ±2% low-risk automatic step, approximately ±5% seven-day drift from a human-approved baseline, post-change 6h/24h checks and a 7-day retrospective. These are operator safety defaults, not player limits, and must be validated with `wdmv-test` and historical evidence before runtime use.

## Files added

- `docs/planning/AI_ECONOMY_CONTROLLER_SPEC.md`
- `docs/planning/AI_ECONOMY_CONTROLLER_SPEC.ko.md`
- `docs/changelog/2026-09-13-ai-economy-controller-v2026.09.13.24.md`
- `docs/changelog/2026-09-13-ai-economy-controller-v2026.09.13.24.ko.md`
- `docs/worklog/2026-09-13-ai-economy-controller-v2026.09.13.24.md`
- `docs/worklog/2026-09-13-ai-economy-controller-v2026.09.13.24.ko.md`

## Runtime/test status

No runtime code, database schema, API implementation or production configuration was changed in this work. Because this is documentation-only, `wdmv-test` deployment is not required for this PR.

Future implementation must follow the repository release contract: separate development branch -> development in `@미니pc홍` -> isolated `wdmv-test` deployment -> backend/DB/API/admin UI/idempotency/concurrency/rollback verification -> Production promotion.

## Next implementation priority

1. complete/merge a trustworthy read-only Scenario Lab foundation;
2. implement controller data-quality/reconciliation + policy registry in `OBSERVE_ONLY`;
3. expose `RECOMMEND` proposals to the admin console;
4. gather history and run offline replay/backtests;
5. run `SHADOW` long enough to measure error/false positives;
6. enable narrowly scoped `BOUNDED_AUTO` only after acceptance gates pass.