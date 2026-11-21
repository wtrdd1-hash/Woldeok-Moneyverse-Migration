# Release Guide

**English canonical** | [한국어](RELEASING.ko.md)

> Version: v2026.09.23.404
> Current runtime baseline: [CURRENT_RUNTIME_BASELINE.md](CURRENT_RUNTIME_BASELINE.md)

## Runtime contract

| Environment | Public origin | Current runtime | Backend / frontend |
|---|---|---|---|
| Production | `https://easy-scraping.com` | Debian 13 host systemd + Nginx | 4164 / 4165 (v1550) |
| Isolated Test | `https://test.easy-scraping.com` | Debian 13 host systemd + Nginx | 3100 / 3101 |

**2026-10-31 v1550 verified Production:** PR #2165 merged main SHA bc8cd8a6c654af0336f550643f23049a58ee1d16. Persistent release backend:4164/frontend:4165 serves Production through Nginx and immutable production-current. The prior stable 3564/3565 units are pinned to the old immutable root for rollback/background work. Exact-SHA Test and Production identity preflights passed ok:true. Treasury 552 historically unlinked entries stay safely blocked HTTP 503. [Worklog](worklog/2026-10-31-swf-operational-promotion-v1550.md).

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

The command validates the exact active Production systemd process directory against the immutable manifest release root, requiring **exactly one** match among the manifest's `moneyverse-release-vNNN-backend/frontend.service` generation and the active `moneyverse-live-prod-backend/frontend.service` pair (v1534); Test still uses `test-main-backend/frontend.service`; it does not check the stale v600 fallback services. It follows the selected service's **effective, ordered EnvironmentFiles**, compares the effective `BUILD_ID`, the built frontend `.next/BUILD_ID`, both actual live process working directories and the public version API. If protected `/etc/moneyverse/*-release.env` files are unreadable to an unprivileged shell, an authorized host operator may run the read-only preflight with `sudo -n node scripts/release/verify-host-runtime-identity.mjs --channel test --sha <exact-40-char-candidate-SHA>`. The tool prints no secret values. A missing value, different SHA, unreachable API or inactive process **blocks** promotion. It is read-only; do not edit a manifest or overwrite an environment ID merely to make this check pass. Correct the source/artifact and stage a new immutable generation instead.

**P0 process-generation freshness (2026-10-31):** The host preflight now also requires each active systemd service to have started no earlier than its effective environment files and immutable release manifest; the frontend must also postdate the built `.next/BUILD_ID`. It rechecks MainPID while sampling to reject mixed service generations. This is a read-only stale-generation check, **not** cryptographic proof of the running JavaScript code or live process BUILD_ID; retain independent executable/rollback provenance and exact-SHA Test requirements. An updated environment file without a service restart must not be accepted as evidence of a new running build.

**P0 edge-attestation addition (2026-10-30):** The preflight also probes public `/frontend-version` independently of backend `/api/version` and requires the public frontend build ID to equal the exact source SHA. Until a separately certified Treasury disclosure exists, public `/api/treasury/overview` must return HTTP 503, `Cache-Control: private, no-store`, `ok:false`, `PUBLIC_TREASURY_RECONCILIATION_PENDING`, unverified balances and an empty ledger. Any synthetic 200, stale frontend ID, missing evidence or network failure blocks release. These public-edge probes do **not** certify every direct frontend origin or the authoritative database; inspect active origins and the Nginx routing separately before approval. QA v1376 issue #1917 demonstrates Test synthetic 200 and a timestamp-only Production frontend ID; never weaken the gate to clear these findings.

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

### v2026.10.29.1212 — Owner acceptance of existing financial DML (narrow exception)

The owner explicitly accepts existing moneyverse_app DML on accounts, account_balances and system_treasury_vaults. Do not revoke these rights or repeatedly halt work solely because of these three operator-approved privileges. The original read-only financial readiness report continues to identify their risk; classify precisely these existing findings as OPERATOR_ACCEPTED_EXISTING_DML rather than falsely labeling all checks green. No other grants or ledger/security failures are waived.

The unrelated database migration checksum/provenance, DB balance correctness, authenticated session continuity, isolated exact-source Test acceptance, backup restoration and zero-downtime cutover gates still apply. As observed for v1212, the Production restore clone accepted 23 missing SQL migrations and preserved the approved privileges, but 5 earlier migration checksums remain unmatched. The Production release has NOT been activated. See updates/v2026.10.29.1212-internal.md.

### v2026.10.31.1538 — No in-place Production manifest relabel
For Production identity, require the resolved active release directory basename to begin with `prod-${manifest.version}-`. The manifest may not be rewritten into a previous release directory to simulate a newer deployment, even if BUILD_ID variables are changed. A release requires a new immutable directory and exact-SHA backend+frontend attestation; unchanged Test rules. The current v0950-folder/v1336-manifest host state is BLOCKED.

