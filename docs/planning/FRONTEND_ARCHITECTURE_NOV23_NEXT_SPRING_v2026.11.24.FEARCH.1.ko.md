> **v2026.11.27.PLAN-AUDIT.2:** [Current G2 frontend authority](../design/CURRENT_UI_DESIGN.md). Prior Spring-only frontend, previous visual baselines and unrestricted guest browsing are superseded. Preserve valid functional/security requirements. Administrator access is denied to guests and non-admins at server boundaries; old runtime/automation records are not current instructions.

# 11월 23일 프론트엔드 아키텍처 단일 결정 — v2026.11.24.FEARCH.1

> 상태: **사용자 승인 기술 방향 / 문서 제안 / 실제 서버 전환 전**. [영어 정본](FRONTEND_ARCHITECTURE_NOV23_NEXT_SPRING_v2026.11.24.FEARCH.1.md) · [추적 #3422](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3422). 현재 적용 순위와 원문 PR 이력은 [문서 기준](../DOCUMENT_AUTHORITY.ko.md)을 따른다. 실제 서버 전환 증거는 별도로 요구한다.

## 1. 무엇을 사용할 것인가
**확정 목표**: **Next.js 16 + React 19 + TypeScript + Tailwind CSS 4(공통 디자인 토큰/접근 가능한 컴포넌트)**를 **독립 프론트엔드 서버**에서 실행한다. **Spring Boot는 인증/권한, 사용자 정보, 은행·지갑·주식·원장, 게임 로직, DB/API의 권위 서버**로 유지한다. 브라우저는 같은 HTTPS 도메인의 Next 서버에 요청하고, Next 서버가 내부망 Spring API에 인증된 요청을 중계(BFF)한다. 프론트엔드에서 임의 잔액·권한·거래 성공을 만들지 않는다.

기존 `frontend/package.json`에 Next/React/Tailwind가 있고 `frontend/src/lib/api.ts`에 server-only API 중계가 존재하므로 **기존 코드를 보안 감사 후 재활용**한다. 진행 중인 Spring MVC+Thymeleaf 화면은 **기존 Test/운영의 과도기 구현**으로 안전하게 유지한다. 구형 기획서의 '새 화면은 무조건 Thymeleaf'라는 **기술 선택 부분만 이번 결정으로 대체**한다. 게임 규칙/보안/디자인 승인/승격 규정은 대체하지 않는다. 본 문서가 main 병합되기 전에는 현행 실행 규정과 기존 서비스가 자동 변경되지 않는다.

## 2. 디자인 정본 충돌 방지
- **23일 수정 v10 기준**: 불변 커밋 `39888c7d26bdf688737a77b93a7da29e230b4168`, `docs/UI_UX_SINGLE_REFERENCE.ko.md`, `docs/design/game-ui-v2026.11.23.10/README.ko.md`, PNG 180개. PR #3400은 병합되지 않아 main에 자동 존재하지 않는다.
- **11월 18일 180개 및 23일 v8/v10 디자인은 전부 보존**. 시안 제작/검수/실제 구현 상태를 구분한다. v10 180개 파일 QA 통과 ≠ 180개 디자인 승인·웹 구현 완료.
- **공식 로고는 기존 실제 favicon.ico**. 가짜 W/왕관 등으로 바꾸지 않는다. 색상 #0C1020(배경), #151D32(카드), #9C83FF(보라)를 공유 토큰으로 관리하며 페이지별 정보 구조를 별도로 재현한다.
- EN 기본·KO 두 번째·JA/ZH/VI 자동 감지 및 수동 선택. 모든 주요 웹페이지에서 회원·관리자 문의/채팅을 해당 권한에 맞게 제공한다.

## 3. 실제 유저 데이터·토큰
- Google/Discord/자체 로그인 기존 기능을 유지하되 **Spring 신원/세션 권위·OAuth 콜백·API 경로를 실제 코드로 확인**한다. HttpOnly/Secure/SameSite 쿠키, CSRF, 인증 만료/로그아웃/재발급, 관리자 RBAC, 타 사용자 정보 접근(IDOR) 금지, 회원/관리자 DOM 분리를 요구한다.
- 서버가 세션에서 식별한 회원만 사용한다. 클라이언트가 보낸 사용자 ID/권한/금액은 신뢰하지 않는다. 본인 프로필·지갑·예금·주식·퀘스트·채팅·동의 내역은 Spring API/DB 응답과 UI값을 대조한다. 실제 데이터가 없으면 '없음/불러오기 실패'를 표시한다.
- **P0 보안 점검**: 현 `frontend/src/lib/api.ts` 내부 API 토큰의 **하드코딩 기본값**을 발견했다. 격리 브랜치에서 제거하고 서버 환경에서 필수 주입, 비밀값 노출·교체 필요성 검사, 로그/번들 유출 점검이 필수다. 기존 코드에 취약한 패턴이 있다는 뜻이며 실운영 악용 여부는 미확인이다.
- 금융은 서버 원장/정밀 Decimal/중복방지 키/거래 영수증을 사용. 실시간 연결은 계정별 권한 분리·재접속 후 서버 재조회, 잘못된 타인 데이터 금지.

## 4. 서버 전환 순서
1. 기존 Test/운영 서버, Nginx 설정, DB 경계, 릴리스 SHA·롤백 원본을 기록하고 **그대로 보존**한다.
2. 독립 신규 브랜치/테스트 포트에서 Next 페이지 소수(공개 홈 + 로그인 후 내 계정)와 Spring 실제 API 세션·데이터를 우선 연결한다.
3. 23일 v10 180경로 화면 목록에 기반해 금융/게임/관리자 화면을 각각 구현하고, 기존 프론트엔드의 정상 동작을 단위별로 대체한다.
4. QA1 보안·백엔드/DB, QA2 실제 Chromium/Playwright 스크린샷·로그인 E2E, 5개 언어, 320~1920px, 사용자 A/B/관리자 권한을 각각 확인한다.
5. **기존 /bank,/stocks 비회원 302 → 신규 canary 403 회귀를 해결하기 전 공유 Test 프론트 교체 금지**. Test 일부 법적 경로는 55444 전용 서비스로 유지한다. Test /jobs,/quests,/shop,/blog 403 등 기능 미완료도 별도 검증한다.
6. 모든 필수 안전 게이트와 정확한 SHA, 롤백, 무중단 전환 검증 후에만 운영 승격한다. 이 문서만으로 배포 승인·성공을 주장하지 않는다.

## 5. 예약 담당·Gemini 충돌 방지
FE-A: Next 공통 UI/로그인/서버 BFF·디자인 토큰. FE-B: 은행·지갑·주식·게임·커뮤니티 실제 데이터 UI. FE-C: 관리자·채팅·다국어·약관/동의. QA1: API/DB·인증·원장·권한 검증. QA2: v10 이미지 비교·실브라우저 E2E·Test 게시 소유. **기존 예약에서 명시된 무조건 Spring Thymeleaf 신규 구현 지시만 본 목표로 교체**하며 겹치는 Spring 작업을 임의 취소하지 않는다. 각 실행은 최신 main/통합기획/PR/Gemini 변경 재조회 및 담당 파일 충돌 확인 후 별도 브랜치에서 수행한다.

## 6. 시작·중간·종료 기록
- 시작: main `9876c09888ec84034eec183cf1309c85df3d7447`, 통합기획/AGENTS/23일 v10 불변 SHA, Next 패키지 및 BFF 코드 확인.
- 중간: Next 프론트/Spring API 분리 선택, 내부 토큰 기본값과 Test 302→403 회귀를 최우선 차단 기준으로 추가.
- 종료: 문서 전용 신규 브랜치 및 Draft PR, EN/KO 문서/예약 갱신. **실제 소스·Test·운영·DB 변경 및 자동 테스트는 이번 작업에 포함되지 않음**.
