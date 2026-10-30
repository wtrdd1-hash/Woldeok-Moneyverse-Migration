# Account Security Center

Status: runtime candidate `v2026.09.13.5`.

The signed-in member can review active sessions and terminate sessions they no longer use. The first slice deliberately reuses the existing `auth_sessions` authority and adds no database migration.

## Read model

`GET /api/v1/account/security/sessions` returns only session metadata needed by the member: opaque session id, creation/expiry time, most recent reauthentication time, whether the row is the current session, and whether it has been used as an administrator console session.

Session tokens, token hashes, CSRF values/hashes, OAuth subjects, network addresses, and unrestricted request metadata are never returned.

## Session termination

- `DELETE /api/v1/account/security/sessions/{id}` terminates one other active session owned by the caller.
- `POST /api/v1/account/security/sessions/revoke-others` terminates every other active session owned by the caller.
- The current session is excluded in SQL and cannot be terminated by these operations.
- Both mutations require the existing session, current consent, CSRF validation, and recent reauthentication.

## Frontend

`/account/security` is authenticated, dynamic, and `noindex`. It shows active-session timestamps, highlights the current session, provides per-session and all-other-session termination controls, and exposes the existing OAuth reauthentication flow before sensitive actions.

## Release gate

The feature must pass repository CI and exact-SHA isolated Test verification before main integration or Production promotion. Test verification should cover current-session protection, another-session revocation, revoke-all-others behavior, reauthentication expiry, and post-revocation access denial.

## Recent security activity category filter (P1 candidate, release HOLD)

The member-only `GET /api/v1/account/security/events` supports optional `category=all|login|settings` (default `all`). The existing `account_recent_security_events(actor,20)` SECURITY DEFINER function remains the owner authority. Filtering happens **after** the most recent 20 owner events; this is not full-history search. `login` includes successful local logins; `settings` includes known local password/email request and change events. Other and future event types remain visible under `all` only. Invalid, duplicate, or non-string categories return 400. Only event type and timestamp are returned; no IP, token, or raw audit metadata. No new SQL migration or app-role grant.

`/account/security?category=login|settings` exposes keyboard-accessible filter links, a selected state and a distinct invalid/unavailable state. The existing CSV link explicitly exports **all** recent 20 events regardless of the selected filter. The Android `/app-api/v1/account/security/events` gateway preserves category and owner session, rejects malformed or mismatched successful responses, and forces `private, no-store` and `noindex`. This is an unmerged candidate: no official Test or Production availability claim.
