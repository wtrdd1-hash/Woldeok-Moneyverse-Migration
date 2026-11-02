# Planning v1658 — F675-220 unread enrollment and replay integrity

- Status: DOCUMENTATION VERIFIED LOCALLY / DOCUMENTATION ONLY / DRAFT / RELEASE HOLD.
- Previous: Feature Addition v1656; Current: Feature Improvement v1658; Next: Feature Addition v1660 (provisional).
- Source: latest origin/main, AGENTS.md, README.md, English canonical and Korean plan, migration 196, Nest support controller/repository, /support, QA v1466, parent Draft #2489, issue #2488.
- [x] Read using-superpowers, brainstorming (planning-only), using-git-worktrees and verification-before-completion.
- [x] Confirm miniPC and latest GitHub PR/issue evidence; no runtime writes.
- [x] Specify per-thread enrollment baseline, epoch and cohort/flag race safety.
- [x] Specify reply dedupe after deletion and privacy-erasure boundary.
- [x] Update EN/KO canonical/integrated/log, mid-run main check, verify tests.
- [x] Push branch, update GitHub handoff, Draft PR, final CI and completion record.
- Safety: no merge, deployment, financial/DB mutation, or feature acceptance claims.

## IN PROGRESS checkpoint
- Source review: migration 196's support_messages idempotency key is deletable with the message; users FKs lack ON DELETE CASCADE; v1656's absent marker lacks a cohort enrollment baseline. These are source-derived risks, not confirmed incidents.
- Proposed owner/thread explicit enrollment, serialized baseline/epoch, reply tombstone shared with F675-217, retention/erasure FK gate and 4 P0 + 6 P1 handoff.
- QA v1466 FAILED/P0 verified. Main and parent planning branch re-fetched at midpoint, unchanged. Six EN/KO integrated docs edited; tests pending. No runtime/DB/Test/Production mutation.

## COMPLETION / GitHub
- Draft PR #2495 OPEN/HOLD stacked on Draft #2489; developer issue #2488 comment 6572446783.
- Local policy/security/backup 171/171 PASS, release classifier 24/24 PASS, repository security scan PASS, EN/KO 3 pairs ×14 shared +9 detailed markers PASS, git diff check PASS.
- Main/parent planning branch re-fetched and unchanged. QA v1466 FAILED/P0. Official Test exact-SHA, new-feature acceptance, independent restore, finance/security remain NOT RUN/BLOCKED.
- External independent references newly approved 0, cumulative UNKNOWN/10,000 BLOCKED/IN PROGRESS. No runtime/DB/WLD/ledger/Test/Production mutation. Remote final-SHA CI must be checked after this commit. RELEASE HOLD.
