# Backend B v757 — Sensitive DML release-readiness boundary (2026-11-02)

**Disposition:** Draft / RELEASE HOLD. No Production or official Test promotion is authorized by this change.

## Source and scope

- Starting `origin/main`: `6fe94aeeebbd30c996f7a9f8ddeb02f8c538505e`.
- QA v1468 observed service-connected `moneyverse_app` direct DML on sensitive identity/inventory tables and 5 applied migration checksum mismatches. This is evidence of a least-privilege defect, **not** evidence of unauthorized transactions.
- Existing Draft PR #2419 proposes the forward-only ACL repair. This PR deliberately does **not** duplicate that migration, change grants, or touch user/ledger rows.
- The existing `scripts/release/verify-financial-readiness.mjs` only queried five financial table grants. A snapshot with no evidence for `users`, `identities`, `user_consents`, `user_items`, or `audit_logs` could report `READY_FOR_OTHER_RELEASE_GATES`.

## Implemented contract

- The read-only, repeatable-read financial preflight now requests grant flags for all five additional sensitive tables.
- Missing/invalid grant evidence fails closed; direct INSERT/UPDATE/DELETE on these tables emits `direct_application_sensitive_dml:<table>` blockers. Financial owner-approved exceptions do not waive sensitive grants.
- Sensitive table names with DML appear separately in the report summary; no member identifiers or account balances are logged.
- No API route, schema, applied migration, DB grants, WLD, financial ledger, frontend, or Android flow was modified.

## Verification and release blockers

- TDD: RED 3 regressions, GREEN 21/21; summary separation RED then GREEN 22/22.
- Release CI policy suite: 152/152 PASS (intermediate code; final rerun required).
- Full backend/frontend, lint/typecheck/build, isolated PostgreSQL, GitHub CI and exact-SHA official Test: see final PR comment and task log for final disposition.
- Existing production direct DML, checksum drift, Test DB identity split, production localized HTTP 500, release provenance and independent restore remain unresolved. This gate is **not** an ACL repair or a release approval.

## Recovery

No runtime mutation occurred. Reverting the two `scripts/release/verify-financial-readiness*` code files restores the previous operator preflight behavior (not recommended while ACL drift persists). Existing deployments remain unchanged.
