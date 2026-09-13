# Woldeok Moneyverse — Marketplace Runtime Delivery & Trust Specification

> Version: v2026.09.13.21
> Status: Living implementation-delivery companion
> Date: 2026-09-13
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `PLAYER_MARKETPLACE_CRAFTING_SPEC.md`, `INVENTORY_ENTITLEMENT_INTEGRITY_SPEC.md`, `ACCESSIBILITY_RESPONSIVE_INTERACTION_SPEC.md`
> Korean counterpart: [MARKETPLACE_RUNTIME_DELIVERY_SPEC.ko.md](MARKETPLACE_RUNTIME_DELIVERY_SPEC.ko.md)

## 0. Purpose

This companion specification reconciles the full Player Marketplace & Crafting design with the actual staged runtime path. The product specification remains the target contract; this document defines how Moneyverse gets there without exposing mutation controls before authoritative inventory, escrow, settlement, provenance and ledger contracts exist.

The governing rule is simple: **do not fake a marketplace in the client.** A read-only inventory/workbench can ship before trading. Listing, buying, transfer, escrow and crafting controls may appear only after their server/database invariants exist and pass isolated Test verification.

## 1. Runtime reality at this version

Current `main` at planning start: `6ad8304ac743366ae8b9bc445934160b0eaecdee`.

Open runtime candidate PR #225 (`feat/marketplace-workbench-v2026.09.13.20`, head `54ea358a30845117aca97412f854cebd83440971`) is **not merged and must not be described as Production behavior**.

The candidate intentionally provides only:

- authenticated, `noindex` `/marketplace` member workbench;
- read-only inventory data from existing authoritative `GET /api/v1/shop/holdings`;
- held quantity/category/serialized-instance context;
- a discoverable signed-in entry from `/shop`;
- no listing, purchase, transfer, escrow, settlement, price-write or crafting mutation.

This is the correct fail-closed delivery shape while the marketplace server/database contract is still absent.

External runtime verification of `easy-scraping.com` was unavailable during this planning pass (`HTTP 530`). Therefore no claim is made that the workbench or any marketplace runtime is currently deployed.

## 2. Delivery stages

### R0 — authoritative holdings workbench

Goal: let a user understand what they own and which items may eventually participate in marketplace/crafting flows.

Required:

- inventory is read from the existing authoritative source;
- serialized instances remain distinguishable;
- ownership is never synthesized from client state;
- all mutation CTA states are absent or explicitly disabled with truthful “not available yet” wording;
- private inventory pages remain authenticated + `noindex`;
- empty/loading/error/permission-denied/offline states are defined;
- mobile cards and desktop tables expose the same ownership facts.

R0 does **not** create a second inventory database or cache that can become ownership truth.

### R1 — listing quote + escrow activation

Goal: introduce selling without yet broadening into advanced exchange types.

Required server/database contracts before UI enablement:

1. tradability resolver from catalog + item instance + season/integrity state;
2. authoritative listing quote including listing fee, expiry/config version and seller net preview;
3. atomic move of exact instance/quantity into logical escrow;
4. deterministic/idempotent create-listing operation;
5. cancel/expiry return of the exact escrowed instance/quantity;
6. listing read model with cursor pagination and stable sort keys;
7. append-only provenance event for escrow enter/exit;
8. reconciliation query for orphan escrow or listing/ownership mismatch.

No ordinary active-listing hard cap is introduced. Infrastructure request/batch protections remain separate from gameplay policy.

### R2 — atomic purchase and settlement

Goal: enable buyer-to-seller exchange only after a single authoritative settlement boundary exists.

The purchase operation must atomically:

- authenticate/authorize buyer;
- re-check listing state and buyer != seller;
- lock/version the listing;
- verify escrow ownership and quantity;
- resolve the listing-locked fee policy/config version;
- debit buyer principal;
- classify buyer-to-seller principal as `TRANSFER`;
- remove only the documented system fee as `HARD_SINK`;
- credit seller net proceeds;
- transfer exact item ownership/provenance to buyer;
- mark listing settled;
- write ledger, settlement, provenance and audit references;
- emit post-commit analytics/outbox events;
- return an idempotent replay-safe result.

A frontend sequence of “debit, then call inventory API” is prohibited.

### R3 — deterministic crafting

