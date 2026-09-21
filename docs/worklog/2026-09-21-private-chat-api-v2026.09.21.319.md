# v2026.09.21.319 — Private chat API release candidate

## English canonical

- Rebased the authoritative private 1:1 chat API onto main after the release/migration gate repair merged.
- Preserves server-session actor binding, CSRF/consent/authentication gates, database object authorization, monotonic message/read sequencing, and idempotent send semantics.
- No migration rewrite and no ledger privilege expansion.
- Local repository verification: lint (0 errors), typecheck, production build, API contract parity, migration parity, backend 898 tests, frontend 707 tests.
- Real PostgreSQL and exact-SHA CI/isolated Test remain mandatory before main integration or Production promotion.

## 한국어

- release/migration gate 복구가 main에 병합된 뒤 1:1 private chat API를 최신 main 기준으로 다시 구성했습니다.
- 서버 세션 actor 결박, CSRF/동의/인증 gate, DB 객체 권한, 단조 증가 message/read sequence, 멱등 전송 계약을 유지합니다.
- migration 재작성이나 ledger 권한 확대는 없습니다.
- 로컬 전체 검증에서 lint 0 errors, typecheck, production build, API 계약, migration parity, backend 898 tests, frontend 707 tests가 통과했습니다.
- main 통합/Production 승격 전 real PostgreSQL 및 exact-SHA CI/isolated Test를 계속 요구합니다.
