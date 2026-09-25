# Moneyverse 데이터베이스 아키텍처 연구 검토 — v2026.09.25.443

> 날짜: 2026-09-25
> 상태: 기획/조사 근거
> 기준 언어: English
> 탐색 corpus: `MONEYVERSE_DATABASE_REFERENCE_CORPUS_v2026.09.25.443.csv`

## 1. 범위와 근거 진실성

이번 회차는 데이터베이스 아키텍처 탐색 근거를 확장하고, 고신뢰 결과만 Moneyverse 요구사항으로 변환한다. bibliographic 후보를 모두 수동으로 읽었거나 모두 DB 구조에 직접 관련되거나 모두 채택했다는 뜻이 아니다.

Crossref에서 데이터베이스 인접 10개 검색 lane을 사용해 lane당 8,000건, **원시 80,000개 레코드**를 수집했다. DOI를 우선 중복 제거 키로 사용하고 DOI가 없을 때 정규화 제목을 사용했다. 최종 CSV에는 **66,858개의 고유 탐색 후보**가 남아 요청한 5만 건 이상 탐색 범위를 충족한다.

광범위 bibliographic 검색은 의도적으로 **Tier C 탐색 근거**로만 취급한다. “recovery”, “replication”, “isolation”, “schema”, “integrity” 같은 용어는 DB 외 분야에서도 쓰이므로 corpus 포함 자체는 운영 설계 채택 근거가 아니다. 아래 설계 요구사항은 직접 확인한 PostgreSQL 1차 문서와 현재 저장소 증거를 기준으로 한다.

### 중복 제거 후 최초 유지 lane 분포

| 탐색 lane | 해당 lane에서 최초 유지된 고유 후보 |
| --- | ---: |
| Schema design | 8,000 |
| Integrity constraints | 7,811 |
| Transaction/concurrency | 6,900 |
| Index/query optimization | 7,980 |
| Partition/sharding/replication | 6,787 |
| Distributed consistency | 2,074 |
| Backup/recovery/WAL | 7,898 |
| Schema evolution/migration | 7,916 |
| Ledger/idempotency/audit | 7,041 |
| Privacy/retention/temporal | 4,451 |
| **합계** | **66,858** |

corpus는 journal article이 가장 많고 book chapter, proceedings paper 등이 뒤를 잇는다. 이는 후속 검토를 위한 검색 기반이지 품질 순위가 아니다.

## 2. 현재 Moneyverse DB 구조의 강점

저장소 증거에서 다음 경계는 이미 강점이며 유지해야 한다.

- 번호가 있는 SQL migration이 스키마 권위이며 ORM migration 권위를 의도적으로 금지한다.
- 적용된 migration은 불변이며 checksum과 Production history 역방향 parity를 검증한다.
- 애플리케이션 role은 table DML 권한이 제한되고 보호 mutation은 검토된 `SECURITY DEFINER` function을 사용한다.
- WLD/잔액은 PostgreSQL에서 frontend까지 exact integer-compatible 표현을 유지한다.
- 핵심 경제 write는 DB transaction, business idempotency key, row locking을 사용한다.
- 중요 자금 경로에는 결정적 lock 순서가 있고 일부 worker에는 `SKIP LOCKED` 패턴이 있다.
- audit chain과 outbox는 중요 무결성 처리를 같은 DB transaction 경계로 가져온다.
- backup/restore 문서는 Production 직접 복원 대신 격리된 복원 drill을 요구한다.

v443은 이를 ORM, 무조건적 microservice 분리, 성급한 distributed DB로 교체하지 않고 검증·확장 규칙을 강화한다.

## 3. 직접 채택하는 고신뢰 결과

### 3.1 제약조건은 도메인 모델의 일부다

PK, UNIQUE, FK, CHECK는 애플리케이션 버그와 동시 요청에 대한 최종 방어선이다. PostgreSQL에서 안전하게 표현할 수 있는 핵심 불변식을 TypeScript validation에만 두지 않는다.

