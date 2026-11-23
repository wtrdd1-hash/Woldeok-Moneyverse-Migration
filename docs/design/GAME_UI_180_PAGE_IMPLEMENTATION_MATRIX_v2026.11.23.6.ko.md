# 게임형 UI 전 페이지 180개 원본·구현·검증 통합 매트릭스

> v2026.11.23.6 · **PLANNING / DESIGN_REVIEW_OPEN** · [English](GAME_UI_180_PAGE_IMPLEMENTATION_MATRIX_v2026.11.23.6.md)
>
> 원본 11월18일 PNG 180개는 **변경하지 않는다**. 이 문서만으로 180개 디자인 이미지 재생성·실제 코드 구현·서버 기능 테스트 완료가 아니다. 각 경로에 원본을 정확히 연결하고 향후 구현/QA의 수용 기준을 정한다. 새 공통 스타일은 Thymeleaf 공통 셸을 실제 사용하는 화면에 한정된다.

**로고: 현재 실제 `spring-backend/src/main/resources/static/assets/mv39/favicon.ico` 원본 그대로 사용.** 임의 W/왕관 생성 금지. **관리자 메뉴: 서버에서 권한 검증된 관리자에게만 렌더링**, 일반 사용자·비회원의 PC·모바일·검색에는 미노출. **시간:** 기획상 현실10분=게임1일, 서버7일=1주; 실제 현재 시계는 DB/API 확인 전 표시 금지, 금융·보안 기간과 혼동 금지.

## 페이지 계열별 필수 계약
- **홈:** 게임형 경제 세계관/자산/퀘스트는 기존 실제 기능과 연결하고 잔액·레벨·보상 임의 생성 금지.
- **관리자:** 역할별 서버 인가 + 메뉴 비노출 + 기존 기능/실측 지표 유지.
- **금융:** 실제 서버 원장·권한별 데이터, 큰 정수 정밀도, 일 기준과 연 기준 이율 구분.
- **게임:** 실제 퀘스트/진행/보상/게임 시간 출처 확인.
- **로그인:** Google·Discord·자체 로그인, 동의/정책 링크와 다국어.
- **회원·커뮤니티·도구·정책:** 페이지별 업무 기능을 지우지 않으면서 동일 게임형 테마·접근성 적용.

## 완료 검증 기준
경로별 1440/390/320px, 키보드·200% 확대, 5개 언어, 각 역할/미로그인, 빈 상태·로딩·오류, 원본 이미지 시각 비교, 실제 파비콘, 정확한 API 영수증 및 독립 Test 증거가 필요하다. 아래 DESIGN_REVIEW_OPEN은 모두 **미완료 상태**다.

