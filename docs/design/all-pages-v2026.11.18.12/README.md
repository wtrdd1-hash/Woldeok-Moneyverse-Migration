# All-Page PC + Mobile Visual Concepts / 전체 페이지 시안

Version: v2026.11.18.12 | Status: PLANNING ONLY | Source: frontend/src/app/**/page.tsx

One PNG for each of 178 GitHub main routes PLUS 2 explicitly flagged mini-PC-only routes shows BOTH desktop and mobile concept screens.
All values are synthetic; images are planning mockups, NOT screenshots or functional/production verification.

> **CI-safe main handoff:** SVG source files remain preserved in the immutable PR #3268 Git history. Current branch contains 180 independently rasterized PNG files (native 1660 × 990) because the project release CI intentionally rejects active SVG/ZIP/JSON and scripts in docs. No source or runtime feature is claimed.

> **Recovered implementation handoff (v2026.11.19.31):** [English](../UI_IMAGE_IMPLEMENTATION_HANDOFF_v2026.11.19.31.md) · [한국어](../UI_IMAGE_IMPLEMENTATION_HANDOFF_v2026.11.19.31.ko.md). These images were originally in closed, unmerged PR #3268; they are conceptual wireframes, not Spring pages.

## Counts / 개수

- admin: 40
- auth: 7
- finance: 27
- game: 16
- home: 1
- legal: 6
- member: 24
- social: 22
- tools: 37

## Complete page gallery / 전체 페이지 목록

