# 작업 기록 — 사업체 V2 부스트 런타임 수정 v2026.09.12.9

## 범위

활성 사업체 부스트가 존재할 때 `business_settle_daily_v2`에서 발생하는 PostgreSQL 런타임 오류를 수정한다.

## 확인한 자료

- 구현 전과 작업 중간에 `docs/planning/PROJECT_PLAN.md` 재확인.
- `AGENTS.md`의 마이그레이션 불변 규칙과 PostgreSQL SQL 구문 규칙 확인.
- `main` 및 관련 원격 브랜치의 `178-business-settlement-v2-idempotency.sql` 확인.
- 사용자 제공 결함 보고서를 PostgreSQL 17.11 기준으로 재현·검증.

작업 중 Living Project Plan의 blob SHA는 `097f5db3001870a6c1013bb050a734e9d6329965`로 변경되지 않았다.

## 버전

`v2026.09.12.9`

## 변경 사항

- 178번을 수정하지 않고 `179-business-settlement-v2-boost-runtime-fix.sql` 후속 마이그레이션을 추가했다.
- 활성 부스트 경로의 잘못된 `pg_catalog.coalesce(...)`를 `COALESCE(...)`로 수정했다.
- 활성 부스트, revenue/cost 배율 누락, 만료 부스트 회귀 DB 테스트를 추가했다.
- 신규 비레거시 마이그레이션에서 `COALESCE`, `GREATEST`, `LEAST`, `NULLIF`, `EXTRACT`를 `pg_catalog`로 수식하면 CI가 실패하도록 정적 가드를 추가했다.
- 기존 멱등키 잠금, 영수증 소유권 확인, 일일 중복 정산 방지, 원장 분개, 이벤트 계약은 유지했다.

## 검증

- PostgreSQL 이미지: `postgres:17.11-alpine`.
- 새 DB에서 002~179 전체 마이그레이션 적용 성공.
- migrator DB 권한으로 백엔드 테스트 실행: 62개 테스트 파일 통과, 42개 skip; 837개 테스트 통과, 546개 skip; 실패 0개.
- `business-settlement-v2-boost.db.test.ts`: 4/4 통과.
- `business-settlement-v2.db.test.ts`: 2/2 통과.
- SQL 구문 정적 가드 통과.

## 배포 메모

현재 Production에 선언된 백엔드 이미지의 커밋에는 178번이 이미 포함되어 있고, 격리 Test 매니페스트는 더 오래된 애플리케이션 SHA를 사용한다. 따라서 본 수정은 후속 마이그레이션으로 유지하고 Test 후보 검증 후 Production으로 승격해야 한다.
