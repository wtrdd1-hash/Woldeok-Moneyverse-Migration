# Internal worklog — Desktop home dashboard hotfix v2026.09.14.79

## Trigger
Desktop production screenshot showed the home page starting at the editorial hero while the wallet/quick-action product dashboard was absent.

## Root cause
`MobileHomeView` used `lg:hidden`, so the operational dashboard was deliberately removed at desktop breakpoints while `page.tsx` switched to the editorial desktop layout.

## Change
Removed the desktop hide breakpoint from the dashboard container. The dashboard now remains first in document/visual order, followed by the existing desktop editorial sections. Added a source-level regression test for desktop visibility.

## Local verification
- `npm run typecheck`: PASS
- `npm test -- mobile-home-view.test.ts`: PASS
- `npm run build`: PASS

## Promotion plan
Branch -> GitHub CI/test candidate -> merge main -> isolated test server exact-SHA/API verification -> production-ready image -> GitOps production promotion.
