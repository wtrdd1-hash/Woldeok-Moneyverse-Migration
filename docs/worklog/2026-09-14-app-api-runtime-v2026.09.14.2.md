# Worklog — App API Runtime v2026.09.14.2

Priority: native app API / Google Play release blocker.

Verified before change: Production was serving an older SHA; `/account-deletion` and `/data-deletion` returned 404 there although the routes exist on current main. Registration 503 traced to missing SMTP runtime configuration and unavailable legacy mail service. A loopback-only relay was built and health-checked. OAuth v2026.09.14.1 was CI-gated and merged first.

Validation gates: backend unit/E2E, frontend typecheck/tests/build, database CI, exact candidate SHA Test, then Production version/API/deletion-page smoke. No database or secret material is committed.
