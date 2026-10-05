# Emergency Full UI Re-audit & Remediation Specification — v2026.10.05.530

**English canonical** | [한국어](EMERGENCY_FULL_UI_REAUDIT_SPEC.ko.md)

> Version: v2026.10.05.530
> Status: **BLOCKED — URGENT UI REMEDIATION REQUIRED**
> Branch: `audit/emergency-full-ui-v2026.10.05.530`
> Latest-main audit baseline: `921b467eac21645a51ba362b24cac7eaab89c081`

## 1. Emergency authority decision
The entire Moneyverse web UI, including every administrator surface, is under emergency re-audit. No prior UI “pass” or responsive-complete claim may be used as current release evidence unless it is tied to the exact candidate SHA and satisfies the current full-route five-pass contract.

The immediate planning status is **URGENT UI REMEDIATION REQUIRED / BLOCKED**. Production promotion of UI-affecting work is prohibited while a P0 blocker, unclassified critical interaction defect, incomplete administrator pass, or exact-SHA evidence gap remains open.

## 2. Current inventory and evidence boundary
- Latest-main web inventory: **142** tracked Next.js `page.tsx` templates: 115 static route templates and 27 dynamic templates.
- Administrator inventory: **25** `/admin/**` page templates, including control tower, API health, bank, catalog, content, controls, Discord, economy/scenario lab, logs, market/AI news, safety, security, SEO/SEO audit, shop, support, treasury, users and work.
- Documentation inventory: 1,747 tracked Markdown files were enumerated and read through a SHA-256 scan; the implementation plan, integrated master, documentation governance, responsive/accessibility authority and current update/runtime documents were separately reviewed as priority authorities.
- Current Production browser evidence and latest-main source evidence are **not the same identity**. Production currently points at `prod-v521`; Test points at `test-v524-gsc-9bdafd86`. Therefore current-live observations cannot be treated as proof that latest main is fixed.
- This v530 cycle is an emergency audit/planning cycle. It does not claim that all five required full-site passes have already completed.

## 3. Emergency defect ledger

### UI530-01 — P0 — Administrator SEO mobile action bar horizontal clipping
User-supplied mobile evidence shows `/admin/seo` clipping the right-side action controls. Latest-main source reproduces the layout cause: the outer action bar can wrap, but the four-button inner action group is a single non-wrapping `flex items-center gap-2` row with long labels.

Required remediation:
- mobile stack/grid or wrapped action group with `min-w-0` and no document-level overflow;
- preserve all four actions without hidden off-screen CTA text;
- primary actions meet the Moneyverse >=44px touch-target rule;
- verify Korean, English, Japanese and Chinese long-label behavior;
- re-run 320/360/375/390/412/430 portrait, representative landscape, 768/1024 tablet, desktop, and zoom/reflow checks.

Acceptance: zero page-level overflow, zero clipped action, all actions discoverable/operable, and no regression in authenticated administrator state.

### UI530-02 — P1 release blocker — Sub-44px interaction hotspots
Latest-main source scanning found 576 `Button` usages and a large set of explicit small variants. The high-confidence raw scan retained **103** explicit base-height `button/a` candidates below 44px; administrator examples include 24–40px controls in quick search, support, audit logs, treasury, work, economy and safety.

The count is a triage set, not a claim that every item violates WCAG: skip links, range internals, compact non-primary desktop affordances and valid exceptions must be classified. However Moneyverse's product contract is stricter than the WCAG 24px floor and targets >=44x44 CSS px for primary touch controls.

Acceptance: every candidate is classified as compliant exception or remediated; all primary mobile actions are >=44px in both dimensions or provide an equivalent compliant target.

### UI530-03 — P1 — Floating support/onboarding content occlusion
The onboarding launcher is independently fixed at mobile `bottom-[136px]`; the support launcher is independently fixed at `bottom-[74px]`. The supplied mobile evidence shows the floating stack covering page content.

Required remediation:
- one shared floating-layer stack/safe-area contract;
- reserve bottom/right content space where required;
- no overlay may hide KPI labels, form controls, table actions, nav, toasts or critical status text;
- expanded panels must remain within `100dvh`, support keyboard-safe placement and 320px width.

### UI530-04 — P1 — Account identity API failure blocks account UI acceptance
A current Production reviewer login, viewer and profile read succeeded, while `/app-api/v1/account/identities` returned HTTP 500. Account/security UI cannot be accepted green while a required data dependency is failing.

