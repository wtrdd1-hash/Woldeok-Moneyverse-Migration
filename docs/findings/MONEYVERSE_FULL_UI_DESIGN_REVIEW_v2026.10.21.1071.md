# Moneyverse Full UI Design Review — v2026.10.21.1071

**Status: AUDITED (SOURCE/PUBLIC-HTML ONLY) / BROWSER VISUAL ACCEPTANCE BLOCKED**
**Korean companion:** [한국어](MONEYVERSE_FULL_UI_DESIGN_REVIEW_v2026.10.21.1071.ko.md)
**Date:** 2026-10-21 KST
**Source:** origin/main `0d12f99bab2f4431cb04b19f7a279f86a7195099` (start and midpoint unchanged)
**Isolated branch:** `audit/full-ui-design-v2026.10.21.1071`
**Scope:** full Next.js web UI, administrator routes, mobile/tablet/desktop design system, journey/status truth. Android native UI is **not** covered.

## 1. Authority, methodology and actual coverage

Authority: `docs/DOCUMENTATION_POLICY.md` > `docs/planning/PROJECT_PLAN.md` > `docs/planning/INTEGRATED_PLANNING_MASTER.md` > adopted `docs/planning/EMERGENCY_FULL_UI_REAUDIT_SPEC.md` (v530). Historical audits v624/v718 are comparison inputs, **not** current acceptance.

- Inspected the live public homepage, tools hub, status and unauthenticated /bank-to-login web responses; a read-only live HTTP HEAD of the home endpoint returned 200. The web client could not access several other routes; this is **not** proof of application 404s.
- Re-inspected current source for `app/page.tsx`, `app/admin/seo/page.tsx`, `components/mobile-bottom-nav.tsx`, `components/site-shell.tsx`, `components/ui/button.tsx`, `components/fintech-ticker-bar.tsx`, `components/site-footer.tsx`, `components/route-aware-floating-utilities.tsx`, `components/interactive-onboarding-tracker.tsx`, `lib/onboarding-tracker.ts`, and floating support, AI and calculator conversion surfaces.
- Machine read-only inventory: **168 page.tsx templates**, **34 admin templates**, **31 dynamic-route templates**, and **229 components/**/*.tsx files**. Categories include 34 tools, 34 admin, 10 stocks, 7 guide and 6 locale templates. A template count does not equal a rendered-URL count or a QA pass.
- Source-pattern observations across pages and shared components: `text-[10px]` **404** occurrences, `text-[11px]` **558**, `size="sm"` **159**, `overflow-x-auto` **49**, `fixed bottom-` **8**, `truncate` **138**. These **are not verified failures or unique affected elements**. A manual browser/layout/role/state classification is required.
- No graphical-browser screenshot matrix, authenticated admin/member session, computed CSS, axe, keyboard/zoom, 5 complete v530 passes, Android native checks, exact deployed SHA equivalence, Test deployment or Production promotion in this audit.

## 2. Confirmed source findings and proposed corrections

| ID | Priority | Evidence | Assessment / acceptance |
| --- | --- | --- | --- |
| UI1071-01 | P1 — information integrity | `components/fintech-ticker-bar.tsx:16-19,49-54,60-89` initializes `WDG +4.8%` and retains it on fetch errors; `805 nodes`, `100% Verified`, `0.98 Balanced` are constant display values. Live public home presents them as metrics. `site-footer.tsx:335` says `IndexNow 100% Active`. | Never dress defaults or unverified claims as measured real time. Model `observed / stale / unavailable / example` with source, observed time and error state; show no synthetic mover while unavailable. Prove source and provider status before declaring 100%. |
| UI1071-02 | P1 — user trust / possible P0 if actual public reward path exercised | `components/interactive-onboarding-tracker.tsx:99-111,137-150` issues a “WLD deposited in wallet” success after `claimOnboardingReward`. `lib/onboarding-tracker.ts:223-277` persists the claim via localStorage, not ledger settlement. The component is globally mounted outside admin by `route-aware-floating-utilities.tsx:9-20`. | Label it tutorial/local progress only or obtain actual authenticated backend ledger receipt and idempotent transaction confirmation first. No monetary-success animation or balance claim without authoritative receipt; verify guest/auth flows. |
| UI1071-03 | P1 — touch/legibility candidate | `components/ui/button.tsx:23-34`: `sm`=40px, `xs`=32px, `icon-xs`=24px, `icon-sm`=32px; 159 source occurrences of `size="sm"` (not all unique buttons). 10/11px text usage is pervasive. `mobile-bottom-nav.tsx:79-91` has 10px captions. | Keep 44x44px Moneyverse primary touch-target contract; classify decorative/desktop/inline exceptions individually. Improve user-facing typography (body generally >=14px, critical labels >=12px), contrast and 200%/400% reflow. WCAG 2.2 AA has a distinct, conditional 24px target rule and must not be misstated as a universal 44px legal rule. |
| UI1071-04 | P1 — overlay collision candidate, not pixel-proven | `components/site-shell.tsx:11-24` applies overflow shielding and mobile bottom reservation; `mobile-bottom-nav.tsx:62-65` uses fixed z-50; `floating-support-chat-widget.tsx:986,1034` fixed z-40; `interactive-onboarding-tracker.tsx:134` fixed left z-40; `deoki-ai-floating-assistant.tsx:170` fixed right z-40; `tools-guest-conversion-bar.tsx:57` uses fixed bottom-0 z-40 in `app/tools/layout.tsx:70`. | Unified mobile safe-area/floating stack and per-route mutual exclusion; browser-measure 320/360/375/390/412/430 and virtual keyboard. Confirm no covered submit/feedback; side effects untested. |
| UI1071-05 | P1 — information architecture / first action | Public home exposes simulator, 19 finance tools, market, 10k WLD promotion and multiple ads as competing early sections. `site-shell.tsx:12-17` stacks notice, welcome, impact, masthead, ticker before main. `mobile-bottom-nav.tsx:14-51` includes global `/admin` for every audience. | Prefer one immediately useful non-signup action, then tools/virtual economy secondary rail, isolate ads, and role-gate administrator navigation or put operator routes behind an accessible `More` view. Validate with new/returning guest/member/admin user tasks; no assumed CTR lift. |
| UI1071-06 | P2 — dense admin/table responsive candidate | 34 admin templates; fixed `min-w-[...]` candidates in admin market/controls/work/money-flow/safety and 49 horizontal-scroll class occurrences globally. | Prioritize 320px compact summary + drill-down, sticky filter/action access and table-specific scroll indicators; preserve data precision/ability to export. Check step-up, read-only and error/empty cases. |
| UI1071-07 | P2 — status and claims consistency | Root public UI displays “1 second” and “free reward” promises, while status and WLD disclaimer are separate. `/tools` response also contains guaranteed roulette rewards. Some strings may be historical/live-content mismatches. | Reconcile every conversion CTA/notification with actual eligibility, active switch, amount, ledger receipt and last verified time. Avoid outcome guarantees and transparent-fiction ambiguity. |

