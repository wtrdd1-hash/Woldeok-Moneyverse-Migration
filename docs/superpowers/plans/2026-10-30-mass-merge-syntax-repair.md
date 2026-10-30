# P0 Mass Merge Syntax Repair — implementation plan

1. Inventory main SHA, PR/branch counts and CI; preserve provenance in incident #2031.
2. RED: run TypeScript parser/typecheck on unmodified merged main; capture exact failing file/line evidence.
3. GREEN: remove only provably duplicated syntax from merged files, without changing behavior, database schema, authentication or finance rules.
4. Rerun typecheck and relevant tests, build, lint, mobile API contract, security and database checks; report failures and skips honestly.
5. Recheck latest main and integrated planning; if clean and full gates PASS, open PR and consider integration. Otherwise Draft/HOLD with exact blockers. No Production deployment without independent Test/GitOps evidence.
