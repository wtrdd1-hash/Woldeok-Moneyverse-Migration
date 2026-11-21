# Spring API·프론트엔드 복구 및 공식 Test 검증 — v2026.11.18.20

**[영어 정본](./2026-11-18-spring-frontend-test-recovery-v2026.11.18.20.md) · 2026-11-18 KST · 내부 제한 Test 가동 / 운영 승격 보류**

## 기준 및 브랜치
- `AGENTS.md`, 최우선 살아있는 `PROJECT_PLAN.md`, `INTEGRATED_PLANNING_MASTER.md`, API 카탈로그, Spring QA·계약 스킬, 릴리스 규칙 확인. 원격 main 시작·중간 SHA `0590fac4e8a82bc986ba1b8c64f014d18daca9e9`; 공유 main 및 다른 작업자의 작업트리 수정 없음.
- `repair/frontend-test-api-v20261118-20`은 기존 관리자·채팅 UI v17 브랜치를 기반으로 백엔드 API v3/v4의 **이미 커밋된 특정 버전**을 통합. 다른 작업자의 미커밋 파일은 변경하지 않았다. 추후 병합은 순서와 충돌을 별도 검토해야 한다.
- 실행 중인 Test JAR 코드 기준 SHA `9d7377cfd5a552840d728ad2d16487abdd011de4`; JAR SHA256 `e3791371740b468b39b437607a6a9ac3525d77779b19971940e6bde391aad4db`. 이후 문서 커밋은 그 자체로 새 실행 파일의 SHA를 의미하지 않는다.

## 이번 실제 수정
1. 국민연금 GET에서 자동 계좌 생성 제거, DB 검증된 본인 세션만 조회. 비로그인 401, 미존재 404, 원천 장애 503. 원장 증명 없는 0원 표시 차단. 납입·은퇴 변경은 정본 거래 영수증·CSRF·멱등 검증 전 503으로 안전 중단.
2. Spring SPA 라우터에서 미구현 /app-api/ 요청에 대해 HTML 200 대체를 막아 오류 JSON 404로 전환. Android 호환 완료가 아니라 **거짓 성공 방지**다.
3. Next 상점 프론트에서 카탈로그 조회 장애를 실제 상품 0개로 오인하지 않도록 오류·재조회 안내 제공. 검증되지 않은 구매 목록·VIP 뱃지를 숨기고 근거 없는 정적 78개 상품 문구 정리.
4. 기존 v17 관리자 공통 테마·원형 문의 UI 코드를 포함하지만, Spring 정적 운영 HTML에 반영되지 않아 **실제 배포 완료 아님**.

## 실측 결과
| 구분 | 실제 관측 | 한계 |
|---|---|---|
| Spring JUnit/bootJar | **174 PASS, 0 FAIL, 0 SKIP** (XML 46개) | 금융 실제 거래·로그인 E2E 미검증 |
| 신규 보안 및 SPA 집중 테스트 | **5 PASS** (수정 전 RED 컴파일 오류 확인) | DB 금융 검증 미실시 |
| Next 계약/타입/전체 빌드 | **PASS**, 정적 생성 603 단계 완료 | 동적 /admin·/shop Spring 인계 안 됨 |
| 프론트 상점·고객지원 회귀 | **20파일 121 PASS** | 전체 프론트 QA와 다름 |
| 전체 프론트 회귀 | **120초 타임아웃 종료(exit 124)**, 광고·SEO/검색·광고배치 실패 관찰 | 전체 통과 불가 |
| 공식 Test Nginx 내부 실제 GET 20건 | **200 15 / 401 2 / 404 1 / 503 2 / 502 0** | 외부 TLS/실 로그인/원장 테스트 아님 |
| Test JVM | 별도 읽기 전용 PostgreSQL, 루프백 제한, 재시작 자동관리, 실행 JAR 고정 | 운영 승격 검증 아님 |
| 운영 Spring | 그대로 실행, 설정 적용 후 헬스 200 | 이번 Java·Next 후보 운영 미배포 |

공식 Test는 인증·개인정보 안전을 위해 **로컬 호스트에서만 접근 가능**하며 외부 Test 접속은 보안 검증 전까지 제한한다. Nginx에서는 Test 서버 블록만 변경했고 운영 서버 블록은 바이트 동일함을 확인했다. 운영 Spring·운영 DB·원장·잔액 변경 없음. 이전 #3274의 국민연금 GET 잠재 부작용은 여전히 실제 DB 변경 여부 미확인이며 이번 작업에서는 운영에 다시 호출하지 않았다.

**프론트엔드 실제 상태:** 공식 Test HTML은 기존 Spring 정적 스냅샷이다. 새로운 관리자 디자인·문의 도크·상점 오류 UI는 빌드되었지만 Spring 서비스에서 제공되지 않는다. 실제 기능 화면의 인증/동적 SSR/하이드레이션 미해결을 정상으로 보고하지 않는다.

## 운영 승격 차단 조건
- 프론트 전체 회귀 통과, Spring 네이티브 동적 화면 전환, 320/390/768/1440 실제 화면·접근성, 고객지원 채팅 실 인증 QA.
- 관리자·회원 유효 세션, 본인 정보 분리, 권한, MFA/CSRF 양방향 E2E.
- Android Retrofit 158개 계약·JSON 응답 호환. 현재 404는 정상 작동이 아닌 거짓 200 차단일 뿐.
- 국고·조폐·주식·상점·연금 실제 원장 영수증을 테스트 계정·완전 격리 DB에서 검증, DB 복원·롤백·성능.
- 외부 Test TLS 경로, 정확 SHA, 운영 무중단 릴리스 계획/복귀 실증. **운영 HOLD.**

[프론트엔드 후보 PR #3275](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3275) · [Spring 수정 PR #3267](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3267) · [API 전수 QA #3274](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3274) · [장애 이슈 #3265](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3265).
민감한 원본 로그, 실행 환경, 비밀 파일과 Nginx 백업·복귀 절차는 미니PC에만 보관한다.
