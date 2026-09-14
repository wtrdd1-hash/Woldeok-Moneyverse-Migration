# Desktop home dashboard hotfix v2026.09.14.79

## Summary
- Restored the wallet dashboard and six quick actions on desktop home, not only mobile/tablet.
- Kept the existing brand hero, monthly notes, onboarding links, lobby, and advertisement placements below the dashboard.
- Added a regression test preventing the dashboard root from being hidden at the `lg` breakpoint.

## Incident
A desktop viewport rendered only the editorial hero/status layout while the operational quick-access dashboard was hidden by `lg:hidden`. This made key product entry points disappear on desktop despite remaining present on smaller viewports.

## Validation
- Frontend typecheck
- Frontend unit tests
- Frontend production build
- Isolated test deployment and backend/API gate before production promotion
