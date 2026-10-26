# Backend B v564 — literal wallet recipient search / privacy
## Before work
- 2026-10-26 21:45 KST. Base main: `0fe614b2ca1a7bc0df540514e54db78130479e2a`; independent branch/worktree.
- Read AGENTS.md, README, English and Korean living plans, QA v1300, current open PRs/CI and relevant superpowers skills.
- Selected bounded P1 backend defect: wallet recipient search interpolates user input into SQL ILIKE wildcard pattern. A request for `%` or `_` can enumerate unrelated active member display names (10 per request), despite a literal-name search contract.
- Existing A/C/QA PRs are preserved. No migration, role grant, API route or finance write is authorized.
- Design: preserve substring/case-insensitive name matching and active-only/other-member/limit=10 boundaries; use literal substring SQL semantics, stable ordering, and a bounded input length. RED/GREEN repository regression and isolated PostgreSQL proof.
- [ ] RED regression; [ ] implement; [ ] targeted and full verification; [ ] mid-work main/plan recheck; [ ] PR + final evidence; [ ] Test/Production release gates.
## In progress
- Pending.
## Finished
- Pending. Production HOLD pending exact-SHA gates.
### TDD checkpoint
- RED: 7/7 focused cases failed on main; SQL used `ILIKE` with caller-supplied wildcard syntax, allowed overlong query, and had nondeterministic LIMIT.
- GREEN: literal case-insensitive `strpos(lower(...),lower($1))` with parameterized text, bounded 64-code-unit query, active-only filter, exclusion of requester, stable ordering and LIMIT 10.
- No route, DTO, database schema, grant, WLD or ledger changes.
## In progress — verification
- Final main re-fetched at 21:53 KST: `0fe614b2ca1a7bc0df540514e54db78130479e2a`, unchanged; English and Korean plans rechecked.
- Focused RED 7/7 failed before fix, GREEN 7/7 passed. Wallet E2E/precision/search 30/30 PASS.
- Isolated PostgreSQL 17.11, `--network none`, ephemeral synthetic users/profiles: 5/5 literal wildcard/backslash, inactive/actor exclusion, Unicode, stable order PASS. First harness expected wrong locale ordering; corrected expectation and reran successfully. Container removed. **Not full project migration/app-role ACL or official Test.**
- `pnpm typecheck` PASS; `pnpm test` PASS (contract 38, DB 15 PASS/3 SKIP, backend 1333 PASS/398 SKIP, frontend 1423 PASS); `pnpm lint` PASS (0 errors, 1131 warnings); `pnpm build` PASS; API contract 179 endpoints/638 methods PASS.
- Repository security, control-byte, Prisma migration checks PASS; release-policy 18/18 PASS; Production-only pnpm audit 0 known vulnerabilities PASS.
- **BLOCKED:** full pnpm audit 2 Critical/8 High/11 Moderate/3 Low; bot npm audit 1 Critical/5 High; official isolated Test exact-SHA/backend/API/DB/authenticated finance E2E not executed; full migration/ACL/restore/independent GitOps not verified.
- Bot test initially failed because the isolated worktree had no bot npm dependencies; linked existing read-only test dependencies, reran 8/8 PASS. No other worker source or working tree changed.
- Official read-only versions: Test `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production `6a989b5ac0c6155587d43426d64f6def6b62c917`. Neither is this candidate.
- MiniPC Debian 13.6 root filesystem 98% used (~2.3GiB free); data volume 90% used (~21GiB free). No cleanup of unique worker branches or worktrees.
## Finished — Draft PR only
- Scope: `backend/src/wallet/wallet.repository.ts` and new `wallet-recipient-search.test.ts`. Existing `GET /api/v1/wallet/recipients/search` response shape unchanged; case-insensitive literal substring search, max 64 characters, deterministic 10-result cap. No database schema/migration, ledger or money mutation.
- Approval, exact-SHA Test, all security and GitOps gates incomplete. **DO NOT MERGE / DO NOT DEPLOY**. Existing A/B/C/planning/QA schedules and workspaces untouched.
- Candidate commit SHA and GitHub CI run URLs are recorded in the PR and host-local end log.
