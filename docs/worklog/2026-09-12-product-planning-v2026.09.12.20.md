# Product Planning Worklog — v2026.09.12.20

Date: 2026-09-12
Scope: Clubs & cooperative economy
Branch: `docs/clubs-cooperative-economy-v2026.09.12.20`
Runtime impact: none; documentation only

## Starting state reviewed

Reviewed current planning source of truth and related implementation-oriented specs before drafting:

- `PROJECT_PLAN.md`
- `PRODUCT_GROWTH_PLAN.md`
- `PRODUCT_DESIGN_SPEC.md`
- `DEFAULT_LIMIT_POLICY.md`
- `ECONOMY_SINKS_SPEC.md`
- `ECONOMY_SINK_CATALOG.md`
- `SEASON_SYSTEM_SPEC.md`
- `PERSONAL_SPACES_CITY_PROJECTS_SPEC.md`
- `PLAYER_MARKETPLACE_CRAFTING_SPEC.md`
- current `docs/INDEX.md`
- current open PR set and recent `main` commits

The identified gap was that clubs were still specified mainly as a 5–30 member social feature with weekly objectives and club points, without implementation-level economy, permissions, project settlement, clubhouse, season continuity, database/API or moderation contracts.

## Main design decisions

1. Treat the previous `5–30` size as a small-group UX recommendation, not a hard membership cap.
2. Default membership capacity to `null/unlimited`; use safety controls and large-group UX techniques instead of arbitrary gameplay ceilings.
3. Do not launch a freely withdrawable club WLD treasury in P0. Use project-specific contribution contracts.
4. Distinguish project `HOLD`, settled `HARD_SINK`, user `TRANSFER` and material `CONVERTER` flows.
5. Create long-horizon sinks from club identity, clubhouse expansion, galleries, archives, city sponsorship and prestige construction.
6. Keep club spending non-pay-to-win and unrelated to job payout, stock execution/returns, loan terms, business yield or season league score.
7. Allow unlimited valid participation while using diminishing marginal objective weight and one-time milestones instead of linear infinite WLD rewards.
8. Preserve permanent club identity/history through seasons while resetting only season-scoped objective/ranking state.
9. Use capability-based role authorization and append-only audit events.
10. Require server-authoritative, idempotent, transactional project contributions and settlement.

## Research reviewed

- Guild Wars 2 guild upgrade model: pooled member resources fund persistent shared spaces and organization features.
- EVE Online `Cradle of War` / Military Campaigns (2026): multiple playstyles contribute to common long-running strategic objectives.
- EVE corporation/freelance-job direction: organizations can create meaningful low-friction contribution paths for newer users.
- TradingView 2026 Paper Trading competitions: competitive accounts use separate standardized conditions, supporting separation between persistent wealth and competitive scoring.

Moneyverse intentionally does not adopt power buffs, arbitrary weekly contribution caps, or wealth-purchased ranking advantage from external examples.

## Files added

- `docs/planning/CLUBS_COOPERATIVE_ECONOMY_SPEC.md`
- `docs/planning/CLUBS_COOPERATIVE_ECONOMY_SPEC.ko.md`
- `docs/changelog/2026-09-12-clubs-cooperative-economy-v2026.09.12.20.md`
- `docs/changelog/2026-09-12-clubs-cooperative-economy-v2026.09.12.20.ko.md`
- `docs/worklog/2026-09-12-product-planning-v2026.09.12.20.md`
- Korean parity worklog

`docs/INDEX.md` is updated in the same branch.

## Concurrent-change check

The latest `main` was checked before work and again after the two core specification files were written. It remained at `3feb7f90b9be01b00fa98269789dd20d5fbc0959`; no overlapping club/cooperative-economy planning change was detected. Open Banking & Financial Services work is a separate scope.

## Validation

Documentation-only validation:

- English/Korean product behavior parity reviewed while drafting.
- No runtime/API/DB migration changed.
- No Test deployment required for this revision.
- New financial state contracts explicitly require idempotency, authoritative server pricing/policy, transactional settlement and later real-PostgreSQL validation.

## Next priorities

1. P0 club seed catalog: banner/furniture/archive/project templates with exact config payloads.
2. Clubhouse screen-level UX and large-club pagination/sharding behavior.
3. Season 1/2 cooperative objectives and exact cosmetic/archive reward matrices.
4. Club contribution economy simulation by new/mid/high-wealth cohorts.
5. Community feed/moderation specification with stock-manipulation discussion safeguards.
6. Reconcile remaining old hard-cap examples in parent planning documents as each feature reaches implementation.