# Economy Integrity, Evidence Truth and Documentation Reconciliation — v2026.10.10.542

**English canonical** | [한국어](ECONOMY_INTEGRITY_AND_DOCUMENTATION_RECONCILIATION_SPEC.ko.md)  
**Status:** ADOPTED PLANNING / partial branch implementation / Test and Production BLOCKED  
**Start and mid-work `origin/main`:** `545e8231f8b90b543ed9de0722adf98d63587820`  
**Branch:** `fix/planning-economy-truth-v2026.10.10.542`  
**Date:** 2026-10-10

## 1. Authority, decisions and evidence boundary

This detailed corrective specification is adopted only via `PROJECT_PLAN.md` and `INTEGRATED_PLANNING_MASTER.md`. It does **not** imply that the current Production/Tes­t runtime serves the branch. Superseding order: `PROJECT_PLAN` > `INTEGRATED_PLANNING_MASTER` > adopted v523 institutional separation > this corrective contract > domain specifications. Historical snapshots, root `implementation_plan.md`, `PROJECT_MEMORY.md`, standalone v2026.10 macro documents and v511 status matrix cannot independently supersede these decisions.

Moneyverse is a closed-loop *virtual* WLD economy. Taxes, transfers, treasury spending, deposits and fully funded loans are reallocations of existing WLD; total WLD can change only by approved canonical mint/retirement postings. No document saying “reserve guarantee”, “zero default”, “automatic top-up”, “AI adjustment” or “burn to a vault/dead address” constitutes authority to mint or retire.

## 2. Findings, owners and acceptance

| ID / priority | Observed evidence | Corrective decision / evidence needed | Current state |
| --- | --- | --- | --- |
| E542-01 P0 | Admin `admin-national-treasury-control-card.tsx` used `Math.random`, React state and success toasts to claim a real lottery draw/burn and applied Taylor policy without backend calls | Fail-closed UI with disabled mutation controls; local illustrative rate only. For reactivation: server-side actor/step-up, idempotency, approved policy/order, CSPRN­G, atomic ledger, certificate/audit receipt, QA and exact-SHA Test | IMPLEMENTED ON BRANCH; TEST BLOCKED |
| E542-02 P0 | 25M treasury anchor spec promises exact reserve and automatic deficit closure; v523 forbids implied issuance | 25M is a **conditional fiscal reserve target**, not an invariant; inability to fund means pause/reprioritize/raise explicitly funded revenue or follow disclosed fiscal stress protocol, never silent mint/“guaranteed zero default” | PLANNING; runtime audit BLOCKED |
| E542-03 P0 | `267-monetary-taylor-lending-and-lottery.sql` introduces paid WLD lottery tickets, win/claim and 50% burn fields without complete regulatory/mint/retire/ledger evidence | Gate ticket sales, awards, draws and hard burn behind separate safety, age/jurisdiction, randomness, non-cashable value, ledger funding and atomicity approvals. No client-side draw; no virtual-asset benefit promise. Verify exact actual runtime before declaring enabled | BLOCKED |
| E542-04 P0 | Bond spec pairs 4.5% APR with 0.051% per hour and compressed 24h “1Y” maturity; multiple APR/day/time assumptions | Define `real_seconds_per_game_year`, basis, compounding and rounding; calculate coupon with a testable formula. At ordinary 8760h/year, simple 4.5% APR corresponds to approx. 0.000514%/hour, not 0.051%. All legacy percentages are NON-AUTHORITATIVE until contractual time mapping and cross-feature tests exist | BLOCKED |
| E542-05 P1 | Fiscal docs combine 40/30/20/10 **vault** allocation with 40/40/30/10/20 **program** labels, and multiple reserve floors | Keep 40/30/20/10 only as an explicit single-envelope allocation proposal; welfare/infra/emergency program percentages must be children of their vault envelope, never five extra shares of one base. Precedence among 25M target, 30% protected cash, stock halt claims and matured bonds must be separately defined, with insufficient-funds state. Current runtime values require measurement | PLANNING |
| E542-06 P1 | v511 gap doc says all ACCEPTED; v530 later reopens UI; v537 fixes some admin UI but candidate differs | Evidence is exact-candidate, route-state and timestamp scoped. Historical acceptance cannot certify new main. Full discovered route inventory, authenticated admin, five complete QA passes, backend/API health and accessibility before Production | BLOCKED |
| E542-07 P1 | Catalog lists v2026.10 sovereign macro document above `PROJECT_PLAN`, conflicting with documentation policy | Catalog must identify policy-defined authority and treat all other macro/sovereign docs as subordinate and unverified snapshots | DOCUMENTATION IN PROGRESS |
| E542-08 P1 | Web/main post-v530 includes v170 lottery/lending, admin controls, v175/176 SEO/UI/i18n; planning still v530 | Record source-vs-authority drift, adopt only risk containment and reconciliation—not automatic launch approval. Produce feature-by-feature API/DB/QA ledger | PLANNING |
| E542-09 P1 | 2026-09 Android old app guide contains PostgreSQL 16/casino 7 games and older auth assumptions | Android policy already says HISTORICAL. Use web plan + exact current API schema for new app behavior; require app SHA/backend SHA pair and authenticated session smoke | EVIDENCE STALE |
| E542-10 P1 | SEO candidates (~10,473) are unvalidated; later commits add calculator pages; GSC sitemap v541 is separate from indexing truth | Rebuild URL/indexability + conversion inventory at exact source. No claim that submit means indexed; observe Search Console/Search Advisor and ad RPM; no scaled thin pages | PLANNING |
| E542-11 P0 gate | v511 claims backup restore/session/CI accepted; older plan records unresolved gates; current Debian access denied | Latest independent restore drill, rollback/migration checksum, auth/session/ledger reconciliation, published Test/Production exact SHA are mandatory. Do not carry historical green forward | EVIDENCE BLOCKED |
| E542-12 P1 | Real WLD tickets/monetary rewards and “guaranteed return” copy may conflict with non-gambling and consumer safety | Legal/age/country release approval, no-cashout and ad exclusion must precede runtime enablement; misleading guaranteed financial benefit language must be removed from live UX | BLOCKED |

