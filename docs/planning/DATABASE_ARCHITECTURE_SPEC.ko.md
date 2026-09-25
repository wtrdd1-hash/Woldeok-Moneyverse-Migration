# 데이터베이스 아키텍처 명세 — v2026.09.25.443

> 상태: 채택된 상세 기획 명세
> 기준 언어: English
> 런타임 기준: 별도 승인된 upgrade가 없는 한 PostgreSQL 17.x
> 조사 근거: [MONEYVERSE_DATABASE_ARCHITECTURE_RESEARCH_REVIEW_v2026.09.25.443.ko.md](../findings/MONEYVERSE_DATABASE_ARCHITECTURE_RESEARCH_REVIEW_v2026.09.25.443.ko.md)

## 1. 권위

1. 번호가 있는 SQL migration을 스키마 권위로 유지한다.
2. 적용된 migration 파일은 불변이며 checksum에 묶인다.
3. 애플리케이션 runtime role은 schema owner가 아니며 DDL 권한을 갖지 않는다.
4. 돈·entitlement·moderation·privileged state 보호 mutation은 ad-hoc table mutation이 아니라 검토된 DB function/transaction을 사용한다.
5. generated schema manifest와 catalog 관측은 검증 증거이며 migration history를 대체하지 않는다.

## 2. Canonical 데이터와 derived 데이터

모든 persistent field/table은 다음 중 하나로 분류한다.

- **canonical entity/state** — 권위 identity, ownership, policy state, lifecycle state
- **append-only event/journal** — 경제·감사·integration 내구 이력
- **projection/read model** — 재생성 또는 reconciliation 가능한 가속 구조
- **ephemeral/operational** — queue, lease, rate-limit, 일시 coordination state
- **archive/retained evidence** — lifecycle/audit 규칙에 따라 보존되는 증거

derived projection은 source of truth와 rebuild/reconciliation 방법을 명시한다. ownership·repair semantics 없는 denormalization은 금지한다.

## 3. Key, type, time

- canonical table에는 PK가 있어야 하며 keyless staging/bridge가 필요하면 검토된 예외를 남긴다.
- 실제 ownership/reference 관계는 FK로 표현하고 integrity 없이 identifier string만 복제하지 않는다.
- WLD 및 exact virtual-money quantity는 PostgreSQL integer-compatible type, JSON/API integer string을 사용한다. floating-point money를 금지한다.
- ratio/rate는 가능하면 basis point/ppm 같은 bounded integer unit을 사용하고 그렇지 않으면 constraint가 있는 PostgreSQL `numeric`을 사용한다. binary floating point는 권위값이 아니다.
- 현실 시각은 `timestamptz`로 저장한다. game clock은 별도 logical-time domain이며 실제 audit/event time을 덮어쓰지 않는다.
- state vocabulary는 진화 방식에 맞춰 CHECK/enum/reference table constraint를 사용한다.

## 4. Referential integrity와 삭제

각 FK는 다음을 문서화한다.

- ownership: owned component인지 독립 record인지
- parent update/delete 동작
- retention/audit 영향
- 예상 lookup/delete workload
- child-side 지원 index 또는 측정된 예외

기본 원칙:
- financial/audit/history record: lifecycle policy에 따른 `RESTRICT`/`NO ACTION` 또는 anonymized retained ownership
- 실제로 소유된 disposable child: 검토된 `ON DELETE CASCADE`
- optional association: NULL이 유효한 의미를 보존할 때만 `SET NULL`

ledger/audit/compliance evidence가 우발 cascade로 삭제되면 P0 결함이다.

## 5. Constraint 및 schema-fingerprint gate

CI/Test는 최소 다음을 포함한 normalized schema manifest를 생성한다.

- relation/partition identity
- column name/order/type/nullability/default/generated identity
- PK/UNIQUE/FK/CHECK/exclusion constraint와 validation state
- index definition/predicate/access method/validity
- trigger
- function/procedure, volatility/security-definer/search-path metadata
- table/function ownership
- grant/default privilege
- migration filename/checksum

