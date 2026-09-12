# Woldeok Moneyverse — Accessibility, Responsive Interaction & UI State Specification

> Version: v2026.09.13.11
> Status: Living implementation-oriented product specification
> Date: 2026-09-13
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`, `BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.md`, `ANALYTICS_EXPERIMENTATION_GOVERNANCE_SPEC.md`
> Korean counterpart: [ACCESSIBILITY_RESPONSIVE_INTERACTION_SPEC.ko.md](ACCESSIBILITY_RESPONSIVE_INTERACTION_SPEC.ko.md)

## 0. Purpose

Moneyverse already contains individual accessibility patterns such as `aria-live` status messages and loading states, but accessibility must be a product-wide contract rather than a page-by-page convention. This specification defines a common interaction, responsive-layout, state, testing and release contract for public pages, authenticated gameplay, market/banking flows, checkout, community, and administrator surfaces.

Product baseline: target WCAG 2.2 Level AA as the internal design/engineering goal where applicable. This is a product-quality target and does not itself assert that every external legal regime requires WCAG 2.2 for Moneyverse.

## 1. Core principles

1. Every core task must be operable with keyboard alone.
2. Information must not depend on color, animation, hover, pointer precision, or audio alone.
3. Focus must remain visible and must not be hidden behind sticky headers, drawers, cookie banners, or fixed CTAs.
4. Authentication, checkout, cancellation, market orders and other critical flows must not require cognitive tests, memorization, or unnecessary repeated entry where an accessible alternative is available.
5. Responsive behavior is functional behavior: mobile layouts must preserve task completion, not merely shrink desktop UI.
6. Loading, empty, error, offline, maintenance, permission-denied and success states are first-class product states.
7. Accessibility regressions on a critical task are release blockers unless an explicitly documented exception is approved.

## 2. Target matrix

### Public and account surfaces

- public landing/guides/season/company pages;
- sign-up, login, email verification, password reset, MFA/security center;
- account/profile/privacy/settings;
- billing/subscription/refund/cancellation.

### Gameplay/economy surfaces

- jobs/professions/quests;
- wallet/bank/loans;
- WDX market, stock detail, order entry, portfolio and journal;
- business/supply chain/inventory;
- shop/inventory/marketplace/crafting;
- season/reward/league;
- housing/personal spaces/city projects;
- clubs/community/reporting.

### Operator surfaces

- admin dashboards;
- economy/ledger/reconciliation tools;
- moderation/integrity queues;
- billing/refund tools;
- security/session/incident tools.

## 3. Keyboard and focus contract

- All interactive elements use native semantic controls where practical.
- Tab order follows visual/task order.
- No positive `tabindex` ordering.
- Every actionable control has a visible focus indicator.
- Focus must not be fully obscured by sticky/fixed UI.
- Opening a modal/drawer moves focus inside it; focus remains contained until close; `Escape` closes non-destructive dialogs where safe; closing returns focus to the invoking control.
- Destructive confirmations must not auto-focus the destructive action when a safer neutral action is available.
- Keyboard shortcuts must never be the only way to perform a task.

## 4. Pointer, touch and gesture contract

- Interactive targets should meet WCAG 2.2 target-size requirements or spacing exceptions; product design should generally prefer at least 44×44 CSS px for primary mobile actions.
- Drag-only interactions require an equivalent non-drag control.
- Swipe-only navigation requires visible controls.
- Hover-only information must also be available through focus/tap or persistent text.
- Charts must not require precise pointer placement to access essential numeric information.

## 5. Forms and validation

Every field requires a persistent accessible name. Placeholder text is not a label.

Validation behavior:

- validate on submit and, where helpful, after field interaction without disruptive per-keystroke announcements;
- identify the field and explain the correction in text;
- connect errors with `aria-describedby` or equivalent semantics;
- after failed submit, focus the error summary or first invalid field using a predictable rule;
- preserve already-entered valid values;
- do not force users to re-enter information already supplied in the same process unless security requires it;
- never expose password, session, token, or private-data values in error messages.

## 6. Accessible authentication

Authentication UX should support password managers and paste. Do not block paste into password or verification-code fields.

Where CAPTCHA or bot controls are required, provide an accessible alternative and avoid making visual puzzles the only successful path.

MFA flows must:

- label code fields and expiry/retry state;
- announce errors without rapid repeated `aria-live` noise;
- preserve the intended destination after successful reauthentication;
- expose recovery options when policy allows.

Security controls remain authoritative; accessibility does not mean weakening authentication requirements.

## 7. Status and live updates

Use live announcements only for user-relevant asynchronous changes.

Recommended mapping:

- `aria-live="polite"` / `role="status"`: saved state, copied state, background refresh completion, order accepted, non-urgent progress;
- assertive alerts only for conditions requiring immediate interruption, such as a critical destructive-operation failure where continued action would be unsafe.

Do not announce constantly changing prices, countdowns or online counts on every tick. Provide a readable current value and user-controlled refresh/verbosity strategy.

## 8. Financial/game-market presentation

Profit/loss, debt, repayment status, stock movement and economy health must never rely on red/green alone.

Use at least:

- `+` / `-` sign;
- text label such as gain/loss, increase/decrease, due/overdue;
- numeric value;
- color as supplemental encoding.

Charts require:

- textual series/metric name;
- accessible current/summary values;
- keyboard-accessible data alternative or equivalent table for decision-critical data;
- legend labels not based only on color;
- tooltips that are not pointer-only.

Order, loan, transfer and checkout confirmation must restate the authoritative amount, unit/currency, action and key consequence before final submission.

## 9. Motion, animation and urgency

Respect `prefers-reduced-motion` for non-essential animation.

Avoid:

- flashing or rapid pulsing effects;
- celebratory motion that blocks task completion;
- repeated countdown animations around purchases, stock orders or loan actions;
- FOMO styling that creates artificial urgency.

Critical timers must show exact end time as text and remain understandable without animation.

## 10. Responsive layout contract

Planning breakpoints may evolve, but behavior must be explicitly defined for desktop, tablet and mobile.

### Tables

Desktop: sortable/filterable table where density benefits the task.

Mobile: either horizontal scroll with clearly preserved row/column context or card/list transformation. Never hide financially or operationally important columns solely to fit width.

### Market

Desktop: chart + quote/context + order panel may coexist.

Mobile: order action is separated from chart exploration; the final order CTA may be sticky only if it does not cover content/focus and confirmation still shows full order details.

### Admin

Editing forms must not auto-refresh and erase input. Background updates should use a non-destructive stale-data indicator or explicit refresh control.

### Navigation

Navigation collapse must preserve all critical destinations, current-location indication, keyboard operation and screen-reader names.

## 11. Required UI states

Every major data-driven screen defines:

- default;
- hover where relevant;
- focus;
- active/selected;
- disabled with reason when user-relevant;
- loading/skeleton;
- empty;
- partial-data/degraded;
- validation error;
- server/network error;
- offline;
- maintenance;
- permission denied;
- success;
- stale-data / refresh-available where real-time data is involved.

A zero-row result is not an error. Empty states should explain the next valid action without inventing data.

## 12. Data scale behavior

Design must define behavior for 0, 1, dozens and thousands of records.

- pagination or virtualized lists must preserve focus position where practical;
- filters/search should be keyboard operable and announce result-count changes without excessive noise;
- infinite scroll must provide reachable pagination/navigation semantics or an equivalent load-more mechanism;
- user-entered filters/forms should survive non-destructive refreshes.

## 13. Design-system requirements

The shared component library should define:

- spacing/grid tokens;
- typography hierarchy;
- semantic success/warning/error/info tokens;
- visible focus token;
- minimum interactive target guidance;
- numeric/tabular alignment;
- WLD/WDX/real-currency formatting distinction;
- timezone/date formatting;
- table density modes;
- responsive breakpoints;
- light/dark contrast validation;
- reduced-motion variants;
- icon + text rules for critical status.

Icon-only buttons require accessible names and visible tooltips where helpful.

## 14. Accessibility acceptance criteria per feature

Every new or materially changed user-facing feature should document:

- keyboard path for the primary task;
- expected focus movement;
- screen-reader names for inputs/buttons/landmarks;
- live-region behavior;
- color-independent status encoding;
- zoom/reflow behavior;
- mobile CTA and table behavior;
- loading/empty/error/offline states;
- reduced-motion behavior where animated;
- automated checks plus manual checks required before release.

## 15. Automated and manual QA

Automation is necessary but not sufficient.

Recommended CI/browser checks:

- semantic/accessible-name violations;
- obvious contrast failures;
- duplicate IDs/invalid ARIA where tooling detects them;
- keyboard-trap regressions on known dialogs;
- route-level smoke checks at representative viewport widths.

Manual critical-flow checks before major releases:

1. keyboard-only navigation;
2. visible focus and focus restoration;
3. 200% and 400% zoom/reflow where applicable;
4. screen-reader spot checks for login, order, payment/cancel, report and admin high-risk flows;
5. reduced-motion behavior;
6. mobile portrait and landscape;
7. error recovery without loss of entered data.

## 16. Analytics

Accessibility telemetry must not fingerprint disability status.

Allowed product-quality signals include:

- form error rate by field and release;
- task abandonment by viewport class;
- client error rate;
- reduced-motion preference only when strictly needed for presentation and not used for advertising/profile inference;
- keyboard interaction success in synthetic QA rather than user identity profiling;
- accessibility issue count by component/release;
- critical-flow manual QA pass rate.

Do not infer or monetize a user's disability from interaction patterns.

## 17. Monetization and advertising

Ads and paid-product UI must obey the same accessibility contract.

- sponsored/native content is clearly labeled in text;
- ads do not cover focus, forms or primary CTA;
- ad motion respects reduced-motion expectations where controllable;
- checkout/cancel/refund controls are not visually or keyboard-deemphasized to manipulate choice;
- ad placement must not cause severe layout shifts that break focus or reading order.

Accessibility improvements are not sold as paid convenience.

## 18. SEO relationship

Accessible semantic HTML generally supports understandable crawlable public content, but accessibility and SEO are separate quality axes.

Public indexable pages should use meaningful headings, links and alt text. Private/account/admin pages remain authenticated and `noindex` regardless of accessibility status.

Do not add decorative keyword-stuffed alt text. Decorative imagery should be ignored by assistive technology when appropriate.

## 19. Legal/policy notes

- Internal product target: WCAG 2.2 Level AA where applicable.
- U.S. DOJ Title II web/mobile rule is specifically for covered state/local government entities and currently references WCAG 2.1 Level AA; do not assume it automatically applies to Moneyverse as a private service. If Moneyverse later serves a covered public entity under an arrangement, legal review is required.
- Korea accessibility obligations and certification applicability depend on service/entity context; launch/legal review must confirm applicable requirements rather than treating a certification mark as universally mandatory.
- Accessibility statements must describe actual tested capability, not claim blanket compliance without evidence.

## 20. Runtime reality and current gap

Repository evidence already shows isolated accessibility work (`aria-live` status messages, loading skeleton semantics, text status feedback), so this specification does not describe the current UI as wholly inaccessible.

However, no healthy Production/Test runtime could be verified during this planning pass. `easy-scraping.com` was unavailable to the external checker, so responsive, keyboard and assistive-technology behavior remains **runtime verification unavailable**.

Planned requirements not proven in runtime must remain marked planned/not implemented until exact implementation evidence exists.

## 21. Implementation priorities

### P0

- sign-up/login/recovery/security center;
- wallet/bank/transfer;
- market/order/portfolio;
- billing/cancel/refund;
- destructive confirmations;
- admin high-risk actions;
- shared dialog/form/status primitives.

### P1

- jobs/quests/business/shop/inventory;
- season/rewards;
- community/reporting;
- responsive tables/cards and charts.

### P2

- advanced personalization and secondary visual polish;
- full component accessibility regression suite;
- periodic user testing with assistive technology where feasible.

## 22. Definition of Done

A user-facing feature is not complete until:

- primary task works with keyboard;
- visible focus is preserved;
- labels/names/status messages are meaningful;
- color is not the sole status signal;
- desktop/tablet/mobile behavior is defined;
- loading/empty/error/offline/permission states exist;
- critical data remains available at narrow widths;
- reduced-motion behavior is handled where needed;
- automated checks pass;
- required manual critical-flow checks are recorded;
- English/Korean documentation remains synchronized.

## 23. Research note — 2026-09-13

### Directly adopted

1. **W3C WAI — Understanding WCAG 2.2**, updated 2026-02-11. Type: official standards guidance. Adopted: WCAG 2.2 AA product target, status-message/name-role-value guidance, and updated accessibility interpretation. https://www.w3.org/WAI/WCAG22/understanding/
2. **W3C WAI — What's New in WCAG 2.2**. Type: official standards guidance. Adopted: focus-not-obscured, dragging alternative, minimum target size, redundant-entry and accessible-authentication requirements. https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
3. **W3C ARIA Authoring Practices — Dialog (Modal) Pattern**. Type: official implementation guidance. Adopted: contained tab sequence, focus entry/return and Escape behavior for appropriate dialogs. https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/

### Legal/context reference, not automatically applied

4. **U.S. Department of Justice — ADA Title II web/mobile accessibility rule fact sheet**, reflecting the 2026 interim final rule. Type: official government legal guidance. Reference only because the rule is scoped to covered state/local government entities; it confirms WCAG 2.1 AA requirements in that context and 2027/2028 extended compliance dates. https://www.ada.gov/resources/2024-03-08-web-rule/
5. **Korea web-accessibility evaluation ecosystem / Accessibility Korea**, checked 2026-09-13. Type: operational accessibility evaluation reference. Used as supporting evidence that automated page checks are useful but do not replace authenticated/manual critical-flow testing. https://accessibility.kr/

## 24. Deployment note

Documentation-only. No Test or Production deployment is required for this documentation version. Any runtime implementation must use a separate development branch, isolated Test exact-SHA validation, backend/API/browser checks where relevant, then Production promotion under the normal release gate.