# Whole-planning and documentation re-review
Version v2026.11.25.PLANREVIEW.1 ·2026-11-25 KST

**17review findings:5P1and12P2.** Two owner decisions are documented in this branch; remaining defects are not claimed fixed.

## Scope and depth
Pinned main9876c09888ec84034eec183cf1309c85df3d7447. Processed all5300text documents/399planning documents, about25MB structurally. The initial5298extension subset omitted two additional text files. Fully paginated42open PRs for7054changed-file entries;15PRs change planning,71entries/48distinct path-content combinations structurally scanned.
This is not every sentence/translation semantically proofread. High-risk authority domains were reviewed separately. Per-file depth is explicit; STRUCTURAL_ONLY means no semantic approval.

|Depth|All docs|Planning|
|---|---:|---:|
|FULL_READ|46|24|
|SECTION_REVIEWED|23|14|
|STRUCTURAL_ONLY|5231|361|

[Coverage / QA ledger](../qa/2026-11-25-all-planning-review.json)

## Owner-confirmed changes

1. Existing500000WLD virtual design cap per member/per institution. Corrected100xindex typo; no real insurance/KRW redemption.
2. All page languages use /en,/ko,/ja,/zh,/vi, including English/Korean. Protocol paths stay stable; no live URL change.
[Decision and supersession](../planning/deltas/v2026.11.25.PLANREVIEW.1.md). Pending main integration; document-only candidate.

## Findings

|ID|Priority|Finding|State|
|---|---|---|---|
|PLANREV-01|P1|QA completeness can be mistaken for release acceptance|OPEN|
|PLANREV-02|P1|Fiscal transfers are incorrectly allowed to count as monetary sinks/faucets|OPEN|
|PLANREV-03|P1|Virtual deposit protection conflicts in scope, amount and real-protection language|OWNER_CONFIRMED_DOC_PATCH_RUNTIME_OPEN|
|PLANREV-04|P1|Operator entrypoints disagree about the runtime and release path|OPEN|
|PLANREV-16|P1|Open UI PR asks for guest access to every page including administrator scope|UPSTREAM_PR_OPEN|
|PLANREV-05|P2|Current runtime summaries are stale and do not identify the present serving artifact|OPEN|
|PLANREV-06|P2|Build commands and checkpoint rules omit already-confirmed owner decisions|OPEN|
|PLANREV-07|P2|Administrator passes and responsive metadata are under-enforced|OPEN|
|PLANREV-08|P2|Active catalogue still promotes superseded visual and zero-defect QA references|OPEN|
|PLANREV-09|P2|Locale default, Korean-root and prefixed URL instructions conflict|OWNER_CONFIRMED_DOC_PATCH_RUNTIME_OPEN|
|PLANREV-10|P2|Architecture PR3423 lacks the paired Korean integrated-master notice|UPSTREAM_PR_OPEN|
|PLANREV-11|P2|Future billing details omit the inherited advertising-only launch blocker|OPEN|
|PLANREV-12|P2|FX design claims authoritative Production integration despite source holds|OPEN|
|PLANREV-13|P2|Blog source-status matrix still describes a replaced stub|OPEN|
|PLANREV-14|P2|API master has352 broken relative file references from one wrong prefix|OPEN|
|PLANREV-15|P2|Proposed wallet function template uses a different search_path standard|OPEN|
|PLANREV-17|P2|Open UI PR has simultaneous v11/v10 sole-authority and brand instructions|UPSTREAM_PR_OPEN|

### PLANREV-01 · P1 · QA completeness can be mistaken for release acceptance

The ledger validator accepts five FAIL or five BLOCKED records when defectId is supplied. Three independent synthetic inputs also showed one admin pass plus four guest passes without the documented viewport/browser/role fields can return ok:true. This is a contract/tool gap; no automatic merge or actual Production bypass was demonstrated.

Resolution: Separate record-completeness and acceptance modes; final acceptance must reject unresolved failures and require accepted exact-candidate evidence. Preserve failed history rather than deleting it.

