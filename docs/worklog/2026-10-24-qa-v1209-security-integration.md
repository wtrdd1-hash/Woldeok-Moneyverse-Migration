# QA v1209 — Security integration candidate (DRAFT / HOLD)

- Source baseline: main 54d5140ddb49dd3e2193a2f82b71a6a0a57cfede (2026-10-24 06:26 KST).
- Isolation: qa/v1209-independent-gate-audit-20261024-0624 dedicated worktree. Preserve all Gemini/developer branches and original Draft PRs.
- Existing patches cherry-picked with provenance: PR #1061 wallet CSV formula-neutralization and deterministic blog tests; PR #1069 Next.js 16.4.2 upgrade and Next advisory floor test. Original PRs remain unmerged.
- New security remediation: direct backend Zod upgraded from locked 4.4.3 to 4.6.7 for GHSA-mrhx-c7xc-m3w5. New test first failed against vulnerable manifest and lockfile (2/2 RED), then passed after lockfile update (2/2 GREEN). Root test script runs the guard.
- Verified local gates: lint, typecheck, build, root test PASS; frontend 1,386/1,386, backend 1,313 PASS/398 SKIP, DB package 15 PASS/3 SKIP, contract 38 PASS. No authenticated Test financial E2E or exact-SHA GitHub CI PASS claim.
- Security: production-only dependency audit PASS with no known advisories; full audit FAIL with 20 advisories (2 Critical, 8 High, 9 Moderate, 1 Low), principally dev-only tinypool/Vite/fast-uri/brace-expansion/transitive Zod. See #1075. Do not bypass audit.
- Production hold: Production-connected PostgreSQL still has 235/241 tables with app-role UPDATE+DELETE, bank PUBLIC EXECUTE 3, migration 266 checksum mismatch, dev/production DB shared, port 5433 wildcard binding. Ledger 877 transactions/1,784 postings; zero imbalance, orphan postings, account-balance mismatches using debit-positive convention. Test DB wdmv_v761_test_acl has 236 tables, 10 app DML tables, migration 266 matches source; parity insufficient.
- Operations: Production/Test public HTTP routes responded as recorded in QA artifacts; bank redirects 307 to login. Encrypted systemd backup succeeded at 06:27 KST; isolated restore and authenticated E2E unverified.
- Release gate: Draft PR only; no main merge, Test deployment, Production promotion, shared DB writes, branch deletion or service restart.
