# Planning v1206 — Accessibility Preference Hardening

- Cycle: Previous Feature Addition v1204; Current Feature Improvement v1206; Next Feature Addition v1208 (provisional).
- Scope: F675-108 contract hardening, docs only. Branch stacked on v1204; no A/B/C/Gemini/QA branch edits, no runtime/DB/Test/Production changes.
- Source of truth: latest origin/main AGENTS.md, README.md, English docs/planning/PROJECT_PLAN.md; compare Korean counterpart. Prior v1204 is an unmerged stacked planning proposal, not current main.
- [x] START 2026-10-24 07:03 KST — MiniPC Debian 13.6 healthy; main 54d5140ddb49dd3e2193a2f82b71a6a0a57cfede; QA v1209 FAILED/HOLD. Installed Superpowers skills read because connector list empty.
- [x] Investigate source: account nav missing a11y, next-themes owns theme, point prepaint is independent, OS motion CSS already exists; no server-side accessibility preference API or DB migration verified.
- [x] Isolated branch created from v1204 planning; no financial mutation.
- [ ] MID — recheck main/QA and canonical docs; update precise API/DB/UX/security contracts in EN/KO integrated plans and living plans.
- [ ] Verify all six official documents, worklog, diff, branch ancestry; push isolated branch and create Draft PR, update issue #1071.
- [ ] END — record evidence, limitations, release HOLD, 10,000 independent-reference gate truth.

Current known blockers: shared Production/development DB (#1053), wildcard 5433 (#1060), app-role DML and PUBLIC bank EXECUTE (#993), migration 266 mismatch, full pnpm audit (#1075), bot npm audit (#1077), route-ledger E2E evidence (#1078), Test exact-SHA and restore unverified. QA v1209 candidate passing local tests does not unblock these.
