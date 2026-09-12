# Accessibility, Responsive Interaction & UI State v2026.09.13.11

Date: 2026-09-13
Type: Documentation-only product-planning update
Branch: `docs/accessibility-responsive-interaction-v2026.09.13.11`
Test deployment required: No
Runtime verification: unavailable

## Why

Moneyverse had accessibility behavior implemented in isolated components and feature-specific documents, but no canonical product-wide contract covering keyboard operation, focus, accessible authentication, responsive transformations, live updates, chart alternatives, UI states, reduced motion, critical-flow QA and release blocking criteria.

This became more important as account security, billing and stock/community runtime work expanded the number of critical interactive surfaces.

## Added

- `ACCESSIBILITY_RESPONSIVE_INTERACTION_SPEC.md` as the English canonical specification.
- Korean maintained counterpart.
- WCAG 2.2 AA internal product target where applicable.
- common keyboard/focus/modal contract;
- accessible authentication and form-error contract;
- pointer/touch/drag alternatives;
- financial/market color-independent presentation;
- chart/table accessible alternatives;
- live-region noise controls;
- reduced-motion and anti-FOMO interaction rules;
- desktop/tablet/mobile transformation rules;
- required default/loading/empty/error/offline/maintenance/permission/success/stale states;
- accessibility acceptance criteria and manual/automated QA expectations;
- analytics rule prohibiting disability inference/monetization;
- monetization/SEO/accessibility interaction rules;
- P0/P1/P2 implementation priorities.

## Existing implementation evidence

Repository review found existing isolated patterns including `aria-live` status messaging and loading-state semantics. This version therefore treats accessibility as partially implemented rather than absent, while defining the missing cross-product contract.

## External research reviewed on 2026-09-13

### Directly adopted
- W3C WAI `Understanding WCAG 2.2`, updated 2026-02-11 — official standards guidance; adopted as current interpretation basis.
- W3C WAI `What's New in WCAG 2.2` — official standards guidance; adopted for focus-not-obscured, dragging alternatives, target size, redundant entry and accessible authentication.
- W3C ARIA Authoring Practices modal dialog pattern — official implementation guidance; adopted for focus containment/return and keyboard behavior.

### Reference / legal context only
- U.S. DOJ ADA Title II web/mobile rule fact sheet reflecting the 2026 IFR — official government guidance. It is scoped to covered state/local government entities, so Moneyverse does not claim automatic applicability. `legal review required` if a covered public-sector delivery relationship arises.
- Accessibility Korea — operational automated-check reference; used as supporting evidence only, not as proof of full conformance.

## Product-policy effects

- No gameplay hard cap was introduced.
- No economy faucet/sink/transfer classification changed.
- Accessibility is not a paid feature and cannot be removed for monetization experiments.
- WLD/WDX remain virtual/simulated/game-only.
- Private/account/admin pages remain authenticated and `noindex`.

## Runtime status

`easy-scraping.com` could not be fetched by the external checker during this pass. Real keyboard, responsive and assistive-technology behavior is therefore recorded as `runtime verification unavailable`; planned requirements must not be represented as already implemented.

## Next priorities

1. reconcile active Account Security Center/runtime PRs with current main and validate them in isolated Test;
2. implement first-party local-email authentication security gates;
3. turn this accessibility spec into shared component and critical-flow automated/manual QA contracts;
4. run the Runtime Product Reality Audit immediately after a healthy service endpoint is available.