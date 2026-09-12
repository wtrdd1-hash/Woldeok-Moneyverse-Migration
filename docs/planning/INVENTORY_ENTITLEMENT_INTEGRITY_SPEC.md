# Woldeok Moneyverse — Inventory & Entitlement Integrity Specification

> Version: v2026.09.13.16
> Status: Living implementation-oriented product specification
> Date: 2026-09-13
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `PLAYER_MARKETPLACE_CRAFTING_SPEC.md`, `BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.md`, `SEASON_SYSTEM_SPEC.md`
> Korean counterpart: [INVENTORY_ENTITLEMENT_INTEGRITY_SPEC.ko.md](INVENTORY_ENTITLEMENT_INTEGRITY_SPEC.ko.md)

## 0. Purpose

Moneyverse already defines shop purchases, crafting, marketplace transfers, season rewards, collections and paid entitlements. This specification defines the shared ownership boundary that all of those systems must use so a user never receives a phantom item, loses an item without an auditable cause, duplicates an item through retries, or retains paid access after a valid revocation that should remove only that purchased right.

The authoritative model separates four concepts:

- **catalog definition** — what an item or entitlement means;
- **inventory ownership** — which account, club, escrow or system context currently controls an item instance or stack;
- **entitlement** — a durable or time-bounded right to access a feature/cosmetic/content capability;
- **provenance event** — the immutable reason ownership or entitlement changed.

Inventory records are not WLD balances. WLD value movement continues to use the existing double-entry ledger. Item transfer volume is not a currency sink. Only explicitly destroyed WLD or resources are classified as hard sinks.

## 1. Product invariants

1. The server/database is authoritative for item ownership, quantity, entitlement state, binding, transferability, expiry and revocation.
2. The client never grants ownership by rendering success, receiving a provider callback, or replaying a stale cached response.
3. Every state-changing inventory operation is idempotent.
4. Operations that exchange WLD/resources for items must commit all required value and ownership changes atomically or compensate explicitly.
5. Historical provenance is append-only. Correct mistakes with reversal/reconciliation events instead of rewriting the past.
6. Unique items are never silently cloned to repair missing state.
7. Stackable and unique items use different identity rules.
8. Escrow and temporary locks preserve beneficial ownership; they do not turn user assets into ordinary system inventory.
9. Refund, chargeback and provider revocation logic removes only the entitlement or item rights justified by the affected transaction and does not punish unrelated purchases.
10. Arbitrary user-facing inventory caps are not the default. Capacity or batch limits require a documented safety, integrity, infrastructure, legal or true-scarcity reason.

## 2. Item taxonomy

Every catalog item declares an ownership class.

| Class | Identity | Typical examples | Transfer |
|---|---|---|---|
| `UNIQUE_INSTANCE` | one immutable instance ID | signed collectible, trophy variant | policy-controlled |
| `STACKABLE_RESOURCE` | catalog ID + stack identity + quantity | crafting material, event token | policy-controlled |
| `ACCOUNT_BOUND_ITEM` | owned item, permanently bound | season rank trophy | no |
| `CLUB_BOUND_ITEM` | owned by club scope | club trophy/banner | club flow only |
| `SYSTEM_ENTITLEMENT` | access right, not ordinary inventory | dashboard theme access, ad-free | no item transfer |
| `TIME_BOUND_ENTITLEMENT` | right valid until timestamp/state | subscription benefit | no item transfer |
| `ESCROWED_ITEM` | user-owned item under transaction lock | active marketplace listing | settlement only |

Catalog definitions must not infer transferability from display category or rarity. Transfer policy is explicit server data.

## 3. Canonical data model

Recommended entities:

```text
catalog_items
catalog_item_versions
inventory_containers
inventory_stacks
inventory_instances
inventory_locks
inventory_events
inventory_operation_keys
entitlement_definitions
user_entitlements
entitlement_events
provider_purchase_links
inventory_reconciliation_runs
```

### 3.1 Catalog item version

Minimum fields:

```text
catalog_item_id
catalog_version
item_class
name_i18n_key
description_i18n_key
stackable
transfer_policy
binding_policy
expiry_policy
scarcity_policy
max_stack_size nullable
metadata_schema_version
p2w_classification
created_at
retired_at nullable
```

A catalog version already referenced by historical ownership/provenance is immutable. Create a new version for material rule changes.

### 3.2 Inventory instance

```text
item_instance_id
catalog_item_id
catalog_version
owner_type            # USER | CLUB | SYSTEM_ESCROW
owner_id
state                 # AVAILABLE | LOCKED | ESCROWED | CONSUMED | REVOKED | DESTROYED
bound_reason nullable
season_id nullable
created_by_event_id
tradable_after nullable
expires_at nullable
metadata_version
created_at
updated_at
```

### 3.3 Stack

