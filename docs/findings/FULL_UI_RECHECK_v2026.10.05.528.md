# Full UI Recheck — v2026.10.05.528

**English canonical** | [한국어](FULL_UI_RECHECK_v2026.10.05.528.ko.md)

> Status: **BLOCKED / release sign-off not granted**
> Final review baseline after required main refreshes: `origin/main=755840748e80919d627c9126269e54559fa817ef`
> Scope: source/UI authority comparison, runtime identity, public HTTP smoke, responsive/accessibility risk review.
> Evidence boundary: this review does **not** claim the mandatory five-pass browser matrix, authenticated/admin direct traversal, visual regression, or exact-current-main Test acceptance.

## Executive decision

The current UI must not be considered fully accepted. The authoritative QA contract requires every candidate route, every administrator surface, dynamic-route fixtures, state coverage, the full responsive/zoom matrix, and five complete passes on the exact Test candidate. The exact current main is not deployed to Test, and several source-level release blockers are already visible before browser QA begins.

## Environment and route identity

| Environment | Exact SHA | Page routes | Admin routes | Dynamic routes | Observed health |
|---|---|---:|---:|---:|---|
| Production | `7080738e656aca099d5c871278d178d69a984fcc` | 112 | 24 | 12 | backend health OK |
| Test | `9bdafd8699f7ca5f58ee3d00b89a327a3792d893` | 122 | 25 | 15 | backend health OK |
| Current main | `755840748e80919d627c9126269e54559fa817ef` | 138 | 25 | 24 | source baseline only |

Fresh route inventory on current main: 138 routes / 25 administrator / 24 dynamic / 80 `data-page` markers; inventory SHA-256 `d581eff68b716eeeb1ea532d6ba8041053c4d79b5fa08431070b168b660d9f52`.

Historical 60/86-route UI evidence is therefore not sufficient evidence for the current candidate.

## Blocking findings

### UI528-01 — Exact-candidate full-route acceptance evidence is missing
- Severity: **P0 release gate**
- State: OPEN
- The current authoritative candidate has 138 page routes, but Production and Test are older SHAs with smaller route inventories.
- The required five complete browser passes, authenticated/member/admin state matrix, dynamic fixtures, 320/360/375/390/412/430 portrait, landscape, 768/1024/desktop, 200% zoom and applicable 400% reflow have not been executed on `75584074`.
- Result: no Production promotion or “full UI QA complete” claim is allowed.

### UI528-02 — Korean product fallback authority is violated in current Test/main source
- Severity: **P0 authority/runtime gap**
- State: OPEN
- Current planning authority says product/public fallback is Korean (`ko`), and the v510 execution plan explicitly treats Korean runtime fallback repair as P0.
- Production SHA still has `DEFAULT_LOCALE='ko'`; Test and current main have `DEFAULT_LOCALE='en'`.
- GeoIP can mask this in Korea, but it does not satisfy the fallback/canonical authority contract.
- Required remediation: restore one server-owned locale precedence contract and verify explicit locale URL, saved choice, GeoIP recommendation, Accept-Language and Korean fallback in that order.

### UI528-03 — Global 320px onboarding panel is wider than the viewport
- Severity: **P1 release blocker**
- State: OPEN
- `InteractiveOnboardingTracker` uses `w-[340px]` below the `sm` breakpoint while positioned `right-3.5`.
- At a required 320px viewport, the panel begins off-screen and critical controls/content can be clipped. The shell also uses horizontal overflow suppression, which can hide rather than solve the layout defect.
- This component exists on Test/current main and is global from the root layout.
- Required remediation: viewport-safe width such as `w-[calc(100vw-1.75rem)] max-w-[390px]`, plus direct 320px browser evidence.

### UI528-04 — 44px interaction contract is not enforced by shared primitives
- Severity: **P1 release blocker**
- State: OPEN
- Shared `Button` variants allow 24/32/40px icon and compact sizes; shared `SelectTrigger` defaults to 36px and small to 32px; default tabs are also below 44px unless a route overrides them.
- Confirmed visible usages include 28px chat filters, 32px admin/work actions, 36px business/trade actions, 40px controls, and 28px onboarding claim/navigation actions.
- Global masthead also uses 40px mobile menu trigger below 400px, 38px mobile language segments, and 36/40px desktop navigation controls.
- Required remediation: enforce the project touch-target contract at primitive/interaction-area level and remove route-local undersized overrides.

### UI528-05 — Locale changes leave Korean-only global accessibility text
- Severity: **P1 accessibility/localization**
- State: OPEN
- With explicit `wdmv_locale=en`, `ja`, or `zh`, both Production and Test correctly render `html lang` for that locale, but the global skip link remains `본문으로 건너뛰기`.
- This creates mixed-language global navigation/accessibility UI and contradicts published-locale parity.
- Required remediation: localize the skip link and audit other root/global controls with the same explicit-locale smoke.

### UI528-06 — Mobile navigation information architecture has conflicting authorities
- Severity: **P1 product/UX governance**
- State: OPEN
- Current implementation bottom tabs are Home / Stocks / Work / Wallet / Account(Login).
- Current App Specification describes Home / Economy / Casino / Social / MY.
- Current Design System describes five core domains Home / Exchange / Financial Tools / Community / MY.
- A historical update log records Home / Work / Stocks / Wallet / Account, but historical logs do not supersede maintained authority.
- Required remediation: choose one current navigation SSOT in the authoritative plan/spec, then make desktop masthead, mobile bottom navigation, drawer and documentation derive from it.

## Performance/runtime risks requiring browser follow-up

### UI528-07 — Two public pages exceeded the 8-second body-transfer smoke budget
- Severity: **P2 performance risk**
- State: OPEN / needs measurement
- In the partial public HTTP sweep, Production `/newspaper` returned HTTP 200 but did not finish body transfer within 8 seconds; Test `/shop` showed the same behavior.
- This is not yet proof of a Core Web Vitals failure. It is a trigger for browser timing, server timing, API waterfall and payload-size investigation.

## Positive observations

- Production and Test backend health endpoints are currently healthy.
- Current main route inventory generation succeeds and keeps explicit administrator/dynamic route counts.
- Mobile bottom navigation itself reserves safe-area padding and has 58px minimum item height.
- Inputs use a 44px baseline in the shared Input primitive.
- Current main advanced twice during this review (`660c5ebb`, then `75584074`); both concurrent responsive/admin touch-target changes were inspected and the audit branch was rebased instead of overwriting them.

## Required remediation order

1. Resolve UI528-02 locale fallback authority first because it affects public canonical/localized behavior.
2. Repair global 320px and touch-target defects (UI528-03/04/05).
3. Reconcile navigation SSOT (UI528-06) before another navigation redesign.
4. Deploy the exact repaired SHA to isolated Test and verify backend/API/version identity.
5. Generate the final route inventory and execute all 138 routes, including 25 admin and 24 dynamic routes, across the required state and viewport matrix.
6. Perform at least five complete responsive/UI QA passes and close every P0/P1 with exact-SHA evidence.
7. Only then merge, rebuild the exact merged SHA and use the documented zero-downtime Production promotion path.

## Non-claims

No source fix, Test deployment, database change, Production change, full browser pass, visual-regression pass, or Production promotion is claimed by v528. This version is an audit/evidence update only.
