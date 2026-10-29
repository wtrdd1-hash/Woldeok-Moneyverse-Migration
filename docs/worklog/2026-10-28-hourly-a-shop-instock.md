# A2350 — Verified in-stock shop catalogue filter (Draft / RELEASE HOLD)
## Before work
- 2026-10-28 23:54 KST; main 35971c600f25869c96f1c666d4b9f58927202730, isolated auto/hourly-a-shop-instock-20261028-2350.
- Existing PostgreSQL SECURITY DEFINER shop_catalog_list_v2(uuid) is the source of member-visible stock quantity; null means unlimited and 0 means sold out. The DB already excludes inactive/out-of-window listings. No migration, direct table privilege, financial command or ledger mutation.
- Other A shop price/category/stock filter Draft PRs are not merged; preserve their heads. This feature is only the available-stock toggle, not sorting or categories.
- Plan: RED backend stock filter validation; GREEN backend query; RED/GREEN web filter and Android query/cache regression; targeted/full gates and isolated PG read-only evidence; no merge without exact-SHA Test/CI/restore.
## In progress
- Tests authored first; verification evidence follows.
## Finished — 2026-10-29 00:07 KST
- Targeted GREEN: backend stock filter/controller 6 PASS; web stock query and Android gateway 35 PASS, including mobile narrow-layout regression.
- Full first run: 58 backend files failed because isolated worktree dependency link omitted undici. Repaired only this worktree's dependency links; second run backend 1,945 PASS / 440 SKIP, database 46 PASS / 4 SKIP; frontend 1,873 PASS / 1 FAIL due the pre-existing responsive source assertion expecting a class substring. Kept the class substring while retaining flex-wrap, and targeted regression PASS. Final full-suite exact-SHA rerun is required.
- Typecheck initially failed because test fetchSpy had no typed input; fixed and reran PASS. Lint PASS (0 errors, existing warnings).
- First frontend build failed at an explicitly low 1 GiB heap. Retried with 2 GiB: PASS. Removed only this worktree's 943 MiB generated .next output afterward to protect disk.
- Android contract 180 endpoints PASS. Bot test first blocked by missing local dependencies, installed with offline npm ci and 11 PASS. Root security audit 0 High/Critical (1 Moderate); bot audit 0 vulnerabilities.
- Network-isolated PostgreSQL 17.11 synthetic role/stock/owner/large-integer/denied direct table SELECT PASS. This is not a full production schema ACL or official Test E2E.
- Mid-work main unchanged at 35971c600f25869c96f1c666d4b9f58927202730; source-of-truth planning EN/KO rechecked. 78 remote branches including main, 75 Draft PRs, 3 conflicting; 77 non-main heads audited, 70 with branch-unique unmerged commits, 166 unique commits across branches, 7 all-shared branches not certified redundant; 352/352 incident recovery refs valid. Deleted none.
- DATA DISK 99% with 3.3 GiB free; no backup, volume, remote branch, other worker state, or active release removed.
- No migration, ledger, feature activation, Test/Production deployment or main merge. Production RELEASE HOLD: historical 18,000 WLD ledger drift, broad app role DML, 3 PUBLIC bank function grants, migration checksum drift, backup restore and exact-SHA authenticated Test remain unverified.
- Final SHA and GitHub CI to be recorded in PR comments after exact-SHA verification. No local PASS alone authorizes merge or deployment.
- RED: backend test failed for missing stock filter module; app gateway test failed because upstream public cache header was preserved. GREEN implementation adds strict stock validation, server filtering of SECURITY DEFINER read results, web GET checkbox/search preservation, and app gateway no-store. Next: run tests and security gates.
