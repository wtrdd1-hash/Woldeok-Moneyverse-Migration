# Comprehensive Planning Authority and Implementation Gap Audit — v2026.10.16.745

**Status:** AUDIT / FINDINGS / NOT PRODUCT AUTHORITY / NOT DEPLOYED  
**Date:** 2026-10-16 KST  
**Audited GitHub `main`:** `7db7150cd20a684e62a2c1d71c42dc6200929b91` (rechecked unchanged during analysis)  
**Parallel change not adopted:** `docs/planning-privacy-request-fulfillment-v2026.10.16.744` (`267c6bc7`; branch-only draft)  
**English canonical** | [Korean](WOLDEOK_PLANNING_AUTHORITY_AUDIT_v2026.10.16.745.ko.md)

## 1. Method, authority and scope

This is a **read-only planning analysis**. Following `docs/DOCUMENTATION_POLICY.md`, the implementation-facing authority is `docs/planning/PROJECT_PLAN.md`, followed by `docs/planning/INTEGRATED_PLANNING_MASTER.md` and explicitly adopted detailed specs. Findings, update logs, the root `implementation_plan.md` and `PROJECT_MEMORY.md` are supporting material, **not** automatic product authority. The superseded `docs/PROJECT-DOCUMENT-POLICY-KO.md` must not override the current governance policy.

Indexed exact-main: 2,424 tracked files under `docs/`, of which 360 are under `docs/planning/`. This is inventory breadth, not proof that every individual file was semantically validated. Detailed evidence sampled from v675 cross-domain review, F675-01–06 adopted designs, v713 integrated remediation and task matrix, v530 five-pass UI contract, v737/v743 production finance audits, v742 administrator DM, v739 SEO job containment, and v744 concurrent planning logs. No privileged member transactions or destructive tests were executed.

## 2. Product thesis and domain coverage

Moneyverse is a persistent **non-cash-redeemable virtual WLD social-economy game**, not a real securities brokerage or guaranteed-return financial product. The essential user loop is work and verified rewards → cash/bank wallet → optional simulated stocks/business/collections → treasury/economy/community → voluntary return. Helpful public calculators and trustworthy localized educational content serve users independently of sign-up; monetization remains limited to eligible advertisements under the adopted plan.

The v675 portfolio covers 14 review domains: authentication/locale; navigation/UI/admin; WLD/wallet/ledger; jobs; simulated stocks; banking/bonds/pension/treasury; businesses/marketplace; community; AI news/blog; calculators/education; international SEO; advertising/analytics; API/security/infrastructure; and Android. **Domain headings, API presence and feature flags do not establish end-to-end functionality.**

## 3. Independently observed runtime provenance (no promotion)

- Read-only public probe: Production `https://easy-scraping.com/api/version` returned HTTP 200 with source `176ca04ecfbd...` (v717); `/health` returned HTTP 200.
- Read-only Test probe: `https://test.easy-scraping.com/api/version` returned HTTP 200 with source `9618a2499328...` (v735.2).
- `origin/main` was independently checked at `7db7150c...`. These are three different identities; this audit does not call a newer candidate Production-verified.
- MiniPC reported backend/frontend/bot/MCP/nginx active and DEV DB connected. Legacy `moneyverse-backend`/`moneyverse-frontend` units point at `prod-v600`, while separately named v697, v712 and v717 units are active and `production-current` points at v717. The public version response identifies the observed public route; legacy units require scheduler, ingress and job-owner audit before any claim of duplicate execution.

## 4. Highest-severity gaps and traceable evidence

| ID | Priority | Finding and source boundary | Acceptance requirement |
|---|---|---|---|
| A745-01 | P0 | v743 production-connected, read-only report: app-role direct DML rights on five protected finance tables; v713 had measured 237/241 app-writable DEV public tables. Different scopes must not be conflated. | Function-mediated atomic ledger commands for each reachable writer, restore-clone role tests, then revoke direct protected DML; retain legitimate session rights. |
| A745-02 | P0 | v743: 19/40 balances differ from authenticated postings by aggregate +4,779,188 WLD; five cash accounts totaling 2,627,807 WLD have no postings. This **does not** prove theft or corruption: opening evidence remains uncertified. | Recover opening balances and source records, reconcile an immutable snapshot; never fabricate corrections or mutate live member funds to make metrics pass. |
| A745-03 | P0 | v743 confirms migration 269 donation function references incompatible schema/enum fields; migration history observed through 268. | Forward-only compatible migration on restored Test DB, checksums and idempotency; zero financial tests skipped in release gates. |
| A745-04 | P0 | v530 full authenticated UI/admin/mobile five-pass exact-source acceptance remains open despite narrower blog/UI Test passes. | Rebuild candidate route inventory and complete 5 authenticated passes, error/CTA/API outcomes, responsive and session continuity. |
| A745-05 | P0/P1 | v713 documents direct WLD updates in PvP, league, bonds, pension, FX, SWF and marketplace; actual runtime reachability still needs call graph evidence. | Trace reachable actor/feature switch/API paths and preserve supply, accounts, ledger and receipts under concurrency, faults and duplicate requests. |
| A745-06 | P1 | v675/F675-01: optimistic success UI, static admin health values and missing CTA→API→DB evidence. | Every exposed action maps to an authorized endpoint, persistent outcome/receipt, error and UNKNOWN/RECONCILING state. |
| A745-07 | P1 | v675/F675-02, v717/v721/v735: distinguish model call, editorial review, publication and actual market event; legacy publishers and stale content need containment. | No unapproved publication; provenance, correction/withdrawal, honest age/failure labels, one writer lease. |
| A745-08 | P1 | v675/F675-06 and v739: submission, crawl, Google index and clicks are distinct; a shadow SEO job attempted external submissions. | Test performs no external submission; explicit Production opt-in, property/quotas, canonical/hreflang, GSC receipts, no ranking guarantees. |
| A745-09 | P1 | v675/F675-07: country and language detection must not override user choice; four-country blog content must be meaningfully localized. | KR/EN/JA/ZH content and HTML/canonical/hreflang/sitemap match; user language selection persists. |
| A745-10 | P1 | v713: Android cross-repo version/contract and 2FA/session/device acceptance not yet comprehensively verified. | Versioned route contracts, member/admin negative authorization tests and device compatibility evidence. |
| A745-11 | P1 | Older root memory/development summaries refer to historic Production versions or conflict with enabled casino state; the active document policy supersedes older direct-main guidance. | Label historical references explicitly; publish an exact-SHA feature-state map; do not change financial, legal or casino policy from stale text. |

