# 📚 Document Catalog

## v2026.10.17.801 — Full code / runtime audit (AUDIT / BLOCKED)
- [Full findings EN](findings/MONEYVERSE_FULL_CODE_RECHECK_v2026.10.17.801.md) / [KO](findings/MONEYVERSE_FULL_CODE_RECHECK_v2026.10.17.801.ko.md) · [Worklog EN](worklog/2026-10-17-full-code-recheck-v801.md) / [KO](worklog/2026-10-17-full-code-recheck-v801.ko.md) · [Changelog EN](changelog/2026-10-17-full-code-recheck-v801.md) / [KO](changelog/2026-10-17-full-code-recheck-v801.ko.md) · [GitHub](updates/v2026.10.17.801-github.md) / [Internal](updates/v2026.10.17.801-internal.md). This is evidence only; live finance and exact Test release identity BLOCK production.


## v2026.10.17.782 — MiniPC root safe-cache recovery (HOST VERIFIED)
- [Worklog EN](worklog/2026-10-17-host-storage-hygiene-v782.md) / [KO](worklog/2026-10-17-host-storage-hygiene-v782.ko.md) · [Exact 26-cache evidence](worklog/host-cleanup-v782-evidence.txt) · [Changelog](changelog/2026-10-17-host-storage-hygiene-v782.md) / [KO](changelog/2026-10-17-host-storage-hygiene-v782.ko.md) · [GitHub](updates/v2026.10.17.782-github.md) / [Internal](updates/v2026.10.17.782-internal.md). System 80%→72%, 8.21GB net reclaimed, no app release.

## v2026.10.17.781 — Host disk safe cleanup (HOST VERIFIED)
- [Worklog EN](worklog/2026-10-17-host-disk-cleanup-v781.md) / [KO](worklog/2026-10-17-host-disk-cleanup-v781.ko.md) · [Changelog EN](changelog/2026-10-17-host-disk-cleanup-v781.md) / [KO](changelog/2026-10-17-host-disk-cleanup-v781.ko.md) · [GitHub update](updates/v2026.10.17.781-github.md) · [Internal update](updates/v2026.10.17.781-internal.md). Debian root 90%→79%, ~10.99GB net reclaimed from 18 inactive `.next` caches; no app/DB/release mutation.

## v2026.10.16.739 — Safe SEO scheduled-indexing gate
- [Release EN](releases/v2026.10.16.739.md) / [KO](releases/v2026.10.16.739.ko.md), [worklog](worklog/2026-10-16-seo-cron-isolation-v739.md), [GitHub](updates/v2026.10.16.739-github.md), [internal](updates/v2026.10.16.739-internal.md).


## v2026.10.16.737 — Read-only financial release gate (BLOCKED)
- [EN](worklog/2026-10-16-financial-readiness-v737.md) / [KO](worklog/2026-10-16-financial-readiness-v737.ko.md) · [GitHub update](updates/v2026.10.16.737-github.md) · [Internal](updates/v2026.10.16.737-internal.md). No live data or runtime changes.

## v2026.10.16.734 — Actual host generation preflight
- [Release EN](releases/v2026.10.16.734.md) / [KO](releases/v2026.10.16.734.ko.md), [worklog](worklog/2026-10-16-host-release-identity-v734.md), [GitHub update](updates/v2026.10.16.734-github.md), [internal update](updates/v2026.10.16.734-internal.md).


## v2026.10.16.720 — v719 Test-verified, Production hold
- [Release](releases/v2026.10.16.719.md) / [Korean](releases/v2026.10.16.719.ko.md) · [Worklog](worklog/2026-10-16-ui-v719-test-production-hold-v720.md) · [GitHub update](updates/v2026.10.16.720-github.md). Exact Test v719.2 accepted; UI/finance P0 blocks Production.


## v2026.10.16.719 — Admin SEO safety and responsive UI candidate
- [EN changelog](changelog/2026-10-16-ui-admin-seo-safety-v2026.10.16.719.md) / [KO](changelog/2026-10-16-ui-admin-seo-safety-v2026.10.16.719.ko.md) · [Worklog](worklog/2026-10-16-full-ui-admin-remediation-v719.md) · [GitHub update](updates/v2026.10.16.719-github.md).

