# Planning v1310 — F675-134 Security Activity Archive Integrity (Improvement)

**Status:** IN PROGRESS / DRAFT / RELEASE HOLD. Previous Feature Addition v1308 → Current Feature Improvement v1310 → Next Feature Addition v1312 provisional.

## Start — 2026-10-26 11:05 KST
- [x] Read installed Superpowers using-superpowers and applicable brainstorming, worktree, planning, verification skills (skills connector list empty).
- [x] Connect Debian 13.6 miniPC, verify services/DB, remote main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`, read main AGENTS/README/PROJECT_PLAN EN/KO and predecessor #1399; isolated sparse worktree from v1308, no runtime changes.
- [x] Inspect actual main migration 180/214, security controller/repository, Next page, reauthentication/CSRF guards; QA v1289, PR #1317, new B/C PRs.
- [ ] Update six integrated EN/KO planning docs, two EN/KO update logs and this worklog with source-backed P0/P1 backlog and exact release gates.
- [ ] Re-read main/plan midpoint and before final push; verify doc parity and no runtime diff.
- [ ] Push Draft PR, engineering handoff and capacity issue update; write internal start/mid/end records.

## Safety and evidence
- Existing global `ReauthGuard` checks **900 seconds**, while v1308 export design requires **<=600 seconds**; must use a dedicated, tested export reauth policy rather than silently relying on 15-minute guard.
- `account_recent_security_events` returns only `(event_type, created_at)`, cap 50; `auth_security_events` UUID and owner are available but local-email event coverage is incomplete. Next uses `apiOrNull`; new archive must preserve typed upstream errors.
- Root capacity improved to 94% / ~6.5GiB free after QA v1289, but cause/sustainability unknown; P0 remains. Main QA FAILED/HOLD, exact-SHA official Test and isolated restore unverified.
- External independent corpus target 10,000; newly accepted 0, deduplicated approved cumulative UNKNOWN, BLOCKED/IN PROGRESS.
- No modifications to shared DB, runtime, ledger/WLD, feature flags, Test/Production or other contributors' worktrees/branches.
