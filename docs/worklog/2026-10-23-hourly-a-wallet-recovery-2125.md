# Development A — Wallet Recovery, 2026-10-23 21:25 KST

**Status: source recovery / local PASS / official Test and Production HOLD.**
**Incident:** #1016; the mass deletion of 241 remote branches and closure of unmerged PRs remains unexplained. No mass recreation or deletion was performed.

## Preflight and ownership
- Mini-PC Debian 13.6 directly checked: backend, frontend, Discord bot, MCP, Nginx, Docker all active; dev DB connected.
- Starting remote state: 2 branches (main, QA v1189), 1 open draft PR (#1021). Initial main `287cbf0fa9da7aba695faf9b267938623bff4d13`.
- Read AGENTS.md, README.md, English-first PROJECT_PLAN.md, PROJECT_PLAN.ko.md, INTEGRATED_PLANNING_MASTER.md, prior A worklogs, #1016 and #1021, recent CI and cleanup workflows.
- While working, main advanced to `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede` (blog features); rebased the isolated recovery branch and reran the complete local gates.
- Worktree `/home/debian/worktrees/mv-a-wallet-recovery-20261023-2125`, branch `auto/hourly-a-wallet-recovery-20261023-2125`. Shared main and other worktrees untouched.
- Recovered four unique implementation commits from protected local backup ref `255865c6b437399279d1f6ba52764fe6f7d95df4` with `git cherry-pick -x`. Preserved original Git bundle and patch under `/home/debian/Moneyverse-A-2026-10-23-2025-integration*`. Rebased code HEAD `550c9c0e852f80d891d7f6c60f8007c6b07a5f0d`.

## Actual recovered implementation (26 files; 770 insertions / 104 deletions)
1. Owner-scoped cash/bank posting amount rendering, unknown amount accessibility and pocket regression coverage.
2. Next.js 16.4.2 patched dependency lock, with unchanged integer-string WLD precision.
3. Private no-store financial API response headers in backend and Android app-api, preserving auth cookies and rejecting upstream cache validators.
4. Stable idempotency keys across ambiguous wallet/bank/loan failures, with focused frontend and backend regression coverage.
- No DB migration, ledger mutation, production secret, or feature-switch change.
- QA PR #1021 independently owns CSV control-prefix regression; the recovered source also touches the CSV sanitizer. Preserve both changes and reconcile after QA merge, never overwrite QA tests.

## Fresh verification
- Before rebase: focused frontend 53/53 PASS with `NODE_ENV=test`; backend 10/10 PASS. Initial frontend run without `NODE_ENV=test` failed due to React.act production mode, then corrected test environment and passed; not a source defect.
- **After rebase on main `54d5140d`**, exact code SHA `550c9c0e`: `pnpm test` exit 0: contract 38 PASS; database 15 PASS / 3 SKIPPED; backend 1,323 PASS / 398 SKIPPED; frontend 1,420 PASS.
- `pnpm lint` exit 0, 0 errors / 1,124 warnings. `pnpm typecheck` exit 0. `pnpm build` exit 0. `pnpm audit --prod --audit-level=high` exit 0, no known vulnerabilities. `git diff --check` PASS.
- These are **local source checks**, not exact final PR-SHA GitHub CI or official isolated Test. Skipped DB tests are not PASS.
- Development PostgreSQL read-only SQL (rolled back): 852 ledger transactions, 1,734 postings, 0 unbalanced debit/credit transactions, 0 transactions with fewer than two postings. **P0 FAIL: app role has INSERT/UPDATE/DELETE on 235 of 241 public tables.**
- No negative app-role privilege test, migration 266 parity/production checksum proof, authenticated end-to-end official Test backend/API/DB, rollback drill or GitOps release gate PASS.

## Integration, protection, and rollback
- **No main merge, no official Test promotion, no Production deployment, no branch deletion, no schedule changes.**
- Existing QA PR #1021 and other local B/C/planning worktrees preserved. Closed historical PR heads are not assumed merged; #1016 remains open.
- Candidate branch must remain **Draft / HOLD** until new exact-SHA CI, QA CSV reconciliation, PostgreSQL least-privilege remediation, migration checksum/ledger projection proof, authenticated official Test finance/app-api/E2E and GitOps gates pass.
- Rollback not executed: no production or DB writes occurred. Source rollback is simply discarding this unmerged branch; recovery artifacts retained.

## 한국어 요약
21:25 개발 A는 20:28 원격 대량 삭제 사고(#1016)에서 보존한 금융 기능 4개 커밋을 **최신 main 기반 별도 Worktree**로 안전하게 복원했습니다. 26개 파일에 지갑 실제 거래금액·개인정보 캐시 차단·불확실한 금융 요청 멱등 재시도·Next.js 보안 업데이트가 포함됩니다. main 변경을 반영한 뒤 로컬 테스트, 빌드, 린트, 타입 검사, 의존성 보안 검사는 통과했으나 실제 PostgreSQL DB 테스트 398건 등은 생략됐습니다. 개발 DB 앱 계정의 235/241 테이블 직접 쓰기 권한 위반은 계속 확인됐습니다. QA #1021의 고유 테스트와 다른 개발자의 변경을 보존하며, **공식 Test·운영 배포는 HOLD**입니다.
