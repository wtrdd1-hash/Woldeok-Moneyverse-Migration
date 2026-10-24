# P1 Owner-verified virtual loan detail (A1923)

Baseline: origin/main 49788d09494fed3e463651945b83386e87dd47bc; feature is not in main; PR #1150 lists loans but is unmerged. Scope is a distinct detail view, not loan history/status filters. No new financial mutation or migration.

1. RED: service test owner-only ID selection, exact 38-digit WLD, foreign/unknown not-found, missing read function fail-closed. Add controller route-mount test and Android proxy contract test.
2. GREEN: `WalletService.loanById(actor, id)` reads only `public.bank_my_loans(actor)` via existing repository, validates ID and returns null for foreign/unknown. Controller GET `/api/v1/bank/loans/:id` under existing session/auth/consent/CSRF guards returns 404 for unknown and 503 for missing read.
3. Web: private `/bank/loans/[id]` page renders server-confirmed principal, interest, outstanding, status and timestamps without Number coercion, provides link to existing repayment form. Link each wallet loan to detail. `robots noindex`, force dynamic. Distinguish missing loan (404) from upstream outage.
4. Android: generic app-api gateway already allows bank; test owner endpoint forwarding with private no-store and no client identity override. Add contract route-map and real PG negative read test.
5. Recheck latest main and integrated plans mid/pre-integration. Run focused tests, lint, typecheck, build, unit, DB read-only, audit, CI. Draft PR only while any gate fails. Never deploy or mutate production-linked DB.