Acceptance: exact-SHA Test returns the expected authenticated contract; UI shows deterministic loading/empty/error/recovery states; Production is rechecked only after Test acceptance.

### UI530-05 — P1 — Core-site touch-size regression surface
A Production browser matrix over 12 representative public/core routes at 320/390/768/1280 completed 48 page checks with 0 detected document overflow, 0 HTTP failure and 0 blank main, but **48/48** checks contained at least one detected target below the product 44px target. The detector includes legitimate special cases, so this is a triage result rather than a raw failure count. Visible 24/30/32/36/40px controls are present and require classification.

### UI530-06 — P1 — Semantic heading gaps on current Production
A 963-URL Production sitemap/meta sweep returned 957 HTTP 200 responses and six timeouts. Among reachable pages, the root/stocks family remains in the missing-visible-H1 set. Heading hierarchy must be revalidated because it affects accessibility, content hierarchy and search presentation.

### UI530-07 — P0 evidence gap — Previous v529 audit cannot satisfy current gate
The earlier v529 long-running browser audit did not finish, authenticated administrator capture covered only a subset, and main advanced afterward. Its evidence cannot certify the current candidate.

Acceptance: regenerate route inventory and exact-SHA evidence after every material main drift and complete the full five-pass contract.

## 4. Mandatory full-route QA contract
Each release candidate affecting UI must execute at least five complete passes over the discovered route inventory. Across the five passes:
- every static and representative dynamic route is covered;
- all 25 administrator templates are exercised authenticated on the same exact Test candidate;
- 320/360/375/390/412/430 portrait, representative landscape, 768/1024 tablet, 1280/1440 desktop and required 200%/400% zoom/reflow are covered;
- loading, empty, partial, error, permission, expired-session and real-data states are covered;
- Korean is the product fallback, with EN/JA/ZH long-label and layout parity for published locales;
- focus order, keyboard operation, reduced motion, dialog focus trap, accessible names, form labels, color/contrast and minimum target size are checked;
- no body overflow, clipped controls, overlapping fixed layer, hidden CTA, inaccessible table action or lost decision-critical content is permitted.

## 5. Administrator-specific pass
Every `/admin/**` route must be checked in each full-site pass. Test evidence must include:
- authenticated administrator role and correct step-up/permission behavior;
- header/sub-navigation reachability at narrow widths;
- forms, filters, tables/cards, charts, dialogs and destructive/sensitive actions in safe Test mode;
- long identifiers, Korean/English copy, empty/large data, validation/error states;
- audit-log visibility for sensitive mutations;
- no horizontal document overflow and no critical action below the touch-target contract.

## 6. Remediation order
1. P0 `/admin/seo` overflow/hidden CTA.
2. Shared shell/floating-layer collision and mobile safe-area contract.
3. Administrator touch-target and dense-table/action remediation across all 25 templates.
4. Account identities 500 + account UI deterministic error/retry state.
5. Global visible touch-target sweep and heading/semantic cleanup.
6. Five-pass exact-SHA Test matrix, backend/API health and authenticated admin QA.
7. Re-fetch/reconcile latest `origin/main`; re-run affected passes.
8. Only after all blockers close: merge, rebuild the exact merged SHA, zero-downtime Production promotion and post-promotion smoke/session/runtime-identity verification.

## 7. Release gate
No v530 document asserts runtime remediation, Test verification or Production completion. A code change requires a separate implementation branch, exact-SHA Test deployment, backend/API health validation and the project's zero-downtime promotion procedure.

## 8. v531 implementation response — 2026-10-05

The approved v530 plan was merged by PR #792 and v531 implements the first blocker repairs on exact baseline `9ae2a9e8e0f7d5e403de80c7d30510916e0ed880`.

- UI530-01 source repair implemented: `/admin/seo` actions now stack/wrap at narrow widths with shrink-safe labels and >=44px action height.
- UI530-02 first systemic repair implemented: administrator mobile/coarse-pointer buttons receive a 44×44 minimum target contract. Route-level runtime classification still belongs to Test acceptance.
- UI530-03 source repair implemented: onboarding/support consumer overlays are unified and suppressed on `/admin/**`.
- UI530-04 source repair implemented: linked identity reads accept `local_email`, while OAuth linking remains Google/Discord-only.
- UI530-06 root semantic repair implemented: home receives a visible localized H1.
- UI530-07 remains an evidence gate until the exact v531 candidate completes the required Test passes.

Status after source implementation: **IMPLEMENTED — TEST VERIFICATION PENDING**. This section does not close the Test or Production gate.
