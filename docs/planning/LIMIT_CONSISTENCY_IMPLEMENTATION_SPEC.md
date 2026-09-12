# Woldeok Moneyverse — Unlimited-Default Consistency Implementation Specification

> Version: v2026.09.12.23
> Status: Implementation-oriented policy reconciliation
> Date: 2026-09-12
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `SEASON_SYSTEM_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`
> Korean counterpart: [LIMIT_CONSISTENCY_IMPLEMENTATION_SPEC.ko.md](LIMIT_CONSISTENCY_IMPLEMENTATION_SPEC.ko.md)

## 0. Purpose

This specification reconciles older planning numbers with the newer unlimited-by-default product policy. It prevents implementation teams from copying historical tuning examples into permanent player-facing hard caps.

The governing rule is simple: **ordinary valid play is unlimited by default; protections constrain unsafe operations, not healthy participation.**

Whenever an older document contains `max`, `cap`, `limit`, `per-day maximum`, `carryover cap`, or a fixed quantity that behaves like a ceiling, implementation must classify it before coding it.

## 1. Mandatory classification

Every numeric ceiling must be exactly one of these classes:

1. `UNLIMITED_DEFAULT` — ordinary gameplay/product quantity; store `null` when no cap applies.
2. `UNIQUENESS` — one-time ownership/claim semantics such as a unique trophy.
3. `TRUE_SCARCITY` — real finite inventory known to the user before purchase.
4. `SECURITY_PROTECTION` — bot/spam/brute-force/API abuse protection.
5. `SYSTEM_SAFETY` — payload, queue, concurrency, memory, database or backpressure protection.
6. `MARKET_INTEGRITY` — self-trade, manipulation, liquidity/circuit-breaker or settlement protection.
7. `LEGAL_COMPLIANCE` — only an actual documented requirement.
8. `CONTENT_BUDGET` — finite authored content/reward schedule, not a prohibition on other valid play.

`CONTENT_BUDGET` must never be implemented as an account-wide play lock unless another approved protection class also applies.

## 2. Configuration contract

Recommended common schema:

```text
limit_mode: unlimited | uniqueness | scarcity | protection
limit_value: bigint | null
limit_reason_code: string | null
limit_scope: account | item | order | request | market | season | project | system | null
reset_policy: none | rolling_window | fixed_window | lifecycle | null
user_visible: boolean
```

Rules:

- `unlimited` requires `limit_value = null`.
- `0` must not mean unlimited.
- protection limits require `limit_reason_code`.
- protection telemetry must be separated from progression analytics.
- changing a protection threshold must be auditable and configuration-versioned.
- a frontend constant alone is never authoritative.

## 3. Reconciliation of known historical caps

### 3.1 WDX open orders

Historical wording in `PRODUCT_DESIGN_SPEC.md`: `max 20 open orders/account`.

**New classification:** `SYSTEM_SAFETY`, not ordinary progression.

Implementation direction:

- product default is no arbitrary user-facing open-order count ceiling;
- order lists use cursor pagination;
- matching/settlement uses queue backpressure and per-request concurrency controls;
- server may configure a temporary protective ceiling only if load testing establishes a concrete resource invariant;
- any protective ceiling must be substantially above normal use, observable, reason-coded and adjustable without code deployment;
- do not market the protective threshold as a gameplay feature.

Definition of Done: load test establishes either `null` or a documented safety threshold; API returns a distinct `SYSTEM_CAPACITY_PROTECTION` problem type if the safety threshold is ever reached.

### 3.2 WDX single-order notional

Historical wording: lower of `20% of liquid WLD` or policy cap.

**New classification:** replace the arbitrary account-percentage cap with `MARKET_INTEGRITY` controls tied to the fictional instrument and available liquidity.

Recommended executable model:

```text
allowed_notional = min(
  available_cash,
  instrument_dynamic_notional_guard
)
```

`instrument_dynamic_notional_guard` may be `null` when no integrity guard is needed. When enabled it is derived from simulated liquidity, price-impact budget, reference volume and current market state rather than user wealth alone.

Suggested inputs:

- recent simulated ADV / liquidity bucket;
- current spread and volatility state;
- recent order imbalance;
- account/linkage integrity signals;
- current circuit-breaker state.

The guard exists to protect price formation, not to slow wealthy users.

### 3.3 Tutorial trade quantity

Historical wording: `max 5 shares/trade for first three trades`.