fresh migration rebuild를 exact-SHA 기대 manifest와 비교한다. Test/Production catalog snapshot에서 설명되지 않은 drift를 탐지한다. manual hotfix는 migration history를 몰래 고쳐 정상화하지 않고 새 migration/reconciliation record를 만든다.

## 6. Transaction, idempotency, locking

### 6.1 Business-command identity
외부에서 retry 가능한 money/entitlement/stock/shop/bank/treasury/work mutation은 durable business idempotency key를 가진다. replay는 actor + semantic request identity가 동일함을 증명한 뒤에만 기존 결과를 반환한다.

### 6.2 Atomicity
불변식을 유지하는 데 필요한 모든 row 변경은 하나의 DB transaction에서 수행한다. commit된 business action을 나타내는 outbox/event도 같은 transaction 안에서 기록한다.

### 6.3 Locking
여러 entity/account lock은 결정적 key 순서로 획득한다. 요청 도착 순서를 신뢰하지 않는다. worker queue의 `FOR UPDATE SKIP LOCKED`는 skip된 work가 durable하며 다시 처리되는 경우에만 사용한다.

### 6.4 Retry
`40001`과 안전하게 분류된 `40P01` 등 retryable SQLSTATE는 bounded attempt + jitter/backoff + telemetry로 **transaction 전체 function**을 재실행한다. attempt 사이 business idempotency identity는 동일하게 유지한다.

영구 constraint/authorization/insufficient-balance 오류를 무한 transient retry로 바꾸면 안 된다.

## 7. Ledger 구조

append-only ledger/journal을 경제 mutation 이력의 권위로 둔다.

필수 불변식:
- double-entry가 적용되는 ledger transaction은 posting 2개 이상
- transaction마다 total debit = total credit
- posting amount는 양수, direction은 명시
- account identity와 currency/domain constraint
- 금지된 negative balance는 commit 불가
- 하나의 business idempotency key가 두 경제 효과를 만들 수 없음
- correction/reversal은 과거 posting edit/delete가 아니라 새 audit transaction

`account_balances` 같은 mutable balance는 projection/cache state다. 다음을 제공한다.

- journal과 동일 transaction에서 갱신
- sampled reconciliation
- full reconciliation procedure
- audit evidence를 남기는 safe rebuild/repair
- divergence 경보

## 8. Query 및 index 아키텍처

index는 측정된 query contract에 연결한다.

critical endpoint/worker마다 predicate/join/order column, 예상 cardinality/selectivity, Test-sized `EXPLAIN (ANALYZE, BUFFERS)` 증거, 필요 시 latency/rows-scanned regression budget을 기록한다.

규칙:
- PK/UNIQUE가 만든 index를 중복 생성하지 않는다.
- FK child column은 적절한 left-prefix index 또는 측정된 예외를 가진다.
- multicolumn index는 실제 query shape에 맞춰 equality/leading predicate를 앞에 둔다.
- 작고 안정적인 active/pending/unprocessed subset은 partial index를 우선 검토한다.
- expression index는 deterministic expression과 실제 query 사용 증거가 필요하다.
- BRIN은 매우 크고 물리 순서와 값이 상관된 데이터에만 사용한다.
- index 삭제는 workload/usage 증거와 rollback plan이 필요하다. 짧고 대표성 없는 기간의 “0 scan”만으로 삭제하지 않는다.

## 9. Partitioning 기준

파티셔닝 전 decision record에 다음을 남긴다.

- 현재 bytes/rows 및 월 growth
- hot/retained 기간
- query predicate/pruning 증거
- retention/drop/archive 작업
- uniqueness/FK 제약
- index build/maintenance 계획
- backup/restore 영향
- migration/rollback 비용

append-heavy history(audit/outbox, chat, market tick, telemetry)는 향후 후보이지만 category만으로 승인하지 않는다. 일반 index 누락이나 무제한 API query를 파티셔닝으로 숨기지 않는다.

## 10. JSONB 경계

JSONB는 flexible/versioned policy payload, event metadata, provider-specific metadata, archived snapshot body 등에 허용한다.

