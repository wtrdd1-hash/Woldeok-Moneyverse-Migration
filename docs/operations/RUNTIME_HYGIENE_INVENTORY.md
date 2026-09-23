# Runtime Hygiene Inventory

**English canonical** | [한국어](RUNTIME_HYGIENE_INVENTORY.ko.md)

> Version: v2026.09.23.405
> Observed: 2026-09-23
> Host baseline: [../CURRENT_RUNTIME_BASELINE.md](../CURRENT_RUNTIME_BASELINE.md)

## Protected current runtime

| Resource | Classification | Evidence |
|---|---|---|
| `woldeok-moneyverse-dev-db-1` | **PROTECTED CURRENT / Production DB runtime** | Production backend environment points to `127.0.0.1:5433/woldeok_moneyverse_dev`; active backend TCP connections observed |
| `moneyverse-test-db` | **PROTECTED CURRENT / Test DB runtime** | Test backend environment points to `127.0.0.1:5585/woldeok_moneyverse_ci`; active Test backend connections observed |
| `moneyverse-backend.service` | **PROTECTED CURRENT** | active systemd Production backend |
| `moneyverse-frontend.service` | **PROTECTED CURRENT** | active systemd Production frontend |
| `test-main-backend.service` | **PROTECTED CURRENT** | active isolated Test backend |
| `test-main-frontend.service` | **PROTECTED CURRENT** | active isolated Test frontend |

Container names alone are not authority. The service connection and runtime evidence above are the protection basis.

## Safe cleanup completed

The following container objects were removed after all of these conditions were met: no repository/systemd/config reference was found; they were never started or already exited; and they were not the Production/Test DB runtime.

- `mv-b280-pg` — state `Created`
- `mv-ci315` — state `Created`
- `mv-ci315b` — state `Created`
- `wdmv-v127-fulltest-db` — exited; original mounted worktree no longer exists

**Data volumes were deliberately preserved.** This cleanup removed only stale container objects, not their Docker volumes.

## Remaining QA/recovery database containers

Do not delete these solely by age or name. They require owner/workstream and data-value confirmation:

- `wdmv-v129r3-qa-db-1` — exited; recovery worktree still exists
- `wdmv-v182-db`
- `wdmv-v184-pg`
- `wdmv-v214-pg`
- `wdmv-v234-db`
- `moneyverse-v259-pg`
- `mv-ci-273`
- `wdmv-v273-db`
- `moneyverse-qa-v300`
- `mv-ci315c`
- `mv-b316-pg`
- `mv-b318-pg`
- `mv-b390-pg`

No established TCP client connections were observed on the listed QA host-mapped ports during this snapshot, but absence of a connection at one moment is not sufficient deletion proof.

## Bind exposure review

Observed Docker host bindings include:
- Production PostgreSQL `5433` on `0.0.0.0` / IPv6 wildcard;
- QA PostgreSQL ports `55432`, `55433`, `55555`, `56555` on wildcard addresses.

This observation means the processes are listening on host-wide interfaces. It does **not** by itself prove Internet reachability because firewall/network policy was not independently verified in this review.

Required follow-up:
1. confirm intended reachability for Production DB and each QA database;
2. prefer localhost-only binding when remote DB access is not required;
3. if remote access is required, document source allowlist/VPN/firewall policy;
4. do not change Production `5433` until backend continuity, backup and rollback are proven;
5. stop/recreate QA containers with localhost-only bindings only after owner/workstream confirmation.

## Cleanup decision rule

A QA container may be removed only when:
- it is not referenced by current systemd/config/CI/worktree;
- owner/workstream is closed or explicitly migrated;
- no active client uses it;
- data retention/rollback need is resolved;
- volume retention/deletion is a separate explicit decision.

Container removal and volume deletion are separate operations. Never use `docker system prune --volumes` as a general cleanup shortcut on this host.
