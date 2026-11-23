# 게임형 UI 180개 이미지·기능 전수 QA — v2026.11.23.10

## 실제 발견 및 수정
- 블로그 상세 이미지에서 본문·작성 정보·목차·댓글 누락(P1): 새 v10 상세 화면에 해당 섹션 추가.
- v8 이미지 180개에 지나치게 동일한 공통 카드 재사용(P1): 은행 입출금, 거래/종목 상세, 게시글/댓글, 게임 진행, 로그인·등록, 관리자, 약관 등 경로 유형별 시각 구조 분리.
- 히어로 원형 장식이 글자/레이아웃 영역을 침범: 크기·위치 축소. 기기별 실측 시각 QA는 미완료.
- PNG 180/180 정상 열림, 1660x990, 중복 SHA 0, 기존 v8 대비 본문 영역 전부 변경, 실제 favicon 원본 픽셀 3곳 x180개 검증, 오류 0.
- 새 이미지는 여전히 자동 제작된 1차 후보. 모든 화면 개별 예술적 완성도/접근성·반응형 수동 리뷰는 OPEN.

## 기획된 기능 실제 지원 점검
- 원본 디자인 180 경로와 Next 페이지 소스 180/180 매칭. Spring 직접 HTML 경로 정적 추출 33/180; 나머지는 다른 라우터나 별도 서비스에서 제공할 수도 있으므로 런타임 없음을 단정할 수 없음.
- 네이티브 Node 소스 테스트 347/347 통과. 코드를 통해 206개 form, 1146개 이벤트 핸들러, 509개의 API URL 참조를 확인했지만 실제 API 성공과 구분.
- localhost 읽기 전용 GET: 루트·블로그 샘플 HTML 200; 서버시계 API JSON 200 및 600초/일·7일/주; 은행·관리자 비인증 요청 로그인 리다이렉트. 블로그 테스트 상세의 title이 홈 대시보드여서 콘텐츠 라우팅 추가 확인 필요.
- 실제 moneyverse-backend/frontend 표준 systemd 유닛 inactive 보고. 일부 독립 Test/프록시가 응답하므로 운영 서비스의 정확한 SHA/Host/권한/DB 증명은 아직 없음.
- **전체 기능 정상 작동이라고 판단할 수 없음**: 인증/CSRF·금융 이자/거래 원장·퀘스트 보상·관리자 권한·다국어 실제 화면·180개 E2E Test 미검증.

## 심각도별 미완료 문제
| ID | 심각도 | 문제 | 조치 |
| --- | --- | --- | --- |
| IMG-01 | P1 | 블로그 상세의 본문·메타·댓글 누락 | v10 이미지 구조 수정, 실제 경로 렌더링 QA 남음 |
| IMG-02 | P1 | 180개 공통 카드 오남용 | 화면 유형별 교체, 세부 수동 디자인 검토 남음 |
| IMG-03 | P1 | 원형 장식 및 모바일 레이아웃 겹침 | 디자인 수정, 320/390px 렌더 검증 남음 |
| API-01 | P1 | 실제 Spring 직접 라우트 33/180 | 프록시/Next/운영 경로별 전수 Test 필요 |
| API-02 | P1 | 블로그 테스트 상세가 홈 title 출력 | 실제 slug/404/로그인·API 데이터 규약 확인 |
| SEC-01 | P0 | 관리자 메뉴/서비스 권한 E2E 미검증 | 회원·비회원 DOM/검색/접근 0건, 관리자 허용 경로 증명 |
| FIN-01 | P0 | 금전 원장·은행 이율·게임시계 DB 실패 경로 미검증 | 독립 Test 거래/이자/실패/롤백 QA |