[scripts/qa/verify-full-route-qa-ledger.mjs:64](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/scripts/qa/verify-full-route-qa-ledger.mjs#L64) · [scripts/qa/verify-full-route-qa-ledger.mjs:97](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/scripts/qa/verify-full-route-qa-ledger.mjs#L97) · [docs/planning/FULL_ROUTE_UI_QA_SPEC.md:85](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/FULL_ROUTE_UI_QA_SPEC.md#L85)

### PLANREV-02 · P1 · Fiscal transfers are incorrectly allowed to count as monetary sinks/faucets

Implementation-ready catalog defines HARD_SINK by leaving player balances without credit to another player; spendable treasury fits that definition. Canonical v523 expressly requires retirement certificates and a matching M_total change; treasury-funded interest and spendable-vault transfers do not create or destroy supply.

Resolution: Make canonical mint/retirement evidence the definition of supply faucet/hard sink in all living EN/KO domain specs. Distinguish player circulation/illiquidity from M_total. Treasury-funded interest and initial loan principal are transfers; new issuance requires monetary order/certificate. Add acceptance examples covering treasury fee, treasury interest and true retirement.

[docs/planning/ECONOMY_SINK_CATALOG.md:15](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/ECONOMY_SINK_CATALOG.md#L15) · [docs/planning/BANKING_CREDIT_SAFETY_SPEC.md:73](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/BANKING_CREDIT_SAFETY_SPEC.md#L73) · [docs/planning/CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md:24](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md#L24) · [docs/planning/CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md:107](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md#L107)

### PLANREV-03 · P1 · Virtual deposit protection conflicts in scope, amount and real-protection language

English specifies an across-institutions cap, Korean a per-institution cap. The index says50,000,000WLD while both detailed designs use500,000WLD. Official-badge/KRW-equivalence/instant-guarantee language conflicts with banking safety. The owner now selected per-member/per-institution. This branch corrects the index and scope and contains the old benchmark language with a virtual-only, non-active override; no payout implementation is certified.

Resolution: Integrate the owner-confirmed document delta, then independently certify virtual eligibility, funding, priority, insufficient-funds behavior and ledger receipts before activation.

[docs/DEPOSIT_INSURANCE_AND_FINANCIAL_STABILITY_SPEC.md:11](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/DEPOSIT_INSURANCE_AND_FINANCIAL_STABILITY_SPEC.md#L11) · [docs/DEPOSIT_INSURANCE_AND_FINANCIAL_STABILITY_SPEC.ko.md:12](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/DEPOSIT_INSURANCE_AND_FINANCIAL_STABILITY_SPEC.ko.md#L12) · [docs/DOCS_INDEX.md:110](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/DOCS_INDEX.md#L110) · [docs/planning/BANKING_CREDIT_SAFETY_SPEC.md:13](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/BANKING_CREDIT_SAFETY_SPEC.md#L13)

### PLANREV-04 · P1 · Operator entrypoints disagree about the runtime and release path

AGENTS says Kubernetes/Flux, no Docker/SSH and no Test namespace. INFRASTRUCTURE/RELEASING name Debian systemd/Nginx and isolated Test. The Spring single-runtime document says Next processes are zero; read-only metadata found active named Next units on the Debian application VM. These are different authority layers, not interchangeable deployment commands.

Resolution: Reconcile operator instructions into observed runtime, approved target and historical layers. Preserve the owner-approved Next+Spring target and require exact Test plus separate Production approval; never infer a cutover from a document title.

[AGENTS.md:368](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/AGENTS.md#L368) · [docs/INFRASTRUCTURE.md:9](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/INFRASTRUCTURE.md#L9) · [docs/RELEASING.md:14](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/RELEASING.md#L14) · [docs/SPRING_BOOT_SINGLE_RUNTIME_ARCHITECTURE.md:13](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/SPRING_BOOT_SINGLE_RUNTIME_ARCHITECTURE.md#L13)

### PLANREV-16 · P1 · Open UI PR asks for guest access to every page including administrator scope

PR3442 CURRENT_UI_DESIGN includes administrator/all-route scope and demands guest viewing of all180without exceptions, while its own single reference requires verified-admin-only navigation and route RBAC. This is a dangerous conflicting implementation requirement, not proof that private administrator data is exposed.

Resolution: Constrain guest exploration to reviewed public-safe routes/specimens; protected HTML, data and APIs must retain session/role boundaries. Block acceptance until the contract is consistent.

[docs/design/CURRENT_UI_DESIGN.md:7](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/73c137ae980b466ffcba5f816ba55a9e7855956e/docs/design/CURRENT_UI_DESIGN.md#L7) · [docs/design/CURRENT_UI_DESIGN.md:16](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/73c137ae980b466ffcba5f816ba55a9e7855956e/docs/design/CURRENT_UI_DESIGN.md#L16) · [docs/UI_UX_SINGLE_REFERENCE.md:15](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/73c137ae980b466ffcba5f816ba55a9e7855956e/docs/UI_UX_SINGLE_REFERENCE.md#L15)

### PLANREV-05 · P2 · Current runtime summaries are stale and do not identify the present serving artifact

Plan/master/baseline/release guide still lead with a dated maintenance503 snapshot. The explicit no-cookie audit HTTP client observed both roots200 without maintenance text, while both /api/version probes returned503. Default Python client was denied, so this is client-specific read-only evidence, not browser/privacy or complete functionality acceptance. Old named backend units are missing and frontend units inactive; other Spring/Next units run. No exact serving SHA or route-to-process map was attested.

Resolution: Publish a new scoped, timestamped route→process→artifact→source acceptance record before retiring dependencies or promoting. Do not restart old names or stop retained processes based on this inventory.

[docs/planning/PROJECT_PLAN.md:3](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/PROJECT_PLAN.md#L3) · [docs/planning/INTEGRATED_PLANNING_MASTER.md:3](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/INTEGRATED_PLANNING_MASTER.md#L3) · [docs/CURRENT_RUNTIME_BASELINE.md:3](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/CURRENT_RUNTIME_BASELINE.md#L3) · [docs/RELEASING.md:44](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/RELEASING.md#L44)

### PLANREV-06 · P2 · Build commands and checkpoint rules omit already-confirmed owner decisions

deploy.yml has workflow_run plus dispatch requiring candidate_run_id, while AGENTS advertises a bare manual dispatch. AGENTS also says commit only when asked alongside mandatory checkpoint push. The owner already resolved image preparation automatic/Production separate, and task request includes task-branch commit/push/main merge separate. Do not ask these again or confuse image publication with traffic switching.

Resolution: Reconcile EN/KO operator examples and entrypoints using those decisions; keep the exact candidate evidence gate. Coordinate with the open consolidation PR rather than silently overwriting its branch.

[.github/workflows/deploy.yml:3](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/.github/workflows/deploy.yml#L3) · [.github/workflows/deploy.yml:9](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/.github/workflows/deploy.yml#L9) · [AGENTS.md:392](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/AGENTS.md#L392) · [AGENTS.md:449](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/AGENTS.md#L449) · [AGENTS.md:460](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/AGENTS.md#L460)

### PLANREV-07 · P2 · Administrator passes and responsive metadata are under-enforced

The specification requires authenticated admin data on every pass and role/browser/viewport/orientation/zoom evidence. The checker requires only one qa_admin_v1 record anywhere; missing dimension/role metadata is accepted. Root independently reran the synthetic negative case.

Resolution: Enforce accepted administrator evidence in each pass and the actual required matrix fields; distinguish expected authorization-denial tests from successful administrator workflows.

[scripts/qa/verify-full-route-qa-ledger.mjs:80](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/scripts/qa/verify-full-route-qa-ledger.mjs#L80) · [docs/planning/FULL_ROUTE_UI_QA_SPEC.md:73](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/FULL_ROUTE_UI_QA_SPEC.md#L73) · [docs/planning/FULL_ROUTE_UI_QA_SPEC.md:80](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/FULL_ROUTE_UI_QA_SPEC.md#L80)

### PLANREV-08 · P2 · Active catalogue still promotes superseded visual and zero-defect QA references

The catalogue calls the zinc/gold/emerald guide and historical v473 QA certificates SSOT. The later adopted visual contract is navy/violet, and candidate QA explicitly requires exact-source reruns. The dated v473 document is not disproven as history; surfacing it as present acceptance authority is the defect.

Resolution: Mark superseded visual/QA portions historical and route current entrypoints to the explicit owner baseline and exact-candidate acceptance contract; preserve archival receipts.

[docs/DOCUMENT_CATALOG.ko.md:150](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/DOCUMENT_CATALOG.ko.md#L150) · [docs/DESIGN_SYSTEM_GUIDELINES.md:54](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/DESIGN_SYSTEM_GUIDELINES.md#L54) · [docs/QA_TRACEABILITY_MATRIX_V473.md:7](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/QA_TRACEABILITY_MATRIX_V473.md#L7) · [docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.md:13](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.md#L13)

### PLANREV-09 · P2 · Locale default, Korean-root and prefixed URL instructions conflict

Older international/growth/editorial specs specify Korean fallback and unprefixed canonical, while Nov20 adopts English and five languages. The owner now selected prefixes for all five languages. This branch adds paired explicit supersession notices and the decision delta; no URL migration is performed.

Resolution: Integrate this planning delta, then implement a reviewed legacy-to-prefixed mapping, authenticated/noindex boundaries, reciprocal language SEO and exact Test acceptance without breaking protocol paths.

[docs/planning/INTERNATIONAL_LOCALE_JURISDICTION_MONETIZATION_SPEC.md:242](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/INTERNATIONAL_LOCALE_JURISDICTION_MONETIZATION_SPEC.md#L242) · [docs/planning/INTERNATIONAL_LOCALE_JURISDICTION_MONETIZATION_SPEC.md:278](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/INTERNATIONAL_LOCALE_JURISDICTION_MONETIZATION_SPEC.md#L278) · [docs/planning/GLOBAL_GROWTH_EXECUTION_SPEC.md:62](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/GLOBAL_GROWTH_EXECUTION_SPEC.md#L62)

### PLANREV-10 · P2 · Architecture PR3423 lacks the paired Korean integrated-master notice

The pinned PR changes the English integrated master but not its Korean counterpart, even though the detailed decision and project plan are paired. The approved Next+Spring target is not reopened; the missing notice is a synchronization defect in an unmerged PR.

Resolution: Pair the architecture/adoption notice in PR3423, with identical pending-integration/no-cutover status. No blanket main/runtime completion claim.

[docs/planning/INTEGRATED_PLANNING_MASTER.md:3](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/bdec6e9f6164b79e58cc2287d3cad927f6441799/docs/planning/INTEGRATED_PLANNING_MASTER.md#L3)

### PLANREV-11 · P2 · Future billing details omit the inherited advertising-only launch blocker

International paid-product readiness and billing DoD can be read without the controlling AD_ONLY business-scope prerequisite. The higher-level rule already blocks real-money channels; this review has not proven an actual payment launch bypass. WLD-only virtual membership remains separate and permitted within its accepted contract.

Resolution: Explicitly inherit the global real-money blocker in country/channel matrices and launch checklists. Do not request a new monetization decision for already-blocked channels.

[docs/planning/INTERNATIONAL_LOCALE_JURISDICTION_MONETIZATION_SPEC.md:135](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/INTERNATIONAL_LOCALE_JURISDICTION_MONETIZATION_SPEC.md#L135) · [docs/planning/BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.md:21](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.md#L21) · [docs/planning/AD_ONLY_ADVERTISING_REVENUE_SPEC.md:11](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/AD_ONLY_ADVERTISING_REVENUE_SPEC.md#L11)

### PLANREV-12 · P2 · FX design claims authoritative Production integration despite source holds

A current indexed cross-cutting spec can be mistaken for an enabled, verified finance contract or for authority to remove intentional containment. Source contains explicit503 fx_source_unverified responses; those source checks are not a live service probe.

Resolution: Label EN/KO FX documents conditional/historical snapshot and use current planning authority links. Record source-level hold and missing ledger/funding/precision/eligibility/Test evidence separately; keep release blocked until existing gates pass.

[docs/FOREIGN_EXCHANGE_RESERVES_AND_MARKET_SPEC.md:4](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/FOREIGN_EXCHANGE_RESERVES_AND_MARKET_SPEC.md#L4) · [docs/MACRO_SOVEREIGN_ECONOMIC_SYSTEM_MASTER_SPEC.md:3](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/MACRO_SOVEREIGN_ECONOMIC_SYSTEM_MASTER_SPEC.md#L3) · [spring-backend/src/main/java/com/moneyverse/api/domain/fx/controller/PublicFxController.java:25](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/spring-backend/src/main/java/com/moneyverse/api/domain/fx/controller/PublicFxController.java#L25)

### PLANREV-13 · P2 · Blog source-status matrix still describes a replaced stub

v1405 still says author/publisher/moderation NOT IMPLEMENTED and handler always returns the not-implemented result, despite its v1412 addendum and current source wiring the writer, publisher and moderation. This disproves the blanket source-status claim, not establishes runtime publication acceptance.

Resolution: Refresh the paired implementation matrix, link later owner visibility policy, and separate source/Test/Production status instead of rebuilding existing paths.

[docs/planning/BLOG_TWO_HOUR_AUTOPUBLISH_SPEC_v2026.10.28.1405.md:44](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/BLOG_TWO_HOUR_AUTOPUBLISH_SPEC_v2026.10.28.1405.md#L44) · [backend/src/scheduler/scheduler.module.ts:101](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/backend/src/scheduler/scheduler.module.ts#L101) · [backend/src/blog-editorial/blog-verified-job.ts:23](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/backend/src/blog-editorial/blog-verified-job.ts#L23)

### PLANREV-14 · P2 · API master has352 broken relative file references from one wrong prefix

Manual confirmation found352 links to eight existing API detail documents prefixed with ./Woldeok-Moneyverse-Migration/docs/api/ even though the source already resides in docs/api. All eight intended targets exist. These352 are confirmed instances of one root cause; the remaining27 scan candidates are not all confirmed defects.

Resolution: Correct this generator/template-relative prefix and verify regenerated inbound links. Do not relocate or delete target references merely for cleanup.

[docs/api/API_DOCUMENTATION.md:55](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/api/API_DOCUMENTATION.md#L55) · [docs/api/API_DOCUMENTATION.md:70](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/api/API_DOCUMENTATION.md#L70)

### PLANREV-15 · P2 · Proposed wallet function template uses a different search_path standard

Integrated master proposes public,pg_temp for SECURITY DEFINER bookmark functions, whereas AGENTS requires pg_catalog,pg_temp and qualified application objects. This is a prospective contract conflict, not a demonstrated deployed exploit or authorization to loosen grants.

Resolution: Reconcile the proposed function contract to the established restricted template and actor-scoped reads before implementation; verify real-role negative tests in isolated CI/Test.

[docs/planning/INTEGRATED_PLANNING_MASTER.md:653](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/INTEGRATED_PLANNING_MASTER.md#L653) · [AGENTS.md:256](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/AGENTS.md#L256)

### PLANREV-17 · P2 · Open UI PR has simultaneous v11/v10 sole-authority and brand instructions

At the latest inspected73c137head, CURRENT_UI_DESIGN makes v11 the sole reference, while UI_UX_SINGLE_REFERENCE says only v10 and navy/violet. The v11 gallery instead specifies gold/emerald. Its180PNG files do exist; file existence does not settle the contradictory authority or owner artistic approval.

Resolution: Use one version/manifest/brand contract with explicit owner adoption and per-route provenance. PR3443 remains a separate proposal, not an automatically approved replacement.

[docs/design/CURRENT_UI_DESIGN.md:14](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/73c137ae980b466ffcba5f816ba55a9e7855956e/docs/design/CURRENT_UI_DESIGN.md#L14) · [docs/UI_UX_SINGLE_REFERENCE.md:3](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/73c137ae980b466ffcba5f816ba55a9e7855956e/docs/UI_UX_SINGLE_REFERENCE.md#L3) · [docs/design/game-ui-v2026.11.24.11/README.md:12](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/73c137ae980b466ffcba5f816ba55a9e7855956e/docs/design/game-ui-v2026.11.24.11/README.md#L12)

## Reaffirmed gates and limits
The original92route contract, historical86source snapshot and180design entries are different sets. A historical42-capability v473table cannot certify the new180routes. Next implementation must map planning ID→route/action→actual API/DTO→role/ledger function→argument-ID fixture→test→exact Test SHA→Production evidence/owner/status.
PR3423 records the already-approved Next+Spring target but remains unmerged; PR3443 is a static proposal, not working auth/finance/admin QA. Latest inspected PR3442 really contains180v11PNGs; existence is not artistic approval or reconciliation of its conflicting instructions.

The backup document line41still requires off-host immutable copies, isolated restore and measured RPO/RTO before closing P0. No remote-backup/restore/alert-delivery test ran here. Intentional casino/FX/KDIC503holds stay intact. No existing ledger or runtime failure was bypassed.
P3 maintenance observation: Dopamine per-feature Planned/In-Design/Completed and three-versus-five daily taps disagree. Historical v457/v458records are not disproven; WLD-only goods are not real-money billing. Separate current versus historical status in follow-up.

5136explicit relative file links yielded379candidates;352API-prefix links were manually confirmed against eight existing targets. Planning file-link missing candidates:0. Unpaired planning candidates:9(existing .en.md pair recognized); identical-content groups:56. Candidate counts are not confirmed defects. Nothing was mass-moved/deleted.

Around14:12KST, a named no-cookie HTTP client observed roots200/no maintenance text and version503; the default client was denied. Service metadata showed stale old unit names and active Next/Spring units. This does not certify browser/external-Test privacy, route-to-process ownership, exact serving SHA or functional correctness. No process stopped.
Three synthetic negative cases reproduced missing denials, not successful product acceptance. No application build, DB/finance/E2E test or Production promotion occurred. No current legal/statutory claims were validated.

## Follow-up order
1. Review/integrate the owner delta and audit with the existing consolidation/architecture PRs.
2. Split completeness and acceptance; require each administrator pass and the actual evidence matrix.
3. Reconcile monetary taxonomy, virtual protection, cash-channel blockers and public/admin boundaries.
4. Refresh operator/runtime/design authority and paired notices; repair generated API links.
5. Implement only through independent exact-SHA Test and separately approved Production promotion.

### Final PR ref recheck
PR3442 advanced077696→73c137 during review; the three cited authority files are byte-identical, so findings16/17are repinned to73c137. PR3447 advanced3b751d→aa3c5b; its new implementation is not claimed fully reviewed. Main remained9876c098.