nullability, 값 범위, 닫힌 상태 vocabulary, uniqueness, ownership, referential rule을 스키마 계약으로 취급한다. 애플리케이션 validation은 UX에 계속 필요하지만 유일 권위가 아니다.

### 3.2 FK 지원 인덱스는 별도 감사를 해야 한다

PostgreSQL은 PK/UNIQUE의 referenced side에는 인덱스를 제공하지만 모든 referencing FK column에 자동 인덱스를 만들지는 않는다. 부모 delete/update 검증이 큰 child table scan으로 이어질 수 있다.

v443은 FK-index coverage 자동 감사를 요구한다. 적절한 left-prefix index가 있거나, 측정 결과 인덱스가 역효과라는 명시적 예외 근거가 있어야 한다.

### 3.3 인덱스는 실제 쿼리 계약이다

인덱스는 read를 빠르게 하지만 write/vacuum/storage 비용을 만든다. multicolumn B-tree는 실제 predicate/order와 leading column 정합성이 중요하다. constraint가 만든 unique index와 같은 중복 index도 피한다.

`pg_stat_statements`, PostgreSQL statistics, Test의 대표 `EXPLAIN (ANALYZE, BUFFERS)`로 인덱스 추가/제거 근거를 남긴다. active/pending 같은 sparse queue에는 partial index를 검토하고, BRIN은 물리 순서와 값이 상관된 매우 큰 append-heavy table에 한해서 후보가 된다.

### 3.4 파티셔닝은 조건부이며 기본값이 아니다

파티셔닝은 테이블이 실제로 매우 크거나 retention/bulk lifecycle 작업이 지배적일 때 유용하다. pruning과 오래된 데이터 제거를 쉽게 할 수 있지만 schema/index/constraint 운영 복잡도가 증가한다.

audit log, outbox/event history, chat history, price tick, telemetry는 **후보**일 뿐이다. row count/bytes, growth rate, retention, query predicate 측정 후에만 채택한다.

### 3.5 온라인 스키마 변경은 expand-contract 절차가 필요하다

SQL이 실행 가능하다는 사실만으로 무중단 migration이 되는 것은 아니다. v443은 다음 순서를 고정한다.

1. backward-compatible nullable/new 구조 expand
2. 필요 시 구/신 스키마 양쪽과 호환되는 애플리케이션 배포
3. bounded/resumable batch backfill
4. 지원되는 경우 `NOT VALID` 추가 후 `VALIDATE CONSTRAINT`
5. 큰 index는 적합할 때 `CONCURRENTLY`
6. 검증 후 read/write switch
7. 이전 runtime이 완전히 제거된 뒤 old schema contract

table rewrite DDL, destructive drop, 장시간 lock 작업은 일반 무중단 cutover 단계로 허용하지 않는다. 모든 migration에 lock/scan/rewrite 분류와 rollback 또는 forward-fix 계획을 둔다.

### 3.6 Serializable 정합성은 transaction 전체 재시도를 요구한다

PostgreSQL은 Repeatable Read/Serializable에서 serialization error `40001`이 발생할 수 있고, deadlock `40P01`도 일시 오류가 될 수 있다고 문서화한다. 마지막 statement만이 아니라 **transaction 전체 로직**을 재실행해야 한다.

기존 business idempotency key는 유지하고 bounded retry를 결합한다. 재시도 시 transaction-local read/decision은 다시 수행하되 business command identity는 동일해야 한다. deadlock 감소를 위한 결정적 lock ordering도 계속 강제한다.

### 3.7 Ledger 권위와 balance projection은 재조정 가능해야 한다

append-only balanced posting journal을 가장 강한 경제 감사 근거로 두고, mutable balance는 read/performance projection으로 취급해 authoritative posting과 재조정 가능해야 한다.

transaction별 debit=credit, 금지된 음수 잔액 불가, balance mutation command와 idempotent transaction 1:1 매핑, sampled/full reconciliation과 rebuild 절차를 요구한다.

### 3.8 JSONB는 제한된 유연성으로 사용한다

