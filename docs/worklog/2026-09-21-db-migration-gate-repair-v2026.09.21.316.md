# v2026.09.21.316 — real PostgreSQL migration gate repair

## English (canonical)

Development B reproduced the exact real-PostgreSQL CI failure on a fresh PostgreSQL 17 database. Migration `219-admin-work-operations-tuning.sql` contains a SQL keyword typo (`DEVOKE`) at its privilege boundary, so a fresh database stops before the private-chat migration and every runtime exact-SHA gate remains blocked.

This repair changes only that malformed privilege statement to `REVOKE`. It does not weaken least privilege, alter a function body, change ledger behavior, or rewrite any already-recorded migration checksum in a deployed database. The migration was introduced after the currently documented deployed migration line and is failing before it can be recorded by the fresh-database gate.

Validation requires a fresh PostgreSQL 17 migration run, repository tests/security/build, and exact-SHA CI before integration.

## 한국어 (secondary)

개발 B가 PostgreSQL 17 새 DB에서 CI migration 실패를 재현했습니다. `219-admin-work-operations-tuning.sql`의 권한 경계 SQL에 `DEVOKE` 오타가 있어 fresh DB migration이 중단되고 이후 private-chat migration과 runtime exact-SHA gate가 모두 막힙니다.

이번 수정은 잘못된 SQL 키워드를 `REVOKE`로 바로잡는 것뿐이며 least privilege, 함수 본문, ledger 동작을 완화하지 않습니다. fresh DB 검증에서 적용 기록 전에 실패하는 migration의 실행 가능성을 복구합니다.