그 row의 authoritative identity, actor/owner, timestamp, state, idempotency, 중요 query key는 typed column으로 둔다. mutable JSONB business payload는 semantic version 또는 동등한 decoder contract를 가진다. 자주 filter하는 JSON property는 측정 결과에 따라 typed/generated column으로 승격하거나 의도적으로 index한다.

## 11. Online migration protocol

migration을 다음으로 분류한다.

- **A — metadata/additive low-risk**
- **B — additive + backfill**
- **C — index/constraint validation**
- **D — rewrite/high-lock**
- **E — destructive/contract**

B–E 필수 순서:
1. exact previous schema 기준과 data-size 추정
2. backward-compatible expand
3. 필요 시 dual-read/write 호환
4. bounded/resumable/observable backfill
5. 지원되는 low-blocking 방식으로 index/constraint build
6. validation + schema fingerprint refresh
7. application switch
8. old-runtime retirement 증명
9. 후속 release에서 destructive contract

모든 migration은 `lock_timeout`/statement-time expectation 또는 동등한 guard와 failure/forward-fix/rollback semantics를 가진다. D/E는 대표 데이터의 isolated Test에서 먼저 실행한다.

## 12. 보안 경계

- app runtime role: DDL 금지, blanket owner/superuser 금지, direct DML은 명시적으로 정당화된 범위만 허용
- migration owner/role은 분리하며 일반 request handling에서 사용할 수 없게 한다.
- `SECURITY DEFINER`는 safe pinned `search_path`, 내부 actor/role/policy validation, PUBLIC execute revoke, intended role explicit grant를 강제한다.
- secret을 schema default, migration history, SQL log에 넣지 않는다.
- privileged/admin mutation은 app boundary의 reauth/authorization/CSRF/audit/idempotency와 DB mutation boundary의 role/invariant 검사를 모두 유지한다.

## 13. Maintenance와 observability

중요 DB/table에 대해 다음을 기록·경보한다.

- relation/index size와 growth
- live/dead tuple
- autovacuum/analyze age와 failure
- oldest transaction/XID pressure
- long transaction 및 blocking/blocked session
- lock wait/deadlock/serialization retry rate
- temp bytes/spill
- 필요한 cache/read pattern
- unused/duplicate/invalid index candidate
- 승인된 `pg_stat_statements` 기반 top normalized query
- migration duration 및 lock impact

high-churn table은 측정에 근거해 per-table autovacuum 설정을 둘 수 있다. bulk backfill/import 후 statistics가 오래될 수 있으면 ANALYZE를 포함한다.

## 14. Backup, recovery, replication

현재 검증된 encrypted logical backup은 유지한다.

더 강한 RPO/RTO가 필요할 때 future PITR lane은 다음을 검토한다.

- base backup
- WAL archiving
- off-host immutable/versioned storage
- isolated restore target
- 명시한 시점으로 실제 복원 시간 측정
- integrity/application read 검증
- credential/failure-domain 분리

read replica/logical replication은 consistency/staleness semantics와 failover ownership을 먼저 정의한 뒤 reporting/analytics에 사용할 수 있다. replica가 우발적으로 두 번째 write authority가 되어서는 안 된다.

## 15. DB 자동 QA

다음 machine check를 추가/유지한다.

- migration 연속 번호/checksum/reverse parity
- fresh PostgreSQL 17 rebuild
- schema fingerprint equality
- 모든 `SECURITY DEFINER` search path/grant
- canonical table PK 예외
- FK index coverage
- invalid/duplicate index candidate
- ledger debit/credit 및 balance reconciliation
- retry/idempotency concurrency
- orphan/reference integrity
- migration old/new-app compatibility
- critical path query-plan baseline
- backup restore 및 도입된 경우 PITR drill

DB를 사용할 수 없어 skip된 database-backed check는 PASS가 아니라 **not verified**로 보고한다.

## 16. Release gate

runtime schema 변경은 별도 개발 branch와 exact-SHA isolated Test를 거친다. Production은 계속 무중단 승격하며 migration 완료, schema fingerprint, backend health, 중요 DB mutation/read, session continuity, logs/metrics, 호환 rollback/forward-fix target을 증명해야 한다.

이 명세 자체는 runtime DB schema를 변경하지 않는다.
