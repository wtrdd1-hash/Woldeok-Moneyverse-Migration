# QA — A0325 member support search — RELEASE HOLD

Baseline `62c6cd038951d65c94b709302bdaec6e75b080b6`; isolated branch `auto/hourly-a-support-subject-search-20261030-0325`.

- RED reproduced: backend 4 failures, frontend 2 failures; additional Android privacy regression RED.
- GREEN: backend subject/status 7 PASS; frontend subject/status/Android 7 PASS (after combined-filter regression).
- Isolated real PostgreSQL 17.11: 304/304 migrations PASS, 108 synthetic support threads, actor-only results, literal `%_` search, status composition, latest-100 cutoff and app-role table SELECT denial PASS. No operational DB changes; isolated container removed after verification.
- Typecheck PASS; build PASS; changed-code ESLint PASS. Database suite 56 PASS/4 SKIP. Production dependency audit: no known vulnerabilities.
- Whole-repo ESLint FAIL: three pre-existing `stale-tab-notice.tsx` `no-empty` errors (plus one transient candidate control-regex error fixed and rechecked). Backend suite 2355 PASS/236 FAIL/493 SKIP. Frontend suite TIMEOUT after 85 seconds. Mobile contract generation/check FAIL due pre-existing NPC affinity schema drift, tracked separately in QA PR #1927; generated unrelated files intentionally excluded.
- Official Test exact-SHA authenticated flow, release image, full accessibility/SEO E2E, independent restore, Treasury provenance and Frontend SHA attestation: BLOCKED. No main merge, Test/Production promotion or rollback.

No PASS evidence is inferred from missing gates. Other development branches and Draft PRs remain protected.
