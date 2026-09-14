# v2026.09.15.101 — API 계약 검사 결정성 개선

## 요약

의존성 통합 이후 공개 API 구조는 바뀌지 않았지만 TypeScript가 생성하는 내부 심볼 이름의 숫자 suffix가 달라져 운영 승격 게이트가 차단되는 문제가 발생했다.

## 변경 사항

- 결정적인 API 계약 비교 스크립트를 추가했다.
- `__@toStringTag@716` 같은 컴파일러 내부 심볼의 숫자 suffix만 비교 전에 정규화한다.
- 그 외 실제 API 계약 변경은 기존과 동일하게 실패 처리한다.
- API 계약 생성 자체는 변경하지 않으며 생성 결과와 커밋된 기준 문서의 의미적 일치를 계속 강제한다.

## 검증 목표

`lint` → `typecheck` → `build` → DB migration → API 계약 검사 → 테스트 → 후보 이미지 빌드 → Test 배포 확인 → Production 승격 순으로 검증한다.

영문: [2026-09-15-api-contract-determinism-v2026.09.15.101.md](2026-09-15-api-contract-determinism-v2026.09.15.101.md)
