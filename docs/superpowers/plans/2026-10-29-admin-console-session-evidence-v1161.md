# C v1161 implementation plan — fail-closed administrator console session receipts

## Design brief and decision
The operator needs proof that a console session was actually rotated into the browser, and that closing the console actually cleared its browser credential. The backend is authoritative; HTTP 200/204 alone is insufficient. Reuse existing `apiWithCookie`, `relaySetCookie`, admin CSRF and policy guards; never introduce client-side secrets or DB grants. A malformed/missing receipt must return a safe ActionState error, not a success. A rotated cookie is accepted only for the backend's canonical `mv_session` / `__Host-mv_session` names with secure host-prefix attributes, HttpOnly, Path=/, SameSite=Lax and positive lifetime; a deletion cookie must be empty with Max-Age=0. Never echo cookie content in logs. Validate before relaying, so no partial invalid-cookie side effects. This is a bounded source-level fix; no new endpoints or schema.

## Task 1: RED tests
- Create `frontend/src/app/admin/console-session-receipt.test.ts` with valid/invalid cookie and open body cases; run Vitest and capture failures.
- Create `frontend/src/app/admin/console-session-actions.test.ts` with mocked server action dependencies, asserting malformed receipts fail closed and verified ones succeed; capture RED.

## Task 2: GREEN implementation
- Create `frontend/src/app/admin/console-session-receipt.ts` as a pure parser of backend contract and cookie headers.
- Update only `openConsole` and `closeConsole` in `frontend/src/app/admin/security-actions.ts`, validating before `relaySetCookie` and before reporting success.
- Preserve existing Korean copy on success; error copy should not disclose session secrets.

## Task 3: verification and handoff
- Focused tests, root lint/typecheck/test/build, app-api contract, dependency audits, backend contract and isolated PostgreSQL. Confirm exact SHA, rerun after any fix. Check mobile, keyboard, ActionAlert and noindex regressions.
- Re-fetch main midway and before merge; do not merge if security audit or official exact-SHA authenticated Test gate is blocked.
- English canonical/Korean auxiliary worklogs and internal/GitHub updates, Draft/HOLD PR, preserve other worktrees and branches.
