# Moneyverse 데이터베이스 레퍼런스 확장 검토 — v2026.09.29.486

[English canonical](MONEYVERSE_DATABASE_ARCHITECTURE_RESEARCH_REVIEW_v2026.09.29.486.md) | **한국어**

> 날짜: 2026-09-29  
> 범위: 데이터베이스 조사/기획 증거 전용  
> 런타임 변경: 없음  
> 이전 기준: v2026.09.25.443

## 최종 결과

- Crossref 탐색 수집: 1900-2026을 겹치지 않는 6개 발행일 구간으로 나눠 **원시 145,898건** 수집.
- 엄격 제목 조건: 제목에 단어 `database` 또는 구문 `data base`가 실제 존재하는 레코드만 유지.
- 최종 코퍼스: DOI 우선 / 정규화 제목 보조 중복 제거 후 **145,579 고유 건**.
- 최종 SHA-256: `d61e825f8f699ccfca9e1bc5ee13dd070d123440c680a8aa9d90c5a4d6a80216`.
- 파일: `docs/findings/MONEYVERSE_DATABASE_REFERENCE_CORPUS_v2026.09.29.486.csv`.
- 최종 CSV를 다시 파싱해 모든 제목의 엄격 조건 통과와 중복 키 0건을 검증함.

요청한 10만 건 이상의 탐색 폭을 충족하면서 v443보다 관련성 조건을 강화했다. 다만 145,579개 논문을 사람이 전부 정독했거나 Moneyverse 설계에 모두 채택했다는 의미는 아니다. 생물·의료·인용·과학 등 특정 도메인의 데이터베이스 문헌도 제목 기준상 정상 포함되지만 제품 요구사항을 자동 결정하지 않는다.

## 수집 및 출처

Crossref REST API에서 `query.title=database`, `rows=1000`, cursor 페이지네이션과 6개 비중복 발행일 구간을 사용했다. 출처 추적에 필요한 DOI, 제목, 발행일, 유형, URL만 보존했다. Crossref 공식 문서는 페이지당 최대 1000건과 대규모 결과의 cursor 페이지네이션을 안내한다.

초기 v486 광역 탐색은 중복 제거 108,216건을 만들었으나 무작위 표본에서 “optimization”, “recovery”, “view” 같은 일반 단어로 인한 오탐을 확인했다. 따라서 해당 결과는 최종 코퍼스로 승인하지 않고 엄격 제목 코퍼스로 교체했다.

중복 제거 키는 DOI 소문자 우선, DOI가 없으면 NFKC 정규화·case-fold·문장부호 제거 제목이다.

## 저장소 기준 재확인

현재 저장소는 번호 SQL 마이그레이션을 스키마 권위로 사용하고, 제한된 앱 역할, `SECURITY DEFINER` 변경 경계, 정수 화폐, 결정적 락 순서, 멱등성, append 중심 원장/outbox, 스키마 fingerprint/parity 검사를 유지한다. 현재 런타임 근거는 Debian 13 권위의 PostgreSQL 17.11을 가리킨다.

Android 저장소는 API 클라이언트이며 자체 문서에서도 모든 변경이 API-only이고 앱이 PostgreSQL에 직접 쓰지 않는다고 규정한다. DB 기획 권위는 이 웹 저장소에 유지한다.

## PostgreSQL 17 1차 자료에서 채택한 보강

### DB486-01 — 동시 인덱스 유효성은 릴리스 게이트 — P0
`CREATE INDEX CONCURRENTLY`는 쓰기 차단 락을 줄이지만 실패 시 쿼리에는 쓰이지 않으면서 쓰기 비용을 발생시키는 `INVALID` 인덱스를 남길 수 있다. 마이그레이션/인덱스 작업 후 예상하지 않은 invalid index가 없어야 하며 장시간 빌드는 `pg_stat_progress_create_index`로 관측한다.

### DB486-02 — nullable 고유성 의미를 명시 — P0
PostgreSQL 고유 제약은 기본적으로 NULL을 서로 다른 값으로 취급한다. nullable 비즈니스 키마다 여러 NULL 허용 여부를 명시하고, 논리적으로 NULL 하나만 허용해야 하면 `NULLS NOT DISTINCT` 또는 동등한 명시적 불변식을 사용해 테스트한다.

