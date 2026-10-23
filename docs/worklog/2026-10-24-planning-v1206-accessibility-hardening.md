# Planning v1206 — Accessibility Preference Hardening

- Cycle: Previous Feature Addition v1204; Current Feature Improvement v1206; Next Feature Addition v1208 (provisional).
- Scope: F675-108 contract hardening, docs only. Branch stacked on v1204; no A/B/C/Gemini/QA branch edits, no runtime/DB/Test/Production changes.
- Source of truth: latest origin/main AGENTS.md, README.md, English docs/planning/PROJECT_PLAN.md; compare Korean counterpart. Prior v1204 is an unmerged stacked planning proposal, not current main.
- [x] START 2026-10-24 07:03 KST — MiniPC Debian 13.6 healthy; main 54d5140ddb49dd3e2193a2f82b71a6a0a57cfede; QA v1209 FAILED/HOLD. Installed Superpowers skills read because connector list empty.
- [x] Investigate source: account nav missing a11y, next-themes owns theme, point prepaint is independent, OS motion CSS already exists; no server-side accessibility preference API or DB migration verified.
- [x] Isolated branch created from v1204 planning; no financial mutation.
- [x] MID 2026-10-24 07:05 KST — main/QA and canonical EN/KO SHA256 rechecked; detailed API/DB/UX/security/rollout contract added to existing integrated EN/KO masters and living plans.
- [x] Verified 2026-10-24 07:08 KST — all 10 v1206 backlog IDs in six official documents; EN/KO API/If-Match/Idempotency-Key/tombstone/Android/320px/100-way parity; git diff --check PASS; main SHA unchanged.
- [x] END 2026-10-24 07:10 KST — Draft PR #1082 opened stacked on v1204 #1072; GitHub development issue #1071 updated (comment 6375726341). Six official docs + this worklog; all 10 IDs checked in EN/KO; git diff --check PASS. Latest QA v1209 FAILED/HOLD; 10,000 evidence gate 0 newly approved, cumulative UNKNOWN/BLOCKED. No runtime/DB/WLD/Test/Production changes.
- [ ] Final remote-head and clean-worktree verification after this worklog commit (record in miniPC END log).

Current known blockers: shared Production/development DB (#1053), wildcard 5433 (#1060), app-role DML and PUBLIC bank EXECUTE (#993), migration 266 mismatch, full pnpm audit (#1075), bot npm audit (#1077), route-ledger E2E evidence (#1078), Test exact-SHA and restore unverified. QA v1209 candidate passing local tests does not unblock these.
