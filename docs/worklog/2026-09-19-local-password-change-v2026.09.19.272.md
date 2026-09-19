# Local password change v2026.09.19.272

Authenticated local-email members can change their password from Account Security after recent reauthentication. The database keeps the current session, revokes every other active session, and records a security event. No economy/ledger path is changed. Promotion remains blocked until exact-head CI and isolated Test are green.
