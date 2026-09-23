# v2026.09.23.391 — Business boost idempotency

Development B / P1 economy integrity.

- Requires a caller-owned UUID idempotency key when applying an inventory-consuming business boost.
- Adds an immutable migration with a private command receipt table and payload-bound replay semantics.
- Serializes same-key requests before inventory consumption and returns the stored result on an exact replay.
- Rejects reuse of a key for another actor, ownership, or boost code.
- Revokes the legacy three-argument database function from both `PUBLIC` and `moneyverse_app`; only the four-argument idempotent function remains callable by the application role.
- Preserves existing ownership locking, inventory locking, boost calculations, ledger behavior, and least-privilege boundaries.
