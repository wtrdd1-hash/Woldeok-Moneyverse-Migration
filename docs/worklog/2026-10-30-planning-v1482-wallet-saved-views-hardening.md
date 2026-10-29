# Planning v1482 — Wallet Saved Views Hardening (2026-10-30)

**Status:** DRAFT / RELEASE HOLD; **Cycle:** Previous Feature Addition v1480 → Current Feature Improvement v1482 → Next Feature Addition v1484 (provisional).

**Start 01:05 KST:** MiniPC Debian 13.6 active; `skills__list` returned empty, installed Superpowers using-superpowers, brainstorming, writing-plans, using-git-worktrees and verification-before-completion read directly. New isolated worktree based on unmerged v1480 PR #1916; main `62c6cd038951d65c94b709302bdaec6e75b080b6`. Read AGENTS, README, EN canonical and KO project plans, integrated masters, real wallet controller/service/repository/frontend/cursor, GitHub PR/issue inventory, QA v1376 FAILED/P0 and C v1172 local-only evidence. Internal start record in miniPC `planning-v1482-records/start.log`.

**Source-backed corrections:** existing recent-history SQL has direction HAVING, paged history lacks it; v1 cursor 60m and JS Date milliseconds; page trusts unvalidated generic HTTP 200. New design adds monotonic owner-set ETag/ABA fencing, receipt-first idempotency, purpose-separated 15m v2 microsecond cursor, runtime response validation and fail-closed error handling. P0 #1917 Test public Treasury synthetic 200 and frontend/edge SHA attestation is a release blocker. No claim of actual financial movement.

**Backlog:** P0 REPO1482-01 SEC1482-02 FIN1482-03 REL1482-04; P1 VIEW1482-05 VIEW1482-06 VIEW1482-07 VIEW1482-08 VIEW1482-09 VIEW1482-10. Test 10,001 synthetic/100 forged/100 races/50 retries/30 boundaries/100 malformed responses **PROPOSED, NOT EXECUTED**. External independent approved new 0, cumulative UNKNOWN/10,000; BLOCKED/IN PROGRESS.

**Safety:** Docs-only; no runtime/SQL/DB/WLD/Test/Production/feature-switch changes. Existing C/A/B/QA/Gemini branches preserved. Draft PR and final GitHub/CI status to be appended only after verified.

**Read-only DEV and app-api check 01:08 KST:** PG 17.11 proposed tables absent; support_threads app UPDATE/TRUNCATE still allowed. app-gateway wallet route permitted, but If-Match/Idempotency-Key not forwarded; Android mutation parity requires a separate reviewed header allowlist and negative tests.