### v2026.10.31.1536 — Narrow approval for pre-existing financial DML
The operator's v2026.10.29.1212 acceptance applies only to **existing** full INSERT/UPDATE/DELETE privileges on `accounts`, `account_balances`, `system_treasury_vaults` with actual database `woldeok_moneyverse_dev` and role `moneyverse_app`. The read-only preflight reports explicit `OPERATOR_ACCEPTED_EXISTING_DML` warnings, not silently clean permission flags. Changed or partial privilege shape, different DB/role, new ledger posting/transaction DML and journal imbalance remain BLOCKED. `READY_FOR_OTHER_RELEASE_GATES` means only this narrow projection/grants check passed; Treasury provenance, opening balances, funded settlements, exact authenticated Test, session continuity and Production promotion still require independent evidence. Never grant more rights to force this status.


### 2026-11-20 — database-free public presentation lane

The owner requested the implemented public frontend before the deferred backend repairs. This lane serves only the reviewed home/tool hubs/two calculators through `-Dmoneyverse.runtime-mode=presentation`. Explicit component imports exclude database, sessions, economic APIs, schedulers, sockets and bots. Retain existing API/auth/member/admin routes; expanding into those surfaces requires their independent gates above.

Use the exact tested main native CI artifact, validate its manifest/JAR digest and fixed packaged source, stage new immutable Test/Production generations, and verify the actual systemd process directory/open JAR inode/generation freshness. The dedicated frontend must remain loopback-bound, stateless, credential-free and boot-enabled with restart protection. Verify real browser rendering against existing API contracts, not only HTML200 or a source header. The Next pair preflight is not evidence for a native-only process; retain its applicable source/freshness/Test/noindex/rollback requirements through scoped native artifact/process evidence.

Production source attestation uses `/frontend-version?scope=public-presentation`. Preserve the unscoped legacy Referer/204/build-ID behavior: retained Next clients poll it and would otherwise refresh into a false stale-release warning. Version-isolate changed shared assets so old/unknown versions retain their old origin. Validate the full Nginx assembly, compare-and-swap current configuration, gracefully reload, check exact scoped source/pages/assets/API privacy and keep rollback. Preserve unrelated concurrent hardening when preparing inverse routing; never restore a stale whole configuration blindly.

This lane does not certify full application/backend release, financial reconciliation, migration provenance, authenticated member actions or admin operations. See the [observed scoped release](releases/2026-11-20-native-presentation-production.ko.md) and [current baseline](CURRENT_RUNTIME_BASELINE.md).

### 2026-11-21 — native public header follow-up and genuine Test privacy
Use the exact-main CI native artifact and live open-JAR/process evidence for the public presentation lane. The observed first rollout covers only the five existing public pages and index alias. Preserve legacy/unknown asset versions, unscoped version semantics, private/admin/API traffic and current signup/actuator restrictions. Layout PASS is not authenticated action acceptance; the tool-account header gap stays OPEN.

An HTTP-client403 can be a client-specific edge response rather than an access boundary. Verify actual external browser denial on both Test HTML and new assets. The protected Test origin now allows direct loopback operators and rejects Cloudflare-origin indicators so a local tunnel cannot turn an external request into trusted loopback. Confirm direct Test200/exactsource and external403 independently; retain noindex/no-store. Never record credentials or private responses.

Separate trusted-operator management responses from external denial checks: the retained operator actuatorenv404 was not a new failure. The first attempt safely rolled back on this mistaken expectation; the final switch retained the measured baseline and was externally verified. Public inverse routing must retain newer Test protection and unrelated hardening. [Receipt](releases/2026-11-21-favicon-public-production.ko.md).

### 2026-11-21 — narrowly authenticated admin read presentation

The owner-approved first admin slice uses explicit admin-presentation imports, no database/session creation/jobs, and GET-only fixed loopback sources. Verify actual administrator cookies through the retained role authority at both edge and renderer; no actor/internal/bearer forwarding, redirects, fake counts or successful empty responses on source failure. Stage the exact-main CI artifact on isolated loopback Test and Production generations and verify open JAR/process/source identity before switching only reviewed admin HTML/assets. Protected same-origin preview is the Test lane; Production must ignore its selector and remain healthy while that Test process is stopped. Retain external Test denial and previous API/auth/financial boundaries.

Coordinate existing release locks, revalidate all relevant live configuration hashes after probes and immediately before each replacement, verify backup bytes, syntax-check the full assembly, reload gracefully and verify authenticated changed flows/session continuity. Roll back only owned unchanged snippets; never restore an old whole config. Six exact public asset digests still depend on pinned public93a3 runtime4792; preserve it and4782, and verify all six bytes with an atomic route update before replacing that dependency. Successful assets may be immutable; 403/405/upstream failures must not receive immutable caching.

This lane certifies only dashboard/system-log read UI. One legacy FRONTEND journal source is unavailable (removed1546 unit). Source-level controller/log-metadata fixes are not proof that the retained full backend executable was replaced. Other admin actions and financial/DB/provenance gates remain OPEN. See [scoped acceptance and rollback](releases/2026-11-21-admin-read-ui-production.ko.md).