| Route | Screen | Family | Preview |
|---|---|---|---|
| / | 홈 대시보드 | home (MAIN_ROUTE_CONCEPT) | [PNG](previews/home.png) |
| /[locale]/blog | 블로그 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/-locale--blog.png) |
| /[locale]/blog/[slug] | 블로그 · 상세 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/-locale--blog--slug-.png) |
| /[locale]/guide/glossary | 가이드 · 용어사전 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/-locale--guide-glossary.png) |
| /[locale]/guide/glossary/[term] | 가이드 · 용어사전 · 용어 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/-locale--guide-glossary--term-.png) |
| /[locale]/tools/compound-interest-calculator | 금융 도구 · 복리 계산기 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/-locale--tools-compound-interest-calculator.png) |
| /[locale]/tools/compound-interest-calculator/[preset] | 금융 도구 · 복리 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/-locale--tools-compound-interest-calculator--preset-.png) |
| /account | 계정 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/account.png) |
| /account-deletion | 계정 삭제 | legal (MAIN_ROUTE_CONCEPT) | [PNG](previews/account-deletion.png) |
| /account/notifications | 계정 · 알림 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/account-notifications.png) |
| /account/privacy | 계정 · 개인정보 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/account-privacy.png) |
| /account/security | 계정 · 보안 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/account-security.png) |
| /admin | 관리자 대시보드 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin.png) |
| /admin/analytics | 관리자 · 분석 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-analytics.png) |
| /admin/api-health | 관리자 · API 상태 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-api-health.png) |
| /admin/bank | 관리자 · 은행 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-bank.png) |
| /admin/blog | 관리자 · 블로그 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-blog.png) |
| /admin/bonds | 관리자 · 국채 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-bonds.png) |
| /admin/catalog | 관리자 · 카탈로그 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-catalog.png) |
| /admin/central-bank | 관리자 · 중앙은행 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-central-bank.png) |
| /admin/content | 관리자 · 콘텐츠 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-content.png) |
| /admin/controls | 관리자 · 기능 제어 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-controls.png) |
| /admin/discord | 관리자 · 디스코드 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-discord.png) |
| /admin/economy | 관리자 · 경제 운영 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-economy.png) |
| /admin/economy/scenario-lab | 관리자 · 경제 운영 · 경제 시나리오 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-economy-scenario-lab.png) |
| /admin/enterprises | 관리자 · 국영기업 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-enterprises.png) |
| /admin/fx | 관리자 · 외환 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-fx.png) |
| /admin/help | 관리자 · 도움말 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-help.png) |
| /admin/kdic | 관리자 · 예금보험 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-kdic.png) |
| /admin/logs | 관리자 · 로그 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-logs.png) |
| /admin/logs/activity | 관리자 · 로그 · 활동 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-logs-activity.png) |
| /admin/logs/delivery | 관리자 · 로그 · 전송 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-logs-delivery.png) |
| /admin/logs/errors | 관리자 · 로그 · 오류 | admin (BRANCH_ONLY_CONCEPT) | [PNG](previews/admin-logs-errors.png) |
| /admin/logs/integrity | 관리자 · 로그 · 무결성 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-logs-integrity.png) |
| /admin/logs/system | 관리자 · 로그 · 시스템 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-logs-system.png) |
| /admin/market | 관리자 · 시장 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-market.png) |
| /admin/market/ai-news | 관리자 · 시장 · AI 뉴스 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-market-ai-news.png) |
| /admin/mint | 관리자 · 조폐국 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-mint.png) |
| /admin/money-flow | 관리자 · 자금 흐름 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-money-flow.png) |
| /admin/operations/storage | 관리자 · 운영 · 저장소 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-operations-storage.png) |
| /admin/pension | 관리자 · 연금 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-pension.png) |
| /admin/safety | 관리자 · 안전 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-safety.png) |
| /admin/security | 관리자 · 보안 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-security.png) |
| /admin/seo | 관리자 · 검색 최적화 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-seo.png) |
| /admin/seo-audit | 관리자 · SEO 감사 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-seo-audit.png) |
| /admin/shop | 관리자 · 상점 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-shop.png) |
| /admin/support | 관리자 · 고객지원 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-support.png) |
| /admin/treasury | 관리자 · 국고 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-treasury.png) |
| /admin/treasury/grants | 관리자 · 국고 · 지원금 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-treasury-grants.png) |
| /admin/users | 관리자 · 회원 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-users.png) |
| /admin/users/[id] | 관리자 · 회원 · 상세 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-users--id-.png) |
| /admin/work | 관리자 · 직업 | admin (MAIN_ROUTE_CONCEPT) | [PNG](previews/admin-work.png) |
| /advisor | 자산 가이드 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/advisor.png) |
| /announcements | 공지사항 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/announcements.png) |
| /announcements/[announcementId] | 공지사항 · 공지 상세 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/announcements--announcementId-.png) |
| /arcade | 아케이드 | game (MAIN_ROUTE_CONCEPT) | [PNG](previews/arcade.png) |
| /bank | 은행 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/bank.png) |
| /bank/savings-pot | 은행 · 적금 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/bank-savings-pot.png) |
| /blog | 블로그 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/blog.png) |
| /blog/[slug] | 블로그 · 상세 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/blog--slug-.png) |
| /board | 게시판 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/board.png) |
| /board/[postId] | 게시판 · 게시글 상세 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/board--postId-.png) |
| /bonds | 국채 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/bonds.png) |
| /businesses | 사업 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/businesses.png) |
| /businesses/ventures | 사업 · 스타트업 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/businesses-ventures.png) |
| /calculators | 계산기 | tools (BRANCH_ONLY_CONCEPT) | [PNG](previews/calculators.png) |
| /calendar | 일정 | game (MAIN_ROUTE_CONCEPT) | [PNG](previews/calendar.png) |
| /casino | 카지노 | game (MAIN_ROUTE_CONCEPT) | [PNG](previews/casino.png) |
| /central-bank | 중앙은행 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/central-bank.png) |
| /chat | 채팅 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/chat.png) |
| /clubs | 클럽 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/clubs.png) |
| /clubs/[clubId] | 클럽 · 클럽 상세 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/clubs--clubId-.png) |
| /clubs/[clubId]/members | 클럽 · 클럽 상세 · 멤버 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/clubs--clubId--members.png) |
| /clubs/new | 클럽 · 신규 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/clubs-new.png) |
| /clubs/warfare | 클럽 · 클럽전 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/clubs-warfare.png) |
| /collections | 컬렉션 | game (MAIN_ROUTE_CONCEPT) | [PNG](previews/collections.png) |
| /dashboard | 대시보드 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/dashboard.png) |
| /data-deletion | 데이터 삭제 | legal (MAIN_ROUTE_CONCEPT) | [PNG](previews/data-deletion.png) |
| /design-preview | 디자인 미리보기 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/design-preview.png) |
| /developer | 개발자 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/developer.png) |
| /enterprises | 국영기업 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/enterprises.png) |
| /features | 기능 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/features.png) |
| /forgot-password | 비밀번호 찾기 | auth (MAIN_ROUTE_CONCEPT) | [PNG](previews/forgot-password.png) |
| /fx | 외환 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/fx.png) |
| /gallery | 갤러리 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/gallery.png) |
| /gallery/[photoId] | 갤러리 · 사진 상세 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/gallery--photoId-.png) |
| /gallery/submit | 갤러리 · 등록 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/gallery-submit.png) |
| /guide | 가이드 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/guide.png) |
| /guide/career-mastery | 가이드 · 직업 숙련 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/guide-career-mastery.png) |
| /guide/dopamine-system | 가이드 · 성장 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/guide-dopamine-system.png) |
| /guide/glossary | 가이드 · 용어사전 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/guide-glossary.png) |
| /guide/glossary/[term] | 가이드 · 용어사전 · 용어 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/guide-glossary--term-.png) |
| /guide/stock-trading | 가이드 · 주식 거래 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/guide-stock-trading.png) |
| /guide/virtual-banking | 가이드 · 가상 은행 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/guide-virtual-banking.png) |
| /help | 도움말 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/help.png) |
| /help/[slug] | 도움말 · 상세 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/help--slug-.png) |
| /inventory | 보관함 | game (MAIN_ROUTE_CONCEPT) | [PNG](previews/inventory.png) |
| /invite/[code] | 초대 · 초대 링크 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/invite--code-.png) |
| /kdic | 예금보험 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/kdic.png) |
| /lobby | 로비 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/lobby.png) |
| /login | 로그인 | auth (MAIN_ROUTE_CONCEPT) | [PNG](previews/login.png) |
| /login/providers | 로그인 · 소셜 인증 | auth (MAIN_ROUTE_CONCEPT) | [PNG](previews/login-providers.png) |
| /marketplace | 마켓 | game (MAIN_ROUTE_CONCEPT) | [PNG](previews/marketplace.png) |
| /marketplace/auction | 마켓 · 경매 | game (MAIN_ROUTE_CONCEPT) | [PNG](previews/marketplace-auction.png) |
| /mint | 조폐국 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/mint.png) |
| /newspaper | 신문 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/newspaper.png) |
| /pension | 연금 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/pension.png) |
| /prediction | 예측 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/prediction.png) |
| /privacy | 개인정보 | legal (MAIN_ROUTE_CONCEPT) | [PNG](previews/privacy.png) |
| /profile | 프로필 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/profile.png) |
| /profile/[userId] | 프로필 · 사용자 상세 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/profile--userId-.png) |
| /profile/settings | 프로필 · 설정 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/profile-settings.png) |
| /progression | 성장 | game (MAIN_ROUTE_CONCEPT) | [PNG](previews/progression.png) |
| /progression/prestige | 성장 · 명성 | game (MAIN_ROUTE_CONCEPT) | [PNG](previews/progression-prestige.png) |
| /quests | 퀘스트 | game (MAIN_ROUTE_CONCEPT) | [PNG](previews/quests.png) |
| /register | 회원가입 | auth (MAIN_ROUTE_CONCEPT) | [PNG](previews/register.png) |
| /reset-password | 비밀번호 재설정 | auth (MAIN_ROUTE_CONCEPT) | [PNG](previews/reset-password.png) |
| /roadmap | 로드맵 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/roadmap.png) |
| /safety | 안전 | legal (MAIN_ROUTE_CONCEPT) | [PNG](previews/safety.png) |
| /safety/takedown | 안전 · 게시 중단 | legal (MAIN_ROUTE_CONCEPT) | [PNG](previews/safety-takedown.png) |
| /search | 검색 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/search.png) |
| /seasons | 시즌 | game (MAIN_ROUTE_CONCEPT) | [PNG](previews/seasons.png) |
| /shop | 상점 | game (MAIN_ROUTE_CONCEPT) | [PNG](previews/shop.png) |
| /shop/catalog | 상점 · 카탈로그 | game (MAIN_ROUTE_CONCEPT) | [PNG](previews/shop-catalog.png) |
| /spaces | 공간 | game (MAIN_ROUTE_CONCEPT) | [PNG](previews/spaces.png) |
| /spaces/real-estate | 공간 · 부동산 | game (MAIN_ROUTE_CONCEPT) | [PNG](previews/spaces-real-estate.png) |
| /status | 상태 | member (MAIN_ROUTE_CONCEPT) | [PNG](previews/status.png) |
| /stocks | 주식 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/stocks.png) |
| /stocks/[symbol] | 주식 · 종목 상세 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/stocks--symbol-.png) |
| /stocks/alerts | 주식 · 알림 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/stocks-alerts.png) |
| /stocks/community | 주식 · 토론 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/stocks-community.png) |
| /stocks/compare | 주식 · 비교 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/stocks-compare.png) |
| /stocks/derivatives | 주식 · 파생상품 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/stocks-derivatives.png) |
| /stocks/history | 주식 · 내역 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/stocks-history.png) |
| /stocks/league | 주식 · 리그 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/stocks-league.png) |
| /stocks/portfolio | 주식 · 포트폴리오 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/stocks-portfolio.png) |
| /stocks/watchlist | 주식 · 관심종목 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/stocks-watchlist.png) |
| /support | 고객지원 | social (MAIN_ROUTE_CONCEPT) | [PNG](previews/support.png) |
| /terms | 이용약관 | legal (MAIN_ROUTE_CONCEPT) | [PNG](previews/terms.png) |
| /tools | 금융 도구 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools.png) |
| /tools/capital-gains-tax-calculator | 금융 도구 · 양도세 계산기 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-capital-gains-tax-calculator.png) |
| /tools/capital-gains-tax-calculator/[preset] | 금융 도구 · 양도세 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-capital-gains-tax-calculator--preset-.png) |
| /tools/compound-calculator | 금융 도구 · 복리 계산기 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-compound-calculator.png) |
| /tools/compound-calculator/[preset] | 금융 도구 · 복리 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-compound-calculator--preset-.png) |
| /tools/crypto-apy-calculator | 금융 도구 · 가상자산 수익률 계산기 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-crypto-apy-calculator.png) |
| /tools/dividend-tax-calculator | 금융 도구 · 배당세 계산기 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-dividend-tax-calculator.png) |
| /tools/dividend-tax-calculator/[ticker] | 금융 도구 · 배당세 계산기 · 종목 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-dividend-tax-calculator--ticker-.png) |
| /tools/farming-calculator | 금융 도구 · 직업 수익 계산기 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-farming-calculator.png) |
| /tools/farming-calculator/[preset] | 금융 도구 · 직업 수익 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-farming-calculator--preset-.png) |
| /tools/fire-calculator | 금융 도구 · 경제적 자유 계산기 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-fire-calculator.png) |
| /tools/gift-tax-calculator | 금융 도구 · 증여세 계산기 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-gift-tax-calculator.png) |
| /tools/gift-tax-calculator/[preset] | 금융 도구 · 증여세 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-gift-tax-calculator--preset-.png) |
| /tools/goal-wealth-calculator | 금융 도구 · 목표 자산 계산기 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-goal-wealth-calculator.png) |
| /tools/isa-calculator | 금융 도구 · ISA 계산기 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-isa-calculator.png) |
| /tools/isa-calculator/[slug] | 금융 도구 · ISA 계산기 · 상세 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-isa-calculator--slug-.png) |
| /tools/kimchi-premium-calculator | 금융 도구 · 김치 프리미엄 계산기 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-kimchi-premium-calculator.png) |
| /tools/kimchi-premium-calculator/[preset] | 금융 도구 · 김치 프리미엄 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-kimchi-premium-calculator--preset-.png) |
| /tools/loan-interest-calculator | 금융 도구 · 대출 이자 계산기 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-loan-interest-calculator.png) |
| /tools/loan-interest-calculator/[preset] | 금융 도구 · 대출 이자 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-loan-interest-calculator--preset-.png) |
| /tools/pension-tax-calculator | 금융 도구 · 연금 세금 계산기 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-pension-tax-calculator.png) |
| /tools/pension-tax-calculator/[slug] | 금융 도구 · 연금 세금 계산기 · 상세 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-pension-tax-calculator--slug-.png) |
| /tools/quant-studio | 금융 도구 · 퀀트 스튜디오 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-quant-studio.png) |
| /tools/real-estate-calculator | 금융 도구 · 부동산 계산기 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-real-estate-calculator.png) |
| /tools/real-estate-calculator/[preset] | 금융 도구 · 부동산 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-real-estate-calculator--preset-.png) |
| /tools/retirement-calculator | 금융 도구 · 은퇴 계산기 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-retirement-calculator.png) |
| /tools/retirement-calculator/[slug] | 금융 도구 · 은퇴 계산기 · 상세 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-retirement-calculator--slug-.png) |
| /tools/salary-calculator | 금융 도구 · 급여 계산기 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-salary-calculator.png) |
| /tools/salary-calculator/[preset] | 금융 도구 · 급여 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-salary-calculator--preset-.png) |
| /tools/stock-calculator | 금융 도구 · 주식 계산기 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-stock-calculator.png) |
| /tools/stock-calculator/[preset] | 금융 도구 · 주식 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-stock-calculator--preset-.png) |
| /tools/tax-calculator | 금융 도구 · 세금 계산기 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-tax-calculator.png) |
| /tools/youth-leap-calculator | 금융 도구 · 청년도약 계산기 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-youth-leap-calculator.png) |
| /tools/youth-leap-calculator/[preset] | 금융 도구 · 청년도약 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [PNG](previews/tools-youth-leap-calculator--preset-.png) |
| /treasury | 국고 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/treasury.png) |
| /verify-email | 이메일 확인 | auth (MAIN_ROUTE_CONCEPT) | [PNG](previews/verify-email.png) |
| /verify-email-change | 이메일 변경 확인 | auth (MAIN_ROUTE_CONCEPT) | [PNG](previews/verify-email-change.png) |
| /wallet | 지갑 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/wallet.png) |
| /wallet/activity | 지갑 · 활동 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/wallet-activity.png) |
| /wallet/activity/transactions/[transactionId] | 지갑 · 활동 · 거래 상세 · 거래 상세 | finance (MAIN_ROUTE_CONCEPT) | [PNG](previews/wallet-activity-transactions--transactionId-.png) |
| /work | 직업 | game (MAIN_ROUTE_CONCEPT) | [PNG](previews/work.png) |
