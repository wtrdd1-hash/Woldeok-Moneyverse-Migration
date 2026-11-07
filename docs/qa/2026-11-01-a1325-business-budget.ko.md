# QA — A1325 회원 사업체 카탈로그 WLD 인수 비용 상한 검색 (2026-11-01)

**판정: Draft / RELEASE HOLD.** 코드 후보 `d298e6bedd962a18c54b7e416e185d328c907fb0`, 기준 main `f13bbce273ffc65e8576170992d82ea00c27a1c9`, PR #2320. 최종 문서 커밋 후 HEAD가 바뀌므로 새 SHA의 CI를 다시 확인해야 한다.

## 구현 범위 및 근거

- 로그인 및 최신 동의가 완료된 회원이 `/businesses?maxCost=<정수 WLD>`로 인수 가능한 사업체를 인수 비용 상한 기준으로 검색한다. 접근 가능한 GET 검색 폼, 잘못된 입력·조회 실패·정상 결과 없음 구분을 추가했다. **검색 예산은 보유 잔액이나 실제 구매 가능 금액이 아니다.** 기존 사업체 보유 요약·구매·정산·멱등성은 변경하지 않았다.
- Nest `GET /api/v1/business-types`와 Android 별칭 `GET /api/v1/businesses/catalog`은 0 이상의 18자리 이하 표준 정수 문자열만 허용한다. 중복·빈 값·소수·지수·음수는 400, 미지정은 기존 동작 유지. 보유한 사업체 종류는 결과에서 제외한다.
- PostgreSQL의 기존 `public.business_catalog()` SECURITY DEFINER 함수 결과에 바인딩된 `bigint` 조건을 적용하고 금액 기준으로 숫자 정렬한다. 신규 마이그레이션·권한 부여·원장 기록·잔액 변경은 없다. JavaScript `Number`로 WLD를 변환하지 않는다.
- Android app-api는 요청과 성공 응답의 금액을 검증하며 필터 누락·금액 초과·비정상 응답을 503으로 차단한다. 회원 사업체 API에는 `private, no-store`, `noindex`, `no-referrer`를 적용하고 회원 페이지도 검색 색인을 막는다.

## TDD 및 실제 검증

- RED: 웹 예산 파서 부재, Nest 파라미터 미전달, SQL 필터 부재, Android 입력/응답/캐시 보호 부재, 텍스트 형식으로 정렬될 수 있는 SQL 별칭 문제를 재현했다. Nest 테스트 설정의 CsrfGuard 의존성 오류는 테스트 설정을 수정한 뒤 다시 RED를 확인했다.
- GREEN: Backend 대상 10 PASS, Frontend 파서 11 PASS, Android 3 PASS, Next 서버 API 전달 3 PASS. 이는 모의 응답 기반 대상 검증이며 공식 Test 로그인 E2E가 아니다.
- 첫 검증에서 타입 검사·Backend 빌드·Lint(오류 0, 경고 1,022)는 PASS. 첫 전체 검증은 수정 중 빌드 취소 143, 서버 프로세스 제한으로 Backend/Frontend 워커 EPIPE 실패였다. DB 단위 62 PASS/4 SKIP, Android API 계약 184개 PASS, 보안 정책 검사 PASS였지만 서로 다른 SHA가 섞여 최종 품질 게이트로 인정하지 않는다. 정확 코드 SHA의 재검증은 별도 로그에 기록한다.
- 개발 PostgreSQL 17.11에서 `moneyverse_app` 역할로 READ ONLY 및 ROLLBACK: 공개 사업체 9종, `9007199254740993` 이하 9종, 0 이하 0종, 숫자 정렬 확인. 9건의 EXPLAIN은 약 0.172ms로 대규모 성능 보증이 아니다.
- **P0 보안 FAIL:** 개발 DB 애플리케이션 역할이 `account_balances UPDATE`, `user_items DELETE`, `users SELECT`, `virtual_business_types SELECT/UPDATE/DELETE` 직접 권한을 보유한다. 최소 권한 원칙 위반이며 운영 DB도 같다는 증거는 없다. 이슈 #993에 읽기 전용 검증을 기록했다.

## 브랜치 및 배포 보호

