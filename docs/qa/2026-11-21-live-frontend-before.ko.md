# 실제 전체 정적 화면 QA — 통합 전

2026-11-21 로그인한 실제 브라우저에서 회원108·관리자39, 합계147 정적 경로를 직접 열고 DOM 메타데이터를 기록했다. 동적33개는 실제 대상 fixture/권한/시드 데이터가 필요해 실행하지 않았다. 사용자 개인정보·원문 메시지·계정 식별자·쿠키는 저장하지 않았다.

회원87개가 오류/차단 화면, 관리자 오류 로그1개가 오류 안내다. 화면 접근만으로 송금·매매·구매·관리자 변경 기능 정상이라고 판정하지 않는다. 현재 신규 관리자9개는 조회 UI 수용 범위이며, 나머지 관리 기능은 별도다. 이 원장은 기능별 실행 증거의 시작점이며 전 기능 PASS 보고서가 아니다.

## 확인된 문제
- 계정·문의·채팅·은행·작업 등 정상 로그인 상태에서도403. 잘못된 scanner-shield regex가 일반 URL을 잡지만, 일괄 해제하면 검증되지 않은 기존 private HTML까지 노출될 수 있다. 인증된 소유자 proof를 가진 exact route부터 전환한다.
- `/admin/logs/errors`: “화면을 정상적으로 불러오지 못했습니다.”. 소스의 FRONTEND 로그가 제거된 unit을 참조하는 결함은 별도 backend 승격 전까지 OPEN.
- `/admin/logs`, `/admin/support`, `/admin/fx`, `/admin/kdic`, `/admin/help`, `/admin/logs/activity`: h1 미관찰. 일부에는 메뉴만 남는 짧은 본문이 보이므로 실제 콘텐츠·API·접근성 검증 전 정상으로 올리지 않는다.
- 기존 API 관제는 고정 domain/endpoint 수·성공률·응답시간과 가짜 호스트/DB/백업 건강값을 사용한다. 새 관제는 실제4개 bounded read와 실측시간·표본 수만 제시하며 전체 API/DB 정상률로 확대하지 않는다.
- 공개 stocks/shop/board 시안의 조회 코드를 매매·구매·게시 기능 구현으로 세지 않는다. UI가 있어도 실제 write path와 인자 fixture/권한 증거가 필요하다.
- 초기 일부 관리자 문서는 hydration 전 데이터 수집 가능성이 있어 다시 열고 AX 관찰 후 재수집했다. h1 부재는 정상 가정 대신 추가 검사 대상으로 남긴다.

## 경로별 결과

각 행의 forms/inputs/buttons는 DOM 수량이며 사용·성공 횟수가 아니다. 전체 화면을 휴대전화390px에서 관찰했으며, 아래 메타데이터에서 가로 넘침은 없었다. PC·5언어·키보드·변경 동작은 별도 수용 증거가 필요하다.

