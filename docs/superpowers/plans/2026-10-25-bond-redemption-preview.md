# A0625 — Verified Virtual Bond Redemption Preview (P1, DRAFT)

## Scope and evidence
- Baseline: remote main c9a868b1e622341e2daa8b936ddf0988eda9988e, 112 branches/108 open PRs at start; read AGENTS, README, canonical EN/KO project/integrated plans, QA and all PR titles. Existing Draft #1201 shows maturity overview but no per-bond redemption preview. Separate from B settlement security and C UI workflows.
- Member feature: from a held virtual bank bond open a private read-only preview showing principal, contractual payout, server-reported maturity, exact hypothetical post-payout cash and no-payment/no-guarantee disclaimer. Never settle, mutate ledger, or migrate DB.
- Auth: Nest Session/Authenticated/Consent guards; actor from server session; owner bond ONLY via existing bank_get_my_standing(actor) SECURITY DEFINER. Foreign/missing bond => same 404. Malformed DB => 503; invalid UUID => 400. private/no-store, noindex.
- Android: existing app-api banking GET proxy; regression proves cookies, no-store and route parity.

## TDD tasks
1. Write backend tests: mature/immature, huge numeric precision, foreign 404, corrupt DB 503, UUID and guards; observe RED.
2. Implement pure quote projection and repository+controller endpoint; observe GREEN/refactor.
3. Write frontend component/page and Android gateway regression tests (RED), implement accessible `/bank/bonds/redeem-preview?bondId=` and bond-list links; observe GREEN.
4. Run focused/full build/lint/typecheck/unit/integration/security/SEO/a11y/app-api/real-PG gates; recheck main and mutable plan mid-run and pre-merge. No PASS evidence => Draft/HOLD.
5. Record SHA, branch/PR audit, Test read-only rollback, Production untouched, no branch deletion.

## Rollback
Code-only read endpoint and UI link; revert reviewed commit if needed. No schema, ledger, balances or Production mutation. Release OFF until official exact-SHA Test/GitOps approval.
