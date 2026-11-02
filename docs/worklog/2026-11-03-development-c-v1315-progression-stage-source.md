# Development C v1315 — Verified Member Growth Stage Source (DRAFT / RELEASE HOLD)

- Base: origin/main f5c3fbedae1c3b3ec2374882b049aac43a655eb4 (2026-11-03 02:00 KST).
- Scope: authenticated member /progression read. Existing Nest GET /api/v1/progression and PostgreSQL SECURITY DEFINER progression_my_status are the authority; no new SQL, financial writes, grants or session semantics.
- P1 source gap: the page trusted the typed API response without runtime verification. A malformed 200 could render a false stage, crash on invalid requirements or silently turn unavailable source into an uncomputed stage.
- Change: reject invalid envelopes, stage codes, timestamp/calendar dates and non-integer requirements; distinguish verified null from unavailable, preserve unknown future codes, and offer an accessible retry. Existing responsive layout, authenticated route and noindex metadata remain in place.
- TDD: missing-parser RED; invalid-calendar RED; 23 focused parser+rendering tests GREEN (plus existing stages 9 GREEN). Exact HEAD CI/full release gates, PostgreSQL and authenticated E2E must be recorded separately; never infer PASS from unit tests.
- Coordination: PR #2217 covers progression credit (not this stage parser); A board, B database/release security and QA v1477 work remain untouched. QA v1477: P0 release HOLD, unsafe app table privileges, production 17 HTTP 500, 323/327 production migrations and five checksum mismatches.
- Deployment: no main modification, no Test/Production deployment, no GitOps release. Merge and production promotion prohibited until all required gates are independently green.
