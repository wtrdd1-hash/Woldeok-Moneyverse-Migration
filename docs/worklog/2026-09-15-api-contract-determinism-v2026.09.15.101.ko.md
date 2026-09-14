# 내부 작업 기록 — v2026.09.15.101

## 발생 조건

main `496158f830d34d237afb1a2211498a855668822f`의 Production Release가 Test Candidate 실패로 건너뛰어졌다. 실패 지점은 `pnpm test` 안의 `api:contract:check`였다.

## 원인

의존성 및 TypeScript 타입 그래프 변경 이후 생성된 모바일 API 계약에 `__@toStringTag@716` → `__@toStringTag@743`처럼 컴파일러 내부 심볼 숫자가 달라졌다. 이 숫자는 공개 API 필드가 아니며 안정적인 계약 데이터가 아니다.

## 구현

- 버전: `v2026.09.15.101`
- 브랜치: `fix/api-contract-determinism-v2026.09.15.101`
- `scripts/check-mobile-api-contract.mjs` 추가
- 기존 raw `git diff --exit-code` 방식 대신 컴파일러 내부 심볼 숫자 suffix만 정규화한 뒤 비교하도록 변경
- 실제 API 계약 차이는 계속 fail-closed 처리

## 승격 게이트

CI 검증 → immutable Test 후보 → Test 환경 관찰 → Production Release 순서를 유지한다. DB 실제 데이터는 Git에 커밋하지 않는다.

영문: [2026-09-15-api-contract-determinism-v2026.09.15.101.md](2026-09-15-api-contract-determinism-v2026.09.15.101.md)