**New classification:** onboarding sandbox rule, not a permanent account cap.

Keep only inside explicitly labelled guided tutorial orders. After the tutorial state ends, normal market policy applies. Tutorial trades should use isolated/capped educational exposure and must not create a hidden permanent restriction.

### 3.4 Season XP source maxima

Historical examples include daily/weekly/event XP maximums.

**New classification:** `CONTENT_BUDGET`.

Meaning: authored daily missions may contain 450 XP worth of rewards, but reaching that authored amount does not disable unrelated valid season activities. Additional unique story, event, club, collection, learning or catch-up content can continue awarding XP.

Repeatable low-value actions should use diminishing marginal XP instead of a global account ceiling:

```text
xp_multiplier(n) = max(floor_multiplier, 1 / sqrt(max(1, n)))
```

`n` is repetition count for the same low-value action family within the configured balancing horizon. This curve is a tuning example, not a mandatory formula.

### 3.5 Season Token issuance target

Historical `500–700 ST` is **CONTENT_BUDGET**, not a wallet balance cap. The wallet supports values above that if legitimate content, corrections or future seasons issue more.

### 3.6 Season Token -> Legacy Token carryover

Historical wording: 20% conversion capped at 100 ST.

**New classification:** fixed carryover ceiling is deprecated because it conflicts with the default-limit policy.

Replacement default:

```text
legacy_token_grant = floor(unused_season_token * configured_conversion_ratio)
```

No fixed per-account carryover maximum by default. If economic simulation shows excessive legacy accumulation, prefer archived-catalog pricing, progressive prestige costs, additional legacy sinks, or a lower globally published conversion ratio rather than an arbitrary personal ceiling.

### 3.7 Ranked season WLD reward ceiling

Historical `max 500 WLD` is a **reward schedule budget**, not a gameplay cap. It may remain as a tuning value because it limits system issuance, not player participation. Rename fields from `reward_cap` to `reward_amount_by_tier` or `reward_budget` to avoid semantic confusion.

### 3.8 Unique cosmetics / trophies

`limit = 1` is valid only when ownership is intrinsically unique. Storage should use uniqueness constraints (`UNIQUE(user_id, entitlement_code)`) instead of a generic purchase-count cap.

### 3.9 Finite event inventory

Finite inventory is allowed only when the stock is genuinely finite. Required fields:

```text
scarcity_mode = finite
initial_stock
remaining_stock
stock_version
published_before_purchase = true
```

Atomic decrement is required. Fake “only X left” counters are prohibited.

## 4. No-cap economy control

Unlimited participation requires stronger economy controls. Do not solve inflation by disabling play.

### 4.1 Faucet controls

For each faucet record:

- base payout;
- repetition family;
- marginal reward curve;
- dependency on skill/progression;
- anti-abuse validation;
- expected daily/weekly issuance distribution;
- correction/reversal transaction type.

### 4.2 Sink coverage target

Maintain sinks across all wealth bands:

- entry: 100–5,000 WLD identity/collection/customization;
- growing: 5,000–100,000 WLD space, crafting, profession and business expansion;
- established: 100,000–1,000,000 WLD galleries, headquarters modules, archives, club/city projects;
- high wealth: 1,000,000+ WLD prestige spaces, museums, landmark sponsorship, legacy projects;
- ultra-high wealth: uncapped voluntary project contributions and escalating prestige construction.

These bands are tuning ranges, not eligibility caps.

### 4.3 Adaptive economic response

Operators should respond to inflation in this order:

1. diagnose the faucet/sink source using ledger data;
2. add or improve desirable sinks;
3. adjust marginal payout curves for repetitive low-value actions;
4. adjust maintenance/market/service costs where economically coherent;
5. adjust authored reward budgets;
6. only use a hard operational limit if a documented safety/integrity invariant requires it.

Never silently confiscate balances to repair ordinary inflation.

## 5. Economy dashboard additions

Required metrics:

- gross WLD issuance;
- hard-sink destruction;
- net issuance;
- hard-sink / faucet ratio;
- transfer volume separately from destruction;
- mean, median, P90, P95, P99 liquid balances;
- top 1% and top 10% wealth share;
- sink share by category;
- top-3 sink concentration;
- active purchasing days by cohort;
- high-wealth balance growth;
- diminishing-return activation rate;
- protection-limit hit rate by reason code;
- false-positive/retry rate for safety protections.

A high `protection-limit hit rate` is an operations warning, not proof that users are playing too much.