versioned policy payload, event metadata, heterogeneous evidence에는 JSONB를 사용할 수 있다. 하지만 핵심 ID, 금액, ownership, lifecycle state, idempotency key, timestamp는 typed column + constraint로 유지한다. JSONB가 referential integrity나 exact numeric type 우회 수단이 되어서는 안 된다.

### 3.9 vacuum/statistics는 규모가 커질수록 정합성 운영의 일부다

autovacuum, ANALYZE, planner statistics는 MVCC 운영 의존성이다. high-churn table은 dead tuple/XID age/vacuum lag를 감시하고 필요하면 per-table autovacuum을 조정한다. 대량 backfill/import 후 planner 품질이 영향을 받으면 statistics 갱신을 포함한다.

routine `VACUUM FULL`은 강한 lock/rewrite 특성 때문에 일반 유지보수 전략으로 사용하지 않는다.

### 3.10 현재 logical backup은 PITR와 동일하지 않다

현재 6시간 주기의 암호화 logical backup은 계속 유지할 가치가 있다. 그러나 WAL continuous archiving/PITR와 같은 것은 아니다. 더 강한 RPO가 필요하면 base backup + WAL archive를 애플리케이션 runtime과 분리된 immutable/off-host failure domain으로 보내는 방식을 검토하고 실제 restore drill로 RPO/RTO를 측정한다.

복구가 disposable isolated target에서 증명되기 전에는 어떤 backup 방식도 충분하다고 간주하지 않는다.

## 4. v443 데이터베이스 아키텍처 요구사항

아래는 기획 요구사항이며 현재 runtime에 이미 결함이 있다고 단정하는 목록이 아니다.

- **DB443-01 / P0 — Schema fingerprint:** fresh migration rebuild에서 relation/column/type/null/default/constraint/index/routine/trigger/grant를 manifest/fingerprint로 만들고 Test/Production과 대조해 manual drift를 탐지한다.
- **DB443-02 / P0 — Constraint audit:** 모든 canonical table에 PK 또는 명시적으로 검토된 keyless 예외를 요구하고 null/unique/check/FK 불변식을 분류한다.
- **DB443-03 / P0 — FK index audit:** child-side FK를 지원하는 index가 없으면 자동 탐지하고 index 또는 측정된 예외를 요구한다.
- **DB443-04 / P0 — 무중단 migration contract:** expand/backfill/validate/switch/contract, lock/rewrite budget, 구/신 runtime 호환성, exact candidate 증거를 요구한다.
- **DB443-05 / P0 — Transaction retry:** retry 가능한 serialization/deadlock에서 bounded whole-transaction retry + stable business idempotency를 적용한다.
- **DB443-06 / P0 — Ledger reconciliation:** journal/balance invariant 자동 검증과 rebuild/reconciliation 절차를 문서화·시험한다.
- **DB443-07 / P0 — Role separation:** app role은 non-owner/no-DDL, migration owner와 runtime role을 분리하고 security-definer는 safe search_path + explicit EXECUTE를 유지한다.
- **DB443-08 / P1 — Query/index evidence:** critical query plan/statistics 기준선을 만들고 측정 workload로 index lifecycle을 관리한다.
- **DB443-09 / P1 — Conditional partitioning:** 크기/growth/retention threshold와 table별 decision record 없이 파티셔닝하지 않는다.
- **DB443-10 / P1 — Typed core / versioned JSONB:** authoritative core는 relational column으로 유지하고 flexible payload에는 schema/version metadata를 둔다.
- **DB443-11 / P1 — Lifecycle/delete semantics:** 모든 FK가 소유권·감사 특성에 맞춰 RESTRICT/NO ACTION/CASCADE/SET NULL을 의도적으로 선택한다. 금융·감사 이력이 우발 cascade로 사라지면 안 된다.
- **DB443-12 / P1 — Maintenance SLO:** autovacuum, dead tuple, XID age, analyze freshness, long transaction, lock, temp file, heap/index growth를 감시한다.
- **DB443-13 / P1 — Hot-path/read-model separation:** 무거운 dashboard/aggregate는 측정 결과에 따라 bounded read model/snapshot/materialized view 또는 향후 replica를 사용하고 write-authoritative ledger를 무제한 스캔하지 않는다.
- **DB443-14 / P0/P1 — DR evolution:** 검증된 encrypted logical backup을 유지하고 WAL/PITR/off-host immutability는 실제 복원 시험을 통해서만 도입·수용한다.

