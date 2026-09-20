# v2026.09.21.317 — CI + PostgreSQL release-gate repair

## English canonical
- Rebased the runtime lint repair and PostgreSQL migration syntax repair onto current main.
- Keeps CI fail-closed: lint, typecheck, build, real PostgreSQL migrations, tests, security checks and exact-SHA gates remain mandatory.
- No migration sequence was renamed or rewritten beyond the unreleased REVOKE typo repair; no ledger/auth/API semantics were relaxed.
- Supersedes the split #612/#613 repair path so one exact SHA can traverse the complete release gate.

## 한국어
- 최신 main 위에 런타임 lint 복구와 PostgreSQL migration 구문 복구를 함께 재적용했습니다.
- CI를 우회하지 않고 lint/typecheck/build/실 PostgreSQL migration/test/security/exact-SHA gate를 그대로 유지합니다.
- migration 번호 변경이나 권한 완화 없이 미배포 REVOKE 오타만 교정합니다.
