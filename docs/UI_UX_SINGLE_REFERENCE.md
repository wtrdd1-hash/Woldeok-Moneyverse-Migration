# UI/UX Single Reference — Current Favicon as the Sole Logo

> v2026.11.23.5 · PLANNING / QA OPEN · [한국어](UI_UX_SINGLE_REFERENCE.ko.md) · main baseline `9876c09888ec84034eec183cf1309c85df3d7447`

## Binding owner instructions
**The currently used site favicon is the official logo.** Never substitute a generated W icon or crown/laurel emblem. The canonical asset is `spring-backend/src/main/resources/static/assets/mv39/favicon.ico` (Git blob `c102a9b1fe85e2d476e00eb82387f97dabb17cc0`). Use the **same original file**, unchanged, for browser favicon, desktop/mobile chrome, home hero and admin screens. Never certify generated mockup logo fidelity without verified pixel-identical source use.

**Only users with verified administrator privileges may see any admin navigation.** Do not render it for guests or regular users in desktop/mobile nav, drawers, home cards, shortcuts or search results. Enforce both server-rendered authorization and API/route RBAC; CSS hiding alone is insufficient. During pending authentication, default to hiding admin entries.

## Authority
[Approved Nov 18 desktop/mobile concepts](design/all-pages-v2026.11.18.12/README.md) and [adopted visual/i18n/chat spec](planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.md). Preserve spatial hierarchy, gameplay and banking flows, not just purple colors. Palette navy `#0C1020`, surface `#151D32`, violet `#9C83FF`; default EN with KO/JA/ZH/VI. Never expose `Translation unavailable`. Synthetic image values are not business data.

## Consolidated issue register
| ID | Problem | Acceptance |
| --- | --- | --- |
| UI-01 | Generic flat home rather than approved Nov 18 game-world design | PC/mobile screenshot and feature comparison |
| UI-02 | Incorrect generated W or crown emblem in imagery/code | Exact favicon asset reused everywhere |
| UI-03 | `Translation unavailable` and mixed-language strings | Five-locale/state validation |
| UI-04 | Admin navigation risks exposure to non-admins | Not in unauthenticated/non-admin DOM, mobile or search |
| UI-05 | Bank deposit/withdraw poor field/preset alignment and native bubble | Accessible inline errors, receipt-gated success |
| UI-06 | Daily rate and annual yield conflated | Source-bound separate daily/annual fields, no arbitrary conversion |
| UI-07 | Accelerated game clock not explained | [Policy](planning/SERVER_GAME_CLOCK_SPEC.md): 10 real min/server day, 7 server days/week; live values require verification |
| UI-08 | Spring game-clock database failure returns fake success/time | P0 fail-closed backend fix separately verified |
| UI-09 | Missing real gameplay/bank/admin data, former 403 errors | Role-specific real API/ledger/negative-path QA |
| UI-10 | Intrusive updates and flicker | In-place changes and reconnect/a11y QA |
| UI-11 | Authentication, policy/consent and favicon regression | Actual end-to-end tests |

## Image and assistant error history
Earlier generated concepts **failed brand fidelity** because the original favicon pixels were not used. Do not implement fabricated account balances, game date, interest or arbitrary game year definitions. Previous assistant also conflated static bank-page edits with the actual deposit/withdraw screen. PR #3393 was **closed without merging**, so linking its deleted branch caused 404; this is a new permanent-document PR. [Home UI PR #3395](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3395) now references the actual `favicon.ico` instead of `woldeok-official-icon.png` but awaits exact runtime QA.

## Controls and records
Original plans, historic worklogs, QA and releases remain unchanged. Review main SHA, approved Nov 18 references and actual favicon before future edits. Use independent branch, exact-SHA tests, role×locale×viewport QA, Test and controlled zero-downtime Production with rollback. This document is not proof of a deployment.
