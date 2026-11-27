# Combined backend candidate — v2026.11.26.1615.1

Status: **CODE_READY + sandbox-verified. Not on official Test, not on Production.** Official Test publication waits for the designated QA publisher and common lease (TESTGATE.1 G8); Production needs separate owner approval (G9). Independent review (G7) is pending.

## Identity
- Source: `perf/backend-capacity-20261126` @ `7f82c868c178941f744adc26a73e167d956a47fe` (stacked on the game-year branch; base main 1df1150e97).
- Artifact: `moneyverse-spring-backend-0.0.1-SNAPSHOT.jar` built with `./gradlew bootJar -PmoneyverseSourceSha=7f82c868c178941f744adc26a73e167d956a47fe`, sha256 `dcb51e6a24c10f6a8db06dff6c25787ce68fa9a076570471bedaeaeb44261fac`. `/api/version` on the sandbox answered 200 with `X-MV-Source-SHA: 7f82c868c178941f744adc26a73e167d956a47fe` (the running Production jar answers 503 because it was built without a source SHA).
- Migrations added by this candidate: 354 (prune indexes), 355 (blog announcement claim), 356 (owner-scoped credential reads), 357 (application-role privilege alignment), 358 (photos DML revoke). Depends on 350–353 (350–352 already applied where this deploys; 353 from the game-year branch).

## Included changes
OSIV off (pool deadlock fix), market tick room-only fan-out, Lavaplayer remote sources gated by bot token, prune indexes, local blog announcement route + hook candidate, sign-in/session/reauth/quote stream via functions (non-active accounts refused), photos via 098/297 functions with CSRF, hot-time/club-warfare source-truth gates, JVM/cgroup and inference drop-in candidates, DB timeout restore SQL candidate.

## Evidence on this exact artifact (isolated synthetic sandbox, chain-only grants + 354–358)
- Transfers 5 VUs 426 rps p99 44 ms; 50 VUs 359 rps p99 385 ms; 0 errors. Same-key races (30) → 1 transaction each. Sockets 50 → exact ticks. Ledger invariants 0/0/0 after 255,219 transactions. 0 permission-denied, 0 ERROR log lines. Spring 862/0/0; migration parity 6/6; fresh-cluster replay 002–357 clean (358 applied on the sandbox).
- Earlier runs on this branch: 10-minute combined soak, socket 50/200/500, read 5–100 VUs (see README).

## Zero-downtime rollout (for the designated publisher — Test first, then Production after approval)
1. Pre-checks: confirm applied checksums 002–353 match `production-checksums.json`/live; backup (existing timer) completed; record current jar path + sha256 and unit drop-ins for rollback.
2. Migrations 354, 355, 356, 358 (additive/function-only, safe with the old jar running: the old jar's direct reads keep working until the jar switch). 357 only after the new jar is serving and only with owner approval (it removes privileges the old jar may still use; objects owned by another role need a superuser step it reports as NOTICE).
3. Start the new jar on a spare port with the candidate drop-in (G1, Xmx512m, MemoryHigh/Max), wait for `/health` and `/api/version` = 7f82c868c178941f744adc26a73e167d956a47fe, smoke sign-in/session/wallet/transfer/socket on the spare port.
4. Switch the Nginx upstream (existing jar-swap procedure), reload, verify external routes; keep the old jar running until verification passes.
5. Install the blog hook candidate (`ops/blog-notify-v20261126`) after the new route answers; optional DB timeout restore (`sql/restore-db-timeouts-candidate.sql`) after confirming every background job finishes under 15 s on Test.
6. Post-switch: ledger invariants (`ledger-invariants.sql`, read-only), no 42501/ERROR spikes, socket ticks once per 2 s.

## Rollback
- Jar: switch the upstream back to the previous jar (kept running), reload Nginx.
- Migrations 354–356, 358: forward-only; the old jar does not need their objects. If 358 must be undone with the old jar: `GRANT INSERT, DELETE ON TABLE public.photos TO moneyverse_app`. If 357 was applied: re-grant the specific privileges it reports (none is part of the chain).
- Drop-ins: remove the file, `systemctl daemon-reload`, restart through the release procedure. Hook: restore the previous script.
