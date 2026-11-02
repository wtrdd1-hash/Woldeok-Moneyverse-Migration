# v2026.11.02.1624 — Verified blog publisher runtime dependency bundle (EN)

## Before — 2026-11-02 KST
- Owner requested recovery of automatic two-hour blog creation. Live `moneyverse-verified-blog-v1419.timer` was enabled, but its one-shot worker failed with `MODULE_NOT_FOUND: reflect-metadata`. The published worker `backend/node_modules/reflect-metadata` pointed to a missing pnpm virtual store in an older release that had already been removed.
- Governance: reviewed `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, current two-hour blog specification, and v1419 worklog. Published articles must not be automatically withdrawn. The full finance scheduler stays disabled. Main at start `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`.
- Other agents have uncommitted changes in the shared repository. Created isolated branch `fix/blog-worker-dependency-bundle-20261102` from main; no shared checkout editing.

## Midpoint
- Existing worker compiled JS SHA256 is `b27fa862cd924b951afb8b98a6ef7ffc33a082c69ff5b01fecf787581777c746` in both source and old production release. The locked backend manifest matches exactly.
- New `ops/blog/assemble-verified-blog-worker.sh` builds a **self-contained** new release from trusted matching workspace modules and unchanged worker binary; refuses manifest/binary mismatch, missing runtime links or insufficient disk. Does not modify current pointer or database. Candidate location `/srv/moneyverse-data/releases/blog-worker-v2026.11.02.1624-pinned`.
- Verified standalone candidate: isolated resolution of `reflect-metadata`, `pg`, `@moneyverse/contract`, load-only worker import and publication window computation PASS. Prior failed release is preserved.
- Backend worker + rotation unit tests: 10/10 PASS. Next: current main check, official Test reachability, zero-downtime worker-only pointer swap, live run/result and public verified article API receipt check. Do not claim successful publication until verified.

## Final
- See final on-host operation record and GitHub PR/issue for exact production result. No financial/treasury data, Nginx, frontend or post status is touched by this dependency bundle.