Goal: enable crafting only when inventory consumption, WLD fee burn and output creation share one atomic operation.

P0 crafting remains deterministic-first. Recipe inputs, outputs, fees, availability and transfer policy are versioned server policy. `craft_count_limit` and recipe user caps default to `null/unlimited` unless a documented integrity, true-content or legal reason exists.

### R4 — richer marketplace services

Only after R1–R3 telemetry and reconciliation are stable:

- price history and reference bands;
- optional provenance appraisal;
- featured visual placement that does not change settlement priority;
- marketplace watchlists/notifications;
- seasonal/archive recipes;
- buy orders or commissions only after separate integrity review.

## 3. API transition contract

The current holdings endpoint may remain the R0 source while ownership is authoritative there. The marketplace must not fork ownership into a parallel client or service model merely to match a future URL shape.

Target APIs should be introduced incrementally and may differ from planning examples, but each mutation requires an explicit authoritative owner:

- `GET /api/v1/shop/holdings` — current holdings read source;
- marketplace listing/read APIs — derived/public market state, not inventory truth;
- marketplace mutation APIs — server/database functions that own escrow and settlement;
- crafting mutation API — server/database function that owns input consumption/output creation.

If a dedicated inventory read model is added later, it must reconcile against the authoritative ownership tables/functions before replacing the current holdings endpoint.

## 4. Inventory scale and no-hard-cap policy

Moneyverse does not solve inventory or marketplace scale by imposing arbitrary lifetime holding/listing/crafting limits.

Use:

- cursor pagination;
- indexed owner/catalog/state queries;
- bounded page and request batch sizes as infrastructure protection;
- virtualized rendering for large result sets;
- archive/filter views;
- server-side search/sort;
- asynchronous materialized aggregates for non-authoritative summaries.

Provider or framework limits are implementation constraints to engineer around, not product defaults. Microsoft PlayFab Economy V2, for example, documents finite batch/collection/query limits; these are useful reminders to paginate and batch safely, not a reason to impose the same values on Moneyverse users.

## 5. Price and market trust UX

The marketplace must distinguish three concepts visually and analytically:

1. **asking price** — current seller request;
2. **settled price** — historical completed transaction;
3. **reference range** — derived advisory statistic.

A reference range is never a guaranteed value, appraisal promise or enforced price control. Outlier warnings may inform users without blocking normal voluntary pricing unless a documented integrity rule triggers review.

Price-history UI must exclude or label transactions already classified as suspicious/wash/circular activity from clean reference metrics. Raw transfer volume remains available to integrity analytics but is not treated as healthy market demand.

## 6. User-authored metadata and moderation

Engraving text, custom labels, seller profile snippets and future item notes are user-generated content when visible to others.

Required controls before public display:

- length/character limits for safety and storage, not monetization;
- server-side normalization and output encoding;
- report/hide/block/moderation path where content is public;
- no secrets, contact/payment solicitation or off-platform payment links in marketplace fields;
- age/minor safety policy inheritance;
- abusive-content review independent from economic ownership;
- hiding offensive text must not silently delete the underlying item or unrelated property.

If ratings/reviews are later added, Moneyverse must not buy positive sentiment, fabricate reviews, suppress criticism based on sentiment, or present operator/affiliate reviews as independent. FTC consumer-review rules and current enforcement make this a legal/compliance gate for a public review feature.

## 7. Responsive and accessible interaction contract

### Desktop

- browse/listing tables may use dense rows with stable numeric alignment;
- filters remain persistent or in a clearly labeled side panel;
- seller net, buyer total and fee classification are visible before confirmation.

### Tablet

- reduce simultaneous columns;
- keep item identity, price, quantity/state and primary action visible;
- secondary provenance/fee details move into expandable disclosure rather than disappearing.

### Mobile

- convert dense marketplace rows to cards where needed;
- primary CTA may be bottom-sticky only when it does not cover content/focus;
- filter/sort uses accessible drawer/sheet with focus restoration;
- order/price confirmation is a full-width review step;
- no action requires hover, drag or color alone.

Mutation confirmation must expose item, quantity, gross WLD, fee, net/proceeds and action verb in text. Focus returns predictably after modal/drawer close. Loading/error announcements use appropriate live-region semantics without noisy repeated announcements.

