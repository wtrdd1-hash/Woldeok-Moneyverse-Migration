# Release Guide

**English canonical** | [한국어](RELEASING.ko.md)

> Version: v2026.09.23.404
> Current runtime baseline: [CURRENT_RUNTIME_BASELINE.md](CURRENT_RUNTIME_BASELINE.md)

## Runtime contract

| Environment | Public origin | Current runtime | Backend / frontend |
|---|---|---|---|
| Production | `https://easy-scraping.com` | Debian 13 host systemd + Nginx | 3000 / 3001 |
| Isolated Test | `https://test.easy-scraping.com` | Debian 13 host systemd + Nginx | 3100 / 3101 |

Current Production data authority is PostgreSQL on the Debian host. The observed Production PostgreSQL runtime is Docker PostgreSQL 17.11.

Kubernetes/Flux is a recovery/target architecture, not current public-runtime proof. Docker Compose is also not the current Production deployment control plane.

## 1. Development branch gate

Runtime changes use a dedicated branch and must pass the applicable exact-HEAD checks before integration. Candidate evidence must bind to the exact source SHA that was tested.

Expected checks include, as applicable:
- lint/typecheck/build;
- unit/integration tests;
- PostgreSQL migrations and real-DB tests;
- API contract/schema checks;
- authorization/security negatives;
- idempotency/concurrency tests for economic mutations;
- committed-secret and supply-chain checks.

A skipped required DB/security/contract test is not a pass.

Documentation-only branches do not constitute application candidates and must not trigger a runtime release merely because repository `main` advances.

## 2. Isolated Test verification

The approved candidate is materialized in the Test release directories and run by:
- `test-main-backend.service`;
- `test-main-frontend.service`.

Before Production promotion verify:
1. public Test reports the intended application version;
2. backend readiness succeeds;
3. representative API and authoritative Test DB paths succeed;
4. changed user flows pass;
5. relevant authz/security negative tests pass;
6. server restart/update preserves a pre-existing signed-in session;
7. frontend cache/runtime write permissions are healthy;
8. Test remains non-indexable where required;
9. no new fatal/critical logs are introduced.

If Test does not serve the exact intended application candidate, promotion is BLOCKED.

### Host release identity preflight (v2026.10.15.670)

On the **active Debian host** and after a candidate is actually running in Test, run:

```bash
node scripts/release/verify-host-runtime-identity.mjs --channel test --sha <exact-40-char-candidate-SHA>
```

Since v717 the command derives the **active immutable Production systemd generation** from the release manifest (`moneyverse-release-vNNN-backend/frontend.service`) while Test uses `test-main-backend/frontend.service`; it does not check the stale v600 fallback services. It follows the selected service's **effective, ordered EnvironmentFiles**, compares the effective `BUILD_ID`, the built frontend `.next/BUILD_ID`, both actual live process working directories and the public version API. If protected `/etc/moneyverse/*-release.env` files are unreadable to an unprivileged shell, an authorized host operator may run the read-only preflight with `sudo -n node scripts/release/verify-host-runtime-identity.mjs --channel test --sha <exact-40-char-candidate-SHA>`. The tool prints no secret values. A missing value, different SHA, unreachable API or inactive process **blocks** promotion. It is read-only; do not edit a manifest or overwrite an environment ID merely to make this check pass. Correct the source/artifact and stage a new immutable generation instead.

Repeat with `--channel prod` and the same SHA **after** an authorized zero-downtime cutover. This identity preflight is only one gate: canonical ledger, DB privileges, migration parity, authenticated full-route QA, session continuity, backup/rollback and canary checks must independently pass before Production traffic changes.

## 3. Main integration and re-verification

After candidate approval, integrate the validated change to `main` without overwriting concurrent work. Re-read current planning and re-resolve the application source identity.

If `main` changed during the work, rebase/reconcile and rerun the required exact-main checks. A prior branch SHA is not proof for a different merged SHA.

