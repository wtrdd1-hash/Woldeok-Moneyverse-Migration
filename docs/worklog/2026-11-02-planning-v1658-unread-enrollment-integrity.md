# Planning v1658 — F675-220 unread enrollment and replay integrity

- Status: IN PROGRESS / DOCUMENTATION ONLY / DRAFT / RELEASE HOLD.
- Previous: Feature Addition v1656; Current: Feature Improvement v1658; Next: Feature Addition v1660 (provisional).
- Source: latest origin/main, AGENTS.md, README.md, English canonical and Korean plan, migration 196, Nest support controller/repository, /support, QA v1466, parent Draft #2489, issue #2488.
- [x] Read using-superpowers, brainstorming (planning-only), using-git-worktrees and verification-before-completion.
- [x] Confirm miniPC and latest GitHub PR/issue evidence; no runtime writes.
- [x] Specify per-thread enrollment baseline, epoch and cohort/flag race safety.
- [ ] Specify reply dedupe after deletion and privacy-erasure boundary.
- [ ] Update EN/KO canonical/integrated/log, mid-run main check, verify tests.
- [ ] Push branch, update GitHub handoff, Draft PR, final CI and completion record.
- Safety: no merge, deployment, financial/DB mutation, or feature acceptance claims.

## IN PROGRESS checkpoint
- Source review: migration 196's support_messages idempotency key is deletable with the message; users FKs lack ON DELETE CASCADE; v1656's absent marker lacks a cohort enrollment baseline. These are source-derived risks, not confirmed incidents.
- Proposed owner/thread explicit enrollment, serialized baseline/epoch, reply tombstone shared with F675-217, retention/erasure FK gate and 4 P0 + 6 P1 handoff.
- QA v1466 FAILED/P0 verified. Main and parent planning branch re-fetched at midpoint, unchanged. Six EN/KO integrated docs edited; tests pending. No runtime/DB/Test/Production mutation.
