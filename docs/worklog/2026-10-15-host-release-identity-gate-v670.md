# Host release identity gate — v2026.10.15.670

## Before work — 2026-10-15 KST
- User approved proceeding with blocked Production promotion remediation. Work stream scope: implement a read-only, fail-closed Test/Production source-identity validation script, isolated from other contributors' financial, administrative, web and stock changes.
- Task branch: `fix/host-release-identity-gate-v2026.10.15.670` from latest inspected main `57b37a3899964d805219f98f355c70bf1e052c05`.
- Authorities reviewed: `AGENTS.md`, canonical project/integrated planning, release policy, `docs/RELEASING.md`, current runtime baseline, production deployment guide, existing immutable staging helper and regression tests.
- Current Test manifest/frontend release ID: `7fa3f245bbc3b308ae3e26ff3bfb0fbc70ba4642`; backend release ID and public API: `888311cc9240e8c5bb69ef51b92f8b738c6ad3be`. Current Production v600 lacks a manifest and reports `unknown`.
- Economy/DB blockers remain independent: application role DML over 237 public tables, 11 PUBLIC callable SECURITY DEFINER routines; P0 ledger and full authenticated Test QA unfinished.
- Do not touch active Nginx, systemd, Test/Production pointers, production DB, balances, sessions, or concurrent worktrees.

## In progress
- [ ] Write negative tests for release manifest / config / public version / process cwd mismatch and missing evidence.
- [ ] Implement pure validator and live read-only CLI for the documented Debian systemd host.
- [ ] Run isolated tests and fail-closed probe against current Test and record evidence.
- [ ] Re-fetch latest main, open PR, synchronize EN/KO worklog and internal/GitHub versioned updates.

## Finished
- Pending.
