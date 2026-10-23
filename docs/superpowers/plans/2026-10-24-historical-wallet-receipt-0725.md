# Plan: historical owner-verified WLD receipt

Status: bounded implementation authorized by the recurring development directive; release acceptance is separate.

## Design and trade-offs
- User job: paste a transaction UUID from an older receipt and verify the **owner's committed** WLD postings, even when not in the latest 50. Never imply refund, transfer reversal or legal banking proof.
- Extend existing wallet/activity/:transactionId draft #1049 semantics but use an owner-scoped single-transaction read, not an unbounded scan. Return the same 404 for foreign/nonexistent/malformed identifiers; no counterparty details.
- Prefer a new forward-only PostgreSQL SECURITY DEFINER read function and EXECUTE-only grant, not broad table SELECT. Do not apply to production or mutate existing migration bytes. Test migration transactionally in isolated DEV session if feasible; otherwise BLOCKED.
- Server returns exact canonical signed WLD strings for net/cash/bank, a stable CONFIRMED receipt with ALL_POSTED history scope, and `private, no-store`.
- Web authenticated activity view links receipt and accepts an old UUID for lookup. Android app-api forwards the owner session and private cache header.
- Out of scope: dispute case creation, P2P replay fix (#1025), financial corrections, account balance mutation, automatic release. Those remain independently gated.

## Tasks and acceptance
1. Add unit and controller tests first; observe RED for missing historical read and owner isolation. Add DB integration checks with foreign/old/zero-net/large amounts.
2. Add migration 280 owner-scoped receipt function and repository/service/controller. Confirm strict input validation and exact amount invariants.
3. Add private web detail/lookup and Android gateway tests. Confirm user-visible retrieval and honest unavailable states.
4. Run focused + complete build/lint/typecheck/unit/integration/security/a11y/SEO/API/E2E/real PostgreSQL where possible. Record exact SHA, failures and skipped tests. Never claim unrun gates passed.
5. Re-fetch main and current plan, inspect open PR/CI and conflicts, push isolated Draft PR, keep release hold until every required gate is independently proven.
