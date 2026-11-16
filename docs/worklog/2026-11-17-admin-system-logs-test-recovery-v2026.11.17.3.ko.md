# v2026.11.17.3 — 독립 Spring Test 복구 및 운영 승격

**작업 전 (2026-11-17 KST)**: 사용자 재지시 `해결후승격까지해` 접수. 기존 PR #3205 격리 브랜치에서 진행. `AGENTS.md`, 통합 기획 마스터, 운영 배포 지침, v2026.11.17.1~2 기록 확인 후 `origin/main` 86777fb 재조회. 현행 운영은 기존 Spring/Next 서버 유지.

**실측 장애:** 공식 Test 백엔드 비활성/구형 Node 설정, Test 인증 API 502, 테스트 `/health`·`/api/version`가 운영 Spring 4550 사용. 공식 Test 소스 SHA/프론트 빌드 ID와 후보 불일치, 배포 스크립트 구형 Node 전용. 별도 테스트 PostgreSQL 컨테이너는 존재하지만 접속 권한·DB·스키마 검증 필요. 운영 DB를 테스트에 사용하지 않는다.

**계획:** Test DB/계정/스키마 검증 → 정확한 SHA의 불변 Spring/Next 빌드 → 운영과 분리된 Test 게이트웨이/API → 최고관리자 인증·4종 로그 실제 QA/세션 연속성 → PR CI·main 동기화 → 되돌릴 수 있는 무중단 운영 승격. 원본 운영 서비스와 금전 데이터 유지.

**작업 중:** 구성·Test DB 읽기 전용 점검 중. 운영·테스트 구성 변경 전.

**작업 종료:** 검증 증거에 따라 별도 기록.

**작업 중 (2026-11-17 KST):** 작업 중 `main`이 백업 감사 #3208의 `8b3e3aca`로 변경된 것을 확인하고, 충돌 없이 작업 브랜치에 병합. 별도 Spring 3150 서버가 Test DB `wdmv_v761_test_acl`에 `moneyverse_app`으로 연결돼 `/health`·`/api/version` 200, 익명 로그·관리자 보안 API 401을 확인. Test DB의 users/user_roles 직접 SELECT 금지 대신 기존 보안 함수로 역할 조회하도록 구현 필요. 운영 변경 없음.

**작업 중 (2026-11-17 KST)**: 기존 Test DB 역할 보안 함수 기반 세션 해석, 환경별 로그 소스, 버전 SHA 및 미인가 프론트 화면 거부 수정. Test Spring 3150/DB 5585 실제 HTTP 최고관리자 200, 비최고관리자 403, 익명·위조 401, 잘못된 조회 400, Spring/Next 로그 200. 임시 세션 2건 삭제, 잔여 0. Spring/Next 불변 스테이징 도구 구문 확인. Test Nginx 전용 로그 경로는 아직 구성 전이므로 UNAVAILABLE 정상 표시. 공개 Test 및 운영 변경 전.
