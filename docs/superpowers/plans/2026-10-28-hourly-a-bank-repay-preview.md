# A — Read-only virtual loan repayment impact preview (2026-10-28)

## Design / accepted autonomous assumption
Planning #1639/#1640 describes a nonbinding preview. Use the existing owner-scoped `bank_get_my_standing(actor)` SQL read model, which returns cash and active loan in a single SQL call. A new migration would be unsafe while main has duplicate migration 283 and 285/286 are unmerged; this is an intentionally migration-free first implementation. It must not claim a locked quote or guarantee that repayment will succeed. The actual `bank_repay` function independently locks, checks the actor and ledger and caps payment.

## Implementation steps
1. RED tests for actor-only DB query, foreign loan, insufficient cash, huge WLD strings, DTO and no-store.
2. GREEN NestJS POST `/api/v1/banking/repay-preview` with session/consent/CSRF and strict string input; one SECDEF standing read, exact BigInt calculation, no writes.
3. Web server action + client CTA in existing loan form, accessible status and explicit nonbinding disclaimer. Android BFF generic route + bank private no-store policy.
4. Test, build, lint, security, exact SHA CI, isolated PostgreSQL, official Test and release gate. Never merge or deploy if any gate is blocked.

## Trade-offs / follow-up
- The existing SECDEF read model accepts actor UUID; session binding is enforced at HTTP boundary, not by DB role. This does not solve existing P0 app-role spoofing issue #993.
- Preview is based on a statement snapshot, not a transaction lock. Repayment can race with changes; the UI never treats the preview as authorization.
- Full official Test and real migrated-schema ACL checks remain required before release.
