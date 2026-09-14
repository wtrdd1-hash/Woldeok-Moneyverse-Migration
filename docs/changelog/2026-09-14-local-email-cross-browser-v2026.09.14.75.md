# v2026.09.14.75 — Cross-browser email verification

- Fix registration verification when an email link is opened outside the app cookie jar.
- Email verification now uses the 30-minute single-use bearer token and does not require the original prelogin cookie/CSRF.
- The server still derives policy/age consent from the original registration session.
- Successful verification consumes the token and replay remains rejected.
