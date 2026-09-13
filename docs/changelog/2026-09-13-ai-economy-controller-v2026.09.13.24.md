# AI Economy Controller Planning Update — v2026.09.13.24

Date: 2026-09-13
Type: Documentation / product-planning specification
Runtime impact: None in this change

## Summary

Added a new canonical planning specification for a bounded AI-assisted virtual-economy controller. The design builds on the existing Economy Simulation & Dynamic Sink Tuning specification and Scenario Lab work while preserving Moneyverse's unlimited-by-default and sink-first balancing policies.

## Added

- `docs/planning/AI_ECONOMY_CONTROLLER_SPEC.md`
- `docs/planning/AI_ECONOMY_CONTROLLER_SPEC.ko.md`

## Key decisions

- AI never directly mutates player balances, inventory or append-only ledger history.
- AI may generate diagnosis and candidate policy changes, but deterministic guardrails remain the final authority.
- Operating modes are `OBSERVE_ONLY`, `RECOMMEND`, `SHADOW`, `BOUNDED_AUTO` and `EMERGENCY_FREEZE`.
- Routine economy decisions require multi-window evidence using 1h/24h/7d/30d observations plus season/event labels rather than reacting to one short-term delta.
- `BOUNDED_AUTO` starts with a low-risk allowlist focused on optional sinks, discoverability and non-essential service parameters.
- High-impact controls such as starter WLD, loans, season payouts, WDX price formation, conversion rates, paid monetization and new currencies remain human-approved.
- Initial planning guardrails include small step size, bounded drift, cooldown, sample-size/uncertainty requirements, post-change observation and automatic pause/rollback.
- Rollback restores a previous configuration version and never rewrites ledger history.
- Implementation contracts now cover policy registry, controller data model, admin APIs, admin console UX, model governance, analytics and QA failure cases.

## Research incorporated

Planning decisions were informed by current official documentation and operating patterns for environment-scoped live configuration and progressive rollout, retry-safe/idempotent economy mutation, optimistic concurrency, time-series anomaly detection with confidence/bounds, and seasonal behavior in large virtual economies.

## Release policy

This is a documentation-only change. `wdmv-test` deployment is not required for this documentation PR.

Any runtime implementation must be performed on a separate development branch in the `@미니pc홍` environment, deployed to isolated `wdmv-test`, and verified for backend, database, API, admin UI, idempotency, concurrency and rollback before Production promotion.