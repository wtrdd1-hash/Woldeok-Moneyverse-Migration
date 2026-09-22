# AI news privileged mutation step-up — v2026.09.22.363

## English canonical

### Scope
Harden administrator AI-news mutations that either change an external API credential/configuration or publish stock-market effects.

### Implementation
- `PUT /admin/ai-news/settings`: CSRF + recent reauthentication.
- `POST /admin/ai-news/auto-generate`: CSRF + recent reauthentication because it may publish immediately.
- `POST /admin/ai-news/scenarios/:id/publish`: CSRF + recent reauthentication.
- Proposal generation and discard remain CSRF-protected without step-up.
- No schema, migration, database privilege, ledger, or API payload change.

### Validation
- Focused guard test: 5/5 passed.
- Backend ESLint on changed runtime/test files: passed.
- Backend TypeScript typecheck: passed.
- Backend Vitest: 85 files / 937 tests passed; DB-dependent suites skipped without a configured test database.
- `git diff --check`: passed.

## 한국어

### 범위
외부 API 자격증명·설정을 변경하거나 주식시장 효과를 게시하는 관리자 AI 뉴스 작업의 보안 경계를 강화했습니다.

### 구현
- AI 설정 변경, 자동 생성·게시, 시나리오 게시에 CSRF와 최근 재인증을 함께 요구합니다.
- 제안 생성·폐기는 기존 CSRF 보호를 유지합니다.
- schema/migration/DB privilege/ledger/API payload 변경은 없습니다.

### 검증
- guard 집중 테스트 5/5 통과.
- 변경 runtime/test 파일 ESLint 통과.
- Backend TypeScript typecheck 통과.
- Backend Vitest 85 files / 937 tests 통과; 테스트 DB가 없는 DB 의존 suite는 skip.
- `git diff --check` 통과.
