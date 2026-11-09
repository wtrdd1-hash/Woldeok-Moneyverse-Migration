# Treasury & Social Insurance Planning — Existing Baseline (Frozen Reference)
> **Scope version:** vTSI.2026.11.10.001 · **Snapshot:** 2026-11-10 KST · **Repository main commit:** `edd709bcbe96f6f5ceca8372f244b632e8211242`
> **Record type:** HISTORICAL REFERENCE / DOCUMENTATION ONLY — not a feature release or runtime QA
> **Language:** English canonical · [한국어](TREASURY_SOCIAL_INSURANCE_20261110_BASELINE.ko.md)
> **Change history and index:** [New & Changed Planning Register](TREASURY_SOCIAL_INSURANCE_20261110_CHANGE_REGISTER.md)

## Purpose and authority
Preserve a reproducible reference to **what was already planned** before the hourly Treasury, healthcare insurance, pension and linked social-fund initiative (deadline 2026-11-11 06:00 KST). Do not silently rewrite this baseline when newer cycles change the living plan. The current `PROJECT_PLAN.md` always outranks this historical snapshot and can change concurrently.

## Existing document inventory pinned to initial main
The following document contents are accessible at the linked commit. Blob SHA identifies the exact file version, not implementation or live deployment status.

| # | Existing document at immutable commit | File blob SHA | Existing planning area |
|---|---|---|---|
| 1 | [`docs/planning/PROJECT_PLAN.md`](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/planning/PROJECT_PLAN.md) | `4082d4a0c3a8395a8f42e4dba3b9771673143b3b` | Canonical living plan / top-level authority |
| 2 | [`docs/planning/PROJECT_PLAN.ko.md`](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/planning/PROJECT_PLAN.ko.md) | `14b37681245bf24c2551746b231c8309031b0a97` | Korean counterpart |
| 3 | [`docs/planning/INTEGRATED_PLANNING_MASTER.md`](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/planning/INTEGRATED_PLANNING_MASTER.md) | `761b5f2d3cbbac79fe4df89e4e53203d1cfee04e` | Integrated design master, subordinate to PROJECT_PLAN |
| 4 | [`docs/planning/INTEGRATED_PLANNING_MASTER.ko.md`](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/planning/INTEGRATED_PLANNING_MASTER.ko.md) | `574b9f0727dd57e636de459610cf59c25c0660cf` | Korean integrated design counterpart |
| 5 | [`docs/planning/CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md`](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/planning/CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md) | `885d335322d399ad1dd12fa6245841708ae307f9` | Separation of central-bank, mint, treasury and economy-ledger authorities |
| 6 | [`docs/planning/ADMIN_TREASURY_MANAGEMENT_SPEC.md`](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/planning/ADMIN_TREASURY_MANAGEMENT_SPEC.md) | `9139d4fe9520a44190ab706ddc5beec1e773c489` | Treasury fiscal operations, tax, budgets and reserve policy |
| 7 | [`docs/planning/ECONOMY_INTEGRITY_AND_DOCUMENTATION_RECONCILIATION_SPEC.md`](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/planning/ECONOMY_INTEGRITY_AND_DOCUMENTATION_RECONCILIATION_SPEC.md) | `36e90c450d5dfc82dac3481d8d5d0625335a93dd` | Ledger integrity, provenance, reconciliation, and release evidence |
| 8 | [`docs/planning/TREASURY_AUTOMATED_SOCIAL_RECIRCULATION_SPEC.en.md`](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/planning/TREASURY_AUTOMATED_SOCIAL_RECIRCULATION_SPEC.en.md) | `930937ce098574b08b251884c2a612f310398ae4` | Historical social recirculation proposal; version/production claims need current verification |
| 9 | [`docs/NATIONAL_PENSION_SERVICE_SPEC.md`](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/NATIONAL_PENSION_SERVICE_SPEC.md) | `78eebaf87c032ed42139dac438a9bc7305e23e1d` | Pension / social security proposal; funded-liability caveat |

## Existing commitments identified in the sampled sources
- **Treasury is fiscal, not a mint:** the v523 specification separates Central Bank monetary authorization, Mint execution, Treasury fiscal accounting and Economy Core settlement/ledger. Taxes and transfers move existing virtual WLD; issuance/retirement requires separately authorized canonical postings.
- **Fiscal treasury:** administrator treasury planning covers tax/fee inflows, budget commitments, reserve policy, expenditure, reconciliation and audit rather than rebranding a member wallet as a treasury.
- **Data integrity:** finance-related plans require server-authoritative double-entry, controlled DB functions/privileges and explicit provenance; historical documents' claims of Production verification are not proof of the present deployment.
- **Pension:** the existing NPS document proposes retirement/social-security mechanics but explicitly qualifies unfunded lifetime/principal guarantees as conditional; do not treat draft returns as proven or legally guaranteed.
- **Healthcare insurance:** a specific authoritative health-insurance design and its runtime implementation have **not yet been fully catalogued or verified in this snapshot**. Absence at a guessed path is not proof of nonexistence. The next planning cycles must discover and reconcile related documents and code before calling anything NEW.

## Read and verification method
Sources: repository GitHub `main` at the pinned commit; the document names, initial headings and salient rules were read. This file is an **index/snapshot of provenance**, not a substitute for the full authoritative texts. No Production browser flow, DB reconciliation, financial migration, or Test exact-SHA gate was executed as part of creating this historical record. The app repository and the miniPC are separate deployment evidence sources; cite them per-cycle if actually checked.

## Immutability / follow-up
Do not edit this baseline to reflect proposals after this starting point. If a discovered pre-existing source was omitted, record it as a sourced **baseline correction** with new evidence in the change register, without pretending it was newly designed. Record A/B cycle differences, feature-level IDs, source link, old versus new behavior, and integration status in the linked register.