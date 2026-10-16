# Moneyverse Full Web UI and Admin Re-audit — v2026.10.16.718

**Status:** AUDIT / BLOCKED (evidence only, not TEST_VERIFIED or PRODUCTION_VERIFIED) | [한국어](MONEYVERSE_FULL_UI_ADMIN_AUDIT_v2026.10.16.718.ko.md)
**Observed:** 2026-10-16 KST, through `$pc` read-only shell and read-only production HTTP.
**Source:** `origin/main=2a06bed92c22d63013672b44c55b621e9be5019f` at start and mid-work; isolated branch `audit/full-ui-admin-v2026.10.16.718`.
**Authorities:** `docs/DOCUMENTATION_POLICY.md` → `docs/planning/PROJECT_PLAN.md` → `docs/planning/INTEGRATED_PLANNING_MASTER.md` → `docs/planning/EMERGENCY_FULL_UI_REAUDIT_SPEC.md` (v530). Historical v624/v628 audits are prior evidence, not acceptance.

## 1. Evidence levels and execution matrix

| Test | Scope / result | Evidence boundary |
| --- | --- | --- |
| Latest source route inventory | 166 Next.js page templates: 135 static, 31 dynamic; 34 administrator templates (33 static + one dynamic) | All source templates enumerated; not all rendered visually |
| Production anonymous safe HTTP GET | 135/135 static paths returned 200 (102 public/non-admin, 33 admin) | 200 can be a sign-in/elevation shell; does not imply permission success, working buttons, or correct visual layout |
| Admin navigation discovery | 34/34 admin templates have an explicit nav item or an ancestor tab; `/admin` uses separate `adminConsole()` gate | Menu discoverability via source, not keyboard/screen-reader verification |
| Public access negative GET | `/api/admin/treasury/grants`, `/api/admin/seo-audit`, `/api/admin/pension/overview`, `/api/admin/bonds/overview`, `/app-api/v1/account/identities` each returned 401 | Anonymous GET only; no authenticated administrator or step-up QA; `/api/admin/seo/twitter` status GET returned 200 and requires separate intended-publicness review |
| Focused local test | `NODE_ENV=test vitest` mobile-responsive + admin SEO: **2 files, 13/13 passed** | Tests are mostly source-string and jsdom component checks; no browser geometry. Initial invocation inherited `NODE_ENV=production`, causing 7 React.act test-harness errors; rerun with test environment passed |
| Release source relation | `git diff 176ca04e..2a06bed9 -- frontend backend` empty | Production v717 release note declares source 176ca04e; live reverse-proxy/runtime identity not independently established in this audit |
| Pixel/browser/admin scenarios | **NOT RUN** | No headless graphical browser or permitted authenticated QA session available. No measured overflow, click rects, screenshots, focus, 200%/400% reflow, or 5 complete authenticated passes |

Inventory/raw observations: `docs/findings/evidence/full-ui-admin-v718-route-matrix.json` and `full-ui-admin-v718-http-smoke.json`. These are reproducible inventory and HTTP samples, **not automated acceptance**.

## 2. Findings and remediation priorities

### UI718-01 — P1 security/SEO UX — Administrator action endpoints lack explicit operator authorization
- Source: `frontend/src/app/api/admin/seo/indexing-submit/route.ts:13-83`: unauthenticated handler directly invokes IndexNow and ping requests; its success flag/message can report completion when downstream submissions fail.
- Source: `frontend/src/app/api/admin/seo/gsc-sitemap-submit/route.ts:55-124`: rate limit and target host whitelist but no operator or CSRF gate; calls backend, then legacy Google/Bing ping URLs, reports `success:true` even without a verified GSC submission.
- `frontend/src/components/public-sitemap-submit-box.tsx:25` publicly invokes the admin-namespaced sitemap handler, so public vs operator ownership is currently ambiguous. **No POST was sent to Production** because it would cause external side effects; exploitability and CDN protections are untested.
- Remedy: define public read-only status vs operator submissions; reject unauthenticated/cross-origin writes, enforce role + active elevated console + CSRF before any network effect; delegate authoritative GSC receipts to backend; do not call obsolete ping mechanisms; distinguish requested, provider accepted, crawled, indexed. Add 401/403/429, quota and backend-outage negative tests.

### UI718-02 — P1 — SEO administrator narrow-width tab may clip
- `frontend/src/app/admin/seo/page.tsx:110-126` has a two-tab `flex gap-2` with long hardcoded Korean labels and no tab-wrap or scroll container. This is a **source-level reflow risk**, not a measured 320px overflow.
- Remedy: mobile stack or `overflow-x-auto` with visible focus/scroll affordance, 44px actionable targets, 320/360/375/390/412/430/768px and 200%/400% zoom checks, KO/EN/JA/ZH long labels.

### UI718-03 — P1 — SEO submission UI reports misleading success/history
- `frontend/src/app/admin/seo/indexing-api-card.tsx:25-45,70-99` trusts `data.success` as provider success; records a hard-coded 564 count in history even for one sitemap; history exists only in component state.
- `frontend/src/components/public-sitemap-submit-box.tsx:25-40` tells users search-engine ping succeeded on a generic response success. Submission is not indexing or search visibility.
- Remedy: source-of-truth submission attempt ID, engine-specific receipts and timestamps, failed/partial/unverified UI states, durable audit history and honest public microcopy.

