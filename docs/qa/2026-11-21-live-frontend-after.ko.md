# 운영 전환 후 전체 정적 화면 QA

신규 런타임 source: `e45f57595415f132eedf36c13748564b93a1d918`. 관리자39·회원108 정적147개를 실제 로그인 브라우저에서 다시 열었다. 동적33개는 fixture 필요로 미검증이다. 현재 회원78개 오류/차단 및 관리자 오류 로그1개 오류 안내가 남는다. 단순 문서 접근은 기능 성공이 아니다.

Nov18 통일26개 화면은 PC1440/mobile390 × en/ko/ja/zh/vi 260조합에서 가로 넘침0·파비콘 로고 오류0. 실제 운영26개는 Test 중지 상태에서도 재확인했다. 계산기 실제 입력 결과 복리1,210, 평균단가150/목표가165, 언어 전환 draft 유지·FAQ·관리자 빈 결과 검색·메뉴 Escape/focus·문의 안내창을 확인했다. 지갑 총합=현금+은행을 10조합에서 정확한 정수 문자열로 비교했다.

## 미해결 기능 우선순위

|우선|기능|현재 실제 결과|해결 조건|
|---|---|---|---|
|P1|문의/쪽지 조회·전송|같은 로그인으로 실제 API JSON ok:true와 threads1/conversations2를 확인했으나 새 화면 owner/DTO 계약 검증 실패. 빈 목록으로 위장하지 않고 전송 비활성|기존4646 읽기 원천의 actor/owner 응답·DTO를 disposable DB/2계정에서 재검증 후 제한된 API 승격. 단순 owner-header 덧붙이기 금지|
|P1|송금|지갑 조회/합계는 확인, 현 세션 CSRF proof가 없어 입력·송금 비활성|정상 세션/CSRF의 실제 로그인 또는 재인증 계약 검증. 검증·잔액 규칙을 완화하지 않음|
|P1|계정 및 기타 회원78경로|오류/403. 일반 URL을 잡는 scanner-shield가 있으나 일괄 해제는 기존 private snapshot 노출 위험|owner-bound 실제 화면·API·역할/fixture 검증 후 exact route로 순차 대체|
|P1|관리자 오류 로그|오류 안내, 기존 source에 제거된 FRONTEND unit 참조|별도 backend source/실제 unit 계약 검증·승격|
|P1|관리자 변경 기능·나머지29정적 경로|조회10개 UI 수용을 모든 관리 기능 구현으로 간주할 수 없음|각 mutation의 인자 획득/권한/재인증/DB/receipt/Test-safe fixture 검증|
|P1|거래/구매/게시|조회 시안만으로 매매·구매·게시 정상 판정 불가|실제 API/원장/재고·게시 상태 전후와 취소·중복 요청 증거|
|P1|가입·복구·검증/삭제 인증 흐름|기존 backend/consent hold 유지, 일부 안내 화면은 비활성 상태|실제 동의기록·나이·메일 전달·계정 수명주기 검증. 실제 자격증명 로그인 제출도 이번 브라우저 QA에서 미실행|
|P1|기존 API 관제 backend|새 UI는 실제4개 조회만 표시. 오래된 controller의 고정 글로벌 건강값은 별도 미해결|실측 수집/관측 범위·시점·실패를 지키는 backend 계약|
|P2|일부 기존 관리자 h1 부재|로그/문의/FX/KDIC/help/activity 등 기존 화면의 제목/콘텐츠·접근성 추가 확인 필요|실제 렌더·내용/언어/키보드 수용|

## 경로별 현재 결과

