# v682 국고 안전 복구 작업 기록
- 사용자: 문제 해결 후 조건 충족 시 운영 무중단 승격 지시. 미니PC MCP로 실운영 상태 읽음.
- 최신 main 8356146e, 전용 fix/treasury-db-authority-v2026.10.15.682 브랜치에 기존 검증 v678을 통합. 다른 작업자 환경 변경 없음.
- 15:18 KST 운영 SWF OFF 유지, 마지막 14:47 실행, 중지 이후 FEE_RECIRCULATION 신규 0. 암호화 백업 20261015T055103Z 존재 및 검증됨.
- 독립 복원 DB wdmv_treasury_v680 운영 마이그레이션 266건 + 269~271은 격리 DB에만 적용. 269의 treasury_deposit_donation 실제 테스트에서 SQLSTATE 42703 (없는 tx_type 컬럼). 271에서 앱이 금고/보조원장 직접 읽기 불가, v678 신규 대사도 직접 SQL로 실패.
- 따라서 좁은 DB 함수와 세션권한 동시검증 개발 진행. 복식지급/관리자 전체조회/세션·독립 Test 게이트 전 운영승격 금지.

## 중간 게이트 / 2026-10-15 15:27 KST
- 운영 SWF 여전히 OFF, 마지막 실행 14:47 KST. 다음 시간주기 이후 확인 필요.
- 271 적용된 격리 Test에서 moneyverse_app이 금고/보조원장 직접 SELECT 시 접근 거부. v678 직접 대사는 CI 모의테스트만 성공하고 실제 DB에서 실패할 수 있음.
- \`packages/database/verify/treasury-admin-reconciliation-v682.sql\` RED 검사에서 역할범위가 좁은 조회 함수가 없어 예상 실패. 신규 금융 migration 실행·운영 소프트웨어 승격 없음.
- 국고 전용 조회·269 기부 함수·기존 직접 잔액 지급·Test SHA/DB 불일치가 남아 운영 승격 BLOCKED.
