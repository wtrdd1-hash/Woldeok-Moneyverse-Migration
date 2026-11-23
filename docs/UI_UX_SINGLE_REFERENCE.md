# UI/UX Single Reference — Current Favicon as the Sole Logo

> **Latest v2026.11.23.10:** all 180 PNGs file-QA pass; route-specific blog detail, bank, admin and other layouts revised. [New gallery](design/game-ui-v2026.11.23.10/README.md) and [image/feature QA](qa/2026-11-23-game-ui-180-image-feature-audit.md). Live feature acceptance, Test and Production remain unverified. Earlier v8 files preserved.

> **Current integrated change v2026.11.23.9:** This is the single reference for 180 actual newly generated PNGs, 180 Nov18 originals, shared UI candidate, exact existing favicon, admin-only navigation, server game clock, banking, data, i18n and QA. **180/180 new images uploaded; individual artistic approval, full runtime implementation, isolated Test and Production promotion remain OPEN.** Earlier NOT_STARTED statements are historical point-in-time records.


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


## 11. Owner directive — replace all 180 example design images (v2026.11.23.7)

**Status: IMPLEMENTATION_REQUIRED / NOT_STARTED.** Do not treat a gallery index as delivery. Generate, review and version **new game-economy visual example images for all 180 desktop/mobile route concepts** across home, admin, finance, game, auth, member, social, tools and legal. Preserve original Nov 18 PNGs untouched under `docs/design/all-pages-v2026.11.18.12/previews/`; put approved replacements in a new versioned design directory (e.g. `docs/design/game-ui-v2026.11.23.7/previews/`). The consolidated index must prefer approved replacement images but link back to originals for comparison. This change **does not generate or replace any PNGs**.

Mandatory gates:
1. Embed the **unchanged pixels of the current existing favicon** `/assets/mv39/favicon.ico`, not a generated lookalike W/crown logo.
2. Game progress, rewards, balances, trading quotes, interest, profiles and game dates must be grounded in supported features, otherwise explicitly marked synthetic proposal-only data.
3. **Only administrator-role concept screens may show admin navigation.** Guest/member desktop and mobile screenshots must omit it entirely. Real runtime must separately enforce server authorization.
4. Show the planned clock mapping `10 real min = 1 server day`, `7 server days = 1 server week` where applicable; do not fabricate current game date/status or confuse it with finance/security clocks.
5. Produce legible desktop and mobile images, check responsive structure/5 locales/accessibility and page-specific visual/functional fidelity. Palette-only recoloring or 180 duplicate generic cards is not acceptable.

Record `route / original_png / proposed_png / brand_check / game_clock_check / role_visibility_check / visual_diff / status / reviewer / approved_sha`, following `PLANNED → GENERATED → REVIEWED → APPROVED → IMPLEMENTED → TEST_VERIFIED`. Approved images and live implementation are separate acceptance milestones.

