# A Gallery Day QA — Candidate / Not a Release PASS
- Base main: `f13bbce273ffc65e8576170992d82ea00c27a1c9`; branch: `auto/hourly-a-20261101-1225-gallery-day`.
- RED before code: backend 11 failures / 4 passes; frontend missing day module, ignored query; UI RED 2 failures; media-type/204 RED 2 failures.
- GREEN targeted: backend 15/15; frontend 10/10. Android 184 endpoint contract check PASS.
- DEV PostgreSQL app role: public approved photo function EXECUTE=true, direct photos SELECT=false; 2 rows, read-only ROLLBACK. Other DEV ACL P0 #993 unresolved.
- Full build/lint/typecheck/unit/integration/real-PostgreSQL isolated E2E/security/a11y/SEO/official Test exact-SHA are separate gates. Never infer them from targeted tests.
- Test: unchanged, exact-SHA auth E2E BLOCKED. Production: unchanged, HOLD. Rollback: discard branch; no migration or runtime change.
