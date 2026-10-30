# Repair: generated mobile API JSON contract classification

- RED: existing release classifier treats `docs/mobile-api-contract.json` as UNKNOWN even when generated and committed with runtime changes, blocking API contract changes. Reproduced on PR #1985 and 2 failing policy tests.
- GREEN: narrowly classify exactly this generated JSON as RUNTIME_RELEVANT, never DOCS_ONLY. Keep all other JSON under docs UNKNOWN. Preserve 100644 blob/symlink checks for the exception, bind it to applicationSourceSha, bump classifier version to v2 and make Production validator require v2 (old release evidence fails closed).
- Verification: node --test classifier and release policy suite; GitHub policy CI. No runtime deployment or merge without independent exact-SHA Test and release gates.
- Rollback: revert repair PR; no database or runtime changes. Feature PR #1985 remains Draft/HOLD until this is independently approved and merged.
