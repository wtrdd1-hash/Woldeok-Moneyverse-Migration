# C v1160 — GitHub PR #1864 release evidence

- **Classification:** runtime P0 partial containment; DRAFT/HOLD, not docs-only, not approved for merge.
- **Base main:** `9ebc5613845ba2e8179a0051e86db996593c8a19` (re-fetched start/middle/end).
- **Implementation:** retain transfer key/payload on ambiguous responses and across reload, lock command and same-key retry, validate backend transaction UUID, isolate browser state per member, stable push IDs and client toast dedupe, accessible pending/validation warnings.
- **Local evidence:** full lint/typecheck/build/app-api and full real PostgreSQL backend/frontend/contract/DB/bot suites passed after repairing isolated worktree-only dependency installation; 293 migrations through 294. Exact counts in canonical worklog.
- **Blocking evidence:** audit 12 total (3 low/9 moderate; prod moderate 1), no owner-only durable read-only transfer receipt endpoint, no 100-concurrent same-key proof, no server exactly-once push/outbox, official Test/Production SHA mismatch (`c2129625aa6629c616fb31ce790950618b8d92b2`).
- **GitHub CI:** follow the final PR head/checks; do not claim green from a previous commit. No main merge, GitOps, Production promotion or rollback.
- **Retention:** preserve PR #1864 and all other unique unmerged work. QA #1854 remains open.
