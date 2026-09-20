# 상점 Envelope 테스트 트랜잭션 수정 — v2026.09.20.302

날짜: 2026-09-20
브랜치: `auto/hourly-b-shop-test-tx-v2026.09.20.302`
상태: 구현 / CI 재검증

## 범위

PR #590 실제 PostgreSQL CI는 migration 218과 1,471개 테스트를 통과한 뒤 테스트 하네스 결함 1건을 확인했습니다. 의도한 idempotency payload 충돌이 SQLSTATE `22023`을 발생시키면서 바깥 PostgreSQL 트랜잭션까지 aborted 상태가 되어 잔액 불변식을 조회할 수 없었습니다.

회귀 테스트에서 예상 실패 문장만 savepoint로 감싸고 `22023`을 확인한 뒤 해당 savepoint까지 rollback하고, 권위 있는 현금 잔액이 `840`으로 유지되는지 검증하도록 수정했습니다. 운영 SQL과 ledger 동작은 변경하지 않습니다.

## 검증

- migration 218까지 fresh PostgreSQL 17 migration chain: 통과.
- 상점 catalogue + privilege boundary 대상 real-DB 테스트: 20/20 통과.
- `git diff --check`: 통과.

## 승격 게이트

GitHub CI와 exact-SHA isolated Test candidate가 모두 green이 되기 전에는 main/Production 승격을 진행하지 않습니다.
