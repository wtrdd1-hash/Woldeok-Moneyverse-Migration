# Security hardening (PR #3454 recheck) — v2026.11.26.SEC.1

Branch security/app-hardening-20261126, stacked on the verified production head of #3447 (8a48975a00). main 1df1150e97.
Worker: Claude Code (Claude Opus 5.5, claude-opus-5-5). State: CODE_READY, local CI green; G6-G8 HOLD; G7 pending.
Detailed findings and reproduction evidence are kept in the internal MiniPC record (TESTGATE.1: sensitive records stay internal).

- Start 2026-11-26T09:15 KST; checkpoint 07ea61d403.
- Skills: security-review, springboot-security, spring-security-admin-auth, spring-gradle-dependency-quality.
- Scope: removal of committed credential-shaped defaults; real-time admin channel authorization; legacy chat channel restrictions; removal of latent header-based admin bypasses; encryption key-material handling (no data change).
- Owner decisions required (BLOCKED here): credential rotation; encryption key rotation with re-encryption; network bind/firewall policy.
- Verification: Spring 851 tests / 0 failures; frontend 621 files / 3,238 tests, typecheck clean; new regression tests added.
- Not yet: SAST/SCA rerun on the exact SHA, official Test publication by the automated QA deployer (G8), independent review (G7).
