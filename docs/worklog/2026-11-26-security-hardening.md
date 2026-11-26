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
- Checkpoint v2026.11.26.1245.1 (owner approved continuing): admin socket room members are now re-verified every 15 s; a revoked session, removed role, or a verification that cannot complete leaves the room (fail closed). Closes the accepted G7 follow-up. Spring 855 tests / 0 failures / 0 skipped.
- SCA: workspace `pnpm audit --prod` and bot `npm audit --omit=dev` report 0 known vulnerabilities; Java runtime classpath on current patch lines (Boot 3.5.16, Security 6.5.11, Tomcat 10.1.62, Netty 4.1.141, Jackson 2.21.9) — no local Java SCA scanner, OSV review of 2026-11-25 still the latest Java evidence.
- Checkpoint v2026.11.26.1300.1 (deny-by-default, unit 1 — identity): inventory of all 819 controller routes; 155 handler/route pairs read a caller identity header, 110 inside the member/admin boundary filters, 45 outside. All live handlers outside ignore the header (session only); the mint and central-bank writes took it as the actor and were safe only because their services are unavailable (latent). New filter hides caller identity headers everywhere the member boundary has not substituted the verified actor; the boundary's 403 on a forged header is kept. No legitimate sender of these headers exists in the repository (frontend, legacy gateway, bot, Spring static pages). Spring 858 tests / 0 failures / 0 skipped.
- Remaining deny-by-default units: route-level allowlist for the main chain (public reads vs member vs admin), CSRF coverage for writes outside the member list.
- Checkpoint v2026.11.26.1320.1 (deny-by-default, unit 2 — write boundary ratchet): 213 write routes sit outside both boundary filters. Static classification: 95 verify session + CSRF, 46 are unavailable (503), 3 are signature-verified, 42 check the session without CSRF, 32 need a manual read. Enforcing CSRF on the 42 requires Test verification of each caller (the server-side client sends the token per call), so it is deferred to the backend step. A ratchet test freezes the current set: any new write route outside the boundary fails CI until moved behind the filter or deliberately listed (mutation-checked). Two handlers return success without writing anything; recorded for the backend step. Spring 859 / 0 / 0.
