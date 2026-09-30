# Internal Update — Treasury automatic recycling & engagement — v2026.10.01.492

> Audience: internal product/engineering/operations
> Status: PLANNING
> Runtime impact: none

## Decision

Treasury no longer exists in planning as a tax collection bucket that may grow indefinitely. When reserve, reconciliation, telemetry and integrity gates are healthy, eligible surplus is assigned to a bounded recyclable pool.

## Tax/fee expansion

Planning now distinguishes:
- marketplace sale tax;
- listing/broker fee;
- upward reprice fee;
- stock sell tax;
- business profit tax and optional large-profit surcharge;
- B2B settlement tax;
- standard shop vs luxury tax;
- high-tier property/space stamp duty;
- optional business expansion/license fee;
- temporary seasonal luxury levy.

P2P transfer remains 0% by default. Baseline work/quest/check-in rewards, refunds/reversal principal and starter/core access remain protected.

## Treasury spending loop

Initial recyclable programs:
- city/community matching;
- verified public contracts;
- seasonal public works;
- new/returning-user activation;
- public fee relief;
- bounded business/market stabilization;
- civic weekly challenges;
- allowlisted item buyback/salvage.

Initial planning cap: HEALTHY uses at most 25% of recyclable surplus and 20% of trailing 28-day tax/fee revenue per weekly cycle; SURPLUS uses at most 40% and 30% respectively. These are simulation targets, not Production parameters.

## Player-facing fun

- Treasury Today meter
- project progress / next unlock
- public contract pool
- “where treasury goes” allocation view
- temporary fee-relief events
- Accounting/Commerce service-fee mastery discount
- civic archive/title rewards based on participation breadth, not tax paid

## Hard safeguards

No tax-paid P2W, richest-taxpayer leaderboard, tax-funded lottery/wagering, idle-balance tax, confiscatory wealth tax, reserve breach, wash/self-transfer reward, or automatic creation of a new tax/reward class.

Detailed authority: `docs/planning/ADMIN_TREASURY_MANAGEMENT_SPEC.md`.
