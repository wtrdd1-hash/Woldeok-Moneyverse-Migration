# Backend B v740 — P0 critical app-role privilege boundary

## Before work — 2026-11-02 03:39 KST

- Canonical `origin/main`: `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`.
- Isolated worktree: `auto/hourly-b-v740-core-acl-20261102-0335`; shared dirty root and other agents untouched.
- Reviewed `AGENTS.md`, `README.md`, English and Korean `PROJECT_PLAN`, QA v1453, open PRs and CI. No overlapping core privilege migration PR found at start.
- Read-only DEV PostgreSQL 17.11 evidence: `moneyverse_app` has direct SELECT/INSERT/UPDATE/DELETE on `account_balances`, `accounts`, `daily_rewards`, `outbox_events`, `users`, `identities`, and `user_items`. Their table owner is `postgres`; app is not superuser and has no inherited membership. This is DEV, **not evidence of Production exploitation**.
- P0 #993 tracks broader app-role ACL drift, 5 applied checksum mismatches, and additional 180+ writable tables. This change is a bounded mitigation, **not a full closure of #993**.

## In progress — implementation and verification

- Test-first: two Vitest checks failed because new migration was absent; then passed after implementation.
- New forward-only migration `324-core-sensitive-app-acl.sql` revokes all table privileges from `PUBLIC` and `moneyverse_app` for seven sensitive tables, and restores the four historical SELECT-only economy read models. No existing migration, table row, ledger or WLD balance is edited.
- New SQL/isolated PostgreSQL regression deliberately reintroduces observed direct grants in a disposable instance after canonical migrations 002–323, then verifies migration 324 removes all effective direct DML and preserves the two scoped `SECURITY DEFINER` functions (`auth_session_has_current_consent`, `shop_my_items_v2`).
- Disposable PostgreSQL 17.11 replay: 322 baseline migrations (002–323) plus candidate 324 (323 total); privilege and scoped-function regression PASS; isolated container removed. No shared DB writes.
- Database tests: 64 PASS / 5 SKIP. Contract tests: 41 PASS. Backend `NODE_ENV=test`: 2,980 PASS / 518 SKIP. Backend `NODE_ENV=production`: 2,978 PASS / 2 FAIL / 518 SKIP (pre-existing profile HTTP fixture 401 vs 200; Draft #2265).

## Finished / release decision

- Lint: PASS, 0 errors / 1,027 existing warnings. Typecheck: PASS. Full Backend/Frontend build: PASS.
- Frontend tests: 2,922 PASS. Mobile App API contract: 184 endpoints / 683 methods matched. Security/release/backup focused policy: 22 PASS.
- Production dependency audit: 0 known advisories; full development dependency audit: FAIL, 9 advisories (8 moderate / 1 low).
- Root `pnpm test`: FAIL on the existing Backend profile HTTP fixture (2 expected 200 vs actual 401), same as standalone production-mode run; remaining root suite did not complete. No passing claim for root test.
- Official Test exact-candidate SHA, authenticated user E2E, independent external restore, and full Production app-role ACL attestation: NOT RUN / BLOCKED.
- Remote CI is checked after push; no CI success is inferred from local tests.
- **Release HOLD:** the wider DEV app-role privilege drift, applied checksum mismatches, full Production permission audit, official Test exact candidate SHA, authenticated E2E, and independent restore remain uncertified.
- No main merge, shared Test migration, Production promotion, service restart, user transaction, or remote branch cleanup is authorized by this task.
