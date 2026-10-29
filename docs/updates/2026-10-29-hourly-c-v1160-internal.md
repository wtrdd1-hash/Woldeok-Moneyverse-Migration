# C v1160 — Internal implementation and release hold

**Source:** Draft PR #1864, branch `auto/hourly-c-wallet-ambiguous-v1160-20261029-1545`; base main `9ebc5613845ba2e8179a0051e86db996593c8a19`.

## User-facing behavior

The wallet transfer form persists the exact recipient, amount and idempotency key before sending. When an HTTP outcome is uncertain, it freezes the original command across reloads, exposes a same-key-only retry with a clear warning, and refuses a changed key or payload on the server. Only a valid transaction UUID from NestJS allows success. Browser storage is isolated by authenticated wallet user. The UI announces pending/invalid states accessibly. Live push notifications carry stable ledger-transaction-derived IDs and Sonner uses the ID to avoid duplicate toast display.

## Evidence

RED/GREEN frontend action and DOM tests, backend transfer-notification tests, full local workspace gates, real isolated PostgreSQL 17.11 migration and grant checks. See `docs/worklog/2026-10-29-hourly-c-v1160.md` for exact counts and SHA-specific caveats. Final GitHub CI is reported in PR comments, not inferred from earlier SHA.

## Release decision: HOLD

This patch does not provide a durable owner-only read-only receipt endpoint, cross-tab/device suppression, or exactly-once server push/outbox. A 100-concurrent same-key test was not completed. Dependency audit has 12 vulnerabilities (3 low/9 moderate), including 1 production moderate. Official Test/Production run `c2129625aa6629c616fb31ce790950618b8d92b2`, not this branch. No main merge, Test promotion, Production deployment, rollback, shared DB write or other branch cleanup.
