# v2026.09.23.381 — 주식 운영 mutation idempotency 계약

수동 주가 변경, 시장 이벤트 게시, 기업행위 API가 호출자 소유 UUID idempotency key를 필수로 받도록 강화했습니다. 기존 관리자 프론트엔드는 이미 제출마다 키를 보내므로 사용자 흐름은 유지하면서 재시도 시 서버가 새 키를 임의 생성할 수 없게 했습니다. DTO 검증 회귀 테스트를 추가했습니다. schema, migration, DB 권한, ledger mutation은 변경하지 않았습니다.
