# All-Page PC + Mobile Visual Concepts / 전체 페이지 시안

Version: v2026.11.18.12 | Status: PLANNING ONLY | Source: frontend/src/app/**/page.tsx

One SVG for each of 178 GitHub main routes PLUS 2 explicitly flagged mini-PC-only routes shows BOTH desktop and mobile concept screens.
All values are synthetic; images are planning mockups, NOT screenshots or functional/production verification.

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
| / | 홈 대시보드 | home (MAIN_ROUTE_CONCEPT) | [SVG](previews/home.svg) |
| /[locale]/blog | 블로그 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/-locale--blog.svg) |
| /[locale]/blog/[slug] | 블로그 · 상세 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/-locale--blog--slug-.svg) |
| /[locale]/guide/glossary | 가이드 · 용어사전 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/-locale--guide-glossary.svg) |
| /[locale]/guide/glossary/[term] | 가이드 · 용어사전 · 용어 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/-locale--guide-glossary--term-.svg) |
| /[locale]/tools/compound-interest-calculator | 금융 도구 · 복리 계산기 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/-locale--tools-compound-interest-calculator.svg) |
| /[locale]/tools/compound-interest-calculator/[preset] | 금융 도구 · 복리 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/-locale--tools-compound-interest-calculator--preset-.svg) |
| /account | 계정 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/account.svg) |
| /account-deletion | 계정 삭제 | legal (MAIN_ROUTE_CONCEPT) | [SVG](previews/account-deletion.svg) |
| /account/notifications | 계정 · 알림 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/account-notifications.svg) |
| /account/privacy | 계정 · 개인정보 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/account-privacy.svg) |
| /account/security | 계정 · 보안 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/account-security.svg) |
| /admin | 관리자 대시보드 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin.svg) |
| /admin/analytics | 관리자 · 분석 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-analytics.svg) |
| /admin/api-health | 관리자 · API 상태 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-api-health.svg) |
| /admin/bank | 관리자 · 은행 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-bank.svg) |
| /admin/blog | 관리자 · 블로그 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-blog.svg) |
| /admin/bonds | 관리자 · 국채 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-bonds.svg) |
| /admin/catalog | 관리자 · 카탈로그 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-catalog.svg) |
| /admin/central-bank | 관리자 · 중앙은행 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-central-bank.svg) |
| /admin/content | 관리자 · 콘텐츠 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-content.svg) |
| /admin/controls | 관리자 · 기능 제어 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-controls.svg) |
| /admin/discord | 관리자 · 디스코드 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-discord.svg) |
| /admin/economy | 관리자 · 경제 운영 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-economy.svg) |
| /admin/economy/scenario-lab | 관리자 · 경제 운영 · 경제 시나리오 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-economy-scenario-lab.svg) |
| /admin/enterprises | 관리자 · 국영기업 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-enterprises.svg) |
| /admin/fx | 관리자 · 외환 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-fx.svg) |
| /admin/help | 관리자 · 도움말 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-help.svg) |
| /admin/kdic | 관리자 · 예금보험 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-kdic.svg) |
| /admin/logs | 관리자 · 로그 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-logs.svg) |
| /admin/logs/activity | 관리자 · 로그 · 활동 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-logs-activity.svg) |
| /admin/logs/delivery | 관리자 · 로그 · 전송 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-logs-delivery.svg) |
| /admin/logs/errors | 관리자 · 로그 · 오류 | admin (BRANCH_ONLY_CONCEPT) | [SVG](previews/admin-logs-errors.svg) |
| /admin/logs/integrity | 관리자 · 로그 · 무결성 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-logs-integrity.svg) |
| /admin/logs/system | 관리자 · 로그 · 시스템 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-logs-system.svg) |
| /admin/market | 관리자 · 시장 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-market.svg) |
| /admin/market/ai-news | 관리자 · 시장 · AI 뉴스 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-market-ai-news.svg) |
| /admin/mint | 관리자 · 조폐국 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-mint.svg) |
| /admin/money-flow | 관리자 · 자금 흐름 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-money-flow.svg) |
| /admin/operations/storage | 관리자 · 운영 · 저장소 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-operations-storage.svg) |
| /admin/pension | 관리자 · 연금 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-pension.svg) |
| /admin/safety | 관리자 · 안전 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-safety.svg) |
| /admin/security | 관리자 · 보안 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-security.svg) |
| /admin/seo | 관리자 · 검색 최적화 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-seo.svg) |
| /admin/seo-audit | 관리자 · SEO 감사 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-seo-audit.svg) |
| /admin/shop | 관리자 · 상점 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-shop.svg) |
| /admin/support | 관리자 · 고객지원 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-support.svg) |
| /admin/treasury | 관리자 · 국고 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-treasury.svg) |
| /admin/treasury/grants | 관리자 · 국고 · 지원금 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-treasury-grants.svg) |
| /admin/users | 관리자 · 회원 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-users.svg) |
| /admin/users/[id] | 관리자 · 회원 · 상세 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-users--id-.svg) |
| /admin/work | 관리자 · 직업 | admin (MAIN_ROUTE_CONCEPT) | [SVG](previews/admin-work.svg) |
| /advisor | 자산 가이드 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/advisor.svg) |
| /announcements | 공지사항 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/announcements.svg) |
| /announcements/[announcementId] | 공지사항 · 공지 상세 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/announcements--announcementId-.svg) |
| /arcade | 아케이드 | game (MAIN_ROUTE_CONCEPT) | [SVG](previews/arcade.svg) |
| /bank | 은행 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/bank.svg) |
| /bank/savings-pot | 은행 · 적금 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/bank-savings-pot.svg) |
| /blog | 블로그 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/blog.svg) |
| /blog/[slug] | 블로그 · 상세 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/blog--slug-.svg) |
| /board | 게시판 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/board.svg) |
| /board/[postId] | 게시판 · 게시글 상세 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/board--postId-.svg) |
| /bonds | 국채 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/bonds.svg) |
| /businesses | 사업 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/businesses.svg) |
| /businesses/ventures | 사업 · 스타트업 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/businesses-ventures.svg) |
| /calculators | 계산기 | tools (BRANCH_ONLY_CONCEPT) | [SVG](previews/calculators.svg) |
| /calendar | 일정 | game (MAIN_ROUTE_CONCEPT) | [SVG](previews/calendar.svg) |
| /casino | 카지노 | game (MAIN_ROUTE_CONCEPT) | [SVG](previews/casino.svg) |
| /central-bank | 중앙은행 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/central-bank.svg) |
| /chat | 채팅 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/chat.svg) |
| /clubs | 클럽 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/clubs.svg) |
| /clubs/[clubId] | 클럽 · 클럽 상세 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/clubs--clubId-.svg) |
| /clubs/[clubId]/members | 클럽 · 클럽 상세 · 멤버 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/clubs--clubId--members.svg) |
| /clubs/new | 클럽 · 신규 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/clubs-new.svg) |
| /clubs/warfare | 클럽 · 클럽전 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/clubs-warfare.svg) |
| /collections | 컬렉션 | game (MAIN_ROUTE_CONCEPT) | [SVG](previews/collections.svg) |
| /dashboard | 대시보드 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/dashboard.svg) |
| /data-deletion | 데이터 삭제 | legal (MAIN_ROUTE_CONCEPT) | [SVG](previews/data-deletion.svg) |
| /design-preview | 디자인 미리보기 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/design-preview.svg) |
| /developer | 개발자 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/developer.svg) |
| /enterprises | 국영기업 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/enterprises.svg) |
| /features | 기능 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/features.svg) |
| /forgot-password | 비밀번호 찾기 | auth (MAIN_ROUTE_CONCEPT) | [SVG](previews/forgot-password.svg) |
| /fx | 외환 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/fx.svg) |
| /gallery | 갤러리 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/gallery.svg) |
| /gallery/[photoId] | 갤러리 · 사진 상세 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/gallery--photoId-.svg) |
| /gallery/submit | 갤러리 · 등록 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/gallery-submit.svg) |
| /guide | 가이드 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/guide.svg) |
| /guide/career-mastery | 가이드 · 직업 숙련 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/guide-career-mastery.svg) |
| /guide/dopamine-system | 가이드 · 성장 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/guide-dopamine-system.svg) |
| /guide/glossary | 가이드 · 용어사전 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/guide-glossary.svg) |
| /guide/glossary/[term] | 가이드 · 용어사전 · 용어 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/guide-glossary--term-.svg) |
| /guide/stock-trading | 가이드 · 주식 거래 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/guide-stock-trading.svg) |
| /guide/virtual-banking | 가이드 · 가상 은행 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/guide-virtual-banking.svg) |
| /help | 도움말 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/help.svg) |
| /help/[slug] | 도움말 · 상세 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/help--slug-.svg) |
| /inventory | 보관함 | game (MAIN_ROUTE_CONCEPT) | [SVG](previews/inventory.svg) |
| /invite/[code] | 초대 · 초대 링크 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/invite--code-.svg) |
| /kdic | 예금보험 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/kdic.svg) |
| /lobby | 로비 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/lobby.svg) |
| /login | 로그인 | auth (MAIN_ROUTE_CONCEPT) | [SVG](previews/login.svg) |
| /login/providers | 로그인 · 소셜 인증 | auth (MAIN_ROUTE_CONCEPT) | [SVG](previews/login-providers.svg) |
| /marketplace | 마켓 | game (MAIN_ROUTE_CONCEPT) | [SVG](previews/marketplace.svg) |
| /marketplace/auction | 마켓 · 경매 | game (MAIN_ROUTE_CONCEPT) | [SVG](previews/marketplace-auction.svg) |
| /mint | 조폐국 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/mint.svg) |
| /newspaper | 신문 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/newspaper.svg) |
| /pension | 연금 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/pension.svg) |
| /prediction | 예측 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/prediction.svg) |
| /privacy | 개인정보 | legal (MAIN_ROUTE_CONCEPT) | [SVG](previews/privacy.svg) |
| /profile | 프로필 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/profile.svg) |
| /profile/[userId] | 프로필 · 사용자 상세 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/profile--userId-.svg) |
| /profile/settings | 프로필 · 설정 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/profile-settings.svg) |
| /progression | 성장 | game (MAIN_ROUTE_CONCEPT) | [SVG](previews/progression.svg) |
| /progression/prestige | 성장 · 명성 | game (MAIN_ROUTE_CONCEPT) | [SVG](previews/progression-prestige.svg) |
| /quests | 퀘스트 | game (MAIN_ROUTE_CONCEPT) | [SVG](previews/quests.svg) |
| /register | 회원가입 | auth (MAIN_ROUTE_CONCEPT) | [SVG](previews/register.svg) |
| /reset-password | 비밀번호 재설정 | auth (MAIN_ROUTE_CONCEPT) | [SVG](previews/reset-password.svg) |
| /roadmap | 로드맵 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/roadmap.svg) |
| /safety | 안전 | legal (MAIN_ROUTE_CONCEPT) | [SVG](previews/safety.svg) |
| /safety/takedown | 안전 · 게시 중단 | legal (MAIN_ROUTE_CONCEPT) | [SVG](previews/safety-takedown.svg) |
| /search | 검색 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/search.svg) |
| /seasons | 시즌 | game (MAIN_ROUTE_CONCEPT) | [SVG](previews/seasons.svg) |
| /shop | 상점 | game (MAIN_ROUTE_CONCEPT) | [SVG](previews/shop.svg) |
| /shop/catalog | 상점 · 카탈로그 | game (MAIN_ROUTE_CONCEPT) | [SVG](previews/shop-catalog.svg) |
| /spaces | 공간 | game (MAIN_ROUTE_CONCEPT) | [SVG](previews/spaces.svg) |
| /spaces/real-estate | 공간 · 부동산 | game (MAIN_ROUTE_CONCEPT) | [SVG](previews/spaces-real-estate.svg) |
| /status | 상태 | member (MAIN_ROUTE_CONCEPT) | [SVG](previews/status.svg) |
| /stocks | 주식 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/stocks.svg) |
| /stocks/[symbol] | 주식 · 종목 상세 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/stocks--symbol-.svg) |
| /stocks/alerts | 주식 · 알림 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/stocks-alerts.svg) |
| /stocks/community | 주식 · 토론 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/stocks-community.svg) |
| /stocks/compare | 주식 · 비교 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/stocks-compare.svg) |
| /stocks/derivatives | 주식 · 파생상품 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/stocks-derivatives.svg) |
| /stocks/history | 주식 · 내역 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/stocks-history.svg) |
| /stocks/league | 주식 · 리그 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/stocks-league.svg) |
| /stocks/portfolio | 주식 · 포트폴리오 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/stocks-portfolio.svg) |
| /stocks/watchlist | 주식 · 관심종목 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/stocks-watchlist.svg) |
| /support | 고객지원 | social (MAIN_ROUTE_CONCEPT) | [SVG](previews/support.svg) |
| /terms | 이용약관 | legal (MAIN_ROUTE_CONCEPT) | [SVG](previews/terms.svg) |
| /tools | 금융 도구 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools.svg) |
| /tools/capital-gains-tax-calculator | 금융 도구 · 양도세 계산기 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-capital-gains-tax-calculator.svg) |
| /tools/capital-gains-tax-calculator/[preset] | 금융 도구 · 양도세 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-capital-gains-tax-calculator--preset-.svg) |
| /tools/compound-calculator | 금융 도구 · 복리 계산기 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-compound-calculator.svg) |
| /tools/compound-calculator/[preset] | 금융 도구 · 복리 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-compound-calculator--preset-.svg) |
| /tools/crypto-apy-calculator | 금융 도구 · 가상자산 수익률 계산기 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-crypto-apy-calculator.svg) |
| /tools/dividend-tax-calculator | 금융 도구 · 배당세 계산기 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-dividend-tax-calculator.svg) |
| /tools/dividend-tax-calculator/[ticker] | 금융 도구 · 배당세 계산기 · 종목 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-dividend-tax-calculator--ticker-.svg) |
| /tools/farming-calculator | 금융 도구 · 직업 수익 계산기 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-farming-calculator.svg) |
| /tools/farming-calculator/[preset] | 금융 도구 · 직업 수익 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-farming-calculator--preset-.svg) |
| /tools/fire-calculator | 금융 도구 · 경제적 자유 계산기 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-fire-calculator.svg) |
| /tools/gift-tax-calculator | 금융 도구 · 증여세 계산기 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-gift-tax-calculator.svg) |
| /tools/gift-tax-calculator/[preset] | 금융 도구 · 증여세 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-gift-tax-calculator--preset-.svg) |
| /tools/goal-wealth-calculator | 금융 도구 · 목표 자산 계산기 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-goal-wealth-calculator.svg) |
| /tools/isa-calculator | 금융 도구 · ISA 계산기 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-isa-calculator.svg) |
| /tools/isa-calculator/[slug] | 금융 도구 · ISA 계산기 · 상세 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-isa-calculator--slug-.svg) |
| /tools/kimchi-premium-calculator | 금융 도구 · 김치 프리미엄 계산기 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-kimchi-premium-calculator.svg) |
| /tools/kimchi-premium-calculator/[preset] | 금융 도구 · 김치 프리미엄 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-kimchi-premium-calculator--preset-.svg) |
| /tools/loan-interest-calculator | 금융 도구 · 대출 이자 계산기 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-loan-interest-calculator.svg) |
| /tools/loan-interest-calculator/[preset] | 금융 도구 · 대출 이자 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-loan-interest-calculator--preset-.svg) |
| /tools/pension-tax-calculator | 금융 도구 · 연금 세금 계산기 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-pension-tax-calculator.svg) |
| /tools/pension-tax-calculator/[slug] | 금융 도구 · 연금 세금 계산기 · 상세 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-pension-tax-calculator--slug-.svg) |
| /tools/quant-studio | 금융 도구 · 퀀트 스튜디오 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-quant-studio.svg) |
| /tools/real-estate-calculator | 금융 도구 · 부동산 계산기 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-real-estate-calculator.svg) |
| /tools/real-estate-calculator/[preset] | 금융 도구 · 부동산 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-real-estate-calculator--preset-.svg) |
| /tools/retirement-calculator | 금융 도구 · 은퇴 계산기 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-retirement-calculator.svg) |
| /tools/retirement-calculator/[slug] | 금융 도구 · 은퇴 계산기 · 상세 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-retirement-calculator--slug-.svg) |
| /tools/salary-calculator | 금융 도구 · 급여 계산기 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-salary-calculator.svg) |
| /tools/salary-calculator/[preset] | 금융 도구 · 급여 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-salary-calculator--preset-.svg) |
| /tools/stock-calculator | 금융 도구 · 주식 계산기 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-stock-calculator.svg) |
| /tools/stock-calculator/[preset] | 금융 도구 · 주식 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-stock-calculator--preset-.svg) |
| /tools/tax-calculator | 금융 도구 · 세금 계산기 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-tax-calculator.svg) |
| /tools/youth-leap-calculator | 금융 도구 · 청년도약 계산기 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-youth-leap-calculator.svg) |
| /tools/youth-leap-calculator/[preset] | 금융 도구 · 청년도약 계산기 · 프리셋 | tools (MAIN_ROUTE_CONCEPT) | [SVG](previews/tools-youth-leap-calculator--preset-.svg) |
| /treasury | 국고 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/treasury.svg) |
| /verify-email | 이메일 확인 | auth (MAIN_ROUTE_CONCEPT) | [SVG](previews/verify-email.svg) |
| /verify-email-change | 이메일 변경 확인 | auth (MAIN_ROUTE_CONCEPT) | [SVG](previews/verify-email-change.svg) |
| /wallet | 지갑 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/wallet.svg) |
| /wallet/activity | 지갑 · 활동 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/wallet-activity.svg) |
| /wallet/activity/transactions/[transactionId] | 지갑 · 활동 · 거래 상세 · 거래 상세 | finance (MAIN_ROUTE_CONCEPT) | [SVG](previews/wallet-activity-transactions--transactionId-.svg) |
| /work | 직업 | game (MAIN_ROUTE_CONCEPT) | [SVG](previews/work.svg) |