### DB486-03 — 확장 통계는 증거 기반으로만 적용 — P1
상관된 여러 컬럼 때문에 실제 cardinality 추정 오류가 확인된 경우에만 `CREATE STATISTICS`를 검토하고 `EXPLAIN (ANALYZE, BUFFERS)`로 개선을 확인한다. 임의 조합에 선제적으로 만들지 않는다.

### DB486-04 — 복제/CDC 슬롯에는 WAL 보존 예산 필수 — P0(활성화 시)
논리 디코딩, CDC, 복제 슬롯 도입 시 슬롯별 소유자/소비자, 지연, 보존 WAL, 용량 예산과 `max_slot_wal_keep_size` 상한 정책 또는 문서화된 예외가 필요하다. 슬롯이 `pg_wal` 공간을 채울 수 있다는 PostgreSQL 경고를 운영 게이트로 반영한다.

### DB486-05 — 백업 검증은 복구 증명을 대체하지 않음 — P0
물리/base backup 도입 시 manifest 기준 `pg_verifybackup`을 실행하되, 격리된 전체 복구 리허설과 애플리케이션/데이터 검증을 계속 요구한다. PostgreSQL도 이 도구가 실제 복원 서버가 수행하는 모든 검사를 대신할 수 없다고 명시한다.

### DB486-06 — 저영향 제약 배포 절차 명시 — P0
대형 테이블 FK/check에는 적합한 경우 `NOT VALID` 후 `VALIDATE CONSTRAINT`를 사용한다. unique 제약도 적합하면 동시 unique index를 만든 뒤 제약으로 연결한다. 락/스캔 특성은 마이그레이션 리뷰 대상이다.

### DB486-07 — RLS는 조건부 방어 계층 — P1
사용자/테넌트 범위 read model에 RLS를 도입한다면 table owner와 `BYPASSRLS` 예외를 테스트하고 owner에게도 적용해야 하는 경우 `FORCE ROW LEVEL SECURITY`를 사용한다. 현재의 제한 역할 + security-definer 경계가 변경 권한의 1차 통제다.

## 승인 범위와 비주장

- 145,579건 코퍼스는 **Tier C 탐색 증거**다.
- 이번에 직접 확인한 PostgreSQL/Crossref 공식 문서는 **Tier A 1차 증거**다.
- 런타임 스키마, 마이그레이션, Test/Production DB, 서비스, 사용자 데이터는 변경하지 않았다.
- 전역 `PROJECT_PLAN.md`은 기존 authority-drift 규칙에 따라 v444를 유지한다. 이번 주기는 무관한 v445+ 제품 결정을 통합했다고 가장하지 않고 통합 기획 원장과 이미 채택된 DB 상세 명세만 갱신한다.

## 1차 자료

- Crossref REST API: https://www.crossref.org/documentation/retrieve-metadata/rest-api/
- Crossref 페이지네이션: https://www.crossref.org/documentation/retrieve-metadata/rest-api/tips-for-using-the-crossref-rest-api/
- PostgreSQL 17 CREATE INDEX: https://www.postgresql.org/docs/17/sql-createindex.html
- PostgreSQL 17 Constraints: https://www.postgresql.org/docs/17/ddl-constraints.html
- PostgreSQL 17 Planner Statistics: https://www.postgresql.org/docs/17/planner-stats.html
- PostgreSQL 17 ALTER TABLE: https://www.postgresql.org/docs/17/sql-altertable.html
- PostgreSQL 17 Replication Settings: https://www.postgresql.org/docs/17/runtime-config-replication.html
- PostgreSQL 17 Replication Slots: https://www.postgresql.org/docs/17/view-pg-replication-slots.html
- PostgreSQL 17 pg_verifybackup: https://www.postgresql.org/docs/17/app-pgverifybackup.html
- PostgreSQL 17 Row Security: https://www.postgresql.org/docs/17/ddl-rowsecurity.html
