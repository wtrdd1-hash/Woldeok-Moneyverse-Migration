# 11월 23일 자동 프론트엔드 실제 Test 승격 적합성 감사

> 버전: v2026.11.23.FEQA.2300.1 / 2026-11-23 23:00 KST 이후 실측 / **최종 판정: FULL TEST ACCEPTANCE HOLD, Production NO-GO**. 현재 Test 후보 자체는 일부 배포되어 HTTP 응답함. 이번 검사는 읽기 전용이며 배포/설정/DB 변경 없음.

## 근거 및 소스
- 기준: `docs/planning/INTEGRATED_PLANNING_MASTER.md` 우선, `AGENTS.md`, `docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md`, `docs/UI_UX_SINGLE_REFERENCE.ko.md`, 11월18일 180개 원본, 11월23일 v10 후보, 기존 `docs/qa/2026-11-23-test-frontend-real-backend.ko.md`. 180개 이미지 파일 생성은 180개 실제 기능 합격 증거 아님.
- 원격 main 확인 SHA: `9876c09888ec84034eec183cf1309c85df3d7447`. 현재 Test 프론트엔드 식별 `7b676e602bc984ab74572d4081655fdb297d176a`; 백엔드 `f0336fded6068f884c87f88efedeb770fd3387d4`. 정확한 조합·CI·배포 기록 없이는 동일 릴리스로 주장 금지.
- 활성 자동화: FE A 매시 05분(공통/회원), FE B 25분(금융/게임), FE C 45분(관리자/언어), QA1/QA2도 활성. 자동화 활성/작업 기록만으로 Test 품질 합격은 아님.
- 표준 systemd `moneyverse-frontend`/`moneyverse-backend` 조회 비활성이나 별도 Spring 4550, 독립 Test 55438/55440, Nginx와 Docker는 응답/가동. 따라서 표준 unit inactive == 전체 장애로 판단하지 않음. Test PostgreSQL 컨테이너는 127.0.0.1:55436, 다른 개발 DB는 5433. DB 쓰기 없음.

## Test 도메인 통과/차단 실측
호스트 `test.easy-scraping.com`을 지정하여 miniPC의 Nginx `127.0.0.1:80`을 통해 익명 GET만 실행. 동적 경로 33개는 실제 fixtures/ID 미확보로 의도적으로 미검사. `docs/qa/2026-11-23-fe-readiness-147-route-probe.json`에 147개 개별 상태 기록.

| 항목 | 실제 결과 | 판정 |
|---|---|---|
| 기획 경로 총계 | 180 | 전체 기능 검증 대상 |
| 정적 URL 실제 조회 | 147 | 검사를 실행함 |
| HTML 200 | 17 | 페이지만 응답. 기능 성공 아님 |
| 인증 이동 302 | 16 | 비로그인 경계는 예상 가능. 인증 양성 미검사 |
| 403 접근 거부 | 114 | 현재 Test에서 일반 사용자 접근/검수 불가; 의도된 차단인지 경로별 조사 |
| 동적 경로 | 33 | fixture 미확보, BLOCKED |
| 루트 언어 선택 | EN/KO/JA/ZH/VI 모두 HTTP200·`html lang`·H1 현지화 확인 | 부분 PASS |
| 페이지 `<title>` | 5언어 조회 모두 한국어 `내 자산 대시보드` | 번역 완성 미흡 |
| `/terms`, `/privacy` | HTTP403 | **P0: 법적 링크 및 동의 화면 접근 확인 불가** |
| `/socket.io.min.js` | HTTP403 | **P1: 로딩 스크립트 차단. 채팅 E2E 미검사** |
| 홈 참조 정적 자원 | 9개 중 8개 GET200, Socket.IO 하나 GET403 | 부분 실패 |
| `/announcements`, `/gallery` | HTTP200이나 페이지 제목에 `null | Woldeok Moneyverse` 표시 | P1 콘텐츠/템플릿 결함 |
| `/api/v1/stocks`, `/api/v1/shop/public-catalog` | JSON200·실제 응답 필드 | 읽기 계약 존재, UI/DB 출처 검증 별도 |
| `/api/v1/wallet/summary` | 비로그인 JSON200, totalAvailableAmount=null | 허위 잔액 없음; 거래 증거 아님 |
| `/api/v1/board` | JSON200·posts=[] | 빈 상태. 쓰기/게시 기능 미검사 |
| `/api/v1/auth/session` | 비로그인 응답 | OAuth 로그인 양성 테스트 미수행 |
| `/api/v1/status` | JSON200·observations unknown | 상태값 합성 안 함; freshness 별도 확인 |
| 테스트 `/api/version` | Test 백엔드 SHA 표시 | 응답 있음; 전체 조합 인증 아님 |
| 별도 4550 `/api/version` | 503 BUILD_IDENTITY_UNAVAILABLE | 타 환경의 별도 P1 결함 |
| 4550·55438 `/blog/test-article` | 200인데 제목이 홈 대시보드 | 상세 라우팅 회귀 의심 |

