# A 19:00 — Board page size QA (DRAFT / RELEASE HOLD)

Before-work baseline: `3eb1441090cb0602e054908547dcf43bfe4299dd`.
Required checks: Nest 400 on invalid or repeated limit; latest 50 SQL source with post-filter LIMIT 10/25/50; default unfiltered backward compatibility; web accessible form and invalid state; Android exact-size provenance, duplicate IDs, zero rows, no-store/noindex; DB read-only execution; regression/typecheck/build/lint/audit; official exact-SHA Test E2E and rollback proof. Unexecuted checks are BLOCKED, not PASS.