## 3. Safe treasury and finance math

1. **Supply:** `delta(M_total) = certified_mint - certified_retirement`. Treasury receipts/distributions change owners only. A burn pool or transfer to `VAULT_MAIN` does not burn supply.
2. **Fiscal cash:** `available_cash = liquid_cash - protected_reserves - committed_obligations` with nonnegative floor. A 25M reserve is a *target* pending funding evidence; a 30% floor is a *policy constraint* only for a specifically defined reserve base. Claims for refunds, bond principal, coupon and welfare may require a priority schedule and liquidity stress mode.
3. **Budget:** `allocated_total = welfare_40 + infra_30 + emergency_20 + burn_10` only if base surplus and policy approvals are defined. Each downstream program is drawn from its allocated envelope. A permanent retirement requires a certified retirement posting.
4. **Rates:** `simple_coupon = principal * annual_rate * elapsed_real_seconds / real_seconds_per_game_year` only after the time conversion, compounding, currency-precision and settlement snapshots are explicitly approved. No blanket guarantees of revenue or principal.
5. **Taylor policy:** currently shown rate is an illustrative client calculation with fixed example inflation/output gap, not current observed rates. Operational policy changes require reviewed server APIs, actor and step-up checks, exact policy version, cap/range, durable audit, conflict/rollback rules and affected-loan impact tests.

## 4. Release and documentation contract

- New/dangerous financial feature may not be represented as working by a UI success toast or by existence of a SQL table.
- Each implementation row needs `requirement ID / current authority / code path / API / migration / owner / source SHA / candidate SHA / Test evidence / Production evidence / feature switch / rollback`.
- Security negative tests: ordinary user forbidden; CSRF mismatch forbidden; missing step-up forbidden; client replay/concurrent draw forbidden; ledger invariants preserved; lottery disabled for unsupported countries/ages; disconnected UI never implies success.
- Accessibility/UI: KO first for product, EN/JA/ZH parity on published locales; ≥44px key mobile controls and 320px reflow; all authenticated admin screens included in five exact-SHA route QA passes.
- No Test/backend/Production/real-DB assertions were made in this GitHub-only change. Approval sequence: isolated branch → local checks/CI → exact candidate Test with backend, session, DB reconciliation and full UI QA → merge refreshed main → exact merged SHA re-test → zero-downtime Production promotion → post-promotion release identity and rollback verification.
- Source changes after the start SHA require a new mid-work `main` fetch, merge-conflict review and revalidated acceptance.

## 5. Change record

Start baseline `545e8231f8b90b543ed9de0722adf98d63587820`; mid-work `545e8231f8b90b543ed9de0722adf98d63587820` at first recheck (no drift then). GitHub connector access OK; Debian terminal tool quota and Moneyverse MCP authentication block live diagnostics. Implementation scope: eliminate counterfeit browser-only success and add UI test; finance redesign, lotto safety, bond math, full route QA, Android and SEO tracking remain pending separate, approved work.
