# v2026.09.15.114 — Hourly integrated planning evidence

## Baseline and mid-run main re-check
- Start/mid-run main: `d3acd3490dd6d6401539fac6442d4a4f49cab144` (PR #332 merged: authoritative Work quota visibility).
- The integrated plans still declare `v2026.09.15.110` and describe PR #332 as open / not merged. This is now stale evidence and must not be used as current release truth.
- `main` has no combined commit statuses returned for the merge commit; absence is `verification unavailable`, not CI pass.
- Open recovery/release issues remain #139 (independent backup unavailable), #127 (required checks not enforced), #126 (legacy deployment workflow mismatch), #129 (supply-chain hardening).

## Fresh external references reviewed
1. OWASP Top 10:2025, especially A01 Broken Access Control, A03 Software Supply Chain Failures, A07 Authentication Failures, A09 Security Logging and Alerting Failures and A10 Exceptional Conditions. Decision: DIRECT ADOPT for release/security gates; session rotation/revocation, MFA for sensitive admin paths, brute-force/credential-stuffing controls, aud/iss/scope validation and fail-closed exceptional-condition handling remain mandatory.
2. Google Play service-fee documentation current on 2026-09-15. Decision: REFERENCE/HYPOTHESIS ONLY for future Android monetization. Fee assumptions must be parameterized by market/install cohort/program/billing route; do not hard-code a universal 15% or 30% margin assumption.

## Delta planning
### QA-104-01 Work quota contract — state transition
Status changes from `IN PROGRESS / PR open` to `MAIN_INTEGRATED / Production unverified`. Code on main now renders server-authoritative `taken_today / daily_limit`. This does not close the issue: exact-main-SHA isolated Test, authoritative API/DB quota behavior, concurrency/idempotency, Seoul-day boundary, guide/mobile copy parity, accessibility and Production smoke remain required. Production copy claiming unlimited full rewards remains a release/content blocker until runtime evidence proves correction.

### REL-110-01 candidate lineage — redesign after merge
The prior candidate-specific blocker must be generalized into a permanent release invariant. A merged application commit is not proof that Test or Production serves that SHA. Required evidence chain remains `source SHA → CI → immutable image digest/provenance → GitOps desired revision → Flux applied revision → Deployment/Pod digest → Service/Ingress endpoint → public /api/version → exact-runtime QA`. Any mismatch is P0 fail-closed. PR #335's routing fix is useful code history, but current public exact-SHA evidence was not available in this run, so no runtime-success claim is made.

### REL-104-03 required checks — severity retained P1, release guardrail strengthened
Because the current main merge commit returned no combined statuses and issue #127 records required checks as unenforced, runtime-path changes must not treat mergeability as verification. Acceptance: repository rules require the canonical CI check from the expected GitHub App/source, strict/up-to-date semantics for runtime paths, force-push/delete disabled, and a documented emergency bypass with post-event audit. Docs-only automation may remain narrowly scoped but cannot mutate runtime/deploy/security paths through that bypass.

### BAK-106-01 recovery economics
Keep P0. No schema/data-changing Production promotion until a current independent encrypted backup is restored in isolation and ledger/balance/entitlement invariants reconcile. Business value is avoided expected loss, not direct revenue. Track `backup_age`, `restore_last_success`, measured RPO/RTO, restore duration, reconciliation failures and backup alert delivery. Kill gate: any missing/stale recovery evidence blocks destructive migration.

### Monetization/unit-economics contract
For future real-money Android products, model fee rate as an input dimension rather than a constant: market, new/existing install cohort, recurring/non-recurring, program eligibility, billing route, tax and refund assumptions. Each SKU/subscription scenario must calculate gross revenue → platform/billing fees → tax/refund allowance → direct infra/support/fraud cost → contribution margin. Unknown conversion/ARPPU/churn values remain HYPOTHESIS/TEST TARGET. Scale only when contribution margin is positive without worsening D7/D30, refund/fraud/support or fairness guardrails.

## SEO/backend planning delta
No public SEO page may derive indexability from authentication state alone. Public read models must be server-renderable and stable; account/auth/admin/transaction pages force `noindex` and sitemap exclusion. Canonical/sitemap/lastModified must come from server-owned metadata and permanent redirect history. Release QA couples public page status, canonical, robots, sitemap membership and structured-data validity to the exact deployed SHA; stale cache cannot preserve a contradictory index state after a privacy/visibility change.

## Security delta
Authentication/session release tests now explicitly require: login session-ID rotation; logout/revocation; idle+absolute expiry; generic unknown-user/wrong-password errors; credential-stuffing throttling without easy account-lockout DoS; MFA/reauth for sensitive admin actions; JWT/OIDC `iss`/`aud`/scope validation; secret-safe auth logs. Fail any Production promotion where these changed paths lack negative tests.

## Integration status
The authoritative EN/KO integrated plan files were read before planning and main was re-checked mid-run. Their embedded version/state is stale versus current main. The GitHub connector returned those large files as truncated single payloads, so replacing either whole file would risk destructive truncation. Therefore this cycle records the complete evidence delta here and marks direct PROJECT_PLAN integration `BLOCKED_BY_SAFE_WRITE_CAPABILITY`; no false claim of synchronization is made. Next safe writer must merge this delta into both plans atomically and advance the integrated version only after re-reading current main.
