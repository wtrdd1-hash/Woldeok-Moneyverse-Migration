# Account security events v2026.09.19.282

- Add a member-facing recent security activity list to `/account/security`.
- Expose only event category and timestamp; internal metadata remains private.
- Add least-privilege DB read function `account_recent_security_events` and App API `GET /account/security/events`.
- Keep the list bounded to 20 newest events and synchronize the App API contract/reference.
