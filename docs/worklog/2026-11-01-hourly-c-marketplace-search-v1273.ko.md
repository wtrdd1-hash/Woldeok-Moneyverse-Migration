# 개발 C v1273 — 마켓 매물 검색 (배포 보류)

## 작업 전 — 2026-11-01 21:14 KST

- Debian 13.6 미니PC와 개발 PostgreSQL 연결, 주요 서비스 7개 정상 확인.
- 최신 main `3d5e321c3d1221febff677469fecdfcb3cf42e7d`, AGENTS.md, README, 영문/한국어 통합 기획, 열린 PR·A/B·QA·CI 확인.
- 다른 작업과 겹치지 않는 P1 과제 선정: 최초 화면의 매물 50건이 아니라 PostgreSQL의 활성 매물 조회 함수를 통한 검색. 원장·권한·스키마 변경 없음.
- 독립 `auto/hourly-c-marketplace-search-v1273-20261101-2114` 브랜치 및 worktree 사용.

## 진행 중 — 2026-11-01 21:17 KST

- 테스트 선작성 실패(RED) 확인 후 프론트 8건, 백엔드 2건 집중 테스트 통과(GREEN).
- 서버 검색, 키보드 접근 가능한 검색/초기화, 잘못된 입력·검증된 빈 결과·장애 구분, 40글자 제한, SQL 와일드카드 문자 이스케이프 적용.
- 작업 중 main 재확인(변경 없음). Lint·Typecheck 통과. 첫 Frontend Build는 1024 MiB 힙 한도에서 실패하여 후속 재시도 예정.

## 종료 — 2026-11-01 21:29 KST (DRAFT / RELEASE HOLD)

- 최종 SHA는 PR의 HEAD와 외부 작업 기록을 기준으로 확인. 작업 중 main `3d5e321c3d1221febff677469fecdfcb3cf42e7d` 유지.
- 집중 테스트 프론트 8건, 백엔드 2건 PASS. 전체 프론트 2,909건 PASS. 전체 백엔드 2,970건 PASS / 518건 SKIP / 2건 FAIL(별도 A PR #2265에서 다루는 프로필 HTTP 인증 테스트 401 문제).
- 전체 Lint, Typecheck, Backend Build, app-api 계약, Contract 41건, DB 패키지 62건 PASS(4건 SKIP). Frontend Build는 첫 1024 MiB 메모리 부족 실패, 후속 Next PageProps 타입 오류 수정, 1536 MiB 최종 빌드 PASS.
- 네트워크 격리 PostgreSQL 17.11 마이그레이션 319/319 PASS. 앱 역할의 매물 테이블 직접 SELECT 거부, 제한된 조회 함수 EXECUTE 허용, 와일드카드 문자 리터럴 검색 검증, 원장 거래 0건. 컨테이너 제거.
- 운영 의존성 High 이상 감사 PASS. 전체 의존성 감사 9건(낮음 1·보통 8) FAIL. 전체 경로 QA는 `artifacts/qa/full-route-ledger.json` 누락으로 FAIL.
- 공식 인증 브라우저 E2E·후보 SHA 공식 Test 미완료. main 병합·Test·GitOps·Production 변경 없음, 롤백 불필요. A/B/QA/Gemini 작업 보존. 모든 릴리스 게이트 PASS 전까지 배포 보류.
