# Host release identity gate — v2026.10.15.670

## Before work — 2026-10-15 KST
- User approved proceeding with blocked Production promotion remediation. Work stream scope: implement a read-only, fail-closed Test/Production source-identity validation script, isolated from other contributors' financial, administrative, web and stock changes.
- Task branch: `fix/host-release-identity-gate-v2026.10.15.670` from latest inspected main `57b37a3899964d805219f98f355c70bf1e052c05`.
- Authorities reviewed: `AGENTS.md`, canonical project/integrated planning, release policy, `docs/RELEASING.md`, current runtime baseline, production deployment guide, existing immutable staging helper and regression tests.
- Current Test manifest/frontend release ID: `7fa3f245bbc3b308ae3e26ff3bfb0fbc70ba4642`; backend release ID and public API: `888311cc9240e8c5bb69ef51b92f8b738c6ad3be`. Current Production v600 lacks a manifest and reports `unknown`.
- Economy/DB blockers remain independent: application role DML over 237 public tables, 11 PUBLIC callable SECURITY DEFINER routines; P0 ledger and full authenticated Test QA unfinished.
- Do not touch active Nginx, systemd, Test/Production pointers, production DB, balances, sessions, or concurrent worktrees.

## In progress
- [x] Added eight focused regression tests on manifest, environment, build, public API and live process cwd identity.
- [x] Implemented a read-only fail-closed CLI with explicit Test/Production service and HTTPS endpoint mapping.
- [x] Fixed one malformed quoted BUILD_ID fixture. Exact branch suite rerun on the Debian host: **8 pass, 0 fail**.
- [x] Ran the CLI read-only against current Test with expected SHA `7fa3f245bbc3b308ae3e26ff3bfb0fbc70ba4642`. It exited **1** as required: `backend_env_sha_mismatch`, `public_version_sha_mismatch`. Backend/public report `888311cc9240e8c5bb69ef51b92f8b738c6ad3be`. Frontend env and build and manifest all match the expected v618 source.
- [x] Added EN/KO release runbook, release notes, changelog, internal/GitHub records and index. Draft PR #853 opened.
- [x] Final exact-head GitHub CI classification and policy passed; runtime checks intentionally skipped for control-plane-only change. Refetched latest main (unchanged at `57b37a3899964d805219f98f355c70bf1e052c05`) before merging PR #853.

## Finished (scope-limited)
- Host identity protection and negative Test evidence are implemented. PR #853 merged to main at `ae7da3992fddc8cccb9e5437268f509fe47b808d`. No Test or Production switch made.
- **Production remains blocked**: existing Test source mismatch, real DB least-privilege/ledger, authenticated full-route five-pass QA, session/rollback and zero-downtime backend acceptance require independent verification.
- No application DB, member balances, services or concurrent worktrees modified.
