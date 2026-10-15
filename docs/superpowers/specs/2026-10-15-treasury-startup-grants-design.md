# Treasury Startup Grant Workflow — Design Review (v2026.10.15.675)

**Status:** DESIGN / BLOCKED FOR FINANCIAL EXECUTION. English canonical; [Korean](2026-10-15-treasury-startup-grants-design.ko.md). Review required before implementation. This is not deployed functionality.

## Purpose and governing sources
The intended member outcome is a legitimate application for up to 100,000 WLD of startup funding, an auditable administrator decision, and an actual wallet receipt **only after** authoritative treasury money can be conserved. Existing member program copy specifies one review per quarter, but this is a proposal requiring confirmation against the current product authority. Primary authorities: `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, the v523 Economy Core / Treasury role specification, and the documentation policy. The 2026-10-14 v629 UI remediation deliberately failed closed instead of fabricating successful payouts.

**Observed read-only diagnosis (2026-10-15 KST):**
- GitHub origin/main: `f2bf939e53482721ee8bbf1074bd7ebf1922b13e`.
- Existing Next POST `/api/treasury/apply-grant` and `/api/admin/treasury/grants` deliberately return HTTP 503. The admin page only reads historical, local JSON applications; grant review buttons are disabled.
- A generic Nest `POST /api/v1/admin/treasury/disburse/grant` and SQL `treasury_disburse_grant` exist but are **not** the startup-application decision workflow. The v240 SQL function changes wallet projections and a vault balance without passing its payout through the Economy Core ledger postings; it must not be repurposed as proof of an atomic balanced settlement.
- Read-only database aggregate check: `system_treasury_vaults[VAULT_MAIN].balance_wld=184460884`, while `accounts[account_type=TREASURY,system_key=treasury] -> account_balances.available_amount=0`; ledger transactions 831, treasury disbursements 4. These are distinct accounting representations and **not** evidence that 184460884 WLD is available for a balanced transfer.
- Applied production migrations previously observed through 268, while main contains immutable historical 269–271. Recheck live checksum sequence and rebuild an isolated Test database before designing forward migration 272. Production ACL currently shows broad financial DML exposure in the v652 audit; work must not expand permissions.
- Existing legacy 3 JSON applications in the user's screenshot are **unverified historical records**, not authoritative applications or payment receipts.

## Design alternatives
A. Enable existing admin UI + generic grant SQL: **rejected**; user identity and settlement idempotency absent, journal and projection could drift.
B. Continue local JSON queue and patch its write lock: **rejected**; it lacks validated subject binding, replay protection, DB transaction and audit.
C. **Selected: server-authoritative grant application ledger with a separate payment gate.** A DB application state machine and authenticated review are implemented independently from funds transfer; payout remains disabled until reconciliation and security tests prove the accounting invariant.

## State, identity, and interfaces
- New, append-only forward schema for `treasury_grant_applications` with server-attested `applicant_user_id`, business name, plan, requested integer WLD amount, quarter, submission key and timestamps, status, reviewer UUID, decision reason, settlement idempotency UUID, settlement receipt reference.
- Proposed states: `PENDING_REVIEW` -> `REJECTED` or `APPROVED_AWAITING_SETTLEMENT` -> `PAID`. An authorized approval is **not** a payment; a failed/paused settlement does not fabricate `PAID`.
- Submission: only authenticated, consented, active user may apply; actor UUID comes from Nest session, never the request body. Validate name/plan length and safe amount as decimal digits without JS Number precision loss. Proposed policy: max 100,000 WLD and one pending/approved application per user per quarter, to be ratified before enablement.
- Review: admin operator + elevated reauthentication session + CSRF, administrator identity from server session. Reject self-approval; audited reason required; concurrent/replayed decisions must have one deterministic winner, not overwrite history. Never accept a target user ID or a payout amount from the review request; use stored application fields.
- Read models: private applicant list and privileged admin queue from purpose-scoped PostgreSQL `SECURITY DEFINER` functions with bound actor checks. Legacy JSON records are quarantined historical references; **no automatic upgrade** of legacy applicant IDs to verified UUIDs.
- Next same-origin API handlers call guarded Nest endpoints via existing server-only transport; member and administrator screens show accurate states, failure codes and receipt links. English canonical UI keys and Korean localization follow the project locale contract.

## Financial invariants and controls
- Feature switches default CLOSED: `startup_grant_submissions`, `startup_grant_reviews`, `startup_grant_settlement` are independently controlled. Until the required deployment gates pass, payment routes return 503 and never mutate money.
- `VAULT_MAIN` and the Economy Core `TREASURY` account must be reconciled from authoritative **source documents and posting history**, not by copying 184460884 into `account_balances`. Unknown divergence is a hard settlement stop; distinguish monetary issuance, internal fiscal earmarks, liabilities and actual cash before correction.
- Upon readiness, a single server-authorized PostgreSQL transaction locks the application, vault and funding/recipient account records in deterministic order; checks role/session authorization, current policy switch, pending liabilities, sufficient proven spendable treasury funds and a reserve floor (at least max[100,000 WLD, 30% of the policy-defined gross base]); posts equal debit and credit through the authoritative ledger primitive, commits status+idempotency+outbox+audit+vault projection together, and returns an immutable receipt. Posting direction semantics must be empirically tested; current Economy Core uses 'credit' to decrement and 'debit' to increment balances despite common naming conventions.
- No issuance, direct balance UPDATE, bypass grant, or user-funded double spend; no silent payment retry with a new key. On retries and concurrent approvals use the same durable application-linked key, return the original receipt only if its payload agrees.
- Role grants are EXECUTE on narrowly scoped functions. Explicitly REVOKE PUBLIC EXECUTE; no broad table DML to `moneyverse_app`. Signed actor/session and privilege negatives are mandatory.
- Record both decision and settlement audit (actor, target, reason, state, source policy, linked ledger transaction) with restricted read access; redact member personal content from log output.

## Implementation stages and exact acceptance
1. **G0 data-provenance gate:** inventory running Test/Production source and applied migrations; read-only account/vault/ledger reconciliation, ACL and existing SQL function behavior on restored isolated Test. Identify 184460884 vs 0 divergence provenance; do not patch balances to make tests green.
2. **G1 application intake:** dedicated immutable forward migration (number > current maximum, allocated only after refreshing origin/main), actor-checked database functions, backend controller/service/repository, Next proxy, frontend submit/status UI and tests. No payout side effect.
3. **G2 administrator review:** elevated role/CSRF authorization, rejected vs approved-awaiting states, reason history and conflicts, private queue, legacy history explicitly separated; tests for anonymous, forged user ID, self-review, concurrency and replay.
4. **G3 settlement:** first resolve G0 and production ACL. Implement and validate balanced posting, protected floor and duplicate-key ledger receipt in restored Test; failure cases (short funds, unknown vault/account, race, rollback, retry, audit failure) commit no partial changes.
5. **G4 release:** clean exact-SHA CI, database migration parity and restore, real Test frontend+backend+database+session checks, authorization and mobile 320–430px regression, external version proof; reconcile with refreshed origin/main, PR review, documented snapshot/reversible zero-downtime production promotion, production ledger/session/receipt verification. If any gate fails, remain BLOCKED. Never promote a docs-only PR as a runtime release.

## Design decisions requiring sign-off
- Confirm 100,000 WLD maximum and one application per member per quarter, including policy on rejected reapplication.
- Confirm whether admin approval should automatically disburse *after* G3 or require a distinct settlement authorization (recommended: distinct while reconciliation is unresolved).
- Confirm authoritative reserve numerator and fiscal liabilities under the newer 85% liquidity / 30% reserve documents. In any ambiguity payment fails closed.

This spec **does not** declare implementation, Test, money movement or Production success.