## 5. Existing plans should be executed before new parallel plans

Do **not** duplicate the already detailed `PLATFORM_REMEDIATION_MASTER_BLUEPRINT_v2026.10.16.713`, `REMEDIATION_IMPLEMENTATION_TASK_MATRIX_v2026.10.16.713` (T713-01–26), or `P0_FINANCIAL_AND_DATABASE_REMEDIATION_DESIGN_v2026.10.16.713`. Add live evidence and ownership to these existing controls.

1. **P0 release safety:** lock exact candidates and migration history; restore isolated finance copy; certify opening balances; shift reachable financial writers to atomic ledger commands; verify role isolation and conservation. Never force a Production cutover through failed gates.
2. **P0 end-to-end quality:** generate the current route/CTA inventory; five-pass authenticated UI and admin/mobile testing; independent negative auth and 2FA/CSRF/session continuity.
3. **P1 truthful product:** F675-01 feature-reality register, F675-02 AI news editorial/incident status, F675-03 member-specific immutable WLD receipts.
4. **P1 user journey and international growth:** F675-04 useful public calculator/education experience, F675-05 verified first actions (max three), F675-06 Search Console evidence, F675-07 persistent locale/user preference; regional original value, not thin translation.
5. **P2 differentiation:** F675-08 policy timeline and F675-09 content editorial queue only once authorization, economy, legal and content gates close. The v744 F675-21 privacy-request proposal is a **parallel unmerged draft** and not silently adopted.

Each task must carry an owner, code/route/API/DB contract, tested candidate SHA, failure modes, reproducible evidence, state (`PLANNING`, `IMPLEMENTED`, `TEST_VERIFIED`, `PRODUCTION_VERIFIED` or `BLOCKED`), backout steps and EN/KO update logs. Main merges, CI, Test and public Production are **distinct milestones**.

## 6. Documentation governance and unresolved decisions

- Product plan currently begins at adopted planning version v688; integrated ledger carries later v742 candidate/runtime evidence; `DOCS_INDEX.md` carries v743 release blocker evidence. Numerical freshness alone does not elevate v742/v743/v744 to adopted product policy.
- Confirm whether historical v530 route counts still match exact-source inventory; do not reuse stale 166-route/34-admin totals as a substitute for new counting.
- Set one current feature-status matrix for active, paused, blocked, planned and unverified features (including casino and automatic economy policy). A switch marked enabled does **not** independently establish jurisdictional or financial readiness.
- Public analytics must distinguish actual GSC performance, SEO submission receipts, source freshness, measured Page RPM and synthetic examples. No fabricated business or user outcome metrics.
- Keep EN canonical and KO paired for maintained documents; maintain in dedicated branches; do not overwrite the concurrent v744 planning branch.

### Additional measured documentation drift

- `docs/DOCUMENT_CATALOG.ko.md` still calls `PROJECT_PLAN` version v542 the current authority and inventories 1,650 `docs/` files / 280 planning files. At the exact audited `main`, the plan begins at adopted v688 and the Git tree contains 2,424 `docs/` files / 360 `docs/planning/` files. The catalog counters and version are **stale**; these must be regenerated, not used for release approval.
- The early `AGENTS.md` security description states that the app role has read-only access on key finance tables, while the later v743 actual environment inspection found five directly writable finance tables. This is a **time/scope-sensitive documented contradiction** and should be resolved through exact-schema role tests, not by assuming either assertion is universally true.
- The v675 review's 14 user/product domain groupings and the API catalog's 15 endpoint-domain headings count different classifications; provide a mapping before comparing totals.

## 7. Completion boundary

This document is an audit candidate, not a change of `PROJECT_PLAN`, a financial reconciliation, a test execution, a code fix, a feature release, a PR merge or a Production deployment. No financial data, database grants, feature switches, Test or Production services were modified. Separate miniPC start/mid/end records were maintained for v745; a GitHub-facing and internal update note accompany the audit.
