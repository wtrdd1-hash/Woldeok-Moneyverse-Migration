# 작업 보상 economic-command CI 수정 — v2026.09.19.268

영문 문서가 기준입니다. P0 `ECON-233-02` 작업 보상 후보의 exact-head CI에서 `pgcrypto` `digest` 함수의 잘못된 스키마 지정이 확인되어 수정했습니다. migration 210은 저장소에서 이미 사용하는 `public.digest(...)` 계약을 사용하고, `SECURITY DEFINER` 함수의 제한된 search path와 명시적 스키마 접근은 유지합니다.

동작 계약은 변경하지 않습니다. 작업 보상 정산은 immutable economic command를 한 번 claim하고, 동일 트랜잭션에서 권위 work policy에 위임해 원장/영수증/진행도를 정산한 뒤 결과를 command에 완료 기록합니다. replay에서는 두 번째 mutation 없이 저장된 결과를 반환합니다.

이번 버전 승격 조건은 lint, typecheck, build, real PostgreSQL 전체 테스트, exact-SHA CI, isolated Test 배포와 백엔드 health 확인, 이후 중간 승격 없는 Production 승격입니다. DB 데이터와 secret은 Git에 포함하지 않습니다.
