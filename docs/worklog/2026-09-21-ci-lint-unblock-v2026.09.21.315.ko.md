# CI lint 차단 해소 — v2026.09.21.315

## 범위
main 67d2795af1ba587224be612ff95399efc06ead71 기준 개발 B 릴리스 차단 복구 작업입니다.

## 변경
- CI 정책을 약화하지 않고 exact-SHA runtime gate를 막던 ESLint 오류 31건을 제거했습니다.
- 공개 props 계약은 유지하고 의도적으로 사용하지 않는 값/import를 명시적으로 표시했습니다.
- 주식 토론의 any 캐스트 2곳을 제한된 literal union으로 교체했습니다.
- DB migration, ledger mutation, 권한 정책, API 계약은 변경하지 않았습니다.

## 검증
- pnpm lint: 통과(오류 0, 기존 경고만 존재).
- pnpm typecheck: 통과.
- pnpm build: 통과.
- git diff --check: 통과.

통합 전 real PostgreSQL, 전체 테스트, 보안 검사, exact-SHA isolated Test는 계속 필수입니다.
