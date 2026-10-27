# Backend B v598 — 개인정보 요청 최초 생성 SQL 바인딩 결함 (Draft/HOLD)

- 시작·중간 확인 main: `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c`. 독립 브랜치/작업환경 사용.
- QA/A 이슈 #1625: 기존 015 마이그레이션의 개인정보 요청 생성 함수가 INSERT RETURNING의 `created_at` 이름 충돌(SQLSTATE 42702)로 첫 요청 생성에 실패함. 이전 C PR #1064는 미병합 종료 상태이며, QA PR #1610은 283 중복 및 285번을 별도로 조정 중.
- 신규 순방향 마이그레이션 286에서 함수만 재정의하여 INSERT 대상 별칭과 RETURNING 컬럼을 명시. 기존 015 수정 없음. 계정 잠금, 사용자 범위, 동일 요청 재시도, 상충 요청 거부, 감사 기록의 개인정보 최소화, DB 최소권한 보존. API 응답·금융 원장·WLD 잔액 변경 없음.
- TDD: 신규 정적 테스트 4건 RED→GREEN. 격리 PostgreSQL 17 컨테이너에서 기존 오류 재현 후 최초 생성, 동일/상이 재시도, 다른 사용자, 비활성 계정, 테이블 직접 읽기 차단, 감사 기록 및 20개 동시 재시도 검증 PASS. 운영 연동 5433 DB 접근·수정 없음.
- Backend 1,688 PASS/430 SKIP, Frontend 1,681 PASS, Bot 8 PASS, Typecheck/Build/변경파일 Lint/저장소 보안 검사 PASS.
- 차단: 전체 DB 36 PASS/1 FAIL/3 SKIP(283 중복·285 누락), 전체 Lint 2 오류(#1600), 의존성 감사 root 11건(중간 9/낮음 2), Bot 6건(치명적 1/높음 5), 공식 Test exact-SHA 및 인증 E2E 미검증.
- 승인 전 main 병합·Production 승격 금지. Draft + hold 유지, 타 자동화/브랜치/예약 보호.
