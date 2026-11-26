# UI/UX Single Reference — Current Favicon as the Sole Logo

> **Current rules — v2026.11.27.PLAN-AUDIT.2:** [EN authority](DOCUMENT_AUTHORITY.md) / [한국어](DOCUMENT_AUTHORITY.ko.md). Owner-approved target: Next.js/React frontend + same-origin BFF + authoritative Spring API; G2 design per CURRENT_UI_DESIGN and actual favicon; administrator access denied to guests and non-admins. Automatic image preparation is allowed; actual Production cutover needs separate approval after independent Test. Dated technology/runtime claims below are historical snapshots; business/security requirements retain their adopted scope. No whole-site implementation or runtime acceptance is implied.


> **Current visual authority v2026.11.27.PLAN-AUDIT.2:** [G2 only](design/CURRENT_UI_DESIGN.md) · [180-route manifest](design/CURRENT_UI_DESIGN_MANIFEST.json). Server-side admin access denial. All prior images historical only.

> **Historical v2026.11.23.10:** all 180 PNGs file-QA pass; route-specific blog detail, bank, admin and other layouts revised. [New gallery](design/game-ui-v2026.11.23.10/README.md) and [image/feature QA](qa/2026-11-23-game-ui-180-image-feature-audit.md). Live feature acceptance, Test and Production remain unverified. Earlier v8 files preserved.

> **Historical integrated change v2026.11.23.9:** This is the single reference for 180 actual newly generated PNGs, 180 Nov18 originals, shared UI candidate, exact existing favicon, admin-only navigation, server game clock, banking, data, i18n and QA. **180/180 new images uploaded; individual artistic approval, full runtime implementation, isolated Test and Production promotion remain OPEN.** Earlier NOT_STARTED statements are historical point-in-time records.


> v2026.11.23.5 · PLANNING / QA OPEN · [한국어](UI_UX_SINGLE_REFERENCE.ko.md) · main baseline `9876c09888ec84034eec183cf1309c85df3d7447`

## Binding owner instructions
**The currently used site favicon is the official logo.** Never substitute a generated W icon or crown/laurel emblem. The canonical asset is `spring-backend/src/main/resources/static/assets/mv39/favicon.ico` (Git blob `c102a9b1fe85e2d476e00eb82387f97dabb17cc0`). Use the **same original file**, unchanged, for browser favicon, desktop/mobile chrome, home hero and admin screens. Never certify generated mockup logo fidelity without verified pixel-identical source use.

**Only users with verified administrator privileges may see any admin navigation.** Do not render it for guests or regular users in desktop/mobile nav, drawers, home cards, shortcuts or search results. Enforce both server-rendered authorization and API/route RBAC; CSS hiding alone is insufficient. During pending authentication, default to hiding admin entries.

## Authority
The binding visual source is [G2](design/CURRENT_UI_DESIGN.md) only. Preserve [adopted functional, localization and chat requirements](planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.md) and server-side admin authorization. Distinguish live API values from labeled illustration.

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
Original plans, historic worklogs, QA and releases remain unchanged. Review main SHA, active G2 image authority and actual favicon before future edits. Use independent branch, exact-SHA tests, role×locale×viewport QA, Test and controlled zero-downtime Production with rollback. This document is not proof of a deployment.


## 11. Owner directive — replace all 180 example design images (v2026.11.23.7)

**Historical v2026.11.23.7 directive (superseded for visual image selection).** Do not treat a gallery index as delivery. Generate, review and version **new game-economy visual example images for all 180 desktop/mobile route concepts** across home, admin, finance, game, auth, member, social, tools and legal. Preserve original Nov 18 PNGs untouched in the Nov18 historical archive; put approved replacements in a new versioned design directory (e.g. `docs/design/game-ui-v2026.11.23.7/previews/`). The original requirement asked for comparison links; the current active index deliberately shows only v10. This change **does not generate or replace any PNGs**.

