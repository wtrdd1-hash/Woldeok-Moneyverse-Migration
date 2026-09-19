# Frontend Redesign — v2026.09.19.260

- Version: v2026.09.19.260
- Date: 2026-09-19
- Branch: `feat/frontend-redesign-v2026.09.19.260`
- Scope: complete visual-system and shared frontend-shell redesign
- Korean counterpart: [2026-09-19-frontend-redesign-v2026.09.19.260.ko.md](2026-09-19-frontend-redesign-v2026.09.19.260.ko.md)

## Goal

Rebuild the frontend visual language from the foundations while preserving existing routes, server contracts, economy semantics, authentication boundaries, and accessibility requirements.

## Design direction

The new UI should present Moneyverse as a living virtual city/economy rather than a collection of unrelated panels. The system will use a dark midnight canvas, high-legibility neutral surfaces, moon-gold primary emphasis, clear semantic status colors, restrained depth, larger touch targets, and a compact responsive information hierarchy.

## Checklist

- [x] Read repository rules and current project planning documents.
- [x] Isolate the work in a dedicated branch/worktree without touching unrelated backend work.
- [x] Audit shared shell, navigation, typography, cards, controls, responsive behavior, and homepage composition.
- [ ] Replace global design tokens and base surfaces.
- [ ] Redesign shared header, footer, brand, mobile navigation, and page shell.
- [ ] Redesign shared primitives used across all routes.
- [ ] Refresh common page headers, empty states, loading states, and reusable information panels.
- [ ] Refresh the public home composition to demonstrate the new system.
- [ ] Re-check living planning documents after the first implementation pass.
- [ ] Run frontend tests, lint, typecheck, and production build.
- [ ] Deploy to the test environment and verify frontend/backend integration.
- [ ] Prepare internal and GitHub-facing update notes.
- [ ] Promote to production only after test validation passes.

## Constraints

- Preserve all route and API behavior.
- Do not expose backend APIs directly to the browser.
- Preserve locale support; English remains the repository language and Korean is the second documentation language.
- Preserve or improve WCAG 2.2 AA-oriented interaction patterns.
- Keep primary mobile actions at least 44 CSS px where practical.
- Respect reduced-motion preferences.
- Do not hide financially or operationally important information solely to fit smaller screens.

## Validation log

Pending implementation.
