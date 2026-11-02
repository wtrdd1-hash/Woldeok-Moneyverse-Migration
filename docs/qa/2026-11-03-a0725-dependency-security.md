# A 07:25 Dependency security remediation — QA (2026-11-03)

**Scope:** isolated `auto/hourly-a-20261103-0725-security-audit` based on `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`; no applied migration, DB role, ledger, application runtime or deployed service modified.

## Verified change
- Four workspaces now declare Vitest 4.1.12 instead of 4.1.11; pnpm lockfile resolves patched `@vitest/mocker` 4.1.12.
- Two existing root overrides pinned to vulnerable brace-expansion 1.1.20 and 5.0.11; now pinned to 1.1.21 and 5.0.12.
- Security floor regression asserts Vitest 4.1.12 and patched brace-expansion floors and refuses vulnerable mocker 4.1.11.
- `pnpm audit` baseline: **9 findings** (8 moderate, 1 low); after lockfile-only regeneration: **3 findings** (2 moderate minimatch, 1 low deepmerge). The 3 remaining findings are **NOT fixed**. `deepmerge` advisory lists no patched release; forcing minimatch 3/10 to major 11 requires compatibility review.
- `pnpm audit --prod` reports zero findings in this dependency snapshot. This is not equivalent to a full audit PASS.

## Actual checks / limitations
- Security node:test: 3 PASS; broader security scripts PASS.
- Workspace typecheck: PASS. Database unit tests: 72 PASS / 5 SKIP. Contract unit tests: 41 PASS.
- Backend focused Vitest 4.1.12: 8 PASS; Frontend focused Vitest 4.1.12: 8 PASS.
- Backend build PASS. Android app API contract check: 184 endpoint contracts PASS.
- Backend full test and Frontend full test exceeded separate 105-second execution caps under shared-host load: **TIMEOUT, NOT PASS**.
- Frontend Next.js build generated 602 static pages, then exceeded an 85-second cap while collecting build traces: **TIMEOUT, NOT PASS**.
- Full ESLint run interrupted before a result; targeted .mjs file was ignored by ESLint configuration, so no lint PASS is claimed.
- Real PostgreSQL isolated Test, authenticated user E2E, accessibility, SEO, official Test exact-SHA, independent restore, GitOps and rollback verification: **BLOCKED / NOT EXECUTED**. No schema or runtime changes to test against a real DB.
- 07:36 KST public HTTP check: Production `/ko` HTTP 500 and `/en` HTTP 500, Test `/ko` HTTP 200. Existing locale repair Draft #2552 remains unmerged. Root filesystem ~97% used.

**Decision: DRAFT/HOLD.** Do not merge to main or deploy. Never treat fewer advisory findings as release authorization. Preserve all unrelated branches and PRs.