## 3. Previously reported problems corrected **in source**

- v718 `/admin/seo` two long tabs are now `grid grid-cols-1` on mobile, with `sm:flex-wrap`, `min-h-[44px]`, and KO/EN/JA/ZH labels: `app/admin/seo/page.tsx:109-153`. Do not call the old non-wrapping tab a current confirmed defect; viewport rendering still required.
- v718 home H1 absence is fixed in `app/page.tsx:165-169`; live public HTML also exposes an H1. Do not reuse the old missing-H1 allegation.
- v624 mobile-bottom nav now uses `min-h-[44px]` and `min-w-0` without its prior contradictory explicit min-width token: `components/mobile-bottom-nav.tsx:62-92`.
- Shared shell reserves mobile bottom safe-area. This improves baseline, not proof of zero overlapping floating panels.

## 4. Prioritized design system proposal (not implementation)

1. **Evidence-first UI states**: measured, delayed, unavailable, demo, submitted, accepted, settled/posted; distinguish visible provider receipts from client animation.
2. **First-screen hierarchy**: one actionable calculator/learning route at the top; discoverable finance-tool categories next; WLD fictional economy clearly separated and optional; ads visually separated.
3. **Typography and touch tokens**: explicit caption vs data vs actionable label; mobile minimum touch size 44x44 on primary actions, visible focus, numeric tabular alignment and reduced-motion fallback.
4. **Responsive patterns**: no page-level `overflow-x-hidden` used as proof against clipping. Use real calculated widths, 320px reflow, long KO/JA/ZH labels, scroll affordance for true data tables, shared safe-area budget for banners/chats/toasts.
5. **Navigation**: 4–5 audience-relevant bottom items; `/admin` only when authorized, with secure discovery preserved for admins; clear active route for locale-prefixed paths.
6. **Admin workbench**: unified page titles, filters, search, empty/errors, reauthentication, approval confirmation and read-only reason, backed by actual provider and ledger receipts.

## 5. Verification and release contract

- P0/P1 source issues are **findings / candidates**, not browser-confirmed incidents or resolved implementation.
- Use exact merged candidate SHA; test across guest, member, administrator and rejected permission/expired sessions, 168 templates including 34 admin / 31 dynamic with representative valid/invalid IDs.
- Five complete actual-browser passes across viewport matrix 320/360/375/390/412/430, landscape, 768/1024, 1280/1440, 200%/400% zoom, KO/EN/JA/ZH, mobile virtual keyboard, loading/empty/error/long content, focus/dialog/contrast/touch/overlap.
- Record screenshot/DOM computed geometry and failures by route × auth role × locale × viewport × state. Recheck `origin/main` after others' modifications and restart impacted passes.
- Release gates: CI/PR, isolated exact-SHA Test with live backend/DB-safe user account, monetary integrity & authority gate, session/restart and rollback, zero-downtime promotion with post-promotion evidence. **Not performed here**; no code, DB, balances, switches or deployment pointer changed.

## 6. Reference policy

- Internal: DOCUMENTATION_POLICY, PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, DESIGN_SYSTEM_GUIDELINES, RESPONSIVE_DESIGN_GUIDELINES, EMERGENCY_FULL_UI_REAUDIT_SPEC v530, v718 audit.
- External: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [W3C target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum), [NN/g progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/).
