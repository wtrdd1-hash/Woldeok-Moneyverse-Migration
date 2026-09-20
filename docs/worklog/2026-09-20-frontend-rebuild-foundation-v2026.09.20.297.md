# Frontend rebuild foundation — v2026.09.20.297

Date: 2026-09-20
Branch: `feat/frontend-rebuild-v2026.09.20.297`
Base: `4dcd2ba112ae57565eed7444fe1d36512b926a3b`

## Internal implementation note

This cycle begins the full frontend rebuild required by the living plan. It deliberately changes the shared presentation architecture first so route work can proceed on a coherent system instead of adding another theme layer.

### Implemented

- Replaced the previous dark gradient and glass-heavy global redesign stylesheet with a restrained light product system.
- Rebuilt the global shell spacing and maximum canvas width.
- Rebuilt PageHeader and SectionHeader hierarchy.
- Rebuilt Card and Button primitives with lower radii, flat elevation and clearer density.
- Preserved auth, API, permission, backend, ledger and database behavior.

### Verification

- Contract package build: pass.
- Frontend typecheck: pass.
- Frontend production build: pass.
- Frontend Vitest: 90/90 files, 681/681 tests pass.
- Initial Vitest attempt was blocked by /tmp capacity and a package-build ordering issue; both were isolated as environment/order problems and the final clean run passed.

### Remaining rebuild scope

Route composition still needs to be rebuilt in the planned order: authentication/account, economy/work/stocks/wallet, shop/market/community/content, then admin/operations, followed by viewport and visual regression QA.
