# B v836 — Holdings ACL regression detector correctness

## Before work
- [x] Check server health, main SHA, AGENTS, README, EN/KO planning, active PR/CI, and QA.
- [x] Isolate worktree from `origin/main` and import unmerged ACL migration 342 from Draft PR #2771.
- [x] Reproduce malformed regex escaping in the pending test: `/\\s/` matches a literal backslash-s rather than whitespace; the test used literal `\\n` rather than newline.

## In progress
- [x] Fix regex to match actual SQL whitespace and line breaks; retain the unchanged SQL migration from #2771.
- [x] Add real-newline and flexible-whitespace regression assertions.
- [x] Complete database tests (94 pass, 5 skipped), TypeScript typecheck, and diff check. CI and official Test exact-SHA remain pending.

## Finished / release
- Local verification passed. CI, full-schema PostgreSQL, backend auth/E2E, official Test exact-SHA, and GitOps release gates remain unverified. RELEASE HOLD. No shared DB writes, merge, or production promotion.
