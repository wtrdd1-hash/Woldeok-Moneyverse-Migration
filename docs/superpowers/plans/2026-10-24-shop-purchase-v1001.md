# Shop purchase integrity plan v1001

1. Confirm the existing shop controller requires CSRF and the database enforces idempotent receipts; keep those contracts unchanged.
2. RED: test browser purchase is delegated to a server action and that the server action validates item/key/quantity and refuses an invalid receipt.
3. GREEN: add `buyStoreItem` server action via `mutate`; client keeps one key per purchase intent, shows server-confirmed receipt, retries uncertain failures with the same key, and never sends raw browser POST to `/api/v1`.
4. Verify keyboard/live-region and mobile UI; run focused tests, lint, typecheck, build, backend/contract/real isolated PostgreSQL if safe, security audit, CI, official Test exact-SHA only if deployable.
5. Re-fetch main and planning, preserve other branches, hold release on any failure.
