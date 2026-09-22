## v2026.09.23.383 — 자산 강제 조정 caller-owned idempotency
- 관리자 현금/은행 자산 강제 조정 API가 내부에서 대체 키를 생성하지 않고 호출자 소유 UUID idempotency key를 필수로 요구합니다.
- 기존 PostgreSQL ledger 함수와 step-up 인증 경계는 유지하면서 timeout/retry 시 HTTP 계약에서 동일 작업을 안전하게 재시도할 수 있습니다.
- 누락·잘못된 키에 대한 DTO 회귀 테스트를 추가했습니다.

## v2026.09.23.381 — 주식 운영 mutation idempotency 계약
- 수동 주가 변경, 시장 이벤트 게시, 기업행위에 호출자 소유 UUID idempotency key를 필수화했습니다.
- 기존 관리자 클라이언트는 이미 키를 보내며 schema, DB 권한, ledger 의미는 변경하지 않았습니다.

## v2026.09.22.367 — Backend API 완전성 감사 CI 차단 해소
- backend API 완전성 감사기의 prefer-const CI 차단을 감사 의미 변경 없이 해소했습니다.

## v2026.09.21.322 — 마이그레이션 권위 fail-closed 게이트
- Production migration 실행이 exact repository checkout에 없는 DB 적용 migration 파일명을 발견하면 실패하도록 보강했습니다.
