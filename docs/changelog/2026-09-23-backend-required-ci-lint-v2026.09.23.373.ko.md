# Backend required-CI lint 강화 — v2026.09.23.373

## 한국어

- repository 전체 required lint gate를 막던 backend의 사용하지 않는 import 7개를 제거했습니다.
- Treasury repository 의존성을 `Pool`에서 기존 최소 기능 `Queryable` 계약으로 좁혀 AdminModule의 unsafe `any` cast를 제거했습니다. SQL 및 런타임 동작은 변경하지 않았습니다.
- API payload, migration, DB privilege, ledger semantics 변경은 없습니다.
- 검증: 변경 파일 ESLint PASS, backend TypeScript typecheck PASS, backend Vitest 88 files / 940 tests PASS(DB 미구성 suite 52개 skip).