## 8. Fraud, abuse and false-positive handling

High-signal cases include:

- self-purchase;
- linked-account circular trades;
- repeated round trips;
- abnormal price deviation plus rapid resale;
- duplicate settlement attempts;
- escrow bypass;
- inventory/provenance mismatch;
- relist/cancel automation floods;
- laundering recently suspicious faucet rewards through items.

The first response should be proportional: block an invalid transaction, hold a specific listing/proceeds set for review, or require integrity review. Do not confiscate unrelated permanent assets or globally disable normal play merely because one risk score is elevated.

Track false-positive rate and operator reversal rate as first-class integrity KPIs.

## 9. Economy accounting and sink portfolio

Marketplace economics continue the canonical classification:

- buyer principal to seller: `TRANSFER`;
- listing fee: `HARD_SINK`;
- sale fee removed by system: `HARD_SINK`;
- crafting/restoration/engraving service fee: `HARD_SINK`;
- item/material conversion: `CONVERTER`;
- escrowed item/WLD reservation: `HOLD`;
- reward-created WLD/materials: `FAUCET` when newly issued.

Do not report marketplace GMV as burn.

This vertical should continue to create low/mid/high/prestige voluntary sinks through customization, restoration, provenance display, archive reconstruction, furniture/business fabrication and prestige services. High-wealth users should have aspirational display/collection services rather than confiscatory wealth taxes.

## 10. Analytics and operational dashboard

Minimum marketplace delivery metrics:

- R0 inventory workbench visits;
- inventory empty/error rate;
- holdings read latency/error rate;
- active listings and unique sellers after R1;
- listing creation/cancel/expiry rate;
- escrow reconciliation error count;
- purchase conflict/idempotent replay count;
- GMV as `TRANSFER`;
- hard-sink fees separately;
- sell-through and median time to sale;
- clean vs suspicious volume;
- repeat-counterparty share;
- price outlier rate;
- integrity hold rate and false-positive rate;
- craft completion/rollback failure rate;
- sink adoption by wealth cohort;
- mobile completion/error rate;
- accessibility issue rate from QA/support.

No KPI should reward artificial transaction churn.

## 11. Admin and reconciliation

Before write-capable marketplace launch, operators need read-only reconciliation for:

- listing -> escrow owner/quantity;
- settled listing -> buyer ownership;
- settlement -> buyer/seller/fee ledger references;
- duplicate unique instance ownership;
- orphan escrow;
- listing stuck in reservation/settlement state;
- provenance gap;
- suspicious round-trip/circular flow;
- config version used by each quote/settlement.

Repair actions, when later added, must call audited server/database repair functions. A generic “set inventory quantity/owner” admin control is not acceptable.

Admin forms must not auto-refresh while an operator is typing. Refresh is user-controlled or applies non-destructive patches.

## 12. Revenue and monetization boundary

Allowed examples:

- non-P2W cosmetics/profile/space items;
- clearly labeled sponsored cosmetic collections;
- optional marketplace visual placement paid in WLD where it affects discovery only;
- ad-removal subscription unrelated to settlement priority;
- B2B/B2B2C sponsorship that does not buy ranking, WDX, economic power or moderation priority.

Disallowed without separate review:

- real-money purchase of marketplace settlement priority;
- paid increase to seller proceeds or lower marketplace integrity checks;
- real-money cash-out or externally redeemable inventory;
- paid random item outcomes;
- payment-linked WDX/loan/ranking advantage.

Marketplace monetization KPIs must include refund/support/abuse/moderation/infrastructure cost, not only gross billing.

## 13. Legal/privacy/compliance gates

Current Moneyverse marketplace remains virtual and non-redeemable. `legal review required` before any change that introduces:

- real-money user-to-user item settlement;
- cash-out or externally redeemable value;
- paid randomized outcomes;
- third-party merchant/seller status that could trigger marketplace-specific obligations;
- public ratings/reviews used commercially without review-rule controls;
- children/minor-targeted commerce or personalized advertising changes;
- collection of new identity/payment information.

Public marketplace text/provenance fields inherit community moderation, privacy and minor-safety policies.

## 14. SEO contract

Candidate indexable surfaces only after content quality and privacy review:

- public catalog/lore pages;
- public crafting guides/recipes that reveal no private inventory;
- public educational marketplace/fee/provenance guides;
- selected public collection/archive pages.

