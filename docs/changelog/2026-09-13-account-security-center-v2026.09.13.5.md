# v2026.09.13.5 — Account Security Center candidate

- Added a signed-in Account Security Center at `/account/security`.
- Added active-session review using the existing authoritative `auth_sessions` data.
- Added one-session and all-other-session termination while protecting the current session in SQL.
- Session termination requires CSRF validation and recent OAuth reauthentication.
- The read model never exposes session tokens, token/CSRF hashes, OAuth subjects, or unrestricted request metadata.
- Added member navigation and English/Korean feature documentation.
- Added repository regression coverage for the session read model, current-session protection, and revoke count handling.
- Development baseline: reconciled runtime chain plus latest main at `cf423d63ebbaf8a04b5ccee02106ce62f194d572`.
- No database migration, economy mutation, or Production change is included.
- Production promotion remains blocked until CI and exact-SHA isolated Test verification succeed.
