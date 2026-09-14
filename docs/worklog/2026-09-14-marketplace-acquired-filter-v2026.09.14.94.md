# Marketplace acquisition-window filter — v2026.09.14.94

## Selected feature and user benefit

Added a recent-acquisition window to the authenticated Marketplace holdings workbench so members can quickly isolate newly acquired materials/items while preparing for future crafting and marketplace flows.

## Baseline and overlap review

- `main` rechecked before development: `b24788ca82d2a25d83c23ad44153357a2068fad9`.
- Newest overlapping Marketplace work: PR #312 head `3b0690e51d8dfbb17f95670e168d945e298d86c7`.
- Development branch `feat/marketplace-acquired-filter-v2026.09.14.94` was created directly from that head so the quantity/effect/rarity/inventory-discovery stack is preserved.
- PR #311 remains the integrated Test candidate beneath PR #312; Dependabot branches do not overlap this feature area.

## Scope

Frontend only. Extended Marketplace query normalization/filtering and the `/marketplace` filter UI. Existing `/api/v1/shop/holdings` remains authoritative. No backend/API/DB contract or migration changed.

## Files changed

- `frontend/src/app/marketplace/marketplace.ts`
- `frontend/src/app/marketplace/marketplace.test.ts`
- `frontend/src/app/marketplace/page.tsx`
- English/Korean changelog and worklog files for this version.

## Validation

- Added deterministic regression coverage for 7-day and 30-day windows.
- Added invalid/future acquisition timestamp coverage.
- Local/remote-device validation is unavailable in this run because the authorized Remote Desktop device is offline.
- GitHub CI is the required executable validation path for this branch; no PASS claim is made until that workflow completes on the final SHA.

## Deployment evidence

No Test or Production deployment claim. Exact-SHA Test verification remains mandatory and Production remains fail-closed until the isolated Test runtime serves the exact candidate SHA and required backend/database smoke checks pass.

## Branch cleanup

No remote ref deletion was claimed. The available GitHub connector can create/update refs but does not expose branch deletion, and the authorized remote device is offline. Infra branches that are proven integrated remain cleanup blockers until a deletion-capable path is reachable.

## Remaining risk / next priority

Recent-window filtering trusts the authoritative holdings timestamp field only for display/filtering, never ownership. The next higher-value runtime gap remains progressing from the safe R0 Marketplace workbench toward server/database-backed R1 listing quote + escrow, or another Living Plan P0/P1 runtime gap with an existing authoritative contract.
