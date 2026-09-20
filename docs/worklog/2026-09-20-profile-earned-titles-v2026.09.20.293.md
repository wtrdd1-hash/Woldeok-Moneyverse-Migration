# Profile earned titles — v2026.09.20.293

## Scope
Expose only titles actually awarded to the signed-in member and make them selectable on the profile surface.

## Checklist
- [x] Add server-authoritative earned-title read function.
- [x] Keep `moneyverse_app` on EXECUTE-only access with the required SECURITY DEFINER template.
- [x] Add backend route and profile UI integration.
- [x] Regenerate and verify mobile API contract artifacts.
- [ ] Exact-SHA Test verification.
- [ ] Production promotion and smoke verification.

## Validation
CI must pass lint, typecheck, build, unit tests, migration/database tests, and API contract checks before merge.

## Deployment state
Implementation candidate only. Not promoted at the time of this checkpoint.
