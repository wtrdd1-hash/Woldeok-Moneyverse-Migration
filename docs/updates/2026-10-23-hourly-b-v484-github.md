# Backend B v484 — SEO telemetry database truthfulness (DRAFT / HOLD)

- Production SEO crawler reads and writes now require an available PostgreSQL pool and a successful query; otherwise Nest responds HTTP 503 with a generic error, not a fabricated memory-only success.
- Keep local/test in-process ring-buffer fallback; only durable production writes are acknowledged. No finance, migration, feature switch, release, or other agent worktree changes.
- RED reproduced 4 assertions, GREEN focused SeoService 15/15; typecheck and build PASS; full lint FAIL on QA-owned CSV regex; full test FAIL on unrelated homepage assertions; 397 backend DB tests skipped.
- Independent draft candidate only. Do not merge/deploy without exact-SHA CI, real PostgreSQL, authenticated E2E, isolated official Test and GitOps release gate PASS.
