# A0751 implementation plan
1. Create failing backend tests for owner-derived actor, 100/101 boundary and database unavailability; frontend CSV tests for auth, malformed rows, formula injection, privacy headers; Android path/contract checks.
2. Add read-only backend service/controller archive snapshot using a single owner-filtered 101-row SQL query; reject overflow.
3. Add Next.js CSV route and accessible account CTA; no partial or false success.
4. Refresh mobile contract from generator; run focused and full gates, real isolated PG if available; log exact SHA, CI and blocked release conditions.
