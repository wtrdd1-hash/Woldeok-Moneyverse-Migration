# Production Deployment

## Deployment philosophy

`main` is continuously validated, but Production deployment is explicit. Runtime changes go through the `Deploy` GitHub Actions workflow using `workflow_dispatch`.

## Expected order

1. Merge/push validated code to `main`.
2. Run the Test deployment.
3. Verify Test routes, logs, database invariants and container health.
4. Run the Production deployment.
5. Confirm the Production backup completed and verifies.
6. Confirm ordered migrations completed without checksum drift.
7. Confirm frontend/backend containers are using the commit-tagged GHCR images.
8. Verify public routes and protected boundary probes.
9. Inspect recent frontend/backend logs for new runtime errors.

## Images

Backend and frontend are built in GitHub Actions and pushed to GHCR with environment-specific commit tags.

The host `.env` records the exact image reference so a later `docker compose up -d` does not silently return to an older tag.

## Local smoke test

The production edge is bound locally and hardened against unknown hosts. Deployment smoke tests use the local port while sending the real public Host header.

## Database/data safety

Normal deployment:

- does not recreate/drop the Production database volume;
- does not prune Docker volumes;
- does not erase ledger history;
- does not retroactively rewrite existing loan/bond contracts unless an explicit migration says so.

## Post-deploy probes

At minimum verify:

```text
/
/login
/work
/quests
/casino
/wallet
/shop/catalog
/progression
/terms
/privacy
/status
/announcements
```

Also verify internal-only/forbidden probe paths remain unavailable externally.
