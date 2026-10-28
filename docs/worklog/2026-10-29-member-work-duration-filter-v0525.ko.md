# v2026.10.29.0525 — 회원 업무 최소 수행시간 상한 필터 (코드 후보 / 운영 HOLD)

## 범위와 기준

기준 `origin/main`: `35971c600f25869c96f1c666d4b9f58927202730`. 분리 브랜치 `auto/hourly-a-work-duration-20261029-0525`에서 개발. 회원은 `/work`에서 1·2·3·5·10·15분 이하의 최소 수행시간을 가진 업무를 선택해 조회할 수 있습니다. Android `GET /app-api/v1/work/tasks`에도 선택적 `maxDurationSeconds`(정수 1~86400) 제공. 미입력 시 기존 전체 업무 목록 유지. API 원본 언어는 영어, 한국어는 두 번째 언어입니다.

## 구현 및 안전성

- 기존 세션·인증·동의·CSRF 가드 유지. 회원 ID를 쿼리로 지정할 수 없으며 잘못된 값·중복 파라미터·0·음수·소수·범위 초과는 HTTP 400 거부.
- PostgreSQL `public.work_task_board($1)` SECURITY DEFINER 조회를 유지하고 반환 결과에 바인딩된 시간 상한 조건을 적용. 앱 계정 테이블 직접 조회·권한 확대·신규 마이그레이션·금융 원장·보상·정산 변경 없음.
- Next 서버 컴포넌트에서 웹 선택값을 허용 목록으로 제한. 레이블이 있는 GET 폼, 빈 결과 안내, 내부 API 브라우저 직접 노출 금지.
- Android 게이트웨이의 쿼리 전달 확인. 검증 중 발견된 업무 API 캐시 헤더 누락을 보완하여 `/app-api/v1/work/*` 성공·오류 응답 모두 `private, no-store`와 `noindex` 적용.
- Android API 계약 JSON과 영문·국문 스키마 참조 갱신.

## 검증

- TDD RED 후 GREEN. Backend 집중 15 PASS, Frontend 시간 필터 13 PASS, Android 게이트웨이 26 PASS.
- 완전 분리 PostgreSQL 17.11에 290개 마이그레이션 적용. 롤백 트랜잭션에서 활성 회원의 전체 업무 24건 중 60초 이하 8건 확인. 앱 역할의 업무 원본 테이블 직접 SELECT 거부. 실제 DB 연동 테스트 PASS 및 트랜잭션 ROLLBACK.
- Backend 전체 1,954 PASS/441 SKIP, Frontend 최종 전체 1,885 PASS, DB 46 PASS/4 SKIP, Bot 11 PASS. 최종 게이트웨이 회귀 테스트 반영 후 Backend/Frontend 전체 테스트·타입검사 재실행 PASS. Lint 오류 0건·기존 경고 1,099건, Backend 빌드 PASS. Frontend 빌드는 테스트 타입 오류 수정 후 임시 2-worker 설정으로 PASS, 설정 원복. Typecheck PASS.
- Production 의존성 High/Critical 0건(Moderate 1건), Bot 취약점 0건. 최종 후보 SHA CI·공식 Test 인증 E2E 미검증이므로 운영 HOLD.

## 배포·롤백

기존 금융 원장 차이 18,000 WLD, 앱 DB 권한 과다, PUBLIC 은행 함수, 마이그레이션 정합성, 독립 백업 복원, 공식 Test 정확 SHA 인증 E2E 및 디스크 98~99% 문제가 해소되기 전 병합·운영배포 금지. Test/Production 배포, 운영 DB 변경, 원장 조정, 브랜치 삭제 및 롤백은 하지 않았습니다. 향후 승격 시 스키마 변경이 없으므로 코드 되돌리기로 롤백 가능. 기존 업무 난이도 Draft PR #1723과 일부 파일이 겹치므로 통합 직전 최신 main 재기반·전체 재검증 필요.
