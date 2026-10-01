# Single Treasury Authority Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the approved v2026.10.01.495 single-treasury/social-tax-recirculation design into the authoritative Moneyverse planning hierarchy without claiming runtime implementation.

**Architecture:** Keep one canonical fiscal decision across the authority chain: `PROJECT_PLAN` declares the superseding product rule, `INTEGRATED_PLANNING_MASTER` records the planning cycle and drift, and `ADMIN_TREASURY_MANAGEMENT_SPEC` contains the implementation-facing fiscal contract. Rewrite the two maintained treasury detail specs to the same one-account/100%-tax-conservation model, preserve historical migrations and old planning statements as history, and finish with bilingual navigation/update/worklog evidence.

**Tech Stack:** Markdown documentation, Git, repository documentation-governance rules, Python/shell consistency checks.

**Spec:** `docs/superpowers/specs/2026-10-01-single-treasury-social-recirculation-design.md`

## Global Constraints

- Work from the latest `origin/main`; record start, mid-work and final exact SHA.
- English is canonical; Korean is the required second language for maintained planning/governance documents.
- Do not edit applied numbered SQL migrations in this documentation-integration phase.
- Do not claim runtime, database, Test or Production completion.
- Exactly one spendable treasury WLD account is authoritative: `TREASURY_MAIN` with `VAULT_MAIN` allowed only as a compatibility alias.
- Every `TAX_*` amount reaches the central treasury 100% net of explicit reversals; tax may not target sink/burn.
- Welfare, infrastructure, reserve, dividends and stabilization are logical budget envelopes, not separate spendable cash vaults.
- Public spending transfers existing treasury WLD through Economy Core; budget allocation never mints WLD.
- Historical conflicting statements remain searchable and are superseded explicitly rather than silently rewritten as if they never existed.

## Review Focus

1. **Historical-vs-current ambiguity:** old “50% tax burn” text must remain clearly historical while v495 is unmistakably the current authority.
2. **Bilingual drift:** every maintained EN change must have a semantically equivalent KO change in the same task.
3. **Tax/sink naming collision:** no active v495 rule may call a destroyed amount a tax; sink behavior must be an explicit non-tax fee/sink.
4. **Treasury account ambiguity:** detail specs must not leave `VAULT_WELFARE`, `VAULT_INFRA`, or `VAULT_EMERGENCY` as independently spendable current-policy accounts.
5. **Evidence overclaim:** documentation must state authority drift/current runtime conflict accurately and must not claim DB migration, Test or Production acceptance.

---

### Task 1: Promote v495 into the Living Project Plan

**Files:**
- Modify: `docs/planning/PROJECT_PLAN.md:1-160`
- Modify: `docs/planning/PROJECT_PLAN.ko.md:1-170`
- Modify: `docs/planning/deltas/v2026.10.01.495.md`
- Modify: `docs/planning/deltas/v2026.10.01.495.ko.md`

**Interfaces:**
- Consumes: approved v495 design invariants.
- Produces: top-level superseding product authority for Tasks 2–5.

- [ ] **Step 1: Refresh main and record the exact authority base**

Run: `git fetch origin main && git rev-parse origin/main && git merge-base HEAD origin/main`

Expected: exact SHAs are recorded in the v495 worklog; if `origin/main` moved, rebase/recreate the documentation branch before editing overlapping authority files.

- [ ] **Step 2: Add the v495 superseding section to both Living Project Plans**

Add a top-level section immediately below current higher-priority gates that states: one central treasury account, 100% `TAX_*` conservation, explicit non-tax sinks only, logical budget envelopes, protected reserve, social recirculation/TRR, ledger-only payouts, and no runtime-completion claim.

Update `Current integrated version` to `v2026.10.01.495` only because the actual decision is being integrated, not for numeric synchronization alone.

- [ ] **Step 3: Make the v406 conflict explicitly historical**

Keep the v406 entry but append an explicit note that its marketplace tax-burn split is superseded by v495; do not delete the historical record.

- [ ] **Step 4: Strengthen the v495 planning delta**

Ensure F495 explicitly covers property-tax/sink reclassification, legacy physical-vault deprecation, TRR `N/A` behavior for zero tax inflow, and prior-surplus-funded outflow accounting.

- [ ] **Step 5: Verify top-level authority**

Run a Python/grep check that asserts both EN/KO plans contain `v2026.10.01.495`, `100%` tax-to-treasury language, one-account language, and an explicit v406 supersession note.

Expected: all assertions pass and `git diff --check` exits 0.

- [ ] **Step 6: Commit**

`git add docs/planning/PROJECT_PLAN* docs/planning/deltas/v2026.10.01.495* && git commit -m "docs(planning): adopt single treasury authority v495"`

---

### Task 2: Rewrite the administrator treasury contract to the approved model

**Files:**
- Modify: `docs/planning/ADMIN_TREASURY_MANAGEMENT_SPEC.md`
- Modify: `docs/planning/ADMIN_TREASURY_MANAGEMENT_SPEC.ko.md`

