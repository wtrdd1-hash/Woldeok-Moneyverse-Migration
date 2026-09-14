# Changelog — Mobile OAuth Prelogin Isolation v2026.09.14.71

Fixes native Google/Discord OAuth when the external browser already has an authenticated website session. Mobile OAuth now uses a dedicated anonymous prelogin session and recovers its challenge by single-use state/provider at callback. Adds regression tests and updates the canonical mobile API specification.
