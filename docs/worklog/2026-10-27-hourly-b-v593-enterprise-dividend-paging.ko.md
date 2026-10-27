# 개발 B v593 — 공기업 배당 납입 이력 조회 범위 검증

**시작:** 2026-10-27 23:34 KST · **기준 main:** `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c`
**독립 브랜치:** `auto/hourly-b-enterprise-dividend-log-limit-v593-20261027-2335`

관리자 `GET /admin/enterprises/dividend-logs`는 기존에 `Number(limit)`를 그대로 전달하여 0을 기본값으로 바꾸거나 비정상·과도한 조회 범위를 DB에 전달할 수 있었습니다. 이는 실제 운영 피해가 확인된 사고가 아니라 소스에서 재현된 입력 검증 결함입니다.

**수정:** 기본값 20 유지, 1~100 정수만 허용. 문자 혼합·지수·소수·음수·0·중복 파라미터·정수 범위 초과는 HTTP 400으로 차단합니다. Repository 직접 호출도 동일한 상한을 적용합니다. 기존 관리자 인증·인가, 응답 구조, 매개변수화 SQL은 유지했습니다. DB 마이그레이션과 WLD·원장 변경은 없습니다.

**검증:** TDD RED 23건, GREEN 집중 35/35; 격리 PostgreSQL 17.11 3/3, 읽기 전용 UPDATE 차단 42501. Backend 1,577 PASS / 415 SKIPPED, Frontend 1,485 PASS, 계약 38 PASS, Typecheck PASS, Lint 오류 0/기존 경고 1,122, 기본 Build PASS, Bot 8/8 PASS. 전체 필수 테스트는 main의 마이그레이션 280 중복/282 누락으로 FAIL. 의존성 감사 Critical 2·High 8 포함 총 24건 FAIL, Bot 감사 Critical 1·High 5 FAIL.

**운영 보호:** 다른 A/C/Gemini/QA 작업과 예약을 변경하지 않았습니다. 공식 Test 정확 SHA·인증 E2E 및 보안/CI가 전부 PASS하기 전까지 Draft/HOLD, 병합·Production 배포 금지.
