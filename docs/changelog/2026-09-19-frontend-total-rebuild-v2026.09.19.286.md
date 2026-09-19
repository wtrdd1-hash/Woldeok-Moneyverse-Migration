# v2026.09.19.286 — Full Frontend Rebuild Planning

Date: 2026-09-19
Type: Planning / documentation
Authority baseline: `main=d59294c9f106e3c0ea7db8d9a08da3bf9f4e6853`
Branch: `docs/frontend-total-rebuild-v2026.09.19.286`

## Summary
Defines the next development phase as a from-scratch web frontend rebuild. Every route must first verify its real backend/API contract, then be redesigned with a human-product visual standard and explicit responsive acceptance criteria.

## Added requirements
- Rebuild the frontend architecture and page composition instead of incrementally restyling the existing shell.
- Audit backend/API behavior route-by-route before frontend implementation.
- Map backend-only capabilities that lack usable UI into the rebuild backlog.
- Avoid repetitive AI-generated-looking visual patterns and generic dashboard composition.
- Establish a new design-system foundation and reusable interaction primitives.
- Verify 320/360/390/768/1024/1280/1440 CSS-pixel widths, plus relevant zoom/reflow behavior.
- Treat loading, empty, error, permission and expired-session states as required route states.
- Require exact-SHA Test verification before merge and zero-downtime Production promotion using the exact merged SHA.

## Delivery order
1. Backend/API inventory and route matrix.
2. Design-system foundation.
3. Global shell and navigation.
4. Authentication/account.
5. Economy/work/stocks/wallet.
6. Shop/market/community/content.
7. Admin/operations.
8. Responsive, accessibility, performance and regression QA.
9. Test exact-SHA validation, then zero-downtime Production promotion.

## Documentation
Primary: `docs/planning/PROJECT_PLAN.md`
Secondary language: `docs/planning/PROJECT_PLAN.ko.md`
