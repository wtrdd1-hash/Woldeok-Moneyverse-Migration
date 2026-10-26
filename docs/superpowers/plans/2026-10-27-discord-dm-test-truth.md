# Implementation plan: test-only Discord DM semantics
1. RED: add controller tests that exercise all allowed presets, unknown preset refusal, and ensure no operational alarm helper is invoked. Add frontend contract assertions for absent configuration and disabled send.
2. GREEN: use an explicit label/description mapping for simulated events and only `sendAdminDirectMessage` transport; do not invoke real alarm helpers. Reject malformed preset input with HTTP 400.
3. GREEN: render configured state strictly from server response and disable test action when unconfigured; correct success copy and touch targets.
4. Verify: focused tests, full frontend/backend tests, lint/typecheck/build, app-api contract, isolated real PostgreSQL, security audit, GitHub CI and candidate build. Re-fetch main and project plan; only merge/deploy on full gates including exact-SHA Test and release policy.
