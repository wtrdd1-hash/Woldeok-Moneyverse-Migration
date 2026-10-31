# Release gate — Public board category discovery (HOLD)

**NOT APPROVED FOR MERGE, TEST PROMOTION OR PRODUCTION.** Draft PR #2280. Code SHA `e7c18f62704f21a131886acf25871fa7dd1f62a2`.

Required unresolved gates: full backend two profile auth HTTP failures (also on baseline main); final exact-SHA CI; isolated PostgreSQL positive fixture and least-privilege; official Test exact-SHA authenticated user flow/Android/SEO/a11y E2E; Production runtime provenance; independent backup restore; GitOps no-downtime release and rollback manifest verification. Do not bypass these gates.

Test and Production SHA differ from code SHA. No migrations, ledger writes, main merge, service restarts, database changes, deployment or rollback executed. Rollback of this read-only feature is to remove the category query or revert the code commit. All unique remote branches preserved; 0 deleted.