[All 180 originals](design/all-pages-v2026.11.18.12/README.md) · [route matrix PR #3397](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3397).

## v2026.11.23.8 actual visual image files

[New gallery of 180 game-style PNGs](design/game-ui-v2026.11.23.8/README.md) contains actual new PC/mobile route images with original favicon pixels and admin-role menu distinction. GENERATED_NOT_APPROVED: individual visual review and live implementation QA remain open.


## 12. Complete actual 180-page game-style image register (v2026.11.23.9)

- **180 real new PNG files**, status GENERATED_NOT_APPROVED, each with desktop/mobile layout; original favicon.ico pixels reused.
- **180 original Nov18 PNGs preserved.** Each row directly links to the new image and source original.
- This does NOT certify 180-route runtime implementation, artistic acceptance, live data, role security, locale coverage, Test/Production deployment. All separately gated.

| Route | Screen | Family | New candidate PNG | Original Nov18 PNG | Status |
| --- | --- | --- | --- | --- | --- |
| / | 홈 대시보드 | home | [NEW PNG](design/game-ui-v2026.11.23.10/previews/home.png) | [Original](design/all-pages-v2026.11.18.12/previews/home.png) | GENERATED_NOT_APPROVED |
| /[locale]/blog | 블로그 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/-locale--blog.png) | [Original](design/all-pages-v2026.11.18.12/previews/-locale--blog.png) | GENERATED_NOT_APPROVED |
| /[locale]/blog/[slug] | 블로그 · 상세 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/-locale--blog--slug-.png) | [Original](design/all-pages-v2026.11.18.12/previews/-locale--blog--slug-.png) | GENERATED_NOT_APPROVED |
| /[locale]/guide/glossary | 가이드 · 용어사전 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/-locale--guide-glossary.png) | [Original](design/all-pages-v2026.11.18.12/previews/-locale--guide-glossary.png) | GENERATED_NOT_APPROVED |
| /[locale]/guide/glossary/[term] | 가이드 · 용어사전 · 용어 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/-locale--guide-glossary--term-.png) | [Original](design/all-pages-v2026.11.18.12/previews/-locale--guide-glossary--term-.png) | GENERATED_NOT_APPROVED |
| /[locale]/tools/compound-interest-calculator | 금융 도구 · 복리 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/-locale--tools-compound-interest-calculator.png) | [Original](design/all-pages-v2026.11.18.12/previews/-locale--tools-compound-interest-calculator.png) | GENERATED_NOT_APPROVED |
| /[locale]/tools/compound-interest-calculator/[preset] | 금융 도구 · 복리 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/-locale--tools-compound-interest-calculator--preset-.png) | [Original](design/all-pages-v2026.11.18.12/previews/-locale--tools-compound-interest-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /account | 계정 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/account.png) | [Original](design/all-pages-v2026.11.18.12/previews/account.png) | GENERATED_NOT_APPROVED |
| /account-deletion | 계정 삭제 | legal | [NEW PNG](design/game-ui-v2026.11.23.10/previews/account-deletion.png) | [Original](design/all-pages-v2026.11.18.12/previews/account-deletion.png) | GENERATED_NOT_APPROVED |
| /account/notifications | 계정 · 알림 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/account-notifications.png) | [Original](design/all-pages-v2026.11.18.12/previews/account-notifications.png) | GENERATED_NOT_APPROVED |
| /account/privacy | 계정 · 개인정보 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/account-privacy.png) | [Original](design/all-pages-v2026.11.18.12/previews/account-privacy.png) | GENERATED_NOT_APPROVED |
| /account/security | 계정 · 보안 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/account-security.png) | [Original](design/all-pages-v2026.11.18.12/previews/account-security.png) | GENERATED_NOT_APPROVED |
| /admin | 관리자 대시보드 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin.png) | GENERATED_NOT_APPROVED |
| /admin/analytics | 관리자 · 분석 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-analytics.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-analytics.png) | GENERATED_NOT_APPROVED |
| /admin/api-health | 관리자 · API 상태 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-api-health.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-api-health.png) | GENERATED_NOT_APPROVED |
| /admin/bank | 관리자 · 은행 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-bank.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-bank.png) | GENERATED_NOT_APPROVED |
| /admin/blog | 관리자 · 블로그 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-blog.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-blog.png) | GENERATED_NOT_APPROVED |
| /admin/bonds | 관리자 · 국채 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-bonds.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-bonds.png) | GENERATED_NOT_APPROVED |
| /admin/catalog | 관리자 · 카탈로그 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-catalog.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-catalog.png) | GENERATED_NOT_APPROVED |
| /admin/central-bank | 관리자 · 중앙은행 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-central-bank.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-central-bank.png) | GENERATED_NOT_APPROVED |
| /admin/content | 관리자 · 콘텐츠 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-content.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-content.png) | GENERATED_NOT_APPROVED |
| /admin/controls | 관리자 · 기능 제어 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-controls.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-controls.png) | GENERATED_NOT_APPROVED |
| /admin/discord | 관리자 · 디스코드 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-discord.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-discord.png) | GENERATED_NOT_APPROVED |
| /admin/economy | 관리자 · 경제 운영 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-economy.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-economy.png) | GENERATED_NOT_APPROVED |
| /admin/economy/scenario-lab | 관리자 · 경제 운영 · 경제 시나리오 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-economy-scenario-lab.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-economy-scenario-lab.png) | GENERATED_NOT_APPROVED |
| /admin/enterprises | 관리자 · 국영기업 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-enterprises.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-enterprises.png) | GENERATED_NOT_APPROVED |
| /admin/fx | 관리자 · 외환 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-fx.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-fx.png) | GENERATED_NOT_APPROVED |
| /admin/help | 관리자 · 도움말 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-help.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-help.png) | GENERATED_NOT_APPROVED |
| /admin/kdic | 관리자 · 예금보험 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-kdic.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-kdic.png) | GENERATED_NOT_APPROVED |
| /admin/logs | 관리자 · 로그 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-logs.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-logs.png) | GENERATED_NOT_APPROVED |
| /admin/logs/activity | 관리자 · 로그 · 활동 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-logs-activity.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-logs-activity.png) | GENERATED_NOT_APPROVED |
| /admin/logs/delivery | 관리자 · 로그 · 전송 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-logs-delivery.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-logs-delivery.png) | GENERATED_NOT_APPROVED |
| /admin/logs/errors | 관리자 · 로그 · 오류 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-logs-errors.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-logs-errors.png) | GENERATED_NOT_APPROVED |
| /admin/logs/integrity | 관리자 · 로그 · 무결성 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-logs-integrity.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-logs-integrity.png) | GENERATED_NOT_APPROVED |
| /admin/logs/system | 관리자 · 로그 · 시스템 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-logs-system.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-logs-system.png) | GENERATED_NOT_APPROVED |
| /admin/market | 관리자 · 시장 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-market.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-market.png) | GENERATED_NOT_APPROVED |
| /admin/market/ai-news | 관리자 · 시장 · AI 뉴스 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-market-ai-news.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-market-ai-news.png) | GENERATED_NOT_APPROVED |
| /admin/mint | 관리자 · 조폐국 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-mint.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-mint.png) | GENERATED_NOT_APPROVED |
| /admin/money-flow | 관리자 · 자금 흐름 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-money-flow.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-money-flow.png) | GENERATED_NOT_APPROVED |
| /admin/operations/storage | 관리자 · 운영 · 저장소 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-operations-storage.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-operations-storage.png) | GENERATED_NOT_APPROVED |
| /admin/pension | 관리자 · 연금 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-pension.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-pension.png) | GENERATED_NOT_APPROVED |
| /admin/safety | 관리자 · 안전 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-safety.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-safety.png) | GENERATED_NOT_APPROVED |
| /admin/security | 관리자 · 보안 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-security.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-security.png) | GENERATED_NOT_APPROVED |
| /admin/seo | 관리자 · 검색 최적화 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-seo.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-seo.png) | GENERATED_NOT_APPROVED |
| /admin/seo-audit | 관리자 · SEO 감사 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-seo-audit.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-seo-audit.png) | GENERATED_NOT_APPROVED |
| /admin/shop | 관리자 · 상점 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-shop.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-shop.png) | GENERATED_NOT_APPROVED |
| /admin/support | 관리자 · 고객지원 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-support.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-support.png) | GENERATED_NOT_APPROVED |
| /admin/treasury | 관리자 · 국고 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-treasury.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-treasury.png) | GENERATED_NOT_APPROVED |
| /admin/treasury/grants | 관리자 · 국고 · 지원금 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-treasury-grants.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-treasury-grants.png) | GENERATED_NOT_APPROVED |
| /admin/users | 관리자 · 회원 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-users.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-users.png) | GENERATED_NOT_APPROVED |
| /admin/users/[id] | 관리자 · 회원 · 상세 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-users--id-.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-users--id-.png) | GENERATED_NOT_APPROVED |
| /admin/work | 관리자 · 직업 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-work.png) | [Original](design/all-pages-v2026.11.18.12/previews/admin-work.png) | GENERATED_NOT_APPROVED |
| /advisor | 자산 가이드 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/advisor.png) | [Original](design/all-pages-v2026.11.18.12/previews/advisor.png) | GENERATED_NOT_APPROVED |
| /announcements | 공지사항 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/announcements.png) | [Original](design/all-pages-v2026.11.18.12/previews/announcements.png) | GENERATED_NOT_APPROVED |
| /announcements/[announcementId] | 공지사항 · 공지 상세 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/announcements--announcementId-.png) | [Original](design/all-pages-v2026.11.18.12/previews/announcements--announcementId-.png) | GENERATED_NOT_APPROVED |
| /arcade | 아케이드 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/arcade.png) | [Original](design/all-pages-v2026.11.18.12/previews/arcade.png) | GENERATED_NOT_APPROVED |
| /bank | 은행 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/bank.png) | [Original](design/all-pages-v2026.11.18.12/previews/bank.png) | GENERATED_NOT_APPROVED |
| /bank/savings-pot | 은행 · 적금 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/bank-savings-pot.png) | [Original](design/all-pages-v2026.11.18.12/previews/bank-savings-pot.png) | GENERATED_NOT_APPROVED |
| /blog | 블로그 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/blog.png) | [Original](design/all-pages-v2026.11.18.12/previews/blog.png) | GENERATED_NOT_APPROVED |
| /blog/[slug] | 블로그 · 상세 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/blog--slug-.png) | [Original](design/all-pages-v2026.11.18.12/previews/blog--slug-.png) | GENERATED_NOT_APPROVED |
| /board | 게시판 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/board.png) | [Original](design/all-pages-v2026.11.18.12/previews/board.png) | GENERATED_NOT_APPROVED |
| /board/[postId] | 게시판 · 게시글 상세 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/board--postId-.png) | [Original](design/all-pages-v2026.11.18.12/previews/board--postId-.png) | GENERATED_NOT_APPROVED |
| /bonds | 국채 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/bonds.png) | [Original](design/all-pages-v2026.11.18.12/previews/bonds.png) | GENERATED_NOT_APPROVED |
| /businesses | 사업 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/businesses.png) | [Original](design/all-pages-v2026.11.18.12/previews/businesses.png) | GENERATED_NOT_APPROVED |
| /businesses/ventures | 사업 · 스타트업 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/businesses-ventures.png) | [Original](design/all-pages-v2026.11.18.12/previews/businesses-ventures.png) | GENERATED_NOT_APPROVED |
| /calculators | 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/calculators.png) | [Original](design/all-pages-v2026.11.18.12/previews/calculators.png) | GENERATED_NOT_APPROVED |
| /calendar | 일정 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/calendar.png) | [Original](design/all-pages-v2026.11.18.12/previews/calendar.png) | GENERATED_NOT_APPROVED |
| /casino | 카지노 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/casino.png) | [Original](design/all-pages-v2026.11.18.12/previews/casino.png) | GENERATED_NOT_APPROVED |
| /central-bank | 중앙은행 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/central-bank.png) | [Original](design/all-pages-v2026.11.18.12/previews/central-bank.png) | GENERATED_NOT_APPROVED |
| /chat | 채팅 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/chat.png) | [Original](design/all-pages-v2026.11.18.12/previews/chat.png) | GENERATED_NOT_APPROVED |
| /clubs | 클럽 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/clubs.png) | [Original](design/all-pages-v2026.11.18.12/previews/clubs.png) | GENERATED_NOT_APPROVED |
| /clubs/[clubId] | 클럽 · 클럽 상세 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/clubs--clubId-.png) | [Original](design/all-pages-v2026.11.18.12/previews/clubs--clubId-.png) | GENERATED_NOT_APPROVED |
| /clubs/[clubId]/members | 클럽 · 클럽 상세 · 멤버 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/clubs--clubId--members.png) | [Original](design/all-pages-v2026.11.18.12/previews/clubs--clubId--members.png) | GENERATED_NOT_APPROVED |
| /clubs/new | 클럽 · 신규 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/clubs-new.png) | [Original](design/all-pages-v2026.11.18.12/previews/clubs-new.png) | GENERATED_NOT_APPROVED |
| /clubs/warfare | 클럽 · 클럽전 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/clubs-warfare.png) | [Original](design/all-pages-v2026.11.18.12/previews/clubs-warfare.png) | GENERATED_NOT_APPROVED |
| /collections | 컬렉션 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/collections.png) | [Original](design/all-pages-v2026.11.18.12/previews/collections.png) | GENERATED_NOT_APPROVED |
| /dashboard | 대시보드 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/dashboard.png) | [Original](design/all-pages-v2026.11.18.12/previews/dashboard.png) | GENERATED_NOT_APPROVED |
| /data-deletion | 데이터 삭제 | legal | [NEW PNG](design/game-ui-v2026.11.23.10/previews/data-deletion.png) | [Original](design/all-pages-v2026.11.18.12/previews/data-deletion.png) | GENERATED_NOT_APPROVED |
| /design-preview | 디자인 미리보기 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/design-preview.png) | [Original](design/all-pages-v2026.11.18.12/previews/design-preview.png) | GENERATED_NOT_APPROVED |
| /developer | 개발자 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/developer.png) | [Original](design/all-pages-v2026.11.18.12/previews/developer.png) | GENERATED_NOT_APPROVED |
| /enterprises | 국영기업 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/enterprises.png) | [Original](design/all-pages-v2026.11.18.12/previews/enterprises.png) | GENERATED_NOT_APPROVED |
| /features | 기능 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/features.png) | [Original](design/all-pages-v2026.11.18.12/previews/features.png) | GENERATED_NOT_APPROVED |
| /forgot-password | 비밀번호 찾기 | auth | [NEW PNG](design/game-ui-v2026.11.23.10/previews/forgot-password.png) | [Original](design/all-pages-v2026.11.18.12/previews/forgot-password.png) | GENERATED_NOT_APPROVED |
| /fx | 외환 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/fx.png) | [Original](design/all-pages-v2026.11.18.12/previews/fx.png) | GENERATED_NOT_APPROVED |
| /gallery | 갤러리 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/gallery.png) | [Original](design/all-pages-v2026.11.18.12/previews/gallery.png) | GENERATED_NOT_APPROVED |
| /gallery/[photoId] | 갤러리 · 사진 상세 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/gallery--photoId-.png) | [Original](design/all-pages-v2026.11.18.12/previews/gallery--photoId-.png) | GENERATED_NOT_APPROVED |
| /gallery/submit | 갤러리 · 등록 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/gallery-submit.png) | [Original](design/all-pages-v2026.11.18.12/previews/gallery-submit.png) | GENERATED_NOT_APPROVED |
| /guide | 가이드 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/guide.png) | [Original](design/all-pages-v2026.11.18.12/previews/guide.png) | GENERATED_NOT_APPROVED |
| /guide/career-mastery | 가이드 · 직업 숙련 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/guide-career-mastery.png) | [Original](design/all-pages-v2026.11.18.12/previews/guide-career-mastery.png) | GENERATED_NOT_APPROVED |
| /guide/dopamine-system | 가이드 · 성장 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/guide-dopamine-system.png) | [Original](design/all-pages-v2026.11.18.12/previews/guide-dopamine-system.png) | GENERATED_NOT_APPROVED |
| /guide/glossary | 가이드 · 용어사전 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/guide-glossary.png) | [Original](design/all-pages-v2026.11.18.12/previews/guide-glossary.png) | GENERATED_NOT_APPROVED |
| /guide/glossary/[term] | 가이드 · 용어사전 · 용어 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/guide-glossary--term-.png) | [Original](design/all-pages-v2026.11.18.12/previews/guide-glossary--term-.png) | GENERATED_NOT_APPROVED |
| /guide/stock-trading | 가이드 · 주식 거래 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/guide-stock-trading.png) | [Original](design/all-pages-v2026.11.18.12/previews/guide-stock-trading.png) | GENERATED_NOT_APPROVED |
| /guide/virtual-banking | 가이드 · 가상 은행 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/guide-virtual-banking.png) | [Original](design/all-pages-v2026.11.18.12/previews/guide-virtual-banking.png) | GENERATED_NOT_APPROVED |
| /help | 도움말 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/help.png) | [Original](design/all-pages-v2026.11.18.12/previews/help.png) | GENERATED_NOT_APPROVED |
| /help/[slug] | 도움말 · 상세 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/help--slug-.png) | [Original](design/all-pages-v2026.11.18.12/previews/help--slug-.png) | GENERATED_NOT_APPROVED |
| /inventory | 보관함 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/inventory.png) | [Original](design/all-pages-v2026.11.18.12/previews/inventory.png) | GENERATED_NOT_APPROVED |
| /invite/[code] | 초대 · 초대 링크 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/invite--code-.png) | [Original](design/all-pages-v2026.11.18.12/previews/invite--code-.png) | GENERATED_NOT_APPROVED |
| /kdic | 예금보험 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/kdic.png) | [Original](design/all-pages-v2026.11.18.12/previews/kdic.png) | GENERATED_NOT_APPROVED |
| /lobby | 로비 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/lobby.png) | [Original](design/all-pages-v2026.11.18.12/previews/lobby.png) | GENERATED_NOT_APPROVED |
| /login | 로그인 | auth | [NEW PNG](design/game-ui-v2026.11.23.10/previews/login.png) | [Original](design/all-pages-v2026.11.18.12/previews/login.png) | GENERATED_NOT_APPROVED |
| /login/providers | 로그인 · 소셜 인증 | auth | [NEW PNG](design/game-ui-v2026.11.23.10/previews/login-providers.png) | [Original](design/all-pages-v2026.11.18.12/previews/login-providers.png) | GENERATED_NOT_APPROVED |
| /marketplace | 마켓 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/marketplace.png) | [Original](design/all-pages-v2026.11.18.12/previews/marketplace.png) | GENERATED_NOT_APPROVED |
| /marketplace/auction | 마켓 · 경매 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/marketplace-auction.png) | [Original](design/all-pages-v2026.11.18.12/previews/marketplace-auction.png) | GENERATED_NOT_APPROVED |
| /mint | 조폐국 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/mint.png) | [Original](design/all-pages-v2026.11.18.12/previews/mint.png) | GENERATED_NOT_APPROVED |
| /newspaper | 신문 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/newspaper.png) | [Original](design/all-pages-v2026.11.18.12/previews/newspaper.png) | GENERATED_NOT_APPROVED |
| /pension | 연금 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/pension.png) | [Original](design/all-pages-v2026.11.18.12/previews/pension.png) | GENERATED_NOT_APPROVED |
| /prediction | 예측 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/prediction.png) | [Original](design/all-pages-v2026.11.18.12/previews/prediction.png) | GENERATED_NOT_APPROVED |
| /privacy | 개인정보 | legal | [NEW PNG](design/game-ui-v2026.11.23.10/previews/privacy.png) | [Original](design/all-pages-v2026.11.18.12/previews/privacy.png) | GENERATED_NOT_APPROVED |
| /profile | 프로필 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/profile.png) | [Original](design/all-pages-v2026.11.18.12/previews/profile.png) | GENERATED_NOT_APPROVED |
| /profile/[userId] | 프로필 · 사용자 상세 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/profile--userId-.png) | [Original](design/all-pages-v2026.11.18.12/previews/profile--userId-.png) | GENERATED_NOT_APPROVED |
| /profile/settings | 프로필 · 설정 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/profile-settings.png) | [Original](design/all-pages-v2026.11.18.12/previews/profile-settings.png) | GENERATED_NOT_APPROVED |
| /progression | 성장 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/progression.png) | [Original](design/all-pages-v2026.11.18.12/previews/progression.png) | GENERATED_NOT_APPROVED |
| /progression/prestige | 성장 · 명성 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/progression-prestige.png) | [Original](design/all-pages-v2026.11.18.12/previews/progression-prestige.png) | GENERATED_NOT_APPROVED |
| /quests | 퀘스트 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/quests.png) | [Original](design/all-pages-v2026.11.18.12/previews/quests.png) | GENERATED_NOT_APPROVED |
| /register | 회원가입 | auth | [NEW PNG](design/game-ui-v2026.11.23.10/previews/register.png) | [Original](design/all-pages-v2026.11.18.12/previews/register.png) | GENERATED_NOT_APPROVED |
| /reset-password | 비밀번호 재설정 | auth | [NEW PNG](design/game-ui-v2026.11.23.10/previews/reset-password.png) | [Original](design/all-pages-v2026.11.18.12/previews/reset-password.png) | GENERATED_NOT_APPROVED |
| /roadmap | 로드맵 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/roadmap.png) | [Original](design/all-pages-v2026.11.18.12/previews/roadmap.png) | GENERATED_NOT_APPROVED |
| /safety | 안전 | legal | [NEW PNG](design/game-ui-v2026.11.23.10/previews/safety.png) | [Original](design/all-pages-v2026.11.18.12/previews/safety.png) | GENERATED_NOT_APPROVED |
| /safety/takedown | 안전 · 게시 중단 | legal | [NEW PNG](design/game-ui-v2026.11.23.10/previews/safety-takedown.png) | [Original](design/all-pages-v2026.11.18.12/previews/safety-takedown.png) | GENERATED_NOT_APPROVED |
| /search | 검색 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/search.png) | [Original](design/all-pages-v2026.11.18.12/previews/search.png) | GENERATED_NOT_APPROVED |
| /seasons | 시즌 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/seasons.png) | [Original](design/all-pages-v2026.11.18.12/previews/seasons.png) | GENERATED_NOT_APPROVED |
| /shop | 상점 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/shop.png) | [Original](design/all-pages-v2026.11.18.12/previews/shop.png) | GENERATED_NOT_APPROVED |
| /shop/catalog | 상점 · 카탈로그 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/shop-catalog.png) | [Original](design/all-pages-v2026.11.18.12/previews/shop-catalog.png) | GENERATED_NOT_APPROVED |
| /spaces | 공간 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/spaces.png) | [Original](design/all-pages-v2026.11.18.12/previews/spaces.png) | GENERATED_NOT_APPROVED |
| /spaces/real-estate | 공간 · 부동산 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/spaces-real-estate.png) | [Original](design/all-pages-v2026.11.18.12/previews/spaces-real-estate.png) | GENERATED_NOT_APPROVED |
| /status | 상태 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/status.png) | [Original](design/all-pages-v2026.11.18.12/previews/status.png) | GENERATED_NOT_APPROVED |
| /stocks | 주식 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/stocks.png) | [Original](design/all-pages-v2026.11.18.12/previews/stocks.png) | GENERATED_NOT_APPROVED |
| /stocks/[symbol] | 주식 · 종목 상세 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/stocks--symbol-.png) | [Original](design/all-pages-v2026.11.18.12/previews/stocks--symbol-.png) | GENERATED_NOT_APPROVED |
| /stocks/alerts | 주식 · 알림 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/stocks-alerts.png) | [Original](design/all-pages-v2026.11.18.12/previews/stocks-alerts.png) | GENERATED_NOT_APPROVED |
| /stocks/community | 주식 · 토론 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/stocks-community.png) | [Original](design/all-pages-v2026.11.18.12/previews/stocks-community.png) | GENERATED_NOT_APPROVED |
| /stocks/compare | 주식 · 비교 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/stocks-compare.png) | [Original](design/all-pages-v2026.11.18.12/previews/stocks-compare.png) | GENERATED_NOT_APPROVED |
| /stocks/derivatives | 주식 · 파생상품 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/stocks-derivatives.png) | [Original](design/all-pages-v2026.11.18.12/previews/stocks-derivatives.png) | GENERATED_NOT_APPROVED |
| /stocks/history | 주식 · 내역 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/stocks-history.png) | [Original](design/all-pages-v2026.11.18.12/previews/stocks-history.png) | GENERATED_NOT_APPROVED |
| /stocks/league | 주식 · 리그 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/stocks-league.png) | [Original](design/all-pages-v2026.11.18.12/previews/stocks-league.png) | GENERATED_NOT_APPROVED |
| /stocks/portfolio | 주식 · 포트폴리오 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/stocks-portfolio.png) | [Original](design/all-pages-v2026.11.18.12/previews/stocks-portfolio.png) | GENERATED_NOT_APPROVED |
| /stocks/watchlist | 주식 · 관심종목 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/stocks-watchlist.png) | [Original](design/all-pages-v2026.11.18.12/previews/stocks-watchlist.png) | GENERATED_NOT_APPROVED |
| /support | 고객지원 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/support.png) | [Original](design/all-pages-v2026.11.18.12/previews/support.png) | GENERATED_NOT_APPROVED |
| /terms | 이용약관 | legal | [NEW PNG](design/game-ui-v2026.11.23.10/previews/terms.png) | [Original](design/all-pages-v2026.11.18.12/previews/terms.png) | GENERATED_NOT_APPROVED |
| /tools | 금융 도구 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools.png) | GENERATED_NOT_APPROVED |
| /tools/capital-gains-tax-calculator | 금융 도구 · 양도세 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-capital-gains-tax-calculator.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-capital-gains-tax-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/capital-gains-tax-calculator/[preset] | 금융 도구 · 양도세 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-capital-gains-tax-calculator--preset-.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-capital-gains-tax-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /tools/compound-calculator | 금융 도구 · 복리 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-compound-calculator.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-compound-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/compound-calculator/[preset] | 금융 도구 · 복리 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-compound-calculator--preset-.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-compound-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /tools/crypto-apy-calculator | 금융 도구 · 가상자산 수익률 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-crypto-apy-calculator.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-crypto-apy-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/dividend-tax-calculator | 금융 도구 · 배당세 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-dividend-tax-calculator.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-dividend-tax-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/dividend-tax-calculator/[ticker] | 금융 도구 · 배당세 계산기 · 종목 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-dividend-tax-calculator--ticker-.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-dividend-tax-calculator--ticker-.png) | GENERATED_NOT_APPROVED |
| /tools/farming-calculator | 금융 도구 · 직업 수익 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-farming-calculator.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-farming-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/farming-calculator/[preset] | 금융 도구 · 직업 수익 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-farming-calculator--preset-.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-farming-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /tools/fire-calculator | 금융 도구 · 경제적 자유 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-fire-calculator.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-fire-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/gift-tax-calculator | 금융 도구 · 증여세 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-gift-tax-calculator.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-gift-tax-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/gift-tax-calculator/[preset] | 금융 도구 · 증여세 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-gift-tax-calculator--preset-.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-gift-tax-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /tools/goal-wealth-calculator | 금융 도구 · 목표 자산 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-goal-wealth-calculator.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-goal-wealth-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/isa-calculator | 금융 도구 · ISA 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-isa-calculator.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-isa-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/isa-calculator/[slug] | 금융 도구 · ISA 계산기 · 상세 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-isa-calculator--slug-.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-isa-calculator--slug-.png) | GENERATED_NOT_APPROVED |
| /tools/kimchi-premium-calculator | 금융 도구 · 김치 프리미엄 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-kimchi-premium-calculator.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-kimchi-premium-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/kimchi-premium-calculator/[preset] | 금융 도구 · 김치 프리미엄 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-kimchi-premium-calculator--preset-.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-kimchi-premium-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /tools/loan-interest-calculator | 금융 도구 · 대출 이자 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-loan-interest-calculator.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-loan-interest-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/loan-interest-calculator/[preset] | 금융 도구 · 대출 이자 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-loan-interest-calculator--preset-.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-loan-interest-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /tools/pension-tax-calculator | 금융 도구 · 연금 세금 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-pension-tax-calculator.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-pension-tax-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/pension-tax-calculator/[slug] | 금융 도구 · 연금 세금 계산기 · 상세 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-pension-tax-calculator--slug-.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-pension-tax-calculator--slug-.png) | GENERATED_NOT_APPROVED |
| /tools/quant-studio | 금융 도구 · 퀀트 스튜디오 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-quant-studio.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-quant-studio.png) | GENERATED_NOT_APPROVED |
| /tools/real-estate-calculator | 금융 도구 · 부동산 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-real-estate-calculator.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-real-estate-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/real-estate-calculator/[preset] | 금융 도구 · 부동산 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-real-estate-calculator--preset-.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-real-estate-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /tools/retirement-calculator | 금융 도구 · 은퇴 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-retirement-calculator.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-retirement-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/retirement-calculator/[slug] | 금융 도구 · 은퇴 계산기 · 상세 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-retirement-calculator--slug-.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-retirement-calculator--slug-.png) | GENERATED_NOT_APPROVED |
| /tools/salary-calculator | 금융 도구 · 급여 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-salary-calculator.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-salary-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/salary-calculator/[preset] | 금융 도구 · 급여 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-salary-calculator--preset-.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-salary-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /tools/stock-calculator | 금융 도구 · 주식 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-stock-calculator.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-stock-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/stock-calculator/[preset] | 금융 도구 · 주식 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-stock-calculator--preset-.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-stock-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /tools/tax-calculator | 금융 도구 · 세금 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-tax-calculator.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-tax-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/youth-leap-calculator | 금융 도구 · 청년도약 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-youth-leap-calculator.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-youth-leap-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/youth-leap-calculator/[preset] | 금융 도구 · 청년도약 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-youth-leap-calculator--preset-.png) | [Original](design/all-pages-v2026.11.18.12/previews/tools-youth-leap-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /treasury | 국고 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/treasury.png) | [Original](design/all-pages-v2026.11.18.12/previews/treasury.png) | GENERATED_NOT_APPROVED |
| /verify-email | 이메일 확인 | auth | [NEW PNG](design/game-ui-v2026.11.23.10/previews/verify-email.png) | [Original](design/all-pages-v2026.11.18.12/previews/verify-email.png) | GENERATED_NOT_APPROVED |
| /verify-email-change | 이메일 변경 확인 | auth | [NEW PNG](design/game-ui-v2026.11.23.10/previews/verify-email-change.png) | [Original](design/all-pages-v2026.11.18.12/previews/verify-email-change.png) | GENERATED_NOT_APPROVED |
| /wallet | 지갑 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/wallet.png) | [Original](design/all-pages-v2026.11.18.12/previews/wallet.png) | GENERATED_NOT_APPROVED |
| /wallet/activity | 지갑 · 활동 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/wallet-activity.png) | [Original](design/all-pages-v2026.11.18.12/previews/wallet-activity.png) | GENERATED_NOT_APPROVED |
| /wallet/activity/transactions/[transactionId] | 지갑 · 활동 · 거래 상세 · 거래 상세 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/wallet-activity-transactions--transactionId-.png) | [Original](design/all-pages-v2026.11.18.12/previews/wallet-activity-transactions--transactionId-.png) | GENERATED_NOT_APPROVED |
| /work | 직업 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/work.png) | [Original](design/all-pages-v2026.11.18.12/previews/work.png) | GENERATED_NOT_APPROVED |

> **Additional 180-route isolated Test GET probe v2026.11.23.10:** 200=132 / 302=42 / 401=3 / 405=1 / 503=2; 33 non-home routes returned home dashboard title. Test 503 on /status and /stocks/derivatives. [Full 180-route QA](qa/2026-11-23-game-ui-180-image-feature-audit.md). Not end-to-end functional acceptance.
