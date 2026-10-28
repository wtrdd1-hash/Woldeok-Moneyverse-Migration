# v614 — Bond subscription ledger containment plan

## Source and risk
The member `POST /api/v1/bonds/subscribe` coerces `units` with `Number()` and calls a repository that directly updates `account_balances`, the treasury vault, and bond holdings, without an `economy_post_transaction` balanced posting or an idempotency receipt. Repeated requests can debit more than once. No production financial execution is authorized by this plan.

## Tasks (TDD)
1. Add an HTTP regression that authenticated subscription returns 503 without calling the service, for normal, replayed and malformed units. Preserve read-only bond market/holdings.
2. Add service and repository regression tests that reject subscriptions before DB access, outbox/Discord effects or member balance mutations. Run RED.
3. Implement fail-closed HTTP/service/repository containment and add CSRF/consent guard to the POST declaration. Remove unsafe direct-debit subscription implementation rather than retaining a callable alternate path. Run GREEN.
4. Run focused tests, backend package suite, DB suite, lint/typecheck/build, security audit, API contract, CI; inspect current main and plans mid-run. Do not merge without full exact-SHA Test and release gates.

## Follow-up
A future separately reviewed SQL migration must implement atomic balanced postings, immutable request receipts, owner authorization, 100-way concurrency replay, strict vault funding, DB ACL, real PostgreSQL and authenticated web/Android E2E. Frontend must display the unavailable state truthfully. Other bond finance mutation paths require separate audit.
