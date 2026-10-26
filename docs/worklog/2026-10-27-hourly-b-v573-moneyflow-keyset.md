# Backend B v573 — admin money-flow posting keyset integrity (DRAFT / RELEASE HOLD)

- Date: 2026-10-27 KST; start main `0fe614b2ca1a7bc0df540514e54db78130479e2a`; independent branch `auto/hourly-b-moneyflow-keyset-v573-20261027-0635` from origin/main.
- Evidence: `getUserMoneyFlows` originally ordered only by `t.created_at DESC`, issued timestamp-only cursors and filtered subsequent pages with `t.created_at < cursor`. Multiple `ledger_postings` from one `ledger_transaction` share timestamp; pagination may omit sibling postings. PostgreSQL microseconds were also discarded by `Date.toISOString` in the original cursor. This is an audit-view completeness issue, not a confirmed financial ledger loss.
- Fix: stable `(created_at, transaction UUID, posting UUID)` descending order; versioned `mf1.` base64url cursor preserves PostgreSQL timestamptz::text microseconds, validated UUIDs and search/type/direction filter fingerprint. Invalid/legacy/mismatched cursors return HTTP 400. Existing admin-only GET path, item schema and summary unchanged; no schema migration, no ledger/WLD writes.
- TDD: 4 regression tests RED before code; same 4 GREEN after. Synthetic isolated PostgreSQL 17.11 fixture with 4 postings, same timestamp and adjacent microsecond timestamp; 2/2 real DB PASS, read-only role UPDATE denied 42501. Synthetic DB container removed. No Production-connected DB accessed.
- Concurrent work: C #1479 modifies frontend money-flow screen; B #1487/#1490 modify other treasury repository methods. Do not merge until coordinated review. Existing A/C/Gemini/QA worktrees and branches untouched.
- Release blockers at start: root filesystem 100% (~926 MiB free); full dependency audit Critical/High; historical migration checksum mismatches #1469; official Test exact-SHA and authenticated finance E2E not performed. Production HOLD.

## Local verification evidence (before PR)
- Root `pnpm typecheck`: PASS; `pnpm lint`: PASS with 0 errors / 1,131 pre-existing warnings.
- Root `pnpm test`: PASS, Backend 1,330 passed / 400 skipped, Frontend 1,423 passed, Contract 38 passed, DB package 15 passed / 3 skipped; app API contract generation/check PASS.
- Root `pnpm build`: first FAIL because shared node_modules symlink confused Next/Turbopack resolution; isolated offline frozen-lockfile `pnpm install --config.package-import-method=hardlink` then **default Turbopack build PASS**. No dependency version or lockfile changes.
- `pnpm bot:test`: first FAIL because bot node_modules absent; linked existing read-only dependency directory then **8/8 PASS**. No bot code changes.
- Repository security scan, control-byte and Prisma-migration guards: PASS. `pnpm audit --prod`: PASS (0 known vulnerabilities); full `pnpm audit`: FAIL (2 critical, 8 high, 11 moderate, 3 low); bot `npm audit`: FAIL (1 critical, 5 high). No bypass or suppression.
- Real isolated PostgreSQL fixture was recreated after removal of hardcoded test-role password from tracked SQL; local-only 127.0.0.1:5598, 2/2 PASS, ephemeral container removed.
- Official Test exact-SHA authenticated financial E2E, complete migration parity, and release GitOps gates are **not satisfied**. No main merge, no Test/Production mutation.
