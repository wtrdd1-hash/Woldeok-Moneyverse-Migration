# Changelog — v2026.10.17.749

**English canonical** | [한국어](2026-10-17-dual-disk-safety-v749.ko.md)
**Type:** Host safe cleanup already executed; opt-in read-only operator tooling and documented release gate review. No production app source release.

### Changes
- Removed exactly 15 historical, regenerable Next.js build cache directories (not app source, production Test/Prod artifacts, protected database, backups or user balances).
- Reclaimed 7,176,216,576 bytes on 100GB root filesystem; occupancy 92% → 85%. Preserved 200GB data filesystem; future isolated development workspace now located on this disk.
- New `ops/storage/dual-disk-check.mjs` provides read-only JSON/human root-vs-data visibility and strict pressure error code, with `ops/storage/dual-disk-check.test.mjs` (5 passed tests).
- Integrated unit tests into package.json test entrypoint.
- Bilingual operation plan, release gate evidence, worklog, internal and GitHub update.
- Financial release snapshot remained BLOCKED: 5 core app table DML grants and 19 historic opening projection mismatches. Production v717 and Test v735.2 identity tests separately passed. **No Production cutover**.

**Safe rollback:** Regenerate removed `.next` outputs only within their retired isolated worktrees if independently needed; tool is read-only. Restoring original code/config is not required because active services and DB were not changed. Database restoration is neither needed nor authorized by this cleanup.
