# Status API freshness authority — v2026.09.19.241

## English (canonical)
Backend B moved status freshness authority into the App/Public API response. The server now emits `freshnessState`, bounded `ageMs`, and `policyVersion=status-v1`; observations older than 60,000 ms or more than 5,000 ms in the future fail closed to public `state=unknown`. Existing source/detail allowlisting remains unchanged.

Validation: focused content-service Vitest 4/4, contract build, backend TypeScript typecheck, and `git diff --check` passed. Production promotion remains gated on exact-SHA CI/Test evidence.

## 한국어
개발 B는 상태 최신성 판단 권한을 App/Public API 서버로 이동했다. 서버가 `freshnessState`, 제한된 `ageMs`, `policyVersion=status-v1`을 반환하며 60,000ms 초과 과거 관측 또는 5,000ms 초과 미래 관측은 공개 상태를 `unknown`으로 fail-closed 처리한다.
