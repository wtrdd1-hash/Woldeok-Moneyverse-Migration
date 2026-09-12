# Admin Edit-State Refresh Safety

Update version: **2026.09.12-04**  
Status: **Candidate / staging verification required**  
Branch: `fix/admin-disable-auto-refresh`

## Summary

Administrator editing screens could refresh server-rendered data while an operator was typing. The market page polled every 15 seconds, the AI-news run view polled every 4 seconds while a run was active, and the shop editor forced a route refresh one second after a successful save.

These refreshes could replace server component output and reset in-progress form/search state. Admin editing surfaces must now stay stable until the operator explicitly navigates or reloads.

## Changes

- Removed `LiveRefresh` from `/admin/market`.
- Removed the 4-second `LiveRefresh` poll from the AI-news admin console.
- Updated the AI-news running-state copy to state that automatic refresh is disabled to protect entered values.
- Removed the delayed `router.refresh()` after shop-item saves.
- Shop saves now update the edited item in local React state so the screen reflects the saved value without reloading or clearing the current search.
- Added a regression test that rejects `LiveRefresh`, `router.refresh(`, and `setInterval(` in the affected admin editing files.

## Verification

- Frontend TypeScript typecheck passes.
- Frontend Vitest suite passes.
- Source audit confirms the affected admin editing files no longer contain automatic route-refresh triggers.

## Release gate

Deploy to the test environment first, verify the backend is healthy, and confirm that typing into administrator forms remains intact while server-side information changes. Promote to production only after staging verification succeeds.
