# QA — A1050 support recent-subject search recovery (English authority)

**Decision:** PARTIAL / RELEASE HOLD. Previous PR #1652 CLOSED without merge; its unique feature is reconstructed on fresh main-based worktree. No production data was modified.

- Base main `a28bed9aa40ff74d492824ae12892a7d52132fdd`; branch `auto/hourly-a-support-search-recovery-20261028-1050`.
- TDD RED: backend 2 FAIL, web 2 FAIL, Android gateway 1 FAIL. GREEN: backend 3 PASS, web + gateway 28 PASS; 44px touch-target RED then GREEN; SEO `noindex` existing metadata checked.
- Full backend: 1,930 PASS / 440 SKIP. Full frontend: 1,867 PASS / **1 FAIL** (`admin-blog-client.test.tsx`, outside this change). Database: 45 PASS / 3 SKIP. Bot: 11 PASS after isolated npm ci.
- `pnpm lint`: 0 errors, 1,102 warnings. Typecheck, root build, 180-endpoint app-api contract: PASS. Root high+ audit and bot high+ audit: PASS; root audit retains low/moderate findings.
- PostgreSQL 17.11 disposable container: exact `support_my_threads` function body from immutable migration 196 with synthetic schema; latest-100, literal `%_`, older exclusion, owner rows, legacy 50 and denied direct SELECT: PASS. **Not** full production schema, real app-role identity binding or complete DB privilege certification.
- `pnpm test`: FAIL on the same frontend admin-blog assertion. Authenticated Test E2E, browser a11y/SEO sweep, backup restore, exact SHA Test and GitOps promotion: BLOCKED.
- No migrations, role grants, ledger writes, Test/Production deployments, branch deletions or rollbacks.

**Before integration:** repair baseline blog failure on independent branch, rerun exact SHA full gates, confirm main, then run authenticated Test/DB/backup/GitOps release gates. Do not merge without PASS evidence.
