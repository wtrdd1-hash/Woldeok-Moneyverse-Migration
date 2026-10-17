# P0: 저축 포켓 원장·잔액 불일치 — v2026.10.17.851

**한국어** | [영문 정본](MONEYVERSE_BANK_POCKET_LEDGER_DRIFT_v2026.10.17.851.md)

**상태:** 실제 DB 함수 읽기 전용 분석으로 위험 경로 확인. DB 근본 수정은 미구현, **운영 승격 차단**. 2026-10-17.

## 직접 확인한 증거

- 미니PC MCP로 실제 운영 연결 DB `woldeok_moneyverse_dev`에서 `pg_proc.prosrc`, 트리거 및 실행 권한을 읽기 전용 확인. 금융 공식 게이트는 읽기 전용 트랜잭션 및 ROLLBACK 사용. 사용자 금융 거래 생성·수정 없음.
- `bank_transfer_pocket`은 앱 권한으로 실행 가능한 SECURITY DEFINER 함수. `accounts.balance`, `bank_saving_pockets.balance`를 직접 수정하며 복식부기 원장 `economy_post_transaction`을 호출하지 않음. `p_key`는 NULL 여부만 확인하므로 중복 요청 방지 안 됨. 함수 MD5 `b939d1c53e8c4856644f4d443fab44d9`.
- `bank_get_my_standing`은 `account_balances.available_amount`를 조회. `accounts`, `account_balances`, `bank_saving_pockets`에 관련 자동 동기화 트리거 없음. 따라서 포켓 이체 후 사용자 표시 잔액/원장과 직접 변경된 잔액이 달라질 수 있음.
- `bank_archive_pocket`은 원장상 500 WLD 수수료를 청구한 뒤 포켓 잔액을 `accounts.balance`에 직접 반환하며 반환 원장은 기록하지 않음. 사전 UI 500 WLD 안내도 누락됨.
- `bank_customize_pocket` DB 수수료는 회당 고정 100 WLD이나 기존 화면은 색상 100 + 아이콘 300 WLD로 표시. v851 후보에서는 실제 100 WLD로 수정, 큰 금액 비교 BigInt 적용.
- `bank_create_saving_pocket`에는 멱등키 인자가 없음. 프론트/DTO가 키를 주고받아도 DB에서 재시도를 막지 못함. 완전한 중복방지는 별도 설계 필요.
- 해당 포켓 SQL 함수의 정의가 체크인된 `packages/database/**/*.sql` 파일에서 검색되지 않음. 이력을 먼저 복원하고 기존 마이그레이션 수정 없이 순방향 변경만 허용.

## 운영 금융 검사

**BLOCKED**: 잔액 40행, 잔액/원장 미인증 차이 19건 총 +4,779,188 WLD, 전표 없는 잔액 5건 총 +2,627,807 WLD, 앱이 직접 수정 가능한 금융 핵심 테이블 5개. 전표의 자체 불균형/전표 없는 거래는 0건. 금전 유실·도난 확정 증거는 아니며 과거 기초잔액의 증빙이 필요함.

## 근본 해결 순서 — 아직 시행하지 않음

1. 현재 포켓 및 계좌 잔액, 원장 출처, 미등록 기초잔액, SQL 적용 이력, 백업 복원 증거를 먼저 보존·대조. 임의 보정 금지.
2. 순방향 새 SQL 마이그레이션에 포켓 보관 부채/에스크로와 복식부기 원장 거래, 멱등키 잠금 및 재실행 영수증을 설계. 직접 `accounts.balance` 변경 제거. 해지 수수료와 원금 반환은 따로 추적.
3. 생성 중복, 타인 포켓 접근, 비정상 요청/금액, 동시 입출금, 재시도, 불충분 잔액, 장애 복구, 모든 원장 총합 및 권한 차단을 운영 DB **복원된 격리 테스트 DB**에서 검증.
4. 공식 금융 검사 통과 및 운영과 정확히 일치하는 Test 빌드·로그인 E2E·전체 UI·롤백·세션 유지가 확인되어야 무중단 운영 승격.

**정리:** v851 PR은 사용자 요청 계약·수수료 안내까지 수정. 포켓 자금 이동의 DB 원장 결함과 운영 차단 상태는 미해결 P0.
