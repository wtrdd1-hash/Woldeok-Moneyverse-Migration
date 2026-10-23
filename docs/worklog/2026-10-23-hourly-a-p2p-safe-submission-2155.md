# Development A — P2P Transfer Safe Submission (2026-10-23 21:55 KST)

**State: BEFORE WORK / DRAFT / RELEASE HOLD.**

## Preflight
- Debian 13.6 mini-PC: backend, frontend, bot, MCP, nginx, Docker active; development DB connected.
- Latest `origin/main`: `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede`; isolated branch `auto/hourly-a-p2p-csrf-idempotency-20261023-2155`, isolated worktree `/home/debian/worktrees/mv-a-p2p-20261023-2155`.
- Remote at start: 5 branches (main, A recovery #1023, B CI #1024, C, QA #1021); open PRs #1021/#1023/#1024 plus concurrent C #1025 to recheck. No deletion authorized.
- Read AGENTS.md, README, English PROJECT_PLAN, Korean PROJECT_PLAN.ko, integrated master, latest wallet recovery worklog, QA and CI, incident #1016, release policy.
- A recovery PR #1023 now has exact SHA `25ba6ff1` CI and Test Candidate **SUCCESS** (new since 21:25), but P0 app-role ACL 235/241 and official authenticated Test/Production gates still BLOCK.

## Observed P0 gap and scope
- `frontend/src/app/api/transfers/p2p/route.ts` calls backend mutation through `api()` without CSRF token even though `WalletController` requires `CsrfGuard`; it also generates a new UUID per HTTP retry.
- `frontend/src/components/p2p-transfer-modal.tsx` sends no idempotency key, and fabricates a random transaction ID if the backend receipt lacks one.
- Backend `recordP2PTransfer` currently writes separate P2P metadata/notification after ledger transfer with no transaction ID uniqueness, so a replay may duplicate side effects. This needs a reviewed DB-owned atomic remediation, not a speculative GRANT/migration from A.
- Scope of this branch: authenticated P2P browser→Next BFF→Nest CSRF→ledger idempotency contract and truthful receipt. Do not modify B's DB/CI, C's blog/auth, QA's CSV or #1023 recovery files.

## Plan / verification
1. Write failing BFF tests: authenticated same-origin JSON, caller-provided UUID, precision-safe amount, CSRF forwarding via `mutate`, no-store and unavailable auth. Run RED.
2. Fix BFF validation and CSRF path, run GREEN.
3. Add client regression for same key after ambiguous failure, new key on changed payload and receipt authenticity; run RED then GREEN.
4. Run focused tests, lint, typecheck, build, full tests and CI. Any skipped DB test is not PASS.
5. Recheck main and integrated plan before PR; preserve all other branches; no merge/production until exact SHA CI and real DB negative privileges, authenticated Test, ledger projection and release gates PASS.

## In progress (21:59 KST)
- Created new P2P BFF regression tests; RED 3/3 on old route (HTTP 400 instead of expected success/CSRF, origin denial and missing receipt handling).
- Added browser attempt state regression; RED on identical retry key (`request-2` vs `request-1`).
- GREEN 6/6 focused tests after implementing CSRF-aware `mutate`, strict UUID and canonical 1–38-digit WLD, no-store responses, fail-closed receipt, and stable browser attempt key by payload fingerprint.
- Modal now sends caller UUID, reuses it after ambiguous network failure, rotates on changed payload/confirmed success, and never invents a transaction ID or notification success.
- `pnpm typecheck` PASS before final strict UUID validation adjustment; full gates pending.
- Known unresolved backend replay issue: `WalletService.p2pTransfer` invokes `recordP2PTransfer` after `transfer`, and `WalletRepository.recordP2PTransfer` separately inserts a P2P record and notification without transaction-unique constraint. This cannot be treated as end-to-end exactly-once until a DB-owned atomic remediation is proven.

## Finished (22:05 KST) — source candidate only / RELEASE HOLD
- Latest main rechecked `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede` at start, after test setup and before stacked integration; unchanged. The English canonical and Korean secondary plans and integrated master were reread.
- Implementation commit `1952306dc4d2e69c1143661f1f81f139a9390cf3`, stacked merge commit `ca2eae37` on recovered A Draft PR #1023 HEAD `25ba6ff1336f16cacfffd6991f528d1c7c5ed632`. The new branch is a **stacked PR candidate**: its base must be A #1023, not main, so its unique six-file diff does not duplicate the recovery PR. Existing QA CSV PR #1021 and B/C branches untouched.
- TDD BFF RED 3/3 -> GREEN; P2P attempt identity RED 1/1 -> GREEN. Final focused **6/6 PASS**.
- Fresh stacked source gates: `NODE_ENV=test pnpm test` exit 0, contract **38 PASS**, database package **15 PASS / 3 SKIPPED**, backend **1,323 PASS / 398 SKIPPED**, frontend **1,426 PASS**; `pnpm lint` 0 errors / 1,124 pre-existing warnings; `pnpm typecheck` PASS; `pnpm build` PASS (Next.js **16.4.2**); `pnpm audit --prod --audit-level=high` **no known vulnerabilities**. Logs under `/home/debian/moneyverse-a-20261023-2155-gates/`. These are local source checks, not an official Test exact SHA.
- Development PostgreSQL read-only schema: `p2p_wire_transfers` lacks transaction ID and idempotency key columns; `in_app_notifications.dedupe_key` exists but P2P inserts do not populate it. Counts: **0 P2P records, 0 TRANSACTIONAL notifications** in dev; **no observed duplicate incident**. `moneyverse_app` direct INSERT on P2P/notifications and UPDATE on balances; P0 #993 persists. Backend post-ledger side-effect replay gap filed as issue **#1025** for DB/backend owner.
- **Blocked:** real-PostgreSQL idempotency/owner negative tests, 235/241 app-role ACL remediation, migration 266 checksum and production ledger projection, authenticated official Test finance/app-api/E2E, backup+restore, rollback drill, GitOps approval. Source candidate cannot be called end-to-end finished; no main merge or Production release.
- No applied migration edits, no DB writes, no Production/Test promotion, no branch deletion, no scheduling changes. Source rollback is to leave the new Draft PR unmerged; all original A recovery bundle/patch and other developer refs preserved.
- Starting remote branch count **5**. Final count and PR URL will be recorded in GitHub PR discussion after push. The initial cleanup incident #1016 remains open; do not attribute it to a particular actor without evidence.

## 한국어 결과
P2P 송금에 CSRF 보호와 재시도 UUID 보존, 정확한 38자리 금액 전달, 실제 원장 영수증 확인을 추가했습니다. 로컬 테스트·린트·타입·빌드·의존성 보안은 통과했지만, 백엔드 알림 중복 위험(#1025)과 DB 최소권한 위반(#993), 공식 Test 미검증 때문에 **운영 배포는 보류**합니다.

## 한국어 요약
P2P 송금의 CSRF 누락, 재시도 때 UUID 재생성, 허위 영수증 문제를 독립 브랜치에서 재현·수정할 계획입니다. DB의 별도 알림 중복 위험과 최소권한 문제는 검증 전 운영 차단입니다.
