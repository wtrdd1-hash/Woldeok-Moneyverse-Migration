# C v1294 — Owner Wallet Overview Source Integrity

## START — 2026-11-02 11:40 KST
- Authority: `origin/main` a8541927c3a351d980454c66e95a3356c47e0722. Independent branch `auto/hourly-c-wallet-overview-source-v1294-20261102-1140` and worktree. Shared main has a pre-existing uncommitted `implementation_plan.md`; left untouched.
- MiniPC: Debian 13; seven core services active; DEV PostgreSQL connected. Read AGENTS, root README, Korean README, canonical EN/KO planning, active PRs and QA1461. Planning docs are historical and do not authorize feature claims.
- QA1461: `route-ledger.exit=1`, `audit-all.exit=1`; other major local gates pass. All release gates are required; no merge or production without them.
- P1 reproduced in source: `wallet/page.tsx` trusts an unchecked generic API result; `BigInt(balances.cash.availableAmount || '0')` throws on malformed values and silently treats an empty balance as zero. The owner wallet is an authoritative financial surface. Existing backend `GET /api/v1/wallet` is session+consent guarded, uses PostgreSQL wallet functions; no DB/ledger write needed.
- Avoid overlap: C #2418 changes wallet activity, not wallet overview. C #2459 delivery, #2462 stock alerts, A board, B CSRF; none touch wallet overview.

## PLAN
- [x] Write failing tests for strict owner wallet overview parser, including canonical WLD and pocket sum, malformed payload and transaction proof.
- [x] Implement minimal fail-closed parsing in wallet overview page; preserve existing auth/contract and accessible retry/unavailable state.
- [ ] Verify focused tests, build/lint/typecheck, unit/integration/security/app-api/isolated PostgreSQL and official E2E gates as possible.
- [ ] Re-fetch main and planning, inspect CI and PR before merge; HOLD if any gate fails.

## MID — 2026-11-02 11:44 KST
- Re-fetched main: `a8541927c3a351d980454c66e95a3356c47e0722` unchanged; revisited EN/KO integrated plan. Other workers untouched.
- RED: two failing parser assertions (verified nonzero/zero), two failing page integration tests (malformed WLD BigInt exception, missing retry), and two failing wallet HTTP privacy rules. GREEN: 25 focused Vitest tests passed (3 files).
- Implementation: strict owner wallet response parser, exact BigInt pocket sum and transaction shape proof, accessible unavailable/retry UI; private no-store/noindex/no-referrer headers for wallet and localized routes. Existing backend session/consent and PostgreSQL read contracts unchanged.
- Next: exact-head build/lint/typecheck/unit/DB/security/app-api/E2E gates; independent Test/Production prohibited until PASS.


## END
Pending.