**Interfaces:**
- Consumes: Task 1 top-level v495 authority.
- Produces: implementation-facing treasury/tax/budget/reconciliation contract used by detailed specs and future runtime work.

- [ ] **Step 1: Update metadata and purpose**

Set version/baseline to v2026.10.01.495 / 2026-10-01 and state that this revision supersedes conflicting multi-vault/tax-burn planning while remaining documentation-only.

- [ ] **Step 2: Replace treasury-account semantics**

Specify one spendable `TREASURY_MAIN`; convert protected reserve and all purpose funds into logical reservations/envelopes; define `available = ledger_balance - protected_reserve - committed - pending_obligations`.

- [ ] **Step 3: Replace tax destination semantics**

For every tax row, set treasury destination/share to 100% unless the event is genuinely non-taxable. Remove active-policy tax-to-burn semantics. Define explicit `FEE_*_SINK` / `BURN_*` as separate non-tax categories.

- [ ] **Step 4: Add social circulation policy**

Add TRR definition, 50–80% planning band, 60% initial simulation target, zero-denominator `N/A`, prior-surplus outflow classification, stale-uncommitted-tax alerting, and reserve/reconciliation pause conditions.

- [ ] **Step 5: Expand spending channels and anti-abuse rules**

Include essential refunds, welfare/new-user stabilization, treasury-funded public jobs, community infrastructure, citizen participation dividend, market item buyback, season/event budgets, per-user/business rolling caps, related-account/bot/self-dealing blocks, and step-up audited manual disbursement.

- [ ] **Step 6: Align ledger/data/API/QA sections**

Require Economy Core double-entry for every fiscal movement; make any `system_treasury_vaults` balance a derived compatibility projection; add tax receipt provenance, budget commitments, disbursement batches, TRR/aged-tax dashboard fields, and real-DB reconciliation/concurrency/replay tests.

- [ ] **Step 7: Verify EN/KO contract parity**

Run a script that compares heading counts/order and checks both documents for the same required identifiers: `TREASURY_MAIN`, `TAX_*`, `TRR_30D`, `protected_reserve`, `treasury_budget_commitments`.

Expected: matching heading topology, all identifiers present, no active statement that tax is burned, and `git diff --check` passes.

- [ ] **Step 8: Commit**

`git add docs/planning/ADMIN_TREASURY_MANAGEMENT_SPEC* && git commit -m "docs(treasury): align fiscal contract with v495"`

---

### Task 3: Reconcile the detailed redistribution and fiscal-reform specifications

**Files:**
- Create: `docs/planning/TREASURY_EXPENDITURE_AND_REDISTRIBUTION_SPEC.md`
- Modify: `docs/planning/TREASURY_EXPENDITURE_AND_REDISTRIBUTION_SPEC.ko.md`
- Create: `docs/planning/TREASURY_FISCAL_REFORMS_AND_BUYBACK_SPEC.md`
- Modify: `docs/planning/TREASURY_FISCAL_REFORMS_AND_BUYBACK_SPEC.ko.md`

**Interfaces:**
- Consumes: Task 2 fiscal contract.
- Produces: bilingual detailed redistribution/buyback policy with no independent authority conflicts.

- [ ] **Step 1: Establish English canonical counterparts**

Create the missing English maintained specs and add reciprocal EN/KO links. Mark their status as v495 planning authority/detail, not Production evidence.

- [ ] **Step 2: Rewrite redistribution around one treasury**

Retain citizen dividend/community funding/welfare/market-stimulus concepts, but fund them through logical budget commitments from `TREASURY_MAIN`. Remove direct `cash_balance` mutation and direct vault-balance subtraction from the specification.

- [ ] **Step 3: Rewrite reserve semantics**

Replace separate `VAULT_EMERGENCY` spendable-cash semantics with a protected-reserve logical commitment inside the single treasury. Preserve emergency purpose and priority without preserving a second spendable account.

- [ ] **Step 4: Rewrite fiscal-reform allocation rules**

Replace “40% welfare vault / 30% infra vault / 20% emergency vault / 10% burn” with policy-versioned logical allocation weights whose total is at most 100% of available treasury funds. No general-tax allocation may burn currency.

- [ ] **Step 5: Preserve item buyback without burning tax WLD**

Specify that treasury pays WLD to real sellers and destroys only purchased items. If a currency hard sink remains elsewhere, classify it as a separate non-tax policy.

- [ ] **Step 6: Remove obsolete gambling-tax direction**

Remove/mark superseded any casino high-bet tax or gambling-linked fiscal rule that conflicts with the current casino-decommissioned/non-gambling authority; do not revive casino behavior through treasury planning.

- [ ] **Step 7: Verify current-policy semantics**

Run targeted assertions that active v495 sections contain no independently spendable `VAULT_WELFARE`/`VAULT_INFRA`/`VAULT_EMERGENCY`, no general-tax burn percentage, and no direct `cash_balance` update instruction.