**주의:** 403은 모두 코드 미구현이라는 단정이 아님. 그러나 사용자가 Test URL로 해당 114개 화면을 검증할 수 없으므로 승격 합격 판정을 내려서는 안 됨. 200 역시 유효한 DOM/시각/데이터/조작 검증과 구별.

## 미확인/차단 게이트
1. **P0 경로·기획 일치:** Test 114개 403을 경로/권한/업스트림별 구분하여 의도된 보호 경로는 로그인 검증, 공개 경로는 실HTML 복구. 동적 33개는 고정된 Test fixture를 생성해 재검사.
2. **P0 계정·법적 동의:** 약관/개인정보 URL 접근, Google/Discord OAuth 성공·실패·회원가입, 6개월 동의 주기와 정책 변경 재동의, CSRF/RBAC/IDOR, 관리자 정상 계정 확인.
3. **P0 실데이터·금융:** 분리 Test DB의 실제 두 계정에 대해 입출금/예금/송금/주식 매수매도/게임 보상과 중복 클릭·롤백·원장 일치·권한을 증빙. 이번 감사에서는 쓰기 트랜잭션 전혀 실행하지 않음.
4. **P1 UI 시각:** 11월18일 기준 180개 PNG 대비 실제 테스트 브라우저 화면을 320/360/390/430/768/1024/1440/1920px·5개 언어에서 캡처 비교. 모바일 겹침/사이드바/하단바/폰트/피벗/44px 터치/파비콘 실제 픽셀 확인. 이 세션에서는 브라우저 자동화 바이너리 부재로 신규 시각 캡처 미실시.
5. **P1 전역 UX:** Socket.IO 자원 403 원인과 실제 WebSocket 연결/재연결/알림 가시성·유저별 메시지 격리·전 화면 관리자 문의 확인; 콘텐츠 제목 `null` 및 영어 기본 문서 제목 문제 수정.
6. **배포 게이트:** 기준 main 변경 중복검사, FE A/B/C·Gemini 충돌 회피, 순차 버전, 정확한 프론트/백엔드 Test 배포 목록, CI와 실제 Playwright/브라우저 240조건, 독립 릴리스/롤백 검증. 불합격이면 운영 무중단 승격 금지.

## 결론
**현재 23일 UI는 일부 구현·실 API 읽기·5언어 홈 표시 기능이 있으나 전 페이지 기능 구현 완료, 테스트 품질 인증, 운영 승격 가능으로 판단할 수 없음.** Test에 올라가 있는 후보는 평가용으로 유지하고 소스/운영 변경 없이 결함을 FE A/B/C 및 QA 담당별로 분할해 수정 및 재검증한다. 이전 후보에서 보고된 `/tools` 320px 5.25px 겹침은 현재 후보에서 신규 재현하지 않았으므로 미해결 위험으로만 취급한다.

상세 원시 증거: [147건 GET 결과](2026-11-23-fe-readiness-147-route-probe.json) · [작업 기록](../worklog/2026-11-23-frontend-readiness-audit-v2026.11.23.FEQA.2300.1.md).
