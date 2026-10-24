# Verified Game Credit Policy Disclosure — bounded implementation design

## Goal and evidence
A signed-in member needs a truthful view of the *current virtual bank policy* (grade, borrowing limit, APR, term and minimum repayment), including whether an active loan already exists. The bank page currently calls `/api/v1/banking/credit-rating`, whose `getCreditFacts` directly SELECTs four restricted tables. Isolated PostgreSQL ACL inspection confirms `moneyverse_app` has no SELECT on those four tables, whereas `bank_get_my_standing(uuid)` EXECUTE is granted. Do not bypass this restriction or fabricate a credit score.

## Approach and trade-offs
Use the already-applied, owner-scoped SECURITY DEFINER `bank_get_my_standing(uuid)` as the only DB authority. Add a strict read-only projection `GET /api/v1/banking/credit-policy` with an authenticated actor from the session; validate all monetary strings without Number conversion. Return grade, limit, APR bps, term days, minimum repayment, and active-loan status. `canRequestNewLoan` means no active loan and positive policy limit, NOT guaranteed approval. No migration or financial write. On invalid/missing data, fail closed (503), never display synthetic values. Surface a noindex/no-store member report `/bank/credit-policy`, and replace the bank dashboard's failing simulated-score fetch with the verified policy card/link. Android `/app-api/v1/banking/credit-policy` uses the existing allowlisted gateway and cookie session; add explicit regression.

## Non-goals and rollback
Do not modify applied migrations, app-role grants, legacy `credit-rating` route, credit algorithms, credit decisions, WLD ledger or other workers' branches. Existing legacy score endpoint remains a known issue for a later separate repair. Rollback is reverting this additive endpoint/page/dashboard card (no schema/data rollback). This candidate is HOLD until all CI/security/accessibility/SEO/isolated Test exact-SHA gates pass.
