# Local password recovery — v2026.09.19.266

## English (canonical)
Local-email members can now recover a forgotten password end to end. `/forgot-password` always returns the same acknowledgement to prevent account enumeration. Existing accounts receive a 30-minute, one-time reset link; consuming it replaces the Argon2id verifier, records security events, and revokes every active session for that member. `/reset-password` and the login recovery link complete the browser flow. The App API exposes the same request/complete endpoints; no client can select a user id or bypass the reset token.

Production promotion requires migration 209, exact-SHA CI, real-PostgreSQL replay/expiry/session-revocation tests, isolated Test email delivery, and the normal GitOps gate. Rollback must not restore an old password verifier or resurrect revoked sessions.