|경로|문서 접근|h1|form/input/button|변경 기능|
|---|---|---|---|---|
|`/`|문서 관찰·기능 미수용|홈|0/1/5|미실행|
|`/account`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/account-deletion`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/account/notifications`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/account/privacy`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/account/security`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/admin`|문서 관찰·기능 미수용|대시보드|0/3/4|미실행|
|`/admin/analytics`|문서 관찰·기능 미수용|텔레메트리 · 그래프 분석실|0/0/31|미실행|
|`/admin/api-health`|문서 관찰·기능 미수용|14대 도메인 API 측정 증빙|0/0/26|미실행|
|`/admin/bank`|문서 관찰·기능 미수용|은행 · 대출|0/0/24|미실행|
|`/admin/blog`|문서 관찰·기능 미수용|AI 블로그 자동발행 및 국가별 콘텐츠 관리|0/0/232|미실행|
|`/admin/bonds`|문서 관찰·기능 미수용|기획재정국채 (KTB) 통합 관제 타워|0/0/27|미실행|
|`/admin/catalog`|문서 관찰·기능 미수용|사업 · 시즌 이벤트|0/0/24|미실행|
|`/admin/central-bank`|문서 관찰·기능 미수용|한국은행 (BOK) 금융통화위원회|0/0/25|미실행|
|`/admin/content`|문서 관찰·기능 미수용|보여 줄 소식만,차분히 꺼내 놓아요.|3/29/31|미실행|
|`/admin/controls`|문서 관찰·기능 미수용|킬스위치 제어 센터|0/1/4|미실행|
|`/admin/discord`|문서 관찰·기능 미수용|Discord 전달 경로|0/0/24|미실행|
|`/admin/economy`|문서 관찰·기능 미수용|경제·원장|0/1/4|미실행|
|`/admin/economy/scenario-lab`|문서 관찰·기능 미수용|시나리오 랩|0/1/4|미실행|
|`/admin/enterprises`|문서 관찰·기능 미수용|공기업·지배구조|0/1/4|미실행|
|`/admin/fx`|문서 관찰·기능 미수용|미관찰|0/0/24|미실행|
|`/admin/help`|문서 관찰·기능 미수용|미관찰|0/0/24|미실행|
|`/admin/kdic`|문서 관찰·기능 미수용|미관찰|0/0/27|미실행|
|`/admin/logs`|문서 관찰·기능 미수용|미관찰|0/0/24|미실행|
|`/admin/logs/activity`|문서 관찰·기능 미수용|미관찰|0/0/24|미실행|
|`/admin/logs/delivery`|문서 관찰·기능 미수용|배송·전송 로그|0/1/4|미실행|
|`/admin/logs/errors`|오류/차단|화면을 정상적으로 불러오지 못했습니다.|0/0/18|미실행|
|`/admin/logs/integrity`|문서 관찰·기능 미수용|무결성 검증 · 보존 정책|1/2/25|미실행|
|`/admin/logs/system`|문서 관찰·기능 미수용|시스템 로그|1/5/5|미실행|
|`/admin/market`|문서 관찰·기능 미수용|거래소 관제|0/1/4|미실행|
|`/admin/market/ai-news`|문서 관찰·기능 미수용|AI 시장 소식|0/0/24|미실행|
|`/admin/mint`|문서 관찰·기능 미수용|한국조폐공사 (KOMSCO)|0/0/29|미실행|
|`/admin/money-flow`|문서 관찰·기능 미수용|유저 자금 흐름 · 원장 관제|1/3/25|미실행|
|`/admin/operations/storage`|문서 관찰·기능 미수용|검증된 호스트 저장공간 여유량|0/0/24|미실행|
|`/admin/pension`|문서 관찰·기능 미수용|국민연금공단(NPS) 공적 연금 총괄 관제 센터|0/0/26|미실행|
|`/admin/safety`|문서 관찰·기능 미수용|긴급 콘텐츠 삭제 · 안전 센터|0/0/26|미실행|
|`/admin/security`|문서 관찰·기능 미수용|계정 정지 · IP 차단|1/0/26|미실행|
|`/admin/seo`|문서 관찰·기능 미수용|SEO 및 검색엔진 색인 관제|0/5/48|미실행|
|`/admin/seo-audit`|문서 관찰·기능 미수용|검색엔진 수집 감사|0/0/25|미실행|
|`/admin/shop`|문서 관찰·기능 미수용|상점 카탈로그 및 상품 가격·재고 통제|0/0/24|미실행|
|`/admin/support`|문서 관찰·기능 미수용|미관찰|0/0/24|미실행|
|`/admin/treasury`|문서 관찰·기능 미수용|국고 · 비축 자금|1/5/53|미실행|
|`/admin/treasury/grants`|문서 관찰·기능 미수용|창업·벤처 지원금 심사 관제탑|0/0/33|미실행|
|`/admin/users`|문서 관찰·기능 미수용|회원 디렉토리|1/4/5|미실행|
|`/admin/work`|문서 관찰·기능 미수용|작업 · 직업|0/0/24|미실행|
|`/advisor`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/announcements`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/arcade`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/bank`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/bank/savings-pot`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/blog`|문서 관찰·기능 미수용|월덕 블로그 \| 경제 · 코딩 · 컴퓨터|0/5/28|미실행|
|`/board`|문서 관찰·기능 미수용|커뮤니티|0/5/7|미실행|
|`/bonds`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/businesses`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/businesses/ventures`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/calculators`|문서 관찰·기능 미수용|금융 계산기 센터|1/5/5|미실행|
|`/calendar`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/casino`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/central-bank`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/chat`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/clubs`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/clubs/new`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/clubs/warfare`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/collections`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/dashboard`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/data-deletion`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/design-preview`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/developer`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/enterprises`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/features`|문서 관찰·기능 미수용|실제 화면으로 보는 6대 핀테크 가상 경제 완벽 조작법|0/5/44|미실행|
|`/forgot-password`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/fx`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/gallery`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/gallery/submit`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/guide`|문서 관찰·기능 미수용|가이드|0/5/7|미실행|
|`/guide/career-mastery`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/guide/dopamine-system`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/guide/glossary`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/guide/stock-trading`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/guide/virtual-banking`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/help`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/inventory`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/kdic`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/lobby`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/login`|문서 관찰·기능 미수용|로그인|1/6/5|미실행|
|`/login/providers`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/marketplace`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/marketplace/auction`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/mint`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/newspaper`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/pension`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/prediction`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/privacy`|문서 관찰·기능 미수용|개인정보처리방침|0/4/23|미실행|
|`/profile`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/profile/settings`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/progression`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/progression/prestige`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/quests`|문서 관찰·기능 미수용|퀘스트|0/5/7|미실행|
|`/register`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/reset-password`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/roadmap`|문서 관찰·기능 미수용|머니버스 시작 가이드|0/4/21|미실행|
|`/safety`|문서 관찰·기능 미수용|머니버스 안전 & 권리 보호 센터|0/4/21|미실행|
|`/safety/takedown`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/search`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/seasons`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/shop`|문서 관찰·기능 미수용|상점|0/5/7|미실행|
|`/shop/catalog`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/spaces`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/spaces/real-estate`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/status`|문서 관찰·기능 미수용|서비스 상태|0/5/7|미실행|
|`/stocks`|문서 관찰·기능 미수용|주식|0/5/7|미실행|
|`/stocks/alerts`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/stocks/community`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/stocks/compare`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/stocks/derivatives`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/stocks/history`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/stocks/league`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/stocks/portfolio`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/stocks/watchlist`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/support`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/terms`|문서 관찰·기능 미수용|이용약관|0/4/25|미실행|
|`/tools`|문서 관찰·기능 미수용|금융 도구|1/5/5|미실행|
|`/tools/capital-gains-tax-calculator`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/tools/compound-calculator`|문서 관찰·기능 미수용|복리 계산기|1/7/5|미실행|
|`/tools/crypto-apy-calculator`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/tools/dividend-tax-calculator`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/tools/farming-calculator`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/tools/fire-calculator`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/tools/gift-tax-calculator`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/tools/goal-wealth-calculator`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/tools/isa-calculator`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/tools/kimchi-premium-calculator`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/tools/loan-interest-calculator`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/tools/pension-tax-calculator`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/tools/quant-studio`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/tools/real-estate-calculator`|문서 관찰·기능 미수용|강남 테헤란로 프라임 오피스|0/7/27|미실행|
|`/tools/retirement-calculator`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/tools/salary-calculator`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/tools/stock-calculator`|문서 관찰·기능 미수용|주식 평균단가 계산기|1/8/5|미실행|
|`/tools/tax-calculator`|문서 관찰·기능 미수용|가상자산·금융투자 세금 계산기|0/3/30|미실행|
|`/tools/youth-leap-calculator`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/treasury`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/verify-email`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/verify-email-change`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/wallet`|문서 관찰·기능 미수용|자산 지갑|1/6/13|미실행|
|`/wallet/activity`|오류/차단|403 Forbidden|0/0/0|미실행|
|`/work`|오류/차단|403 Forbidden|0/0/0|미실행|

## 동적 fixture 필요 경로33개

- `/[locale]/blog` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/[locale]/blog/[slug]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/[locale]/guide/glossary` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/[locale]/guide/glossary/[term]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/[locale]/tools/compound-interest-calculator` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/[locale]/tools/compound-interest-calculator/[preset]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/admin/users/[id]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/announcements/[announcementId]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/blog/[slug]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/board/[postId]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/clubs/[clubId]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/clubs/[clubId]/members` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/gallery/[photoId]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/guide/glossary/[term]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/help/[slug]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/invite/[code]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/profile/[userId]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/stocks/[symbol]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/tools/capital-gains-tax-calculator/[preset]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/tools/compound-calculator/[preset]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/tools/dividend-tax-calculator/[ticker]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/tools/farming-calculator/[preset]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/tools/gift-tax-calculator/[preset]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/tools/isa-calculator/[slug]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/tools/kimchi-premium-calculator/[preset]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/tools/loan-interest-calculator/[preset]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/tools/pension-tax-calculator/[slug]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/tools/real-estate-calculator/[preset]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/tools/retirement-calculator/[slug]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/tools/salary-calculator/[preset]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/tools/stock-calculator/[preset]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/tools/youth-leap-calculator/[preset]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
- `/wallet/activity/transactions/[transactionId]` — 소유자/역할·실제 ID·권한·Test-safe fixture를 고정한 뒤 별도 검사.
