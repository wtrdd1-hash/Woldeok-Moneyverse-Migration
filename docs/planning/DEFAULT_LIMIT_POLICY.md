# Woldeok Moneyverse — Default Limit Policy

> Version: v2026.09.23.398
> Status: Living product-policy specification
> Date: 2026-09-23
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

## 9. AI-adjustable protection limits

The unlimited default does not prohibit a temporary AI-managed protection limit when a registered invariant is demonstrably at risk. Economy AI may adjust only policy-registry keys with explicit bounds, evidence requirements, maximum duration and rollback semantics.

For Jobs/Professions, ordinary daily completion and rewarded-completion limits remain `null = unlimited` by default. A finite value is allowed only as a bounded, disclosed, reversible protection response after softer levers are evaluated. The controller must be able to relax a finite value and return it to `null`; permanent one-way tightening is prohibited.

Primary-profession identity rules are separate from daily play limits. Slot-count policy may be tuned prospectively, but existing selections and earned mastery are grandfathered unless a separately approved migration says otherwise.

Any AI-adjusted user-facing limit must expose a reason category and reevaluation/reset semantics. It must never be personalized using sensitive attributes, hidden willingness-to-pay, advertising value or paid status.


## 10. Work reward-window semantics and reset disclosure

This section supersedes any UI or implementation assumption that a finite daily/weekly WLD counter is automatically a normal gameplay rule.

### 10.1 Policy classification
- Ordinary job participation/completion remains unlimited by default.
- A finite `daily_cap` or `weekly_cap` is valid only when it is an explicitly versioned reward-issuance protection policy with a documented reason class, effective period, reevaluation rule, and rollback/relaxation path.
- A finite reward cap must not be described as a generic "daily work limit" or imply that the player cannot continue working, earning mastery, or completing non-WLD progression.
- `null` is the canonical unlimited value. `0` must not ambiguously mean both unlimited and disabled.

### 10.2 Canonical game-clock windows
- Daily and weekly counters must use the same server-authoritative Moneyverse game clock as reward settlement.
- The daily window ends at `day_ends_at`; the weekly window ends at `week_ends_at`. These timestamps come from the canonical server clock and are not independently calculated by the client.
- UI copy must not hard-code "UTC 00:00", "local midnight", or "every midnight" unless that is exactly the active game-clock policy.
- The weekly card must explain the week boundary separately from the daily boundary; it must never inherit daily-reset wording.
- Policy/timezone changes must preserve one authoritative boundary per window and must not create double-refill, skipped-refill, or overlapping issuance windows.

### 10.3 Required read model/API contract
The work summary read model/API must expose at minimum:
`daily_paid`, `daily_cap|null`, `weekly_paid`, `weekly_cap|null`, `game_day_key`, `game_week_key`, `day_ends_at`, `week_ends_at`, `clock_policy_version`, and reward-policy version/reason metadata when a finite protection cap is active.

Clients render those authoritative fields. They may calculate display percentages, but must not infer or invent reset timestamps or cap reasons.

### 10.4 UX requirements
- Show "Daily reward window" / "Weekly reward window" rather than implying a job-play ban.
- Show consumed amount, remaining reward headroom, and the exact next reset boundary from the server.
- If the cap is unlimited, render an unlimited state and no fake percentage/progress bar.
- If a finite protection cap is active, show a concise reason label and whether work/mastery can continue after WLD headroom is exhausted.
- Reset timestamps must include enough timezone/clock context to avoid contradictory displays.
- If server clock data is stale/unavailable, render an explicit unavailable/retrying state rather than a fabricated reset time.

### 10.5 Settlement and concurrency invariants
The authoritative settlement transaction must re-check the same day/week keys and caps used by the read model. Concurrent last-slot completions, retries and idempotent replays must not exceed the cap or double-pay. A reset boundary crossing during a request must resolve against one canonical server timestamp/policy version and be auditable.

### 10.6 QA gate
Required tests include day/week boundary -1s/at/+1s, accelerated-game-clock scenarios, timezone/display conversion, policy version change, server restart, stale client state, concurrent final-headroom claims, retry/idempotency, unlimited/null rendering, finite-cap reason rendering, and EN/KO copy parity. Any mismatch between settlement boundaries and displayed reset boundaries blocks Production promotion.