- 시작 원격 브랜치 89개·열린 PR 85개. 중간 감사 원격 추적 참조 91개(HEAD 별칭 포함), 실제 브랜치 90개, main 외 미병합 89개, 완전 병합된 비-main 0개, 열린 Draft PR 87개, 충돌 0개. 삭제 0건. 최종 개수는 종료 감사에서 갱신한다.
- 개발 C의 PR #2257은 `businesses/page.tsx`, PR #2318은 Android app-api 라우트 파일을 변경한다. 각 PR의 고유 변경을 보호하며 통합 시 수동 검토한다.
- 공식 Test 공개 SHA `bc8cd8a6c654af0336f550643f23049a58ee1d16`, Production Backend 공개 SHA `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`로 후보와 다르다. 공식 Test 정확 SHA 로그인·Android E2E, 독립 백업 복원, 최소 권한, 금융 원장 및 운영 실행 파일 출처 게이트 미충족.
- main 병합·공식 Test/Production 배포·서비스 재시작·DB 변경·브랜치 삭제·롤백은 수행하지 않았다. **Production HOLD**.

**증거 경로:** `/srv/moneyverse-data/tasks/mv-a-20261101-1325-business-budget/`. 최종 SHA·전체 테스트·CI·변경 파일·브랜치 수는 종료 기록에 추가한다.

## 정확 코드 SHA d298e6be 최종 로컬 게이트 (13:39–13:47 KST)

- 계약 빌드·전체 타입 검사·Backend 빌드·Frontend Next 빌드(정적 페이지 603개) **PASS**. 전체 Lint 오류 0/경고 1,022. 보안 권고 버전 검사 11 PASS, 운영 의존성 감사에서 알려진 취약점 0건.
- Backend 전체 테스트는 프로필 HTTP 2건(예상 200, 실제 401) 실패 후 워커 EPIPE로 중단되어 **전체 PASS 아님**. 수정되지 않은 main에서 해당 프로필 8건 중 6 PASS/2 FAIL을 별도로 재현하여 기존 실패임을 확인했다. 다른 작업의 수리 PR을 보호하고 중복 수정하지 않았다.
- Frontend 전체 테스트는 호스트 Node 워커 스레드 생성 실패로 중단했다. 다른 서비스 보호를 위해 **이번 작업의 멈춘 테스트 프로세스만** 종료(exit 143)했다. 전체 PASS로 기록하지 않는다.
- DB 단위 62 PASS/4 SKIP(실제 DB 통합 PASS 아님), Android API 계약 184개 PASS, Backend 대상 10 PASS, Frontend/Android/서버 전달 대상 17 PASS, SEO 경로/사이트맵 9 PASS.
- 접근성은 라벨·검색 역할·설명 연결·오류 알림·44px 대상 클래스 회귀검사 PASS지만 320px/200%/키보드 실제 브라우저 E2E는 미실시. 개발 PostgreSQL 읽기 전용 금액 정렬 검증 PASS, 회원 간 권한 거부 통합 E2E 미실시.
- 종료 원격 브랜치 **90개**(main 1, 비-main 89), 열린 PR **87개**(모두 Draft), 보고된 충돌 0, 중복 PR HEAD SHA 0, 실패 검사 PR 23개. 비-main 89개는 미병합 변경으로 보존하고 삭제 0건. 코드·테스트 변경 파일 11개이며 QA·Release·Worklog 파일은 별도 추가.
- GitHub 후보 이미지 CI `41273907943` 및 CI `41273911891`은 13:46 기준 Test 진행 중. 초기 PageProps 오류 SHA는 수정했고 중간 SHA는 취소됐다. 최종 문서 SHA의 CI PASS 없이 병합 금지.
- 공식 Test Backend/Frontend SHA `bc8cd8a6...`, Production Backend `353c6d5d...`, Production Frontend 공개 버전 `1793450413898`(Git SHA 증명 아님). 정확 SHA Test 로그인 E2E·운영 실행 파일 출처·백업 복원·최소 권한·원장 게이트 미충족. Test/Production 배포·main 병합·서비스 재시작·DB 수정·브랜치 삭제·롤백 **모두 0건**. Production HOLD.