|경로|실제 문서|h1|form/input/button|변경 기능|
|---|---|---|---|---|
|`/`|문서 관찰·기능 미수용|홈|0/1/5|별도 증거 필요|
|`/account`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/account-deletion`|문서 관찰·기능 미수용|계정 삭제|0/1/4|별도 증거 필요|
|`/account/notifications`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/account/privacy`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/account/security`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/admin`|문서 관찰·기능 미수용|대시보드|0/3/4|별도 증거 필요|
|`/admin/analytics`|문서 관찰·기능 미수용|텔레메트리 · 그래프 분석실|0/0/31|별도 증거 필요|
|`/admin/api-health`|문서 관찰·기능 미수용|API 관제|0/1/4|별도 증거 필요|
|`/admin/bank`|문서 관찰·기능 미수용|은행 · 대출|0/0/24|별도 증거 필요|
|`/admin/blog`|문서 관찰·기능 미수용|AI 블로그 자동발행 및 국가별 콘텐츠 관리|0/0/232|별도 증거 필요|
|`/admin/bonds`|문서 관찰·기능 미수용|기획재정국채 (KTB) 통합 관제 타워|0/0/27|별도 증거 필요|
|`/admin/catalog`|문서 관찰·기능 미수용|사업 · 시즌 이벤트|0/0/24|별도 증거 필요|
|`/admin/central-bank`|문서 관찰·기능 미수용|한국은행 (BOK) 금융통화위원회|0/0/25|별도 증거 필요|
|`/admin/content`|문서 관찰·기능 미수용|보여 줄 소식만,차분히 꺼내 놓아요.|3/29/31|별도 증거 필요|
|`/admin/controls`|문서 관찰·기능 미수용|킬스위치 제어 센터|0/1/4|별도 증거 필요|
|`/admin/discord`|문서 관찰·기능 미수용|Discord 전달 경로|0/0/24|별도 증거 필요|
|`/admin/economy`|문서 관찰·기능 미수용|경제·원장|0/1/4|별도 증거 필요|
|`/admin/economy/scenario-lab`|문서 관찰·기능 미수용|시나리오 랩|0/1/4|별도 증거 필요|
|`/admin/enterprises`|문서 관찰·기능 미수용|공기업·지배구조|0/1/4|별도 증거 필요|
|`/admin/fx`|문서 관찰·기능 미수용|미관찰|0/0/24|별도 증거 필요|
|`/admin/help`|문서 관찰·기능 미수용|미관찰|0/0/24|별도 증거 필요|
|`/admin/kdic`|문서 관찰·기능 미수용|미관찰|0/0/27|별도 증거 필요|
|`/admin/logs`|문서 관찰·기능 미수용|미관찰|0/0/24|별도 증거 필요|
|`/admin/logs/activity`|문서 관찰·기능 미수용|사용자 접속 · 체류 · 클릭 로그|1/3/28|별도 증거 필요|
|`/admin/logs/delivery`|문서 관찰·기능 미수용|배송·전송 로그|0/1/4|별도 증거 필요|
|`/admin/logs/errors`|오류/차단|화면을 정상적으로 불러오지 못했습니다.|0/0/18|별도 증거 필요|
|`/admin/logs/integrity`|문서 관찰·기능 미수용|무결성 검증 · 보존 정책|1/2/25|별도 증거 필요|
|`/admin/logs/system`|문서 관찰·기능 미수용|시스템 로그|1/5/5|별도 증거 필요|
|`/admin/market`|문서 관찰·기능 미수용|거래소 관제|0/1/4|별도 증거 필요|
|`/admin/market/ai-news`|문서 관찰·기능 미수용|AI 시장 소식|0/0/24|별도 증거 필요|
|`/admin/mint`|문서 관찰·기능 미수용|한국조폐공사 (KOMSCO)|0/0/29|별도 증거 필요|
|`/admin/money-flow`|문서 관찰·기능 미수용|유저 자금 흐름 · 원장 관제|1/3/25|별도 증거 필요|
|`/admin/operations/storage`|문서 관찰·기능 미수용|검증된 호스트 저장공간 여유량|0/0/24|별도 증거 필요|
|`/admin/pension`|문서 관찰·기능 미수용|국민연금공단(NPS) 공적 연금 총괄 관제 센터|0/0/26|별도 증거 필요|
|`/admin/safety`|문서 관찰·기능 미수용|긴급 콘텐츠 삭제 · 안전 센터|0/0/26|별도 증거 필요|
|`/admin/security`|문서 관찰·기능 미수용|계정 정지 · IP 차단|1/0/26|별도 증거 필요|
|`/admin/seo`|문서 관찰·기능 미수용|SEO 및 검색엔진 색인 관제|0/5/48|별도 증거 필요|
|`/admin/seo-audit`|문서 관찰·기능 미수용|검색엔진 수집 감사|0/0/25|별도 증거 필요|
|`/admin/shop`|문서 관찰·기능 미수용|상점 카탈로그 및 상품 가격·재고 통제|0/0/24|별도 증거 필요|
|`/admin/support`|문서 관찰·기능 미수용|미관찰|0/0/24|별도 증거 필요|
|`/admin/treasury`|문서 관찰·기능 미수용|국고 · 비축 자금|1/5/53|별도 증거 필요|
|`/admin/treasury/grants`|문서 관찰·기능 미수용|창업·벤처 지원금 심사 관제탑|0/0/33|별도 증거 필요|
|`/admin/users`|문서 관찰·기능 미수용|회원 디렉토리|1/4/5|별도 증거 필요|
|`/admin/work`|문서 관찰·기능 미수용|작업 · 직업|0/0/24|별도 증거 필요|
|`/advisor`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/announcements`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/arcade`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/bank`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/bank/savings-pot`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/blog`|문서 관찰·기능 미수용|월덕 블로그 \| 경제 · 코딩 · 컴퓨터|0/5/30|별도 증거 필요|
|`/board`|문서 관찰·기능 미수용|커뮤니티|0/5/8|별도 증거 필요|
|`/bonds`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/businesses`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/businesses/ventures`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/calculators`|문서 관찰·기능 미수용|금융 계산기 센터|1/5/5|별도 증거 필요|
|`/calendar`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/casino`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/central-bank`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/chat`|문서 관찰·기능 미수용|쪽지함|1/3/15|별도 증거 필요|
|`/clubs`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/clubs/new`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/clubs/warfare`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/collections`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/dashboard`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/data-deletion`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/design-preview`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/developer`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/enterprises`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/features`|문서 관찰·기능 미수용|실제 화면으로 보는 6대 핀테크 가상 경제 완벽 조작법|0/5/44|별도 증거 필요|
|`/forgot-password`|문서 관찰·기능 미수용|비밀번호 찾기|0/1/4|별도 증거 필요|
|`/fx`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/gallery`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/gallery/submit`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/guide`|문서 관찰·기능 미수용|가이드|0/5/7|별도 증거 필요|
|`/guide/career-mastery`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/guide/dopamine-system`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/guide/glossary`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/guide/stock-trading`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/guide/virtual-banking`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/help`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/inventory`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/kdic`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/lobby`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/login`|문서 관찰·기능 미수용|로그인|1/6/5|별도 증거 필요|
|`/login/providers`|문서 관찰·기능 미수용|로그인|1/6/5|별도 증거 필요|
|`/marketplace`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/marketplace/auction`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/mint`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/newspaper`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/pension`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/prediction`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/privacy`|문서 관찰·기능 미수용|개인정보처리방침|0/4/21|별도 증거 필요|
|`/profile`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/profile/settings`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/progression`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/progression/prestige`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/quests`|문서 관찰·기능 미수용|퀘스트|0/5/7|별도 증거 필요|
|`/register`|문서 관찰·기능 미수용|회원가입|1/7/5|별도 증거 필요|
|`/reset-password`|문서 관찰·기능 미수용|비밀번호 재설정|0/1/4|별도 증거 필요|
|`/roadmap`|문서 관찰·기능 미수용|머니버스 시작 가이드|0/4/21|별도 증거 필요|
|`/safety`|문서 관찰·기능 미수용|머니버스 안전 & 권리 보호 센터|0/4/21|별도 증거 필요|
|`/safety/takedown`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/search`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/seasons`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/shop`|문서 관찰·기능 미수용|상점|0/5/7|별도 증거 필요|
|`/shop/catalog`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/spaces`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/spaces/real-estate`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/status`|문서 관찰·기능 미수용|서비스 상태|0/5/7|별도 증거 필요|
|`/stocks`|문서 관찰·기능 미수용|주식|0/5/7|별도 증거 필요|
|`/stocks/alerts`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/stocks/community`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/stocks/compare`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/stocks/derivatives`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/stocks/history`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/stocks/league`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/stocks/portfolio`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/stocks/watchlist`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/support`|문서 관찰·기능 미수용|관리자 문의|3/9/10|별도 증거 필요|
|`/terms`|문서 관찰·기능 미수용|이용약관|0/4/25|별도 증거 필요|
|`/tools`|문서 관찰·기능 미수용|금융 도구|1/5/6|별도 증거 필요|
|`/tools/capital-gains-tax-calculator`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/tools/compound-calculator`|문서 관찰·기능 미수용|복리 계산기|1/7/5|별도 증거 필요|
|`/tools/crypto-apy-calculator`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/tools/dividend-tax-calculator`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/tools/farming-calculator`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/tools/fire-calculator`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/tools/gift-tax-calculator`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/tools/goal-wealth-calculator`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/tools/isa-calculator`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/tools/kimchi-premium-calculator`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/tools/loan-interest-calculator`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/tools/pension-tax-calculator`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/tools/quant-studio`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/tools/real-estate-calculator`|문서 관찰·기능 미수용|강남 테헤란로 프라임 오피스|0/7/27|별도 증거 필요|
|`/tools/retirement-calculator`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/tools/salary-calculator`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/tools/stock-calculator`|문서 관찰·기능 미수용|주식 평균단가 계산기|1/8/5|별도 증거 필요|
|`/tools/tax-calculator`|문서 관찰·기능 미수용|가상자산·금융투자 세금 계산기|0/3/34|별도 증거 필요|
|`/tools/youth-leap-calculator`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/treasury`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/verify-email`|문서 관찰·기능 미수용|이메일 확인|0/1/4|별도 증거 필요|
|`/verify-email-change`|문서 관찰·기능 미수용|이메일 변경 확인|0/1/4|별도 증거 필요|
|`/wallet`|문서 관찰·기능 미수용|지갑|1/3/11|별도 증거 필요|
|`/wallet/activity`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|
|`/work`|오류/차단|403 Forbidden|0/0/0|별도 증거 필요|

[기능별 source/실행 구분 원장](2026-11-21-frontend-feature-coverage.json) · [실제260조합](2026-11-21-consolidated-test-matrix.json) · [운영/Test독립26조합](2026-11-21-consolidated-production-matrix.json). 전체 기능 PASS가 아니다.
