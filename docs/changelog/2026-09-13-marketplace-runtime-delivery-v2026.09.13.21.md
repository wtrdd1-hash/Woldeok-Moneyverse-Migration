# Marketplace Runtime Delivery & Trust — v2026.09.13.21

Date: 2026-09-13
Change type: documentation-only
Branch: `docs/marketplace-runtime-delivery-v2026.09.13.21`
PR: #226
Test deployment: not required for this documentation-only change

## Why this changed

The canonical Player Marketplace & Crafting spec already defines the full fixed-price marketplace, escrow, atomic settlement and deterministic crafting target. A newer concurrent runtime candidate, PR #225, now introduces the first safe user-facing slice as an authenticated read-only `/marketplace` workbench backed by `GET /api/v1/shop/holdings`.

The gap was delivery sequencing: the Living Spec needed to state clearly that the workbench is an unmerged candidate, that no mutation capability exists yet, and exactly which backend/database invariants must exist before listing, purchase, escrow or crafting controls become interactive.

## What changed

Added English-canonical `MARKETPLACE_RUNTIME_DELIVERY_SPEC.md` and Korean parity document.

The specification adds:

- R0 authoritative holdings workbench;
- R1 listing quote + escrow activation gate;
- R2 atomic buyer/seller/fee/item settlement gate;
- R3 deterministic crafting gate;
- R4 richer discovery/market services only after telemetry/reconciliation stability;
- explicit use of existing `/api/v1/shop/holdings` as an R0 bridge rather than duplicate ownership truth;
- no-arbitrary-hard-cap scale strategy using pagination/indexing/virtualization;
- asking-price vs settled-price vs reference-range UX;
- UGC moderation requirements for engraving/custom labels/future reviews;
- desktop/tablet/mobile/accessibility behavior;
- proportional fraud/integrity holds plus false-positive KPI;
- transfer/hard-sink/hold/converter/faucet accounting;
- marketplace/admin reconciliation requirements;
- monetization/legal/SEO boundaries;
- exact-SHA Test gates for R0 and later mutations.

## Policy impact

### Default limits

No normal inventory, listing, buying or crafting hard cap was introduced. Provider/framework operation limits are treated as engineering/batch constraints, not player progression caps.

### Economy

Marketplace principal remains `TRANSFER`; only system-removed fees are `HARD_SINK`. GMV is not burn. The design continues voluntary low/mid/high/prestige sinks through customization, restoration, archive reconstruction, provenance and display services.

### Revenue

Non-P2W cosmetics/sponsorships and discovery-only WLD placement remain possible. Real-money settlement priority, paid integrity bypasses, cash-out, paid random outcomes and payment-linked financial/gameplay advantage remain out of scope without review.

### Legal/privacy

`legal review required` remains the gate for real-money user-to-user settlement, cash-out/redeemable inventory, paid random outcomes, marketplace merchant obligations, children/minor commerce changes or public commercial ratings/reviews without review-rule controls.

### SEO

Private holdings, listings/history, settlement/proceeds, integrity and admin/reconciliation screens remain authenticated + `noindex`. Only high-quality public catalog/lore/crafting/provenance education pages are index candidates.

## Runtime verification

`https://easy-scraping.com` returned HTTP 530 during this pass. Runtime verification is therefore unavailable. PR #225 is open/unmerged and is not represented as Production behavior.

## Research note

Reviewed on 2026-09-13:

- Microsoft PlayFab Economy V2 limits — official developer documentation; adopted only for batching/pagination engineering patterns, not gameplay caps.
- Microsoft PlayFab transaction history — official developer documentation; adopted as traceability/pagination reference.
- PlayFab trading documentation — official developer documentation; reference for exclusive item-in-trade semantics only.
- FTC Consumer Reviews and Testimonials Rule Q&A plus recent 2025 enforcement guidance — government source; conditional launch gate if marketplace ratings/reviews are introduced.
- Apple App Review Guidelines and 2026 update — official platform policy; reference for possible future mobile UGC distribution.

## Next priorities

1. Let PR #225 complete CI and exact-SHA isolated Test validation before any merge/promotion.
2. Implement an authoritative marketplace listing/tradability/escrow contract on a separate runtime branch.
3. Add read-only reconciliation for listing ↔ escrow ↔ ownership ↔ ledger/provenance.
4. Implement atomic purchase settlement with concurrency/idempotency tests.
5. Add deterministic crafting only after inventory consumption/output creation shares one transaction boundary.
6. On service recovery, perform the Runtime Product Reality Audit against actual marketplace/shop/inventory UI and APIs.
