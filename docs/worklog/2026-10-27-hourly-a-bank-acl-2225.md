# Development A — Private Bank Credit Evidence and Loan ACL (2026-10-27 22:25 KST)

**Engineering candidate / Draft / HOLD; not merged, deployed or activated.** Canonical main at start, middle and pre-commit: `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c`. English integrated plan SHA256 `506c291f...`; Korean `630a8293...`. Read AGENTS, README, both living plans, integrated plans, QA v1325, prior A worklogs and open PR/branch/CI inventory.

## Scope and dependency preservation

- Separate worktree `auto/hourly-a-bank-acl-20261027-2225` from current main. Reuse the **unmerged** migration 280→282 correction from Draft #1564 and bank private-cache implementation from Draft #1580; do not claim either was merged. Preserve their branches, other agents' work and unique commits. The cache implementation's predecessor worklog was not transplanted because it conflicted; this document records the consolidated evidence.
- P0 scoped privacy repair: add forward-only, unapplied migration `283-bank-loan-privacy-boundary.sql`. A migrator-owned `bank_my_credit_facts(p_actor)` returns bounded actor-derived account age, job level, repayment and overdue counts, then revokes all direct app/PUBLIC grants on the two private loan tables. The backend repository now calls this function rather than querying `users` and private loan tables as `moneyverse_app`. No applied migration was edited.
- HTTP privacy: bank loan, standing and credit-rating responses declare `Cache-Control: private, no-store`; Android app-api bank/banking responses override upstream cache policy even on errors. The member bank page adds localized Korean/English private-data context while retaining `force-dynamic`, noindex and existing exact integer-string WLD math. No changes to loan posting, ledger, idempotency, authentication guards or finance policy.

## Evidence and blockers

- RED→GREEN: backend credit-facts query 1 RED→3 GREEN; SQL contract 1 RED→1 GREEN; frontend privacy notice import RED→2 GREEN; standing/credit-rating cache headers 2 RED→2 GREEN. Previous cache candidate contributes backend HTTP and Android gateway regression tests.
- Real isolated PostgreSQL 17: applied core and migrations through 283, synthetic actor created in a transaction then `SET LOCAL ROLE moneyverse_app` verified 4-day credit evidence and rolled back; app role loan SELECT/UPDATE false, function EXECUTE true; backend ACL tests 3 PASS. The disposable container was removed. **No Production-linked DB writes.**
- Initial local gates: root test 38 contract, 22 DB (3 skipped), 1,546 backend (415 skipped), 1,492 frontend; typecheck, lint, backend build, Webpack build, Android contract and production-only dependency audit PASS. Bot 8 PASS after installing its separate dependencies. Full audit FAIL (2 Critical/8 High), bot audit FAIL (1 Critical/5 High). Final SHA verification and CI to be attached to PR separately; do not infer release readiness from earlier gates.
- Production-linked development database is not isolated: schema migrations stop at 268 and `moneyverse_app` still has direct SELECT/UPDATE on `virtual_bank_loans` there. The new migration has **not** been applied to it. Broad app-role direct DML and PUBLIC grants from P0 #993 remain outside this two-table repair.
- Official Test public SHA `6f697e74...`, Production `6a989b5a...` differ from the candidate; Test immutable release identity and authenticated exact-SHA E2E, full security audit, independent restore, accessibility/SEO browser checks and GitOps gate are not satisfied. **No main merge, Test/Production deployment, live SQL writes, feature activation, ledger change, rollback or branch deletion.**

## Release and rollback

- Keep PR Draft/hold. Before merge, discard only this candidate after preserving unique changes; after an approved merge, use a reviewed forward-only compensating migration if needed, never edit applied SQL. An application code revert is insufficient to reverse a live database grant change; no live migration may run without isolated exact-SHA verification and rollback review.
