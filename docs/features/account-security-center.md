# Account Security Center

Status: integration candidate `v2026.09.13.24`.

The signed-in member can review active sessions and terminate sessions they no longer use. This slice reuses the existing authoritative `auth_sessions` table and introduces no database migration.

## Runtime contract

- `GET /api/v1/account/security/sessions` returns only minimal member-visible session metadata.
- `DELETE /api/v1/account/security/sessions/{id}` revokes one other active session owned by the caller.
- `POST /api/v1/account/security/sessions/revoke-others` revokes all other active sessions owned by the caller.
- The current session is excluded by SQL.
- Session revocation requires authenticated consented session state, CSRF protection, and recent reauthentication.
- Session tokens, hashes, OAuth subjects, raw network metadata, and unrestricted request metadata are never exposed.

## Frontend

`/account/security` is authenticated, dynamic, and `noindex`. It shows current/other sessions, expiry and reauthentication timestamps, individual/all-other revocation controls, and the existing OAuth reauthentication entry points.

## Release gate

Full repository CI must pass on the exact head. Then the exact candidate SHA must be deployed to isolated Test and verified for current-session protection, revoke-one, revoke-all-others, reauthentication expiry, revoked-session denial, backend/API health, logs, and rollback readiness before Production promotion.