Mandatory gates:
1. Embed the **unchanged pixels of the current existing favicon** `/assets/mv39/favicon.ico`, not a generated lookalike W/crown logo.
2. Game progress, rewards, balances, trading quotes, interest, profiles and game dates must be grounded in supported features, otherwise explicitly marked synthetic proposal-only data.
3. **Only administrator-role concept screens may show admin navigation.** Guest/member desktop and mobile screenshots must omit it entirely. Real runtime must separately enforce server authorization.
4. Show the planned clock mapping `10 real min = 1 server day`, `7 server days = 1 server week` where applicable; do not fabricate current game date/status or confuse it with finance/security clocks.
5. Produce legible desktop and mobile images, check responsive structure/5 locales/accessibility and page-specific visual/functional fidelity. Palette-only recoloring or 180 duplicate generic cards is not acceptable.

Record `route / original_png / proposed_png / brand_check / game_clock_check / role_visibility_check / visual_diff / status / reviewer / approved_sha`, following `PLANNED → GENERATED → REVIEWED → APPROVED → IMPLEMENTED → TEST_VERIFIED`. Approved images and live implementation are separate acceptance milestones.

[All 180 originals](design/all-pages-v2026.11.18.12/README.md) · [route matrix PR #3397](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3397).

## ARCHIVE ONLY: v2026.11.23.8 image history

[Historical v8 gallery](design/game-ui-v2026.11.23.8/README.md) records previous PC/mobile concepts; **do not use it for implementation or fallback**. GENERATED_NOT_APPROVED: individual visual review and live implementation QA remain open.


## 12. Current G2 180-route visual reference index

- 180 actual G2 PNGs, 1680×1000, archetype-based desktop/mobile examples; individual artistic, functional and runtime acceptance remains open. Prior assets historical only. Administrator screens are administrator-only.

| Route | Screen | Family | G2 PNG | Status |
| --- | --- | --- | --- | --- |
| / | 홈 대시보드 | home | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/home.png) | REFERENCE_ONLY_QA_OPEN |
| /[locale]/blog | 블로그 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/-locale--blog.png) | REFERENCE_ONLY_QA_OPEN |
| /[locale]/blog/[slug] | 블로그 · 상세 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/-locale--blog--slug-.png) | REFERENCE_ONLY_QA_OPEN |
| /[locale]/guide/glossary | 가이드 · 용어사전 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/-locale--guide-glossary.png) | REFERENCE_ONLY_QA_OPEN |
| /[locale]/guide/glossary/[term] | 가이드 · 용어사전 · 용어 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/-locale--guide-glossary--term-.png) | REFERENCE_ONLY_QA_OPEN |
| /[locale]/tools/compound-interest-calculator | 금융 도구 · 복리 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/-locale--tools-compound-interest-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /[locale]/tools/compound-interest-calculator/[preset] | 금융 도구 · 복리 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/-locale--tools-compound-interest-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /account | 계정 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/account.png) | REFERENCE_ONLY_QA_OPEN |
| /account-deletion | 계정 삭제 | legal | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/account-deletion.png) | REFERENCE_ONLY_QA_OPEN |
| /account/notifications | 계정 · 알림 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/account-notifications.png) | REFERENCE_ONLY_QA_OPEN |
| /account/privacy | 계정 · 개인정보 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/account-privacy.png) | REFERENCE_ONLY_QA_OPEN |
| /account/security | 계정 · 보안 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/account-security.png) | REFERENCE_ONLY_QA_OPEN |
| /admin | 관리자 대시보드 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/analytics | 관리자 · 분석 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-analytics.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/api-health | 관리자 · API 상태 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-api-health.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/bank | 관리자 · 은행 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-bank.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/blog | 관리자 · 블로그 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-blog.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/bonds | 관리자 · 국채 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-bonds.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/catalog | 관리자 · 카탈로그 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-catalog.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/central-bank | 관리자 · 중앙은행 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-central-bank.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/content | 관리자 · 콘텐츠 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-content.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/controls | 관리자 · 기능 제어 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-controls.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/discord | 관리자 · 디스코드 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-discord.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/economy | 관리자 · 경제 운영 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-economy.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/economy/scenario-lab | 관리자 · 경제 운영 · 경제 시나리오 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-economy-scenario-lab.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/enterprises | 관리자 · 국영기업 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-enterprises.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/fx | 관리자 · 외환 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-fx.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/help | 관리자 · 도움말 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-help.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/kdic | 관리자 · 예금보험 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-kdic.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/logs | 관리자 · 로그 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-logs.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/logs/activity | 관리자 · 로그 · 활동 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-logs-activity.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/logs/delivery | 관리자 · 로그 · 전송 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-logs-delivery.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/logs/errors | 관리자 · 로그 · 오류 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-logs-errors.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/logs/integrity | 관리자 · 로그 · 무결성 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-logs-integrity.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/logs/system | 관리자 · 로그 · 시스템 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-logs-system.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/market | 관리자 · 시장 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-market.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/market/ai-news | 관리자 · 시장 · AI 뉴스 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-market-ai-news.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/mint | 관리자 · 조폐국 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-mint.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/money-flow | 관리자 · 자금 흐름 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-money-flow.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/operations/storage | 관리자 · 운영 · 저장소 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-operations-storage.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/pension | 관리자 · 연금 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-pension.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/safety | 관리자 · 안전 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-safety.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/security | 관리자 · 보안 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-security.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/seo | 관리자 · 검색 최적화 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-seo.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/seo-audit | 관리자 · SEO 감사 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-seo-audit.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/shop | 관리자 · 상점 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-shop.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/support | 관리자 · 고객지원 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-support.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/treasury | 관리자 · 국고 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-treasury.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/treasury/grants | 관리자 · 국고 · 지원금 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-treasury-grants.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/users | 관리자 · 회원 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-users.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/users/[id] | 관리자 · 회원 · 상세 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-users--id-.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/work | 관리자 · 직업 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-work.png) | REFERENCE_ONLY_QA_OPEN |
| /advisor | 자산 가이드 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/advisor.png) | REFERENCE_ONLY_QA_OPEN |
| /announcements | 공지사항 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/announcements.png) | REFERENCE_ONLY_QA_OPEN |
| /announcements/[announcementId] | 공지사항 · 공지 상세 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/announcements--announcementId-.png) | REFERENCE_ONLY_QA_OPEN |
| /arcade | 아케이드 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/arcade.png) | REFERENCE_ONLY_QA_OPEN |
| /bank | 은행 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/bank.png) | REFERENCE_ONLY_QA_OPEN |
| /bank/savings-pot | 은행 · 적금 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/bank-savings-pot.png) | REFERENCE_ONLY_QA_OPEN |
| /blog | 블로그 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/blog.png) | REFERENCE_ONLY_QA_OPEN |
| /blog/[slug] | 블로그 · 상세 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/blog--slug-.png) | REFERENCE_ONLY_QA_OPEN |
| /board | 게시판 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/board.png) | REFERENCE_ONLY_QA_OPEN |
| /board/[postId] | 게시판 · 게시글 상세 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/board--postId-.png) | REFERENCE_ONLY_QA_OPEN |
| /bonds | 국채 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/bonds.png) | REFERENCE_ONLY_QA_OPEN |
| /businesses | 사업 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/businesses.png) | REFERENCE_ONLY_QA_OPEN |
| /businesses/ventures | 사업 · 스타트업 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/businesses-ventures.png) | REFERENCE_ONLY_QA_OPEN |
| /calculators | 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/calculators.png) | REFERENCE_ONLY_QA_OPEN |
| /calendar | 일정 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/calendar.png) | REFERENCE_ONLY_QA_OPEN |
| /casino | 카지노 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/casino.png) | REFERENCE_ONLY_QA_OPEN |
| /central-bank | 중앙은행 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/central-bank.png) | REFERENCE_ONLY_QA_OPEN |
| /chat | 채팅 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/chat.png) | REFERENCE_ONLY_QA_OPEN |
| /clubs | 클럽 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/clubs.png) | REFERENCE_ONLY_QA_OPEN |
| /clubs/[clubId] | 클럽 · 클럽 상세 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/clubs--clubId-.png) | REFERENCE_ONLY_QA_OPEN |
| /clubs/[clubId]/members | 클럽 · 클럽 상세 · 멤버 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/clubs--clubId--members.png) | REFERENCE_ONLY_QA_OPEN |
| /clubs/new | 클럽 · 신규 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/clubs-new.png) | REFERENCE_ONLY_QA_OPEN |
| /clubs/warfare | 클럽 · 클럽전 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/clubs-warfare.png) | REFERENCE_ONLY_QA_OPEN |
| /collections | 컬렉션 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/collections.png) | REFERENCE_ONLY_QA_OPEN |
| /dashboard | 대시보드 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/dashboard.png) | REFERENCE_ONLY_QA_OPEN |
| /data-deletion | 데이터 삭제 | legal | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/data-deletion.png) | REFERENCE_ONLY_QA_OPEN |
| /design-preview | 디자인 미리보기 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/design-preview.png) | REFERENCE_ONLY_QA_OPEN |
| /developer | 개발자 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/developer.png) | REFERENCE_ONLY_QA_OPEN |
| /enterprises | 국영기업 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/enterprises.png) | REFERENCE_ONLY_QA_OPEN |
| /features | 기능 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/features.png) | REFERENCE_ONLY_QA_OPEN |
| /forgot-password | 비밀번호 찾기 | auth | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/forgot-password.png) | REFERENCE_ONLY_QA_OPEN |
| /fx | 외환 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/fx.png) | REFERENCE_ONLY_QA_OPEN |
| /gallery | 갤러리 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/gallery.png) | REFERENCE_ONLY_QA_OPEN |
| /gallery/[photoId] | 갤러리 · 사진 상세 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/gallery--photoId-.png) | REFERENCE_ONLY_QA_OPEN |
| /gallery/submit | 갤러리 · 등록 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/gallery-submit.png) | REFERENCE_ONLY_QA_OPEN |
| /guide | 가이드 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/guide.png) | REFERENCE_ONLY_QA_OPEN |
| /guide/career-mastery | 가이드 · 직업 숙련 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/guide-career-mastery.png) | REFERENCE_ONLY_QA_OPEN |
| /guide/dopamine-system | 가이드 · 성장 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/guide-dopamine-system.png) | REFERENCE_ONLY_QA_OPEN |
| /guide/glossary | 가이드 · 용어사전 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/guide-glossary.png) | REFERENCE_ONLY_QA_OPEN |
| /guide/glossary/[term] | 가이드 · 용어사전 · 용어 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/guide-glossary--term-.png) | REFERENCE_ONLY_QA_OPEN |
| /guide/stock-trading | 가이드 · 주식 거래 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/guide-stock-trading.png) | REFERENCE_ONLY_QA_OPEN |
| /guide/virtual-banking | 가이드 · 가상 은행 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/guide-virtual-banking.png) | REFERENCE_ONLY_QA_OPEN |
| /help | 도움말 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/help.png) | REFERENCE_ONLY_QA_OPEN |
| /help/[slug] | 도움말 · 상세 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/help--slug-.png) | REFERENCE_ONLY_QA_OPEN |
| /inventory | 보관함 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/inventory.png) | REFERENCE_ONLY_QA_OPEN |
| /invite/[code] | 초대 · 초대 링크 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/invite--code-.png) | REFERENCE_ONLY_QA_OPEN |
| /kdic | 예금보험 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/kdic.png) | REFERENCE_ONLY_QA_OPEN |
| /lobby | 로비 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/lobby.png) | REFERENCE_ONLY_QA_OPEN |
| /login | 로그인 | auth | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/login.png) | REFERENCE_ONLY_QA_OPEN |
| /login/providers | 로그인 · 소셜 인증 | auth | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/login-providers.png) | REFERENCE_ONLY_QA_OPEN |
| /marketplace | 마켓 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/marketplace.png) | REFERENCE_ONLY_QA_OPEN |
| /marketplace/auction | 마켓 · 경매 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/marketplace-auction.png) | REFERENCE_ONLY_QA_OPEN |
| /mint | 조폐국 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/mint.png) | REFERENCE_ONLY_QA_OPEN |
| /newspaper | 신문 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/newspaper.png) | REFERENCE_ONLY_QA_OPEN |
| /pension | 연금 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/pension.png) | REFERENCE_ONLY_QA_OPEN |
| /prediction | 예측 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/prediction.png) | REFERENCE_ONLY_QA_OPEN |
| /privacy | 개인정보 | legal | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/privacy.png) | REFERENCE_ONLY_QA_OPEN |
| /profile | 프로필 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/profile.png) | REFERENCE_ONLY_QA_OPEN |
| /profile/[userId] | 프로필 · 사용자 상세 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/profile--userId-.png) | REFERENCE_ONLY_QA_OPEN |
| /profile/settings | 프로필 · 설정 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/profile-settings.png) | REFERENCE_ONLY_QA_OPEN |
| /progression | 성장 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/progression.png) | REFERENCE_ONLY_QA_OPEN |
| /progression/prestige | 성장 · 명성 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/progression-prestige.png) | REFERENCE_ONLY_QA_OPEN |
| /quests | 퀘스트 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/quests.png) | REFERENCE_ONLY_QA_OPEN |
| /register | 회원가입 | auth | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/register.png) | REFERENCE_ONLY_QA_OPEN |
| /reset-password | 비밀번호 재설정 | auth | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/reset-password.png) | REFERENCE_ONLY_QA_OPEN |
| /roadmap | 로드맵 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/roadmap.png) | REFERENCE_ONLY_QA_OPEN |
| /safety | 안전 | legal | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/safety.png) | REFERENCE_ONLY_QA_OPEN |
| /safety/takedown | 안전 · 게시 중단 | legal | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/safety-takedown.png) | REFERENCE_ONLY_QA_OPEN |
| /search | 검색 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/search.png) | REFERENCE_ONLY_QA_OPEN |
| /seasons | 시즌 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/seasons.png) | REFERENCE_ONLY_QA_OPEN |
| /shop | 상점 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/shop.png) | REFERENCE_ONLY_QA_OPEN |
| /shop/catalog | 상점 · 카탈로그 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/shop-catalog.png) | REFERENCE_ONLY_QA_OPEN |
| /spaces | 공간 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/spaces.png) | REFERENCE_ONLY_QA_OPEN |
| /spaces/real-estate | 공간 · 부동산 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/spaces-real-estate.png) | REFERENCE_ONLY_QA_OPEN |
| /status | 상태 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/status.png) | REFERENCE_ONLY_QA_OPEN |
| /stocks | 주식 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/stocks.png) | REFERENCE_ONLY_QA_OPEN |
| /stocks/[symbol] | 주식 · 종목 상세 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/stocks--symbol-.png) | REFERENCE_ONLY_QA_OPEN |
| /stocks/alerts | 주식 · 알림 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/stocks-alerts.png) | REFERENCE_ONLY_QA_OPEN |
| /stocks/community | 주식 · 토론 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/stocks-community.png) | REFERENCE_ONLY_QA_OPEN |
| /stocks/compare | 주식 · 비교 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/stocks-compare.png) | REFERENCE_ONLY_QA_OPEN |
| /stocks/derivatives | 주식 · 파생상품 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/stocks-derivatives.png) | REFERENCE_ONLY_QA_OPEN |
| /stocks/history | 주식 · 내역 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/stocks-history.png) | REFERENCE_ONLY_QA_OPEN |
| /stocks/league | 주식 · 리그 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/stocks-league.png) | REFERENCE_ONLY_QA_OPEN |
| /stocks/portfolio | 주식 · 포트폴리오 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/stocks-portfolio.png) | REFERENCE_ONLY_QA_OPEN |
| /stocks/watchlist | 주식 · 관심종목 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/stocks-watchlist.png) | REFERENCE_ONLY_QA_OPEN |
| /support | 고객지원 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/support.png) | REFERENCE_ONLY_QA_OPEN |
| /terms | 이용약관 | legal | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/terms.png) | REFERENCE_ONLY_QA_OPEN |
| /tools | 금융 도구 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/capital-gains-tax-calculator | 금융 도구 · 양도세 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-capital-gains-tax-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/capital-gains-tax-calculator/[preset] | 금융 도구 · 양도세 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-capital-gains-tax-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/compound-calculator | 금융 도구 · 복리 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-compound-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/compound-calculator/[preset] | 금융 도구 · 복리 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-compound-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/crypto-apy-calculator | 금융 도구 · 가상자산 수익률 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-crypto-apy-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/dividend-tax-calculator | 금융 도구 · 배당세 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-dividend-tax-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/dividend-tax-calculator/[ticker] | 금융 도구 · 배당세 계산기 · 종목 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-dividend-tax-calculator--ticker-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/farming-calculator | 금융 도구 · 직업 수익 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-farming-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/farming-calculator/[preset] | 금융 도구 · 직업 수익 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-farming-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/fire-calculator | 금융 도구 · 경제적 자유 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-fire-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/gift-tax-calculator | 금융 도구 · 증여세 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-gift-tax-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/gift-tax-calculator/[preset] | 금융 도구 · 증여세 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-gift-tax-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/goal-wealth-calculator | 금융 도구 · 목표 자산 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-goal-wealth-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/isa-calculator | 금융 도구 · ISA 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-isa-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/isa-calculator/[slug] | 금융 도구 · ISA 계산기 · 상세 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-isa-calculator--slug-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/kimchi-premium-calculator | 금융 도구 · 김치 프리미엄 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-kimchi-premium-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/kimchi-premium-calculator/[preset] | 금융 도구 · 김치 프리미엄 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-kimchi-premium-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/loan-interest-calculator | 금융 도구 · 대출 이자 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-loan-interest-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/loan-interest-calculator/[preset] | 금융 도구 · 대출 이자 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-loan-interest-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/pension-tax-calculator | 금융 도구 · 연금 세금 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-pension-tax-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/pension-tax-calculator/[slug] | 금융 도구 · 연금 세금 계산기 · 상세 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-pension-tax-calculator--slug-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/quant-studio | 금융 도구 · 퀀트 스튜디오 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-quant-studio.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/real-estate-calculator | 금융 도구 · 부동산 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-real-estate-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/real-estate-calculator/[preset] | 금융 도구 · 부동산 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-real-estate-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/retirement-calculator | 금융 도구 · 은퇴 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-retirement-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/retirement-calculator/[slug] | 금융 도구 · 은퇴 계산기 · 상세 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-retirement-calculator--slug-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/salary-calculator | 금융 도구 · 급여 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-salary-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/salary-calculator/[preset] | 금융 도구 · 급여 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-salary-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/stock-calculator | 금융 도구 · 주식 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-stock-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/stock-calculator/[preset] | 금융 도구 · 주식 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-stock-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/tax-calculator | 금융 도구 · 세금 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-tax-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/youth-leap-calculator | 금융 도구 · 청년도약 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-youth-leap-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/youth-leap-calculator/[preset] | 금융 도구 · 청년도약 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-youth-leap-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /treasury | 국고 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/treasury.png) | REFERENCE_ONLY_QA_OPEN |
| /verify-email | 이메일 확인 | auth | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/verify-email.png) | REFERENCE_ONLY_QA_OPEN |
| /verify-email-change | 이메일 변경 확인 | auth | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/verify-email-change.png) | REFERENCE_ONLY_QA_OPEN |
| /wallet | 지갑 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/wallet.png) | REFERENCE_ONLY_QA_OPEN |
| /wallet/activity | 지갑 · 활동 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/wallet-activity.png) | REFERENCE_ONLY_QA_OPEN |
| /wallet/activity/transactions/[transactionId] | 지갑 · 활동 · 거래 상세 · 거래 상세 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/wallet-activity-transactions--transactionId-.png) | REFERENCE_ONLY_QA_OPEN |
| /work | 직업 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/work.png) | REFERENCE_ONLY_QA_OPEN |

> **Additional 180-route isolated Test GET probe v2026.11.23.10:** 200=132 / 302=42 / 401=3 / 405=1 / 503=2; 33 non-home routes returned home dashboard title. Test 503 on /status and /stocks/derivatives. [Full 180-route QA](qa/2026-11-23-game-ui-180-image-feature-audit.md). Not end-to-end functional acceptance.
