# 사업 정산 V2 멱등성 보강 — 내부 업데이트

업데이트 버전: **2026.09.12-02**  
상태: **후보 / 테스트 서버 검증 필요**  
브랜치: `fix/business-settlement-v2-idempotency`

## 확인된 실제 오류

`business_settle_daily_v2`에서 세 가지 실제 결함을 확인했습니다.

1. 멱등 영수증 조회 전에 멱등키 기준 advisory transaction lock을 잡지 않아 동일 키 동시 요청이 경쟁할 수 있었습니다.
2. 기존 영수증을 재생할 때 해당 영수증의 사업체 소유자가 현재 `p_actor`인지 확인하지 않았습니다.
3. `RETURNS TABLE`의 OUT 파라미터 `ownership_id`, `settlement_date`와 동일한 이름의 테이블 컬럼을 일일 정산 중복 검사에서 무수식으로 참조했습니다. PL/pgSQL에서는 이 참조가 변수와 컬럼 사이에서 모호해져 해당 경로 실행 시 SQLSTATE `42702`가 발생할 수 있습니다.

구형 V1 함수는 migration 085에서 멱등키 락과 영수증 소유자 확인을 이미 적용하고 있어 V2의 앞선 두 항목은 회귀였습니다.

## 수정 내용

신규 migration `126-business-settlement-v2-idempotency.sql`에서 V2 정산 함수만 교체했습니다.

처리 순서를 다음과 같이 고정했습니다.

1. 입력값 검증
2. `business_settle_daily_v2 + idempotency key` 기준 advisory transaction lock 획득
3. 기존 영수증 조회
4. 영수증의 `ownership_id`를 `virtual_business_ownerships`와 조인해 사용자 소유권 확인
5. 다른 사용자 영수증이면 SQLSTATE `28000` 거부
6. 일일 정산 중복 검사에서 `settlement_row.ownership_id`, `settlement_row.settlement_date`처럼 테이블 별칭으로 컬럼을 완전 수식
7. 이후 기존 사업체 잠금, 부스트 계산, 원장 기록, 정산 영수증 생성 수행

기존 부스트 계산식, 원장 분개, 이벤트 이름과 payload는 변경하지 않았습니다.

## 테스트 추가

`backend/src/business/business-settlement-v2.db.test.ts`에서 다음을 검증합니다.

- advisory lock이 재생 조회보다 먼저 위치하는지 확인
- 일일 정산 중복 검사에서 OUT 파라미터와 충돌하는 컬럼이 테이블 별칭으로 수식되어 있는지 확인
- 최초 정산이 정상 완료되고 `replayed = false`인지 확인
- 동일 사용자 동일 키 재요청이 원래 영수증을 `replayed = true`로 반환하는지 확인
- 다른 사용자가 기존 멱등키를 재생할 경우 SQLSTATE `28000`이 발생하는지 확인

## 배포 상태

현재 미니PC 원격 연결이 오프라인이어서 테스트 서버 직접 기동 및 백엔드 연결 확인은 수행하지 못했습니다.

따라서 이번 버전은 운영 반영하지 않습니다. 다음 조건을 모두 확인한 뒤에만 운영 승격합니다.

- GitHub CI 통과
- 테스트 DB에 migration 126 적용
- 테스트 서버 백엔드 정상 기동 확인
- 최초 V2 정산이 `42702` 없이 성공
- 동일 사용자 동일 키 재요청은 `replayed = true`
- 다른 사용자 멱등키 재생은 `28000`
- 위 항목 확인 후 운영 릴리스 절차 진행
