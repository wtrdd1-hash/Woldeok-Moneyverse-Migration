# Clubs & Cooperative Economy — v2026.09.12.20

Date: 2026-09-12
Type: Product planning / documentation only

## Added

- Added `CLUBS_COOPERATIVE_ECONOMY_SPEC.md` and Korean parity document.
- Reinterpreted the older `5–30 members` planning seed as a small-group UX recommendation, not a membership hard cap.
- Set membership capacity to `null/unlimited` by default, consistent with `DEFAULT_LIMIT_POLICY.md`.
- Defined club lifecycle, discovery/join modes, role-capability authorization and ownership transfer/dissolution rules.
- Defined non-withdrawable project-specific club funding instead of a free-form shared WLD wallet for P0.
- Classified club economy flows as `HARD_SINK`, `HOLD`, `TRANSFER`, and `CONVERTER` so contribution volume is not confused with actual WLD destruction.
- Added cooperative project state machine and contribution settlement/idempotency requirements.
- Added low/mid/high/prestige sinks including charter, clubhouse rooms, gallery wings, trophy atrium, skyline headquarters, legacy hall, city sponsorship and landmark co-sponsorship.
- Added geometric no-final-tier expansion pricing where content/infrastructure does not impose a true boundary.
- Added cooperative objectives with diminishing marginal contribution value instead of arbitrary participation caps.
- Added season reset/persistence rules and D-14/D-7/D-3/D-1 club continuity UX.
- Added discovery/recruitment/feed/privacy/moderation requirements.
- Added PostgreSQL entity recommendations, API routes, concurrency contract, analytics, admin console, config policy and P0/P1/P2 rollout.
- Added club economy dashboard metrics for contribution volume, actual sink volume, pending holds, refunds, concentration and wealth-cohort participation.

## Research basis

- Guild Wars 2 guild-hall upgrades: shared resource contributions can fund persistent social spaces and visible organization identity.
- EVE Online 2026 Military Campaigns: different playstyles can contribute toward shared long-horizon objectives.
- EVE corporation/freelance-job direction: organizations can be a bridge for newer users into community participation.
- TradingView 2026 Paper Trading competitions: separate equal-condition competition accounts support isolating competitive score from persistent wealth.

Moneyverse intentionally does not copy weekly contribution caps, power buffs or wealth-driven ranking from these references.

## Compatibility and deployment

Documentation only. No runtime code, API, database schema, migration, ledger or deployment behavior changed. Test-server deployment is not required for this revision.

Runtime implementation must use a separate development branch, forward-only migrations, server-authoritative authorization/ledger writes, exact-candidate Test deployment and PostgreSQL/API/concurrency/idempotency/moderation validation before Production promotion.