| 경로 | 원본 11월18일 이미지 | 상태 |
| --- | --- | --- |
| `/` | [Original PNG](all-pages-v2026.11.18.12/previews/home.png) | DESIGN_REVIEW_OPEN |
| `/[locale]/blog` | [Original PNG](all-pages-v2026.11.18.12/previews/-locale--blog.png) | DESIGN_REVIEW_OPEN |
| `/[locale]/blog/[slug]` | [Original PNG](all-pages-v2026.11.18.12/previews/-locale--blog--slug-.png) | DESIGN_REVIEW_OPEN |
| `/[locale]/guide/glossary` | [Original PNG](all-pages-v2026.11.18.12/previews/-locale--guide-glossary.png) | DESIGN_REVIEW_OPEN |
| `/[locale]/guide/glossary/[term]` | [Original PNG](all-pages-v2026.11.18.12/previews/-locale--guide-glossary--term-.png) | DESIGN_REVIEW_OPEN |
| `/[locale]/tools/compound-interest-calculator` | [Original PNG](all-pages-v2026.11.18.12/previews/-locale--tools-compound-interest-calculator.png) | DESIGN_REVIEW_OPEN |
| `/[locale]/tools/compound-interest-calculator/[preset]` | [Original PNG](all-pages-v2026.11.18.12/previews/-locale--tools-compound-interest-calculator--preset-.png) | DESIGN_REVIEW_OPEN |
| `/account` | [Original PNG](all-pages-v2026.11.18.12/previews/account.png) | DESIGN_REVIEW_OPEN |
| `/account-deletion` | [Original PNG](all-pages-v2026.11.18.12/previews/account-deletion.png) | DESIGN_REVIEW_OPEN |
| `/account/notifications` | [Original PNG](all-pages-v2026.11.18.12/previews/account-notifications.png) | DESIGN_REVIEW_OPEN |
| `/account/privacy` | [Original PNG](all-pages-v2026.11.18.12/previews/account-privacy.png) | DESIGN_REVIEW_OPEN |
| `/account/security` | [Original PNG](all-pages-v2026.11.18.12/previews/account-security.png) | DESIGN_REVIEW_OPEN |
| `/admin` | [Original PNG](all-pages-v2026.11.18.12/previews/admin.png) | DESIGN_REVIEW_OPEN |
| `/admin/analytics` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-analytics.png) | DESIGN_REVIEW_OPEN |
| `/admin/api-health` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-api-health.png) | DESIGN_REVIEW_OPEN |
| `/admin/bank` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-bank.png) | DESIGN_REVIEW_OPEN |
| `/admin/blog` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-blog.png) | DESIGN_REVIEW_OPEN |
| `/admin/bonds` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-bonds.png) | DESIGN_REVIEW_OPEN |
| `/admin/catalog` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-catalog.png) | DESIGN_REVIEW_OPEN |
| `/admin/central-bank` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-central-bank.png) | DESIGN_REVIEW_OPEN |
| `/admin/content` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-content.png) | DESIGN_REVIEW_OPEN |
| `/admin/controls` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-controls.png) | DESIGN_REVIEW_OPEN |
| `/admin/discord` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-discord.png) | DESIGN_REVIEW_OPEN |
| `/admin/economy` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-economy.png) | DESIGN_REVIEW_OPEN |
| `/admin/economy/scenario-lab` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-economy-scenario-lab.png) | DESIGN_REVIEW_OPEN |
| `/admin/enterprises` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-enterprises.png) | DESIGN_REVIEW_OPEN |
| `/admin/fx` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-fx.png) | DESIGN_REVIEW_OPEN |
| `/admin/help` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-help.png) | DESIGN_REVIEW_OPEN |
| `/admin/kdic` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-kdic.png) | DESIGN_REVIEW_OPEN |
| `/admin/logs` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-logs.png) | DESIGN_REVIEW_OPEN |
| `/admin/logs/activity` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-logs-activity.png) | DESIGN_REVIEW_OPEN |
| `/admin/logs/delivery` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-logs-delivery.png) | DESIGN_REVIEW_OPEN |
| `/admin/logs/errors` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-logs-errors.png) | DESIGN_REVIEW_OPEN |
| `/admin/logs/integrity` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-logs-integrity.png) | DESIGN_REVIEW_OPEN |
| `/admin/logs/system` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-logs-system.png) | DESIGN_REVIEW_OPEN |
| `/admin/market` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-market.png) | DESIGN_REVIEW_OPEN |
| `/admin/market/ai-news` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-market-ai-news.png) | DESIGN_REVIEW_OPEN |
| `/admin/mint` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-mint.png) | DESIGN_REVIEW_OPEN |
| `/admin/money-flow` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-money-flow.png) | DESIGN_REVIEW_OPEN |
| `/admin/operations/storage` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-operations-storage.png) | DESIGN_REVIEW_OPEN |
| `/admin/pension` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-pension.png) | DESIGN_REVIEW_OPEN |
| `/admin/safety` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-safety.png) | DESIGN_REVIEW_OPEN |
| `/admin/security` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-security.png) | DESIGN_REVIEW_OPEN |
| `/admin/seo` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-seo.png) | DESIGN_REVIEW_OPEN |
| `/admin/seo-audit` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-seo-audit.png) | DESIGN_REVIEW_OPEN |
| `/admin/shop` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-shop.png) | DESIGN_REVIEW_OPEN |
| `/admin/support` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-support.png) | DESIGN_REVIEW_OPEN |
| `/admin/treasury` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-treasury.png) | DESIGN_REVIEW_OPEN |
| `/admin/treasury/grants` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-treasury-grants.png) | DESIGN_REVIEW_OPEN |
| `/admin/users` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-users.png) | DESIGN_REVIEW_OPEN |
| `/admin/users/[id]` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-users--id-.png) | DESIGN_REVIEW_OPEN |
| `/admin/work` | [Original PNG](all-pages-v2026.11.18.12/previews/admin-work.png) | DESIGN_REVIEW_OPEN |
| `/advisor` | [Original PNG](all-pages-v2026.11.18.12/previews/advisor.png) | DESIGN_REVIEW_OPEN |
| `/announcements` | [Original PNG](all-pages-v2026.11.18.12/previews/announcements.png) | DESIGN_REVIEW_OPEN |
| `/announcements/[announcementId]` | [Original PNG](all-pages-v2026.11.18.12/previews/announcements--announcementId-.png) | DESIGN_REVIEW_OPEN |
| `/arcade` | [Original PNG](all-pages-v2026.11.18.12/previews/arcade.png) | DESIGN_REVIEW_OPEN |
| `/bank` | [Original PNG](all-pages-v2026.11.18.12/previews/bank.png) | DESIGN_REVIEW_OPEN |
| `/bank/savings-pot` | [Original PNG](all-pages-v2026.11.18.12/previews/bank-savings-pot.png) | DESIGN_REVIEW_OPEN |
| `/blog` | [Original PNG](all-pages-v2026.11.18.12/previews/blog.png) | DESIGN_REVIEW_OPEN |
| `/blog/[slug]` | [Original PNG](all-pages-v2026.11.18.12/previews/blog--slug-.png) | DESIGN_REVIEW_OPEN |
| `/board` | [Original PNG](all-pages-v2026.11.18.12/previews/board.png) | DESIGN_REVIEW_OPEN |
| `/board/[postId]` | [Original PNG](all-pages-v2026.11.18.12/previews/board--postId-.png) | DESIGN_REVIEW_OPEN |
| `/bonds` | [Original PNG](all-pages-v2026.11.18.12/previews/bonds.png) | DESIGN_REVIEW_OPEN |
| `/businesses` | [Original PNG](all-pages-v2026.11.18.12/previews/businesses.png) | DESIGN_REVIEW_OPEN |
| `/businesses/ventures` | [Original PNG](all-pages-v2026.11.18.12/previews/businesses-ventures.png) | DESIGN_REVIEW_OPEN |
| `/calculators` | [Original PNG](all-pages-v2026.11.18.12/previews/calculators.png) | DESIGN_REVIEW_OPEN |
| `/calendar` | [Original PNG](all-pages-v2026.11.18.12/previews/calendar.png) | DESIGN_REVIEW_OPEN |
| `/casino` | [Original PNG](all-pages-v2026.11.18.12/previews/casino.png) | DESIGN_REVIEW_OPEN |
| `/central-bank` | [Original PNG](all-pages-v2026.11.18.12/previews/central-bank.png) | DESIGN_REVIEW_OPEN |
| `/chat` | [Original PNG](all-pages-v2026.11.18.12/previews/chat.png) | DESIGN_REVIEW_OPEN |
| `/clubs` | [Original PNG](all-pages-v2026.11.18.12/previews/clubs.png) | DESIGN_REVIEW_OPEN |
| `/clubs/[clubId]` | [Original PNG](all-pages-v2026.11.18.12/previews/clubs--clubId-.png) | DESIGN_REVIEW_OPEN |
| `/clubs/[clubId]/members` | [Original PNG](all-pages-v2026.11.18.12/previews/clubs--clubId--members.png) | DESIGN_REVIEW_OPEN |
| `/clubs/new` | [Original PNG](all-pages-v2026.11.18.12/previews/clubs-new.png) | DESIGN_REVIEW_OPEN |
| `/clubs/warfare` | [Original PNG](all-pages-v2026.11.18.12/previews/clubs-warfare.png) | DESIGN_REVIEW_OPEN |
| `/collections` | [Original PNG](all-pages-v2026.11.18.12/previews/collections.png) | DESIGN_REVIEW_OPEN |
| `/dashboard` | [Original PNG](all-pages-v2026.11.18.12/previews/dashboard.png) | DESIGN_REVIEW_OPEN |
| `/data-deletion` | [Original PNG](all-pages-v2026.11.18.12/previews/data-deletion.png) | DESIGN_REVIEW_OPEN |
| `/design-preview` | [Original PNG](all-pages-v2026.11.18.12/previews/design-preview.png) | DESIGN_REVIEW_OPEN |
| `/developer` | [Original PNG](all-pages-v2026.11.18.12/previews/developer.png) | DESIGN_REVIEW_OPEN |
| `/enterprises` | [Original PNG](all-pages-v2026.11.18.12/previews/enterprises.png) | DESIGN_REVIEW_OPEN |
| `/features` | [Original PNG](all-pages-v2026.11.18.12/previews/features.png) | DESIGN_REVIEW_OPEN |
| `/forgot-password` | [Original PNG](all-pages-v2026.11.18.12/previews/forgot-password.png) | DESIGN_REVIEW_OPEN |
| `/fx` | [Original PNG](all-pages-v2026.11.18.12/previews/fx.png) | DESIGN_REVIEW_OPEN |
| `/gallery` | [Original PNG](all-pages-v2026.11.18.12/previews/gallery.png) | DESIGN_REVIEW_OPEN |
| `/gallery/[photoId]` | [Original PNG](all-pages-v2026.11.18.12/previews/gallery--photoId-.png) | DESIGN_REVIEW_OPEN |
| `/gallery/submit` | [Original PNG](all-pages-v2026.11.18.12/previews/gallery-submit.png) | DESIGN_REVIEW_OPEN |
| `/guide` | [Original PNG](all-pages-v2026.11.18.12/previews/guide.png) | DESIGN_REVIEW_OPEN |
| `/guide/career-mastery` | [Original PNG](all-pages-v2026.11.18.12/previews/guide-career-mastery.png) | DESIGN_REVIEW_OPEN |
| `/guide/dopamine-system` | [Original PNG](all-pages-v2026.11.18.12/previews/guide-dopamine-system.png) | DESIGN_REVIEW_OPEN |
| `/guide/glossary` | [Original PNG](all-pages-v2026.11.18.12/previews/guide-glossary.png) | DESIGN_REVIEW_OPEN |
| `/guide/glossary/[term]` | [Original PNG](all-pages-v2026.11.18.12/previews/guide-glossary--term-.png) | DESIGN_REVIEW_OPEN |
| `/guide/stock-trading` | [Original PNG](all-pages-v2026.11.18.12/previews/guide-stock-trading.png) | DESIGN_REVIEW_OPEN |
| `/guide/virtual-banking` | [Original PNG](all-pages-v2026.11.18.12/previews/guide-virtual-banking.png) | DESIGN_REVIEW_OPEN |
| `/help` | [Original PNG](all-pages-v2026.11.18.12/previews/help.png) | DESIGN_REVIEW_OPEN |
| `/help/[slug]` | [Original PNG](all-pages-v2026.11.18.12/previews/help--slug-.png) | DESIGN_REVIEW_OPEN |
| `/inventory` | [Original PNG](all-pages-v2026.11.18.12/previews/inventory.png) | DESIGN_REVIEW_OPEN |
| `/invite/[code]` | [Original PNG](all-pages-v2026.11.18.12/previews/invite--code-.png) | DESIGN_REVIEW_OPEN |
| `/kdic` | [Original PNG](all-pages-v2026.11.18.12/previews/kdic.png) | DESIGN_REVIEW_OPEN |
| `/lobby` | [Original PNG](all-pages-v2026.11.18.12/previews/lobby.png) | DESIGN_REVIEW_OPEN |
| `/login` | [Original PNG](all-pages-v2026.11.18.12/previews/login.png) | DESIGN_REVIEW_OPEN |
| `/login/providers` | [Original PNG](all-pages-v2026.11.18.12/previews/login-providers.png) | DESIGN_REVIEW_OPEN |
| `/marketplace` | [Original PNG](all-pages-v2026.11.18.12/previews/marketplace.png) | DESIGN_REVIEW_OPEN |
| `/marketplace/auction` | [Original PNG](all-pages-v2026.11.18.12/previews/marketplace-auction.png) | DESIGN_REVIEW_OPEN |
| `/mint` | [Original PNG](all-pages-v2026.11.18.12/previews/mint.png) | DESIGN_REVIEW_OPEN |
| `/newspaper` | [Original PNG](all-pages-v2026.11.18.12/previews/newspaper.png) | DESIGN_REVIEW_OPEN |
| `/pension` | [Original PNG](all-pages-v2026.11.18.12/previews/pension.png) | DESIGN_REVIEW_OPEN |
| `/prediction` | [Original PNG](all-pages-v2026.11.18.12/previews/prediction.png) | DESIGN_REVIEW_OPEN |
| `/privacy` | [Original PNG](all-pages-v2026.11.18.12/previews/privacy.png) | DESIGN_REVIEW_OPEN |
| `/profile` | [Original PNG](all-pages-v2026.11.18.12/previews/profile.png) | DESIGN_REVIEW_OPEN |
| `/profile/[userId]` | [Original PNG](all-pages-v2026.11.18.12/previews/profile--userId-.png) | DESIGN_REVIEW_OPEN |
| `/profile/settings` | [Original PNG](all-pages-v2026.11.18.12/previews/profile-settings.png) | DESIGN_REVIEW_OPEN |
| `/progression` | [Original PNG](all-pages-v2026.11.18.12/previews/progression.png) | DESIGN_REVIEW_OPEN |
| `/progression/prestige` | [Original PNG](all-pages-v2026.11.18.12/previews/progression-prestige.png) | DESIGN_REVIEW_OPEN |
| `/quests` | [Original PNG](all-pages-v2026.11.18.12/previews/quests.png) | DESIGN_REVIEW_OPEN |
| `/register` | [Original PNG](all-pages-v2026.11.18.12/previews/register.png) | DESIGN_REVIEW_OPEN |
| `/reset-password` | [Original PNG](all-pages-v2026.11.18.12/previews/reset-password.png) | DESIGN_REVIEW_OPEN |
| `/roadmap` | [Original PNG](all-pages-v2026.11.18.12/previews/roadmap.png) | DESIGN_REVIEW_OPEN |
| `/safety` | [Original PNG](all-pages-v2026.11.18.12/previews/safety.png) | DESIGN_REVIEW_OPEN |
| `/safety/takedown` | [Original PNG](all-pages-v2026.11.18.12/previews/safety-takedown.png) | DESIGN_REVIEW_OPEN |
| `/search` | [Original PNG](all-pages-v2026.11.18.12/previews/search.png) | DESIGN_REVIEW_OPEN |
| `/seasons` | [Original PNG](all-pages-v2026.11.18.12/previews/seasons.png) | DESIGN_REVIEW_OPEN |
| `/shop` | [Original PNG](all-pages-v2026.11.18.12/previews/shop.png) | DESIGN_REVIEW_OPEN |
| `/shop/catalog` | [Original PNG](all-pages-v2026.11.18.12/previews/shop-catalog.png) | DESIGN_REVIEW_OPEN |
| `/spaces` | [Original PNG](all-pages-v2026.11.18.12/previews/spaces.png) | DESIGN_REVIEW_OPEN |
| `/spaces/real-estate` | [Original PNG](all-pages-v2026.11.18.12/previews/spaces-real-estate.png) | DESIGN_REVIEW_OPEN |
| `/status` | [Original PNG](all-pages-v2026.11.18.12/previews/status.png) | DESIGN_REVIEW_OPEN |
| `/stocks` | [Original PNG](all-pages-v2026.11.18.12/previews/stocks.png) | DESIGN_REVIEW_OPEN |
| `/stocks/[symbol]` | [Original PNG](all-pages-v2026.11.18.12/previews/stocks--symbol-.png) | DESIGN_REVIEW_OPEN |
| `/stocks/alerts` | [Original PNG](all-pages-v2026.11.18.12/previews/stocks-alerts.png) | DESIGN_REVIEW_OPEN |
| `/stocks/community` | [Original PNG](all-pages-v2026.11.18.12/previews/stocks-community.png) | DESIGN_REVIEW_OPEN |
| `/stocks/compare` | [Original PNG](all-pages-v2026.11.18.12/previews/stocks-compare.png) | DESIGN_REVIEW_OPEN |
| `/stocks/derivatives` | [Original PNG](all-pages-v2026.11.18.12/previews/stocks-derivatives.png) | DESIGN_REVIEW_OPEN |
| `/stocks/history` | [Original PNG](all-pages-v2026.11.18.12/previews/stocks-history.png) | DESIGN_REVIEW_OPEN |
| `/stocks/league` | [Original PNG](all-pages-v2026.11.18.12/previews/stocks-league.png) | DESIGN_REVIEW_OPEN |
| `/stocks/portfolio` | [Original PNG](all-pages-v2026.11.18.12/previews/stocks-portfolio.png) | DESIGN_REVIEW_OPEN |
| `/stocks/watchlist` | [Original PNG](all-pages-v2026.11.18.12/previews/stocks-watchlist.png) | DESIGN_REVIEW_OPEN |
| `/support` | [Original PNG](all-pages-v2026.11.18.12/previews/support.png) | DESIGN_REVIEW_OPEN |
| `/terms` | [Original PNG](all-pages-v2026.11.18.12/previews/terms.png) | DESIGN_REVIEW_OPEN |
| `/tools` | [Original PNG](all-pages-v2026.11.18.12/previews/tools.png) | DESIGN_REVIEW_OPEN |
| `/tools/capital-gains-tax-calculator` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-capital-gains-tax-calculator.png) | DESIGN_REVIEW_OPEN |
| `/tools/capital-gains-tax-calculator/[preset]` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-capital-gains-tax-calculator--preset-.png) | DESIGN_REVIEW_OPEN |
| `/tools/compound-calculator` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-compound-calculator.png) | DESIGN_REVIEW_OPEN |
| `/tools/compound-calculator/[preset]` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-compound-calculator--preset-.png) | DESIGN_REVIEW_OPEN |
| `/tools/crypto-apy-calculator` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-crypto-apy-calculator.png) | DESIGN_REVIEW_OPEN |
| `/tools/dividend-tax-calculator` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-dividend-tax-calculator.png) | DESIGN_REVIEW_OPEN |
| `/tools/dividend-tax-calculator/[ticker]` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-dividend-tax-calculator--ticker-.png) | DESIGN_REVIEW_OPEN |
| `/tools/farming-calculator` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-farming-calculator.png) | DESIGN_REVIEW_OPEN |
| `/tools/farming-calculator/[preset]` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-farming-calculator--preset-.png) | DESIGN_REVIEW_OPEN |
| `/tools/fire-calculator` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-fire-calculator.png) | DESIGN_REVIEW_OPEN |
| `/tools/gift-tax-calculator` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-gift-tax-calculator.png) | DESIGN_REVIEW_OPEN |
| `/tools/gift-tax-calculator/[preset]` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-gift-tax-calculator--preset-.png) | DESIGN_REVIEW_OPEN |
| `/tools/goal-wealth-calculator` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-goal-wealth-calculator.png) | DESIGN_REVIEW_OPEN |
| `/tools/isa-calculator` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-isa-calculator.png) | DESIGN_REVIEW_OPEN |
| `/tools/isa-calculator/[slug]` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-isa-calculator--slug-.png) | DESIGN_REVIEW_OPEN |
| `/tools/kimchi-premium-calculator` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-kimchi-premium-calculator.png) | DESIGN_REVIEW_OPEN |
| `/tools/kimchi-premium-calculator/[preset]` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-kimchi-premium-calculator--preset-.png) | DESIGN_REVIEW_OPEN |
| `/tools/loan-interest-calculator` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-loan-interest-calculator.png) | DESIGN_REVIEW_OPEN |
| `/tools/loan-interest-calculator/[preset]` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-loan-interest-calculator--preset-.png) | DESIGN_REVIEW_OPEN |
| `/tools/pension-tax-calculator` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-pension-tax-calculator.png) | DESIGN_REVIEW_OPEN |
| `/tools/pension-tax-calculator/[slug]` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-pension-tax-calculator--slug-.png) | DESIGN_REVIEW_OPEN |
| `/tools/quant-studio` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-quant-studio.png) | DESIGN_REVIEW_OPEN |
| `/tools/real-estate-calculator` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-real-estate-calculator.png) | DESIGN_REVIEW_OPEN |
| `/tools/real-estate-calculator/[preset]` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-real-estate-calculator--preset-.png) | DESIGN_REVIEW_OPEN |
| `/tools/retirement-calculator` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-retirement-calculator.png) | DESIGN_REVIEW_OPEN |
| `/tools/retirement-calculator/[slug]` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-retirement-calculator--slug-.png) | DESIGN_REVIEW_OPEN |
| `/tools/salary-calculator` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-salary-calculator.png) | DESIGN_REVIEW_OPEN |
| `/tools/salary-calculator/[preset]` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-salary-calculator--preset-.png) | DESIGN_REVIEW_OPEN |
| `/tools/stock-calculator` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-stock-calculator.png) | DESIGN_REVIEW_OPEN |
| `/tools/stock-calculator/[preset]` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-stock-calculator--preset-.png) | DESIGN_REVIEW_OPEN |
| `/tools/tax-calculator` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-tax-calculator.png) | DESIGN_REVIEW_OPEN |
| `/tools/youth-leap-calculator` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-youth-leap-calculator.png) | DESIGN_REVIEW_OPEN |
| `/tools/youth-leap-calculator/[preset]` | [Original PNG](all-pages-v2026.11.18.12/previews/tools-youth-leap-calculator--preset-.png) | DESIGN_REVIEW_OPEN |
| `/treasury` | [Original PNG](all-pages-v2026.11.18.12/previews/treasury.png) | DESIGN_REVIEW_OPEN |
| `/verify-email` | [Original PNG](all-pages-v2026.11.18.12/previews/verify-email.png) | DESIGN_REVIEW_OPEN |
| `/verify-email-change` | [Original PNG](all-pages-v2026.11.18.12/previews/verify-email-change.png) | DESIGN_REVIEW_OPEN |
| `/wallet` | [Original PNG](all-pages-v2026.11.18.12/previews/wallet.png) | DESIGN_REVIEW_OPEN |
| `/wallet/activity` | [Original PNG](all-pages-v2026.11.18.12/previews/wallet-activity.png) | DESIGN_REVIEW_OPEN |
| `/wallet/activity/transactions/[transactionId]` | [Original PNG](all-pages-v2026.11.18.12/previews/wallet-activity-transactions--transactionId-.png) | DESIGN_REVIEW_OPEN |
| `/work` | [Original PNG](all-pages-v2026.11.18.12/previews/work.png) | DESIGN_REVIEW_OPEN |
