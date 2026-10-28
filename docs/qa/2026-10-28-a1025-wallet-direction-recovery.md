# QA — Development A wallet direction recovery (2026-10-28 10:25 KST)

## Scope and provenance
- Recovered member wallet direction filter from **CLOSED / UNMERGED** PR #1647 (head `ed5289f3cabb28fd00c863c96ae5cb1358356920`) into a new worktree/branch from main `a28bed9aa40ff74d492824ae12892a7d52132fdd`.
- PostgreSQL owner-scoped signed ledger sum is filtered with bound `direction` (`in`/`out`/`neutral`) in SQL HAVING **before** the 51-row lookahead. Period and direction compose; invalid direction fails HTTP 400. Big integer amounts stay decimal strings.
- Browser exposes all/in/out/neutral with canonical allowlisted URLs and 44px min-height controls; Android app-api protects wallet, existing bank and chat responses with `private, no-store`.
- No migration, financial posting, grant, production data, or schema mutation.

## Verified gates (pre-final documentation checkpoint)
- RED: Backend wallet 5 failed/3 passed; Frontend wallet 1 failed/3 passed, after building the shared contract.
- GREEN: Backend wallet 8/8; Frontend wallet + Android gateway 30/30.
- Real isolated PostgreSQL 17.11 synthetic owner/ledger test 2/2 PASS; container destroyed. **Not full applied-migration/ACL/E2E proof.**
- Backend full 1,930 PASS / 442 SKIP; database package 45 PASS / 3 SKIP; Bot after isolated dependency install 11 PASS.
- Frontend full **1 FAIL / 1,866 PASS**: `src/app/admin/blog/admin-blog-client.test.tsx` expects text `편집 검토 대기` absent from rendered admin blog UI. The admin blog component and test are **unchanged relative to main**; independent focused reproduction FAIL. This is not waived.
- Root `pnpm test` TIMEOUT (310 seconds; exit 124), during frontend tests; no aggregate PASS.
- Full ESLint 0 errors / 1,102 warnings (first attempt timed out; retry PASS); changed-file ESLint PASS. Typecheck PASS, Android API contract 180 PASS, Backend build PASS, default Next build PASS, root high+ dependency audit PASS (3 low / 9 moderate), Bot high+ audit PASS.
- Accessibility: 44px minimum-height filters and accessible nav/current-page attributes inspected; full WCAG/mobile/browser audit NOT RUN. SEO: private wallet page metadata/noindex preserved; full SEO crawler audit NOT RUN.
- Official Test exact-SHA authenticated E2E, full real-DB least privilege, independent restore and GitOps release gate: BLOCKED. Test symlink target missing; public Test version `6f697e74b7bf0cd1e4521d36534cfd9c140f8010` differs. Public Production version `unknown` and `/srv/moneyverse` target missing. No release authorization.

## Workflow integrity
- P0 #1663 remains OPEN: 352 locally protected unmerged closed-PR heads. This run did not close, delete, reopen, merge, deploy, or mutate other workers' branches. Recovery ref for #1647 matches original SHA.
- Open PR inventory at start: 8; remote live heads at start: 10 including main. Recovery refs: 352. Changes are isolated; original #1647 remains closed for audit.
- **Verdict: PARTIAL / BLOCKED. Production RELEASE HOLD.**
