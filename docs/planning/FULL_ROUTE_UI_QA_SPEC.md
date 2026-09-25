# Woldeok Moneyverse — Full Route UI & Functional QA Specification

> Version: v2026.09.25.442
> Status: PLANNING / authoritative detailed QA contract
> Date: 2026-09-25
> Parent: `PROJECT_PLAN.md`, `ACCESSIBILITY_RESPONSIVE_INTERACTION_SPEC.md`
> Korean counterpart: [FULL_ROUTE_UI_QA_SPEC.ko.md](FULL_ROUTE_UI_QA_SPEC.ko.md)

## 1. Scope invariant

Full-site QA means every frontend page in the exact candidate, not a sample.
The authoritative inventory is generated from candidate source immediately before QA.
For the current App Router layout, discovery includes every `frontend/src/app/**/page.tsx`.
Additional special render surfaces such as loading/error/permission states and UI-affecting redirects are attached to their owning page rows.

Current 2026-09-25 source snapshot:
- 86 page routes total;
- 22 administrator routes under `/admin/**`;
- 8 dynamic page routes;
- 25 route loading components and 3 error components observed.

These numbers are snapshot evidence only. The candidate-generated inventory is always authoritative.

## 2. No-exclusion rule

Every discovered page receives one ledger row and final status: PASS, FAIL or BLOCKED.
“Unchanged”, “same component”, “internal”, “admin”, “covered last release”, and “looks identical” are not skip reasons.
All administrator pages are ordinary baseline coverage and are additionally treated as privileged/high-risk surfaces.
A newly added route automatically expands the required QA set without a planning update.## 3. Route execution contract

Each route check must:
1. navigate to the route using the required auth/role state;
2. verify initial render, title/heading, navigation and major data;
3. scroll from top to final content;
4. visit every local tab, section, accordion, drawer and relevant dialog;
5. exercise primary and secondary actions using safe Test fixtures;
6. verify keyboard/focus/touch behavior and no page-level horizontal overflow;
7. verify refresh/back-forward behavior when stateful;
8. record console/runtime/API errors attributable to the candidate.

Dynamic routes require deterministic valid fixtures and applicable invalid, not-found, owner/non-owner and permission-denied fixtures.
List pages never substitute for direct checks of their dynamic detail pages.

## 4. Role and state matrix

Use every materially distinct state supported by a page:
- guest / pre-login;
- signed-in member;
- restricted or permission-denied member;
- owner versus non-owner where ownership changes behavior;
- administrator and additional privileged role/step-up states where required.

Required UI states include loading/skeleton, empty, long-content, partial/stale, validation error,
server/network error, supported offline/maintenance, permission denied, success, mutation pending,
idempotent retry/replay where applicable, and post-save authoritative reread.

## 5. Responsive matrix

Every page participates in responsive QA. Required coverage is:
320, 360, 375, 390, 412 and 430 CSS px portrait; representative mobile landscape;
768 and 1024 tablet widths; desktop; 200% zoom and applicable 400% reflow.

Failures include page/body overflow, clipping, overlap, hidden navigation/CTA, unreachable controls,
incorrect wrapping, lost critical data, obscured focus, unsafe-area overlap, or task completion loss.## 6. Five-pass full-site rule

Every release candidate requires at least five complete full-site QA passes.
Every pass visits every discovered page, including every administrator page.
Across the five passes, the required viewport, role, fixture, content-length and UI-state matrix must be covered.
A defect found during a pass is fixed, linked to the route ledger, and rerun on that route plus every dependent shared layout/component consumer affected by the fix.

## 7. Administrator baseline

Every `/admin/**` page is tested in each pass with authenticated administrator runtime data.
Coverage includes admin navigation, tables/cards, filters, forms, dialogs, responsive reflow,
role and recent-reauth/step-up behavior, save/apply confirmation, audit evidence, and safe Test handling of sensitive/destructive actions.
Admin is never postponed to a later optional phase.

## 8. Evidence and coverage arithmetic

Required per-row evidence:
`candidate_sha`, `route`, `route_kind`, `role_state`, `fixture_id`, `pass_number`,
`browser_engine`, `viewport`, `orientation`, `zoom`, `runtime_version`, `api_version`,
`result`, `defect_id`, and evidence reference.

Promotion arithmetic is fail-closed:
`discovered distinct pages == ledger distinct pages == pages with accepted final evidence`.
Any mismatch, skipped route, unresolved FAIL/BLOCKED, missing admin page, or candidate-attributable runtime/console failure blocks Production.

## 9. Runtime authority

Final acceptance runs on Test with the exact candidate SHA and real backend/API/database contracts.
Unit tests, source inspection, mocked browser states, screenshots and historical route sweeps are supplemental only.
A Production promotion may reuse no previous release's page-pass claim without rerunning the v442 candidate gate.

## 10. Current-state note

Historical evidence includes a 60-route browser sweep and later administrator audits.
The current source contains 86 pages, so those historical passes remain useful evidence but cannot establish current full-route completion.
v442 changes planning/QA authority only and does not claim current Test or Production has passed the new gate.