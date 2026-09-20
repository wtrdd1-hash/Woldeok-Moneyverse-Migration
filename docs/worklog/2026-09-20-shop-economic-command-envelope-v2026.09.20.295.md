# Shop economic command envelope — v2026.09.20.295

## Scope
Move catalogue purchases onto the common economic command envelope while retaining the existing authoritative purchase policy and receipt checks.

## Checklist
- [x] Wrap catalogue purchases in the common economic command envelope.
- [x] Validate replay snapshots against authoritative shop receipts.
- [x] Reject idempotency-key reuse with a different purchase payload.
- [x] Remove direct application access to economic command lifecycle helpers.
- [x] Update database-backed replay tests.
- [ ] Renumber migration after the preceding profile migration is merged.
- [ ] Exact-SHA Test verification.
- [ ] Production promotion and smoke verification.

## Validation
CI must execute PostgreSQL migrations and the DB-backed shop tests. Production promotion remains blocked until the migration is renumbered after its predecessor lands.

## Deployment state
Implementation candidate only. Not promoted at this checkpoint.