| Route | Latest PNG | Spring exact mapping | State |
| --- | --- | --- | --- |
| / | [PNG](../design/game-ui-v2026.11.23.10/previews/home.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /[locale]/blog | [PNG](../design/game-ui-v2026.11.23.10/previews/-locale--blog.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /[locale]/blog/[slug] | [PNG](../design/game-ui-v2026.11.23.10/previews/-locale--blog--slug-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /[locale]/guide/glossary | [PNG](../design/game-ui-v2026.11.23.10/previews/-locale--guide-glossary.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /[locale]/guide/glossary/[term] | [PNG](../design/game-ui-v2026.11.23.10/previews/-locale--guide-glossary--term-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /[locale]/tools/compound-interest-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/-locale--tools-compound-interest-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /[locale]/tools/compound-interest-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/-locale--tools-compound-interest-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /account | [PNG](../design/game-ui-v2026.11.23.10/previews/account.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /account-deletion | [PNG](../design/game-ui-v2026.11.23.10/previews/account-deletion.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /account/notifications | [PNG](../design/game-ui-v2026.11.23.10/previews/account-notifications.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /account/privacy | [PNG](../design/game-ui-v2026.11.23.10/previews/account-privacy.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /account/security | [PNG](../design/game-ui-v2026.11.23.10/previews/account-security.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin | [PNG](../design/game-ui-v2026.11.23.10/previews/admin.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/analytics | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-analytics.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/api-health | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-api-health.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/bank | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-bank.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/blog | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-blog.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/bonds | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-bonds.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/catalog | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-catalog.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/central-bank | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-central-bank.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/content | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-content.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/controls | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-controls.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/discord | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-discord.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/economy | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-economy.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/economy/scenario-lab | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-economy-scenario-lab.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/enterprises | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-enterprises.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/fx | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-fx.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/help | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-help.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/kdic | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-kdic.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/logs | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-logs.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/logs/activity | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-logs-activity.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/logs/delivery | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-logs-delivery.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/logs/errors | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-logs-errors.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/logs/integrity | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-logs-integrity.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/logs/system | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-logs-system.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/market | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-market.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/market/ai-news | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-market-ai-news.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/mint | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-mint.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/money-flow | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-money-flow.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/operations/storage | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-operations-storage.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/pension | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-pension.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/safety | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-safety.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/security | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-security.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/seo | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-seo.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/seo-audit | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-seo-audit.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/shop | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-shop.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/support | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-support.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/treasury | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-treasury.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/treasury/grants | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-treasury-grants.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/users | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-users.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/users/[id] | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-users--id-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /admin/work | [PNG](../design/game-ui-v2026.11.23.10/previews/admin-work.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /advisor | [PNG](../design/game-ui-v2026.11.23.10/previews/advisor.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /announcements | [PNG](../design/game-ui-v2026.11.23.10/previews/announcements.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /announcements/[announcementId] | [PNG](../design/game-ui-v2026.11.23.10/previews/announcements--announcementId-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /arcade | [PNG](../design/game-ui-v2026.11.23.10/previews/arcade.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /bank | [PNG](../design/game-ui-v2026.11.23.10/previews/bank.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /bank/savings-pot | [PNG](../design/game-ui-v2026.11.23.10/previews/bank-savings-pot.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /blog | [PNG](../design/game-ui-v2026.11.23.10/previews/blog.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /blog/[slug] | [PNG](../design/game-ui-v2026.11.23.10/previews/blog--slug-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /board | [PNG](../design/game-ui-v2026.11.23.10/previews/board.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /board/[postId] | [PNG](../design/game-ui-v2026.11.23.10/previews/board--postId-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /bonds | [PNG](../design/game-ui-v2026.11.23.10/previews/bonds.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /businesses | [PNG](../design/game-ui-v2026.11.23.10/previews/businesses.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /businesses/ventures | [PNG](../design/game-ui-v2026.11.23.10/previews/businesses-ventures.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /calculators | [PNG](../design/game-ui-v2026.11.23.10/previews/calculators.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /calendar | [PNG](../design/game-ui-v2026.11.23.10/previews/calendar.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /casino | [PNG](../design/game-ui-v2026.11.23.10/previews/casino.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /central-bank | [PNG](../design/game-ui-v2026.11.23.10/previews/central-bank.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /chat | [PNG](../design/game-ui-v2026.11.23.10/previews/chat.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /clubs | [PNG](../design/game-ui-v2026.11.23.10/previews/clubs.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /clubs/[clubId] | [PNG](../design/game-ui-v2026.11.23.10/previews/clubs--clubId-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /clubs/[clubId]/members | [PNG](../design/game-ui-v2026.11.23.10/previews/clubs--clubId--members.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /clubs/new | [PNG](../design/game-ui-v2026.11.23.10/previews/clubs-new.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /clubs/warfare | [PNG](../design/game-ui-v2026.11.23.10/previews/clubs-warfare.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /collections | [PNG](../design/game-ui-v2026.11.23.10/previews/collections.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /dashboard | [PNG](../design/game-ui-v2026.11.23.10/previews/dashboard.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /data-deletion | [PNG](../design/game-ui-v2026.11.23.10/previews/data-deletion.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /design-preview | [PNG](../design/game-ui-v2026.11.23.10/previews/design-preview.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /developer | [PNG](../design/game-ui-v2026.11.23.10/previews/developer.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /enterprises | [PNG](../design/game-ui-v2026.11.23.10/previews/enterprises.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /features | [PNG](../design/game-ui-v2026.11.23.10/previews/features.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /forgot-password | [PNG](../design/game-ui-v2026.11.23.10/previews/forgot-password.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /fx | [PNG](../design/game-ui-v2026.11.23.10/previews/fx.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /gallery | [PNG](../design/game-ui-v2026.11.23.10/previews/gallery.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /gallery/[photoId] | [PNG](../design/game-ui-v2026.11.23.10/previews/gallery--photoId-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /gallery/submit | [PNG](../design/game-ui-v2026.11.23.10/previews/gallery-submit.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /guide | [PNG](../design/game-ui-v2026.11.23.10/previews/guide.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /guide/career-mastery | [PNG](../design/game-ui-v2026.11.23.10/previews/guide-career-mastery.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /guide/dopamine-system | [PNG](../design/game-ui-v2026.11.23.10/previews/guide-dopamine-system.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /guide/glossary | [PNG](../design/game-ui-v2026.11.23.10/previews/guide-glossary.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /guide/glossary/[term] | [PNG](../design/game-ui-v2026.11.23.10/previews/guide-glossary--term-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /guide/stock-trading | [PNG](../design/game-ui-v2026.11.23.10/previews/guide-stock-trading.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /guide/virtual-banking | [PNG](../design/game-ui-v2026.11.23.10/previews/guide-virtual-banking.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /help | [PNG](../design/game-ui-v2026.11.23.10/previews/help.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /help/[slug] | [PNG](../design/game-ui-v2026.11.23.10/previews/help--slug-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /inventory | [PNG](../design/game-ui-v2026.11.23.10/previews/inventory.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /invite/[code] | [PNG](../design/game-ui-v2026.11.23.10/previews/invite--code-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /kdic | [PNG](../design/game-ui-v2026.11.23.10/previews/kdic.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /lobby | [PNG](../design/game-ui-v2026.11.23.10/previews/lobby.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /login | [PNG](../design/game-ui-v2026.11.23.10/previews/login.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /login/providers | [PNG](../design/game-ui-v2026.11.23.10/previews/login-providers.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /marketplace | [PNG](../design/game-ui-v2026.11.23.10/previews/marketplace.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /marketplace/auction | [PNG](../design/game-ui-v2026.11.23.10/previews/marketplace-auction.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /mint | [PNG](../design/game-ui-v2026.11.23.10/previews/mint.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /newspaper | [PNG](../design/game-ui-v2026.11.23.10/previews/newspaper.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /pension | [PNG](../design/game-ui-v2026.11.23.10/previews/pension.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /prediction | [PNG](../design/game-ui-v2026.11.23.10/previews/prediction.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /privacy | [PNG](../design/game-ui-v2026.11.23.10/previews/privacy.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /profile | [PNG](../design/game-ui-v2026.11.23.10/previews/profile.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /profile/[userId] | [PNG](../design/game-ui-v2026.11.23.10/previews/profile--userId-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /profile/settings | [PNG](../design/game-ui-v2026.11.23.10/previews/profile-settings.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /progression | [PNG](../design/game-ui-v2026.11.23.10/previews/progression.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /progression/prestige | [PNG](../design/game-ui-v2026.11.23.10/previews/progression-prestige.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /quests | [PNG](../design/game-ui-v2026.11.23.10/previews/quests.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /register | [PNG](../design/game-ui-v2026.11.23.10/previews/register.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /reset-password | [PNG](../design/game-ui-v2026.11.23.10/previews/reset-password.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /roadmap | [PNG](../design/game-ui-v2026.11.23.10/previews/roadmap.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /safety | [PNG](../design/game-ui-v2026.11.23.10/previews/safety.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /safety/takedown | [PNG](../design/game-ui-v2026.11.23.10/previews/safety-takedown.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /search | [PNG](../design/game-ui-v2026.11.23.10/previews/search.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /seasons | [PNG](../design/game-ui-v2026.11.23.10/previews/seasons.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /shop | [PNG](../design/game-ui-v2026.11.23.10/previews/shop.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /shop/catalog | [PNG](../design/game-ui-v2026.11.23.10/previews/shop-catalog.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /spaces | [PNG](../design/game-ui-v2026.11.23.10/previews/spaces.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /spaces/real-estate | [PNG](../design/game-ui-v2026.11.23.10/previews/spaces-real-estate.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /status | [PNG](../design/game-ui-v2026.11.23.10/previews/status.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /stocks | [PNG](../design/game-ui-v2026.11.23.10/previews/stocks.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /stocks/[symbol] | [PNG](../design/game-ui-v2026.11.23.10/previews/stocks--symbol-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /stocks/alerts | [PNG](../design/game-ui-v2026.11.23.10/previews/stocks-alerts.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /stocks/community | [PNG](../design/game-ui-v2026.11.23.10/previews/stocks-community.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /stocks/compare | [PNG](../design/game-ui-v2026.11.23.10/previews/stocks-compare.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /stocks/derivatives | [PNG](../design/game-ui-v2026.11.23.10/previews/stocks-derivatives.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /stocks/history | [PNG](../design/game-ui-v2026.11.23.10/previews/stocks-history.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /stocks/league | [PNG](../design/game-ui-v2026.11.23.10/previews/stocks-league.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /stocks/portfolio | [PNG](../design/game-ui-v2026.11.23.10/previews/stocks-portfolio.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /stocks/watchlist | [PNG](../design/game-ui-v2026.11.23.10/previews/stocks-watchlist.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /support | [PNG](../design/game-ui-v2026.11.23.10/previews/support.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /terms | [PNG](../design/game-ui-v2026.11.23.10/previews/terms.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools | [PNG](../design/game-ui-v2026.11.23.10/previews/tools.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/capital-gains-tax-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-capital-gains-tax-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/capital-gains-tax-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-capital-gains-tax-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/compound-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-compound-calculator.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/compound-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-compound-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/crypto-apy-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-crypto-apy-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/dividend-tax-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-dividend-tax-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/dividend-tax-calculator/[ticker] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-dividend-tax-calculator--ticker-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/farming-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-farming-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/farming-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-farming-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/fire-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-fire-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/gift-tax-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-gift-tax-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/gift-tax-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-gift-tax-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/goal-wealth-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-goal-wealth-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/isa-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-isa-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/isa-calculator/[slug] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-isa-calculator--slug-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/kimchi-premium-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-kimchi-premium-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/kimchi-premium-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-kimchi-premium-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/loan-interest-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-loan-interest-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/loan-interest-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-loan-interest-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/pension-tax-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-pension-tax-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/pension-tax-calculator/[slug] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-pension-tax-calculator--slug-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/quant-studio | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-quant-studio.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/real-estate-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-real-estate-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/real-estate-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-real-estate-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/retirement-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-retirement-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/retirement-calculator/[slug] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-retirement-calculator--slug-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/salary-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-salary-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/salary-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-salary-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/stock-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-stock-calculator.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/stock-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-stock-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/tax-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-tax-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/youth-leap-calculator | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-youth-leap-calculator.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /tools/youth-leap-calculator/[preset] | [PNG](../design/game-ui-v2026.11.23.10/previews/tools-youth-leap-calculator--preset-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /treasury | [PNG](../design/game-ui-v2026.11.23.10/previews/treasury.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /verify-email | [PNG](../design/game-ui-v2026.11.23.10/previews/verify-email.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /verify-email-change | [PNG](../design/game-ui-v2026.11.23.10/previews/verify-email-change.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /wallet | [PNG](../design/game-ui-v2026.11.23.10/previews/wallet.png) | YES | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /wallet/activity | [PNG](../design/game-ui-v2026.11.23.10/previews/wallet-activity.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /wallet/activity/transactions/[transactionId] | [PNG](../design/game-ui-v2026.11.23.10/previews/wallet-activity-transactions--transactionId-.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |
| /work | [PNG](../design/game-ui-v2026.11.23.10/previews/work.png) | NOT_IN_STATIC_SCAN | IMAGE_FILE_QA_PASS / LIVE_NOT_VERIFIED |

## 독립 Test 백엔드 읽기 전용 실측 (2026-11-23 KST)
- moneyverse-nov18-test-backend-v20261122.service 가 실행 중이며 localhost:55438 바인딩 확인.
- GET /actuator/health: HTTP 200 JSON status=UP.
- GET /api/v1/game-clock: HTTP 200, policyVersion=v2026.09.15.114, realSecondsPerDay=600, gameDaysPerWeek=7.
- GET / 및 /bank: 각각 HTML 200, 페이지 읽기 성공만 확인. 금융 거래 성공 증거 아님.
- GET /admin: 비로그인 302 로그인 경로로 리다이렉트, 실제 관리자 로그인/RBAC E2E 검증은 별도 필요.
- 중요 발견: GET /blog/test-article: HTTP 200인데 HTML title은 홈 대시보드. 등록되지 않은 slug/라우팅/SEO/404 경로 오류 가능성. 실제 게시글 상세 API 검증 전 정상 판정 금지.
- 전체 사용자 인증, 거래·정산 쓰기, 관리자 변경, 180개 페이지 E2E·운영 QA는 해당 읽기 전용 검사에 포함되지 않음.