## v2026.10.16.718 — Full UI & administrator audit (AUDIT/BLOCKED)
- [EN](findings/MONEYVERSE_FULL_UI_ADMIN_AUDIT_v2026.10.16.718.md) / [KO](findings/MONEYVERSE_FULL_UI_ADMIN_AUDIT_v2026.10.16.718.ko.md) · [Worklog](worklog/2026-10-16-full-ui-admin-audit-v718.md) · [Update](updates/v2026.10.16.718-github.md).

## v2026.10.16.717 — Regional blog release candidate
- [Release](releases/v2026.10.16.717.md) · [Korean](releases/v2026.10.16.717.ko.md) · [Worklog](worklog/2026-10-16-blog-gate-v717.md) · [GitHub update](updates/v2026.10.16.717-github.md) · [Internal update](updates/v2026.10.16.717-internal.md).


## v2026.10.16.715 — Audited PR integration and release hold
- [Release (EN)](releases/v2026.10.16.715.md) / [KO](releases/v2026.10.16.715.ko.md); [worklog (EN)](worklog/2026-10-16-branch-integration-close-v715.md) / [KO](worklog/2026-10-16-branch-integration-close-v715.ko.md); [GitHub update](updates/v2026.10.16.715-github.md) and [internal record](updates/v2026.10.16.715-internal.md). Documentation-only main merge; runtime Production hold.


## v2026.10.16.713 — Proposed remediation blueprint (NOT adopted or deployed)

- [Integrated full-platform remediation design — EN](planning/PLATFORM_REMEDIATION_MASTER_BLUEPRINT_v2026.10.16.713.md) / [KO](planning/PLATFORM_REMEDIATION_MASTER_BLUEPRINT_v2026.10.16.713.ko.md): P0/P1/P2 problems, source/plan truth, safe release order and external references.
- [P0 finance, treasury and DB privilege redesign — EN](planning/P0_FINANCIAL_AND_DATABASE_REMEDIATION_DESIGN_v2026.10.16.713.md) / [KO](planning/P0_FINANCIAL_AND_DATABASE_REMEDIATION_DESIGN_v2026.10.16.713.ko.md): independent reconciliations, canonical settlements, strict privileges and forward-only migrations.
- [26-step implementation proposal — EN](planning/REMEDIATION_IMPLEMENTATION_TASK_MATRIX_v2026.10.16.713.md) / [KO](planning/REMEDIATION_IMPLEMENTATION_TASK_MATRIX_v2026.10.16.713.ko.md): owner/file/test/acceptance matrix.
- **Status: PLANNING ONLY**, subject to approval and superseding current adopted economic/UI authorities **only if explicitly approved later**. Do not interpret this catalog link as implementation, Test success or Production promotion.


## v2026.10.15.688 — F675-06 GSC evidence center (PLANNING)

- [F675-06 Google Search Evidence, Indexing Truth & Canonical Action Center EN](planning/F675_06_GSC_SEARCH_EVIDENCE_CANONICAL_ACTION_SPEC.md) / [KO](planning/F675_06_GSC_SEARCH_EVIDENCE_CANONICAL_ACTION_SPEC.ko.md); source gaps S688-01..10, operator user hypotheses, separate index/submission/traffic truth, 16 official references, D0–D7. No runtime code/GSC access or deployment.


## v2026.10.15.686 — F675-05 safe first action (PLANNING)

- [F675-05 First-session Verified Next-Action EN](planning/F675_05_FIRST_SESSION_NEXT_ACTION_TRUST_SPEC.md) / [한국어](planning/F675_05_FIRST_SESSION_NEXT_ACTION_TRUST_SPEC.ko.md). O686-01..10 source gaps, 9 user needs hypotheses, 12 bilingual copy states, 12 references, max-3 safe choices and D0–D7; no Test/Production implementation.


## v2026.10.15.681 — F675-04 calculator to learning (PLANNING)

- [F675-04 Public Calculator → Learning → Optional Fictional Game (EN)](planning/F675_04_CALCULATOR_TO_LEARNING_OPTIONAL_GAME_SPEC.md) · [Korean](planning/F675_04_CALCULATOR_TO_LEARNING_OPTIONAL_GAME_SPEC.ko.md). Existing calculators reused; C681-01..09 truth gaps, 8 user jobs, 14 first-party/practitioner references, D0–D7 exact-SHA release gates. No runtime code or Test/Production acceptance.


## v2026.10.15.680 — F675-03 activity/receipt product design (PLANNING)

