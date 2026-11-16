# v2026.11.17.4 — Discord OAuth routing repair

- **Fix:** preserve existing Node ownership of Discord and Google OAuth authorize/callback while Spring migration is active.
- **Security:** strictly constrained internal route match, no authorization bypass, private/no-store/noindex, do not access-log provider one-time codes.
- **Regression:** Python route coverage and isolated Nginx canary; no financial or schema changes.
- **Deployment:** versioned Nginx snippet inside private gateway port 4400; test and production evidence in the matching worklog. Never interpret this config-only change as a new application build SHA.
- **Multi-host:** canonicalize `www` OAuth starts before creating host-only session cookies; all callbacks and other pages retain existing behavior. Isolated public-edge canary and total 9/9 Python tests pass.