Expected: assertions pass for both language pairs and `git diff --check` exits 0.

- [ ] **Step 8: Commit**

`git add docs/planning/TREASURY_*SPEC* && git commit -m "docs(treasury): reconcile redistribution and fiscal reform"`

---

### Task 4: Record the v495 authority cycle and navigation

**Files:**
- Modify: `docs/planning/INTEGRATED_PLANNING_MASTER.md`
- Modify: `docs/planning/INTEGRATED_PLANNING_MASTER.ko.md`
- Modify: `docs/README.md`
- Modify: `docs/README.ko.md`
- Modify: `docs/INDEX.md`
- Modify: `docs/INDEX.ko.md`
- Modify only if inventory/authority statements require it: `docs/DOCUMENT_CATALOG.md`, `docs/DOCUMENT_CATALOG.ko.md`

**Interfaces:**
- Consumes: Tasks 1–3 integrated authority.
- Produces: discoverable v495 cycle record and current navigation.

- [ ] **Step 1: Recheck latest main before authority-ledger edits**

Run: `git fetch origin main && git rev-parse origin/main`.

If main changed in any of these files, reconcile the latest version first and record the new mid-work SHA.

- [ ] **Step 2: Add v495 cycle to the Integrated Planning Master**

Record start/mid SHA, approved user decision, F495-01..06, reviewed treasury specs, old runtime/migration conflict, EN/KO parity, and explicit “documentation authority only; runtime remains drifted until implemented/tested/deployed” status.

- [ ] **Step 3: Refresh documentation landing/index links**

Add the single-treasury/social-recirculation contract under virtual finance/economy governance, linking to the administrator treasury spec and detailed redistribution/fiscal-reform specs.

- [ ] **Step 4: Update documentation authority status**

Where README currently describes older authority/runtime drift, state that v495 is the latest integrated product-planning authority while runtime treasury implementation may still reflect pre-v495 multi-vault/tax-burn behavior.

- [ ] **Step 5: Verify navigation and bilingual links**

Run a link/path existence script for every new/changed treasury doc and verify EN/KO reciprocal links.

Expected: all referenced files exist and `git diff --check` passes.

- [ ] **Step 6: Commit**

`git add docs/planning/INTEGRATED_PLANNING_MASTER* docs/README* docs/INDEX* docs/DOCUMENT_CATALOG* && git commit -m "docs(authority): record treasury circulation v495"`

---

### Task 5: Final records, whole-doc consistency audit, and branch handoff

**Files:**
- Modify: `docs/worklog/2026-10-01-treasury-circulation-design-v2026.10.01.495.md`
- Modify: `docs/worklog/2026-10-01-treasury-circulation-design-v2026.10.01.495.ko.md`
- Modify: `docs/updates/v2026.10.01.495-internal.md`, `.ko.md`
- Modify: `docs/updates/v2026.10.01.495-github.md`, `.ko.md`
- Modify: `docs/changelog/2026-10-01-treasury-circulation-design-v2026.10.01.495.md`, `.ko.md`

**Interfaces:**
- Consumes: all authority changes from Tasks 1–4.
- Produces: reviewable evidence package ready for PR/merge decision; no runtime deployment.

- [ ] **Step 1: Run the treasury authority consistency audit**

Audit maintained current-authority docs for these contradictions:
1. active tax-to-burn/sink rule;
2. multiple spendable treasury cash accounts;
3. direct fiscal balance mutation;
4. budget allocation that mints/moves money;
5. Production/Test claims without evidence.

Expected: zero unqualified current-authority contradictions; historical matches must be accompanied by explicit supersession context.

- [ ] **Step 2: Run bilingual parity and formatting checks**

Run heading/link parity checks across all changed EN/KO pairs and `git diff --check`.

Expected: PASS, with no unfinished-marker text.

- [ ] **Step 3: Recheck final `origin/main`**

Run: `git fetch origin main && git rev-parse origin/main && git log --oneline --decorate HEAD..origin/main`.

If main moved, inspect overlapping files and reconcile before finalizing.

- [ ] **Step 4: Finalize worklog/update/changelog evidence**

Record final main SHA, changed authority files, validation commands/results, unresolved runtime drift, and explicitly state that no DB migration/Test/Production action occurred.

- [ ] **Step 5: Commit final records**

`git add docs/worklog/2026-10-01-treasury-circulation-design-v2026.10.01.495* docs/updates/v2026.10.01.495-* docs/changelog/2026-10-01-treasury-circulation-design-v2026.10.01.495* && git commit -m "docs(release): finalize v495 treasury authority records"`

- [ ] **Step 6: Push and review branch**

Run: `git push`, then verify branch head and compare `origin/main...HEAD`.

Expected: documentation-only branch contains the approved v495 authority integration and no runtime/database files.

- [ ] **Step 7: Stop before runtime implementation**

Do not merge runtime changes, create SQL migrations, deploy Test, or promote Production under this plan. After the documentation authority is accepted, create a separate runtime implementation plan from the now-authoritative v495 contract.