```text
stack_id
catalog_item_id
catalog_version
owner_type
owner_id
quantity
state
expires_at nullable
metadata_version
version
created_at
updated_at
```

Quantity is an integer and must never become negative. For large quantities, transport must remain integer/string safe.

## 4. Container model

An account may have logical containers such as:

- `USER_MAIN` — normal available inventory;
- `USER_DISPLAY` — display-only placement without ownership change;
- `MARKET_ESCROW` — listed/reserved items;
- `CRAFT_LOCK` — inputs reserved during an atomic craft;
- `CLUB_INVENTORY` — club-owned objects;
- `SEASON_TEMP` — explicitly seasonal items where lifecycle requires it.

Moving between containers is not automatically a user-to-user transfer and must not create or destroy inventory. Container movement writes an inventory event and preserves the same instance/provenance where applicable.

## 5. Operation semantics

Canonical operation types:

- `GRANT`
- `PURCHASE`
- `TRANSFER`
- `MOVE_CONTAINER`
- `LOCK`
- `UNLOCK`
- `CRAFT_CONSUME`
- `CRAFT_OUTPUT`
- `SPLIT_STACK`
- `MERGE_STACK`
- `USE_CONSUMABLE`
- `EXPIRE`
- `REFUND_REVOKE`
- `CHARGEBACK_REVIEW`
- `ADMIN_COMPENSATION`
- `SYSTEM_RECONCILIATION`

Every event records actor, target owner, item/entitlement, quantity or instance ID, reason code, source transaction/order/reward where relevant, config/catalog version, idempotency key, timestamp and safe trace identifiers.

## 6. Idempotency and concurrency

Every state-changing request uses an operation key scoped to the logical action.

Examples:

```text
shop_purchase:{user_id}:{client_operation_uuid}
quest_reward:{quest_completion_id}:{reward_id}
season_claim:{season_id}:{user_id}:{reward_node_id}
craft:{user_id}:{recipe_id}:{client_operation_uuid}
market_transfer:{settlement_id}
billing_entitlement:{provider}:{provider_transaction_id}:{entitlement_code}
```

Rules:

- same key + same semantic payload returns the original result;
- same key + materially different payload returns conflict;
- writes use row/version locking or optimistic concurrency where appropriate;
- stack split/merge must validate current version and quantity;
- retry after timeout must not duplicate grants;
- background jobs and webhook handlers use the same idempotency contract as HTTP requests.

## 7. Atomic purchase and grant flows

### 7.1 WLD shop purchase

One logical transaction should:

1. authenticate user;
2. load active immutable catalog/price version;
3. validate ownership/uniqueness/scarcity rules;
4. validate authoritative WLD balance;
5. debit/burn/route WLD according to the economy contract;
6. grant the item or entitlement;
7. write inventory and ledger references;
8. write analytics/outbox state;
9. commit once.

The user must not be charged without the corresponding item grant. A duplicate retry returns the original purchase result.

### 7.2 Reward grant

Rewards use deterministic source IDs. Scheduler retries, client refreshes or duplicated provider/outbox delivery cannot grant twice.

### 7.3 Bundle grant

A bundle is atomic when product semantics promise all contents together. If one child item cannot be granted due to uniqueness or policy, either reject the entire bundle or use a predeclared substitution policy; do not silently drop content.

## 8. Stacks and quantities

Stackable resources may be split or merged for operational reasons without changing total owned quantity.

Required controls:

- total quantity before/after split or merge reconciles;
- stack identity may carry metadata such as acquisition source, expiry cohort or tradability timestamp;
- incompatible metadata cohorts must not merge automatically;
- zero-quantity stacks may be removed only after provenance is persisted;
- batch size limits are infrastructure protections, not gameplay caps;
- pagination/virtualization handles large inventories rather than imposing arbitrary lifetime ownership limits.

## 9. Locks, escrow and pending state

A user-facing item can be temporarily unavailable without ceasing to exist.

Lock reasons include:

- marketplace listing/reservation;
- crafting transaction in progress;
- moderation/integrity review;
- refund/chargeback review;
- season settlement transition;
- recovery/reconciliation hold.

The UI must show why an item is unavailable and whether the state is temporary. Locked items cannot be simultaneously consumed, sold, crafted or transferred through another path.

## 10. Entitlement state machine

Recommended entitlement states:

`PENDING -> ACTIVE -> EXPIRED`

Additional paths:

- `ACTIVE -> REVOKED`
- `ACTIVE -> SUSPENDED_REVIEW -> ACTIVE | REVOKED`
- `PENDING -> FAILED`

Rules:

