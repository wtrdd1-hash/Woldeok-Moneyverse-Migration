# QA A-2026.11.01-0152 — Inventory Condition

- **Release verdict: HOLD.** Exact source SHA is recorded on Draft PR; no official Test deployment.
- RED→GREEN tests: malformed condition evidence, 100k-digit WLD and SQL bigint overflow, separate expiry, native `<details>`, Android private success/error headers.
- Targeted backend shop HTTP E2E and validation: 20 PASS. Targeted frontend condition/UI/Android: 7 PASS.
- Full frontend: 2,908 PASS. Full backend: 2,952 PASS, 517 SKIP, **2 FAIL** (`profile-private-response.http.test.ts`: expected 200, actual 401). Identical 2 FAIL on untouched main. Backend excluding that test file: 2,946 PASS, 517 SKIP. Full test gate **FAIL**.
- Database unit 62 PASS / 4 SKIP; API contract 184 endpoints PASS; full build, typecheck PASS; lint 0 ERROR / 1,022 WARNING.
- PostgreSQL 17.11 DEV read-only role check PASS for `shop_my_items_v2` (0-row unknown actor), rollback PASS; direct app-role `user_items` SELECT/DELETE **P0 FAIL**. Official exact-SHA authenticated Test, independent restore, Production executable/rollback provenance **BLOCKED**.
- No new applied migrations, no balance/ledger/item writes. All unmerged branches preserved.