## 5. 채택하지 않는 지름길

현재 근거는 다음을 요구하지 않는다.

- SQL migration 권위를 ORM으로 교체
- corpus에 distributed DB 논문이 있다는 이유만으로 sharding/distributed SQL 도입
- 모든 table 파티셔닝
- 가능한 index를 전부 추가
- 신규 기능만을 위해 즉시 PostgreSQL 18로 운영 major upgrade
- benchmark 없이 UUID 전략 교체
- ledger invariant를 PostgreSQL 밖 client/service 코드로 이동
- 돈/ownership/authorization 핵심 상태를 JSONB 중심으로 전환

현재 Production은 PostgreSQL 17.11로 문서화되어 있으므로 별도 upgrade 계획이 없는 한 v443은 PostgreSQL 17 호환 메커니즘을 기준으로 한다.

## 6. 수용 및 QA

DB runtime 변경을 운영 승격하려면 다음을 증명한다.

1. 빈 PostgreSQL 17에서 모든 권위 migration을 순서대로 재구축하고 DB-backed test 수행
2. generated schema fingerprint와 exact-SHA 기대 계약 비교
3. PK/constraint/FK-index/security-definer/grant audit
4. 대표 이전 schema에서 upgrade하고 구/신 app 호환성 검증
5. Test 규모 데이터에서 lock duration, rewrite/scan 분류, migration runtime 기록
6. ledger/work/stock/shop/bank/admin-economy 중요 mutation의 serialization/deadlock retry 검증
7. ledger posting과 balance projection reconciliation
8. critical query plan 및 성능 regression budget 검증
9. backup/restore 증거, PITR 도입 시 지정 시점 복원과 lineage 확인
10. 기존 zero-downtime release, health, session continuity, rollback gate를 통과한 exact Test candidate만 Production 승격

v443 자체는 조사/기획/문서 전용이며 DB migration, Test 배포 또는 Production 승격 완료를 주장하지 않는다.

## 7. 직접 확인한 1차 출처

- PostgreSQL 17 — Constraints: https://www.postgresql.org/docs/17/ddl-constraints.html
- PostgreSQL 17 — Indexes: https://www.postgresql.org/docs/17/indexes.html
- PostgreSQL 17 — Multicolumn indexes: https://www.postgresql.org/docs/17/indexes-multicolumn.html
- PostgreSQL 17 — Table partitioning: https://www.postgresql.org/docs/17/ddl-partitioning.html
- PostgreSQL 17 — CREATE INDEX: https://www.postgresql.org/docs/17/sql-createindex.html
- PostgreSQL 17 — ALTER TABLE: https://www.postgresql.org/docs/17/sql-altertable.html
- PostgreSQL 17 — Serialization failure handling: https://www.postgresql.org/docs/17/mvcc-serialization-failure-handling.html
- PostgreSQL 17 — Explicit locking: https://www.postgresql.org/docs/17/explicit-locking.html
- PostgreSQL 17 — Routine vacuuming: https://www.postgresql.org/docs/17/routine-vacuuming.html
- PostgreSQL 17 — Monitoring statistics: https://www.postgresql.org/docs/17/monitoring-stats.html
- PostgreSQL 17 — pg_stat_statements: https://www.postgresql.org/docs/17/pgstatstatements.html
- PostgreSQL 17 — Backup and restore: https://www.postgresql.org/docs/17/backup.html
- PostgreSQL 17 — Continuous archiving / PITR: https://www.postgresql.org/docs/17/continuous-archiving.html
- PostgreSQL 17 — Logical replication: https://www.postgresql.org/docs/17/logical-replication.html
- OWASP Database Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html

66,858건 Crossref corpus는 탐색 provenance와 향후 세부 검토를 위해 별도 보존한다.