- real-money entitlement is granted only after the payment provider reaches a valid purchased/paid state verified by the server;
- pending/deferred purchases do not unlock paid rights;
- restore/reconciliation can recreate a missing read model from authoritative provider history without double granting;
- refund/revocation changes the specific entitlement according to product policy;
- cancellation of future renewal does not necessarily revoke already-paid access before its paid-through date;
- provider webhook order may be delayed/out of order, so state transitions are monotonic according to provider event time/version rules.

## 11. Refunds, chargebacks and revocation

Moneyverse must not lock an entire account or confiscate unrelated items merely because one payment is disputed.

### 11.1 Durable cosmetic entitlement

If a valid refund requires revocation:

- mark the affected entitlement `REVOKED`;
- preserve purchase/refund history;
- stop future use of that entitlement;
- do not delete unrelated inventory or rewrite WLD history;
- show a clear account-history explanation.

### 11.2 Consumables already used

If a real-money consumable is ever introduced, the launch design must define consumption/refund behavior before sale. Do not create negative WLD or impossible inventory debt automatically to recover already-consumed content without explicit legal/product review.

### 11.3 Chargeback review

Chargebacks may trigger temporary review of the affected paid entitlement. Broad account sanctions require separate fraud evidence and appeal/recovery policy.

## 12. Crafting integration

Crafting consumes inputs and grants outputs in one authoritative transaction.

- required quantities are revalidated at commit time;
- locked/escrowed inputs are unavailable;
- deterministic recipes produce deterministic outputs;
- randomized recipes require disclosed probabilities and separate policy review where monetization is involved;
- failed craft commits neither input destruction nor output grant;
- successful craft writes provenance linking output to input event IDs and recipe/config version.

## 13. Marketplace integration

The existing marketplace specification remains authoritative for listing/settlement economics. This specification adds shared inventory constraints:

- only `AVAILABLE` and policy-tradable inventory can enter escrow;
- entering escrow uses the same item instance/stack lineage;
- settlement transfers ownership once;
- cancellation/expiry returns exact unsold instance/quantity;
- reconciliation detects orphan listings, missing escrow and duplicate ownership claims;
- transfer principal is not a hard sink; only actual system fees removed from circulation count as sinks.

## 14. Season and event integration

- unique season trophies use deterministic reward keys;
- missed reward delivery can be replayed idempotently;
- unclaimed reward policy is explicit at season close;
- permanent earned cosmetics do not silently disappear at season rollover;
- temporary season resources declare `expires_at` or conversion behavior before issuance;
- next-season content does not overwrite historical provenance.

## 15. Unlimited-default policy

Inventory design must not rely on arbitrary lifetime item counts, collection counts, crafting counts or purchase counts as an economy-control mechanism.

Allowed protection limits include:

- request/batch/payload limits;
- true finite server inventory;
- one-copy uniqueness semantics;
- database/index safety controls;
- abuse throttles and integrity holds;
- provider or legal constraints.

Large inventories are handled with pagination, indexed queries, archive/display views and virtualized UI. A numeric config should support `null = unlimited` where a product cap is not actually required.

## 16. UX and responsive behavior

### Desktop

- filterable inventory grid/list;
- persistent category/filter controls;
- detail drawer with ownership, provenance, binding and availability state;
- bulk selection only for operations proven safe.

### Mobile

- card/grid layout with bottom-sheet detail;
- primary action reachable without horizontal table dependency;
- long collections use pagination/infinite loading backed by crawl-independent authenticated APIs;
- destructive actions use confirmation and preserve context on failure.

### Required states

Every inventory/entitlement view defines:

- loading/skeleton;
- empty;
- partial/stale;
- offline;
- permission denied;
- item locked;
- integrity review;
- expired/revoked entitlement;
- retryable server failure;
- maintenance.

Do not use color alone for binding, lock, rarity, expiry or revocation state. Keyboard focus and screen-reader names are required for item actions and dialogs.

## 17. Admin and support tools

Operators need read-first tools for:

- ownership/provenance timeline;
- source order/reward/settlement lookup;
- duplicate grant detection;
- orphan escrow detection;
- expired/invalid entitlement reconciliation;
- provider purchase status comparison;
- per-catalog quantity distribution;
- suspicious transfer/claim clusters.

High-risk compensation requires reauthentication/second factor, reason capture, target preview and append-only audit. Admin tools must not expose a generic “set inventory quantity” control that bypasses provenance and ownership invariants.

## 18. Reconciliation and recovery

Scheduled reconciliation should detect, without automatically inventing value:

- negative or impossible stack quantities;
- duplicated unique instance IDs;
- one unique instance assigned to multiple owners;
- marketplace escrow without active listing or vice versa;
- entitlement active without valid source state where a source is required;
- provider purchase paid but entitlement missing;
- provider refund/revoke received but local entitlement still active;
- season reward source completed but grant missing;
- inventory event totals inconsistent with current materialized state.

