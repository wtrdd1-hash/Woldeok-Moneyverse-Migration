# A 07:25 의존성 보안 보완 QA — 2026-11-03

기준 main `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`에서 격리 브랜치로 작업. 운영 코드, 원장, DB 권한, 적용된 마이그레이션 및 서비스는 변경하지 않음.

- Vitest 4개 워크스페이스 4.1.11 → 4.1.12, 취약한 @vitest/mocker 4.1.11 제거. brace-expansion 고정 버전 1.1.20 → 1.1.21, 5.0.11 → 5.0.12. 재발 방지 테스트 강화.
- 전체 의존성 감사 **9건(보통 8, 낮음 1) → 3건(보통 2 minimatch, 낮음 1 deepmerge)**. 잔여 3건은 해결되지 않았으며 전체 감사 PASS가 아님. 운영 의존성 감사에서는 0건.
- 보안 회귀 3 PASS, 타입검사 PASS, DB 단위 72 PASS/5 SKIP, 계약 41 PASS, Backend 대상 8 PASS, Frontend 대상 8 PASS, Backend 빌드 PASS, Android 계약 184 PASS.
- 최초 전체 테스트는 105초 제한으로 TIMEOUT. 재실행: Backend **2,983 PASS/2 FAIL/518 SKIP**(기존 프로필 인증 200 대 401 실패, 복구 PR #2265), Frontend **2,947 PASS/0 FAIL**(`NODE_ENV=test`로 올바르게 실행). 최초 수동 실행에서 NODE_ENV 누락으로 발생한 502개 실패는 정상 환경 재실행 결과로 대체. Frontend 빌드 재실행 **PASS**(정적 602개). 전체 lint **0 오류/1,026 경고**.
- 실 PostgreSQL 격리 Test, 인증 E2E, 접근성/SEO, 정확한 SHA 공식 Test, 독립 복원, GitOps 및 롤백 검증 미완료/BLOCKED.
- 07:36 KST 운영 /ko, /en HTTP 500; Test /ko HTTP 200. 루트 디스크 약 97% 사용. 기존 복구 PR #2552와 중복 변경 금지.

**결정: Draft/HOLD.** main 병합·Test/Production 배포 금지. 다른 작업의 브랜치·PR 보존.
