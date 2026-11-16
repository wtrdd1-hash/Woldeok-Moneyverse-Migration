# v2026.11.16.1 — Spring migration/security audit and QA-only authorization (EN)
- Start: 2026-11-16 17:12 KST; canonical integrated planning master (EN/KO), AGENTS.md and implementation_plan.md v50 reviewed.
- Baseline: main/origin/main 205c50d1c5511891be8b971b38786cd5f967c4a0. Separate QA branch to avoid concurrent agent collisions.
- Owner authorization: GitHub recording and restoration of the scheduled QA service ONLY. No authorization for Spring security fixes, credentials rotation, production backend changes, or production promotion.
- Documented transition: 89 Java Spring controllers, 89/89 inventory parity claim only; runtime Spring 4550 and internal Nginx 4400 fallback verified, old Node service still active; full functional parity and overall completion NOT certified.
- Documented security risks (read only): Spring Security anyRequest().permitAll(), CSRF disabled, permissive credentialed CORS, plaintext systemd application credentials and token, binds on all interfaces, missing service confinement. Do not reproduce credential values. HTTPS headers observed at localhost edge; this does not certify end-to-end safety.
- QA incident: moneyverse-qa.service failed 2026-11-16 17:01:58 KST, scheduled smoke 25 pass / 1 failure, route /tools/compound-calculator HTTP 000. Subsequent GET checks returned 200 three times (about 4-6 seconds each). The scheduled job is a public HTTP smoke test, NOT a full functional/security QA.
- Fix boundary: bounded retry only for transport/no-response HTTP 000, with honest final status for persistent failures; preserve no retry of non-000 HTTP status. Immutable QA scheduler release and QA-only service drop-in; keep backend, nginx, database, application and security configuration untouched.
- Intermediate and final QA evidence, exact SHA, release validation and rollback details to be appended after verification.

## Midpoint and final verification — 2026-11-16 17:22 KST
- Before applying: branch fix/qa-smoke-transient-20261116-v2026.11.16.1; origin/main confirmed 205c50d1c5; source lint via bash -n and git diff --check passed.
- QA-only immutable release: /srv/moneyverse-data/qa-scheduler-releases/v2026.11.16.1 copied from v1627, replacing only scripts/qa/moneyverse-hourly-qa.sh.
- Active drop-in: /etc/systemd/system/moneyverse-qa.service.d/60-v2026.11.16.1-transport-retry.conf; earlier drop-ins and timer retained.
- Manual run of moneyverse-qa.service: SUCCESS (Result=success, ExecMainStatus=0), 26/26 public HTTP smoke routes passed, zero failures, session count 266. The /tools route needed one transport-only retry. Full authenticated functional QA remains NOT TESTED. A subsequent scheduled run has not yet been observed.
- Rollback: remove ONLY 60-v2026.11.16.1-transport-retry.conf then systemctl daemon-reload; previous v1627 immutable artifact and 50-v1627 drop-in remain available. Do not reset service state or rotate credentials as part of this QA-only change.
- No application backend, database, nginx, frontend, production artifact or security policy modification.