### UI718-04 — P1 — Homepage first-level heading absent in delivered HTML
- `frontend/src/app/page.tsx` contains `<h2>` and `<h3>` but no `<h1>`; anonymous Production GET `/` also contained no SSR `<h1>`.
- Remedy: introduce one meaningful server-rendered, localized first-level heading without changing economics or stuffing SEO terms. Confirm DOM heading hierarchy on all public locales. Some other routes without SSR H1 are intentionally auth/console gates; **not all 55 H1-missing URLs are defects**.

### UI718-05 — P1 triage — Touch targets smaller than project mobile contract
- Non-geometry scan identified 39 explicit height candidates below 44 CSS px in shared/admin components, including **9 in admin files**. Examples: `admin/money-flow/page.tsx:338,341` (40px), `admin/shop/admin-shop-view.tsx:138` (36px), and `components/site-header.tsx:263` (38px).
- These are **candidates, not 39 proven failures**: overrides, desktop exceptions, padding, browser layout and adjacent hit area must be checked. WCAG 2.2 minimum is not identical to the project's stronger 44px target.
- Remedy: measured computed bounding boxes per action, enlarge primary touch affordances, verify table row actions and focus under narrow zoom.

### UI718-06 — P2 — Locale and admin UX consistency
- `frontend/src/app/admin/seo/page.tsx:98-126` localizes only EN vs all-other title and lead, while navigation tabs remain Korean for all languages. Confirm EN/JA/ZH administrator use and labels on the actual page, not just URL headings.
- Document requested language vs detected location precedence and preserve user override. Do not force an IP redirect over a chosen locale.

### UI718-07 — P0 verification gap — v530 five-pass full-route contract remains open
- Current source has 166 templates and 34 admin routes, superseding v530's historical 142/25 inventory.
- No authenticated role/step-up negative coverage, 5 × all-route Playwright visual/computed-style matrix, empty/error/long-value/dynamic routes, or console interaction recordings. Status stays **BLOCKED** for this full UI acceptance gate, regardless of 135/135 anonymous HTTP success.
- Maintain exact-SHA isolated Test browser matrix, backend health/API contract, session continuity, finance ACL/ledger invariants and rollback before any UI-affecting production release.

## 3. Previously reported issues rechecked

- v628 missing `/admin/blog` and `/admin/treasury/grants` navigation: **source-level resolved**; both present in `ADMIN_TABS` and `ADMIN_AREAS`.
- v628 grants fake payment/weak Next auth: now `GET` uses elevated backend admin-security gate and `POST` fails closed 503 pending ledger proof. Anonymous live GET returned 401. No finance action was attempted; **runtime paid-grant correctness NOT accepted**.
- v628 ventures/auction/quant false-real-action claims: latest pages visibly state simulation/preview and state no real WLD settlement; source-level improvement only. `marketplace/auction` still hardcodes `isPlusUser=true` in preview and should not imply actual entitlement.
- v530 floating collision: source now positions onboarding left, support right, AI launcher farther right and suppresses user floating utilities on admin routes. **Geometric/device/keyboard acceptance still unverified**.
- v530 identity 500 historic: anonymous GET now returns 401, but this does **not** retest the authenticated case that originally failed.

## 4. Exact acceptance checklist for the next implementation candidate

1. Preserve and re-fetch latest `origin/main`, isolate fixes in a new branch, avoid concurrent agents' worktrees and baseline drift.
2. Fix operator-only submission authorization and truthfulness with negative tests; no live external POST or money action during audit.
3. Fix administrator SEO tab responsive layout, admin money-flow/shop buttons and homepage heading.
4. Run automated all-route 5 passes with browser geometry and screenshots: portrait 320/360/375/390/412/430; landscape; 768/1024/1280/1440; 200%/400% zoom and KO/EN/JA/ZH.
5. Exercise all 34 administrator templates on exact Test candidate with authorized actor, role denial, expired step-up, data loading/empty/error/large data, forms, dialogs, keyboard focus, viewport and audit receipts.
6. Check all 31 dynamic templates with grounded valid and invalid IDs. Verify user journey → CTA → BFF → backend → permission/ledger receipt, with no mock money success.
7. Recheck main and rerun affected suites, promote to isolated Test, verify actual backend/DB/session/rollback, only then perform authorized zero-downtime release under the release playbook.

**Operations statement:** This v718 audit changed no application source, live DB, ledger, feature switch, Test or Production pointer. Document changes do **not** warrant runtime promotion.

## 5. References

Internal: `docs/RESPONSIVE_DESIGN_GUIDELINES.md`, `docs/DESIGN_SYSTEM_GUIDELINES.md`, `docs/frontend-ui-anti-clash-master-spec.md`, v530 authority, v624/v628 previous findings.
External: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [WAI keyboard interaction](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/), [Google structured-data and search semantics](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).
