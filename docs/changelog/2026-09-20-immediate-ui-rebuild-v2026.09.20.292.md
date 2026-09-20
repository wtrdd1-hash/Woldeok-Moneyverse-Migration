# v2026.09.20.292 — Immediate Full UI Rebuild Directive

Date: 2026-09-20
Type: Planning / next-work directive
Authority baseline: `main=0f390e492ddc61af14c66bdf85b40fb4a071624a`
Branch: `docs/immediate-ui-rebuild-v2026.09.20.292`

## Change
The authoritative project plan now makes the full frontend UI rebuild the immediate next development task rather than a deferred future phase.

## Required next work
- Audit all current frontend routes against real backend/API behavior.
- Rebuild the frontend UI from the ground up rather than incrementally restyling it.
- Preserve server authority for authentication, permissions, economy/ledger, jobs, stocks, wallet and admin state.
- Avoid repetitive AI-generated-looking page patterns and generic dashboard composition.
- Build responsive behavior from the first implementation pass and continuously verify 320/360/390/768/1024/1280/1440 CSS-pixel widths.
- Cover loading, empty, error, permission and expired-session states.
- Run route-level functional QA, API contract checks, accessibility/responsive QA, visual regression and critical-flow E2E before completion.
- Promote only through implementation branch -> exact-SHA Test -> verification -> merge -> exact merged SHA -> zero-downtime Production.

## Status
Planning directive only. Runtime implementation is the next task.
