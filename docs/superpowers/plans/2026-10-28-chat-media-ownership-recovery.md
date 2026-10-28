# Chat media ownership recovery — A1325
Status: DRAFT / RELEASE HOLD. This plan is the implementation checkpoint for the previously closed, unmerged PR #1621, not a claim of Production remediation.

1. Inspect the latest main, authoritative English/Korean planning, QA and prior PR. Recover the exact missing owner/recipient controls while preserving all other contributors' work.
2. Use a fresh isolated worktree from main a28bed9aa40ff74d492824ae12892a7d52132fdd. Write failing HTTP/repository/Android tests first, confirm RED, then implement.
3. Register uploads in a private PostgreSQL table and verify reads before reading bytes. Reject forged pasted keys, unrelated users, and unregistered legacy keys. Require live administrator console sessions for support-operator access. Fail closed and clean up newly written files when registration fails.
4. Add only migration 291. Migration 286 on current main is privacy-request-returning-binding and must never be overwritten. Apply 291 only in an isolated PostgreSQL 17.11 container as the migration owner. Revoke PUBLIC and app table access, grant only function EXECUTE.
5. Preserve existing chat and privacy cache protections. Add Android private/no-store/noindex tests and noindex response handling without replacing current main gateway code.
6. Run focused, complete and exact-commit gates. Do not merge, apply shared DB migrations or deploy without all mandatory gates, including authenticated Test E2E and a verified legacy-media transition.

Known blockers: baseline admin-blog UI/test mismatch; existing database actor-spoof/least-privilege P0 #993; unverified legacy media provenance; official Test exact-SHA and GitOps release gate. Preserve 352 P0 incident recovery refs and all other PRs.