Repair begins in report/proposal mode. Automated repair is allowed only for deterministic, idempotent cases with audit and rollback/compensation design.

## 19. Analytics and economy metrics

Inventory analytics include:

- item grants by source;
- item destruction/consumption by source;
- unique owner count per catalog item;
- stack quantity distribution;
- transfer volume;
- marketplace settlement count;
- crafting input/output volumes;
- entitlement active/revoked/expired counts;
- duplicate-operation rejection rate;
- reconciliation anomaly rate;
- recovery success rate;
- inventory API error/latency;
- support cases per 1,000 ownership-changing operations.

Do not count item transfer volume as WLD burn. Economy dashboards continue to classify WLD as faucet, hard sink, transfer, converter and hold according to the existing economy specifications.

## 20. Monetization and P2W boundary

Paid items may provide cosmetics, profile/personal-space presentation, ad-free access and other explicitly non-P2W rights already allowed by billing policy.

Paid entitlement must not provide:

- higher WLD earning rate;
- improved WDX execution or privileged hidden information;
- cheaper loans or higher credit ceilings;
- competitive ranking points;
- stronger random odds;
- bypass of abuse/security controls;
- tradable cash-like value without separate legal/product review.

## 21. Privacy, legal and consumer protection

Inventory should store the minimum ownership/provenance identifiers needed for service integrity. Purchase-provider IDs are kept in billing/provider linkage records rather than embedded broadly in user-visible item metadata.

Before introducing real-money consumable items, random paid outcomes, user-to-user real-money exchange, externally redeemable value or cash-equivalent inventory: `legal review required`.

Refund/revocation UX must not use dark patterns, hide dispute/support paths, or retaliate by removing unrelated purchased content.

## 22. SEO boundaries

Public catalog, collection-lore and seasonal-item guide pages may be indexable when they provide substantive standalone content.

The following remain authenticated and `noindex`:

- personal inventory;
- ownership/provenance tied to private account data;
- purchase and entitlement history;
- provider transaction state;
- marketplace seller private controls;
- admin/support/reconciliation tools.

Structured data must not imply that Moneyverse virtual items are financial assets, securities, redeemable currency or investment products.

## 23. Research basis — reviewed 2026-09-13

### Directly adopted

1. **Microsoft PlayFab Economy V2 — Items and Inventory Overview**, updated 2026-02-24: inventory collections/stacks, purchase/transfer operations, atomic batch operations, transaction history and idempotency patterns. Moneyverse adopts the operational patterns, not the platform dependency.
2. **Google Play Billing — Fight fraud and abuse**, current 2026 guidance: grant entitlement only after verified `PURCHASED` state; do not grant while pending; secure-server acknowledgement/consumption reduces replay/network abuse risk.
3. **Apple StoreKit / App Store Server notifications**, current documentation: refunds/revocations can remove entitlement and servers should reconcile purchase records instead of assuming access is permanent.

### Reference only

4. **Apple in-app purchase refund guidance**, current 2026 documentation: refund events can require updating balances or unlocked content, but exact Moneyverse refund handling remains product/legal policy.
5. **FTC Fortnite refund enforcement**, current refund program information reviewed 2026-09-13: do not retaliate against a disputed purchase by blocking unrelated purchased content; used as consumer-protection caution, not as a statement of universal legal requirements.

## 24. Runtime reality status

External verification of `https://easy-scraping.com` returned HTTP 530 during this planning pass.

Status: `runtime verification unavailable`.

This specification is therefore `planned / not verified in Production`. No claim is made that current inventory, billing or marketplace runtime already implements these contracts.

## 25. Definition of Done

An inventory/entitlement implementation is not complete until:

- English/Korean docs match;
- catalog and ownership classes are explicit;
- unique instances and stacks cannot duplicate through retry/concurrency;
- WLD purchase + grant flows are atomic/idempotent;
- marketplace/crafting/season/billing use the same ownership boundary;
- refund/revoke affects only justified rights;
- reconciliation detects duplicate/missing/orphan state;
- arbitrary user-facing inventory caps were not introduced;
- desktop/tablet/mobile and accessibility states pass QA;
- private ownership/payment data remains authenticated + noindex;
- exact runtime SHA is deployed to isolated Test;
- backend/API/database/inventory invariants and logs are validated before Production.

## 26. Next implementation priority

1. First-party authentication and Account Security Center P0 remain ahead of inventory expansion.
2. Define first-party `catalog_items` + authoritative inventory read model using existing shop/marketplace runtime reality.
3. Add deterministic operation-key registry for grants, season claims and crafting.
4. Add read-only inventory provenance/reconciliation tooling before broad admin mutation tools.
5. Connect billing entitlement reconciliation only after the payment provider/product scope is finalized.
6. When Production/Test becomes externally accessible, run the Runtime Product Reality Audit before claiming parity.