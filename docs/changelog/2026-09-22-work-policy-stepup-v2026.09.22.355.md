# v2026.09.22.355 — Work economy policy step-up authentication

## English canonical

- Require recent reauthentication for automatic work-reward tuning, direct reward-policy updates, and work-task reward/limit/activation mutations.
- Preserve the existing admin session, consent, CSRF, repository role checks, database schema, and ledger semantics.
- Add a controller metadata regression test covering all three economy-policy mutations.

## 한국어

- 자동 근로 보상 조정, 보상 정책 직접 변경, 근로 과제 보상/한도/활성 상태 변경에 최근 재인증을 요구합니다.
- 기존 관리자 세션, 동의, CSRF, repository 역할 검사, DB schema 및 ledger 의미는 유지합니다.
- 세 경제 정책 mutation 모두를 검증하는 controller metadata 회귀 테스트를 추가했습니다.
