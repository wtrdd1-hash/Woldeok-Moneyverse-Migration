# Woldeok Moneyverse — Default Limit Policy

> Version: v2026.09.12.4
> Status: Living product-policy specification
> Date: 2026-09-12
> Applies to: product, season, shop, jobs, businesses, quests, collections, progression, social systems, and virtual-market UX
> Korean counterpart: [DEFAULT_LIMIT_POLICY.ko.md](DEFAULT_LIMIT_POLICY.ko.md)

## 1. Product default

Moneyverse uses **no arbitrary user-facing hard limit by default**.

A feature must not introduce a fixed cap merely because it is convenient to implement. Examples that should normally be unlimited unless there is a concrete product or integrity reason include:

- number of ordinary plays or sessions;
- number of quests completed;
- number of jobs performed;
- amount of season progression that may be earned through valid unique activities;
- number of non-scarce cosmetic purchases;
- number of ordinary collectibles owned when duplicates are meaningful;
- number of businesses a user may eventually progress toward owning;
- number of watchlist items or saved views when infrastructure can support them;
- number of seasons a player may participate in;
- normal profile/history/archive retention.

The product should prefer progression curves, costs, cooldown-free diminishing rewards, content availability, economy prices, matchmaking, and anti-abuse detection over arbitrary caps.

## 2. What may still be limited

Limits are allowed only when they protect a specific invariant and must be documented with a reason. Valid categories are:

1. **Security/abuse protection** — rate limits, bot resistance, brute-force protection, spam throttling, fraud/abuse review thresholds.
2. **Data integrity** — idempotency uniqueness, transaction atomicity, settlement locks, duplicate-reward prevention.
3. **System safety** — payload size, concurrency, memory/CPU/database protection, queue backpressure, API burst protection.
4. **Market integrity** — self-trade prevention, manipulation protection, circuit breakers, temporary integrity halts.
5. **Legal/compliance** — only where actually required.
6. **True scarcity** — only where the product explicitly creates finite inventory and communicates that scarcity before purchase.

These protections must not be presented as ordinary gameplay progression limits.

## 3. Default configuration rule

Where a configurable numeric limit exists, product configuration should support an explicit `unlimited`/`null` state. The default should be `unlimited` unless one of the approved protection categories above applies.

Do not encode `0` ambiguously as both disabled and unlimited. Use explicit semantics such as:

- `null = unlimited`;
- positive integer = enforced cap;
- separate `enabled` flag where needed.

## 4. Season-specific application

For seasons:

- season participation has no per-account count cap;
- valid season XP earning is not globally hard-capped by default;
- catch-up content should not stop solely because a user reached an arbitrary daily count;
- season store purchases are unlimited for non-scarce repeatable goods unless ownership semantics require one copy;
- collectible duplicates may remain purchasable when duplicates have a defined use;
- legacy/season continuity should not use an arbitrary carryover ceiling by default;
- rank participation has no arbitrary entry limit;
- historical season records remain available without a fixed retention count.

Season end dates, content windows, settlement locks, anti-abuse controls, and one-time unique rewards are lifecycle/state rules rather than gameplay caps and remain valid.

## 5. Economy design without hard caps

Removing default caps does not mean infinite uncontrolled economic issuance.

Economy balance should be controlled through:

- marginal/diminishing rewards for repeated low-value actions;
- escalating operating costs where appropriate;
- dynamic sinks;
- time/value trade-offs;
- market pricing;
- progression requirements;
- risk and maintenance costs;
- non-repeatable high-value objectives;
- server-side anomaly detection and abuse intervention.

The preferred model is **soft economic balancing without arbitrary player ceilings**.

## 6. Existing planning numbers

Any existing number written as `max`, `cap`, `limit`, `per-day maximum`, `top reward cap`, `carryover cap`, or similar in planning documents is now considered a **tuning example, not a default product invariant**, unless it falls into an approved protection category.

When each affected feature is implemented, the implementation spec must decide explicitly between:

- unlimited default;
- one-time uniqueness rule;
- true scarcity rule;
- safety/integrity protection limit.

No hidden limit may be introduced silently.

## 7. UX requirements

If a genuine limit applies, the UI must show:

- the limit;
- why it exists when user-relevant;
- current usage/progress where useful;
- reset/expiry time if temporary;
- whether the limit is gameplay, inventory scarcity, or safety protection.

If no limit applies, do not imply scarcity or urgency through fake counters.

## 8. Definition of Done

A new feature is not product-complete until reviewers confirm:

- no arbitrary hard cap was added by default;
- any remaining limit has a written reason/category;
- unlimited configuration is supported where appropriate;
- abuse/system protections remain server-authoritative;
- economy impact was evaluated without relying only on caps;
- English/Korean docs match.
