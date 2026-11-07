# National Mint Operations Recovery and Feature Expansion — Detailed Specification

> Version: v2026.11.07.1772
> Status: PLANNING / P0 BLOCKED / NOT IMPLEMENTED
> Date: 2026-11-07 KST
> Canonical language: English; Korean counterpart: [NATIONAL_MINT_OPERATIONS_RECOVERY_SPEC.ko.md](NATIONAL_MINT_OPERATIONS_RECOVERY_SPEC.ko.md)
> Parent: [PROJECT_PLAN.md](PROJECT_PLAN.md) and [INTEGRATED_PLANNING_MASTER.md](INTEGRATED_PLANNING_MASTER.md)
> Incident: [#2878](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/2878); existing finance dependency [#2366](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/2366)

## 1. Problem statement, evidence, user impact

The user reports the National Mint admin functionality does not work. Their mobile screenshot shows a green “Policy DB query complete”, one approved policy command, “mint immediately available”, 20-second auto-refresh, and Mint, Permanently Retire, Emergency Freeze buttons. These labels **do not establish an executed ledger posting**. The screenshot is an incident report; no authenticated POST result or production transaction receipt has been captured in this cycle.

Source facts inspected 2026-11-07: the old /api/v1/mint/batches and /burn POST endpoints intentionally fail-closed with LEGACY_MONETARY_AUTHORITY_UNVERIFIED. Its old MintService contains illustrative in-memory batches; they are never certified production funds. The separate /api/v1/admin/economy/monetary path supports approvals, guarded policy capacity update, mint/retirement certificate rows and freeze. Its mint-bureau.service.ts uses a single SQL CTE to reserve order capacity and insert certificates, but **does not in that SQL settle a certified canonical two-sided journal or credit/debit the intended WLD accounts**. A successful certificate cannot be labeled an issued or retired amount. New BFF and UI code exists in a shared **dirty worktree**, and may not be deployed; no claims about Test/Production activation. The BFF certificates route currently catches each source failure and substitutes an empty array, which can hide outages; read success is not proof of certified zero.

**Customer impact**: admin cannot reliably determine whether issuance/retirement was executed, citizens may see no real balance change, and a false success/ready label risks bad policy action. Do not replay or reset historic records to make numbers match. Never treat system process health as financial integrity evidence.

## 2. Authority and non-negotiable invariants

Adopt the existing separation in CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC: Central Bank authors policy; Mint executes approved orders only; Treasury spends existing WLD; Economy Integrity Core owns double-entry settlement. One **atomic database commit** must bind policy reservation, account postings, immutable settlement receipt, certificate and outbox event. If any step fails, **all** steps roll back. A certificate-only row is UNVERIFIED, not money.

Supply delta = certified issuance - certified retirement. Ordinary transfers, Treasury spending, taxes, pension payouts and SWF movements conserve total supply. Journal debits and credits balance **per currency, per transaction**, and account-balance materializations agree with journal. Starting balances plus postings equal closing balances; zero undocumented negative spendable balances; no WLD lost, duplicated or synthesized on retry. Canonical monetary values are nonnegative integer strings, checked using database numeric/BigInt, not JS Number. A monetary source envelope needs an independently evidenced and approved economic basis. Never mint from a simple zero Treasury account unless a separately authorized mint policy, full journal and recipient provenance prove new supply.

Historical SQL migrations are immutable. New schema must use a forward-only coordinated migration, independent restored PostgreSQL 17, least-privilege EXECUTE-only internal SECURITY DEFINER functions with fixed search_path, explicit session-bound actor, row locks, deterministic lock order and rate limits. No publicly callable finance core mutation API; admin BFF can only invoke guarded backend orchestration; revoke raw app role DML.

## 3. Feature expansion backlog (proposed, not delivered)

| ID | Priority | Feature | User flow and data authority | Acceptance |
| --- | --- | --- | --- | --- |
| MINT-01 | P0 | Truthful operational status | Distinguish policy-read, approved order, preflight pass, journal commit, balance projection, certificate and reconciliation | Never claim ready/issued from read or approval alone |
| MINT-02 | P0 | Policy order command center | List/filter approved, pending, executed, frozen, expired and rejected orders with amount remaining, validity and author/approver audit | 401/403/503 distinct; no false count |
| MINT-03 | P0 | Two-person policy approval | Proposer and final approver must be distinct qualified admins; signed scope, expiry, reason and risk-bound ceilings | Self-approval/duplicate approvals blocked |
| MINT-04 | P0 | Safe mint preflight | Dry-run receipt checks exact policy, supply cap, recipient, freeze, source envelope, DB grants, debt/ledger compatibility | Preview never reserves supply or changes balances |
| MINT-05 | P0 | Canonical atomic mint | Guarded policy claim + double-entry posting + recipient credit where allowed + receipt + immutable certificate in one transaction | Idempotent same payload; collision 409; 0 phantom WLD |
| MINT-06 | P0 | Funded atomic retirement | Eligible existing WLD source locked and debited with correct MINT/SINK counter-post, immutable retirement receipt and certificate | No unfunded/negative retirement; policy required |
| MINT-07 | P0 | Honest certificate explorer | Search verified vs unverified mint/retirement receipts, document ID, hash, order and journal references, downloadable redacted audit export | Source failure never shows empty success |
| MINT-08 | P0 | Emergency freeze control | Immediate fail-closed issuance/retirement freeze, audited reason and ticket, bounded override with distinct approver; confirm backend state after mutation | No UI-only freeze; pending in-flight transactions defined |
| MINT-09 | P1 | Finance reconciliation console | Compare period-scoped certified supply, orders/certs, journals, account balances, historic quarantine and independent source totals | Exact same-snapshot mismatch classification |
| MINT-10 | P1 | User-impact & recovery ledger | Trace protected member credit/debit receipt, expected balance and Treasury/pension/market effects; read-only incident explanation for members | No personal admin leak; no invalid payout replay |
| MINT-11 | P1 | Notification and anomaly pipeline | Internal Telegram/Discord alerts only for actionable failures, freeze change, supply spike, E2E recovery or stale source | Deduplicate by incident+window, no token/PII |
| MINT-12 | P1 | Mobile operator UX | 320px layout, focused execution wizard, preview and typed confirmation, background revalidation, offline/timeout protection | WCAG 2.2 AA, 44px targets, ko/en parity |
| MINT-13 | P2 | Read-only simulation sandbox | Separate isolated synthetic scenario for monetary policy stress and supply forecasting | No production DB DML; watermarked simulation |
| MINT-14 | P2 | Integrity export & independent verifier | Public redacted aggregate proofs; staff cryptographic chain validator with date and source SHA | Does not expose user account IDs or raw secrets |

For any unverified feature, show **“Not executable: ledger settlement not certified”** rather than green “Immediately mintable”. Do not disable genuine safe read functions, and do not invent a balance from policy counters.

## 4. Precise status and user interactions

Status sequence: UNKNOWN → POLICY_READ_VERIFIED → ORDER_APPROVED → PREFLIGHT_VERIFIED → SETTLEMENT_COMMITTED → PROJECTION_RECONCILED → CERTIFICATE_VERIFIED. This is an evidence model, **not an automatic permission escalation**. A frozen, stale, failed or unsupported stage changes state to FROZEN / STALE / BLOCKED / UNVERIFIED, never to VERIFIED_EMPTY. “Can execute” requires fresh approved policy plus identity, ACL, source, amount, two-person approval and finance core preconditions.

- Dashboard tabs: Overview, Policy orders, Mint wizard, Retirement wizard, Certificates, Reconciliation, Incidents.
- Mint wizard: select approved order → validated recipient/envelope and amount → read-only preflight with exact cents/units and hash of request → distinct approver review → final typed confirmation → authenticated single POST → immutable journal/certificate proof or explicit failure. No optimistic success or automatic re-POST after timeout; query operation by idempotency key.
- Retirement wizard: select proven source WLD holdings → policy and enough unencumbered balance → preview impact by M0/supply category → two-person approval → commit and receipt. Source cannot be inferred from total Treasury funds; no arbitrary source_type.
- Freeze UX: show confirmed server state, actor, reason, time, policy revision and propagation evidence; unfreeze requires new approval and a current finance preflight.
- Certificates: results tagged PROVEN_CANONICAL / CERTIFICATE_ONLY / LEGACY_UNVERIFIED / SOURCE_UNAVAILABLE. Provide immutable timestamp, SHA256 evidence hash, journal and policy links. VERIFIED_EMPTY only on fully successful authenticated independently scoped query.
- Refresh every 20s only for bounded read models; show last successful server timestamp, current freshness window, retry and failed subsections. Do not collapse 503 into [] or 0. Cancel stale requests on session/account change; private no-store and noindex all outcomes.
- Member-facing read-only impact notice: never claim credited WLD until certified user-facing account delta and receipt are reconciled; protect individual balances and explain expected vs actual incident state.

## 5. Proposed typed API / data design (requires implementation review)

Existing endpoints are **not certified**. Proposed scoped additions are design-only:

| Operation | Method/path concept | Contract |
| --- | --- | --- |
| Snapshot | GET /api/v1/admin/mint-v2/readiness | sourceStatus, asOfUtc, policyRevision, ledgerVerified, certVerified, freeze, blockers[] |
| Orders | GET /api/v1/admin/mint-v2/orders | bounded page/cursor, order stage, remaining WLD as string, approval lineage |
| Preview | POST /api/v1/admin/mint-v2/operations/preflight | validate-only; subject-scoped capability nonce, expiresAt, decision; **no DB mutation** |
| Execute | POST /api/v1/admin/mint-v2/operations | type MINT/RETIRE, orderId, source, recipient, integer amount, UUID idempotency, preflight fingerprint |
| Operation proof | GET /api/v1/admin/mint-v2/operations/:id | committed journalTxId, balanced posting hash, account delta, certId, outcome |
| Approve | POST /api/v1/admin/mint-v2/orders/:id/approve | second distinct approver and scope revision |
| Freeze | POST /api/v1/admin/mint-v2/freeze | freezeType, reason, ticket, expiry, two-person release |
| Audit | GET /api/v1/admin/mint-v2/certificates | keyset page, verification status and redacted export reference |
| Reconcile | GET /api/v1/admin/mint-v2/reconciliation | same-snapshot supply and posting sums, mismatch taxonomy, last successful epoch |

Endpoint names and new migration numbers are **proposals**, not allocated. Preserve backward-compatible safe reads and the legacy 503 hold; switch new writes on only after full validation. Use shared response shape {status, code, evidence, requestId, asOfUtc}; all money as canonical decimal integer strings. Error distinctions: 400 malformed, 401 auth expired, 403 insufficient admin/CSRF/consent, 409 idempotency conflict or revision drift, 410 expired order/preflight, 422 unbalanced/unfunded/out-of-policy, 423 freeze, 429 rate-limited, 503 data/ledger source unavailable. Do not reveal internals to unauthorized callers.

Suggested data relationships: monetary_policy_orders → monetary_policy_approvals (two unique actors) → monetary_execution_attempts (request key+payload hash+status) → canonical economy ledger transaction and two or more journal postings → immutable mint/retirement certificate (unique operation/journal ID, hash) → outbox message → immutable audit events. Add constraints for unique idempotency by actor/scope, proof links, amount >0, ordered state transitions and ledger posting uniqueness. Atomic transaction must check historical quarantine and use DB-owned authorization; no manual row fixes or overwrite of certificates.

## 6. QA, observability and safe release

- **Source baseline:** inspect exact main at start/mid/end. Shared branch has uncommitted Mint UI/BFF changes; do not transplant or overwrite. Coordinate migration-number owner with concurrent Gemini work. Upstream v1761 SQL334-336 source merge does not establish official Test/Prod rollout.
- **Read-only baseline:** compare one consistent database snapshot across Treasury, monetary orders, Mint certificates, canonical transactions/postings, member balances and historic archive; collect counts and query IDs without PII. Do not mutate real DB for testing.
- **PG test matrix:** same idempotency repeated 10x returns identical outcome; same key changed payload 409; 100 parallel identical/different actor requests; abort after each write step; expiry/freeze during contention; two-person spoof; source funds zero; denied raw app role DML; post >2^53 WLD integer handling; journal per-currency balance; policy ceiling; no phantom WLD; certification hash tamper; SQL replay; HTTP 401/403/409/410/422/423/429/503; cert GET source error cannot become [].
- **Frontend:** 320px/200%, focus and keyboard, screen-reader stage descriptions, Korean/English parity, 20-second refresh races, slow network, stale session, duplicate tap, tab return, freezes; all actions require explicit server-confirmed outcome.
- **Acceptance gates:** all focused and full CI, PostgreSQL 17 independent backup restore, provenance/ACL, invariant comparison before/after in exact Test candidate, authenticated Test E2E with deliberately funded synthetic fixtures only, backend and frontend exact SHA, operation replay and rollback. Only then staged release via immutable build and no-downtime Nginx cutover, verify Production real evidence and member invariants. A documentation PR **must not trigger an app runtime release**.
- **Metrics:** false-verified actions = 0, unmatched monetary certificates = 0 for newly certified flows, unbalanced journal = 0, double-credit = 0, data-source failure mislabeled as empty = 0, P95 read latency under independently measured budget, audit completeness 100%. All are **targets not test results**.
- **Rollback:** flip new write feature OFF, stop new operations without interrupting existing valid transfers, preserve journal and receipts, revert immutable application release only after proving DB compatibility; no silent reset/delete.

## 7. Phased handoff / acceptance ownership

**Phase A — P0 truth and incident:** MINT-01, 02, 07 read-only truth; correlate actual routes with source SHA and Test/Production evidence; remove misleading ready status. **Phase B — protected money core:** MINT-03 through 06 and 08, ledger transaction, DB security, replay. **Phase C — operator experience:** MINT-09 through 12 and verified member status, secure alerts. **Phase D — optional:** MINT-13/14 only after P0 finance and release gates.

Named ownership by role, not by competing filesystem: Backend/DB (schema and journal), Frontend (BFF/mobile UI), QA (PG/negative E2E), Operations (Test/Prod and backup), Documentation (authority and release evidence). Do not merge another contributor's dirty worktree. An implementation PR must cite #2878 and #2366, update both-language docs, worklog and separate internal/GitHub updates with precise SHA and gates.

**Current result:** Proposal recorded only. No application feature added, no Mint operation executed, no database or account changed, no official Test E2E, no Production deployment.