- [WLD activity reasons, reconciliation & private receipt details (EN)](planning/F675_03_WLD_ACTIVITY_EXPLANATION_RECEIPTS_SPEC.md) / [Korean](planning/F675_03_WLD_ACTIVITY_EXPLANATION_RECEIPTS_SPEC.ko.md) — source-observed max-50 history, internal bank net-zero risk, exact-money privacy, 8 user hypotheses, 13 references, D0–D7; docs only.


## v2026.10.15.679 — F675-02 AI stock-news user trust (PLANNING)

- [F675-02 AI news, user trust, freshness and recovery (EN)](planning/F675_02_AI_NEWS_USER_TRUST_RECOVERY_SPEC.md) / [한국어](planning/F675_02_AI_NEWS_USER_TRUST_RECOVERY_SPEC.ko.md), linked from canonical planning and v325. Scoped source findings, 13 external references, seven user tasks, safe generation/review/publish/market-event states. Documentation only; prior v660 incident and separate v661 candidate are not Production closure.


## v2026.10.15.677 — First one-by-one feature deep dive (PLANNING)

- [F675-01 Feature Reality / User Trust / Recovery (EN)](planning/F675_01_FEATURE_REALITY_USER_TRUST_SPEC.md) · [한국어](planning/F675_01_FEATURE_REALITY_USER_TRUST_SPEC.ko.md) extends v675 with measured-status vs implementation truth, six user tasks, safe uncertain transaction handling, 13 reference sources and staged engineering gates. Source-only design evidence; no runtime implementation claim.


## v2026.10.15.675 — New integrated review (PLANNING)

- [Full product/feature review](planning/INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.md) / [Korean](planning/INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.ko.md) is an adopted **review/evidence backlog supplement**, not a superseding runtime/release decision. Canonical authority remains `PROJECT_PLAN`, `INTEGRATED_PLANNING_MASTER` and their explicit economic/UI supersession rules. Contains 14-domain crosswalk, F675-01..09 backlog and 13 official references.


## Current verification evidence (v2026.10.14.605; documentation only)

- [Full function acceptance audit — English](findings/MONEYVERSE_FULL_FUNCTION_ACCEPTANCE_AUDIT_v2026.10.14.605.md) / [Korean](findings/MONEYVERSE_FULL_FUNCTION_ACCEPTANCE_AUDIT_v2026.10.14.605.ko.md); [worklog](worklog/2026-10-14-full-function-acceptance-v605.md). This is **BLOCKED**, not a new authoritative feature specification or Production acceptance.


**English canonical** | [한국어](DOCUMENT_CATALOG.ko.md)

> **Snapshot Version**: `v2026.10`  
> **Target Branch**: `main` (Real-World Economic Benchmarks: Central Bank monetary policy, 25M Treasury Anchor, 3-Tier KTB / Repo Exchange, WSHC State Enterprises, and National Pension Service (NPS) historical domain inventory)  
> **Purpose**: Official master inventory certifying documentation organization status.

---

## Current canonical authority (supersedes the legacy list below)

1. [Documentation Governance Policy](DOCUMENTATION_POLICY.md) defines precedence; [Living PROJECT_PLAN](planning/PROJECT_PLAN.md) **v2026.10.10.542** is the authoritative implementation-facing product/engineering contract.
2. [Integrated Planning Master](planning/INTEGRATED_PLANNING_MASTER.md) is the cycle/decision/authority-drift ledger, followed by detailed specs explicitly adopted by those two documents.
3. [Economy Integrity & Documentation Reconciliation v542](planning/ECONOMY_INTEGRITY_AND_DOCUMENTATION_RECONCILIATION_SPEC.md) and [Central Bank/Mint/Treasury/Economy Core v523](planning/CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md) govern treasury/monetary boundaries; root sovereign, bond, fund, pension and FX documents below are **domain references with conditional/incomplete runtime evidence**, not independent superior product authorities.
4. Source history, v511 completion matrix and v473 QA are historical, not verified evidence for latest `main`. No Test/Production approval follows from a documentation version update.

## Historical domain-reference inventory (not the current authority order)

