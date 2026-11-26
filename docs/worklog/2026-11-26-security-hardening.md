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

## Resume v2026.11.26.1225.1 (after owner-ordered capacity cleanup)
- Start 12:15 KST; main 1df1150e97 unchanged; PR #3456 head 12c4b9669d re-verified, base #3447 (8a48975a00). The one failing CI check (`runtime-check`, a content-publication DB integration test) fails identically on the base branch, so it predates this candidate; it belongs to the backend stabilisation step.
- In progress: edge allowlist review. The main API chain is still permit-all with authorization in filters/controllers (deny-by-default chain remains open work, needs a route inventory). Two defence-in-depth fixes made now: the API description/Swagger UI is off unless explicitly enabled, and Production credentialed CORS no longer includes developer origins.
- Network restriction (approved action 4): host firewall already drops the Spring and socket ports on non-loopback interfaces and the database port on the LAN interface; binding to loopback stays an optional extra.
- Verification: new tests red first, then green; Spring 853 tests / 0 failures / 0 skipped. DB integration task not run locally (CI only).
- Not yet: G7 re-review of the new SHA, SAST/SCA rerun, G8 publication (no designated publisher/common lease verified), Production (separate owner approval).