Always authenticated + `noindex`:

- `/marketplace` personal holdings workbench;
- private inventory;
- my listings/history;
- purchase/settlement state;
- seller proceeds;
- integrity cases;
- admin/reconciliation tools.

Do not create thin auto-generated listing pages solely for search traffic. Public canonical URLs must not expose private seller/account identifiers.

## 15. Release gates

### R0 workbench candidate

Before merge/promotion:

- exact-head CI passes;
- immutable exact-SHA Test image is built;
- isolated Test serves the exact SHA;
- authenticated `/marketplace` reads authoritative holdings correctly;
- empty/large/serialized inventory states are exercised;
- mobile/keyboard/noindex checks pass;
- no marketplace mutation endpoint or accidental client write exists;
- logs reveal no private inventory leakage.

### R1/R2/R3 mutations

Additionally require:

- forward-only migrations and migration parity;
- PostgreSQL authorization/least-privilege validation;
- concurrent buyer/list/cancel/craft tests;
- idempotency same-key/same-payload and same-key/different-payload tests;
- ledger + inventory + provenance reconciliation;
- rollback/failure-injection tests;
- integrity hold/release audit tests;
- backend/API/UI end-to-end Test verification;
- rollback/compensation readiness.

Production remains blocked until the exact tested revision passes these gates.

## 16. Research note — 2026-09-13

### Microsoft PlayFab Economy V2 — direct adoption: reliability pattern only

Source type: official developer documentation.

Current Economy V2 limit and transaction-history documentation reinforces explicit batching, pagination/continuation tokens and bounded provider operations. Moneyverse adopts the engineering lesson—safe batching, pagination and historical traceability—but **does not copy PlayFab collection-size limits into user-facing gameplay caps**.

Reference:
- https://learn.microsoft.com/en-us/xbox/playfab/economy-monetization/economy-v2/limits
- https://learn.microsoft.com/en-us/xbox/playfab/economy-monetization/economy-v2/inventory/transaction-history

### PlayFab trading documentation — reference only

Source type: official developer documentation.

The documented trade pattern treats owned inventory instances as the prerequisite for trade and prevents a single item instance from participating in multiple open trades. Moneyverse uses this as supporting evidence for escrow/exclusive-lock semantics, while keeping its own PostgreSQL ledger and ownership model authoritative.

Reference:
- https://learn.microsoft.com/en-us/gaming/playfab/economy-monetization/economy/trading/

### FTC Consumer Reviews and Testimonials Rule — conditional adoption if reviews launch

Source type: U.S. government guidance/enforcement.

The rule has been effective since 2024 and current 2025–2026 guidance/enforcement continues to target fake/false reviews, sentiment-conditioned incentives, undisclosed material connections and deceptive suppression. Moneyverse does not currently need a marketplace review feature; if one is introduced, these controls become a launch gate.

Reference:
- https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers
- https://www.ftc.gov/business-guidance/blog/2025/12/warning-letter-or-ten-businesses-comply-ftcs-consumer-review-rule

### Apple App Review Guidelines — reference for future mobile UGC distribution

Source type: official platform policy.

Apple's 2026 guideline updates continue to emphasize User-Generated Content safety requirements. This is reference-only for a future iOS distribution path; it does not establish that the current web service is an App Store app.

Reference:
- https://developer.apple.com/app-store/review/guidelines/
- https://developer.apple.com/news/?id=d75yllv4

## 17. Definition of Done for this planning contract

The planning contract is satisfied when:

- runtime stages are explicit and mutation controls cannot outrun backend/database authority;
- PR #225 is recorded as an unmerged candidate, not current Production truth;
- `/api/v1/shop/holdings` is documented as an acceptable R0 bridge without making it permanent ownership duplication;
- no arbitrary listing/crafting/inventory hard cap is introduced;
- transfer vs hard sink accounting remains explicit;
- user-authored marketplace metadata inherits moderation/minor-safety rules;
- desktop/tablet/mobile/accessibility states are specified;
- revenue/legal/SEO boundaries are explicit;
- runtime verification status is recorded truthfully;
- actual mutation implementation remains a separate development branch -> isolated Test -> backend/DB/API/integrity validation -> Production flow.