## 4. Production preparation

Production uses immutable/reviewable release directories under `/srv/moneyverse-data/releases` with stable external environment/secret files. Keep secrets and database credentials outside application release directories.

The current service pointers are:
- `/srv/moneyverse-data/releases/production-current/backend`;
- `/srv/moneyverse-data/releases/production-current/frontend`.

Prepare only the mutable frontend runtime cache subtree required by Next.js. Do not recursively mutate ownership of an immutable release and do not clear member sessions as a cache strategy.

## 5. Zero-downtime promotion

Promotion must preserve service continuity and login continuity.

Required sequence:
1. retain the last-known-good generation;
2. start/prepare the replacement generation or approved canary path;
3. verify readiness and version identity;
4. verify a session created before restart/cutover remains authenticated;
5. switch traffic using the approved Nginx/systemd release mechanism;
6. perform public smoke and changed-flow checks;
7. retain rollback capability through the observation window.

Do not intentionally stop the only healthy Production process before the replacement is ready.

## 6. Production acceptance

Production is accepted only after all relevant evidence agrees:
- application source/release identity;
- backend/frontend readiness;
- public version freshness;
- authoritative Production DB connection and migration state;
- changed-flow smoke;
- session continuity;
- no new critical/fatal errors;
- required ledger/economy reconciliation;
- backup/recovery gate when data/schema risk applies.

Minimum public checks normally include `/`, `/status`, version/health endpoints, and applicable `robots.txt`, `sitemap.xml`, `ads.txt`.

## 7. Data and migration gate

Migrations are forward-only, numbered, immutable and checksummed.

A destructive or schema-changing release is blocked unless the required backup/restore evidence is current. Never delete Production databases, ledger rows, audit data, sessions or volumes to make an application release succeed.

The Production DB must be identified from actual application/service connection evidence, not only a Docker container name.

## 8. Rollback

Rollback targets the last verified application generation compatible with the current DB, configuration and session contract.

Application/config failure: switch code/runtime pointers back and repeat readiness/version/session/smoke checks.

Data/schema failure: prefer a corrective forward migration. Restore only through the verified recovery process with explicit backup identity, checksums, source/target identity and operator record.

## 9. Kubernetes/Flux status

GitOps/Kubernetes records may continue to be maintained for provenance and recovery/target architecture. They do not prove current public deployment while Debian systemd/Nginx is serving the public origins.

A future cutover to Kubernetes/Flux requires an explicit migration plan and same-workstream updates to:
- `CURRENT_RUNTIME_BASELINE.md`;
- `INFRASTRUCTURE.md`;
- `architecture/deployment-flow.md`;
- this release guide;
- current planning authority.

## References

- [Current runtime baseline](CURRENT_RUNTIME_BASELINE.md)
- [Infrastructure](INFRASTRUCTURE.md)
- [Deployment flow](architecture/deployment-flow.md)
- [Production deployment](operations/production-deployment.md)
- [Backup and recovery](operations/backup-and-recovery.md)
- [Project plan](planning/PROJECT_PLAN.md)

### Financial ledger and DB least-privilege hard stop — v737

Before any money/economy/treasury-affecting Production cutover, perform the *read-only* gate on the **actual backend service DB** (not only the name of a container):

`sudo -n node scripts/release/verify-financial-readiness.mjs --env-file /home/debian/Woldeok-Moneyverse-Migration/backend/.env`

Nonzero exit/`BLOCKED` forbids promotion. 2026-10-16 v717 report shows 5 directly app-writable core financial tables and 19 uncertified ledger/account opening differences. No undocumented waiver, synthetic balancing journal or silent DB corrections. Even a green report is only a narrow prerequisite; certify opening balances, supply/vault, Test parity, v530 authenticated UI and rollback separately. The approved runtime environment file must be confirmed by inspecting current systemd `EnvironmentFiles` before running. [Evidence](worklog/2026-10-16-financial-readiness-v737.md).
