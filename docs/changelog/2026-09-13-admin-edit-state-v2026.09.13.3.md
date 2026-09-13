# v2026.09.13.3 — Admin edit-state refresh safety re-home

- Re-homed the still-valid admin edit-state protection onto the newest reconciled runtime baseline.
- Baseline: Trusted Client IP candidate `90764db11805a0146fbd283a17e8cac67b160496`, which is already stacked on Business Settlement candidate #196 and current `main`.
- Removed automatic route refresh/polling from the affected admin market and AI-news editing surfaces.
- Shop saves update local React state instead of forcing `router.refresh()`, preserving search and in-progress edit context.
- Added a regression test rejecting `LiveRefresh`, `router.refresh(` and `setInterval(` in the protected admin editing files.
- No database or backend mutation contract changes are introduced.
- Production remains blocked until CI and exact-SHA isolated Test verification pass.