1. **[Real-World Benchmark Macro Sovereign Economic Master Spec](MACRO_SOVEREIGN_ECONOMIC_SYSTEM_MASTER_SPEC.md)**: 6-pillar master specification covering Central Bank monetary policy, 25M Treasury Anchor, 3-tier KTB bonds / Repo, 3 state enterprises with 30% dividend payouts, 5-tier National Pension Service (NPS), and Capital Market securities transaction taxes
2. **[Treasury 25M Anchor & Autonomous Investment-Recirculation Cycle Spec](TREASURY_25M_ANCHOR_AUTONOMOUS_CYCLE_SPEC.md)**: Zero-user/low-user autonomous expansion, 25M WLD safe reserve floor, and automated tax/dividend/interest revenue cycle engine
3. **[Treasury Bonds (KTB) & Repo Exchange Specification](TREASURY_BONDS_EXCHANGE_SPEC.md)**: 3Y/5Y/10Y sovereign bonds real-time orderbook, 24h repurchase agreement (Repo) credit line, and treasury coupon engine
4. **[National Pension Service (NPS) Public Accumulation & Lifetime Basic Pension Spec](NATIONAL_PENSION_SERVICE_SPEC.md)**: 5 contribution tiers (50K~1M WLD), 100% treasury matching grant, hourly lifetime basic annuity, and sovereign wealth fund allocation
5. **[Bank of Korea FX Reserves & Seoul Foreign Exchange Market Spec](FOREIGN_EXCHANGE_RESERVES_AND_MARKET_SPEC.md)**: 1,000,000 USD foreign exchange vault, floating exchange rate (1,350 WLD anchor), central bank smoothing operations, and 4.5% USD savings
6. **[Global FX Safety Net, Currency Swaps, and Forward Hedging Spec](GLOBAL_FX_SAFETY_NET_AND_FORWARD_HEDGE_SPEC.md)**: IMF SDR basket & gold reserves diversification, Fed & BOJ bilateral swap lines, 1M/3M/6M CIP forward hedging center, and 4-tier EWS crisis index
7. **[KDIC Depositor Protection Act & Financial Stability Fund Spec](DEPOSIT_INSURANCE_AND_FINANCIAL_STABILITY_SPEC.md)**: 500K WLD coverage, 0.08% premium, 10M WLD fund vault, and bank run emergency payouts
8. **[State-Owned Enterprises (WSHC) & ALIO Public Disclosure Portal Spec](STATE_ENTERPRISES_AND_CORPORATE_GOVERNANCE_SPEC.md)**: Energy, Infrastructure, and Financial SOE financial ledgers, 30% treasury dividend remittance, and public ALIO portal
6. **[Treasury Automated Social Recirculation Specification](planning/TREASURY_AUTOMATED_SOCIAL_RECIRCULATION_SPEC.en.md)**: 5 System Vaults, 4 Social Outflows, 10-Tier Tax Schedule & 30% Safe Reserve Floor
7. **[Integrated Planning Master](planning/INTEGRATED_PLANNING_MASTER.md)**: v2026.10 Latest Production Release & 15-Domain Authority Planning
8. **[Integrated Application Specification & User Guide](APP_SPEC_AND_USER_GUIDE.md)**
9. **[2026 Next-Gen FinTech Design System Guidelines](DESIGN_SYSTEM_GUIDELINES.md)**
10. **[2026 Official Responsive Design Guidelines](RESPONSIVE_DESIGN_GUIDELINES.md)**
11. **[Master Index](INDEX.md)**
12. **[Current Runtime Baseline](CURRENT_RUNTIME_BASELINE.md)**
13. **[Documentation Governance Policy](DOCUMENTATION_POLICY.md)**

---

## 📊 Inventory Summary

Total documents in `docs/`: **1,650 files**, categorized into 15 domains.

| Classification | Files | Highlights |
| :--- | :---: | :--- |
| **01. Master Specs / Guides** | 67 | App spec, traceability matrix, runtime baseline, documentation policy |
| **02. Design System** | 6 | 2026 FinTech design guidelines, 2026 Responsive guidelines, UI/UX |
| **03. Planning** | 280 | Growth plan (pSEO/viral), security assurance, monetary velocity |
| **04. Features** | 22 | Compound interest, stocks, jobs, attendance roulette |
| **05. Architecture / Infra** | 12 | MSA gateway, PostgreSQL ACID, Nginx reverse proxy |
| **06. API / Contracts** | 10 | REST API master catalog, OpenAPI 3.0, mobile contract |
| **07. Worklogs** | 548 | Historical technical implementation logs |
| **08. Changelogs** | 425 | Release changelogs & bug fixes |
| **09. Update Logs** | 162 | `v469 ~ v473` release announcements |
| **10. Release Archive & QA** | 64 | `v473 Full QA Audit`, `Traceability Matrix`, release artifacts |