## 6. Market / season fairness boundary

Main-economy wealth must not buy competitive season advantage. Seasonal market competitions should use isolated equal-condition accounts. TradingView's 2026 Paper Trading competitions provide each entrant a separate competition account with identical preset parameters; Moneyverse should preserve the same isolation principle while using its own fictional-market scoring model.

Season rankings should reward learning/risk-aware objectives and isolated challenge performance, not main WLD balance or purchased economic power.

## 7. Store/config separation

Persistent item identity should be separated from operational store price/availability configuration. PlayFab Economy V2 stores similarly allow store definitions to override catalog prices. Moneyverse should keep:

- immutable/stable SKU identity;
- versioned store/event/season price config;
- effective-from/effective-to timestamps;
- audit history;
- price shown before confirmation;
- idempotent purchase settlement.

This also makes economic adjustments possible without inventing user caps.

## 8. DB/API requirements

### 8.1 Policy table

Recommended table:

```text
product_limit_policies(
  policy_key text primary key,
  mode text not null,
  value_bigint bigint null,
  reason_code text null,
  scope text null,
  reset_policy text null,
  config_version bigint not null,
  effective_from timestamptz not null,
  created_by uuid null,
  created_at timestamptz not null
)
```

Checks:

- `mode='unlimited' => value_bigint IS NULL`;
- protection modes require `reason_code`;
- negative limit values prohibited.

### 8.2 API response

Where user-visible policy matters:

```json
{
  "mode": "unlimited",
  "value": null,
  "reasonCode": null
}
```

Protection rejections use RFC 9457-style problem responses and must identify the protection category without leaking anti-abuse internals.

## 9. Admin console

Provide a read-only-first **Limit & Protection Policy** panel showing:

- policy key;
- current mode/value;
- reason category;
- affected feature;
- hit rate;
- last config change;
- config version;
- whether user-visible;
- whether policy is an economic/progression rule or infrastructure/integrity protection.

Any future write UI requires privileged role checks, reason entry, before/after diff and immutable audit log.

## 10. Migration audit checklist

Before implementing any planning item, search the affected specs/code/config for:

- `max`;
- `cap`;
- `limit`;
- `daily` + numeric ceiling;
- `per account`;
- `per user`;
- `carryover`;
- `inventory stock`;
- `open orders`;
- `cooldown` used only to throttle normal play.

Each match must be classified, not mechanically removed. Security rate limits, idempotency, payload bounds and true market-integrity controls remain valid.

## 11. Analytics events

Minimum events:

- `limit_policy_evaluated`;
- `protection_guard_triggered`;
- `protection_guard_released`;
- `diminishing_reward_applied`;
- `scarce_inventory_purchase_attempted`;
- `scarce_inventory_sold_out`;
- `economy_sink_purchase_completed`;
- `season_content_budget_exhausted` (content state only, not account lock).

Never emit hidden anti-abuse details to the client.

## 12. Definition of Done

A feature implementing a numeric threshold is not complete until:

- the threshold has one approved classification;
- ordinary progression defaults to `null/unlimited`;
- protection values have explicit reason codes;
- protections are server-authoritative and observable;
- true scarcity is published before purchase;
- content budgets are not implemented as account-wide play locks;
- WLD issuance impact is modeled without relying on arbitrary caps;
- hard sink / transfer / converter accounting remains separate;
- English/Korean docs are equivalent;
- tests cover `null/unlimited`, boundary values, idempotent retries and protection-mode behavior.

## 13. Research references

- EVE Online, *Monthly Economic Report — August 2026*, published 2026-09-09. The report continues to expose economy-wide activity and downloadable raw data, reinforcing Moneyverse's policy of observing issuance, destruction and price/economic signals instead of hiding inflation behind player caps: https://www.eveonline.com/news/view/monthly-economic-report-august-2026
- TradingView, *The Leap by AMP Futures — September 2026* and competition rules. Competition activity uses a separate Paper Trading competition account with fixed preset parameters: https://www.tradingview.com/the-leap/amp-futures-september-2026/ and https://www.tradingview.com/the-leap/amp-futures-september-2026/rules/
- Microsoft PlayFab, *Economy V2 Stores*. Stores can override base catalog prices, supporting Moneyverse's separation between stable item identity and operational store pricing: https://learn.microsoft.com/en-us/xbox/playfab/economy-monetization/economy-v2/catalog/stores
