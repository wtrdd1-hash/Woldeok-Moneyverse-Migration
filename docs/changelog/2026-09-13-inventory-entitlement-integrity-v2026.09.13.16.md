# Inventory & Entitlement Integrity v2026.09.13.16

## Why this changed

Moneyverse had strong individual specifications for shop purchases, crafting, player marketplace settlement, seasons and paid billing entitlements, but no single authoritative contract for item ownership, unique instances, stacks, entitlement lifecycle, provenance, locks, refunds/revocations and reconciliation across those systems.

That gap creates a material implementation risk: a retry could duplicate a reward, a paid callback could grant access while still pending, marketplace/crafting could disagree about ownership, or a refund could remove too much or too little access.

## Changes

- Added `INVENTORY_ENTITLEMENT_INTEGRITY_SPEC.md` as the English canonical implementation specification.
- Added synchronized Korean counterpart.
- Defined catalog, inventory ownership, entitlement and provenance as separate concepts.
- Defined unique-instance, stackable-resource, account-bound, club-bound, system-entitlement, time-bound-entitlement and escrow classes.
- Added candidate DB/read-model entities for catalog versions, containers, stacks, instances, locks, events, entitlement state and reconciliation.
- Added deterministic idempotency keys for shop purchase, quest reward, season claim, craft, marketplace settlement and billing entitlement changes.
- Required atomic WLD purchase + item grant behavior and deterministic reward replay.
- Defined stack split/merge, metadata cohort and quantity-conservation rules.
- Defined lock/escrow semantics across marketplace, crafting, integrity review, season settlement and refund review.
- Added `PENDING -> ACTIVE -> EXPIRED` entitlement lifecycle with revoke/review paths.
- Required real-money rights to be granted only after server-verified paid/purchased state, not pending/deferred state.
- Defined refund/revoke behavior that affects only justified entitlements instead of unrelated inventory/account access.
- Added inventory reconciliation for duplicate unique IDs, multi-owner claims, orphan escrow, missing grants and provider/local entitlement drift.
- Added responsive/accessibility, admin/support, analytics, monetization, privacy/legal and SEO boundaries.

## Default-limit policy impact

No arbitrary gameplay or lifetime inventory hard cap was introduced. Large inventories must be handled with pagination, indexing, archival/display views and virtualization. Limits remain allowed only for true scarcity, uniqueness, request/batch safety, infrastructure integrity, abuse prevention, provider constraints or actual legal requirements.

## Economy impact

- Item transfers are not WLD burn.
- Marketplace principal remains `TRANSFER`.
- Only actual WLD/resource removal counts as `HARD_SINK`.
- Inventory material consumption may be tracked separately from WLD supply.
- Inventory reconciliation must not mint replacement value silently.

## Research reviewed on 2026-09-13

### Directly adopted

- Microsoft PlayFab Economy V2 `Items and Inventory Overview`, updated 2026-02-24 — official platform reference; adopted for collection/stack, atomic batch, transaction-history and idempotency patterns without creating a platform dependency.
- Google Play Billing `Fight fraud and abuse`, current 2026 guidance — official developer reference; adopted for server verification, no entitlement while purchase is pending, and acknowledgement/consumption after valid purchase.
- Apple StoreKit / App Store Server notification documentation, current 2026 guidance — official developer reference; adopted for refund/revocation-driven entitlement reconciliation.

### Reference only

- Apple in-app purchase refund guidance — used for refund/consumption operational patterns; exact Moneyverse product handling remains subject to product/legal policy.
- FTC Fortnite refund program/enforcement material, reviewed 2026-09-13 — used as a consumer-protection caution against retaliating over a disputed transaction by removing unrelated purchased content.

## Runtime verification

`https://easy-scraping.com` returned HTTP 530 during this pass. Status: `runtime verification unavailable`.

No claim is made that Production inventory, marketplace or paid entitlement flows already satisfy this specification.

## Legal / revenue / SEO impact

- Legal: risk-reducing; real-money consumables, paid random outcomes, externally redeemable value and user-to-user real-money exchange remain `legal review required`.
- Revenue: positive infrastructure effect because paid cosmetic/ad-free rights can be restored, revoked and reconciled accurately without selling economic advantage.
- SEO: public catalog/lore/season-item pages may be indexable; personal inventory, purchase/entitlement history, provider state and operator tools remain authenticated + noindex.

## Delivery

- Version: `v2026.09.13.16`
- Branch: `docs/inventory-entitlement-integrity-v2026.09.13.16`
- PR: created after documentation completion
- Change type: documentation-only
- Test deployment: not required for this documentation change
- Runtime implementation: separate development branch -> isolated Test -> backend/DB/API/inventory validation -> Production

## Next priority

1. First-party authentication / Account Security Center P0.
2. Reconcile current shop/inventory runtime against an authoritative catalog + inventory read model.
3. Deterministic operation-key registry for rewards, season claims and crafting.
4. Read-only provenance/reconciliation operator tooling.
5. Billing entitlement reconciliation after payment-provider scope is finalized.
6. Runtime Product Reality Audit as soon as Production/Test is externally verifiable.