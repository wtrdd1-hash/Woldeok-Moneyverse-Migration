# Backend B v590 — P0 #1502 공간·도시기여·재산세 SQL 원장 안전 차단 (DRAFT / HOLD)

기준 main: `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c`. 독립 브랜치: `auto/hourly-b-space-sql-ledger-hold-v590-20261027-2035`.

기존 223/231 마이그레이션의 직접 잔액 변경 함수 3개를 신규 283 마이그레이션에서 SQLSTATE 55000으로 차단하고 PUBLIC/앱 실행권한 및 관련 테이블 직접 DML 권한을 회수했다. 기존 소유자 공간 배치 수정은 별도 SECURITY DEFINER 함수로 유지하며 Backend Repository를 변경했다. 실제 금융 정산 기능 완성이 아닌 **위험 기능의 SQL 경계 차단**이다.

RED→GREEN 회귀테스트 6건 PASS. 격리 PostgreSQL 17.11에서 권한 부정·타인 공간 수정 거부·정상 소유자 수정 및 20 클라이언트 × 5회 동시 트랜잭션(총 300건 함수 호출 차단)을 검증했다. 합성 잔액 100000 유지, 원장 거래·분개 0건 유지. 실제 운영 DB는 변경하지 않았다.

Backend 1546 PASS/412 SKIP, Frontend 1485 PASS, Typecheck/Lint(오류 0)/Build, API 계약 179개, Bot 8 PASS. 전체 `pnpm test`는 기존 280 번호 중복 및 282 부재로 FAIL; 전체 보안 감사 Critical 2/High 8 포함 24건 FAIL. A의 PR #1564가 제안한 282와 통합 순서가 필요하며 기존 적용 마이그레이션을 변경하지 않는다.

공식 Test exact-SHA 인증 E2E 및 GitOps 게이트 미완료. Draft + hold, main 병합 및 Production 배포 금지. 다른 작업자 브랜치·예약 설정 변경 없음.
