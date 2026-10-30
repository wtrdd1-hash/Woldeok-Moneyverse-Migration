# Candidate release gate — unread-only notifications (HOLD)

- Date: 2026-10-29 KST; Draft PR #1893, branch `auto/hourly-a-notification-search-20261029-2125`.
- Base main at final rebase: `7ba69348350cea054544dd4c17d782ed8dcf19fb`; tested code SHA before final report commit `a1e7d5991133a658573b8ce94c476074c609cd73`.
- Targeted tests: 33 frontend notification, 10 backend notification, 56 database (4 skipped), PostgreSQL 17.11 synthetic owner isolation, API contract, bot 11, build, typecheck, security PASS.
- Blocking gates: full lint 3 errors, backend suite 240 failures, frontend suite 61 failures, full isolated SQL replay incomplete at migration 020, exact-SHA CI FAIL and candidate image SKIPPED. No authenticated official Test exact-SHA, independent backup restore, ledger provenance, migration checksum or GitOps release approval.
- Live Test/Production version: `c2129625aa6629c616fb31ce790950618b8d92b2`, not candidate. No deployment, migration, ledger mutation or rollback was performed.
- Branches: 2 -> 5; open PRs: 1 -> 4; deleted 0; closed 0. All four non-main branches retained due unmerged unique commits.
- **Decision: HOLD.** Rollback is not needed because this candidate was never deployed. If future validation fails after deployment, use the approved GitOps rollback only after evidence and independent authorization.
