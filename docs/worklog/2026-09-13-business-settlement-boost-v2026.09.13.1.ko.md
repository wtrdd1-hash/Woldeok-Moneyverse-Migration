# 작업 기록 — 사업체 정산 부스트 재통합 v2026.09.13.1

## 선택한 런타임 작업
활성 사업체 부스트 평가 시 `business_settle_daily_v2`에서 발생하는 확인된 PostgreSQL 런타임 오류를 수정한다. 사용자 관점에서는 부스트가 활성화된 사업체도 정산이 실패하지 않고 정상 처리되도록 하는 작업이다.

## 기준선과 동시 작업 확인
- 개발 직전 최신 main: `04ca71e95a5d1e63b0a7ef834aa5bd1ecbdef827`.
- 기존 검증 수정 원본: PR #164 / `12cf57ef608a2b7e0c1bb8071ca7ff8eb41ebcc4`.
- 현재 활성 런타임 PR #189(Economy Scenario Lab), #195(Event Calendar)를 확인했으며 이번 migration/DB 테스트 경로와 겹치지 않는다.
- 오래된 #164 기준점부터 현재 main까지 비교해 179번 migration이 비어 있고, 더 최신 브랜치가 이 수정을 대체하지 않았음을 확인했다.
- 구현 전에 Living Project Plan을 다시 읽고 migration 불변성과 Test-first 배포 규칙을 유지했다.

## 런타임 변경
- 적용된 178번은 수정하지 않고 `179-business-settlement-v2-boost-runtime-fix.sql` 후속 migration을 추가했다.
- 활성 부스트 배율 계산에서 올바른 `COALESCE(...)` 구문을 사용한다.
- key 기반 멱등성 잠금, replay 소유권 검증, 일일 중복 정산 방지, 원장 분개, 이벤트 계약을 유지한다.
- 실제 PostgreSQL 부스트 회귀 테스트를 복원했다.
- 신규 migration에서 같은 SQL 수식 오류가 다시 들어오지 않도록 `sql-construct-qualification.test.ts`를 추가했다.

## 검증/배포
- 브랜치: `integrate/business-settlement-boost-v2026.09.13.1`.
- PR: #196.
- CI: 이 기록 작성 시점에는 대기/진행 중이다.
- isolated Test exact-SHA: 아직 검증하지 않았다.
- Production: 변경하지 않았다. CI 및 exact-SHA Test 검증 전에는 승격하지 않는다.

## 남은 위험/다음 우선순위
CI 통과 후 정확한 후보 SHA를 isolated Test에 배포해 migration 적용, 활성 부스트 실제 정산, backend log를 검증한다. 이 후보를 처리한 뒤 같은 최신-main 재통합 방식으로 Trusted Client IP #165와 Admin edit-state #160을 이어서 처리한다.
